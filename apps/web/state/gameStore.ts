import {
  applyRevealedOutcome,
  chooseEventChoice,
  continueAfterAppliedEvent,
  createInitialState,
  drawCard,
  gainResource,
  getDefaultLibrary,
  playCard,
  rollPendingEvent,
  type CardLibrary,
} from '@all-according-to-plan/game-engine';
import type { GameEvent, GameState, ResourceType } from '@all-according-to-plan/shared';
import { create } from 'zustand';
import { getAudioManager } from '@/audio/AudioManager';
import {
  applyRoundSnapshot,
  canResetRound,
  captureRoundSnapshot,
  type RoundSnapshot,
} from './roundSnapshot';

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

function afterPlayerPhaseTransition(state: GameState) {
  return {
    state,
    eventModal: eventModalFromGameState(state),
  };
}

type GameStore = {
  state: GameState;
  library: CardLibrary;
  error: string | null;
  playSelectMode: boolean;
  eventModal: EventModalState;
  roundSnapshot: RoundSnapshot | null;
  togglePlaySelectMode: () => void;
  play: (cardId: string) => void;
  draw: () => void;
  gain: (resource: ResourceType) => void;
  selectEventChoice: (choiceId: string) => void;
  rollEvent: () => void;
  applyEventOutcome: () => void;
  continueEvent: () => void;
  resetRound: () => void;
  reset: () => void;
};

const initialModal: EventModalState = { isOpen: false, event: null };
const initialState = createInitialState();
const initialSnapshot = captureRoundSnapshot(initialState);

export const useGameStore = create<GameStore>((set, get) => ({
  state: initialState,
  library: getDefaultLibrary(),
  error: null,
  playSelectMode: false,
  eventModal: initialModal,
  roundSnapshot: initialSnapshot,
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
      ...afterPlayerPhaseTransition(res.state),
      error: null,
      playSelectMode: false,
    });
  },
  draw: () => {
    const res = drawCard(get().library, get().state);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({
      ...afterPlayerPhaseTransition(res.state),
      error: null,
      playSelectMode: false,
    });
  },
  gain: (resource) => {
    const res = gainResource(get().library, get().state, resource);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({
      ...afterPlayerPhaseTransition(res.state),
      error: null,
      playSelectMode: false,
    });
  },
  selectEventChoice: (choiceId) => {
    const res = chooseEventChoice(get().state, choiceId);
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
  rollEvent: () => {
    const res = rollPendingEvent(get().state);
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
  applyEventOutcome: () => {
    const res = applyRevealedOutcome(get().state);
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
  continueEvent: () => {
    const res = continueAfterAppliedEvent(get().library, get().state);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    const nextSnapshot =
      res.state.phase === 'player' ? captureRoundSnapshot(res.state) : get().roundSnapshot;
    set({
      state: res.state,
      error: null,
      eventModal: eventModalFromGameState(res.state),
      playSelectMode: false,
      roundSnapshot: nextSnapshot,
    });
  },
  resetRound: () => {
    const { state, roundSnapshot } = get();
    if (!canResetRound(state)) {
      set({ error: 'Cannot reset cycle after directive phase or with no actions spent.' });
      return;
    }
    if (!roundSnapshot) {
      set({ error: 'No cycle snapshot available.' });
      return;
    }
    set({
      state: applyRoundSnapshot(state, roundSnapshot),
      error: null,
      playSelectMode: false,
      eventModal: initialModal,
    });
  },
  reset: () => {
    const state = createInitialState();
    set({
      state,
      error: null,
      playSelectMode: false,
      eventModal: initialModal,
      roundSnapshot: captureRoundSnapshot(state),
    });
    if (getAudioManager().isUnlocked()) {
      getAudioManager().exitGameOverMode();
      void getAudioManager().restartGameplayBed();
    }
  },
}));

export function selectCanResetRound(state: GameState): boolean {
  return canResetRound(state);
}
