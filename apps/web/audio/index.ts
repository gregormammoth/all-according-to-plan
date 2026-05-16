export { AudioManager, getAudioManager, resetAudioManager } from './AudioManager';
export { useAudioStore } from './audioStore';
export { useAudio, useAudioUnlockOnGesture } from './useAudio';
export { useGameAudio } from './useGameAudio';
export { useGameOverAudio } from './useGameOverAudio';
export { useHoverSound, useButtonHoverSound } from './useHoverSound';
export { SOUND_MANIFEST, MANIFEST_BY_ID } from './soundManifest';
export type {
  SoundId,
  SoundCategory,
  AudioSettings,
  AtmosphereProfile,
  PlayOptions,
  MusicLayerId,
  AmbienceLoopId,
} from './types';
export { computeAtmosphereFromStats, DEFAULT_AUDIO_SETTINGS } from './types';
