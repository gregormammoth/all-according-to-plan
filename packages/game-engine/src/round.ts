import {
  applyResourceDelta,
  applyStatEffects,
  clampResourcesNonNegative,
  MAX_HAND_CARDS,
  type GameEvent,
  type GameState,
  type PlayerStats,
  type ScheduledEffect,
} from '@all-according-to-plan/shared';
import { drawOneCard } from './deck';
import { applyInstabilityDrift } from './decay';

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

export function endRound(state: GameState): GameState {
  if (state.phase === 'game_over') {
    return state;
  }
  const bonus = drawOneCard(state.hand, state.deck, state.deckDiscard, MAX_HAND_CARDS);
  let hand = bonus.hand;
  let deck = bonus.deck;
  let deckDiscard = bonus.discard;
  let resources = clampResourcesNonNegative(applyResourceDelta(state.resources, { money: 1 }));
  const currentRound = state.round;
  const ev = MOCK_EVENTS[(currentRound - 1) % MOCK_EVENTS.length];
  if (!ev) {
    return state;
  }
  let stats = applyStatEffects(state.stats, ev.effects);
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
  const logParts = [
    ...state.log,
    `End round ${currentRound}: upkeep drew ${bonus.drewId ? 'a card' : 'nothing'}${
      bonus.burned ? ' (burned, hand full)' : ''
    }`,
    `End round ${currentRound}: upkeep +1 money`,
    `Round ${currentRound} event: ${ev.title}`,
  ];
  if (currentRound >= state.maxRounds) {
    return {
      ...state,
      hand,
      deck,
      deckDiscard,
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
      log: [...logParts, 'Campaign concluded.'],
    };
  }
  const nextRound = currentRound + 1;
  const applied = applyDueScheduled(stats, state.scheduledEffects, nextRound);
  return {
    ...state,
    round: nextRound,
    playerActionsUsed: 0,
    cardsPlayedThisRound: [],
    stats: applied.stats,
    resources,
    hand,
    deck,
    deckDiscard,
    eventHistory: [...state.eventHistory, historyEntry],
    lastResolvedEvent: {
      round: currentRound,
      eventId: ev.id,
      title: ev.title,
      description: ev.description,
    },
    activeEventIds: [...state.activeEventIds, ev.id],
    scheduledEffects: applied.scheduled,
    log: logParts,
  };
}
