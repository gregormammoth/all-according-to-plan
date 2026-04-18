import {
  createInitialState,
  finishPlayerPhaseEarly,
  getDefaultLibrary,
  playCard,
  type CardLibrary,
} from '@all-according-to-plan/game-engine';
import type { GameState } from '@all-according-to-plan/shared';
import { create } from 'zustand';

type GameStore = {
  state: GameState;
  library: CardLibrary;
  error: string | null;
  play: (cardId: string) => void;
  endPlayerPhase: () => void;
  reset: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),
  library: getDefaultLibrary(),
  error: null,
  play: (cardId) => {
    const res = playCard(get().library, get().state, cardId);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({ state: res.state, error: null });
  },
  endPlayerPhase: () => {
    const res = finishPlayerPhaseEarly(get().library, get().state);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({ state: res.state, error: null });
  },
  reset: () => {
    set({ state: createInitialState(), error: null });
  },
}));
