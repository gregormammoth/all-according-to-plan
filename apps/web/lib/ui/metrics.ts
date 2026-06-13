import type { GroupStats, PlayerStats } from '@all-according-to-plan/shared';
import { STAT_MAX } from '@all-according-to-plan/shared';
import { controlBand, legitimacyBand } from '@/lib/regime/bands';

export function factionScore(stats: GroupStats): number {
  const raw = ((stats.satisfaction + stats.loyalty - stats.fear + STAT_MAX) / (STAT_MAX * 3)) * 100;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export function peopleScore(stats: PlayerStats): number {
  return factionScore(stats.people);
}

export function elitesScore(stats: PlayerStats): number {
  return factionScore(stats.elites);
}

export function securityScore(stats: PlayerStats): number {
  return factionScore(stats.security);
}

export function sentimentLabel(score: number): string {
  if (score >= 70) return 'Calm';
  if (score >= 50) return 'Watchful';
  if (score >= 35) return 'Wary';
  return 'Restless';
}

export function eliteAlignmentLabel(loyalty: number): string {
  if (loyalty >= 8) return 'Unified';
  if (loyalty >= 6) return 'Aligned';
  if (loyalty >= 4) return 'Divided';
  return 'Fractured';
}

export function securityPresenceLabel(stats: GroupStats): string {
  const grip = stats.loyalty + stats.fear * 0.5;
  if (grip >= 8) return 'Strong';
  if (grip >= 5) return 'Present';
  return 'Thin';
}

export function regimeStatusLabel(legitimacy: number, control: number): {
  legitimacy: string;
  control: string;
} {
  return {
    legitimacy: legitimacyBand(legitimacy).label.toUpperCase(),
    control: controlBand(control).label.toUpperCase(),
  };
}
