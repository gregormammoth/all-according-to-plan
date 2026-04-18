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
    title: 'Riot in Capital',
    description:
      'Public unrest has erupted due to instability. Ministries scramble to assign blame while security cordons key districts.',
    severity: 'high',
    condition: 'Triggers when satisfaction tracking is contested and fear is already elevated.',
    outcomePreview: {
      success: 'Crowds disperse after limited damage. Fear rises but the treasury mostly holds.',
      failure: 'Widespread damage; elites withdraw support and security demands emergency powers.',
    },
    effects: {
      people: { satisfaction: -1, loyalty: 0, fear: 1 },
      elites: { satisfaction: -1, loyalty: 0, fear: 0 },
      security: { satisfaction: 1, loyalty: 0, fear: 0 },
    },
    resources: { money: -2 },
  },
  {
    id: 'mock_event_2',
    title: 'Black-market whispers',
    description: 'Elite donors demand quiet payoffs and backstage guarantees as contraband routes widen.',
    severity: 'high',
    condition: 'If influence networks are thin, back-channel leverage collapses faster.',
    outcomePreview: {
      success: 'Quiet envelopes move; scandal stays off the front page for another week.',
      failure: 'Leaks multiply; influence bleeds out of the capital and into rival hands.',
    },
    effects: {
      people: { satisfaction: 0, loyalty: -1, fear: 1 },
      elites: { satisfaction: 1, loyalty: -1, fear: 1 },
      security: { satisfaction: 0, loyalty: 0, fear: 1 },
    },
    resources: { influence: -1 },
  },
  {
    id: 'mock_event_3',
    title: 'Loyalty rally backfires',
    description: 'Crowds cheer on camera while suspicion spreads off-screen about who staged the spectacle.',
    severity: 'low',
    condition: 'If staged unity events outpace organic morale, optics can invert sharply.',
    outcomePreview: {
      success: 'The rally reads as authentic enough; security stands down without incident.',
      failure: 'Footage circulates out of context; elites read the rally as a threat to their autonomy.',
    },
    effects: {
      people: { satisfaction: 1, loyalty: 1, fear: 0 },
      elites: { satisfaction: 0, loyalty: -1, fear: 0 },
      security: { satisfaction: -1, loyalty: 0, fear: 0 },
    },
  },
];

export type EventAckResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string };

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

export function beginEventModal(state: GameState): GameState {
  if (state.phase === 'game_over') {
    return state;
  }
  if (state.phase !== 'player') {
    return state;
  }
  if (state.playerActionsUsed < state.maxPlayerActionsPerRound) {
    return state;
  }
  const currentRound = state.round;
  const ev = MOCK_EVENTS[(currentRound - 1) % MOCK_EVENTS.length];
  if (!ev) {
    return state;
  }
  return {
    ...state,
    phase: 'event_modal',
    pendingEvent: ev,
    log: [...state.log, `Round ${currentRound}: ${ev.title} — awaiting your response`],
  };
}

export function acknowledgePendingEvent(state: GameState): EventAckResult {
  if (state.phase !== 'event_modal' || !state.pendingEvent) {
    return { ok: false, error: 'No event is awaiting acknowledgment.' };
  }
  const ev = state.pendingEvent;
  const currentRound = state.round;
  let stats = applyStatEffects(state.stats, ev.effects);
  let resources = state.resources;
  if (ev.resources) {
    resources = clampResourcesNonNegative(applyResourceDelta(resources, ev.resources));
  }
  stats = applyInstabilityDrift(stats);
  const bonus = drawOneCard(state.hand, state.deck, state.deckDiscard, MAX_HAND_CARDS);
  const hand = bonus.hand;
  const deck = bonus.deck;
  const deckDiscard = bonus.discard;
  resources = clampResourcesNonNegative(applyResourceDelta(resources, { money: 1 }));
  const historyEntry = {
    round: currentRound,
    eventId: ev.id,
    title: ev.title,
    description: ev.description,
  };
  const logParts = [
    ...state.log,
    `Round ${currentRound}: acknowledged ${ev.title}`,
    `End round ${currentRound}: upkeep drew ${bonus.drewId ? 'a card' : 'nothing'}${
      bonus.burned ? ' (burned, hand full)' : ''
    }`,
    `End round ${currentRound}: upkeep +1 money`,
  ];
  if (currentRound >= state.maxRounds) {
    return {
      ok: true,
      state: {
        ...state,
        hand,
        deck,
        deckDiscard,
        stats,
        resources,
        phase: 'game_over',
        pendingEvent: null,
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
      },
    };
  }
  const nextRound = currentRound + 1;
  const applied = applyDueScheduled(stats, state.scheduledEffects, nextRound);
  return {
    ok: true,
    state: {
      ...state,
      round: nextRound,
      phase: 'player',
      pendingEvent: null,
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
    },
  };
}
