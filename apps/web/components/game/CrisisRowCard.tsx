'use client';

import { CRISIS_DOOM_THRESHOLD, type CrisisDefinition, describeEffectsBundleLines, formatCrisisResolutionCost } from '@all-according-to-plan/shared';
import { cn } from '@/lib/ui/cn';

type CrisisRowCardProps = {
  def: CrisisDefinition;
  doom: number;
  createdRound: number;
  currentRound: number;
  canResolve: boolean;
  resolveError?: string;
  onResolve: () => void;
};

export function CrisisRowCard({
  def,
  doom,
  createdRound,
  currentRound,
  canResolve,
  resolveError,
  onResolve,
}: CrisisRowCardProps) {
  const doomWarning = doom >= 4;
  const untilEscalation = Math.max(0, CRISIS_DOOM_THRESHOLD - doom);
  const roundsActive = Math.max(1, currentRound - createdRound + 1);
  const ongoing = describeEffectsBundleLines(def.ongoingEffects, true);
  const ongoingText = ongoing.join(', ');
  const resolveText = def.resolution ? formatCrisisResolutionCost(def) : '';
  const isMajor = def.severity === 'major';
  const crisisType = isMajor ? 'National Crisis' : 'Political Crisis';

  return (
    <article className={cn('crisis-row-card', isMajor && 'crisis-row-card-major', doomWarning && 'crisis-row-card-critical')}>
      <div className={cn('crisis-row-thumb', isMajor ? 'crisis-row-thumb-major' : 'crisis-row-thumb-minor')}>
        <span className="crisis-row-thumb-glyph" aria-hidden>
          {isMajor ? '⚠' : '!'}
        </span>
      </div>
      <div className="crisis-row-body">
        <h4 className="crisis-row-title">{def.name}</h4>
        <p className="crisis-row-type">{crisisType}</p>
        {ongoingText ? (
          <p className="crisis-row-ongoing">
            <span className="crisis-row-kicker">Ongoing:</span> {ongoingText}
          </p>
        ) : null}
        {resolveText ? (
          <p className="crisis-row-resolve">
            <span className="crisis-row-kicker">Resolve:</span> {resolveText}
          </p>
        ) : null}
        {def.resolution ? (
          <button
            type="button"
            className="crisis-row-resolve-btn"
            disabled={!canResolve}
            title={resolveError}
            onClick={onResolve}
          >
            Resolve
          </button>
        ) : null}
      </div>
      <div className="crisis-row-timer">
        <span className={cn('crisis-row-timer-num', doomWarning && 'text-faction-danger')}>{untilEscalation}</span>
        <span className="crisis-row-timer-label">Days</span>
        <span className="crisis-row-timer-sub">Wk {roundsActive}</span>
      </div>
    </article>
  );
}
