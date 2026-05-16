'use client';

import { useGameStore } from '@/state/gameStore';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { labelMeta, labelSection } from '@/lib/ui/variants';

export function PlayedCards() {
  const state = useGameStore((s) => s.state);
  const library = useGameStore((s) => s.library);
  const activeAssets = state.activeAssets
    .map((id) => library.get(id))
    .filter((c): c is Exclude<typeof c, undefined> => c !== undefined);
  const playedEvents = [...state.playedCardIds]
    .reverse()
    .map((id) => library.get(id))
    .filter((c): c is Exclude<typeof c, undefined> => c !== undefined && c.type === 'event');

  return (
    <Panel className="flex h-full min-h-0 flex-col !p-3">
      <h3 className={cn(labelSection, 'flex items-center gap-2 border-b border-state-steel/40 pb-2')}>
        <span aria-hidden="true" className="text-state-paper-dim">
          ◷
        </span>
        Issued directives
      </h3>
      <div className="mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <div>
          <p className={cn(labelMeta, 'mb-1 text-state-gold')}>Active assets</p>
          <div className="space-y-2">
            {activeAssets.length === 0 ? (
              <p className="text-xs text-state-paper-dim">None deployed.</p>
            ) : (
              activeAssets.map((card) => (
                <div
                  key={card.id}
                  className="rounded-md border border-state-gold/25 bg-state-gold/5 px-3 py-2 text-sm"
                >
                  <div className="font-display font-bold text-board-ink">{card.name}</div>
                  <p className={cn(labelMeta, 'text-state-gold')}>
                    active {card.archetype ? `· ${card.archetype}` : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <p className={cn(labelMeta, 'mb-1 text-faction-danger')}>Processed events</p>
          <div className="space-y-2">
            {playedEvents.length === 0 ? (
              <p className="text-xs text-state-paper-dim">None on record.</p>
            ) : (
              playedEvents.map((card, idx) => (
                <div
                  key={`${card.id}-${idx}`}
                  className="rounded-md border border-faction-danger/20 bg-faction-danger/5 px-3 py-2 text-sm"
                >
                  <div className="font-display font-bold text-board-ink">{card.name}</div>
                  <p className={cn(labelMeta, 'text-faction-danger')}>
                    event {card.archetype ? `· ${card.archetype}` : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
