import {
  applyRevealedOutcome,
  chooseEventChoice,
  continueAfterAppliedEvent,
  createInitialState,
  drawCard,
  gainResource,
  getDefaultCrisisLibrary,
  getDefaultLibrary,
  playCard,
  resolveCrisis,
  rollPendingEvent,
  type CardLibrary,
  type CrisisLibrary,
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
  crisisLibrary: CrisisLibrary;
  error: string | null;
  eventModal: EventModalState;
  roundSnapshot: RoundSnapshot | null;
  play: (cardId: string) => void;
  draw: () => void;
  gain: (resource: ResourceType) => void;
  resolveCrisis: (crisisId: string) => void;
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
  crisisLibrary: getDefaultCrisisLibrary(),
  error: null,
  eventModal: initialModal,
  roundSnapshot: initialSnapshot,
  play: (cardId) => {
    const res = playCard(get().library, get().state, cardId);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({
      ...afterPlayerPhaseTransition(res.state),
      error: null,
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
    });
  },
  resolveCrisis: (crisisId) => {
    const res = resolveCrisis(get().library, get().crisisLibrary, get().state, crisisId);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({
      ...afterPlayerPhaseTransition(res.state),
      error: null,
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
    });
  },
  continueEvent: () => {
    const res = continueAfterAppliedEvent(get().library, get().crisisLibrary, get().state);
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
      eventModal: initialModal,
    });
  },
  reset: () => {
    const state = createInitialState();
    set({
      state,
      error: null,
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
