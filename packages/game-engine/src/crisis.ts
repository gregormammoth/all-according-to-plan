import {
  applyResourceDelta,
  canPay,
  clampResourcesNonNegative,
  clampStats,
  CRISIS_DOOM_THRESHOLD,
  CRISIS_SPAWN_MINOR_MAX,
  CRISIS_SPAWN_NONE_MAX,
  MAX_ACTIVE_CRISES,
  payCost,
  type ActiveCrisis,
  type CrisisSeverity,
  type CrisisTestAttribute,
  type EffectsBundle,
  type GameState,
  type GroupKey,
  type PlayerStats,
} from '@all-according-to-plan/shared';
import { applyRegimeDeltaToState } from './regime';
import { deterministicRollPercent } from './rng';
import type { CrisisLibrary } from './crisis-library';

export type AppliedEffects = {
  stats: PlayerStats;
  resources: GameState['resources'];
  legitimacy: number;
  control: number;
};

function applyPartialStatDeltas(stats: PlayerStats, deltas: EffectsBundle['statDeltas']): PlayerStats {
  if (!deltas) return stats;
  const next: PlayerStats = {
    people: { ...stats.people },
    elites: { ...stats.elites },
    security: { ...stats.security },
  };
  for (const key of Object.keys(deltas) as GroupKey[]) {
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

export function applyEffectsBundle(
  stats: PlayerStats,
  resources: GameState['resources'],
  legitimacy: number,
  control: number,
  bundle?: EffectsBundle
): AppliedEffects {
  if (!bundle) {
    return { stats, resources, legitimacy, control };
  }
  let nextStats = stats;
  if (bundle.statDeltas) {
    nextStats = applyPartialStatDeltas(nextStats, bundle.statDeltas);
  }
  let nextResources = resources;
  if (bundle.resourceDeltas) {
    nextResources = clampResourcesNonNegative(applyResourceDelta(nextResources, bundle.resourceDeltas));
  }
  const tracks = applyRegimeDeltaToState(legitimacy, control, {
    legitimacyDelta: bundle.legitimacyDelta,
    controlDelta: bundle.controlDelta,
  });
  return {
    stats: nextStats,
    resources: nextResources,
    legitimacy: tracks.legitimacy,
    control: tracks.control,
  };
}

export function crisisTestSuccessChance(
  _attribute: CrisisTestAttribute,
  trackValue: number,
  difficulty: number
): number {
  const bonus = Math.max(0, (trackValue - 50) * 2);
  return Math.min(100, Math.max(1, difficulty + bonus));
}

export function rollCrisisTest(
  gameSeed: number,
  round: number,
  crisisId: string,
  attribute: CrisisTestAttribute,
  trackValue: number,
  difficulty: number
): { roll: number; success: boolean; chance: number } {
  const chance = crisisTestSuccessChance(attribute, trackValue, difficulty);
  const roll = deterministicRollPercent(gameSeed, round, `crisis_resolve_${crisisId}`);
  return { roll, success: roll <= chance, chance };
}

function pickSpawnSeverity(spawnRoll: number): CrisisSeverity | null {
  if (spawnRoll <= CRISIS_SPAWN_NONE_MAX) return null;
  if (spawnRoll <= CRISIS_SPAWN_MINOR_MAX) return 'minor';
  return 'major';
}

export function spawnRandomCrisis(
  state: GameState,
  library: CrisisLibrary,
  spawnRound: number
): { state: GameState; spawnedName?: string } {
  if (state.activeCrises.length >= MAX_ACTIVE_CRISES) {
    return { state };
  }
  const spawnRoll = deterministicRollPercent(state.gameSeed, state.round, 'crisis_spawn');
  const severity = pickSpawnSeverity(spawnRoll);
  if (!severity) {
    return { state };
  }
  const activeIds = new Set(state.activeCrises.map((c) => c.crisisId));
  const candidates = library.all.filter((c) => c.severity === severity && !activeIds.has(c.id));
  if (candidates.length === 0) {
    return { state };
  }
  const pickRoll = deterministicRollPercent(state.gameSeed, state.round, `crisis_pick_${severity}`);
  const index = (pickRoll - 1) % candidates.length;
  const crisis = candidates[index];
  const active: ActiveCrisis = {
    crisisId: crisis.id,
    doom: 0,
    createdRound: spawnRound,
  };
  return {
    state: {
      ...state,
      activeCrises: [...state.activeCrises, active],
      log: [...state.log, `New crisis: ${crisis.name}`],
    },
    spawnedName: crisis.name,
  };
}

export function processEndOfRoundCrises(
  state: GameState,
  library: CrisisLibrary
): GameState {
  if (state.activeCrises.length === 0) {
    return state;
  }
  let stats = state.stats;
  let resources = state.resources;
  let legitimacy = state.legitimacy;
  let control = state.control;
  const log = [...state.log];

  for (const active of state.activeCrises) {
    const def = library.get(active.crisisId);
    if (!def?.ongoingEffects) continue;
    const applied = applyEffectsBundle(stats, resources, legitimacy, control, def.ongoingEffects);
    stats = applied.stats;
    resources = applied.resources;
    legitimacy = applied.legitimacy;
    control = applied.control;
  }

  let activeCrises = state.activeCrises.map((c) => ({ ...c, doom: c.doom + 1 }));

  activeCrises = activeCrises.map((active) => {
    if (active.doom < CRISIS_DOOM_THRESHOLD) {
      return active;
    }
    const def = library.get(active.crisisId);
    if (def?.escalationEffects) {
      const applied = applyEffectsBundle(stats, resources, legitimacy, control, def.escalationEffects);
      stats = applied.stats;
      resources = applied.resources;
      legitimacy = applied.legitimacy;
      control = applied.control;
      log.push(`${def.name} escalated`);
    }
    return { ...active, doom: 0 };
  });

  return {
    ...state,
    stats,
    resources,
    legitimacy,
    control,
    activeCrises,
    log,
  };
}

export function canResolveCrisis(
  state: GameState,
  crisisId: string,
  library: CrisisLibrary
): { ok: true } | { ok: false; error: string } {
  if (state.phase === 'game_over') {
    return { ok: false, error: 'Campaign concluded.' };
  }
  if (state.phase !== 'player') {
    return { ok: false, error: 'Not in player phase.' };
  }
  const active = state.activeCrises.find((c) => c.crisisId === crisisId);
  if (!active) {
    return { ok: false, error: 'Crisis is not active.' };
  }
  const def = library.get(crisisId);
  if (!def?.resolution) {
    return { ok: false, error: 'Crisis cannot be resolved.' };
  }
  const { actionCost, resourceCost } = def.resolution;
  const actionsRemaining = state.maxPlayerActionsPerRound - state.playerActionsUsed;
  if (actionsRemaining < actionCost) {
    return { ok: false, error: 'Not enough actions remaining.' };
  }
  if (resourceCost && !canPay(state.resources, resourceCost)) {
    return { ok: false, error: 'Insufficient resources.' };
  }
  return { ok: true };
}

export function resolveCrisis(
  state: GameState,
  crisisId: string,
  library: CrisisLibrary
): { ok: true; state: GameState } | { ok: false; error: string } {
  const check = canResolveCrisis(state, crisisId, library);
  if (!check.ok) {
    return check;
  }
  const def = library.get(crisisId)!;
  const { actionCost, resourceCost, test } = def.resolution!;
  let resources = resourceCost
    ? clampResourcesNonNegative(payCost(state.resources, resourceCost))
    : state.resources;
  let stats = state.stats;
  let legitimacy = state.legitimacy;
  let control = state.control;
  const log = [...state.log];
  const nextActions = state.playerActionsUsed + actionCost;

  let success = true;
  if (test) {
    const trackValue = test.attribute === 'legitimacy' ? state.legitimacy : state.control;
    const result = rollCrisisTest(
      state.gameSeed,
      state.round,
      crisisId,
      test.attribute,
      trackValue,
      test.difficulty
    );
    success = result.success;
    const effects = success ? def.successEffects : def.failureEffects;
    const applied = applyEffectsBundle(stats, resources, legitimacy, control, effects);
    stats = applied.stats;
    resources = applied.resources;
    legitimacy = applied.legitimacy;
    control = applied.control;
    if (success) {
      log.push(`${def.name} resolved`);
    } else {
      log.push(`Failed to resolve ${def.name}`);
    }
  } else {
    const applied = applyEffectsBundle(stats, resources, legitimacy, control, def.successEffects);
    stats = applied.stats;
    resources = applied.resources;
    legitimacy = applied.legitimacy;
    control = applied.control;
    log.push(`${def.name} resolved`);
  }

  const removeOnSuccess = success && (def.successEffects?.removeCrisis ?? !test);
  const activeCrises = removeOnSuccess
    ? state.activeCrises.filter((c) => c.crisisId !== crisisId)
    : state.activeCrises;

  return {
    ok: true,
    state: {
      ...state,
      stats,
      resources,
      legitimacy,
      control,
      activeCrises,
      playerActionsUsed: nextActions,
      log: [
        ...log,
        `Round ${state.round} action ${nextActions}: resolved crisis ${def.name} (${actionCost} action${actionCost > 1 ? 's' : ''})`,
      ],
    },
  };
}
