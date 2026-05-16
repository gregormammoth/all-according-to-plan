'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FinalStatsSnapshot, GameResult } from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { bodyMuted, labelMeta, labelSection, panelInset, pillVariant } from '@/lib/ui/variants';

type AnimatedSnapshot = {
  peopleSatisfaction: number;
  peopleLoyalty: number;
  peopleFear: number;
  elitesSatisfaction: number;
  elitesLoyalty: number;
  elitesFear: number;
  securitySatisfaction: number;
  securityLoyalty: number;
  securityFear: number;
  money: number;
  influence: number;
  authority: number;
};

const zeroAnimated: AnimatedSnapshot = {
  peopleSatisfaction: 0,
  peopleLoyalty: 0,
  peopleFear: 0,
  elitesSatisfaction: 0,
  elitesLoyalty: 0,
  elitesFear: 0,
  securitySatisfaction: 0,
  securityLoyalty: 0,
  securityFear: 0,
  money: 0,
  influence: 0,
  authority: 0,
};

function tintByResult(result: GameResult) {
  if (result.type === 'victory') {
    return {
      title: 'Victory',
      shell: 'from-state-olive/20 via-state-charcoal to-state-graphite',
      accent: 'text-faction-people',
      badge: 'authority' as const,
    };
  }
  if (result.type === 'failure') {
    return {
      title: 'Collapse',
      shell: 'from-faction-danger/15 via-state-charcoal to-state-void',
      accent: 'text-faction-danger',
      badge: 'danger' as const,
    };
  }
  return {
    title: 'Managed Survival',
    shell: 'from-state-amber/10 via-state-charcoal to-state-graphite',
    accent: 'text-state-amber',
    badge: 'election' as const,
  };
}

