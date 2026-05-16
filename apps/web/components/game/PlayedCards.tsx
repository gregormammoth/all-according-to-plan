'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/state/gameStore';
import { useMotionStore } from '@/state/motionStore';
import { DirectiveCard } from '@/components/cards/DirectiveCard';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { activeDirectiveEnter } from '@/lib/motion/variants';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/ui/cn';
import { labelMeta, labelSection } from '@/lib/ui/variants';

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
    <Panel className="directive-panel-active flex h-full min-h-0 flex-col !p-3">
      <h3 className={cn(labelSection, 'flex items-center gap-2 border-b border-state-steel/40 pb-2')}>
        <span aria-hidden className="text-state-gold/80">
          ◆
        </span>
        Active programs
      </h3>
      <p className={cn(labelMeta, 'mt-1 text-state-paper-dim')}>
        Ongoing regime apparatus · persistent state policies
      </p>
      <div className="relative mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        {activeAssets.length === 0 ? (
          <div className="flex h-full min-h-[8rem] flex-col items-center justify-center rounded-md border border-dashed border-state-brass/25 bg-state-gold/[0.03] px-4 text-center">
            <p className="font-display text-xs font-semibold uppercase tracking-label text-state-gold/80">
              No programs enacted
            </p>
            <p className="mt-1 max-w-[12rem] text-[10px] leading-snug text-state-fog">
              Persistent directives from your operational hand will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false} mode="sync">
              {activeAssets.map((card, index) => (
                <motion.div
                  key={card.id}
                  variants={activeDirectiveEnter}
                  initial={playCue === card.id && !reduced ? 'hidden' : false}
                  animate="visible"
                  className={cn(
                    'directive-stack-item relative',
                    index > 0 && '-mt-1'
                  )}
                  style={{ zIndex: activeAssets.length - index }}
                >
                  <DirectiveCard
                    card={card}
                    variant="active"
                    footer={
                      <span className="shrink-0 font-display text-[9px] font-bold uppercase tracking-label text-state-gold">
                        Active
                      </span>
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Panel>
  );
}
