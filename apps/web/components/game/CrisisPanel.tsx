'use client';

import { motion } from 'framer-motion';
import {
  CRISIS_DOOM_THRESHOLD,
  crisesDocument,
  describeEffectsBundleLines,
  formatCrisisResolutionCost,
} from '@all-according-to-plan/shared';
import { canResolveCrisis } from '@all-according-to-plan/game-engine';
import { useGameStore } from '@/state/gameStore';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { transitions } from '@/lib/motion/variants';
import { cn } from '@/lib/ui/cn';
import { bodyMuted, labelMeta, labelSection, panelInset, pillVariant } from '@/lib/ui/variants';

const crisisById = new Map(crisesDocument.crises.map((c) => [c.id, c]));

export function CrisisPanel() {
  const { reduced } = useMotionPrefs();
  const state = useGameStore((s) => s.state);
  const crisisLibrary = useGameStore((s) => s.crisisLibrary);
  const resolveCrisis = useGameStore((s) => s.resolveCrisis);
  const phase = state.phase;
  const active = state.activeCrises;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Panel className="flex min-h-0 flex-1 flex-col !p-3">
        <h3 className="flex items-center gap-2 border-b border-state-steel/40 pb-2">
          <span className="text-faction-danger" aria-hidden="true">
            ▲
          </span>
          <span className={labelSection}>Active crises</span>
        </h3>
        <div className="mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {phase === 'event_modal' ? (
            <p className="text-sm font-medium text-state-amber">
              Directive pending — resolve in modal to continue.
            </p>
          ) : active.length === 0 ? (
            <p className={bodyMuted}>No active crises.</p>
          ) : (
            active.map((item) => {
              const def = crisisById.get(item.crisisId);
              if (!def) return null;
              const ongoing = describeEffectsBundleLines(def.ongoingEffects, true);
              const canResolve = canResolveCrisis(state, item.crisisId, crisisLibrary);
              const doomWarning = item.doom >= 4;
              const doomPct = Math.min(100, (item.doom / CRISIS_DOOM_THRESHOLD) * 100);
              const severityBadge = def.severity === 'major' ? 'danger' : 'election';

              return (
                <div
                  key={`${item.crisisId}-${item.createdRound}`}
                  className={cn(
                    panelInset,
                    'space-y-2 px-3 py-3',
                    doomWarning && 'border-faction-danger/40 bg-faction-danger/[0.06]'
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="font-display text-sm font-bold text-board-ink">{def.name}</div>
                      <p className={cn(bodyMuted, 'mt-1 !text-xs')}>{def.description}</p>
                    </div>
                    <span className={pillVariant(severityBadge)}>
                      {def.severity === 'major' ? 'Major' : 'Minor'}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-display font-semibold uppercase tracking-label text-state-paper-dim">
                      <span>Doom</span>
                      <span className={cn(doomWarning && 'text-faction-danger')}>
                        {item.doom}/{CRISIS_DOOM_THRESHOLD}
                      </span>
                    </div>
                    <div className={cn('mt-1 h-1.5 overflow-hidden rounded-sm', panelInset)}>
                      <motion.div
                        className={cn(
                          'h-full origin-left rounded-sm',
                          doomWarning ? 'bg-faction-danger' : 'bg-state-amber'
                        )}
                        initial={false}
                        animate={{ scaleX: doomPct / 100 }}
                        transition={reduced ? { duration: 0.01 } : transitions.bar}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  {ongoing.length > 0 ? (
                    <ul className="space-y-0.5 text-xs text-faction-danger">
                      {ongoing.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : null}
                  {def.resolution ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      disabled={phase !== 'player' || !canResolve.ok}
                      onClick={() => resolveCrisis(item.crisisId)}
                      title={!canResolve.ok ? canResolve.error : undefined}
                    >
                      Resolve ({formatCrisisResolutionCost(def)})
                    </Button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
        {active.length > 0 ? (
          <p className={cn(labelMeta, 'mt-2 border-t border-state-steel/30 pt-2')}>
            Unresolved crises escalate at doom {CRISIS_DOOM_THRESHOLD}, then doom resets.
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
