import type { GamePhase, PlayerStats } from '@all-according-to-plan/shared';

export type SoundCategory = 'ui' | 'event' | 'ambience' | 'music' | 'election';

export type MusicLayerId =
  | 'base_ambient'
  | 'election_tension'
  | 'danger_escalation'
  | 'collapse_alarm';

export type AmbienceLoopId =
  | 'industrial_hum'
  | 'radio_static'
  | 'crowd_murmur'
  | 'rain_wind'
  | 'military_drone';

export type UiSoundId =
  | 'card_hover'
  | 'card_play'
  | 'resource_gain'
  | 'draw_card'
  | 'end_turn'
  | 'modal_open'
  | 'dice_roll'
  | 'success_reveal'
  | 'partial_reveal'
  | 'failure_reveal';

export type EventSoundId =
  | 'event_sting'
  | 'election_sting'
  | 'election_pulse';

export type WorldOneShotId = 'distant_siren';

export type SoundId = UiSoundId | EventSoundId | WorldOneShotId | AmbienceLoopId | MusicLayerId;

export type AudioSettings = {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.85,
  musicVolume: 0.55,
  sfxVolume: 0.7,
  muted: false,
};

export const AUDIO_STORAGE_KEY = 'aap-audio-settings-v1';

export type SoundDefinition = {
  id: SoundId;
  category: SoundCategory;
  src: string[];
  loop?: boolean;
  volume?: number;
  rate?: number;
  preload?: boolean;
  procedural?: boolean;
  spatial?: boolean;
  oneShotIntervalMs?: number;
};

export type PlayOptions = {
  volume?: number;
  rate?: number;
  force?: boolean;
  position?: { x: number; y: number; z: number };
};

export type AtmosphereProfile = {
  stability: number;
  fearLevel: number;
  isElectionRound: boolean;
  nearCollapse: boolean;
  consecutiveFailures: number;
  phase: GamePhase;
};

export type LayerVolumes = Record<MusicLayerId, number>;

export type PositionalSoundOptions = PlayOptions & {
  x: number;
  y: number;
  z: number;
  refDistance?: number;
};

export function computeAtmosphereFromStats(
  stats: PlayerStats,
  stability: number,
  round: number,
  phase: GamePhase,
  consecutiveFailures: number
): AtmosphereProfile {
  const fears = [stats.people.fear, stats.elites.fear, stats.security.fear];
  const satisfactions = [stats.people.satisfaction, stats.elites.satisfaction, stats.security.satisfaction];
  const minSat = Math.min(...satisfactions);
  const fearLevel = fears.reduce((a, b) => a + b, 0) / (fears.length * 10);
  const isElectionRound = round % 4 === 0 && round < 25;
  const nearCollapse = stability < 38 || minSat <= 2;

  return {
    stability,
    fearLevel,
    isElectionRound,
    nearCollapse,
    consecutiveFailures,
    phase,
  };
}
