import type { Card } from '@all-according-to-plan/shared';

const ARCHETYPE_ICON: Record<string, string> = {
  propaganda: '✦',
  security: '⛨',
  economy: '◎',
  mega_project: '▣',
  social: '☷',
  intrigue: '◈',
  crisis: '⚠',
  strategy: '★',
};

export function getDirectiveIcon(card: Card): string {
  if (card.type === 'event') return '⚡';
  return ARCHETYPE_ICON[card.archetype ?? ''] ?? '★';
}

export function getDirectiveActionType(card: Card): string {
  const map: Record<string, string> = {
    propaganda: 'Information',
    security: 'Security',
    economy: 'Economic',
    mega_project: 'Industrial',
    social: 'Social',
    intrigue: 'Political',
    crisis: 'Emergency',
    strategy: 'Strategic',
  };
  const label = map[card.archetype ?? ''] ?? (card.type === 'asset' ? 'Program' : 'Operation');
  return `${label} Action`;
}

export function getCardDisplayCost(cost: { money?: number; influence?: number; authority?: number }): number {
  const total = (cost.money ?? 0) + (cost.influence ?? 0) + (cost.authority ?? 0);
  return total > 0 ? total : 0;
}
