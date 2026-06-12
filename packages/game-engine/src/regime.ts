import {
  applyRegimeDelta,
  clampRegimeTracks,
  type GameState,
  type PlayerStats,
  type RegimeCollapseCause,
  type RegimeDelta,
  type Resources,
} from '@all-according-to-plan/shared';

export const LEGITIMACY_SAT_FACTOR = 0.8;
export const LEGITIMACY_LOY_FACTOR = 0.4;
export const CONTROL_SECURITY_LOY_FACTOR = 0.6;
export const CONTROL_ELITE_LOY_FACTOR = 0.4;

export const SCORE_LEGITIMACY_WEIGHT = 0.5;
export const SCORE_CONTROL_WEIGHT = 0.5;

export function isRegimeCollapsed(state: Pick<GameState, 'legitimacy' | 'control'>): boolean {
  return state.legitimacy <= 0 || state.control <= 0;
}

export function regimeCollapseCause(
  state: Pick<GameState, 'legitimacy' | 'control'>
): RegimeCollapseCause | null {
  if (state.legitimacy <= 0) return 'legitimacy';
  if (state.control <= 0) return 'control';
  return null;
}

export function collapseSummaryText(cause: RegimeCollapseCause): string {
  if (cause === 'legitimacy') {
    return 'Political legitimacy has collapsed. Mass unrest forces a leadership change.';
  }
  return 'State control has collapsed. Security forces and elite factions abandoned the regime.';
}

export function applyRegimePressure(
  stats: PlayerStats,
  legitimacy: number,
  control: number
): { legitimacy: number; control: number } {
  const legitimacyLoss =
    (10 - stats.people.satisfaction) * LEGITIMACY_SAT_FACTOR +
    (10 - stats.people.loyalty) * LEGITIMACY_LOY_FACTOR;
  const controlLoss =
    (10 - stats.security.loyalty) * CONTROL_SECURITY_LOY_FACTOR +
    (10 - stats.elites.loyalty) * CONTROL_ELITE_LOY_FACTOR;
  return clampRegimeTracks({
    legitimacy: legitimacy - legitimacyLoss,
    control: control - controlLoss,
  });
}

export function applyRegimeDeltaToState(
  legitimacy: number,
  control: number,
  delta: RegimeDelta
): { legitimacy: number; control: number } {
  return applyRegimeDelta(legitimacy, control, delta);
}

export function scoreRegimeContribution(legitimacy: number, control: number): number {
  return legitimacy * SCORE_LEGITIMACY_WEIGHT + control * SCORE_CONTROL_WEIGHT;
}

export function calculateEndScore(
  stats: PlayerStats,
  resources: Resources,
  legitimacy: number,
  control: number
): number {
  const remainingResources = resources.money + resources.influence + resources.authority;
  const score =
    stats.people.satisfaction * 2 +
    stats.elites.loyalty * 2 +
    stats.security.fear +
    remainingResources +
    scoreRegimeContribution(legitimacy, control);
  return Math.round(score);
}
