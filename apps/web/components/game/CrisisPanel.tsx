'use client';

import { useGameStore } from '@/state/gameStore';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { bodyMuted, labelSection, panelInset } from '@/lib/ui/variants';

export function CrisisPanel() {
  const history = useGameStore((s) => s.state.eventHistory);
  const last = useGameStore((s) => s.state.lastResolvedEvent);
  const phase = useGameStore((s) => s.state.phase);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Panel className="flex min-h-0 flex-1 flex-col !p-3">
        <h3 className="flex items-center gap-2 border-b border-state-steel/40 pb-2">
          <span className="text-faction-danger" aria-hidden="true">
            ▲
          </span>
          <span className={labelSection}>Crisis registry</span>
        </h3>
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
          {phase === 'event_modal' ? (
            <p className="text-sm font-medium text-state-amber">Directive pending — resolve in modal to continue.</p>
          ) : last ? (
            <div className={cn(panelInset, 'px-3 py-2 text-sm')}>
              <div className="font-display font-bold text-board-ink">
                Latest · Cycle {last.round}: {last.title}
              </div>
              <p className={cn(bodyMuted, 'mt-1 !text-xs')}>{last.description}</p>
            </div>
          ) : (
            <p className={bodyMuted}>No active crises logged.</p>
          )}
        </div>
      </Panel>
      <Panel className="flex min-h-0 flex-1 flex-col !p-3">
        <h3 className={cn(labelSection, 'border-b border-state-steel/40 pb-2')}>Archive</h3>
        <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {[...history].reverse().length === 0 ? (
            <p className={bodyMuted}>No prior entries.</p>
          ) : (
            [...history].reverse().map((item, idx) => (
              <div key={`${item.eventId}-${item.round}-${idx}`} className={cn(panelInset, 'px-3 py-2 text-xs')}>
                <div className="font-display font-bold text-board-ink">
                  Cycle {item.round}: {item.title}
                </div>
                <p className="mt-1 leading-relaxed text-state-paper-dim">{item.description}</p>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
