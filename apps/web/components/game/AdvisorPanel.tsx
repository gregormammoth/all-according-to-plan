'use client';

import { calculateStabilityIndex } from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { labelMeta, labelSection, panelInset } from '@/lib/ui/variants';

export function AdvisorPanel() {
  const state = useGameStore((s) => s.state);
  const reset = useGameStore((s) => s.reset);
  const stability = calculateStabilityIndex(state.stats);
  const phaseLabel =
    state.phase === 'event_modal' ? 'event directive' : state.phase === 'game_over' ? 'terminated' : state.phase;
  const advice =
    stability >= 70
      ? 'The index looks survivable if we avoid spectacle mistakes. Keep ministries aligned and pay security on time.'
      : stability >= 45
        ? 'Cracks are showing. Every directive is leverage; do not spend actions on vanity when reserves are thin.'
        : 'Crisis posture. Expect harder events — prioritize treasury and fear control before loyalty theater.';

  return (
    <Panel className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className={labelSection}>State counselor</h3>
        <Button variant="ghost" size="sm" onClick={() => reset()}>
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              'flex h-24 w-24 items-center justify-center rounded-md border border-state-steel/50 text-4xl',
              panelInset
            )}
          >
            <span aria-hidden="true">◆</span>
          </div>
          <div className="rounded-md border border-state-amber/25 bg-state-amber/5 px-3 py-2 text-center text-xs font-medium leading-snug text-state-paper">
            {advice}
          </div>
        </div>
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-md border border-state-gold/30 p-4 text-center',
            'bg-[linear-gradient(180deg,rgba(58,52,40,0.2)_0%,rgba(26,29,33,0.6)_100%)]'
          )}
        >
          <p className={labelMeta}>State treasury</p>
          <div className="font-display text-3xl font-bold tracking-tight text-state-amber">$ {state.resources.money}</div>
          <p className="text-[11px] text-state-paper-dim">
            Inf {state.resources.influence} · Auth {state.resources.authority}
          </p>
          <p className="text-[10px] text-state-fog">
            Deck {state.deck.length} · Discard {state.deckDiscard.length}
          </p>
        </div>
      </div>
      <p className={cn('border-t border-state-steel/40 pt-2 text-center', labelMeta)}>
        Stability {stability} · Cycle {state.round} · {phaseLabel}
      </p>
    </Panel>
  );
}
