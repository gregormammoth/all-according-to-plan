'use client';

import { useCallback, useEffect } from 'react';
import { getAudioManager } from './AudioManager';
import { useAudioStore } from './audioStore';
import type { PlayOptions, PositionalSoundOptions, SoundId } from './types';

export function useAudio() {
  const settings = useAudioStore((s) => s.settings);
  const unlocked = useAudioStore((s) => s.unlocked);
  const hydrated = useAudioStore((s) => s.hydrated);
  const hydrate = useAudioStore((s) => s.hydrate);
  const unlock = useAudioStore((s) => s.unlock);
  const setMasterVolume = useAudioStore((s) => s.setMasterVolume);
  const setMusicVolume = useAudioStore((s) => s.setMusicVolume);
  const setSfxVolume = useAudioStore((s) => s.setSfxVolume);
  const setMuted = useAudioStore((s) => s.setMuted);
  const toggleMute = useAudioStore((s) => s.toggleMute);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const play = useCallback(
    (soundId: SoundId, options?: PlayOptions) => {
      if (!unlocked || settings.muted) return;
      getAudioManager().play(soundId, options);
    },
    [unlocked, settings.muted]
  );

  const playPositional = useCallback(
    (soundId: SoundId, options: PositionalSoundOptions) => {
      if (!unlocked || settings.muted) return;
      getAudioManager().playPositional(soundId, options);
    },
    [unlocked, settings.muted]
  );

  return {
    settings,
    unlocked,
    hydrated,
    unlock,
    play,
    playPositional,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    setMuted,
    toggleMute,
  };
}

export function useAudioUnlockOnGesture() {
  const { unlocked, unlock } = useAudio();

  const bindUnlock = useCallback(() => {
    if (unlocked) return;
    void unlock();
  }, [unlocked, unlock]);

  return { bindUnlock, unlocked };
}
