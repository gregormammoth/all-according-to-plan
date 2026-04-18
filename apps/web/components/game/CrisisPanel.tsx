'use client';

import { useGameStore } from '@/state/gameStore';

export function CrisisPanel() {
  const history = useGameStore((s) => s.state.eventHistory);
  const last = useGameStore((s) => s.state.lastResolvedEvent);
  const phase = useGameStore((s) => s.state.phase);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
        <h3 className="flex items-center gap-2 border-b border-stone-100 pb-2 text-xs font-bold uppercase tracking-widest text-stone-900">
          <span className="text-rose-600" aria-hidden="true">
            ⚠
          </span>
          Events / crises
        </h3>
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
          {phase === 'event_modal' ? (
            <p className="text-sm font-medium text-amber-900">
              An event is blocking the campaign — acknowledge it in the modal to continue.
            </p>
          ) : last ? (
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
              <div className="font-bold text-stone-900">
                Latest · Round {last.round}: {last.title}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">{last.description}</p>
            </div>
          ) : (
            <p className="text-sm text-stone-500">No active events.</p>
          )}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
        <h3 className="border-b border-stone-100 pb-2 text-xs font-bold uppercase tracking-widest text-stone-900">
          Event history
        </h3>
        <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {[...history].reverse().length === 0 ? (
            <p className="text-sm text-stone-500">No past events yet.</p>
          ) : (
            [...history].reverse().map((item, idx) => (
              <div
                key={`${item.eventId}-${item.round}-${idx}`}
                className="rounded-lg border border-stone-100 bg-stone-50/90 px-3 py-2 text-xs shadow-sm"
              >
                <div className="font-bold text-stone-900">
                  Round {item.round}: {item.title}
                </div>
                <p className="mt-1 leading-relaxed text-stone-600">{item.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
