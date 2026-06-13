'use client';

import { motion } from 'framer-motion';
import {
  CRISIS_DOOM_THRESHOLD,
  type CrisisDefinition,
  describeEffectsBundleLines,
  formatCrisisResolutionCost,
} from '@all-according-to-plan/shared';
import { Button } from '@/components/ui/Button';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { transitions } from '@/lib/motion/variants';
import { cn } from '@/lib/ui/cn';

type CrisisCardProps = {
  def: CrisisDefinition;
  doom: number;
  createdRound: number;
  currentRound: number;
  canResolve: boolean;
  resolveError?: string;
  onResolve: () => void;
};

export function CrisisCard({
  def,
  doom,
  createdRound,
  currentRound,
  canResolve,
  resolveError,
  onResolve,
}: CrisisCardProps) {
  const { reduced } = useMotionPrefs();
  const doomWarning = doom >= 4;
  const doomPct = Math.min(100, (doom / CRISIS_DOOM_THRESHOLD) * 100);
  const roundsActive = Math.max(1, currentRound - createdRound + 1);
  const untilEscalation = Math.max(0, CRISIS_DOOM_THRESHOLD - doom);
  const ongoing = describeEffectsBundleLines(def.ongoingEffects, true);
  const isMajor = def.severity === 'major';

  return (
    <article
      className={cn(
        'crisis-card',
        isMajor && 'crisis-card-major',
        doomWarning && 'crisis-card-critical'
      )}
    >
      <div className="crisis-card-stripe" aria-hidden />
      <header className="crisis-card-header">
        <div className="min-w-0 flex-1">
          <p className="crisis-card-type">National crisis</p>
          <h4 className="crisis-card-title">{def.name}</h4>
        </div>
        <span className={cn('crisis-severity-badge', isMajor ? 'crisis-severity-major' : 'crisis-severity-minor')}>
          {isMajor ? 'Major' : 'Minor'}
        </span>
      </header>

      <p className="crisis-card-desc">{def.description}</p>

      <div className="crisis-card-doom">
        <div className="flex justify-between font-display text-[9px] font-bold uppercase tracking-label">
          <span className="text-state-paper-dim">Doom</span>
          <span className={cn(doomWarning ? 'text-faction-danger' : 'text-state-amber')}>
            {doom}/{CRISIS_DOOM_THRESHOLD}
          </span>
        </div>
        <div className="crisis-doom-track mt-1">
          <motion.div
            className={cn('crisis-doom-fill', doomWarning ? 'bg-faction-danger' : 'bg-state-amber')}
            initial={false}
            animate={{ scaleX: doomPct / 100 }}
            transition={reduced ? { duration: 0.01 } : transitions.bar}
          />
        </div>
        <p className="mt-1 text-[9px] text-state-paper-dim">
          Active {roundsActive} wk · escalates in {untilEscalation}
        </p>
      </div>

      {ongoing.length > 0 ? (
        <ul className="crisis-penalty-list">
          {ongoing.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}

      {def.resolution ? (
        <Button
          variant="default"
          size="sm"
          className="crisis-resolve-btn mt-auto w-full"
          disabled={!canResolve}
          onClick={onResolve}
          title={resolveError}
        >
          Resolve ({formatCrisisResolutionCost(def)})
        </Button>
      ) : null}
    </article>
  );
}
