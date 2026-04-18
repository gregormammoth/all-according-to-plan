import { clampGroupStats, GROUP_KEYS } from '@all-according-to-plan/shared';
import type { GroupStats, PlayerStats } from '@all-according-to-plan/shared';

export function applyInstabilityDrift(stats: PlayerStats): PlayerStats {
  const next: PlayerStats = { ...stats };
  for (const key of GROUP_KEYS) {
    const g = stats[key];
    const drifted: GroupStats = {
      satisfaction: g.satisfaction - 0.15,
      loyalty: g.loyalty - 0.1,
      fear: g.fear + 0.1,
    };
    next[key] = clampGroupStats(drifted);
  }
  return next;
}
