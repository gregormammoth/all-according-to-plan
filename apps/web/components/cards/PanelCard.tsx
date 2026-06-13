'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

type PanelCardTone = 'gold' | 'danger' | 'neutral';

type PanelCardProps = {
  tone?: PanelCardTone;
  critical?: boolean;
  compact?: boolean;
  className?: string;
  art: ReactNode;
  artOverlay?: ReactNode;
  title: string;
  subtitle?: string;
  description: string;
  footer?: ReactNode;
};

export function PanelCard({
  tone = 'neutral',
  critical = false,
  compact = false,
  className,
  art,
  artOverlay,
  title,
  subtitle,
  description,
  footer,
}: PanelCardProps) {
  return (
    <article
      className={cn(
        'panel-card',
        compact && 'panel-card-compact',
        tone === 'gold' && 'panel-card-gold',
        tone === 'danger' && 'panel-card-danger',
        critical && 'panel-card-critical',
        className
      )}
    >
      <div className="panel-card-art">
        {art}
        {artOverlay}
      </div>
      <div className="panel-card-body">
        <h4 className="panel-card-title">{title}</h4>
        {subtitle ? <p className="panel-card-subtitle">{subtitle}</p> : null}
        <p className="panel-card-desc">{description}</p>
        {footer ? <div className="panel-card-footer">{footer}</div> : null}
      </div>
    </article>
  );
}
