'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useSpring } from 'framer-motion';
import { useMotionPrefs } from './MotionProvider';
import { duration, ease } from './tokens';
import { cn } from '@/lib/ui/cn';

type AnimatedNumberProps = {
  value: number;
  className?: string;
  format?: (n: number) => string;
  durationMs?: number;
  flash?: 'gain' | 'loss' | null;
};

export function AnimatedNumber({
  value,
  className,
  format = (n) => String(Math.round(n)),
  durationMs = 650,
  flash = null,
}: AnimatedNumberProps) {
  const { reduced } = useMotionPrefs();
  const spring = useSpring(value, { stiffness: 120, damping: 24 });
  const prev = useRef(value);
  const [text, setText] = useState(() => format(value));
  const [pulse, setPulse] = useState<'gain' | 'loss' | null>(null);

  useMotionValueEvent(spring, 'change', (v) => setText(format(v)));

  useEffect(() => {
    if (reduced) {
      spring.jump(value);
      setText(format(value));
      prev.current = value;
      return;
    }
    spring.set(value);
    if (value !== prev.current) {
      const dir = value > prev.current ? 'gain' : 'loss';
      setPulse(flash ?? dir);
      const t = window.setTimeout(() => setPulse(null), durationMs * 0.7);
      prev.current = value;
      return () => window.clearTimeout(t);
    }
    prev.current = value;
  }, [value, spring, reduced, flash, durationMs]);

  return (
    <motion.span
      className={cn(
        className,
        pulse === 'gain' && 'text-state-amber',
        pulse === 'loss' && 'text-faction-danger/90'
      )}
      animate={
        reduced || !pulse
          ? undefined
          : pulse === 'gain'
            ? { opacity: [1, 0.7, 1] }
            : { opacity: [1, 0.55, 1] }
      }
      transition={{ duration: reduced ? 0.01 : duration.ui, ease: ease.out }}
    >
      {text}
    </motion.span>
  );
}
