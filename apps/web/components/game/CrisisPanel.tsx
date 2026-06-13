'use client';

import { crisesDocument, MAX_ACTIVE_CRISES } from '@all-according-to-plan/shared';
import { canResolveCrisis } from '@all-according-to-plan/game-engine';
import { CrisisRowCard } from '@/components/game/CrisisRowCard';
import { useGameStore } from '@/state/gameStore';

const crisisById = new Map(crisesDocument.crises.map((c) => [c.id, c]));

export function CrisisPanel() {
  const state = useGameStore((s) => s.state);
  const crisisLibrary = useGameStore((s) => s.crisisLibrary);
  const resolveCrisis = useGameStore((s) => s.resolveCrisis);
  const phase = state.phase;
  const active = state.activeCrises;

  return (
    <section className="game-column game-column-crises flex h-full min-h-0 flex-col">
      <header className="panel-section-header panel-section-header-danger">
        <h2 className="panel-section-title">
          Active Crises <span className="panel-section-count">({active.length} / {MAX_ACTIVE_CRISES})</span>
        </h2>
      </header>

      <div className="panel-section-scroll mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {phase === 'event_modal' ? (
          <p className="panel-notice">State directive pending — complete modal to continue.</p>
        ) : active.length === 0 ? (
          <div className="panel-empty">
            <p className="panel-empty-title">No active crises</p>
            <p className="panel-empty-sub">Threats will surface as the campaign progresses.</p>
          </div>
        ) : (
          active.map((item) => {
            const def = crisisById.get(item.crisisId);
            if (!def) return null;
            const check = canResolveCrisis(state, item.crisisId, crisisLibrary);
            return (
              <CrisisRowCard
                key={`${item.crisisId}-${item.createdRound}`}
                def={def}
                doom={item.doom}
                createdRound={item.createdRound}
                currentRound={state.round}
                canResolve={phase === 'player' && check.ok}
                resolveError={!check.ok ? check.error : undefined}
                onResolve={() => resolveCrisis(item.crisisId)}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
