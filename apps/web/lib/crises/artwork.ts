import type { CrisisDefinition } from '@all-according-to-plan/shared';

export type CrisisArtTheme =
  | 'elite_intrigue'
  | 'military_unrest'
  | 'foreign_pressure'
  | 'media_scandal'
  | 'geopolitical'
  | 'mass_unrest';

const CRISIS_THEME_OVERRIDE: Partial<Record<string, CrisisArtTheme>> = {
  corruption_scandal: 'media_scandal',
  media_blackout_failure: 'media_scandal',
  military_discontent: 'military_unrest',
  border_skirmish: 'military_unrest',
  prison_riot: 'mass_unrest',
  elite_defection_rumors: 'elite_intrigue',
  foreign_sanctions: 'foreign_pressure',
  student_protests: 'mass_unrest',
  food_riot: 'mass_unrest',
  energy_shortage: 'geopolitical',
};

const SEVERITY_THEME: Record<CrisisDefinition['severity'], CrisisArtTheme> = {
  minor: 'media_scandal',
  major: 'mass_unrest',
};

export function getCrisisArtTheme(crisis: CrisisDefinition): CrisisArtTheme {
  return CRISIS_THEME_OVERRIDE[crisis.id] ?? SEVERITY_THEME[crisis.severity];
}

export function getCrisisArtSrc(theme: CrisisArtTheme): string {
  return `/crises/themes/${theme}.png`;
}

export const CRISIS_ART_GRADIENT: Record<CrisisArtTheme, string> = {
  elite_intrigue:
    'from-[#1a181c] via-[#121014] to-[#0a090c] [background-image:radial-gradient(ellipse_65%_55%_at_70%_35%,rgba(100,80,110,0.14),transparent)]',
  military_unrest:
    'from-[#241818] via-[#181212] to-[#0e0c0c] [background-image:radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(122,72,72,0.2),transparent)]',
  foreign_pressure:
    'from-[#1a2024] via-[#121618] to-[#0a0c0e] [background-image:radial-gradient(ellipse_70%_50%_at_60%_30%,rgba(90,115,115,0.15),transparent)]',
  media_scandal:
    'from-[#2a2420] via-[#1a1816] to-[#0f0e0d] [background-image:radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(180,140,80,0.12),transparent)]',
  geopolitical:
    'from-[#1a1c1e] via-[#121416] to-[#0a0c0e] [background-image:radial-gradient(ellipse_75%_50%_at_50%_25%,rgba(90,100,110,0.14),transparent)]',
  mass_unrest:
    'from-[#241818] via-[#181212] to-[#0e0c0c] [background-image:radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(122,72,72,0.22),transparent)]',
};
