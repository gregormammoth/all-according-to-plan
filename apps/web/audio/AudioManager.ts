import { Howl, Howler } from 'howler';
import { activeAmbienceIds, computeAmbienceTargets, computeLayerTargets } from './atmosphere';
import { ProceduralAudioEngine } from './proceduralSfx';
import { AMBIENCE_LOOP_IDS, MANIFEST_BY_ID, MUSIC_LAYER_IDS, SOUND_MANIFEST } from './soundManifest';
import type {
  AmbienceLoopId,
  AtmosphereProfile,
  AudioSettings,
  MusicLayerId,
  PlayOptions,
  PositionalSoundOptions,
  SoundCategory,
  SoundDefinition,
  SoundId,
  UiSoundId,
} from './types';

type LoadedHowl = {
  howl: Howl;
  def: SoundDefinition;
  failed: boolean;
};

type LayerRuntime = {
  howl: Howl | null;
  currentVolume: number;
  targetVolume: number;
  useProcedural: boolean;
};

const FADE_TICK_MS = 50;
const CROSSFADE_RATE = 0.04;

export class AudioManager {
  private cache = new Map<SoundId, LoadedHowl>();
  private loading = new Map<SoundId, Promise<LoadedHowl | null>>();
  private layers = new Map<MusicLayerId, LayerRuntime>();
  private ambience = new Map<AmbienceLoopId, LayerRuntime>();
  private procedural = new ProceduralAudioEngine();
  private settings: AudioSettings = {
    masterVolume: 0.85,
    musicVolume: 0.55,
    sfxVolume: 0.7,
    muted: false,
  };
  private unlocked = false;
  private disposed = false;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private lastAtmosphere: AtmosphereProfile | null = null;
  private sirenTimer: ReturnType<typeof setInterval> | null = null;
  private debug = false;

  configure(settings: AudioSettings): void {
    this.settings = settings;
    this.applyMasterVolume();
    this.tickLayers();
  }

