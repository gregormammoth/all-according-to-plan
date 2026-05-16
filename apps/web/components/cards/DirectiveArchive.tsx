'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Card } from '@all-according-to-plan/shared';
import { DirectiveCard } from '@/components/cards/DirectiveCard';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { archiveEntry } from '@/lib/motion/variants';
import { useMotionStore } from '@/state/motionStore';
import { cn } from '@/lib/ui/cn';
import { labelMeta } from '@/lib/ui/variants';

const MAX_ARCHIVE = 8;

export function DirectiveArchive({ events }: { events: Card[] }) {
  const { reduced } = useMotionPrefs();
  const archiveFlashId = useMotionStore((s) => s.archiveFlashId);
  const shown = events.slice(0, MAX_ARCHIVE);

  return (
    <div className="flex min-h-0 flex-col">
      <p className={cn(labelMeta, 'mb-2 flex items-center gap-2 text-state-paper-dim')}>
        <span aria-hidden className="text-faction-danger/80">
          ▣
        </span>
        State archive
      </p>
      <p className="mb-2 text-[10px] leading-snug text-state-fog">
        Executed emergency directives · permanent record
      </p>
      <div className="max-h-[200px] min-h-0 space-y-1.5 overflow-y-auto pr-0.5">
        {shown.length === 0 ? (
          <p className="rounded border border-dashed border-state-steel/35 px-2 py-3 text-center text-[10px] text-state-fog">
            No operations filed this campaign.
          </p>
        ) : (
          <AnimatePresence initial={false} mode="sync">
            {shown.map((card, idx) => (
              <motion.div
                key={`${card.id}-${idx}`}
                variants={archiveEntry}
                initial={reduced ? false : 'hidden'}
                animate="visible"
                className={cn(
                  archiveFlashId === card.id && !reduced && 'ring-1 ring-faction-danger/40 ring-offset-1 ring-offset-state-charcoal'
                )}
              >
                <DirectiveCard card={card} variant="archive" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
