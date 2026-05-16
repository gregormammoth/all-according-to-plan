'use client';

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Card } from '@all-according-to-plan/shared';
import { DirectiveCard } from '@/components/cards/DirectiveCard';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { handCardDraw, transitions } from '@/lib/motion/variants';

type HandDirectiveCardProps = {
  card: Card;
  disabled: boolean;
  drawEntry?: boolean;
  playExit?: boolean;
  onHover: () => void;
  onLeave: () => void;
  onPlay: () => void;
};

export const HandDirectiveCard = memo(function HandDirectiveCard({
  card,
  disabled,
  drawEntry = false,
  playExit = false,
  onHover,
  onLeave,
  onPlay,
}: HandDirectiveCardProps) {
  const { reduced } = useMotionPrefs();
  const isAsset = card.type === 'asset';

  const handleClick = useCallback(() => {
    if (disabled) return;
    onPlay();
  }, [disabled, onPlay]);

  return (
    <motion.button
      type="button"
      disabled={disabled}
      variants={handCardDraw}
      initial={drawEntry && !reduced ? 'hidden' : false}
      animate="visible"
      exit={playExit ? (isAsset ? 'exitAsset' : 'exitEvent') : 'exitDefault'}
      transition={reduced ? { duration: 0.01 } : transitions.card}
      whileHover={
        reduced || disabled
          ? undefined
          : {
              y: -6,
              rotateX: 2,
              rotateZ: isAsset ? -0.5 : 0.5,
              transition: transitions.hover,
            }
      }
      whileTap={reduced || disabled ? undefined : { scale: 0.985, y: -2, transition: transitions.hover }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={handleClick}
      className="directive-card-hand-btn block p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-state-amber/50"
      aria-label={`Enact ${card.name}`}
    >
      <DirectiveCard card={card} variant="hand" disabled={disabled} interactive={!disabled} />
    </motion.button>
  );
});
