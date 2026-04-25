import {
  applyResourceDelta,
  applyStatEffects,
  clampResourcesNonNegative,
  clampStats,
  MAX_HAND_CARDS,
  type DiceResult,
  type EventChoice,
  type GameEvent,
  type GameState,
  type Outcome,
  type PlayerStats,
  type ScheduledEffect,
} from '@all-according-to-plan/shared';
import { drawOneCard } from './deck';
import { applyInstabilityDrift } from './decay';
import { deterministicRollPercent } from './rng';

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
    choices: [
      {
        id: 'deploy_militia',
        text: 'Deploy militia and enforce curfew',
        probability: { success: 45, partial: 35, failure: 20 },
        outcomes: {
          success: {
            statDeltas: { people: { fear: 1 }, security: { loyalty: 1, satisfaction: 1 } },
            resourceDeltas: { money: -1 },
          },
          partial: {
            statDeltas: {
              people: { fear: 2, satisfaction: -1 },
              elites: { loyalty: -1 },
              security: { loyalty: 1 },
            },
            resourceDeltas: { money: -2 },
          },
          failure: {
            statDeltas: {
              people: { fear: 3, satisfaction: -2, loyalty: -1 },
              elites: { loyalty: -1, fear: 1 },
              security: { loyalty: -1 },
            },
            resourceDeltas: { money: -3, authority: -1 },
          },
        },
      },
      {
        id: 'negotiate_unions',
        text: 'Negotiate with labor councils',
        probability: { success: 35, partial: 40, failure: 25 },
        outcomes: {
          success: {
            statDeltas: {
              people: { satisfaction: 2, loyalty: 1, fear: -1 },
              elites: { satisfaction: 1 },
            },
            resourceDeltas: { money: -1, influence: -1 },
          },
          partial: {
            statDeltas: { people: { satisfaction: 1 }, elites: { loyalty: -1 }, security: { fear: 1 } },
            resourceDeltas: { money: -1, influence: -1 },
          },
          failure: {
            statDeltas: {
              people: { fear: 2, loyalty: -1 },
              elites: { satisfaction: -1 },
              security: { fear: 1 },
            },
            resourceDeltas: { money: -2, influence: -1 },
          },
        },
      },
    ],
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
    choices: [
      {
        id: 'pay_elites',
        text: 'Fund elite patronage network',
        probability: { success: 50, partial: 30, failure: 20 },
        outcomes: {
          success: {
            statDeltas: { elites: { loyalty: 2, satisfaction: 1 }, people: { fear: -1 } },
            resourceDeltas: { money: -2 },
          },
          partial: {
            statDeltas: { elites: { loyalty: 1 }, people: { loyalty: -1 }, security: { fear: 1 } },
            resourceDeltas: { money: -2, influence: -1 },
          },
          failure: {
            statDeltas: { elites: { loyalty: -1 }, people: { fear: 1 }, security: { loyalty: -1 } },
            resourceDeltas: { money: -3, influence: -1 },
          },
        },
      },
      {
        id: 'crackdown_smuggling',
        text: 'Launch anti-smuggling crackdown',
        probability: { success: 40, partial: 35, failure: 25 },
        outcomes: {
          success: {
            statDeltas: { security: { loyalty: 2 }, people: { fear: 1 }, elites: { fear: 1 } },
            resourceDeltas: { influence: 1 },
          },
          partial: {
            statDeltas: { security: { loyalty: 1 }, people: { fear: 2 }, elites: { loyalty: -1 } },
            resourceDeltas: { authority: -1 },
          },
          failure: {
            statDeltas: { security: { loyalty: -1 }, people: { satisfaction: -1, fear: 2 }, elites: { loyalty: -1 } },
            resourceDeltas: { influence: -1, authority: -1 },
          },
        },
      },
    ],
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
    choices: [
      {
        id: 'double_down_propaganda',
        text: 'Double down on propaganda broadcasts',
        probability: { success: 42, partial: 38, failure: 20 },
        outcomes: {
          success: {
            statDeltas: { people: { loyalty: 2, satisfaction: 1 }, elites: { fear: 1 } },
            resourceDeltas: { money: -1, influence: -1 },
          },
          partial: {
            statDeltas: { people: { loyalty: 1 }, elites: { loyalty: -1 }, security: { satisfaction: 1 } },
            resourceDeltas: { money: -1, influence: -1 },
          },
          failure: {
            statDeltas: { people: { satisfaction: -1, fear: 1 }, elites: { loyalty: -1 }, security: { fear: 1 } },
            resourceDeltas: { money: -2, influence: -1 },
          },
        },
      },
      {
        id: 'permit_small_dissent',
        text: 'Permit controlled dissent to release pressure',
        probability: { success: 30, partial: 45, failure: 25 },
        outcomes: {
          success: {
            statDeltas: { people: { satisfaction: 2, fear: -1 }, elites: { satisfaction: 1 } },
            resourceDeltas: { influence: 1 },
          },
          partial: {
            statDeltas: { people: { satisfaction: 1 }, security: { loyalty: -1 }, elites: { fear: 1 } },
            resourceDeltas: {},
          },
          failure: {
            statDeltas: { people: { fear: 2 }, elites: { loyalty: -1 }, security: { loyalty: -1, fear: 1 } },
            resourceDeltas: { authority: -1 },
          },
        },
      },
    ],
  },
];

