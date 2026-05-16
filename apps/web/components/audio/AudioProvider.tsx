'use client';

import { useEffect } from 'react';
import { getAudioManager } from '@/audio/AudioManager';
import { useAudioStore } from '@/audio/audioStore';

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAudioStore((s) => s.hydrate);
  const unlocked = useAudioStore((s) => s.unlocked);
  const unlock = useAudioStore((s) => s.unlock);

  useEffect(() => {
    hydrate();
    if (process.env.NODE_ENV === 'development') {
      getAudioManager().setDebug(true);
    }
  }, [hydrate]);

  useEffect(() => {
    if (unlocked) return;

    const tryUnlock = () => {
      void unlock();
    };

    window.addEventListener('pointerdown', tryUnlock, { once: true, passive: true });
    window.addEventListener('keydown', tryUnlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', tryUnlock);
      window.removeEventListener('keydown', tryUnlock);
    };
  }, [unlocked, unlock]);

  return <>{children}</>;
}
