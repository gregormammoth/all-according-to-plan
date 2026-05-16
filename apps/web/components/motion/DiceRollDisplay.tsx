'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { duration, ease } from '@/lib/motion/tokens';
import { useMotionStore } from '@/state/motionStore';
import { cn } from '@/lib/ui/cn';

type DiceRollDisplayProps = {
  onComplete: () => void;
};

type Phase = 'buildup' | 'rapid' | 'slow' | 'lock';

export function DiceRollDisplay({ onComplete }: DiceRollDisplayProps) {
  const { reduced } = useMotionPrefs();
  const triggerShake = useMotionStore((s) => s.triggerShake);
  const [display, setDisplay] = useState(0);
  const [phase, setPhase] = useState<Phase>('buildup');
  const completed = useRef(false);

  useEffect(() => {
    if (reduced) {
      onComplete();
      return;
    }

    let raf = 0;
    let start = 0;
    let tick = 0;

    const run = (t: number) => {
      if (!start) start = t;
      const elapsed = t - start;

      if (elapsed < 180) {
        setPhase('buildup');
        setDisplay(Math.floor(Math.random() * 100) + 1);
      } else if (elapsed < 1100) {
        setPhase('rapid');
        tick += 1;
        if (tick % 2 === 0) {
          setDisplay(Math.floor(Math.random() * 100) + 1);
        }
      } else if (elapsed < 1750) {
        setPhase('slow');
        tick += 1;
        const interval = 80 + (elapsed - 1100) * 0.12;
        if (tick % Math.max(3, Math.floor(interval / 16)) === 0) {
          setDisplay(Math.floor(Math.random() * 100) + 1);
        }
      } else if (elapsed < 1900) {
        setPhase('lock');
        setDisplay((prev) => (prev > 0 ? prev : Math.floor(Math.random() * 100) + 1));
      } else if (!completed.current) {
        completed.current = true;
        triggerShake();
        onComplete();
        return;
      }

      raf = requestAnimationFrame(run);
    };

    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [onComplete, reduced, triggerShake]);

  if (reduced) {
    return (
      <motion.div
        className="dice-cube"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.01 }}
      >
        …
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className={cn(
          'dice-cube relative overflow-hidden font-display tabular-nums',
          phase === 'rapid' && 'border-state-amber/70',
          phase === 'slow' && 'border-state-brass/60',
          phase === 'lock' && 'border-state-paper/50'
        )}
        animate={
          phase === 'rapid'
            ? {
                boxShadow: [
                  '0 0 24px rgba(154, 130, 88, 0.12), inset 0 2px 12px rgba(0,0,0,0.5)',
                  '0 0 32px rgba(154, 130, 88, 0.22), inset 0 2px 12px rgba(0,0,0,0.5)',
                  '0 0 24px rgba(154, 130, 88, 0.12), inset 0 2px 12px rgba(0,0,0,0.5)',
                ],
              }
            : phase === 'lock'
              ? { scale: [1, 1.03, 1] }
              : { opacity: [0.85, 1, 0.9, 1] }
        }
        transition={{
          duration: phase === 'lock' ? 0.35 : 0.5,
          repeat: phase === 'rapid' ? Infinity : 0,
          ease: ease.ui,
        }}
      >
        <motion.span
          key={display}
          initial={{ opacity: 0.4, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.06 }}
          className="text-3xl font-black text-state-amber"
        >
          {String(display).padStart(2, '0')}
        </motion.span>
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-state-amber/30"
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </motion.div>
      <motion.p
        className="font-display text-[10px] font-semibold uppercase tracking-label text-state-paper-dim"
        animate={{ opacity: phase === 'slow' || phase === 'lock' ? 1 : 0.5 }}
      >
        {phase === 'buildup'
          ? 'Initializing counter'
          : phase === 'rapid'
            ? 'Resolving probability'
            : phase === 'slow'
              ? 'Locking outcome'
              : 'Finalizing'}
      </motion.p>
    </div>
  );
}

type DiceRevealProps = {
  roll: number;
  outcomeType: 'success' | 'partial_success' | 'failure';
  summary: string;
};

export function DiceRevealPanel({ roll, outcomeType, summary }: DiceRevealProps) {
  const { reduced } = useMotionPrefs();
  const isSuccess = outcomeType === 'success';
  const isFailure = outcomeType === 'failure';
  const isPartial = outcomeType === 'partial_success';

  return (
    <motion.div
      className={cn(
        'relative mt-5 space-y-2 rounded-md border p-3',
        isSuccess && 'border-faction-people/35 bg-faction-people/5',
        isFailure && 'border-faction-danger/40 bg-faction-danger/8',
        isPartial && 'border-state-amber/35 bg-state-amber/5'
      )}
      initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0.01 : duration.modal, ease: ease.out }}
    >
      <motion.div
        className="font-display text-2xl font-bold text-board-ink"
        animate={
          reduced
            ? undefined
            : isPartial
              ? { x: [0, -1, 1, -1, 0] }
              : isFailure
                ? { x: [0, -3, 2, -1, 0] }
                : { scale: [1, 1.02, 1] }
        }
        transition={{ duration: isFailure ? 0.45 : 0.35, ease: ease.out }}
      >
        Roll {roll}
      </motion.div>
      <motion.p
        className="text-sm font-semibold text-state-paper"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.12, duration: duration.ui }}
      >
        {summary}
      </motion.p>
      {!reduced && isFailure ? (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-md bg-faction-danger/10"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          aria-hidden
        />
      ) : null}
    </motion.div>
  );
}
