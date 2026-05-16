'use client';

import { useRef } from 'react';
import {
  MAX_HAND_CARDS,
  canPay,
  describeCardEffectBullets,
  type CardCost,
} from '@all-according-to-plan/shared';
import { useAudio } from '@/audio/useAudio';
import { cardFrameClass, cardTypeBadgeClass } from '@/lib/cardFrame';
import { useGameStore } from '@/state/gameStore';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { bodyMuted, labelMeta, labelSection, panelInset } from '@/lib/ui/variants';

function formatCostBold(cost: CardCost) {
  const bits: string[] = [];
  if (cost.money) bits.push(`$ ${cost.money}`);
  if (cost.influence) bits.push(`Inf ${cost.influence}`);
  if (cost.authority) bits.push(`Auth ${cost.authority}`);
  return bits.length ? bits.join(' · ') : '—';
}

export function CardBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastHoverId = useRef<string | null>(null);
  const { play: playSfx } = useAudio();
  const state = useGameStore((s) => s.state);
  const library = useGameStore((s) => s.library);
  const error = useGameStore((s) => s.error);
  const playSelectMode = useGameStore((s) => s.playSelectMode);
  const togglePlaySelectMode = useGameStore((s) => s.togglePlaySelectMode);
  const playCard = useGameStore((s) => s.play);
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
    <Panel bleed className="!p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={labelSection}>Operational hand</h3>
            <span className={cn(labelMeta, 'rounded border border-state-steel/50 px-2 py-0.5')}>
              {state.hand.length} / {MAX_HAND_CARDS}
            </span>
          </div>
          <p className={cn(bodyMuted, 'mt-2 max-w-xl')}>
            {eventModalOpen
              ? 'Resolve the crisis directive in the modal. Continuation triggers upkeep: bonus draw and treasury credit.'
              : `Expend ${state.maxPlayerActionsPerRound} actions per cycle, then process the mandatory state event before advance.`}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {error ? <p className="max-w-xs text-right text-sm text-faction-danger">{error}</p> : null}
          <div className="flex flex-nowrap justify-end gap-2">
            <Button
              variant="primary"
              size="md"
              active={playSelectMode}
              disabled={dead}
              onClick={() => togglePlaySelectMode()}
            >
              Play card
            </Button>
            <Button
              disabled={dead || state.deck.length === 0}
              onClick={() => {
                playSfx('draw_card');
                draw();
              }}
            >
              Draw
            </Button>
            <Button
              disabled={dead}
              onClick={() => {
                playSfx('resource_gain');
                gain('money');
              }}
            >
              Treasury +1
            </Button>
          </div>
        </div>
      </div>
      <div className="relative mt-4">
        <button
          type="button"
          aria-label="Scroll hand left"
          className="absolute left-0 top-1/2 z-[1] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded border border-state-steel/60 bg-state-graphite font-display text-state-paper shadow-btn transition-all duration-ui hover:border-state-amber/40 hover:shadow-btn-hover sm:flex"
          onClick={() => scrollBy(-200)}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Scroll hand right"
          className="absolute right-0 top-1/2 z-[1] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded border border-state-steel/60 bg-state-graphite font-display text-state-paper shadow-btn transition-all duration-ui hover:border-state-amber/40 hover:shadow-btn-hover sm:flex"
          onClick={() => scrollBy(200)}
        >
          ›
        </button>
        <div ref={scrollRef} className="hand-strip scroll-hand flex gap-3 scroll-smooth px-0 sm:px-10">
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
                onMouseEnter={() => {
                  if (disabled || lastHoverId.current === id) return;
                  lastHoverId.current = id;
                  playSfx('card_hover');
                }}
                onMouseLeave={() => {
                  if (lastHoverId.current === id) lastHoverId.current = null;
                }}
                onClick={() => {
                  playSfx('card_play');
                  playCard(id);
                }}
                className={cardFrameClass(card.type, { highlighted, disabled })}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-sm font-bold uppercase tracking-tight text-board-ink">
                      {card.name}
                    </div>
                    <div className={cn(labelMeta, 'mt-0.5')}>
                      {card.type} {card.archetype ? `· ${card.archetype}` : ''}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded',
                      cardTypeBadgeClass(card.type)
                    )}
                  >
                    {typeInitial}
                  </div>
                </div>
                <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-state-paper-dim">{card.description}</p>
                <div className="mt-3 font-display text-lg font-bold tracking-tight text-state-amber">
                  COST {formatCostBold(card.cost)}
                </div>
                <ul className={cn('mt-2 space-y-1 border-t border-state-steel/40 pt-2 text-[11px] text-state-paper-dim', panelInset, '!border-0 !bg-transparent !shadow-none')}>
                  {bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
