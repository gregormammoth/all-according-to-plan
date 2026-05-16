import type { Card, CardCost, GroupKey } from '@all-according-to-plan/shared';
import { describeCardEffectBullets } from '@all-according-to-plan/shared';

const ARCHETYPE_LABELS: Record<string, string> = {
  propaganda: 'Propaganda',
  security: 'Security',
  economy: 'Economic',
  mega_project: 'Mega-project',
  social: 'Social',
  intrigue: 'Intrigue',
  crisis: 'Crisis',
  strategy: 'Strategic',
};

export function getArchetypeLabel(card: Card): string {
  if (card.archetype) {
    return ARCHETYPE_LABELS[card.archetype] ?? card.archetype.replace(/_/g, ' ');
  }
  return card.type === 'asset' ? 'Program' : 'Operation';
}

export function getDirectiveClassLabel(card: Card): string {
  return card.type === 'asset' ? 'Persistent program' : 'Emergency directive';
}

export function getDirectiveFooterHint(card: Card, disabled: boolean): string {
  if (disabled) return 'Insufficient resources';
  return card.type === 'asset'
    ? 'Click to enact · enters active programs'
    : 'Click to execute · filed to state archive';
}

export function formatDirectiveCost(cost: CardCost): { money?: number; influence?: number; authority?: number } {
  return {
    money: cost.money,
    influence: cost.influence,
    authority: cost.authority,
  };
}

export function getFactionInfluence(card: Card): GroupKey[] {
  const keys = new Set<GroupKey>();
  const scan = (effects?: { people?: unknown; elites?: unknown; security?: unknown }) => {
    if (!effects) return;
    if (effects.people) keys.add('people');
    if (effects.elites) keys.add('elites');
    if (effects.security) keys.add('security');
  };
  scan(card.immediateEffects);
  for (const p of card.passiveEffects ?? []) scan(p);
  for (const d of card.delayedEffects ?? []) scan(d);
  return [...keys];
}

export function getEffectSummary(card: Card, max = 3): string[] {
  return describeCardEffectBullets(card).slice(0, max);
}

export const FACTION_INFLUENCE_LABEL: Record<GroupKey, string> = {
  people: 'People',
  elites: 'Elites',
  security: 'Security',
};

export const FACTION_INFLUENCE_CLASS: Record<GroupKey, string> = {
  people: 'bg-faction-people/80',
  elites: 'bg-state-gold/70',
  security: 'bg-faction-security/80',
};
