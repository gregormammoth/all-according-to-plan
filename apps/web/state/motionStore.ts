'use client';

import { create } from 'zustand';

export type MotionCue =
  | { type: 'play'; cardId: string; cardKind: 'asset' | 'event' }
  | { type: 'draw'; cardId: string }
  | null;

export type PendingPlayExit = {
  cardId: string;
  cardKind: 'asset' | 'event';
};

type MotionStore = {
  cue: MotionCue;
  pendingPlayExit: PendingPlayExit | null;
  archiveFlashId: string | null;
  shakeKey: number;
  setCue: (cue: MotionCue) => void;
  clearCue: () => void;
  setPendingPlayExit: (exit: PendingPlayExit | null) => void;
  flashArchive: (cardId: string) => void;
  clearArchiveFlash: () => void;
  triggerShake: () => void;
};

export const useMotionStore = create<MotionStore>((set) => ({
  cue: null,
  pendingPlayExit: null,
  archiveFlashId: null,
  shakeKey: 0,
  setCue: (cue) => set({ cue }),
  clearCue: () => set({ cue: null }),
  setPendingPlayExit: (pendingPlayExit) => set({ pendingPlayExit }),
  flashArchive: (cardId) => set({ archiveFlashId: cardId }),
  clearArchiveFlash: () => set({ archiveFlashId: null }),
  triggerShake: () => set((s) => ({ shakeKey: s.shakeKey + 1 })),
}));
