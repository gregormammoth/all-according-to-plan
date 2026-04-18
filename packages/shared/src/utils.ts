import { GROUP_KEYS, MAX_HAND_CARDS, STAT_MAX, STAT_MIN } from './constants';
import type {
  CardCost,
  CardEffects,
  DeckState,
  FactionStatBlock,
  GameEvent,
  GroupKey,
  GroupStats,
  HandState,
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

export function handStateFromIds(ids: readonly string[], maxSize = MAX_HAND_CARDS): HandState {
  return { cards: [...ids], maxSize };
}

export function deckStateFromIds(ids: readonly string[]): DeckState {
  return { cards: [...ids] };
}

function formatStatDelta(block: FactionStatBlock): string {
  const parts: string[] = [];
  if (block.satisfaction) parts.push(`sat ${block.satisfaction > 0 ? '+' : ''}${block.satisfaction}`);
  if (block.loyalty) parts.push(`loy ${block.loyalty > 0 ? '+' : ''}${block.loyalty}`);
  if (block.fear) parts.push(`fear ${block.fear > 0 ? '+' : ''}${block.fear}`);
  return parts.join(', ');
}

export function formatCardCostLine(cost: CardCost): string {
  const m = cost.money ?? 0;
  const i = cost.influence ?? 0;
  const a = cost.authority ?? 0;
  if (m === 0 && i === 0 && a === 0) return 'Cost: none';
  const bits: string[] = [];
  if (m) bits.push(`$${m}`);
  if (i) bits.push(`inf ${i}`);
  if (a) bits.push(`auth ${a}`);
  return `Cost: ${bits.join(' · ')}`;
}

export function formatCardEffectsLine(effects: CardEffects): string {
  const labels: Record<GroupKey, string> = {
    people: 'People',
    elites: 'Elites',
    security: 'Security',
  };
  const parts: string[] = [];
  for (const key of GROUP_KEYS) {
    const line = formatStatDelta(effects[key]);
    if (line) parts.push(`${labels[key]}: ${line}`);
  }
  return parts.length ? parts.join(' | ') : 'Effects: —';
}

export function describeGameEventEffectLines(ev: GameEvent): string[] {
  const labels: Record<GroupKey, string> = {
    people: 'People',
    elites: 'Elites',
    security: 'Security',
  };
  const lines: string[] = [];
  for (const key of GROUP_KEYS) {
    const line = formatStatDelta(ev.effects[key]);
    if (line) lines.push(`${labels[key]}: ${line}`);
  }
  if (ev.resources) {
    const bits: string[] = [];
    if (ev.resources.money) bits.push(`money ${ev.resources.money > 0 ? '+' : ''}${ev.resources.money}`);
    if (ev.resources.influence)
      bits.push(`influence ${ev.resources.influence > 0 ? '+' : ''}${ev.resources.influence}`);
    if (ev.resources.authority)
      bits.push(`authority ${ev.resources.authority > 0 ? '+' : ''}${ev.resources.authority}`);
    if (bits.length) lines.push(`Resources: ${bits.join(', ')}`);
  }
  if (lines.length === 0) lines.push('No mechanical changes.');
  return lines;
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
