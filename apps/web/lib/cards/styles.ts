import type { Card } from '@all-according-to-plan/shared';
import { cn } from '@/lib/ui/cn';

export type DirectiveCardVariant = 'hand' | 'active' | 'archive';

export function directiveCardShell(
  card: Card,
  options: {
    variant: DirectiveCardVariant;
    disabled?: boolean;
    interactive?: boolean;
  }
): string {
  const isAsset = card.type === 'asset';
  const isEvent = card.type === 'event';
  const { variant, disabled, interactive } = options;

  return cn(
    'directive-card group relative flex flex-col overflow-hidden text-left',
    'transform-gpu will-change-transform',
    variant === 'hand' && 'min-w-[13.5rem] max-w-[14.5rem] shrink-0 snap-start rounded-lg border shadow-card',
    variant === 'active' && 'rounded-md border shadow-card',
    variant === 'archive' && 'rounded border',
    isAsset && 'border-state-brass/40 bg-card-asset',
    isEvent && 'border-faction-danger/30 bg-card-event',
    !isAsset && !isEvent && 'border-state-steel/40 bg-state-graphite/40',
    interactive && !disabled && 'cursor-pointer',
    disabled && 'directive-card-disabled opacity-45 grayscale-[0.35] saturate-50',
    interactive && !disabled && variant === 'hand' && 'directive-card-hand'
  );
}
