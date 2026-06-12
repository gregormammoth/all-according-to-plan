'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FinalStatsSnapshot, GameResult } from '@all-according-to-plan/shared';
import { controlBand, legitimacyBand } from '@/lib/regime/bands';
import { useGameStore } from '@/state/gameStore';
import { AnimatedNumber } from '@/lib/motion/AnimatedNumber';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import {
  gameOverPanel,
  gameOverShell,
  gameOverStagger,
  staggerItem,
  transitions,
} from '@/lib/motion/variants';
import { duration } from '@/lib/motion/tokens';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { bodyMuted, labelMeta, labelSection, panelInset, pillVariant } from '@/lib/ui/variants';

function tintByResult(result: GameResult) {
  if (result.type === 'victory') {
    return {
      title: 'Victory',
      shell: 'from-state-olive/20 via-state-charcoal to-state-graphite',
      accent: 'text-faction-people',
      badge: 'authority' as const,
      overlay: 'bg-faction-people/[0.04]',
    };
  }
  if (result.type === 'failure') {
    return {
      title: 'Collapse',
      shell: 'from-faction-danger/15 via-state-charcoal to-state-void',
      accent: 'text-faction-danger',
      badge: 'danger' as const,
      overlay: 'bg-faction-danger/[0.06]',
    };
  }
  return {
    title: 'Managed Survival',
    shell: 'from-state-amber/10 via-state-charcoal to-state-graphite',
    accent: 'text-state-amber',
    badge: 'election' as const,
    overlay: 'bg-state-amber/[0.03]',
  };
}

function performanceText(result: GameResult, snapshot: FinalStatsSnapshot): string {
  if (result.type === 'failure') {
    if (result.collapseCause === 'legitimacy') {
      return 'The population no longer accepted the regime. Mass unrest forced a leadership change.';
    }
    if (result.collapseCause === 'control') {
      return 'Security forces and elite factions abandoned the regime. State control collapsed.';
    }
    return 'Faction cohesion failed and the state collapsed under internal pressure.';
  }
  if (result.type === 'victory') {
    return 'Elite alignment and public compliance remained high enough to consolidate long-term control.';
  }
  const people = snapshot.stats.people;
  if (people.fear > people.satisfaction) {
    return 'Control was maintained primarily through pressure. Stability is real, but fragile.';
  }
  return 'You balanced faction pressure enough to survive, though systemic weaknesses remain.';
}

function isElectionEntry(eventId: string, title: string): boolean {
  return eventId.startsWith('election_round_') || title.toLowerCase().includes('election');
}

