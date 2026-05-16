'use client';

import { motion } from 'framer-motion';
import type { GroupStats, PlayerStats } from '@all-according-to-plan/shared';
import { STAT_MAX } from '@all-according-to-plan/shared';
import { AnimatedNumber } from '@/lib/motion/AnimatedNumber';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { transitions } from '@/lib/motion/variants';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { labelSection, panelInset } from '@/lib/ui/variants';

function StatBar({
  label,
  value,
  fillClass,
  danger,
}: {
  label: string;
  value: number;
  fillClass: string;
  danger?: boolean;
}) {
  const { reduced } = useMotionPrefs();
  const pct = Math.max(0, Math.min(100, (value / STAT_MAX) * 100));
  const display = `${Math.round(value * 10)} / 100`;

  return (
    <div>
      <div className="flex justify-between font-display text-[11px] font-semibold uppercase tracking-label text-state-paper-dim">
        <span>{label}</span>
        <AnimatedNumber
          value={value * 10}
          format={() => display}
          className={cn('text-board-ink', danger && value <= 3 && 'text-faction-danger')}
        />
      </div>
      <div className={cn('mt-1 h-1 w-full overflow-hidden rounded-sm', panelInset)}>
        <motion.div
          className={cn('h-full origin-left rounded-sm', fillClass)}
          initial={false}
          animate={{ scaleX: pct / 100 }}
          transition={reduced ? { duration: 0.01 } : transitions.bar}
          style={{ width: '100%' }}
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
  unstable,
}: {
  title: string;
  accentBorder: string;
  stats: GroupStats;
  barFill: string;
  unstable?: boolean;
}) {
  const { reduced } = useMotionPrefs();
  const lowSat = stats.satisfaction <= 4;
  const highFear = stats.fear >= 7;

  return (
    <motion.div
      animate={
        reduced || !unstable
          ? undefined
          : lowSat
            ? { opacity: [1, 0.92, 1] }
            : highFear
              ? { boxShadow: ['0 0 0 rgba(122,72,72,0)', '0 0 12px rgba(122,72,72,0.15)', '0 0 0 rgba(122,72,72,0)'] }
              : undefined
      }
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Panel className={cn('!p-4', accentBorder, highFear && 'ring-1 ring-faction-danger/20')}>
        <h4 className={labelSection}>{title}</h4>
        <div className="mt-3 flex flex-col gap-3">
          <StatBar label="Satisfaction" value={stats.satisfaction} fillClass={barFill} danger />
          <StatBar label="Loyalty" value={stats.loyalty} fillClass={barFill} />
          <StatBar label="Fear" value={stats.fear} fillClass={barFill} danger={highFear} />
        </div>
      </Panel>
    </motion.div>
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
  const peopleUnstable = stats.people.satisfaction <= 5;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 lg:items-stretch">
      <FactionColumn
        title="People"
        accentBorder="border-faction-people/25"
        stats={stats.people}
        barFill="bg-faction-people/80"
        unstable={peopleUnstable}
      />
      <motion.div
        className={cn(
          'flex min-h-[88px] items-center justify-center rounded-lg border px-3 py-2 text-center font-display text-xs font-semibold uppercase leading-snug tracking-label',
          alert.tone
        )}
        animate={peopleUnstable ? { opacity: [1, 0.88, 1] } : undefined}
        transition={{ duration: 2.8, repeat: Infinity }}
      >
        {alert.text}
      </motion.div>
      <FactionColumn
        title="Elites"
        accentBorder="border-state-gold/25"
        stats={stats.elites}
        barFill="bg-state-gold/70"
        unstable={stats.elites.satisfaction <= 4}
      />
      <FactionColumn
        title="Security"
        accentBorder="border-faction-security/25"
        stats={stats.security}
        barFill="bg-faction-security/80"
        unstable={stats.security.fear >= 7}
      />
    </div>
  );
}
