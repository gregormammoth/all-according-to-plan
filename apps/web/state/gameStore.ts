import {
  applyCrisisResolution,
  applyRevealedOutcome,
  beginEventModal,
  chooseEventChoice,
  continueAfterAppliedEvent,
  createInitialState,
  drawCard,
  gainResource,
  getDefaultCrisisLibrary,
  getDefaultLibrary,
  playCard,
  rollCrisisTestAction,
  rollPendingEvent,
  startCrisisResolve,
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

type CrisisModalState = {
  isOpen: boolean;
  crisisId: string | null;
};

function crisisModalFromGameState(state: GameState): CrisisModalState {
  if (state.phase === 'crisis_modal' && state.pendingCrisisId) {
    return { isOpen: true, crisisId: state.pendingCrisisId };
  }
  return { isOpen: false, crisisId: null };
}

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
    crisisModal: crisisModalFromGameState(state),
  };
}

type GameStore = {
  state: GameState;
  library: CardLibrary;
  crisisLibrary: CrisisLibrary;
  error: string | null;
  eventModal: EventModalState;
  crisisModal: CrisisModalState;
  roundSnapshot: RoundSnapshot | null;
  play: (cardId: string) => void;
  draw: () => void;
  gain: (resource: ResourceType) => void;
  startCrisisResolve: (crisisId: string) => void;
  rollCrisisTest: () => void;
  applyCrisisOutcome: () => void;
  endTurn: () => void;
  selectEventChoice: (choiceId: string) => void;
  rollEvent: () => void;
  applyEventOutcome: () => void;
  continueEvent: () => void;
  resetRound: () => void;
  reset: () => void;
};

const initialModal: EventModalState = { isOpen: false, event: null };
const initialCrisisModal: CrisisModalState = { isOpen: false, crisisId: null };
const initialState = createInitialState();
const initialSnapshot = captureRoundSnapshot(initialState);

export const useGameStore = create<GameStore>((set, get) => ({
  state: initialState,
  library: getDefaultLibrary(),
  crisisLibrary: getDefaultCrisisLibrary(),
  error: null,
  eventModal: initialModal,
  crisisModal: initialCrisisModal,
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
  startCrisisResolve: (crisisId) => {
    const res = startCrisisResolve(get().library, get().crisisLibrary, get().state, crisisId);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({
      ...afterPlayerPhaseTransition(res.state),
      error: null,
    });
  },
  rollCrisisTest: () => {
    const res = rollCrisisTestAction(get().crisisLibrary, get().state);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({
      state: res.state,
      crisisModal: crisisModalFromGameState(res.state),
      error: null,
    });
  },
  applyCrisisOutcome: () => {
    const res = applyCrisisResolution(get().library, get().crisisLibrary, get().state);
    if (!res.ok) {
      set({ error: res.error });
      return;
    }
    set({
      ...afterPlayerPhaseTransition(res.state),
      error: null,
    });
  },
  endTurn: () => {
    const current = get().state;
    if (current.phase !== 'player') {
      set({ error: 'Cannot end turn outside operations phase.' });
      return;
    }
    if (current.playerActionsUsed === 0) {
      set({ error: 'Take at least one action before ending the turn.' });
      return;
    }
    const primed =
      current.playerActionsUsed >= current.maxPlayerActionsPerRound
        ? current
        : { ...current, playerActionsUsed: current.maxPlayerActionsPerRound };
    const next = beginEventModal(primed);
    set({
      ...afterPlayerPhaseTransition(next),
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
      crisisModal: crisisModalFromGameState(res.state),
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
      crisisModal: initialCrisisModal,
    });
  },
  reset: () => {
    const state = createInitialState();
    set({
      state,
      error: null,
      eventModal: initialModal,
      crisisModal: initialCrisisModal,
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
