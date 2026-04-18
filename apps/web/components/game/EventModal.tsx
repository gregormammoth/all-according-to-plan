'use client';

import { describeGameEventEffectLines } from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';

export function EventModal() {
  const isOpen = useGameStore((s) => s.eventModal.isOpen);
  const event = useGameStore((s) => s.eventModal.event);
  const acknowledgeEvent = useGameStore((s) => s.acknowledgeEvent);
  if (!isOpen || !event) {
    return null;
  }
  const effectLines = describeGameEventEffectLines(event);
  return (
    <div
      className="fixed inset-0 z-[4000] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="absolute inset-0 bg-stone-900/55 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative z-[1] max-h-[min(88vh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
        <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
          Severity: {event.severity}
        </div>
        <h2 id="event-modal-title" className="mt-2 text-2xl font-black tracking-tight text-board-ink">
          {event.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">{event.description}</p>
        {event.condition ? (
          <div className="mt-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Condition</div>
            <p className="mt-1 text-sm leading-relaxed text-stone-800">{event.condition}</p>
          </div>
        ) : null}
        <div className="mt-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Effects</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-medium text-stone-800">
            {effectLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
        {event.outcomePreview ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">Success</div>
              <p className="mt-1 text-xs leading-relaxed text-emerald-950">{event.outcomePreview.success}</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-rose-800">Failure</div>
              <p className="mt-1 text-xs leading-relaxed text-rose-950">{event.outcomePreview.failure}</p>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          className="mt-6 w-full rounded-xl border-2 border-yellow-500 bg-yellow-400 py-3 text-sm font-black uppercase tracking-wide text-black shadow-sm hover:bg-yellow-300"
          onClick={() => acknowledgeEvent()}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
