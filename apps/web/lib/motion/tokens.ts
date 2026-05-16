export const duration = {
  hover: 0.14,
  fast: 0.18,
  ui: 0.26,
  card: 0.28,
  modal: 0.34,
  dice: 1.45,
  cinematic: 0.85,
  gameOver: 1.4,
  atmosphere: 12,
} as const;

export const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  ui: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  heavy: [0.4, 0, 0.2, 1] as [number, number, number, number],
  dice: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export const spring = {
  subtle: { type: 'spring' as const, stiffness: 380, damping: 32 },
  card: { type: 'spring' as const, stiffness: 400, damping: 34, mass: 0.95 },
  panel: { type: 'spring' as const, stiffness: 320, damping: 30 },
};

export const stagger = {
  fast: 0.04,
  modal: 0.07,
  gameOver: 0.1,
};
