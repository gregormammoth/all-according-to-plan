'use client';

import { motion } from 'framer-motion';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { duration } from '@/lib/motion/tokens';

export function Atmosphere() {
  const { reduced } = useMotionPrefs();

  if (reduced) {
    return (
      <motion.div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
        <div className="atmosphere-vignette absolute inset-0" />
      </motion.div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <div className="atmosphere-vignette absolute inset-0" />
      <motion.div
        className="atmosphere-fog absolute inset-0"
        animate={{
          opacity: [0.85, 1, 0.9, 1],
          x: [0, 8, -4, 0],
        }}
        transition={{
          duration: duration.atmosphere,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="atmosphere-noise absolute inset-0"
        animate={{ opacity: [0.03, 0.045, 0.035] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="atmosphere-scanlines absolute inset-0"
        animate={{ y: ['0%', '4%', '0%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="atmosphere-particles absolute inset-0"
        animate={{ opacity: [0.15, 0.28, 0.18] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
