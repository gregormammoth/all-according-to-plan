import type { Card } from '@all-according-to-plan/shared';

export type CardArtTheme =
  | 'propaganda'
  | 'security'
  | 'economy'
  | 'elite_council'
  | 'crisis'
  | 'authority';

const CARD_THEME_OVERRIDE: Partial<Record<string, CardArtTheme>> = {
  ministry_truth: 'propaganda',
  ministry_happiness: 'propaganda',
  tv_propaganda: 'propaganda',
  radio_propaganda: 'propaganda',
  street_banners: 'propaganda',
  rewrite_history: 'propaganda',
  controlled_opposition: 'propaganda',
  hero_cult: 'propaganda',
  festival_unity: 'propaganda',
  mass_surveillance: 'security',
  military_parade: 'security',
  curfew_enforcement: 'security',
  riot_suppression: 'crisis',
  martial_law: 'crisis',
  wonderwaffe_project: 'economy',
  industrial_subsidies: 'economy',
  nationalization_decree: 'economy',
  voluntary_contributions: 'economy',
  black_market_tolerance: 'economy',
  tax_reform: 'economy',
  elite_bribery: 'elite_council',
  divide_and_rule: 'elite_council',
};

const ARCHETYPE_THEME: Record<string, CardArtTheme> = {
  propaganda: 'propaganda',
  security: 'security',
  economy: 'economy',
  mega_project: 'economy',
  social: 'elite_council',
  intrigue: 'elite_council',
  crisis: 'crisis',
  strategy: 'authority',
};

export function getCardArtTheme(card: Card): CardArtTheme {
  return CARD_THEME_OVERRIDE[card.id] ?? ARCHETYPE_THEME[card.archetype ?? ''] ?? 'authority';
}

export function getCardArtSrc(theme: CardArtTheme): string {
  return `/cards/themes/${theme}.png`;
}

export const CARD_ART_GRADIENT: Record<CardArtTheme, string> = {
  propaganda:
    'from-[#2a2420] via-[#1a1816] to-[#0f0e0d] [background-image:radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(180,140,80,0.12),transparent)]',
  security:
    'from-[#1a2024] via-[#121618] to-[#0a0c0e] [background-image:radial-gradient(ellipse_70%_50%_at_60%_30%,rgba(90,115,115,0.15),transparent)]',
  economy:
    'from-[#1e2218] via-[#141612] to-[#0c0d0a] [background-image:radial-gradient(ellipse_75%_55%_at_40%_25%,rgba(122,111,82,0.14),transparent)]',
  elite_council:
    'from-[#1a181c] via-[#121014] to-[#0a090c] [background-image:radial-gradient(ellipse_65%_55%_at_70%_35%,rgba(100,80,110,0.12),transparent)]',
  crisis:
    'from-[#241818] via-[#181212] to-[#0e0c0c] [background-image:radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(122,72,72,0.18),transparent)]',
  authority:
    'from-[#1a1c1e] via-[#121416] to-[#0a0c0e] [background-image:radial-gradient(ellipse_75%_50%_at_50%_25%,rgba(90,100,110,0.12),transparent)]',
};