export type EventAckResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string };

type EventProgressResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string };

function getDefaultChoice(ev: GameEvent): EventChoice {
  return {
    id: 'default_response',
    text: 'Acknowledge and respond with standard protocol',
    probability: { success: 33, partial: 34, failure: 33 },
    outcomes: {
      success: {
        statDeltas: ev.effects,
        resourceDeltas: ev.resources ?? {},
      },
      partial: {
        statDeltas: ev.effects,
        resourceDeltas: ev.resources ?? {},
      },
      failure: {
        statDeltas: ev.effects,
        resourceDeltas: ev.resources ?? {},
      },
    },
  };
}

function getEventChoice(ev: GameEvent, choiceId: string): EventChoice | null {
  const all = ev.choices?.length ? ev.choices : [getDefaultChoice(ev)];
  return all.find((c) => c.id === choiceId) ?? null;
}

function thresholdsFromChoice(choice: EventChoice): { success: number; partial: number } {
  const p = choice.probability ?? { success: 33, partial: 34, failure: 33 };
  const success = Math.max(0, Math.min(100, p.success));
  const partial = Math.max(0, Math.min(100 - success, p.partial));
  return { success, partial };
}

function pickOutcome(choice: EventChoice, dice: DiceResult): { label: string; outcome: Outcome } {
  if (dice.outcomeType === 'success') {
    return { label: 'Success', outcome: choice.outcomes.success };
  }
  if (dice.outcomeType === 'partial_success') {
    return { label: 'Partial success', outcome: choice.outcomes.partial };
  }
  return { label: 'Failure', outcome: choice.outcomes.failure };
}

function applyOutcomeStats(stats: PlayerStats, deltas: Outcome['statDeltas']): PlayerStats {
  const next: PlayerStats = {
    people: { ...stats.people },
    elites: { ...stats.elites },
    security: { ...stats.security },
  };
  for (const key of Object.keys(deltas) as Array<'people' | 'elites' | 'security'>) {
    const block = deltas[key];
    if (!block) continue;
    next[key] = {
      satisfaction: next[key].satisfaction + (block.satisfaction ?? 0),
      loyalty: next[key].loyalty + (block.loyalty ?? 0),
      fear: next[key].fear + (block.fear ?? 0),
    };
  }
  return clampStats(next);
}

function isFailureState(stats: PlayerStats): boolean {
  return (
    stats.people.satisfaction <= 0 &&
    stats.elites.satisfaction <= 0 &&
    stats.security.satisfaction <= 0
  );
}

function calculateEndScore(stats: PlayerStats, resources: GameState['resources']): number {
  const remainingResources = resources.money + resources.influence + resources.authority;
  const score =
    stats.people.satisfaction * 2 +
    stats.elites.loyalty * 2 +
    stats.security.fear +
    remainingResources;
  return Math.round(score);
}

