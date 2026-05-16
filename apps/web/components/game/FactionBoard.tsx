'use client';

import type { GroupStats, PlayerStats } from '@all-according-to-plan/shared';
import { STAT_MAX } from '@all-according-to-plan/shared';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { labelSection, panelInset } from '@/lib/ui/variants';

function StatBar({
  label,
  value,
  fillClass,
}: {
  label: string;
  value: number;
  fillClass: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / STAT_MAX) * 100));
  const display = `${Math.round(value * 10)} / 100`;
  return (
    <div>
      <div className="flex justify-between font-display text-[11px] font-semibold uppercase tracking-label text-state-paper-dim">
        <span>{label}</span>
        <span className="text-board-ink">{display}</span>
      </div>
      <div className={cn('mt-1 h-1 w-full overflow-hidden rounded-sm', panelInset)}>
        <div
          className={cn('h-full rounded-sm transition-all duration-slow ease-ui', fillClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FactionColumn({
  title,
  accentBorder,
  stats,
  barFill,
}: {
  title: string;
  accentBorder: string;
  stats: GroupStats;
  barFill: string;
}) {
  return (
    <Panel className={cn('!p-4', accentBorder)}>
      <h4 className={labelSection}>{title}</h4>
      <div className="mt-3 flex flex-col gap-3">
        <StatBar label="Satisfaction" value={stats.satisfaction} fillClass={barFill} />
        <StatBar label="Loyalty" value={stats.loyalty} fillClass={barFill} />
        <StatBar label="Fear" value={stats.fear} fillClass={barFill} />
      </div>
    </Panel>
  );
}

function unrestLabel(stats: PlayerStats): { text: string; tone: string } {
  const s = stats.people.satisfaction;
  if (s <= 3) {
    return {
      text: 'The people are restless. Unrest risk: High.',
      tone: 'border-faction-danger/40 bg-faction-danger/10 text-board-ink',
    };
  }
  if (s <= 6) {
    return {
      text: 'The people are restless. Unrest risk: Medium.',
      tone: 'border-state-amber/35 bg-state-amber/8 text-state-paper',
    };
  }
  return {
    text: 'Public mood is watchful but contained.',
    tone: 'border-faction-people/30 bg-faction-people/8 text-state-paper-dim',
  };
}

export function FactionBoard({ stats }: { stats: PlayerStats }) {
  const alert = unrestLabel(stats);
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 lg:items-stretch">
      <FactionColumn
        title="People"
        accentBorder="border-faction-people/25"
        stats={stats.people}
        barFill="bg-faction-people/80"
      />
      <div
        className={cn(
          'flex min-h-[88px] items-center justify-center rounded-lg border px-3 py-2 text-center font-display text-xs font-semibold uppercase leading-snug tracking-label',
          alert.tone
        )}
      >
        {alert.text}
      </div>
      <FactionColumn
        title="Elites"
        accentBorder="border-state-gold/25"
        stats={stats.elites}
        barFill="bg-state-gold/70"
      />
      <FactionColumn
        title="Security"
        accentBorder="border-faction-security/25"
        stats={stats.security}
        barFill="bg-faction-security/80"
      />
    </div>
  );
}
