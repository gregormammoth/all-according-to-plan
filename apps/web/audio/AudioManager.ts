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
const BED_FADE_RATE = 0.018;
const BASE_AMBIENT_ID: MusicLayerId = 'base_ambient';
const GAMEPLAY_FADE_RATE = 0.025;
const HOWL_LOAD_TIMEOUT_MS = 6000;

const IS_DEV = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

const GAME_OVER_STINGS: SoundId[] = ['victory_sting', 'survival_sting', 'failure_collapse'];

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
  private debug = IS_DEV;
  private musicBedStarted = false;
  private bedFadingIn = false;
  private fadingOut = false;
  private gameOverMode = false;
  private gameplayFadeRate = CROSSFADE_RATE;
  private unlockInFlight = false;
  private bedBaseTarget = 0;

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

  enterGameOverMode(): void {
    this.gameOverMode = true;
    this.log('game over mode');
  }

  exitGameOverMode(): void {
    this.gameOverMode = false;
    this.fadingOut = false;
    this.gameplayFadeRate = CROSSFADE_RATE;
    this.log('exit game over mode');
  }

  async unlock(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (this.unlocked) return true;
    if (this.unlockInFlight) return true;

    this.unlockInFlight = true;
    try {
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
      void this.startGameplayBed();
      return true;
    } catch (err) {
      this.log(`unlock failed: ${String(err)}`);
      return false;
    } finally {
      this.unlockInFlight = false;
    }
  }

  async ensureBaseAmbient(): Promise<void> {
    if (!this.unlocked || this.disposed || this.settings.muted) return;

    const gain = this.effectiveMusicGain();
    this.bedBaseTarget = 0.34 * gain;

    let baseRuntime = this.layers.get(BASE_AMBIENT_ID);
    if (!baseRuntime) {
      baseRuntime = { howl: null, currentVolume: 0, targetVolume: 0, useProcedural: false };
      this.layers.set(BASE_AMBIENT_ID, baseRuntime);
    }
    baseRuntime.targetVolume = this.bedBaseTarget;

    const loaded = await this.ensureHowl(BASE_AMBIENT_ID);
    if (loaded && !loaded.failed) {
      baseRuntime.howl = loaded.howl;
      baseRuntime.useProcedural = false;
      this.procedural.stopLoop(BASE_AMBIENT_ID);
      if (!loaded.howl.playing()) {
        loaded.howl.play();
      }
      if (baseRuntime.currentVolume <= 0.02) {
        baseRuntime.currentVolume = 0.04;
        this.applyLayerVolume(BASE_AMBIENT_ID, baseRuntime, baseRuntime.currentVolume);
      }
      this.log(`base_ambient playback started (${loaded.def.src[0]})`);
      return;
    }

    if (!baseRuntime.useProcedural) {
      baseRuntime.useProcedural = true;
      this.procedural.startLoop(BASE_AMBIENT_ID, 0);
      this.log('base_ambient playback started (procedural fallback)');
    }
  }

  async startGameplayBed(): Promise<void> {
    if (!this.unlocked || this.disposed || this.settings.muted || this.gameOverMode) return;
    if (this.musicBedStarted) {
      void this.ensureBaseAmbient();
      return;
    }

    this.musicBedStarted = true;
    this.bedFadingIn = true;
    window.setTimeout(() => {
      this.bedFadingIn = false;
    }, 2200);

    const gain = this.effectiveMusicGain();
    this.bedBaseTarget = 0.34 * gain;

    await this.ensureBaseAmbient();

    this.setAmbienceTarget('industrial_hum', 0.1 * gain);
    void this.preloadLoops();
    this.log('gameplay bed started');
  }

  fadeOutGameplay(durationMs = 1400): void {
    if (!this.unlocked) return;
    this.fadingOut = true;
    this.gameplayFadeRate = GAMEPLAY_FADE_RATE * 1.8;
    for (const id of MUSIC_LAYER_IDS) {
      this.setMusicLayerTarget(id, 0);
    }
    for (const id of AMBIENCE_LOOP_IDS) {
      this.setAmbienceTarget(id, 0);
    }
    this.musicBedStarted = false;
    this.log(`gameplay fade out ${durationMs}ms`);
    window.setTimeout(() => {
      if (!this.gameOverMode) {
        this.fadingOut = false;
        this.gameplayFadeRate = CROSSFADE_RATE;
      }
    }, durationMs);
  }

  async restartGameplayBed(): Promise<void> {
    this.exitGameOverMode();
    this.musicBedStarted = false;
    await this.startGameplayBed();
  }

  playGameOverSuite(type: 'victory' | 'survival' | 'failure'): void {
    if (!this.unlocked || this.disposed || this.settings.muted) return;
    const gain = this.effectiveMusicGain();

    if (type === 'victory') {
      this.play('victory_sting', { volume: 0.48, force: true });
      this.setAmbienceTarget('crowd_murmur', 0.06 * gain);
      this.log('game over suite: victory');
      return;
    }

    if (type === 'survival') {
      this.play('survival_sting', { volume: 0.4, force: true });
      this.setAmbienceTarget('radio_static', 0.08 * gain);
      this.setMusicLayerTarget('base_ambient', 0.12 * gain);
      this.log('game over suite: survival');
      return;
    }

    this.play('failure_collapse', { volume: 0.52, force: true });
    this.setMusicLayerTarget('collapse_alarm', 0.38 * gain);
    this.setAmbienceTarget('military_drone', 0.15 * gain);
    window.setTimeout(() => {
      this.play('distant_siren', { volume: 0.32, force: true });
    }, 700);
    this.log('game over suite: failure');
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
    if (this.disposed) return;
    if (!this.unlocked || this.settings.muted) return;
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

    this.playOneShot(soundId, options);
  }

  playPositional(soundId: SoundId, options: PositionalSoundOptions): void {
    if (!this.unlocked || this.disposed || this.settings.muted) return;
    this.playOneShot(soundId, options, {
      x: options.x,
      y: options.y,
      z: options.z,
    });
  }

  updateAtmosphere(profile: AtmosphereProfile): void {
    if (!this.unlocked || this.disposed || this.gameOverMode || this.fadingOut) return;
    this.lastAtmosphere = profile;

    const layerTargets = computeLayerTargets(profile);
    const gain = this.effectiveMusicGain();
    for (const id of MUSIC_LAYER_IDS) {
      let target = (layerTargets[id] ?? 0) * gain;
      if (id === BASE_AMBIENT_ID && this.musicBedStarted && !this.gameOverMode) {
        target = Math.max(target, this.bedBaseTarget);
      }
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
      this.setAmbienceTarget(
        'military_drone',
        Math.max(ambTargets.military_drone ?? 0, 0.22) * this.effectiveMusicGain()
      );
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
    this.musicBedStarted = false;
    this.gameOverMode = false;
  }

  private playOneShot(
    soundId: SoundId,
    options: PlayOptions,
    position?: { x: number; y: number; z: number }
  ): void {
    const def = MANIFEST_BY_ID.get(soundId);
    if (!def) return;

    const vol = (options.volume ?? def.volume ?? 1) * this.effectiveSfxGain();

    if (def.procedural && this.prefersImmediatePlayback(soundId)) {
      const cached = this.cache.get(soundId);
      if (cached && !cached.failed) {
        const playId = cached.howl.play();
        cached.howl.volume(vol, playId);
        if (options.rate) cached.howl.rate(options.rate, playId);
        if (position && def.spatial) {
          cached.howl.pos(position.x, position.y, position.z, playId);
        }
        this.log(`playback started (cached): ${soundId}`);
        return;
      }

      this.playProceduralShot(soundId, vol);
      this.log(`playback started (procedural): ${soundId}`);
      void this.ensureHowl(soundId);
      return;
    }

    void this.ensureHowl(soundId).then((loaded) => {
      if (this.disposed) return;
      if (loaded && !loaded.failed) {
        const playId = loaded.howl.play();
        loaded.howl.volume(vol, playId);
        if (options.rate) loaded.howl.rate(options.rate, playId);
        if (position && def.spatial) {
          loaded.howl.pos(position.x, position.y, position.z, playId);
        }
        this.log(`playback started: ${soundId}`);
        return;
      }
      if (def.procedural) {
        this.playProceduralShot(soundId, vol);
        this.log(`playback started (procedural fallback): ${soundId}`);
      } else {
        this.log(`playback failed: ${soundId}`);
      }
    });
  }

  private playProceduralShot(soundId: SoundId, vol: number): void {
    if (this.isUiSound(soundId)) {
      this.procedural.playUi(soundId, vol);
    } else {
      this.procedural.playOneShot(soundId, vol);
    }
  }

  private prefersImmediatePlayback(soundId: SoundId): boolean {
    return (
      this.isUiSound(soundId) ||
      GAME_OVER_STINGS.includes(soundId) ||
      soundId === 'distant_siren' ||
      soundId === 'event_sting' ||
      soundId === 'election_sting'
    );
  }

  private setMusicLayerTarget(layerId: MusicLayerId, target: number): void {
    let runtime = this.layers.get(layerId);
    if (!runtime) {
      runtime = { howl: null, currentVolume: 0, targetVolume: 0, useProcedural: false };
      this.layers.set(layerId, runtime);
    }
    runtime.targetVolume = target;
    if (target > 0.02 && runtime.currentVolume <= 0.02 && !runtime.howl && !runtime.useProcedural) {
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
    if (target > 0.02 && runtime.currentVolume <= 0.02 && !runtime.howl && !runtime.useProcedural) {
      void this.startLayer(layerId, runtime, false);
    }
  }

  private async startLayer(
    layerId: MusicLayerId | AmbienceLoopId,
    runtime: LayerRuntime,
    _isMusic: boolean
  ): Promise<void> {
    const def = MANIFEST_BY_ID.get(layerId);
    if (!def) return;

    const preferFileFirst = layerId === BASE_AMBIENT_ID || !def.procedural;

    if (!preferFileFirst && def.procedural && !runtime.useProcedural) {
      runtime.useProcedural = true;
      this.procedural.startLoop(layerId as AmbienceLoopId & MusicLayerId, 0);
      this.log(`track loaded (procedural loop): ${layerId}`);
    }

    const loaded = await this.ensureHowl(layerId);
    if (loaded && !loaded.failed) {
      runtime.howl = loaded.howl;
      if (runtime.useProcedural) {
        this.procedural.stopLoop(layerId);
        runtime.useProcedural = false;
      }
      if (!loaded.howl.playing()) {
        loaded.howl.play();
      }
      this.log(`track loaded: ${layerId}`);
      return;
    }

    if (def.procedural && !runtime.useProcedural) {
      runtime.useProcedural = true;
      this.procedural.startLoop(layerId as AmbienceLoopId & MusicLayerId, 0);
      this.log(`track loaded (procedural loop fallback): ${layerId}`);
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
    runtime.useProcedural = false;
    runtime.howl = null;
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
        if (id === BASE_AMBIENT_ID && this.musicBedStarted && !this.gameOverMode) {
          return;
        }
        this.stopLayer(runtime, id);
        if (isMusic) this.layers.delete(id as MusicLayerId);
        else this.ambience.delete(id as AmbienceLoopId);
      }
      return;
    }
    let rate = CROSSFADE_RATE;
    if (this.bedFadingIn) rate = BED_FADE_RATE;
    else if (this.fadingOut) rate = this.gameplayFadeRate;
    const step = Math.sign(diff) * Math.min(Math.abs(diff), rate);
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
      let settled = false;

      const finish = (entry: LoadedHowl) => {
        if (settled) return;
        settled = true;
        this.cache.set(soundId, entry);
        this.loading.delete(soundId);
        resolve(entry);
      };

      const howl = new Howl({
        src: def.src,
        loop: def.loop ?? false,
        volume: 0,
        preload: def.preload ?? true,
        html5: false,
        onload: () => {
          finish({ howl, def, failed: false });
        },
        onloaderror: (_id, err) => {
          this.log(`load failed: ${soundId} (${String(err)})`);
          finish({ howl, def, failed: true });
        },
      });

      window.setTimeout(() => {
        if (settled) return;
        if (howl.state() === 'loaded') {
          this.log(`file loaded (post-timeout): ${soundId}`);
          finish({ howl, def, failed: false });
          return;
        }
        this.log(`load timeout: ${soundId}`);
        finish({ howl, def, failed: true });
      }, HOWL_LOAD_TIMEOUT_MS);
    });

    this.loading.set(soundId, promise);
    return promise;
  }

  private scheduleSirens(): void {
    if (this.sirenTimer) return;
    this.sirenTimer = setInterval(() => {
      if (!this.lastAtmosphere || this.settings.muted || this.gameOverMode) return;
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
      id === 'failure_reveal' ||
      id === 'button_hover' ||
      id === 'warning_sting'
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