export function GameOverScreen() {
  const { reduced } = useMotionPrefs();
  const state = useGameStore((s) => s.state);
  const reset = useGameStore((s) => s.reset);
  const result = state.gameResult;
  const snapshot = state.finalStatsSnapshot;
  const timeline = state.eventHistory;

  const look = useMemo(() => (result ? tintByResult(result) : null), [result]);
  const isFailure = result?.type === 'failure';
  const isVictory = result?.type === 'victory';

  if (!result || !snapshot || !look) {
    return (
      <div className="min-h-screen px-4 py-8">
        <Panel className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-bold text-board-ink">Campaign complete</h2>
          <Button variant="primary" className="mt-4" onClick={() => reset()}>
            New campaign
          </Button>
        </Panel>
      </div>
    );
  }

  return (
    <motion.div className={cn('relative min-h-screen overflow-hidden bg-gradient-to-b px-4 py-8', look.shell)}>
      <motion.div
        className={cn('pointer-events-none absolute inset-0', look.overlay)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.01 : duration.gameOver }}
        aria-hidden
      />
      {isFailure && !reduced ? (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-faction-danger/[0.04]"
          animate={{ opacity: [0, 0.12, 0.06, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      ) : null}
      {isVictory && !reduced ? (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-state-olive/10 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration.cinematic }}
          aria-hidden
        />
      ) : null}

      <motion.div
        className="relative mx-auto flex max-w-6xl flex-col gap-4"
        variants={gameOverShell}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={gameOverStagger} initial="hidden" animate="visible">
          <motion.div variants={gameOverPanel}>
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className={labelMeta}>Final assessment</p>
                  <motion.h1
                    className={cn('mt-1 font-display text-4xl font-bold tracking-tight', look.accent)}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, ...transitions.cinematic }}
                  >
                    {look.title}
                  </motion.h1>
                  <motion.p
                    className={cn(bodyMuted, 'mt-2')}
                    variants={staggerItem}
                  >
                    {result.summaryText}
                  </motion.p>
                </div>
                <motion.span
                  className={pillVariant(look.badge)}
                  initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, ...transitions.ui }}
                >
                  Score{' '}
                  <AnimatedNumber value={result.score} className="font-display font-bold" />
                </motion.span>
              </div>
            </Panel>
          </motion.div>

          <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <motion.div className="space-y-4 lg:col-span-8" variants={gameOverStagger}>
              <motion.div
                className="grid grid-cols-1 gap-4 md:grid-cols-3"
                variants={gameOverStagger}
              >
                {(
                  [
                    ['People', 'text-faction-people', snapshot.stats.people],
                    ['Elites', 'text-state-gold', snapshot.stats.elites],
                    ['Security', 'text-faction-security', snapshot.stats.security],
                  ] as const
                ).map(([title, accent, group], i) => (
                  <motion.div
                    key={title}
                    variants={gameOverPanel}
                    custom={i}
                    animate={
                      isFailure && !reduced
                        ? { x: [0, i % 2 === 0 ? -1 : 1, 0], opacity: [1, 0.95, 1] }
                        : undefined
                    }
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <Panel className="!p-4">
                      <h3 className={cn(labelMeta, accent)}>{title}</h3>
                      <motion.div className="mt-2 space-y-1 text-sm text-state-paper" variants={staggerItem}>
                        <motion.div variants={staggerItem}>
                          Satisfaction{' '}
                          <AnimatedNumber value={group.satisfaction} format={(n) => String(Math.round(n))} />
                        </motion.div>
                        <motion.div variants={staggerItem}>
                          Loyalty{' '}
                          <AnimatedNumber value={group.loyalty} format={(n) => String(Math.round(n))} />
                        </motion.div>
                        <motion.div variants={staggerItem}>
                          Fear{' '}
                          <AnimatedNumber value={group.fear} format={(n) => String(Math.round(n))} />
                        </motion.div>
                      </motion.div>
                    </Panel>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={gameOverPanel}>
                <Panel className="!p-4">
                  <h3 className={labelSection}>Regime tracks</h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <motion.div className={cn(panelInset, 'p-3')} variants={staggerItem}>
                      <p className={labelMeta}>Legitimacy</p>
                      <p className="font-display text-2xl font-bold text-board-ink">
                        <AnimatedNumber value={snapshot.finalLegitimacy} /> / 100
                      </p>
                      <span className={cn('mt-2 inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase', legitimacyBand(snapshot.finalLegitimacy).badgeClass)}>
                        {legitimacyBand(snapshot.finalLegitimacy).label}
                      </span>
                    </motion.div>
                    <motion.div className={cn(panelInset, 'p-3')} variants={staggerItem}>
                      <p className={labelMeta}>Control</p>
                      <p className="font-display text-2xl font-bold text-board-ink">
                        <AnimatedNumber value={snapshot.finalControl} /> / 100
                      </p>
                      <span className={cn('mt-2 inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase', controlBand(snapshot.finalControl).badgeClass)}>
                        {controlBand(snapshot.finalControl).label}
                      </span>
                    </motion.div>
                  </div>
                </Panel>
              </motion.div>

              <motion.div variants={gameOverPanel}>
                <Panel className="!p-4">
                  <h3 className={labelSection}>Resources</h3>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    <motion.div className={cn(panelInset, 'p-3')} variants={staggerItem}>
                      <p className={labelMeta}>Money</p>
                      <p className="font-display text-2xl font-bold text-state-amber">
                        $ <AnimatedNumber value={snapshot.resources.money} />
                      </p>
                    </motion.div>
                    <motion.div className={cn(panelInset, 'p-3')} variants={staggerItem}>
                      <p className={labelMeta}>Influence</p>
                      <p className="font-display text-2xl font-bold text-board-ink">
                        <AnimatedNumber value={snapshot.resources.influence} />
                      </p>
                    </motion.div>
                    <motion.div className={cn(panelInset, 'p-3')} variants={staggerItem}>
                      <p className={labelMeta}>Authority</p>
                      <p className="font-display text-2xl font-bold text-board-ink">
                        <AnimatedNumber value={snapshot.resources.authority} />
                      </p>
                    </motion.div>
                  </div>
                  <motion.div className="mt-4 flex flex-wrap gap-3" variants={staggerItem}>
                    <span className={pillVariant('neutral')}>Cards played {snapshot.totalCardsPlayed}</span>
                    <span className={pillVariant('neutral')}>Events {snapshot.totalEvents}</span>
                  </motion.div>
                </Panel>
              </motion.div>
            </motion.div>

            <motion.div className="space-y-4 lg:col-span-4" variants={gameOverStagger}>
              <motion.div variants={gameOverPanel}>
                <Panel className="!p-4">
                  <h3 className={labelSection}>Performance</h3>
                  <div className="mt-3 font-display text-3xl font-bold text-board-ink">
                    <AnimatedNumber value={result.score} durationMs={900} />
                  </div>
                  <p className={cn(bodyMuted, 'mt-2')}>{performanceText(result, snapshot)}</p>
                </Panel>
              </motion.div>
              <motion.div variants={gameOverPanel}>
                <Panel className="!p-4">
                  <h3 className={labelSection}>Timeline</h3>
                  <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto pr-1">
                    <AnimatePresence initial={false}>
                      {[...timeline]
                        .sort((a, b) => a.round - b.round)
                        .map((e, i) => (
                          <motion.div
                            key={`${e.eventId}-${e.round}-${i}`}
                            className={cn(panelInset, 'px-3 py-2 text-xs')}
                            initial={reduced ? false : { opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: reduced ? 0 : 0.4 + i * 0.05, ...transitions.ui }}
                          >
                            <motion.div className="flex items-center gap-2 font-semibold text-board-ink">
                              <span>
                                Cycle {e.round} — {e.title}
                              </span>
                              {isElectionEntry(e.eventId, e.title) ? (
                                <span className={pillVariant('election')}>Election</span>
                              ) : null}
                            </motion.div>
                            {e.outcomeLabel ? (
                              <p className="mt-0.5 text-state-paper-dim">{e.outcomeLabel}</p>
                            ) : null}
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </Panel>
              </motion.div>
            </motion.div>
          </section>

          <motion.div variants={gameOverPanel}>
            <Panel>
              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, ...transitions.ui }}
              >
                <Button variant="primary" onClick={() => reset()}>
                  New campaign
                </Button>
                <details className="text-xs text-state-paper-dim">
                  <summary className="cursor-pointer font-display font-semibold uppercase tracking-label">
                    Detailed log
                  </summary>
                  <motion.div
                    className={cn('mt-2 max-h-40 overflow-y-auto p-2', panelInset)}
                    initial={false}
                  >
                    {state.log.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </motion.div>
                </details>
              </motion.div>
            </Panel>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

