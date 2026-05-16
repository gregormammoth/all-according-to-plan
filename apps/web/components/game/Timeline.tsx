'use client';

import { motion } from 'framer-motion';
import { Panel } from '@/components/ui/Panel';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { timelineNode, transitions } from '@/lib/motion/variants';
import { cn } from '@/lib/ui/cn';
import { bodyMuted, labelMeta, pillVariant } from '@/lib/ui/variants';

type TimelineProps = {
  round: number;
  maxRounds: number;
  playerActionsUsed: number;
  maxPlayerActionsPerRound: number;
  phase: string;
};

export function Timeline({
  round,
  maxRounds,
  playerActionsUsed,
  maxPlayerActionsPerRound,
  phase,
}: TimelineProps) {
  const { reduced } = useMotionPrefs();
  const isElectionRound = (r: number) => r % 4 === 0 && r < 25;
  const rounds = Array.from({ length: maxRounds }, (_, i) => i + 1);
  const activeRound = phase === 'game_over' ? maxRounds : Math.min(round, maxRounds);
  const actionsLeft =
    phase === 'game_over' || phase === 'event_modal'
      ? 0
      : Math.max(0, maxPlayerActionsPerRound - playerActionsUsed);
  const phaseLabel =
    phase === 'event_modal' ? 'Event' : phase === 'game_over' ? 'Terminated' : 'Operations';
  const phaseTone =
    phase === 'player' ? 'authority' : phase === 'event_modal' ? 'event' : 'neutral';
  const electionActive = isElectionRound(activeRound);

  return (
    <Panel as="header">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between" initial={false}>
        <div>
          <p className={labelMeta}>Ministry central registry · Campaign cycle</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-board-ink md:text-3xl">
            All According to Plan
          </h1>
          <p className={cn(bodyMuted, 'mt-1')}>State pacing and operational calendar</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <motion.span
            className={pillVariant(phaseTone as 'authority' | 'event' | 'neutral')}
            key={phaseLabel}
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.ui}
          >
            Phase · {phaseLabel}
          </motion.span>
          <motion.span
            className={pillVariant('neutral')}
            key={`round-${activeRound}`}
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitions.ui}
          >
            Cycle {activeRound} / {maxRounds}
          </motion.span>
          <span className={pillVariant('neutral')}>
            Actions {actionsLeft} / {maxPlayerActionsPerRound}
          </span>
        </div>
      </motion.div>
      <div
        className={cn(
          'mt-4 flex gap-1 overflow-x-auto pb-1 transition-colors duration-slow',
          electionActive && 'rounded-md bg-state-gold/[0.04] px-1 py-1'
        )}
      >
        {rounds.map((r) => {
          const active = r === activeRound;
          const election = isElectionRound(r);
          return (
            <motion.div
              key={r}
              className={cn(
                'timeline-node',
                active
                  ? 'timeline-node-active'
                  : election
                    ? 'timeline-node-election'
                    : 'timeline-node-idle'
              )}
              title={election ? `Cycle ${r} · election` : `Cycle ${r}`}
              variants={timelineNode}
              animate={active ? 'active' : 'idle'}
              whileHover={reduced || active ? undefined : { scale: 1.03 }}
              transition={transitions.hover}
            >
              {r}
              {election ? (
                <span className="absolute -right-1 -top-1 rounded border border-state-gold/50 bg-state-charcoal px-1 font-display text-[8px] font-bold leading-3 text-state-gold">
                  E
                </span>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </Panel>
  );
}
