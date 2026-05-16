'use client';

import { useEffect } from 'react';
import {
  describeGameEventEffectLines,
  type EventChoice,
  type GameState,
  type Outcome,
} from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/ui/cn';
import { labelMeta, panelInset } from '@/lib/ui/variants';

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
  const election = event.type === 'election';
  const stepTitle =
    state.eventStep === 'choice'
      ? 'Choose response'
      : state.eventStep === 'rolling'
        ? 'Resolving'
        : state.eventStep === 'revealed'
          ? 'Outcome revealed'
          : state.eventStep === 'applied'
            ? 'Applied'
            : 'Event';

  return (
    <div
      className="fixed inset-0 z-[4000] flex animate-fade-in items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="modal-backdrop" aria-hidden="true" />
      <div className={cn('modal-panel', election && 'modal-panel-election')}>
        <p className={labelMeta}>
          {election ? 'Special directive · Election cycle' : `Severity ${event.severity}`} · {stepTitle}
        </p>
        <h2 id="event-modal-title" className="mt-2 font-display text-2xl font-bold tracking-tight text-board-ink">
          {election ? 'Election Year' : event.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-state-paper-dim">{event.description}</p>
        {event.condition ? (
          <div className="mt-5">
            <p className={labelMeta}>Condition</p>
            <p className="mt-1 text-sm leading-relaxed text-state-paper">{event.condition}</p>
          </div>
        ) : null}
        {state.eventStep === 'choice' ? (
          <div className="mt-5 space-y-3">
            <p className={labelMeta}>Authorized responses</p>
            {(event.choices ?? []).map((choice) => {
              const p = choice.probability ?? { success: 33, partial: 34, failure: 33 };
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => selectEventChoice(choice.id)}
                  className={cn('choice-row', election && 'choice-row-election')}
                >
                  <div className="text-sm font-semibold text-board-ink">{choice.text}</div>
                  <div className="mt-1 text-xs text-state-paper-dim">
                    Success {p.success}% · Partial {p.partial}% · Failure {p.failure}%
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
        {state.eventStep === 'rolling' ? (
          <div className="mt-6 flex items-center justify-center">
            <div className="dice-cube">d100</div>
          </div>
        ) : null}
        {state.eventStep === 'revealed' && state.diceResult ? (
          <div className={cn('mt-5 space-y-2 p-3', panelInset)}>
            <p className={labelMeta}>Dice result</p>
            <div className="font-display text-2xl font-bold text-board-ink">Roll {state.diceResult.roll}</div>
            <div className="text-sm font-semibold text-state-paper">{state.lastOutcomeSummary}</div>
            <div className="text-xs text-state-paper-dim">
              Success ≤ {state.diceResult.threshold.success}, partial ≤{' '}
              {state.diceResult.threshold.success + state.diceResult.threshold.partial}
            </div>
            {selectedOutcome ? (
              <div className="pt-1 text-xs text-state-paper-dim">
                {formatStatPreview(selectedOutcome.statDeltas).join(' · ')}
              </div>
            ) : null}
          </div>
        ) : null}
        {state.eventStep === 'applied' ? (
          <div className={cn('mt-5 space-y-3 p-3', panelInset)}>
            <p className={labelMeta}>Applied changes</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-state-paper">
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
            <div className="rounded-md border border-faction-people/30 bg-faction-people/5 p-3">
              <p className={cn(labelMeta, 'text-faction-people')}>Success</p>
              <p className="mt-1 text-xs leading-relaxed text-state-paper-dim">{event.outcomePreview.success}</p>
            </div>
            <div className="rounded-md border border-faction-danger/30 bg-faction-danger/5 p-3">
              <p className={cn(labelMeta, 'text-faction-danger')}>Failure</p>
              <p className="mt-1 text-xs leading-relaxed text-state-paper-dim">{event.outcomePreview.failure}</p>
            </div>
          </div>
        ) : null}
        {state.eventStep === 'choice' ? (
          <div className="mt-5">
            <p className={labelMeta}>Baseline effects</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-state-paper">
              {effectLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {error ? <div className="mt-3 text-xs text-faction-danger">{error}</div> : null}
        {state.eventStep === 'revealed' ? (
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => applyEventOutcome()}>
            Apply outcome
          </Button>
        ) : null}
        {state.eventStep === 'applied' ? (
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => continueEvent()}>
            Continue cycle
          </Button>
        ) : null}
        {selectedChoice && state.eventStep === 'rolling' ? (
          <p className="mt-4 text-center text-xs text-state-paper-dim">Resolving: {selectedChoice.text}</p>
        ) : null}
      </div>
    </div>
  );
}
