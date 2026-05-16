import type { AmbienceLoopId, MusicLayerId, SoundId, UiSoundId } from './types';

type ActiveLoop = {
  nodes: AudioNode[];
  gain: GainNode;
};

export class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private loops = new Map<string, ActiveLoop>();

  attachContext(ctx: AudioContext): void {
    this.ctx = ctx;
  }

  dispose(): void {
    for (const loop of this.loops.values()) {
      for (const node of loop.nodes) {
        try {
          node.disconnect();
        } catch {
          /* noop */
        }
      }
    }
    this.loops.clear();
    this.ctx = null;
  }

  playUi(id: UiSoundId, masterGain: number): void {
    const ctx = this.ctx;
    if (!ctx || masterGain <= 0) return;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.value = masterGain;
    g.connect(ctx.destination);

    switch (id) {
      case 'card_hover': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.06);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.04, t + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        osc.connect(env);
        env.connect(g);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }
      case 'card_play': {
        const noise = this.brownNoise(ctx, 0.12);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.12, t);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        noise.connect(filter);
        filter.connect(env);
        env.connect(g);
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(55, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);
        const oEnv = ctx.createGain();
        oEnv.gain.setValueAtTime(0.08, t);
        oEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        osc.connect(oEnv);
        oEnv.connect(g);
        osc.start(t);
        osc.stop(t + 0.22);
        break;
      }
      case 'resource_gain': {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.setValueAtTime(330, t + 0.04);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.025, t + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 4;
        osc.connect(filter);
        filter.connect(env);
        env.connect(g);
        osc.start(t);
        osc.stop(t + 0.16);
        break;
      }
      case 'draw_card': {
        const noise = this.brownNoise(ctx, 0.18);
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1200;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.05, t + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        noise.connect(filter);
        filter.connect(env);
        env.connect(g);
        break;
      }
      case 'end_turn':
      case 'modal_open': {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(70, t);
        osc.frequency.linearRampToValueAtTime(45, t + 0.35);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, t);
        filter.frequency.linearRampToValueAtTime(200, t + 0.4);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(id === 'modal_open' ? 0.06 : 0.045, t + 0.08);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        osc.connect(filter);
        filter.connect(env);
        env.connect(g);
        osc.start(t);
        osc.stop(t + 0.55);
        break;
      }
      case 'dice_roll': {
        const noise = this.brownNoise(ctx, 0.5);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.exponentialRampToValueAtTime(900, t + 0.7);
        filter.Q.value = 2;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.07, t + 0.15);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
        noise.connect(filter);
        filter.connect(env);
        env.connect(g);
        break;
      }
      case 'success_reveal': {
        const freqs = [130.81, 164.81, 196];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = f;
          const env = ctx.createGain();
          const start = t + i * 0.04;
          env.gain.setValueAtTime(0.0001, start);
          env.gain.linearRampToValueAtTime(0.035, start + 0.05);
          env.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
          osc.connect(env);
          env.connect(g);
          osc.start(start);
          osc.stop(start + 0.4);
        });
        break;
      }
      case 'partial_reveal': {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.linearRampToValueAtTime(95, t + 0.25);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.04, t);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        osc.connect(env);
        env.connect(g);
        osc.start(t);
        osc.stop(t + 0.32);
        break;
      }
      case 'button_hover': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 240;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.022, t + 0.008);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        osc.connect(env);
        env.connect(g);
        osc.start(t);
        osc.stop(t + 0.06);
        break;
      }
      case 'warning_sting': {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.35);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.06, t + 0.04);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;
        osc.connect(filter);
        filter.connect(env);
        env.connect(g);
        osc.start(t);
        osc.stop(t + 0.42);
        break;
      }
      case 'failure_reveal': {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.45);
        const osc2 = ctx.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(95, t);
        osc2.frequency.exponentialRampToValueAtTime(50, t + 0.45);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.07, t);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        const merge = ctx.createGain();
        merge.gain.value = 0.5;
        osc.connect(merge);
        osc2.connect(merge);
        merge.connect(env);
        env.connect(g);
        osc.start(t);
        osc2.start(t);
        osc.stop(t + 0.52);
        osc2.stop(t + 0.52);
        break;
      }
      default:
        break;
    }
  }

  playOneShot(id: SoundId, masterGain: number): void {
    const ctx = this.ctx;
    if (!ctx || masterGain <= 0) return;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.value = masterGain;
    g.connect(ctx.destination);

    if (id === 'event_sting' || id === 'election_sting') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(id === 'election_sting' ? 55 : 65, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.6);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 280;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(id === 'election_sting' ? 0.09 : 0.065, t + 0.05);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
      osc.connect(filter);
      filter.connect(env);
      env.connect(g);
      osc.start(t);
      osc.stop(t + 0.7);
      return;
    }

    if (id === 'victory_sting') {
      const freqs = [130.81, 164.81, 196, 261.63];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const env = ctx.createGain();
        const start = t + i * 0.07;
        env.gain.setValueAtTime(0.0001, start);
        env.gain.linearRampToValueAtTime(0.04, start + 0.06);
        env.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
        osc.connect(env);
        env.connect(g);
        osc.start(start);
        osc.stop(start + 0.55);
      });
      return;
    }

    if (id === 'survival_sting') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(88, t);
      osc.frequency.linearRampToValueAtTime(82, t + 1.2);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(0.045, t + 0.3);
      env.gain.setValueAtTime(0.035, t + 0.8);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      osc.connect(env);
      env.connect(g);
      osc.start(t);
      osc.stop(t + 1.45);
      return;
    }

    if (id === 'failure_collapse') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 1.5);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(0.08, t + 0.2);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      osc.connect(env);
      env.connect(g);
      osc.start(t);
      osc.stop(t + 1.65);
      return;
    }

    if (id === 'distant_siren') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(660, t + 0.8);
      osc.frequency.linearRampToValueAtTime(440, t + 1.6);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(0.025, t + 0.2);
      env.gain.setValueAtTime(0.025, t + 1.2);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 900;
      filter.Q.value = 8;
      osc.connect(filter);
      filter.connect(env);
      env.connect(g);
      osc.start(t);
      osc.stop(t + 1.9);
    }
  }

  setLoopVolume(id: string, volume: number, rampSec = 0.8): void {
    const loop = this.loops.get(id);
    if (!loop?.gain || !this.ctx) return;
    const t = this.ctx.currentTime;
    loop.gain.gain.cancelScheduledValues(t);
    loop.gain.gain.setValueAtTime(loop.gain.gain.value, t);
    loop.gain.gain.linearRampToValueAtTime(Math.max(0, volume), t + rampSec);
  }

  startLoop(id: AmbienceLoopId | MusicLayerId | 'election_pulse', targetVolume: number): void {
    if (this.loops.has(id)) {
      this.setLoopVolume(id, targetVolume);
      return;
    }
    const ctx = this.ctx;
    if (!ctx) return;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    const nodes: AudioNode[] = [gain];

    if (id === 'industrial_hum' || id === 'base_ambient') {
      const noise = this.brownNoise(ctx, 30);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = id === 'base_ambient' ? 120 : 90;
      noise.connect(filter);
      filter.connect(gain);
      nodes.push(noise, filter);
    } else if (id === 'radio_static') {
      const noise = this.whiteNoise(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 4000;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.3;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 800;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      noise.connect(filter);
      filter.connect(gain);
      lfo.start();
      nodes.push(noise, filter, lfo, lfoGain);
    } else if (id === 'crowd_murmur') {
      const noise = this.pinkNoise(ctx, 20);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 350;
      filter.Q.value = 0.7;
      noise.connect(filter);
      filter.connect(gain);
      nodes.push(noise, filter);
    } else if (id === 'rain_wind') {
      const noise = this.whiteNoise(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 700;
      noise.connect(filter);
      filter.connect(gain);
      nodes.push(noise, filter);
    } else if (id === 'military_drone' || id === 'danger_escalation') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = id === 'military_drone' ? 48 : 62;
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = id === 'military_drone' ? 50.5 : 65.3;
      const merge = ctx.createGain();
      merge.gain.value = 0.5;
      osc.connect(merge);
      osc2.connect(merge);
      merge.connect(gain);
      osc.start();
      osc2.start();
      nodes.push(osc, osc2, merge);
    } else if (id === 'election_tension' || id === 'election_pulse') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 80;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = id === 'election_pulse' ? 1.2 : 0.5;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = id === 'election_pulse' ? 25 : 8;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(gain);
      lfo.start();
      osc.start();
      nodes.push(osc, lfo, lfoGain);
    } else if (id === 'collapse_alarm') {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 110;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 2;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 40;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      osc.connect(filter);
      filter.connect(gain);
      lfo.start();
      osc.start();
      nodes.push(osc, lfo, lfoGain, filter);
    }

    this.loops.set(id, { nodes, gain });
    this.setLoopVolume(id, targetVolume, 1.2);
  }

  stopLoop(id: string, rampSec = 1): void {
    const loop = this.loops.get(id);
    if (!loop || !this.ctx) return;
    const t = this.ctx.currentTime;
    loop.gain.gain.cancelScheduledValues(t);
    loop.gain.gain.setValueAtTime(loop.gain.gain.value, t);
    loop.gain.gain.linearRampToValueAtTime(0, t + rampSec);
    window.setTimeout(() => {
      const active = this.loops.get(id);
      if (active !== loop) return;
      for (const node of loop.nodes) {
        try {
          if (node instanceof OscillatorNode) node.stop();
          node.disconnect();
        } catch {
          /* noop */
        }
      }
      this.loops.delete(id);
    }, rampSec * 1000 + 50);
  }

  private brownNoise(ctx: AudioContext, durationSec: number): AudioBufferSourceNode {
    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = durationSec > 1;
    source.start();
    return source;
  }

  private whiteNoise(ctx: AudioContext): AudioBufferSourceNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();
    return source;
  }

  private pinkNoise(ctx: AudioContext, durationSec: number): AudioBufferSourceNode {
    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      data[i] = (b0 + b1 + b2) * 0.22;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();
    return source;
  }
}
