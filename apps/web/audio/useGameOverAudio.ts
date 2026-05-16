'use client';

import { useEffect, useRef } from 'react';
import { getAudioManager } from './AudioManager';
import { useAudioStore } from './audioStore';
import { useGameStore } from '@/state/gameStore';

export function useGameOverAudio(): void {
  const phase = useGameStore((s) => s.state.phase);
  const result = useGameStore((s) => s.state.gameResult);
  const unlocked = useAudioStore((s) => s.unlocked);
  const muted = useAudioStore((s) => s.settings.muted);
  const playedFor = useRef<string | null>(null);

  useEffect(() => {
    if (phase !== 'game_over') {
      playedFor.current = null;
      return;
    }
    if (!unlocked || muted || !result) return;

    const key = `${result.type}:${result.score}`;
    if (playedFor.current === key) return;
    playedFor.current = key;

    const manager = getAudioManager();
    manager.enterGameOverMode();
    manager.fadeOutGameplay(1600);

    const timer = window.setTimeout(() => {
      manager.playGameOverSuite(result.type);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [phase, result, unlocked, muted]);
}
