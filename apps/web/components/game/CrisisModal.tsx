'use client';

import { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { crisesDocument, type GameState } from '@all-according-to-plan/shared';
import { DiceRevealPanel, DiceRollDisplay } from '@/components/motion/DiceRollDisplay';
import { useGameStore } from '@/state/gameStore';
import { Button } from '@/components/ui/Button';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { modalBackdrop, modalPanel, staggerContainer, staggerItem, transitions } from '@/lib/motion/variants';
import { labelMeta } from '@/lib/ui/variants';

const crisisById = new Map(crisesDocument.crises.map((c) => [c.id, c]));

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

function attributeLabel(attribute: 'legitimacy' | 'control'): string {
  return attribute === 'legitimacy' ? 'Legitimacy' : 'Control';
}

export function CrisisModal() {
  const { reduced } = useMotionPrefs();
  const state = useGameStore((s) => s.state);
  const crisisModal = useGameStore((s) => s.crisisModal);
  const rollCrisisTest = useGameStore((s) => s.rollCrisisTest);
  const applyCrisisOutcome = useGameStore((s) => s.applyCrisisOutcome);
  const error = useGameStore((s) => s.error);

  const crisis = crisisModal.crisisId ? crisisById.get(crisisModal.crisisId) : null;
  const test = crisis?.resolution?.test;

  const handleRollComplete = useCallback(() => {
    rollCrisisTest();
  }, [rollCrisisTest]);

  const stepTitle =
    state.crisisStep === 'rolling'
      ? 'Crisis test'
      : state.crisisStep === 'revealed'
        ? 'Outcome revealed'
        : 'Crisis';

  return (
    <AnimatePresence>
      {crisisModal.isOpen && crisis ? (
        <motion.div
          className="fixed inset-0 z-[4000] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crisis-modal-title"
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
            className="modal-panel !animate-none"
            variants={modalPanel}
            transition={reduced ? { duration: 0.01 } : transitions.modal}
          >
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.p className={labelMeta} variants={staggerItem}>
                {crisis.severity === 'major' ? 'Major crisis' : 'Crisis'} · {stepTitle}
              </motion.p>
              <motion.h2
                id="crisis-modal-title"
                className="mt-2 font-display text-2xl font-bold tracking-tight text-board-ink"
                variants={staggerItem}
              >
                {crisis.name}
              </motion.h2>
              <motion.p className="mt-3 text-sm leading-relaxed text-state-paper-dim" variants={staggerItem}>
                {crisis.description}
              </motion.p>

              {test ? (
                <motion.div className="mt-5" variants={staggerItem}>
                  <p className={labelMeta}>Resolution test</p>
                  <p className="mt-1 text-sm text-state-paper">
                    {attributeLabel(test.attribute)} check · base difficulty {test.difficulty}
                  </p>
                </motion.div>
              ) : null}

              <AnimatePresence mode="wait">
                {state.crisisStep === 'rolling' ? (
                  <motion.div
                    key="rolling"
                    className="mt-6 flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transitions.ui}
                  >
                    <DiceRollDisplay onComplete={handleRollComplete} />
                    <p className="mt-4 text-center text-xs text-state-paper-dim">
                      Rolling against {test ? attributeLabel(test.attribute) : 'crisis'} threshold
                    </p>
                  </motion.div>
                ) : null}

                {state.crisisStep === 'revealed' && state.crisisDiceResult ? (
                  <motion.div key="revealed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <DiceRevealPanel
                      roll={state.crisisDiceResult.roll}
                      outcomeType={state.crisisDiceResult.success ? 'success' : 'failure'}
                      summary={state.lastOutcomeSummary ?? ''}
                    />
                    <div className="mt-2 text-xs text-state-paper-dim">
                      Success if roll ≤ {state.crisisDiceResult.chance} ({attributeLabel(state.crisisDiceResult.attribute)})
                    </div>
                    <div className="pt-1 text-xs text-state-paper-dim">
                      {[
                        ...formatStatPreview(state.statChangesPreview ?? {}),
                        ...formatRegimePreview(state.regimeChangesPreview),
                        ...formatResourcePreview(state.resourceChangesPreview ?? {}),
                      ].join(' · ')}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {error ? <div className="mt-3 text-xs text-faction-danger">{error}</div> : null}

              {state.crisisStep === 'revealed' ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : 0.15, ...transitions.ui }}
                >
                  <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => applyCrisisOutcome()}>
                    Apply outcome
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
