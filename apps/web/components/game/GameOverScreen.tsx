'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FinalStatsSnapshot, GameResult } from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';

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
      shell: 'from-emerald-50 via-amber-50 to-emerald-100',
      accent: 'text-emerald-800',
      badge: 'border-emerald-300 bg-emerald-100 text-emerald-900',
    };
  }
  if (result.type === 'failure') {
    return {
      title: 'Collapse',
      shell: 'from-rose-50 via-orange-50 to-rose-100',
      accent: 'text-rose-800',
      badge: 'border-rose-300 bg-rose-100 text-rose-900',
    };
  }
  return {
    title: 'Managed Survival',
    shell: 'from-amber-50 via-stone-50 to-amber-100',
    accent: 'text-amber-800',
    badge: 'border-amber-300 bg-amber-100 text-amber-900',
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
      <div className='min-h-screen bg-board-cream px-4 py-8'>
        <div className='mx-auto max-w-5xl rounded-xl border border-stone-200 bg-white p-6 shadow-sm'>
          <h2 className='text-2xl font-black text-stone-900'>Campaign complete</h2>
          <button
            type='button'
            className='mt-4 rounded-xl border-2 border-yellow-500 bg-yellow-400 px-4 py-2 text-sm font-black uppercase tracking-wide text-black'
            onClick={() => reset()}
          >
            Start new game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${look.shell} px-4 py-8 text-stone-900`}>
      <div
        className={`mx-auto flex max-w-6xl flex-col gap-4 transition-all duration-500 ${
          entered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <section className='rounded-2xl border border-stone-200 bg-white p-6 shadow-lg'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <h1 className={`text-4xl font-black tracking-tight ${look.accent}`}>{look.title}</h1>
              <p className='mt-2 text-sm text-stone-700'>{result.summaryText}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${look.badge}`}>
              Score {result.score}
            </span>
          </div>
        </section>

        <section className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          <div className='space-y-4 lg:col-span-8'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='rounded-xl border border-stone-200 bg-white p-4 shadow-sm'>
                <h3 className='text-xs font-bold uppercase tracking-widest text-stone-600'>People</h3>
                <div className='mt-2 space-y-1 text-sm'>
                  <div>Satisfaction {animated.peopleSatisfaction}</div>
                  <div>Loyalty {animated.peopleLoyalty}</div>
                  <div>Fear {animated.peopleFear}</div>
                </div>
              </div>
              <div className='rounded-xl border border-stone-200 bg-white p-4 shadow-sm'>
                <h3 className='text-xs font-bold uppercase tracking-widest text-stone-600'>Elites</h3>
                <div className='mt-2 space-y-1 text-sm'>
                  <div>Satisfaction {animated.elitesSatisfaction}</div>
                  <div>Loyalty {animated.elitesLoyalty}</div>
                  <div>Fear {animated.elitesFear}</div>
                </div>
              </div>
              <div className='rounded-xl border border-stone-200 bg-white p-4 shadow-sm'>
                <h3 className='text-xs font-bold uppercase tracking-widest text-stone-600'>Security</h3>
                <div className='mt-2 space-y-1 text-sm'>
                  <div>Satisfaction {animated.securitySatisfaction}</div>
                  <div>Loyalty {animated.securityLoyalty}</div>
                  <div>Fear {animated.securityFear}</div>
                </div>
              </div>
            </div>

            <div className='rounded-xl border border-stone-200 bg-white p-4 shadow-sm'>
              <h3 className='text-xs font-bold uppercase tracking-widest text-stone-600'>Resources</h3>
              <div className='mt-3 grid grid-cols-3 gap-3 text-center'>
                <div className='rounded-lg border border-stone-100 bg-stone-50 p-3'>
                  <div className='text-[10px] uppercase text-stone-500'>Money</div>
                  <div className='text-2xl font-black'>$ {animated.money}</div>
                </div>
                <div className='rounded-lg border border-stone-100 bg-stone-50 p-3'>
                  <div className='text-[10px] uppercase text-stone-500'>Influence</div>
                  <div className='text-2xl font-black'>{animated.influence}</div>
                </div>
                <div className='rounded-lg border border-stone-100 bg-stone-50 p-3'>
                  <div className='text-[10px] uppercase text-stone-500'>Authority</div>
                  <div className='text-2xl font-black'>{animated.authority}</div>
                </div>
              </div>
              <div className='mt-4 flex flex-wrap gap-3 text-xs text-stone-600'>
                <span className='rounded-full border border-stone-200 bg-stone-50 px-3 py-1'>
                  Total cards played {snapshot.totalCardsPlayed}
                </span>
                <span className='rounded-full border border-stone-200 bg-stone-50 px-3 py-1'>
                  Events resolved {snapshot.totalEvents}
                </span>
              </div>
            </div>
          </div>

          <div className='space-y-4 lg:col-span-4'>
            <div className='rounded-xl border border-stone-200 bg-white p-4 shadow-sm'>
              <h3 className='text-xs font-bold uppercase tracking-widest text-stone-600'>Performance</h3>
              <div className='mt-3 text-3xl font-black text-board-ink'>{result.score}</div>
              <p className='mt-2 text-sm text-stone-700'>{performanceText(result, snapshot)}</p>
            </div>
            <div className='rounded-xl border border-stone-200 bg-white p-4 shadow-sm'>
              <h3 className='text-xs font-bold uppercase tracking-widest text-stone-600'>Timeline</h3>
              <div className='mt-3 max-h-[280px] space-y-2 overflow-y-auto pr-1'>
                {[...timeline]
                  .sort((a, b) => a.round - b.round)
                  .map((e, i) => (
                    <div key={`${e.eventId}-${e.round}-${i}`} className='rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 text-xs'>
                      <div className='flex items-center gap-2 font-semibold text-stone-800'>
                        <span>
                          Round {e.round} - {e.title}
                        </span>
                        {isElectionEntry(e.eventId, e.title) ? (
                          <span className='rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900'>
                            Election
                          </span>
                        ) : null}
                      </div>
                      {e.outcomeLabel ? <div className='mt-0.5 text-stone-500'>{e.outcomeLabel}</div> : null}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        <section className='rounded-2xl border border-stone-200 bg-white p-4 shadow-sm'>
          <div className='flex flex-wrap items-center gap-3'>
            <button
              type='button'
              className='rounded-xl border-2 border-yellow-500 bg-yellow-400 px-5 py-2 text-sm font-black uppercase tracking-wide text-black shadow-sm hover:bg-yellow-300'
              onClick={() => reset()}
            >
              Start new game
            </button>
            <details className='text-xs text-stone-600'>
              <summary className='cursor-pointer font-semibold uppercase tracking-wide'>View detailed log</summary>
              <div className='mt-2 max-h-40 overflow-y-auto rounded-lg border border-stone-100 bg-stone-50 p-2'>
                {state.log.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
