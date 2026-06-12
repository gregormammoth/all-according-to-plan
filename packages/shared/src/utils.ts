import {
  GROUP_KEYS,
  INITIAL_CONTROL,
  INITIAL_LEGITIMACY,
  MAX_HAND_CARDS,
  REGIME_MAX,
  REGIME_MIN,
  STAT_MAX,
  STAT_MIN,
} from './constants';
import type {
  Card,
  CardCost,
  CardEffects,
  CrisisDefinition,
  DeckState,
  EffectsBundle,
  FactionStatBlock,
  GameEvent,
  GroupKey,
  GroupStats,
  HandState,
  PlayerStats,
  RegimeDelta,
  RegimeTracks,
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

export function clampLegitimacy(value: number): number {
  return clampNumber(value, REGIME_MIN, REGIME_MAX);
}

export function clampControl(value: number): number {
  return clampNumber(value, REGIME_MIN, REGIME_MAX);
}

export function clampRegimeTracks(tracks: RegimeTracks): RegimeTracks {
  return {
    legitimacy: clampLegitimacy(tracks.legitimacy),
    control: clampControl(tracks.control),
  };
}

export function defaultRegimeTracks(): RegimeTracks {
  return { legitimacy: INITIAL_LEGITIMACY, control: INITIAL_CONTROL };
}

export function applyRegimeDelta(
  legitimacy: number,
  control: number,
  delta: RegimeDelta
): RegimeTracks {
  return clampRegimeTracks({
    legitimacy: legitimacy + (delta.legitimacyDelta ?? 0),
    control: control + (delta.controlDelta ?? 0),
  });
}

export function regimeDeltaFromBlock(block: RegimeDelta): RegimeDelta {
  const out: RegimeDelta = {};
  if (block.legitimacyDelta !== undefined) out.legitimacyDelta = block.legitimacyDelta;
  if (block.controlDelta !== undefined) out.controlDelta = block.controlDelta;
  return out;
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

function appendFactionStatBullets(factionName: string, block: FactionStatBlock, out: string[]) {
  const pairs: [keyof FactionStatBlock, string][] = [
    ['satisfaction', 'satisfaction'],
    ['loyalty', 'loyalty'],
    ['fear', 'fear'],
  ];
  for (const [key, label] of pairs) {
    const v = block[key];
    if (v !== 0 && v !== undefined && v !== null) {
      const sign = v > 0 ? '+' : '';
      out.push(`• ${factionName} ${sign}${v} ${label}`);
    }
  }
}

export function describeCardEffectBullets(card: Card): string[] {
  const labels: Record<GroupKey, string> = {
    people: 'People',
    elites: 'Elites',
    security: 'Security',
  };
  const out: string[] = [];
  const immediate = card.immediateEffects;
  if (immediate) {
    for (const key of GROUP_KEYS) {
      appendFactionStatBullets(labels[key], immediate[key], out);
    }
  }
  if (card.passiveEffects && card.passiveEffects.length > 0) {
    for (const passive of card.passiveEffects) {
      for (const key of GROUP_KEYS) {
        const before = out.length;
        appendFactionStatBullets(labels[key], passive[key], out);
        if (out.length > before) {
          out[out.length - 1] = `${out[out.length - 1]} each round`;
        }
      }
    }
  }
  if (card.gain) {
    const g = card.gain;
    if (g.money) out.push(`• Treasury ${g.money > 0 ? '+' : ''}${g.money} money`);
    if (g.influence) out.push(`• Influence ${g.influence > 0 ? '+' : ''}${g.influence}`);
    if (g.authority) out.push(`• Authority ${g.authority > 0 ? '+' : ''}${g.authority}`);
  }
  if (card.legitimacyDelta) {
    const sign = card.legitimacyDelta > 0 ? '+' : '';
    out.push(`• Legitimacy ${sign}${card.legitimacyDelta}`);
  }
  if (card.controlDelta) {
    const sign = card.controlDelta > 0 ? '+' : '';
    out.push(`• Control ${sign}${card.controlDelta}`);
  }
  for (const passive of card.passiveEffects ?? []) {
    if (passive.legitimacyDelta) {
      const sign = passive.legitimacyDelta > 0 ? '+' : '';
      out.push(`• Legitimacy ${sign}${passive.legitimacyDelta} each round`);
    }
    if (passive.controlDelta) {
      const sign = passive.controlDelta > 0 ? '+' : '';
      out.push(`• Control ${sign}${passive.controlDelta} each round`);
    }
  }
  return out.length ? out : ['• See card description for impact'];
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

export function describeEffectsBundleLines(bundle?: EffectsBundle, perRound = false): string[] {
  if (!bundle) return [];
  const suffix = perRound ? ' per round' : '';
  const lines: string[] = [];
  if (bundle.legitimacyDelta) {
    const sign = bundle.legitimacyDelta > 0 ? '+' : '';
    lines.push(`${sign}${bundle.legitimacyDelta} Legitimacy${suffix}`);
  }
  if (bundle.controlDelta) {
    const sign = bundle.controlDelta > 0 ? '+' : '';
    lines.push(`${sign}${bundle.controlDelta} Control${suffix}`);
  }
  if (bundle.resourceDeltas) {
    const r = bundle.resourceDeltas;
    if (r.money) lines.push(`${r.money > 0 ? '+' : ''}${r.money} Money${suffix}`);
    if (r.influence) lines.push(`${r.influence > 0 ? '+' : ''}${r.influence} Influence${suffix}`);
    if (r.authority) lines.push(`${r.authority > 0 ? '+' : ''}${r.authority} Authority${suffix}`);
  }
  if (bundle.statDeltas) {
    const labels: Record<GroupKey, string> = {
      people: 'People',
      elites: 'Elites',
      security: 'Security',
    };
    for (const key of GROUP_KEYS) {
      const block = bundle.statDeltas[key];
      if (!block) continue;
      const bits: string[] = [];
      if (block.satisfaction) bits.push(`satisfaction ${block.satisfaction > 0 ? '+' : ''}${block.satisfaction}`);
      if (block.loyalty) bits.push(`loyalty ${block.loyalty > 0 ? '+' : ''}${block.loyalty}`);
      if (block.fear) bits.push(`fear ${block.fear > 0 ? '+' : ''}${block.fear}`);
      if (bits.length) lines.push(`${labels[key]}: ${bits.join(', ')}${suffix}`);
    }
  }
  return lines;
}

export function formatCrisisResolutionCost(def: CrisisDefinition): string {
  const parts: string[] = [];
  const cost = def.resolution?.actionCost ?? 0;
  if (cost > 0) {
    parts.push(`${cost} Action${cost > 1 ? 's' : ''}`);
  }
  const resources = def.resolution?.resourceCost;
  if (resources?.money) parts.push(`${resources.money} Money`);
  if (resources?.influence) parts.push(`${resources.influence} Influence`);
  if (resources?.authority) parts.push(`${resources.authority} Authority`);
  return parts.join(', ');
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
