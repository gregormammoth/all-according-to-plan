'use client';

import { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { canPay } from '@all-according-to-plan/shared';
import { useAudio } from '@/audio/useAudio';
import { HandDirectiveCard } from '@/components/cards/HandDirectiveCard';
import { GameFooter } from '@/components/game/GameFooter';
import { useGameStore } from '@/state/gameStore';
import { useMotionStore } from '@/state/motionStore';
import { Button } from '@/components/ui/Button';

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
    <section className="player-hand-zone">
      <div className="player-hand-toolbar">
        <h2 className="player-hand-title">Directives</h2>
        <div className="player-hand-utils">
          {error ? <p className="hand-error">{error}</p> : null}
          <Button disabled={dead || state.deck.length === 0} size="sm" variant="ghost" onClick={handleDraw}>
            Draw
          </Button>
          <Button
            disabled={dead}
            size="sm"
            variant="ghost"
            onClick={() => {
              playSfx('resource_gain');
              gain('money');
            }}
          >
            Treasury +1
          </Button>
        </div>
      </div>

      <div className="player-hand-cards">
        <div ref={scrollRef} className="hand-strip player-hand-strip flex gap-3 px-2 pb-1">
          <AnimatePresence mode="sync">
            {handIds.map((id) => {
              const card = library.get(id);
              if (!card) return null;
              const affordable = canPay(state.resources, card.cost);
              const isExiting = pendingPlayExit?.cardId === id && !state.hand.includes(id);
              const disabled = dead || !affordable || isExiting;
              const playExit = isExiting || (cue?.type === 'play' && cue.cardId === id);
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
          {handIds.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-8 text-sm text-state-paper-dim">
              {eventModalOpen ? 'Awaiting directive resolution.' : 'Hand empty — draw or enact treasury action.'}
            </div>
          ) : null}
        </div>
      </div>

      <GameFooter />
    </section>
  );
}