function performanceText(result: GameResult, snapshot: FinalStatsSnapshot): string {
  if (result.type === 'failure') {
    return 'Public legitimacy collapsed and elite-security cohesion failed to hold the center.';
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
  const state = useGameStore((s) => s.state);
  const reset = useGameStore((s) => s.reset);
  const [animated, setAnimated] = useState<AnimatedSnapshot>(zeroAnimated);
  const result = state.gameResult;
  const snapshot = state.finalStatsSnapshot;
  const timeline = state.eventHistory;
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!snapshot) return;
    let raf = 0;
    const start = performance.now();
    const duration = 700;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setAnimated({
        peopleSatisfaction: Math.round(snapshot.stats.people.satisfaction * eased),
        peopleLoyalty: Math.round(snapshot.stats.people.loyalty * eased),
        peopleFear: Math.round(snapshot.stats.people.fear * eased),
        elitesSatisfaction: Math.round(snapshot.stats.elites.satisfaction * eased),
        elitesLoyalty: Math.round(snapshot.stats.elites.loyalty * eased),
        elitesFear: Math.round(snapshot.stats.elites.fear * eased),
        securitySatisfaction: Math.round(snapshot.stats.security.satisfaction * eased),
        securityLoyalty: Math.round(snapshot.stats.security.loyalty * eased),
        securityFear: Math.round(snapshot.stats.security.fear * eased),
        money: Math.round(snapshot.resources.money * eased),
        influence: Math.round(snapshot.resources.influence * eased),
        authority: Math.round(snapshot.resources.authority * eased),
      });
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [snapshot]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const look = useMemo(() => (result ? tintByResult(result) : null), [result]);

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
    <div className={cn('min-h-screen bg-gradient-to-b px-4 py-8', look.shell)}>
      <div
        className={cn(
          'mx-auto flex max-w-6xl flex-col gap-4 transition-all duration-slow ease-ui-out',
          entered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        )}
      >
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={labelMeta}>Final assessment</p>
              <h1 className={cn('mt-1 font-display text-4xl font-bold tracking-tight', look.accent)}>{look.title}</h1>
              <p className={cn(bodyMuted, 'mt-2')}>{result.summaryText}</p>
            </div>
            <span className={pillVariant(look.badge)}>Score {result.score}</span>
          </div>
        </Panel>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Panel className="!p-4">
                <h3 className={cn(labelMeta, 'text-faction-people')}>People</h3>
                <div className="mt-2 space-y-1 text-sm text-state-paper">
                  <div>Satisfaction {animated.peopleSatisfaction}</div>
                  <div>Loyalty {animated.peopleLoyalty}</div>
                  <div>Fear {animated.peopleFear}</div>
                </div>
              </Panel>
              <Panel className="!p-4">
                <h3 className={cn(labelMeta, 'text-state-gold')}>Elites</h3>
                <div className="mt-2 space-y-1 text-sm text-state-paper">
                  <div>Satisfaction {animated.elitesSatisfaction}</div>
                  <div>Loyalty {animated.elitesLoyalty}</div>
                  <div>Fear {animated.elitesFear}</div>
                </div>
              </Panel>
              <Panel className="!p-4">
                <h3 className={cn(labelMeta, 'text-faction-security')}>Security</h3>
                <div className="mt-2 space-y-1 text-sm text-state-paper">
                  <div>Satisfaction {animated.securitySatisfaction}</div>
                  <div>Loyalty {animated.securityLoyalty}</div>
                  <div>Fear {animated.securityFear}</div>
                </div>
              </Panel>
            </div>

            <Panel className="!p-4">
              <h3 className={labelSection}>Resources</h3>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className={cn(panelInset, 'p-3')}>
                  <p className={labelMeta}>Money</p>
                  <p className="font-display text-2xl font-bold text-state-amber">$ {animated.money}</p>
                </div>
                <div className={cn(panelInset, 'p-3')}>
                  <p className={labelMeta}>Influence</p>
                  <p className="font-display text-2xl font-bold text-board-ink">{animated.influence}</p>
                </div>
                <div className={cn(panelInset, 'p-3')}>
                  <p className={labelMeta}>Authority</p>
                  <p className="font-display text-2xl font-bold text-board-ink">{animated.authority}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className={pillVariant('neutral')}>Cards played {snapshot.totalCardsPlayed}</span>
                <span className={pillVariant('neutral')}>Events {snapshot.totalEvents}</span>
              </div>
            </Panel>
          </div>

          <div className="space-y-4 lg:col-span-4">
            <Panel className="!p-4">
              <h3 className={labelSection}>Performance</h3>
              <div className="mt-3 font-display text-3xl font-bold text-board-ink">{result.score}</div>
              <p className={cn(bodyMuted, 'mt-2')}>{performanceText(result, snapshot)}</p>
            </Panel>
            <Panel className="!p-4">
              <h3 className={labelSection}>Timeline</h3>
              <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto pr-1">
                {[...timeline]
                  .sort((a, b) => a.round - b.round)
                  .map((e, i) => (
                    <div key={`${e.eventId}-${e.round}-${i}`} className={cn(panelInset, 'px-3 py-2 text-xs')}>
                      <div className="flex items-center gap-2 font-semibold text-board-ink">
                        <span>
                          Cycle {e.round} — {e.title}
                        </span>
                        {isElectionEntry(e.eventId, e.title) ? (
                          <span className={pillVariant('election')}>Election</span>
                        ) : null}
                      </div>
                      {e.outcomeLabel ? <p className="mt-0.5 text-state-paper-dim">{e.outcomeLabel}</p> : null}
                    </div>
                  ))}
              </div>
            </Panel>
          </div>
        </section>

        <Panel>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => reset()}>
              New campaign
            </Button>
            <details className="text-xs text-state-paper-dim">
              <summary className="cursor-pointer font-display font-semibold uppercase tracking-label">
                Detailed log
              </summary>
              <div className={cn('mt-2 max-h-40 overflow-y-auto p-2', panelInset)}>
                {state.log.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </details>
          </div>
        </Panel>
      </div>
    </div>
  );
}
