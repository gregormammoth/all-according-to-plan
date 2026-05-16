import type { Transition, Variants } from 'framer-motion';
import { duration, ease, spring, stagger } from './tokens';

export function t(reduced: boolean, normal: Transition, instant?: Transition): Transition {
  if (reduced) {
    return instant ?? { duration: 0.01 };
  }
  return normal;
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalPanel: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.99 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger.modal, delayChildren: 0.06 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export const handCard: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exitPlay: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: duration.card, ease: ease.out },
  },
  exitDefault: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: duration.fast, ease: ease.ui },
  },
};

export const handCardDraw: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exitDefault: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: duration.fast, ease: ease.ui },
  },
  exitAsset: {
    opacity: 0,
    x: -100,
    y: -48,
    scale: 0.88,
    rotateZ: -3,
    transition: { duration: duration.card, ease: ease.out },
  },
  exitEvent: {
    opacity: 0,
    scale: 1.05,
    y: -28,
    transition: { duration: duration.card, ease: ease.heavy },
  },
};

export const activeDirectiveEnter: Variants = {
  hidden: { opacity: 0, x: -24, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: duration.card, ease: ease.out },
  },
};

export const archiveEntry: Variants = {
  hidden: { opacity: 0, x: 40, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: duration.ui, ease: ease.out },
  },
};

export const playedAsset: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.fast, ease: ease.out },
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.fast } },
};

export const choiceRow: Variants = {
  rest: { scale: 1, borderColor: 'rgba(46, 52, 60, 0.5)' },
  hover: { scale: 1.005, transition: { duration: duration.hover } },
  tap: { scale: 0.995, y: 1 },
};

export const diceReveal: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

export const gameOverShell: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.cinematic, ease: ease.out },
  },
};

export const gameOverStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger.gameOver, delayChildren: 0.2 },
  },
};

export const gameOverPanel: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.cinematic, ease: ease.out },
  },
};

export const timelineNode: Variants = {
  idle: { scale: 1 },
  active: { scale: 1.06, transition: spring.subtle },
};

export const transitions = {
  hover: { duration: duration.hover, ease: ease.ui },
  ui: { duration: duration.ui, ease: ease.out },
  card: { duration: duration.card, ease: ease.out },
  modal: { duration: duration.modal, ease: ease.out },
  cinematic: { duration: duration.cinematic, ease: ease.out },
  bar: { duration: duration.fast, ease: ease.out },
  layout: spring.card,
};