function stabilityIndex(stats: PlayerStats): number {
  const groups: Array<keyof PlayerStats> = ['people', 'elites', 'security'];
  let total = 0;
  for (const key of groups) {
    const g = stats[key];
    total += ((g.satisfaction + g.loyalty - g.fear + 20) / 30) * 100;
  }
  return Math.round(total / groups.length);
}

function computeGameResult(stats: PlayerStats, resources: GameState['resources']): GameState['gameResult'] {
  const score = calculateEndScore(stats, resources);
  if (isFailureState(stats)) {
    return {
      type: 'failure',
      score,
      summaryText: 'The state collapsed under internal pressure.',
    };
  }
  const stable = stabilityIndex(stats);
  if (stable >= 62) {
    return {
      type: 'victory',
      score,
      summaryText: 'Your rule stands firm and unchallenged.',
    };
  }
  return {
    type: 'survival',
    score,
    summaryText: 'You held control, but cracks remain.',
  };
}

function computeFinalSnapshot(
  stats: PlayerStats,
  resources: GameState['resources'],
  state: GameState
): GameState['finalStatsSnapshot'] {
  return {
    stats,
    resources,
    totalCardsPlayed: state.playedCardIds.length,
    totalEvents: state.eventHistory.length + 1,
  };
}

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
  if (state.phase !== 'player') return state;
  if (state.playerActionsUsed < state.maxPlayerActionsPerRound) return state;
  const ev = MOCK_EVENTS[(state.round - 1) % MOCK_EVENTS.length];
  if (!ev) return state;
  return {
    ...state,
    phase: 'event_modal',
    pendingEvent: ev,
    pendingChoiceId: null,
    diceResult: null,
    eventStep: 'choice',
    lastOutcomeSummary: null,
    statChangesPreview: null,
    resourceChangesPreview: null,
    log: [...state.log, `Round ${state.round}: ${ev.title} — choose response`],
  };
}

export function chooseEventChoice(state: GameState, choiceId: string): EventProgressResult {
  if (state.phase !== 'event_modal' || !state.pendingEvent) {
    return { ok: false, error: 'No event is awaiting choice.' };
  }
  if (state.eventStep !== 'choice') {
    return { ok: false, error: 'Choice is not available at this step.' };
  }
  const choice = getEventChoice(state.pendingEvent, choiceId);
  if (!choice) {
    return { ok: false, error: 'Unknown event choice.' };
  }
  return {
    ok: true,
    state: {
      ...state,
      pendingChoiceId: choiceId,
      eventStep: 'rolling',
      log: [...state.log, `Round ${state.round}: selected "${choice.text}"`],
    },
  };
}

export function rollPendingEvent(state: GameState): EventProgressResult {
  if (state.phase !== 'event_modal' || !state.pendingEvent) {
    return { ok: false, error: 'No event is awaiting roll.' };
  }
  if (state.eventStep !== 'rolling') {
    return { ok: false, error: 'Dice can only be rolled during rolling step.' };
  }
  if (!state.pendingChoiceId) {
    return { ok: false, error: 'No selected choice to roll.' };
  }
  if (state.diceResult) {
    return { ok: false, error: 'Dice already rolled for this event.' };
  }
  const choice = getEventChoice(state.pendingEvent, state.pendingChoiceId);
  if (!choice) {
    return { ok: false, error: 'Unknown selected choice.' };
  }
  const threshold = thresholdsFromChoice(choice);
  const roll = deterministicRollPercent(state.gameSeed, state.round, state.pendingChoiceId);
  const outcomeType: DiceResult['outcomeType'] =
    roll <= threshold.success
      ? 'success'
      : roll <= threshold.success + threshold.partial
        ? 'partial_success'
        : 'failure';
  const diceResult: DiceResult = {
    roll,
    threshold,
    outcomeType,
  };
  const picked = pickOutcome(choice, diceResult);
  return {
    ok: true,
    state: {
      ...state,
      diceResult,
      eventStep: 'revealed',
      lastOutcomeSummary: picked.label,
      statChangesPreview: picked.outcome.statDeltas,
      resourceChangesPreview: picked.outcome.resourceDeltas,
      log: [...state.log, `Round ${state.round}: dice ${roll} -> ${picked.label.toLowerCase()}`],
    },
  };
}

