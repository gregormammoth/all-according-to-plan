'use client';

import { useCallback, useRef } from 'react';
import { getAudioManager } from './AudioManager';
import { useAudioStore } from './audioStore';
import type { SoundId } from './types';

const MIN_INTERVAL_MS = 70;
let lastGlobalAt = 0;

export function useHoverSound(soundId: SoundId = 'button_hover', volume = 0.2) {
  const unlocked = useAudioStore((s) => s.unlocked);
  const muted = useAudioStore((s) => s.settings.muted);
  const inside = useRef(false);

  const trigger = useCallback(() => {
    if (!unlocked || muted) return;
    const now = performance.now();
    if (inside.current) return;
    if (now - lastGlobalAt < MIN_INTERVAL_MS) return;
    inside.current = true;
    lastGlobalAt = now;
    getAudioManager().play(soundId, { volume });
  }, [unlocked, muted, soundId, volume]);

  const onPointerEnter = useCallback(
    (e?: React.PointerEvent) => {
      if (e?.pointerType === 'touch') return;
      trigger();
    },
    [trigger]
  );

  const onMouseEnter = useCallback(() => {
    trigger();
  }, [trigger]);

  const onPointerLeave = useCallback(() => {
    inside.current = false;
  }, []);

  return { onPointerEnter, onMouseEnter, onPointerLeave, trigger };
}

export function useButtonHoverSound() {
  return useHoverSound('button_hover', 0.2);
}
