import type { AmbienceLoopId, MusicLayerId, SoundDefinition } from './types';

const base = '/audio';

function src(path: string): string[] {
  const stem = path.replace(/\.(ogg|mp3|wav)$/, '');
  return [`${stem}.ogg`, `${stem}.mp3`, `${stem}.wav`];
}

export const UI_SOUNDS: SoundDefinition[] = [
  { id: 'card_hover', category: 'ui', src: src(`${base}/ui/card-hover.ogg`), volume: 0.22, procedural: true },
  { id: 'card_play', category: 'ui', src: src(`${base}/ui/card-play.ogg`), volume: 0.38, procedural: true },
  { id: 'resource_gain', category: 'ui', src: src(`${base}/ui/resource-gain.ogg`), volume: 0.32, procedural: true },
  { id: 'draw_card', category: 'ui', src: src(`${base}/ui/draw-card.ogg`), volume: 0.34, procedural: true },
  { id: 'end_turn', category: 'ui', src: src(`${base}/ui/end-turn.ogg`), volume: 0.36, procedural: true },
  { id: 'modal_open', category: 'ui', src: src(`${base}/ui/modal-open.ogg`), volume: 0.4, procedural: true },
  { id: 'dice_roll', category: 'ui', src: src(`${base}/ui/dice-roll.ogg`), volume: 0.45, procedural: true },
  { id: 'success_reveal', category: 'ui', src: src(`${base}/ui/success-reveal.ogg`), volume: 0.42, procedural: true },
  { id: 'partial_reveal', category: 'ui', src: src(`${base}/ui/partial-reveal.ogg`), volume: 0.38, procedural: true },
  { id: 'failure_reveal', category: 'ui', src: src(`${base}/ui/failure-reveal.ogg`), volume: 0.48, procedural: true },
  { id: 'button_hover', category: 'ui', src: src(`${base}/ui/card-hover.ogg`), volume: 0.16, procedural: true },
  { id: 'warning_sting', category: 'ui', src: src(`${base}/ui/warning-sting.ogg`), volume: 0.38, procedural: true },
];

export const GAME_OVER_SOUNDS: SoundDefinition[] = [
  { id: 'victory_sting', category: 'music', src: src(`${base}/music/victory-sting.ogg`), volume: 0.5, procedural: true },
  { id: 'survival_sting', category: 'music', src: src(`${base}/music/survival-sting.ogg`), volume: 0.42, procedural: true },
  { id: 'failure_collapse', category: 'music', src: src(`${base}/music/failure-collapse.ogg`), volume: 0.55, procedural: true },
];

export const EVENT_SOUNDS: SoundDefinition[] = [
  { id: 'event_sting', category: 'event', src: src(`${base}/events/event-sting.ogg`), volume: 0.44, procedural: true },
  { id: 'election_sting', category: 'election', src: src(`${base}/elections/election-sting.ogg`), volume: 0.5, procedural: true },
  { id: 'election_pulse', category: 'election', src: src(`${base}/elections/election-pulse.ogg`), volume: 0.28, loop: true, procedural: true },
];

export const WORLD_SOUNDS: SoundDefinition[] = [
  {
    id: 'distant_siren',
    category: 'ambience',
    src: src(`${base}/ambience/distant-siren.ogg`),
    volume: 0.35,
    procedural: true,
    oneShotIntervalMs: 28000,
  },
];

export const AMBIENCE_LOOPS: SoundDefinition[] = [
  { id: 'industrial_hum', category: 'ambience', src: src(`${base}/ambience/industrial-hum.ogg`), loop: true, volume: 0.2, preload: false, procedural: true },
  { id: 'radio_static', category: 'ambience', src: src(`${base}/ambience/radio-static.ogg`), loop: true, volume: 0.12, preload: false, procedural: true },
  { id: 'crowd_murmur', category: 'ambience', src: src(`${base}/ambience/crowd-murmur.ogg`), loop: true, volume: 0.14, preload: false, procedural: true },
  { id: 'rain_wind', category: 'ambience', src: src(`${base}/ambience/rain-wind.ogg`), loop: true, volume: 0.16, preload: false, procedural: true },
  { id: 'military_drone', category: 'ambience', src: src(`${base}/ambience/military-drone.ogg`), loop: true, volume: 0.18, preload: false, procedural: true },
];

export const MUSIC_LAYERS: SoundDefinition[] = [
  { id: 'base_ambient', category: 'music', src: src(`${base}/music/base-ambient.ogg`), loop: true, volume: 0.35, preload: false, procedural: true },
  { id: 'election_tension', category: 'music', src: src(`${base}/music/election-tension.ogg`), loop: true, volume: 0.4, preload: false, procedural: true },
  { id: 'danger_escalation', category: 'music', src: src(`${base}/music/danger-escalation.ogg`), loop: true, volume: 0.45, preload: false, procedural: true },
  { id: 'collapse_alarm', category: 'music', src: src(`${base}/music/collapse-alarm.ogg`), loop: true, volume: 0.5, preload: false, procedural: true },
];

export const SOUND_MANIFEST: SoundDefinition[] = [
  ...UI_SOUNDS,
  ...EVENT_SOUNDS,
  ...WORLD_SOUNDS,
  ...AMBIENCE_LOOPS,
  ...MUSIC_LAYERS,
  ...GAME_OVER_SOUNDS,
];

export const MANIFEST_BY_ID = new Map(SOUND_MANIFEST.map((s) => [s.id, s]));

export const MUSIC_LAYER_IDS: MusicLayerId[] = [
  'base_ambient',
  'election_tension',
  'danger_escalation',
  'collapse_alarm',
];

export const AMBIENCE_LOOP_IDS: AmbienceLoopId[] = [
  'industrial_hum',
  'radio_static',
  'crowd_murmur',
  'rain_wind',
  'military_drone',
];

export const PRELOAD_ON_UNLOCK: SoundDefinition['category'][] = ['ui', 'event'];
