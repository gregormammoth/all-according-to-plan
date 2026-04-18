'use client';

import { calculateStabilityIndex } from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';

export function AdvisorPanel() {
  const state = useGameStore((s) => s.state);
  const reset = useGameStore((s) => s.reset);
  const stability = calculateStabilityIndex(state.stats);
  const phaseLabel =
    state.phase === 'event_modal' ? 'event (modal)' : state.phase === 'game_over' ? 'game over' : state.phase;
  const advice =
    stability >= 70
      ? 'The index looks survivable if we avoid spectacle mistakes. Keep ministries aligned and pay security on time.'
      : stability >= 45
        ? 'Cracks are showing. Every card is leverage; do not spend actions on vanity when the deck is thin.'
        : 'This is a crisis posture. Expect harder events — prioritize money and fear control before loyalty theater.';

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">Advisor</h3>
        <button
          type="button"
          className="rounded-lg border border-stone-300 bg-stone-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-800 hover:bg-stone-200"
          onClick={() => reset()}
        >
          Reset run
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-stone-300 bg-gradient-to-br from-stone-100 to-stone-200 text-4xl shadow-inner">
            <span aria-hidden="true">
              🎖️
            </span>
          </div>
          <div className="rounded-lg border border-stone-200 bg-amber-50/80 px-3 py-2 text-center text-xs font-medium leading-snug text-stone-800">
            {advice}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-4 text-center shadow-sm">
          <div className="text-4xl" aria-hidden="true">
            💰
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-stone-600">State treasury</div>
          <div className="text-3xl font-black tracking-tight text-board-ink">$ {state.resources.money}</div>
          <div className="text-[11px] text-stone-500">
            Inf {state.resources.influence} · Auth {state.resources.authority}
          </div>
          <div className="text-[10px] text-stone-400">
            Deck {state.deck.length} · Discard {state.deckDiscard.length}
          </div>
        </div>
      </div>
      <div className="border-t border-stone-100 pt-2 text-center text-[11px] text-stone-500">
        Stability {stability} · Round {state.round} · {phaseLabel}
      </div>
    </div>
  );
}
