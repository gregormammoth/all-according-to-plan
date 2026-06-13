'use client';

import { CRISIS_DOOM_THRESHOLD, type CrisisDefinition } from '@all-according-to-plan/shared';
import { CrisisArtwork } from '@/components/cards/CrisisArtwork';
import { PanelCard } from '@/components/cards/PanelCard';
import { cn } from '@/lib/ui/cn';

type CrisisRowCardProps = {
  def: CrisisDefinition;
  doom: number;
  canResolve: boolean;
  resolveError?: string;
  onResolve: () => void;
};

export function CrisisRowCard({
  def,
  doom,
  canResolve,
  resolveError,
  onResolve,
}: CrisisRowCardProps) {
  const doomWarning = doom >= 4;
  const untilEscalation = Math.max(0, CRISIS_DOOM_THRESHOLD - doom);
  const isMajor = def.severity === 'major';
  const crisisType = isMajor ? 'National Crisis' : 'Political Crisis';

  return (
    <PanelCard
      compact
      tone="danger"
      critical={doomWarning}
      className={cn(isMajor && 'panel-card-major')}
      art={<CrisisArtwork crisis={def} />}
      artOverlay={
        <div className="panel-card-art-badge panel-card-art-badge-danger">
          <span className={cn('panel-card-art-badge-num', doomWarning && 'text-faction-danger')}>
            {untilEscalation}
          </span>
          <span className="panel-card-art-badge-label">Days</span>
        </div>
      }
      title={def.name}
      subtitle={crisisType}
      description={def.description}
      footer={
        def.resolution ? (
          <button
            type="button"
            className="panel-card-action-btn"
            disabled={!canResolve}
            title={resolveError}
            onClick={onResolve}
          >
            Resolve
          </button>
        ) : null
      }
    />
  );
}
