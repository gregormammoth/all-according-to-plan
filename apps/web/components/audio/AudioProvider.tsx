'use client';

import { useEffect } from 'react';
import { useAudioStore } from '@/audio/audioStore';

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAudioStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