export function applyRevealedOutcome(state: GameState): EventProgressResult {
  if (state.phase !== 'event_modal' || !state.pendingEvent) {
    return { ok: false, error: 'No event is awaiting outcome application.' };
  }
  if (state.eventStep !== 'revealed') {
    return { ok: false, error: 'Outcome can only be applied after reveal.' };
  }
  if (!state.diceResult || !state.pendingChoiceId) {
    return { ok: false, error: 'Missing choice or dice result.' };
  }
  if (!state.statChangesPreview || !state.resourceChangesPreview) {
    return { ok: false, error: 'Missing outcome preview.' };
  }
  const stats = applyOutcomeStats(state.stats, state.statChangesPreview);
  const resources = clampResourcesNonNegative(
    applyResourceDelta(state.resources, state.resourceChangesPreview)
  );
  return {
    ok: true,
    state: {
      ...state,
      stats,
      resources,
      eventStep: 'applied',
      log: [...state.log, `Round ${state.round}: outcome applied`],
    },
  };
}

export function continueAfterAppliedEvent(state: GameState): EventAckResult {
  if (state.phase !== 'event_modal' || !state.pendingEvent) {
    return { ok: false, error: 'No event is awaiting continue.' };
  }
  if (state.eventStep !== 'applied') {
    return { ok: false, error: 'Cannot continue before outcome is applied.' };
  }
  const currentRound = state.round;
  const ev = state.pendingEvent;
  const stats = applyInstabilityDrift(state.stats);
  const bonus = drawOneCard(state.hand, state.deck, state.deckDiscard, MAX_HAND_CARDS, {
    gameSeed: state.gameSeed,
    round: state.round,
    reshuffleCount: state.reshuffleCount,
  });
  const resources = clampResourcesNonNegative(applyResourceDelta(state.resources, { money: 1 }));
  const historyEntry = {
    round: currentRound,
    eventId: ev.id,
    title: ev.title,
    description: ev.description,
    outcomeLabel: state.lastOutcomeSummary ?? undefined,
  };
  const logParts = [
    ...state.log,
    ...(bonus.reshuffled ? [`End round ${currentRound}: deck reshuffled`] : []),
    `End round ${currentRound}: upkeep drew ${bonus.drewId ? 'a card' : 'nothing'}${
      bonus.burned ? ' (burned, hand full)' : ''
    }`,
    `End round ${currentRound}: upkeep +1 money`,
  ];
  if (currentRound >= state.maxRounds || isFailureState(stats)) {
    const gameResult = computeGameResult(stats, resources);
    const finalStatsSnapshot = computeFinalSnapshot(stats, resources, state);
    return {
      ok: true,
      state: {
        ...state,
        hand: bonus.hand,
        deck: bonus.deck,
        deckDiscard: bonus.discard,
        reshuffleCount: bonus.reshuffleCount,
        lastDeckAction: bonus.lastDeckAction,
        stats,
        resources,
        phase: 'game_over',
        pendingEvent: null,
        pendingChoiceId: null,
        diceResult: null,
        eventStep: 'idle',
        playerActionsUsed: 0,
        cardsPlayedThisRound: [],
        eventHistory: [...state.eventHistory, historyEntry],
        lastResolvedEvent: historyEntry,
        activeEventIds: [...state.activeEventIds, ev.id],
        scheduledEffects: [],
        gameResult,
        finalStatsSnapshot,
        statChangesPreview: null,
        resourceChangesPreview: null,
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
      pendingChoiceId: null,
      diceResult: null,
      eventStep: 'idle',
      playerActionsUsed: 0,
      cardsPlayedThisRound: [],
      stats: applied.stats,
      resources,
      hand: bonus.hand,
      deck: bonus.deck,
      deckDiscard: bonus.discard,
      reshuffleCount: bonus.reshuffleCount,
      lastDeckAction: bonus.lastDeckAction,
      eventHistory: [...state.eventHistory, historyEntry],
      lastResolvedEvent: historyEntry,
      activeEventIds: [...state.activeEventIds, ev.id],
      scheduledEffects: applied.scheduled,
      gameResult: null,
      finalStatsSnapshot: null,
      statChangesPreview: null,
      resourceChangesPreview: null,
      log: logParts,
    },
  };
}
