'use client';

import type { GroupStats, PlayerStats } from '@all-according-to-plan/shared';
import { STAT_MAX } from '@all-according-to-plan/shared';

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
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-stone-600">
        <span>{label}</span>
        <span className="text-stone-900">{display}</span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full transition-all ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FactionColumn({
  title,
  accent,
  stats,
  barFill,
}: {
  title: string;
  accent: string;
  stats: GroupStats;
  barFill: string;
}) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white p-4 shadow-sm ring-1 ${accent}`}
    >
      <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-stone-900">{title}</h4>
      <div className="flex flex-col gap-3">
        <StatBar label="Satisfaction" value={stats.satisfaction} fillClass={barFill} />
        <StatBar label="Loyalty" value={stats.loyalty} fillClass={barFill} />
        <StatBar label="Fear" value={stats.fear} fillClass={barFill} />
      </div>
    </div>
  );
}

function unrestLabel(stats: PlayerStats): { text: string; tone: string } {
  const s = stats.people.satisfaction;
  if (s <= 3) return { text: 'The people are restless. Unrest risk: High.', tone: 'border-rose-200 bg-rose-50 text-rose-900' };
  if (s <= 6) return { text: 'The people are restless. Unrest risk: Medium.', tone: 'border-amber-200 bg-amber-50 text-amber-950' };
  return { text: 'Public mood is watchful but contained.', tone: 'border-emerald-200 bg-emerald-50 text-emerald-950' };
}

export function FactionBoard({ stats }: { stats: PlayerStats }) {
  const alert = unrestLabel(stats);
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 lg:items-stretch">
      <FactionColumn
        title="People"
        accent="ring-emerald-100"
        stats={stats.people}
        barFill="bg-emerald-500"
      />
      <div
        className={`flex min-h-[88px] items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-semibold leading-snug ${alert.tone}`}
      >
        {alert.text}
      </div>
      <FactionColumn title="Elites" accent="ring-amber-100" stats={stats.elites} barFill="bg-amber-500" />
      <FactionColumn title="Security" accent="ring-sky-100" stats={stats.security} barFill="bg-sky-600" />
    </div>
  );
}
