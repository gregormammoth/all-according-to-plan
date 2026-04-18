import { GROUP_KEYS, STAT_MAX, STAT_MIN } from './constants';
import type {
  CardCost,
  CardEffects,
  GroupStats,
  PlayerStats,
  ResourceKey,
  Resources,
} from './types';

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampGroupStats(stats: GroupStats): GroupStats {
  return {
    satisfaction: clampNumber(stats.satisfaction, STAT_MIN, STAT_MAX),
    loyalty: clampNumber(stats.loyalty, STAT_MIN, STAT_MAX),
    fear: clampNumber(stats.fear, STAT_MIN, STAT_MAX),
  };
}

export function clampStats(stats: PlayerStats): PlayerStats {
  return {
    people: clampGroupStats(stats.people),
    elites: clampGroupStats(stats.elites),
    security: clampGroupStats(stats.security),
  };
}

export function applyGroupDelta(current: GroupStats, delta: Partial<GroupStats>): GroupStats {
  return {
    satisfaction: current.satisfaction + (delta.satisfaction ?? 0),
    loyalty: current.loyalty + (delta.loyalty ?? 0),
    fear: current.fear + (delta.fear ?? 0),
  };
}

export function applyStatEffects(stats: PlayerStats, effects: CardEffects): PlayerStats {
  const next: PlayerStats = { ...stats };
  for (const key of GROUP_KEYS) {
    const delta = effects[key];
    next[key] = applyGroupDelta(stats[key], delta);
  }
  return clampStats(next);
}

export function canPay(resources: Resources, cost: CardCost): boolean {
  const keys: ResourceKey[] = ['money', 'influence', 'authority'];
  return keys.every((k) => resources[k] >= (cost[k] ?? 0));
}

export function payCost(resources: Resources, cost: CardCost): Resources {
  return {
    money: resources.money - (cost.money ?? 0),
    influence: resources.influence - (cost.influence ?? 0),
    authority: resources.authority - (cost.authority ?? 0),
  };
}

export function applyResourceDelta(resources: Resources, delta: Partial<Resources>): Resources {
  return {
    money: resources.money + (delta.money ?? 0),
    influence: resources.influence + (delta.influence ?? 0),
    authority: resources.authority + (delta.authority ?? 0),
  };
}

export function clampResourcesNonNegative(resources: Resources): Resources {
  return {
    money: Math.max(0, resources.money),
    influence: Math.max(0, resources.influence),
    authority: Math.max(0, resources.authority),
  };
}

export function calculateStabilityIndex(stats: PlayerStats): number {
  let total = 0;
  for (const key of GROUP_KEYS) {
    const g = stats[key];
    const raw = ((g.satisfaction + g.loyalty - g.fear + 20) / 30) * 100;
    total += clampNumber(raw, 0, 100);
  }
  return Math.round(total / GROUP_KEYS.length);
}
