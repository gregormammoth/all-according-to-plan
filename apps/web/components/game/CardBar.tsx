'use client';

import { useRef } from 'react';
import {
  MAX_HAND_CARDS,
  canPay,
  describeCardEffectBullets,
  type CardCost,
} from '@all-according-to-plan/shared';
import { cardFrameClass, cardTypeBadgeClass } from '@/lib/cardFrame';
import { useGameStore } from '@/state/gameStore';

function formatCostBold(cost: CardCost) {
  const bits: string[] = [];
  if (cost.money) bits.push(`$ ${cost.money}`);
  if (cost.influence) bits.push(`Inf ${cost.influence}`);
  if (cost.authority) bits.push(`Auth ${cost.authority}`);
  return bits.length ? bits.join(' · ') : '—';
}

export function CardBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const state = useGameStore((s) => s.state);
  const library = useGameStore((s) => s.library);
  const error = useGameStore((s) => s.error);
  const playSelectMode = useGameStore((s) => s.playSelectMode);
  const togglePlaySelectMode = useGameStore((s) => s.togglePlaySelectMode);
  const play = useGameStore((s) => s.play);
  const draw = useGameStore((s) => s.draw);
  const gain = useGameStore((s) => s.gain);
  const actionsRemaining =
    state.phase === 'game_over' || state.phase === 'event_modal'
      ? 0
      : Math.max(0, state.maxPlayerActionsPerRound - state.playerActionsUsed);
  const eventModalOpen = state.phase === 'event_modal';
  const dead = state.phase === 'game_over' || state.phase === 'event_modal' || actionsRemaining <= 0;

  const scrollBy = (dx: number) => {
    scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">Your hand</h3>
            <span className="text-sm" aria-hidden="true">
              🃏
            </span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-700">
              {state.hand.length} / {MAX_HAND_CARDS}
            </span>
          </div>
          <p className="mt-2 max-w-xl text-sm text-stone-600">
            {eventModalOpen
              ? 'Resolve the event in the modal. After you continue, the event applies, then upkeep: bonus draw and +1 money.'
              : `Spend ${state.maxPlayerActionsPerRound} actions, then acknowledge the round event before the next round begins.`}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {error ? <p className="max-w-xs text-right text-sm text-rose-700">{error}</p> : null}
          <div className="flex flex-nowrap justify-end gap-2">
            <button
              type="button"
              disabled={dead}
              onClick={() => togglePlaySelectMode()}
              className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
                playSelectMode
                  ? 'border-yellow-500 bg-yellow-400 text-black shadow-sm'
                  : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-50'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Play card
            </button>
            <button
              type="button"
              disabled={dead || state.deck.length === 0}
              onClick={() => draw()}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-stone-800 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Draw card
            </button>
            <button
              type="button"
              disabled={dead}
              onClick={() => gain('money')}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-stone-800 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Gain +1 money
            </button>
          </div>
        </div>
      </div>
      <div className="relative mt-4">
        <button
          type="button"
          aria-label="Scroll hand left"
          className="absolute left-0 top-1/2 z-[1] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 sm:flex"
          onClick={() => scrollBy(-200)}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Scroll hand right"
          className="absolute right-0 top-1/2 z-[1] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 sm:flex"
          onClick={() => scrollBy(200)}
        >
          ›
        </button>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-0 pb-2 sm:px-10"
        >
          {state.hand.map((id) => {
            const card = library.get(id);
            if (!card) return null;
            const affordable = canPay(state.resources, card.cost);
            const highlighted = playSelectMode && !dead && affordable;
            const disabled = !playSelectMode || dead || !affordable;
            const typeInitial = (card.type?.[0] ?? '?').toUpperCase();
            const bullets = describeCardEffectBullets(card);
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => play(id)}
                className={`flex w-[min(100%,220px)] shrink-0 flex-col rounded-xl border-2 p-3 text-left shadow-sm transition ${cardFrameClass(
                  card.type
                )} ${highlighted ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-white' : ''} disabled:cursor-not-allowed disabled:opacity-45`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-black uppercase tracking-tight text-board-ink">{card.name}</div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                      {card.type} {card.archetype ? `· ${card.archetype}` : ''}
                    </div>
                  </div>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${cardTypeBadgeClass(
                      card.type
                    )}`}
                  >
                    {typeInitial}
                  </div>
                </div>
                <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-stone-600">{card.description}</p>
                <div className="mt-3 text-lg font-black tracking-tight text-board-ink">COST {formatCostBold(card.cost)}</div>
                <ul className="mt-2 space-y-1 border-t border-stone-100 pt-2 text-[11px] font-medium text-stone-700">
                  {bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
