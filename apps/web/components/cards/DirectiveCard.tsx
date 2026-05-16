'use client';

import { memo, type ReactNode } from 'react';
import type { Card } from '@all-according-to-plan/shared';
import { CardArtwork } from '@/components/cards/CardArtwork';
import { CardCostRow } from '@/components/cards/CardCostRow';
import { FactionInfluenceStrip } from '@/components/cards/FactionInfluenceStrip';
import {
  getArchetypeLabel,
  getDirectiveClassLabel,
  getDirectiveFooterHint,
  getEffectSummary,
} from '@/lib/cards/labels';
import { directiveCardShell, type DirectiveCardVariant } from '@/lib/cards/styles';
import { cn } from '@/lib/ui/cn';
import { labelMeta } from '@/lib/ui/variants';

export type DirectiveCardProps = {
  card: Card;
  variant: DirectiveCardVariant;
  disabled?: boolean;
  interactive?: boolean;
  className?: string;
  footer?: ReactNode;
};

export const DirectiveCard = memo(function DirectiveCard({
  card,
  variant,
  disabled = false,
  interactive = false,
  className,
  footer,
}: DirectiveCardProps) {
  const isHand = variant === 'hand';
  const isArchive = variant === 'archive';
  const effects = getEffectSummary(card, isArchive ? 2 : 3);
  const classLabel = getDirectiveClassLabel(card);
  const archetype = getArchetypeLabel(card);
  const hint = getDirectiveFooterHint(card, disabled);

  return (
    <article
      className={cn(
        directiveCardShell(card, { variant, disabled, interactive }),
        className
      )}
    >
      <div
        className={cn(
          'flex items-start justify-between gap-2 border-b border-state-steel/30',
          isHand ? 'px-3 py-2' : isArchive ? 'px-2 py-1.5' : 'px-2.5 py-2'
        )}
      >
        <div className="min-w-0">
          <p
            className={cn(
              'font-display font-bold uppercase tracking-label',
              card.type === 'asset' ? 'text-state-gold' : 'text-faction-danger',
              isHand ? 'text-[10px]' : 'text-[9px]'
            )}
          >
            {archetype}
          </p>
          <p className={cn(labelMeta, 'mt-0.5 truncate', isArchive && 'text-[9px]')}>{classLabel}</p>
        </div>
        <CardCostRow cost={card.cost} compact={!isHand} />
      </div>

      {isHand ? <CardArtwork card={card} /> : null}

      <div
        className={cn(
          'flex flex-1 flex-col',
          isHand ? 'gap-2 px-3 pb-3 pt-2' : isArchive ? 'gap-1 px-2 py-1.5' : 'gap-1.5 px-2.5 py-2'
        )}
      >
        {!isHand && !isArchive ? (
          <div className="relative h-14 overflow-hidden rounded border border-state-steel/25">
            <CardArtwork card={card} className="!aspect-auto h-full min-h-[3.5rem]" />
          </div>
        ) : null}

        <div>
          <h4
            className={cn(
              'font-display font-bold uppercase leading-tight tracking-tight text-board-ink',
              isHand ? 'text-sm' : isArchive ? 'text-[11px]' : 'text-xs'
            )}
          >
            {card.name}
          </h4>
          <p
            className={cn(
              'mt-1 leading-snug text-state-paper-dim',
              isHand ? 'line-clamp-2 text-[11px]' : isArchive ? 'line-clamp-1 text-[10px]' : 'line-clamp-2 text-[10px]'
            )}
          >
            {card.description}
          </p>
        </div>

        {effects.length > 0 && !isArchive ? (
          <ul className="space-y-0.5 border-t border-state-steel/25 pt-1.5 text-[10px] leading-snug text-state-paper-dim">
            {effects.map((line, i) => (
              <li key={i} className="truncate">
                {line}
              </li>
            ))}
          </ul>
        ) : null}

        <div
          className={cn(
            'mt-auto flex items-end justify-between gap-2 border-t border-state-steel/20 pt-2',
            isArchive && 'border-0 pt-1'
          )}
        >
          <FactionInfluenceStrip card={card} compact={!isHand} />
          {footer ?? (
            <span
              className={cn(
                'shrink-0 text-right font-display text-[9px] font-semibold uppercase tracking-label',
                disabled ? 'text-state-fog' : 'text-state-amber/90'
              )}
            >
              {isArchive ? 'Archived' : hint}
            </span>
          )}
        </div>
      </div>
    </article>
  );
});
