'use client';

import { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MAX_HAND_CARDS, canPay } from '@all-according-to-plan/shared';
import { useAudio } from '@/audio/useAudio';
import { HandDirectiveCard } from '@/components/cards/HandDirectiveCard';
import { useGameStore } from '@/state/gameStore';
import { useMotionStore } from '@/state/motionStore';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { bodyMuted, labelMeta, labelSection } from '@/lib/ui/variants';

export function CardBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastHoverId = useRef<string | null>(null);
  const playingRef = useRef<string | null>(null);
  const { play: playSfx } = useAudio();
  const state = useGameStore((s) => s.state);
  const library = useGameStore((s) => s.library);
  const error = useGameStore((s) => s.error);
  const playCard = useGameStore((s) => s.play);
  const draw = useGameStore((s) => s.draw);
  const gain = useGameStore((s) => s.gain);
  const setCue = useMotionStore((s) => s.setCue);
  const clearCue = useMotionStore((s) => s.clearCue);
  const setPendingPlayExit = useMotionStore((s) => s.setPendingPlayExit);
  const pendingPlayExit = useMotionStore((s) => s.pendingPlayExit);
  const flashArchive = useMotionStore((s) => s.flashArchive);
  const clearArchiveFlash = useMotionStore((s) => s.clearArchiveFlash);
  const cue = useMotionStore((s) => s.cue);
  const actionsRemaining =
    state.phase === 'game_over' || state.phase === 'event_modal'
      ? 0
      : Math.max(0, state.maxPlayerActionsPerRound - state.playerActionsUsed);
  const eventModalOpen = state.phase === 'event_modal';
  const dead = state.phase === 'game_over' || state.phase === 'event_modal' || actionsRemaining <= 0;
  const drawCueId = useMotionStore((s) => (s.cue?.type === 'draw' ? s.cue.cardId : null));

  const scrollBy = (dx: number) => {
    scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });
  };

  const handlePlay = (id: string) => {
    if (playingRef.current === id) return;
    const card = library.get(id);
    if (!card || dead || !canPay(state.resources, card.cost)) return;

    playingRef.current = id;
    setCue({ type: 'play', cardId: id, cardKind: card.type });
    setPendingPlayExit({ cardId: id, cardKind: card.type });
    playSfx('card_play');
    playCard(id);

    if (card.type === 'event') {
      flashArchive(id);
      window.setTimeout(() => clearArchiveFlash(), 700);
    }

    window.setTimeout(() => {
      clearCue();
      setPendingPlayExit(null);
      playingRef.current = null;
    }, 320);
  };

  const handIds = [...state.hand];
  if (
    pendingPlayExit &&
    !handIds.includes(pendingPlayExit.cardId) &&
    library.has(pendingPlayExit.cardId)
  ) {
    handIds.unshift(pendingPlayExit.cardId);
  }

  const handleDraw = () => {
    const before = new Set(state.hand);
    playSfx('draw_card');
    draw();
    const added = useGameStore.getState().state.hand.find((cid) => !before.has(cid));
    if (added) {
      setCue({ type: 'draw', cardId: added });
      window.setTimeout(() => clearCue(), 280);
    }
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
              : `Select a directive to enact. ${state.maxPlayerActionsPerRound} actions per cycle — then mandatory state event.`}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {error ? <p className="max-w-xs text-right text-sm text-faction-danger">{error}</p> : null}
          <div className="flex flex-nowrap justify-end gap-2">
            <Button disabled={dead || state.deck.length === 0} onClick={handleDraw}>
              Draw directive
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
      <div className="relative mt-4 min-h-[19rem]">
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
        <div
          ref={scrollRef}
          className="hand-strip scroll-hand flex gap-3 scroll-smooth px-0 sm:px-10"
        >
          <AnimatePresence mode="sync">
            {handIds.map((id) => {
              const card = library.get(id);
              if (!card) return null;
              const affordable = canPay(state.resources, card.cost);
              const isExiting = pendingPlayExit?.cardId === id && !state.hand.includes(id);
              const disabled = dead || !affordable || isExiting;
              const playExit =
                isExiting || (cue?.type === 'play' && cue.cardId === id);
              return (
                <HandDirectiveCard
                  key={id}
                  card={card}
                  disabled={disabled}
                  drawEntry={drawCueId === id}
                  playExit={playExit}
                  onHover={() => {
                    if (disabled || lastHoverId.current === id) return;
                    lastHoverId.current = id;
                    playSfx('card_hover');
                  }}
                  onLeave={() => {
                    if (lastHoverId.current === id) lastHoverId.current = null;
                  }}
                  onPlay={() => handlePlay(id)}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </Panel>
  );
}
