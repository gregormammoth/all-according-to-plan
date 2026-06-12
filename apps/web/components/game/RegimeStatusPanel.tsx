'use client';

import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/lib/motion/AnimatedNumber';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { controlBand, legitimacyBand } from '@/lib/regime/bands';
import { transitions } from '@/lib/motion/variants';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { labelSection, panelInset } from '@/lib/ui/variants';

function RegimeTrack({
  title,
  value,
  tooltip,
  band,
}: {
  title: string;
  value: number;
  tooltip: string;
  band: ReturnType<typeof legitimacyBand>;
}) {
  const { reduced } = useMotionPrefs();
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="flex-1 min-w-[200px]" title={tooltip}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-[11px] font-semibold uppercase tracking-label text-state-paper-dim">
          {title}
        </span>
        <span
          className={cn(
            'rounded border px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-label',
            band.badgeClass
          )}
        >
          {band.label}
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="font-display text-sm font-bold text-board-ink">
          <AnimatedNumber value={value} format={(n) => `${Math.round(n)} / 100`} />
        </span>
      </div>
      <div className={cn('mt-1.5 h-2 w-full overflow-hidden rounded-sm', panelInset)}>
        <motion.div
          className={cn('h-full origin-left rounded-sm', band.barClass)}
          initial={false}
          animate={{ scaleX: pct / 100 }}
          transition={reduced ? { duration: 0.01 } : transitions.bar}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}

export function RegimeStatusPanel({
  legitimacy,
  control,
}: {
  legitimacy: number;
  control: number;
}) {
  return (
    <Panel className="!py-3">
      <p className={labelSection}>Regime status</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:gap-6">
        <RegimeTrack
          title="Legitimacy"
          value={legitimacy}
          tooltip="Represents public acceptance of the regime."
          band={legitimacyBand(legitimacy)}
        />
        <RegimeTrack
          title="Control"
          value={control}
          tooltip="Represents the regime's ability to maintain power through institutions, elites, and security forces."
          band={controlBand(control)}
        />
      </div>
    </Panel>
  );
}
