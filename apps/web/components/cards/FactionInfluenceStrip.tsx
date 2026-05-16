'use client';

import { memo } from 'react';
import type { Card } from '@all-according-to-plan/shared';
import { FACTION_INFLUENCE_CLASS, FACTION_INFLUENCE_LABEL, getFactionInfluence } from '@/lib/cards/labels';
import { cn } from '@/lib/ui/cn';

export const FactionInfluenceStrip = memo(function FactionInfluenceStrip({
  card,
  compact,
}: {
  card: Card;
  compact?: boolean;
}) {
  const factions = getFactionInfluence(card);
  if (factions.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-1', compact && 'gap-0.5')}>
      {factions.map((key) => (
        <span
          key={key}
          className={cn(
            'inline-flex items-center gap-1 rounded border border-state-steel/30 bg-state-charcoal/50 font-display uppercase tracking-label text-state-paper-dim',
            compact ? 'px-1 py-0 text-[8px]' : 'px-1.5 py-0.5 text-[9px]'
          )}
          title={`Affects ${FACTION_INFLUENCE_LABEL[key]}`}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', FACTION_INFLUENCE_CLASS[key])} aria-hidden />
          {FACTION_INFLUENCE_LABEL[key]}
        </span>
      ))}
    </div>
  );
});
