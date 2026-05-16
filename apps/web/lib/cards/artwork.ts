import type { Card } from '@all-according-to-plan/shared';

export type CardArtTheme =
  | 'propaganda'
  | 'security'
  | 'economy'
  | 'industry'
  | 'social'
  | 'intrigue'
  | 'crisis'
  | 'strategy';

const CARD_THEME_OVERRIDE: Partial<Record<string, CardArtTheme>> = {
  ministry_truth: 'propaganda',
  tv_propaganda: 'propaganda',
  radio_propaganda: 'propaganda',
  mass_surveillance: 'security',
  military_parade: 'security',
  riot_suppression: 'security',
  martial_law: 'crisis',
  wonderwaffe_project: 'industry',
  industrial_subsidies: 'economy',
  nationalization_decree: 'economy',
  festival_unity: 'social',
  divide_and_rule: 'strategy',
};

const ARCHETYPE_THEME: Record<string, CardArtTheme> = {
  propaganda: 'propaganda',
  security: 'security',
  economy: 'economy',
  mega_project: 'industry',
  social: 'social',
  intrigue: 'intrigue',
  crisis: 'crisis',
  strategy: 'strategy',
};

export function getCardArtTheme(card: Card): CardArtTheme {
  return CARD_THEME_OVERRIDE[card.id] ?? ARCHETYPE_THEME[card.archetype ?? ''] ?? 'strategy';
}

export function getCardArtSrc(theme: CardArtTheme): string {
  return `/cards/themes/${theme}.svg`;
}

export const CARD_ART_GRADIENT: Record<CardArtTheme, string> = {
  propaganda:
    'from-[#2a2420] via-[#1a1816] to-[#0f0e0d] [background-image:radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(180,140,80,0.12),transparent)]',
  security:
    'from-[#1a2024] via-[#121618] to-[#0a0c0e] [background-image:radial-gradient(ellipse_70%_50%_at_60%_30%,rgba(90,115,115,0.15),transparent)]',
  economy:
    'from-[#1e2218] via-[#141612] to-[#0c0d0a] [background-image:radial-gradient(ellipse_75%_55%_at_40%_25%,rgba(122,111,82,0.14),transparent)]',
  industry:
    'from-[#1c1a18] via-[#121110] to-[#0a0908] [background-image:radial-gradient(ellipse_80%_45%_at_50%_70%,rgba(80,70,60,0.2),transparent)]',
  social:
    'from-[#1e1c1a] via-[#141210] to-[#0c0b0a] [background-image:radial-gradient(ellipse_60%_50%_at_30%_40%,rgba(140,120,90,0.1),transparent)]',
  intrigue:
    'from-[#1a181c] via-[#121014] to-[#0a090c] [background-image:radial-gradient(ellipse_65%_55%_at_70%_35%,rgba(100,80,110,0.12),transparent)]',
  crisis:
    'from-[#241818] via-[#181212] to-[#0e0c0c] [background-image:radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(122,72,72,0.18),transparent)]',
  strategy:
    'from-[#1a1c1e] via-[#121416] to-[#0a0c0e] [background-image:radial-gradient(ellipse_75%_50%_at_50%_25%,rgba(90,100,110,0.12),transparent)]',
};
