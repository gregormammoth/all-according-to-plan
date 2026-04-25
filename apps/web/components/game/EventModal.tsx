'use client';

import { useEffect } from 'react';
import {
  describeGameEventEffectLines,
  type EventChoice,
  type GameState,
  type Outcome,
} from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';

function findChoice(state: GameState): EventChoice | null {
  if (!state.pendingEvent?.choices || !state.pendingChoiceId) return null;
  return state.pendingEvent.choices.find((c) => c.id === state.pendingChoiceId) ?? null;
}

function outcomeFromState(state: GameState): Outcome | null {
  const choice = findChoice(state);
  if (!choice || !state.diceResult) return null;
  if (state.diceResult.outcomeType === 'success') return choice.outcomes.success;
  if (state.diceResult.outcomeType === 'partial_success') return choice.outcomes.partial;
  return choice.outcomes.failure;
}

function formatResourcePreview(delta: GameState['resourceChangesPreview']): string[] {
  if (!delta) return [];
  const lines: string[] = [];
  if (delta.money) lines.push(`Money ${delta.money > 0 ? '+' : ''}${delta.money}`);
  if (delta.influence) lines.push(`Influence ${delta.influence > 0 ? '+' : ''}${delta.influence}`);
  if (delta.authority) lines.push(`Authority ${delta.authority > 0 ? '+' : ''}${delta.authority}`);
  return lines;
}

function formatStatPreview(delta: GameState['statChangesPreview']): string[] {
  if (!delta) return [];
  const lines: string[] = [];
  const groups: Array<keyof typeof delta> = ['people', 'elites', 'security'];
  for (const g of groups) {
    const block = delta[g];
    if (!block) continue;
    if (block.satisfaction) lines.push(`${g} satisfaction ${block.satisfaction > 0 ? '+' : ''}${block.satisfaction}`);
    if (block.loyalty) lines.push(`${g} loyalty ${block.loyalty > 0 ? '+' : ''}${block.loyalty}`);
    if (block.fear) lines.push(`${g} fear ${block.fear > 0 ? '+' : ''}${block.fear}`);
  }
  return lines;
}

export function EventModal() {
  const state = useGameStore((s) => s.state);
  const isOpen = useGameStore((s) => s.eventModal.isOpen);
  const event = useGameStore((s) => s.eventModal.event);
  const selectEventChoice = useGameStore((s) => s.selectEventChoice);
  const rollEvent = useGameStore((s) => s.rollEvent);
  const applyEventOutcome = useGameStore((s) => s.applyEventOutcome);
  const continueEvent = useGameStore((s) => s.continueEvent);
  const error = useGameStore((s) => s.error);

  useEffect(() => {
    if (!isOpen) return;
    if (state.eventStep !== 'rolling') return;
    const timer = window.setTimeout(() => {
      rollEvent();
    }, 900);
    return () => window.clearTimeout(timer);
  }, [isOpen, state.eventStep, rollEvent]);

  if (!isOpen || !event) {
    return null;
  }
  const effectLines = describeGameEventEffectLines(event);
  const selectedChoice = findChoice(state);
  const selectedOutcome = outcomeFromState(state);
  const stepTitle =
    state.eventStep === 'choice'
      ? 'Choose your response'
      : state.eventStep === 'rolling'
        ? 'Rolling outcome'
        : state.eventStep === 'revealed'
          ? 'Outcome revealed'
          : state.eventStep === 'applied'
            ? 'Effects applied'
            : 'Event';
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
          Severity: {event.severity} · Step: {stepTitle}
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
        {state.eventStep === 'choice' ? (
          <div className="mt-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Choices</div>
            {(event.choices ?? []).map((choice) => {
              const p = choice.probability ?? { success: 33, partial: 34, failure: 33 };
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => selectEventChoice(choice.id)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-left hover:bg-stone-100"
                >
                  <div className="text-sm font-semibold text-stone-900">{choice.text}</div>
                  <div className="mt-1 text-xs text-stone-500">
                    Success {p.success}% · Partial {p.partial}% · Failure {p.failure}%
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
        {state.eventStep === 'rolling' ? (
          <div className="mt-6 flex items-center justify-center">
            <div className="h-20 w-20 animate-pulse rounded-xl border-2 border-amber-500 bg-amber-100 text-center text-3xl font-black leading-[4.5rem] text-amber-900">
              d100
            </div>
          </div>
        ) : null}
        {state.eventStep === 'revealed' && state.diceResult ? (
          <div className="mt-5 space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-3">
            <div className="text-xs font-bold uppercase tracking-widest text-stone-500">Dice result</div>
            <div className="text-2xl font-black text-board-ink">Roll {state.diceResult.roll}</div>
            <div className="text-sm font-semibold text-stone-800">{state.lastOutcomeSummary}</div>
            <div className="text-xs text-stone-600">
              Success ≤ {state.diceResult.threshold.success}, partial ≤{' '}
              {state.diceResult.threshold.success + state.diceResult.threshold.partial}
            </div>
            {selectedOutcome ? (
              <div className="pt-1 text-xs text-stone-600">
                {formatStatPreview(selectedOutcome.statDeltas).join(' · ')}
              </div>
            ) : null}
          </div>
        ) : null}
        {state.eventStep === 'applied' ? (
          <div className="mt-5 space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
            <div className="text-xs font-bold uppercase tracking-widest text-stone-500">Applied changes</div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-stone-800">
              {formatStatPreview(state.statChangesPreview ?? {}).map((line, i) => (
                <li key={`s-${i}`}>{line}</li>
              ))}
              {formatResourcePreview(state.resourceChangesPreview ?? {}).map((line, i) => (
                <li key={`r-${i}`}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {event.outcomePreview && state.eventStep === 'choice' ? (
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
        {state.eventStep === 'choice' ? (
          <div className="mt-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Baseline effects</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-medium text-stone-800">
              {effectLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {error ? <div className="mt-3 text-xs text-rose-700">{error}</div> : null}
        {state.eventStep === 'revealed' ? (
          <button
            type="button"
            className="mt-6 w-full rounded-xl border-2 border-yellow-500 bg-yellow-400 py-3 text-sm font-black uppercase tracking-wide text-black shadow-sm hover:bg-yellow-300"
            onClick={() => applyEventOutcome()}
          >
            Apply outcome
          </button>
        ) : null}
        {state.eventStep === 'applied' ? (
          <button
            type="button"
            className="mt-6 w-full rounded-xl border-2 border-yellow-500 bg-yellow-400 py-3 text-sm font-black uppercase tracking-wide text-black shadow-sm hover:bg-yellow-300"
            onClick={() => continueEvent()}
          >
            Continue
          </button>
        ) : null}
        {selectedChoice && state.eventStep === 'rolling' ? (
          <div className="mt-4 text-center text-xs text-stone-600">Resolving: {selectedChoice.text}</div>
        ) : null}
      </div>
    </div>
  );
}
