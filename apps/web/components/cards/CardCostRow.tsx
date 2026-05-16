'use client';

import { memo } from 'react';
import type { CardCost } from '@all-according-to-plan/shared';
import { formatDirectiveCost } from '@/lib/cards/labels';
import { cn } from '@/lib/ui/cn';

export const CardCostRow = memo(function CardCostRow({
  cost,
  compact,
}: {
  cost: CardCost;
  compact?: boolean;
}) {
  const c = formatDirectiveCost(cost);
  const hasAny = c.money || c.influence || c.authority;

  if (!hasAny) {
    return (
      <span className={cn('font-display text-[10px] font-semibold uppercase tracking-label text-state-paper-dim')}>
        No cost
      </span>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1', compact && 'gap-0.5')}>
      {c.money ? (
        <span
          className={cn(
            'rounded border border-state-amber/35 bg-state-amber/10 font-display font-bold text-state-amber',
            compact ? 'px-1 py-0 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'
          )}
        >
          ${c.money}
        </span>
      ) : null}
      {c.influence ? (
        <span
          className={cn(
            'rounded border border-state-steel/50 bg-state-graphite/80 font-display font-bold text-state-paper',
            compact ? 'px-1 py-0 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'
          )}
        >
          Inf {c.influence}
        </span>
      ) : null}
      {c.authority ? (
        <span
          className={cn(
            'rounded border border-faction-security/40 bg-faction-security/10 font-display font-bold text-faction-security',
            compact ? 'px-1 py-0 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'
          )}
        >
          Auth {c.authority}
        </span>
      ) : null}
    </div>
  );
});
