'use client';

import { Panel } from '@/components/ui/Panel';
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

  return (
    <Panel as="header">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className={labelMeta}>Ministry central registry · Campaign cycle</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-board-ink md:text-3xl">
            All According to Plan
          </h1>
          <p className={cn(bodyMuted, 'mt-1')}>State pacing and operational calendar</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={pillVariant(phaseTone as 'authority' | 'event' | 'neutral')}>
            Phase · {phaseLabel}
          </span>
          <span className={pillVariant('neutral')}>
            Cycle {activeRound} / {maxRounds}
          </span>
          <span className={pillVariant('neutral')}>
            Actions {actionsLeft} / {maxPlayerActionsPerRound}
          </span>
        </div>
      </div>
      <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
        {rounds.map((r) => (
          <div
            key={r}
            className={cn(
              'timeline-node',
              r === activeRound
                ? 'timeline-node-active'
                : isElectionRound(r)
                  ? 'timeline-node-election'
                  : 'timeline-node-idle'
            )}
            title={isElectionRound(r) ? `Cycle ${r} · election` : `Cycle ${r}`}
          >
            {r}
            {isElectionRound(r) ? (
              <span className="absolute -right-1 -top-1 rounded border border-state-gold/50 bg-state-charcoal px-1 font-display text-[8px] font-bold leading-3 text-state-gold">
                E
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}
