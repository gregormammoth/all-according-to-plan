'use client';

import { motion } from 'framer-motion';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { useMotionStore } from '@/state/motionStore';

export function ShakeLayer({ children }: { children: React.ReactNode }) {
  const shakeKey = useMotionStore((s) => s.shakeKey);
  const { reduced } = useMotionPrefs();

  return (
    <motion.div
      key={shakeKey}
      className="relative min-h-0 flex-1"
      animate={
        reduced || shakeKey === 0
          ? undefined
          : { x: [0, -2, 2, -1, 1, 0], y: [0, 1, -1, 0] }
      }
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
