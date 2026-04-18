import {
  applyResourceDelta,
  applyStatEffects,
  clampResourcesNonNegative,
  type GameEvent,
  type GameState,
  type PlayerStats,
  type ScheduledEffect,
} from '@all-according-to-plan/shared';
import { applyInstabilityDrift } from './decay';
import { drawUntilHandSize, HAND_SIZE } from './state';

const MOCK_EVENTS: GameEvent[] = [
  {
    id: 'mock_event_1',
    title: 'Event 1',
    description: 'Rations tighten. Security forces requisition stores while ministries blame foreign sabotage.',
    severity: 'medium',
    effects: {
      people: { satisfaction: -1, loyalty: 0, fear: 1 },
      elites: { satisfaction: -1, loyalty: 0, fear: 0 },
      security: { satisfaction: 1, loyalty: 0, fear: 0 },
    },
    resources: { money: -1 },
  },
  {
    id: 'mock_event_2',
    title: 'Event 2',
    description: 'Black-market whispers spike. Elite donors demand quiet payoffs and backstage guarantees.',
    severity: 'high',
    effects: {
      people: { satisfaction: 0, loyalty: -1, fear: 1 },
      elites: { satisfaction: 1, loyalty: -1, fear: 1 },
      security: { satisfaction: 0, loyalty: 0, fear: 1 },
    },
    resources: { influence: -1 },
  },
  {
    id: 'mock_event_3',
    title: 'Event 3',
    description: 'A loyalty rally backfires. Crowds cheer on camera while suspicion spreads off-screen.',
    severity: 'low',
    effects: {
      people: { satisfaction: 1, loyalty: 1, fear: 0 },
      elites: { satisfaction: 0, loyalty: -1, fear: 0 },
      security: { satisfaction: -1, loyalty: 0, fear: 0 },
    },
  },
];

export function applyDueScheduled(
  stats: PlayerStats,
  scheduled: ScheduledEffect[],
  round: number
): { stats: PlayerStats; scheduled: ScheduledEffect[] } {
  let nextStats = stats;
  const remaining: ScheduledEffect[] = [];
  for (const item of scheduled) {
    if (item.firesAtRound === round) {
      nextStats = applyStatEffects(nextStats, item.effects);
    } else {
      remaining.push(item);
    }
  }
  return { stats: nextStats, scheduled: remaining };
}

export function resolveRoundEnd(state: GameState): GameState {
  if (state.phase === 'game_over') {
    return state;
  }
  const currentRound = state.round;
  const ev = MOCK_EVENTS[(currentRound - 1) % MOCK_EVENTS.length];
  if (!ev) {
    return state;
  }
  let stats = applyStatEffects(state.stats, ev.effects);
  let resources = state.resources;
  if (ev.resources) {
    resources = clampResourcesNonNegative(applyResourceDelta(resources, ev.resources));
  }
  stats = applyInstabilityDrift(stats);
  const historyEntry = {
    round: currentRound,
    eventId: ev.id,
    title: ev.title,
    description: ev.description,
  };
  const baseLog = [...state.log, `Round ${currentRound} event: ${ev.title}`];
  if (currentRound >= state.maxRounds) {
    return {
      ...state,
      stats,
      resources,
      phase: 'game_over',
      playerActionsUsed: 0,
      cardsPlayedThisRound: [],
      eventHistory: [...state.eventHistory, historyEntry],
      lastResolvedEvent: {
        round: currentRound,
        eventId: ev.id,
        title: ev.title,
        description: ev.description,
      },
      activeEventIds: [...state.activeEventIds, ev.id],
      scheduledEffects: [],
      log: [...baseLog, 'Campaign concluded.'],
    };
  }
  const nextRound = currentRound + 1;
  const applied = applyDueScheduled(stats, state.scheduledEffects, nextRound);
  const drawn = drawUntilHandSize(state.hand, state.deck, HAND_SIZE);
  return {
    ...state,
    round: nextRound,
    playerActionsUsed: 0,
    cardsPlayedThisRound: [],
    stats: applied.stats,
    resources,
    hand: drawn.hand,
    deck: drawn.deck,
    eventHistory: [...state.eventHistory, historyEntry],
    lastResolvedEvent: {
      round: currentRound,
      eventId: ev.id,
      title: ev.title,
      description: ev.description,
    },
    activeEventIds: [...state.activeEventIds, ev.id],
    scheduledEffects: applied.scheduled,
    log: baseLog,
  };
}
