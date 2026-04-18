import {
  createInitialState,
  drawCard,
  gainResource,
  getDefaultLibrary,
  playCard,
  type CardLibrary,
} from '@all-according-to-plan/game-engine';
import type { GameState, ResourceType } from '@all-according-to-plan/shared';
import { create } from 'zustand';

type GameStore = {
  state: GameState;
  library: CardLibrary;
  error: string | null;
  playSelectMode: boolean;
  togglePlaySelectMode: () => void;
  play: (cardId: string) => void;
  draw: () => void;
  gain: (resource: ResourceType) => void;
  reset: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),
  library: getDefaultLibrary(),
  error: null,
  playSelectMode: false,
  togglePlaySelectMode: () => {
    set({ playSelectMode: !get().playSelectMode, error: null });
  },
  play: (cardId) => {
    if (!get().playSelectMode) {
      set({ error: 'Arm Play card before choosing a card.' });
      return;
    }
    const res = playCard(get().library, get().state, cardId);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({ state: res.state, error: null, playSelectMode: false });
  },
  draw: () => {
    const res = drawCard(get().library, get().state);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({ state: res.state, error: null, playSelectMode: false });
  },
  gain: (resource) => {
    const res = gainResource(get().library, get().state, resource);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({ state: res.state, error: null, playSelectMode: false });
  },
  reset: () => {
    set({ state: createInitialState(), error: null, playSelectMode: false });
  },
}));
