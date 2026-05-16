import type { GameState, GroupStats, PlayerStats, Resources, ScheduledEffect } from '@all-according-to-plan/shared';

export type RoundSnapshot = {
  hand: string[];
  deck: string[];
  deckDiscard: string[];
  resources: Resources;
  stats: PlayerStats;
  playerActionsUsed: number;
  activeAssets: string[];
  playedCardIds: string[];
  cardsPlayedThisRound: string[];
  scheduledEffects: ScheduledEffect[];
  reshuffleCount: number;
  lastDeckAction: GameState['lastDeckAction'];
};

function cloneGroup(g: GroupStats): GroupStats {
  return { satisfaction: g.satisfaction, loyalty: g.loyalty, fear: g.fear };
}

export function captureRoundSnapshot(state: GameState): RoundSnapshot {
  return {
    hand: [...state.hand],
    deck: [...state.deck],
    deckDiscard: [...state.deckDiscard],
    resources: { ...state.resources },
    stats: {
      people: cloneGroup(state.stats.people),
      elites: cloneGroup(state.stats.elites),
      security: cloneGroup(state.stats.security),
    },
    playerActionsUsed: state.playerActionsUsed,
    activeAssets: [...state.activeAssets],
    playedCardIds: [...state.playedCardIds],
    cardsPlayedThisRound: [...state.cardsPlayedThisRound],
    scheduledEffects: state.scheduledEffects.map((s) => ({
      firesAtRound: s.firesAtRound,
      effects: {
        people: { ...s.effects.people },
        elites: { ...s.effects.elites },
        security: { ...s.effects.security },
      },
    })),
    reshuffleCount: state.reshuffleCount,
    lastDeckAction: state.lastDeckAction,
  };
}

export function applyRoundSnapshot(state: GameState, snap: RoundSnapshot): GameState {
  return {
    ...state,
    phase: 'player',
    hand: [...snap.hand],
    deck: [...snap.deck],
    deckDiscard: [...snap.deckDiscard],
    resources: { ...snap.resources },
    stats: {
      people: cloneGroup(snap.stats.people),
      elites: cloneGroup(snap.stats.elites),
      security: cloneGroup(snap.stats.security),
    },
    playerActionsUsed: snap.playerActionsUsed,
    activeAssets: [...snap.activeAssets],
    playedCardIds: [...snap.playedCardIds],
    cardsPlayedThisRound: [...snap.cardsPlayedThisRound],
    scheduledEffects: snap.scheduledEffects.map((s) => ({
      firesAtRound: s.firesAtRound,
      effects: {
        people: { ...s.effects.people },
        elites: { ...s.effects.elites },
        security: { ...s.effects.security },
      },
    })),
    reshuffleCount: snap.reshuffleCount,
    lastDeckAction: snap.lastDeckAction,
    pendingEvent: null,
    pendingChoiceId: null,
    diceResult: null,
    eventStep: 'idle',
    lastOutcomeSummary: null,
    statChangesPreview: null,
    resourceChangesPreview: null,
  };
}

export function canResetRound(state: GameState): boolean {
  return state.phase === 'player' && state.playerActionsUsed > 0;
}
