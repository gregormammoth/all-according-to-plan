'use client';

import { createContext, useContext, useMemo } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { duration } from './tokens';

type MotionContextValue = {
  reduced: boolean;
  instant: boolean;
  d: typeof duration;
};

const MotionContext = createContext<MotionContextValue>({
  reduced: false,
  instant: false,
  d: duration,
});

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const value = useMemo(
    () => ({
      reduced,
      instant: reduced,
      d: duration,
    }),
    [reduced]
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotionPrefs() {
  return useContext(MotionContext);
}
