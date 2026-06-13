'use client';

import { useState } from 'react';
import { ReportsModal } from '@/components/game/ReportsModal';
import { useGameStore } from '@/state/gameStore';
import { cn } from '@/lib/ui/cn';

export function GameFooter() {
  const [reportsOpen, setReportsOpen] = useState(false);
  const state = useGameStore((s) => s.state);
  const endTurn = useGameStore((s) => s.endTurn);
  const phase = state.phase;
  const canEndTurn = phase === 'player' && state.playerActionsUsed > 0;
  const discardCount = state.deckDiscard.length;

  return (
    <>
      <ReportsModal open={reportsOpen} onClose={() => setReportsOpen(false)} />
      <div className="game-footer-bar">
        <div className="game-footer-actions">
          <button
            type="button"
            className={cn('end-turn-btn', !canEndTurn && 'end-turn-btn-disabled')}
            disabled={!canEndTurn}
            onClick={() => endTurn()}
          >
            End turn
          </button>
          <button type="button" className="view-reports-btn" onClick={() => setReportsOpen(true)}>
            View reports
          </button>
        </div>
        <div className="discard-pile-slot" title={`${discardCount} directives in discard`}>
          <div className="discard-pile-icon" aria-hidden>
            ⛨
          </div>
          <p className="discard-pile-label">Discard pile</p>
          <p className="discard-pile-count">{discardCount}</p>
        </div>
      </div>
    </>
  );
}
