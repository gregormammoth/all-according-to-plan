import {
  acknowledgePendingEvent,
  createInitialState,
  drawCard,
  gainResource,
  getDefaultLibrary,
  playCard,
  type CardLibrary,
} from '@all-according-to-plan/game-engine';
import type { GameEvent, GameState, ResourceType } from '@all-according-to-plan/shared';
import { create } from 'zustand';

type EventModalState = {
  isOpen: boolean;
  event: GameEvent | null;
};

function eventModalFromGameState(state: GameState): EventModalState {
  if (state.phase === 'event_modal' && state.pendingEvent) {
    return { isOpen: true, event: state.pendingEvent };
  }
  return { isOpen: false, event: null };
}

type GameStore = {
  state: GameState;
  library: CardLibrary;
  error: string | null;
  playSelectMode: boolean;
  eventModal: EventModalState;
  togglePlaySelectMode: () => void;
  play: (cardId: string) => void;
  draw: () => void;
  gain: (resource: ResourceType) => void;
  acknowledgeEvent: () => void;
  reset: () => void;
};

const initialModal: EventModalState = { isOpen: false, event: null };

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),
  library: getDefaultLibrary(),
  error: null,
  playSelectMode: false,
  eventModal: initialModal,
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
    set({
      state: res.state,
      error: null,
      playSelectMode: false,
      eventModal: eventModalFromGameState(res.state),
    });
  },
  draw: () => {
    const res = drawCard(get().library, get().state);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({
      state: res.state,
      error: null,
      playSelectMode: false,
      eventModal: eventModalFromGameState(res.state),
    });
  },
  gain: (resource) => {
    const res = gainResource(get().library, get().state, resource);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({
      state: res.state,
      error: null,
      playSelectMode: false,
      eventModal: eventModalFromGameState(res.state),
    });
  },
  acknowledgeEvent: () => {
    const res = acknowledgePendingEvent(get().state);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({
      state: res.state,
      error: null,
      eventModal: eventModalFromGameState(res.state),
      playSelectMode: false,
    });
  },
  reset: () => {
    set({
      state: createInitialState(),
      error: null,
      playSelectMode: false,
      eventModal: initialModal,
    });
  },
}));
