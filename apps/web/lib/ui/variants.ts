import { cn } from './cn';

export const labelMeta = 'font-display text-[10px] font-semibold uppercase tracking-label text-state-paper-dim';

export const labelSection = 'font-display text-xs font-bold uppercase tracking-archive text-board-ink';

export const bodyMuted = 'text-sm leading-relaxed text-state-paper-dim';

export const panelBase = cn(
  'relative rounded-lg border border-state-steel/80 bg-panel-metal shadow-panel',
  'before:pointer-events-none before:absolute before:inset-0 before:rounded-lg',
  'before:bg-[linear-gradient(180deg,rgba(200,194,180,0.04)_0%,transparent_40%)]'
);

export const panelInset = cn(
  'rounded-md border border-state-charcoal bg-state-charcoal/80',
  'shadow-[inset_0_2px_8px_rgba(0,0,0,0.45)]'
);

export function btnVariant(
  variant: 'default' | 'primary' | 'ghost' | 'danger' = 'default',
  active = false
): string {
  const base = cn(
    'relative inline-flex items-center justify-center border font-display text-[11px] font-bold uppercase tracking-label',
    'transition-all duration-ui ease-ui',
    'disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none',
    'active:translate-y-px active:shadow-card-pressed',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-state-amber/50'
  );

  if (variant === 'primary' || active) {
    return cn(
      base,
      'border-state-amber/50 bg-[linear-gradient(180deg,#4a4438_0%,#2a2824_100%)] text-board-ink shadow-btn',
      'hover:border-state-amber/70 hover:shadow-btn-hover hover:text-state-paper',
      active && 'ring-1 ring-state-amber/40'
    );
  }

  if (variant === 'ghost') {
    return cn(
      base,
      'border-transparent bg-transparent text-state-paper-dim shadow-none',
      'hover:border-state-steel/60 hover:bg-state-graphite/50 hover:text-board-ink'
    );
  }

  if (variant === 'danger') {
    return cn(
      base,
      'border-faction-danger/40 bg-[linear-gradient(180deg,#3a2c2c_0%,#221a1a_100%)] text-state-paper-dim',
      'hover:border-faction-danger/60 hover:text-board-ink'
    );
  }

  return cn(
    base,
    'border-state-steel/70 bg-[linear-gradient(180deg,#32383f_0%,#22262b_100%)] text-state-paper-dim shadow-btn',
    'hover:border-state-concrete/80 hover:text-board-ink hover:shadow-btn-hover'
  );
}

export const btnSizes = {
  sm: 'rounded px-2.5 py-1',
  md: 'rounded-md px-3 py-2',
  lg: 'rounded-md px-5 py-2.5',
};

export const pillBase = cn(
  'inline-flex items-center rounded border font-display text-[10px] font-bold uppercase tracking-label',
  'transition-colors duration-ui ease-ui'
);

export function pillVariant(tone: 'neutral' | 'authority' | 'event' | 'danger' | 'election'): string {
  const tones: Record<string, string> = {
    neutral: 'border-state-steel/60 bg-state-graphite/80 text-state-paper-dim',
    authority: 'border-state-amber/40 bg-state-amber/10 text-state-amber',
    event: 'border-faction-danger/35 bg-faction-danger/10 text-faction-danger',
    danger: 'border-faction-danger/50 bg-faction-danger/15 text-board-ink',
    election: 'border-state-gold/45 bg-state-gold/10 text-state-gold',
  };
  return cn(pillBase, 'px-2.5 py-1', tones[tone]);
}

export const statHud = cn(
  'rounded border border-state-steel/50 bg-state-charcoal/90 px-2 py-2 text-center backdrop-blur-sm',
  'shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
);
