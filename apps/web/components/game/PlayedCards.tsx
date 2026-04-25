'use client';

import { useGameStore } from '@/state/gameStore';

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
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <h3 className="flex items-center gap-2 border-b border-stone-100 pb-2 text-xs font-bold uppercase tracking-widest text-stone-900">
        <span aria-hidden="true">🕐</span>
        Played cards
      </h3>
      <div className="mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">Active assets</div>
          <div className="space-y-2">
            {activeAssets.length === 0 ? (
              <p className="text-xs text-stone-500">No active assets.</p>
            ) : (
              activeAssets.map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm shadow-sm"
                >
                  <div className="font-bold text-stone-900">{card.name}</div>
                  <div className="text-[10px] uppercase tracking-wide text-emerald-700">
                    active {card.archetype ? `· ${card.archetype}` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-indigo-700">Played events</div>
          <div className="space-y-2">
            {playedEvents.length === 0 ? (
              <p className="text-xs text-stone-500">No events played yet.</p>
            ) : (
              playedEvents.map((card, idx) => (
                <div
                  key={`${card.id}-${idx}`}
                  className="rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-sm shadow-sm"
                >
                  <div className="font-bold text-stone-900">{card.name}</div>
                  <div className="text-[10px] uppercase tracking-wide text-indigo-700">
                    event {card.archetype ? `· ${card.archetype}` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
