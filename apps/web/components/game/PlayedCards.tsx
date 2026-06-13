'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MAX_HAND_CARDS } from '@all-according-to-plan/shared';
import { ProgramCard } from '@/components/game/ProgramCard';
import { useGameStore } from '@/state/gameStore';
import { useMotionStore } from '@/state/motionStore';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { activeDirectiveEnter } from '@/lib/motion/variants';

export function PlayedCards() {
  const { reduced } = useMotionPrefs();
  const state = useGameStore((s) => s.state);
  const library = useGameStore((s) => s.library);
  const playCue = useMotionStore((s) =>
    s.cue?.type === 'play' && s.cue.cardKind === 'asset' ? s.cue.cardId : null
  );
  const activeAssets = state.activeAssets
    .map((id) => library.get(id))
    .filter((c): c is Exclude<typeof c, undefined> => c !== undefined);

  return (
    <section className="game-column game-column-programs flex h-full min-h-0 flex-col">
      <header className="panel-section-header panel-section-header-gold">
        <h2 className="panel-section-title">
          Active Programs{' '}
          <span className="panel-section-count">
            ({activeAssets.length} / {MAX_HAND_CARDS})
          </span>
        </h2>
      </header>

      <div className="panel-section-scroll mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {activeAssets.length === 0 ? (
          <div className="panel-empty panel-empty-gold">
            <p className="panel-empty-title">No programs enacted</p>
            <p className="panel-empty-sub">Play asset directives from your hand to establish permanent policy.</p>
          </div>
        ) : (
          <AnimatePresence initial={false} mode="sync">
            {activeAssets.map((card) => (
              <motion.div
                key={card.id}
                variants={activeDirectiveEnter}
                initial={playCue === card.id && !reduced ? 'hidden' : false}
                animate="visible"
              >
                <ProgramCard card={card} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
