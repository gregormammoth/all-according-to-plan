import { cn } from './ui/cn';

export function cardFrameClass(type: string, options?: { highlighted?: boolean; disabled?: boolean }): string {
  const t = type.toLowerCase();
  const isAsset = t === 'asset';
  const isEvent = t === 'event';

  return cn(
    'game-card group relative flex flex-col rounded-lg border p-3 text-left',
    'transform-gpu will-change-transform',
    'transition-[transform,box-shadow,border-color] duration-[220ms] ease-ui-out',
    isAsset && 'border-state-brass/35 bg-card-asset shadow-card hover:border-state-gold/50 hover:shadow-card-hover',
    isEvent &&
      'border-faction-danger/25 bg-card-event shadow-card hover:border-faction-danger/40 hover:shadow-card-hover',
    !isAsset && !isEvent && 'border-state-steel/40 bg-card-event shadow-card',
    options?.highlighted &&
      'ring-1 ring-state-amber/50 ring-offset-2 ring-offset-state-charcoal border-state-amber/55 shadow-card-hover',
    options?.disabled && 'game-card-disabled opacity-40 grayscale-[0.3]',
    !options?.disabled && 'active:shadow-card-pressed'
  );
}

export function cardTypeBadgeClass(type: string): string {
  const t = type.toLowerCase();
  if (t === 'asset') {
    return 'border border-state-gold/40 bg-state-gold/15 font-display text-[10px] font-bold uppercase tracking-label text-state-gold';
  }
  if (t === 'event') {
    return 'border border-faction-danger/35 bg-faction-danger/15 font-display text-[10px] font-bold uppercase tracking-label text-faction-danger';
  }
  return 'border border-state-steel/50 bg-state-graphite text-state-paper-dim';
}
