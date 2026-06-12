'use client';

import { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  describeGameEventEffectLines,
  type EventChoice,
  type GameState,
  type Outcome,
} from '@all-according-to-plan/shared';
import { DiceRevealPanel, DiceRollDisplay } from '@/components/motion/DiceRollDisplay';
import { useGameStore } from '@/state/gameStore';
import { Button } from '@/components/ui/Button';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import {
  choiceRow,
  modalBackdrop,
  modalPanel,
  staggerContainer,
  staggerItem,
  transitions,
} from '@/lib/motion/variants';
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

function formatRegimePreview(delta: GameState['regimeChangesPreview']): string[] {
  if (!delta) return [];
  const lines: string[] = [];
  if (delta.legitimacyDelta) {
    lines.push(`Legitimacy ${delta.legitimacyDelta > 0 ? '+' : ''}${delta.legitimacyDelta}`);
  }
  if (delta.controlDelta) {
    lines.push(`Control ${delta.controlDelta > 0 ? '+' : ''}${delta.controlDelta}`);
  }
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
  const { reduced } = useMotionPrefs();
  const state = useGameStore((s) => s.state);
  const isOpen = useGameStore((s) => s.eventModal.isOpen);
  const event = useGameStore((s) => s.eventModal.event);
  const selectEventChoice = useGameStore((s) => s.selectEventChoice);
  const rollEvent = useGameStore((s) => s.rollEvent);
  const applyEventOutcome = useGameStore((s) => s.applyEventOutcome);
  const continueEvent = useGameStore((s) => s.continueEvent);
  const error = useGameStore((s) => s.error);

  const handleRollComplete = useCallback(() => {
    rollEvent();
  }, [rollEvent]);

  const effectLines = event ? describeGameEventEffectLines(event) : [];
  const selectedChoice = findChoice(state);
  const selectedOutcome = outcomeFromState(state);
  const election = event?.type === 'election';
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
    <AnimatePresence>
      {isOpen && event ? (
        <motion.div
          className="fixed inset-0 z-[4000] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="modal-backdrop !animate-none"
            aria-hidden="true"
            variants={modalBackdrop}
            transition={reduced ? { duration: 0.01 } : transitions.modal}
          />
          <motion.div
            className={cn('modal-panel !animate-none', election && 'modal-panel-election')}
            variants={modalPanel}
            transition={reduced ? { duration: 0.01 } : transitions.modal}
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.p className={labelMeta} variants={staggerItem}>
                {election ? 'Special directive · Election cycle' : `Severity ${event.severity}`} · {stepTitle}
              </motion.p>
              <motion.h2
                id="event-modal-title"
                className="mt-2 font-display text-2xl font-bold tracking-tight text-board-ink"
                variants={staggerItem}
              >
                {election ? 'Election Year' : event.title}
              </motion.h2>
              <motion.p
                className="mt-3 text-sm leading-relaxed text-state-paper-dim"
                variants={staggerItem}
              >
                {event.description}
              </motion.p>

              {event.condition ? (
                <motion.div className="mt-5" variants={staggerItem}>
                  <p className={labelMeta}>Condition</p>
                  <p className="mt-1 text-sm leading-relaxed text-state-paper">{event.condition}</p>
                </motion.div>
              ) : null}

              <AnimatePresence mode="wait">
                {state.eventStep === 'choice' ? (
                  <motion.div
                    key="choice"
                    className="mt-5 space-y-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={transitions.ui}
                  >
                    <p className={labelMeta}>Authorized responses</p>
                    {(event.choices ?? []).map((choice) => {
                      const p = choice.probability ?? { success: 33, partial: 34, failure: 33 };
                      return (
                        <motion.button
                          key={choice.id}
                          type="button"
                          onClick={() => selectEventChoice(choice.id)}
                          className={cn('choice-row', election && 'choice-row-election')}
                          variants={choiceRow}
                          initial="rest"
                          whileHover={reduced ? undefined : 'hover'}
                          whileTap={reduced ? undefined : 'tap'}
                        >
                          <motion.div className="text-sm font-semibold text-board-ink">
                            {choice.text}
                          </motion.div>
                          <div className="mt-1 text-xs text-state-paper-dim">
                            Success {p.success}% · Partial {p.partial}% · Failure {p.failure}%
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                ) : null}

                {state.eventStep === 'rolling' ? (
                  <motion.div
                    key="rolling"
                    className="mt-6 flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transitions.ui}
                  >
                    <DiceRollDisplay onComplete={handleRollComplete} />
                    {selectedChoice ? (
                      <p className="mt-4 text-center text-xs text-state-paper-dim">
                        Resolving: {selectedChoice.text}
                      </p>
                    ) : null}
                  </motion.div>
                ) : null}

                {state.eventStep === 'revealed' && state.diceResult ? (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <DiceRevealPanel
                      roll={state.diceResult.roll}
                      outcomeType={state.diceResult.outcomeType}
                      summary={state.lastOutcomeSummary ?? ''}
                    />
                    <div className="mt-2 text-xs text-state-paper-dim">
                      Success ≤ {state.diceResult.threshold.success}, partial ≤{' '}
                      {state.diceResult.threshold.success + state.diceResult.threshold.partial}
                    </div>
                    {selectedOutcome ? (
                      <div className="pt-1 text-xs text-state-paper-dim">
                        {[
                          ...formatStatPreview(selectedOutcome.statDeltas),
                          ...formatRegimePreview(selectedOutcome),
                        ].join(' · ')}
                      </div>
                    ) : null}
                  </motion.div>
                ) : null}

                {state.eventStep === 'applied' ? (
                  <motion.div
                    key="applied"
                    className={cn('mt-5 space-y-3 p-3', panelInset)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={transitions.ui}
                  >
                    <p className={labelMeta}>Applied changes</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-state-paper">
                      {formatStatPreview(state.statChangesPreview ?? {}).map((line, i) => (
                        <li key={`s-${i}`}>{line}</li>
                      ))}
                      {formatResourcePreview(state.resourceChangesPreview ?? {}).map((line, i) => (
                        <li key={`r-${i}`}>{line}</li>
                      ))}
                      {formatRegimePreview(state.regimeChangesPreview).map((line, i) => (
                        <li key={`g-${i}`}>{line}</li>
                      ))}
                    </ul>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {event.outcomePreview && state.eventStep === 'choice' ? (
                <motion.div
                  className="mt-5 grid gap-4 sm:grid-cols-2"
                  variants={staggerItem}
                >
                  <motion.div
                    className="rounded-md border border-faction-people/30 bg-faction-people/5 p-3"
                    whileHover={reduced ? undefined : { y: -1 }}
                    transition={transitions.hover}
                  >
                    <p className={cn(labelMeta, 'text-faction-people')}>Success</p>
                    <p className="mt-1 text-xs leading-relaxed text-state-paper-dim">
                      {event.outcomePreview.success}
                    </p>
                  </motion.div>
                  <motion.div
                    className="rounded-md border border-faction-danger/30 bg-faction-danger/5 p-3"
                    whileHover={reduced ? undefined : { y: -1 }}
                    transition={transitions.hover}
                  >
                    <p className={cn(labelMeta, 'text-faction-danger')}>Failure</p>
                    <p className="mt-1 text-xs leading-relaxed text-state-paper-dim">
                      {event.outcomePreview.failure}
                    </p>
                  </motion.div>
                </motion.div>
              ) : null}

              {state.eventStep === 'choice' ? (
                <motion.div className="mt-5" variants={staggerItem}>
                  <p className={labelMeta}>Baseline effects</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-state-paper">
                    {effectLines.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}

              {error ? <div className="mt-3 text-xs text-faction-danger">{error}</div> : null}

              {state.eventStep === 'revealed' ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : 0.15, ...transitions.ui }}
                >
                  <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => applyEventOutcome()}>
                    Apply outcome
                  </Button>
                </motion.div>
              ) : null}
              {state.eventStep === 'applied' ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transitions.ui}
                >
                  <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => continueEvent()}>
                    Continue cycle
                  </Button>
                </motion.div>
              ) : null}
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
