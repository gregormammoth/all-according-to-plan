'use client';

import { useGameStore } from '@/state/gameStore';

export function PlayedCards() {
  const state = useGameStore((s) => s.state);
  const library = useGameStore((s) => s.library);
  const items = [...state.playedCardIds].reverse();

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <h3 className="flex items-center gap-2 border-b border-stone-100 pb-2 text-xs font-bold uppercase tracking-widest text-stone-900">
        <span aria-hidden="true">🕐</span>
        Played cards
      </h3>
      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-sm text-stone-500">No cards played yet.</p>
        ) : (
          items.map((id, idx) => {
            const card = library.get(id);
            return (
              <div
                key={`${id}-${idx}`}
                className="rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-2 text-sm shadow-sm"
              >
                <div className="font-bold text-stone-900">{card?.name ?? id}</div>
                <div className="text-xs uppercase tracking-wide text-stone-500">{card?.type}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