  setDebug(enabled: boolean): void {
    this.debug = enabled;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  async unlock(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (this.unlocked) return true;

    const ctx = Howler.ctx;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    source.stop(0);

    this.procedural.attachContext(ctx);
    this.unlocked = true;
    this.startFadeLoop();
    this.scheduleSirens();
    this.log('audio unlocked');
    return true;
  }

  async preloadCategories(categories: SoundCategory[]): Promise<void> {
    const defs = SOUND_MANIFEST.filter((d) => categories.includes(d.category) && !d.loop);
    await Promise.all(defs.map((d) => this.ensureHowl(d.id)));
  }

  async preloadLoops(): Promise<void> {
    await Promise.all(
      [...MUSIC_LAYER_IDS, ...AMBIENCE_LOOP_IDS].map((id) => this.ensureHowl(id))
    );
  }

  play(soundId: SoundId, options: PlayOptions = {}): void {
    if (!this.unlocked || this.disposed || this.settings.muted) return;
    if (!options.force && this.isLoopSound(soundId)) return;

    const def = MANIFEST_BY_ID.get(soundId);
    if (!def) return;

    if (def.loop && (MUSIC_LAYER_IDS as string[]).includes(soundId)) {
      this.setMusicLayerTarget(soundId as MusicLayerId, options.volume ?? def.volume ?? 0.5);
      return;
    }

    if (def.loop && (AMBIENCE_LOOP_IDS as string[]).includes(soundId)) {
      this.setAmbienceTarget(soundId as AmbienceLoopId, options.volume ?? def.volume ?? 0.2);
      return;
    }

    void this.playOneShot(soundId, options);
  }

  playPositional(soundId: SoundId, options: PositionalSoundOptions): void {
    if (!this.unlocked || this.disposed || this.settings.muted) return;
    void this.playOneShot(soundId, options, {
      x: options.x,
      y: options.y,
      z: options.z,
    });
  }

  updateAtmosphere(profile: AtmosphereProfile): void {
    if (!this.unlocked || this.disposed) return;
    this.lastAtmosphere = profile;

    const layerTargets = computeLayerTargets(profile);
    for (const id of MUSIC_LAYER_IDS) {
      const target = (layerTargets[id] ?? 0) * this.effectiveMusicGain();
      this.setMusicLayerTarget(id, target);
    }

    const ambTargets = computeAmbienceTargets(profile);
    for (const id of AMBIENCE_LOOP_IDS) {
      const target = (ambTargets[id] ?? 0) * this.effectiveMusicGain() * 0.85;
      this.setAmbienceTarget(id, target);
    }

    const active = new Set(activeAmbienceIds(profile));
    for (const id of AMBIENCE_LOOP_IDS) {
      if (!active.has(id)) {
        this.setAmbienceTarget(id, 0);
      }
    }

    if (profile.isElectionRound && profile.phase === 'event_modal') {
      this.setAmbienceTarget('military_drone', Math.max(ambTargets.military_drone ?? 0, 0.22) * this.effectiveMusicGain());
    }
  }

  crossfadeMusicLayer(layerId: MusicLayerId, targetVolume: number, durationMs = 1200): void {
    const runtime = this.layers.get(layerId);
    if (!runtime) {
      this.setMusicLayerTarget(layerId, targetVolume);
      return;
    }
    runtime.targetVolume = targetVolume;
    const steps = Math.max(1, Math.floor(durationMs / FADE_TICK_MS));
    const delta = (targetVolume - runtime.currentVolume) / steps;
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      runtime.currentVolume += delta;
      this.applyLayerVolume(layerId, runtime, runtime.currentVolume);
      if (step >= steps) {
        clearInterval(interval);
        runtime.currentVolume = targetVolume;
        runtime.targetVolume = targetVolume;
      }
    }, FADE_TICK_MS);
  }

  dispose(): void {
    this.disposed = true;
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    if (this.sirenTimer) clearInterval(this.sirenTimer);
    this.fadeTimer = null;
    this.sirenTimer = null;
    for (const entry of this.cache.values()) {
      entry.howl.unload();
    }
    this.cache.clear();
    this.loading.clear();
    for (const id of MUSIC_LAYER_IDS) {
      this.stopLayer(this.layers.get(id), id);
    }
    for (const id of AMBIENCE_LOOP_IDS) {
      this.stopLayer(this.ambience.get(id), id);
    }
    this.layers.clear();
    this.ambience.clear();
    this.procedural.dispose();
    this.unlocked = false;
  }

  private async playOneShot(
    soundId: SoundId,
    options: PlayOptions,
    position?: { x: number; y: number; z: number }
  ): Promise<void> {
    const def = MANIFEST_BY_ID.get(soundId);
    if (!def) return;

    const loaded = await this.ensureHowl(soundId);
    const vol = (options.volume ?? def.volume ?? 1) * this.effectiveSfxGain();

    if (loaded && !loaded.failed) {
      const id = loaded.howl.play();
      loaded.howl.volume(vol, id);
      if (options.rate) loaded.howl.rate(options.rate, id);
      if (position && def.spatial) {
        loaded.howl.pos(position.x, position.y, position.z, id);
      }
      return;
    }

    if (def.procedural) {
      if (this.isUiSound(soundId)) {
        this.procedural.playUi(soundId, vol);
      } else {
        this.procedural.playOneShot(soundId, vol);
      }
    }
  }

  private setMusicLayerTarget(layerId: MusicLayerId, target: number): void {
    let runtime = this.layers.get(layerId);
    if (!runtime) {
      runtime = { howl: null, currentVolume: 0, targetVolume: 0, useProcedural: false };
      this.layers.set(layerId, runtime);
    }
    runtime.targetVolume = target;
    if (target > 0.02 && runtime.currentVolume <= 0.02) {
      void this.startLayer(layerId, runtime, true);
    }
  }

  private setAmbienceTarget(layerId: AmbienceLoopId, target: number): void {
    let runtime = this.ambience.get(layerId);
    if (!runtime) {
      runtime = { howl: null, currentVolume: 0, targetVolume: 0, useProcedural: false };
      this.ambience.set(layerId, runtime);
    }
    runtime.targetVolume = target;
    if (target > 0.02 && runtime.currentVolume <= 0.02) {
      void this.startLayer(layerId, runtime, false);
    }
  }

  private async startLayer(
    layerId: MusicLayerId | AmbienceLoopId,
    runtime: LayerRuntime,
    isMusic: boolean
  ): Promise<void> {
    const def = MANIFEST_BY_ID.get(layerId);
    if (!def) return;

    const loaded = await this.ensureHowl(layerId);
    if (loaded && !loaded.failed) {
      runtime.howl = loaded.howl;
      runtime.useProcedural = false;
      if (!loaded.howl.playing()) {
        loaded.howl.play();
      }
      return;
    }

    if (def.procedural) {
      runtime.useProcedural = true;
      this.procedural.startLoop(layerId as AmbienceLoopId & MusicLayerId, 0);
    }
  }

  private stopLayer(runtime: LayerRuntime | undefined, id: string): void {
    if (!runtime) return;
    if (runtime.howl) {
      runtime.howl.fade(runtime.currentVolume, 0, 800);
      window.setTimeout(() => runtime.howl?.stop(), 850);
    }
    if (runtime.useProcedural) {
      this.procedural.stopLoop(id);
    }
    runtime.currentVolume = 0;
    runtime.targetVolume = 0;
  }

  private startFadeLoop(): void {
    if (this.fadeTimer) return;
    this.fadeTimer = setInterval(() => this.tickLayers(), FADE_TICK_MS);
  }

  private tickLayers(): void {
    if (this.disposed) return;

    for (const [id, runtime] of this.layers) {
      this.stepLayerVolume(id, runtime, true);
    }
    for (const [id, runtime] of this.ambience) {
      this.stepLayerVolume(id, runtime, false);
    }
  }

  private stepLayerVolume(id: string, runtime: LayerRuntime, isMusic: boolean): void {
    const diff = runtime.targetVolume - runtime.currentVolume;
    if (Math.abs(diff) < 0.001) {
      if (runtime.targetVolume <= 0.02 && runtime.currentVolume > 0) {
        this.stopLayer(runtime, id);
        if (isMusic) this.layers.delete(id as MusicLayerId);
        else this.ambience.delete(id as AmbienceLoopId);
      }
      return;
    }
    const step = Math.sign(diff) * Math.min(Math.abs(diff), CROSSFADE_RATE);
    runtime.currentVolume += step;
    this.applyLayerVolume(id, runtime, runtime.currentVolume);
  }

  private applyLayerVolume(id: string, runtime: LayerRuntime, volume: number): void {
    const scaled = volume * (this.settings.muted ? 0 : 1);
    if (runtime.howl) {
      runtime.howl.volume(scaled);
    }
    if (runtime.useProcedural) {
      this.procedural.setLoopVolume(id, scaled, 0.15);
    }
  }

  private async ensureHowl(soundId: SoundId): Promise<LoadedHowl | null> {
    const existing = this.cache.get(soundId);
    if (existing) return existing;

    const pending = this.loading.get(soundId);
    if (pending) return pending;

    const def = MANIFEST_BY_ID.get(soundId);
    if (!def) return null;

    const promise = new Promise<LoadedHowl | null>((resolve) => {
      const howl = new Howl({
        src: def.src,
        loop: def.loop ?? false,
        volume: 0,
        preload: def.preload ?? true,
        html5: def.loop ? true : false,
        onload: () => {
          const entry: LoadedHowl = { howl, def, failed: false };
          this.cache.set(soundId, entry);
          this.loading.delete(soundId);
          resolve(entry);
        },
        onloaderror: () => {
          const entry: LoadedHowl = { howl, def, failed: true };
          this.cache.set(soundId, entry);
          this.loading.delete(soundId);
          this.log(`load failed: ${soundId}, procedural fallback`);
          resolve(entry);
        },
      });
    });

    this.loading.set(soundId, promise);
    return promise;
  }

  private scheduleSirens(): void {
    if (this.sirenTimer) return;
    this.sirenTimer = setInterval(() => {
      if (!this.lastAtmosphere || this.settings.muted) return;
      if (this.lastAtmosphere.stability > 45 && !this.lastAtmosphere.nearCollapse) return;
      if (Math.random() > 0.35) return;
      this.play('distant_siren', { volume: 0.25 });
    }, 32000);
  }

  private applyMasterVolume(): void {
    const master = this.settings.muted ? 0 : this.settings.masterVolume;
    Howler.volume(master);
  }

  private effectiveMusicGain(): number {
    return this.settings.musicVolume;
  }

  private effectiveSfxGain(): number {
    return this.settings.sfxVolume * this.settings.masterVolume;
  }

  private isLoopSound(id: SoundId): boolean {
    return (MUSIC_LAYER_IDS as string[]).includes(id) || (AMBIENCE_LOOP_IDS as string[]).includes(id);
  }

  private isUiSound(id: SoundId): id is UiSoundId {
    return (
      id === 'card_hover' ||
      id === 'card_play' ||
      id === 'resource_gain' ||
      id === 'draw_card' ||
      id === 'end_turn' ||
      id === 'modal_open' ||
      id === 'dice_roll' ||
      id === 'success_reveal' ||
      id === 'partial_reveal' ||
      id === 'failure_reveal'
    );
  }

  private log(message: string): void {
    if (this.debug) {
      console.info(`[AudioManager] ${message}`);
    }
  }
}

let managerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!managerInstance) {
    managerInstance = new AudioManager();
  }
  return managerInstance;
}

export function resetAudioManager(): void {
  managerInstance?.dispose();
  managerInstance = null;
}
