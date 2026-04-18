'use client';

import { canPay } from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';

export function CardBar() {
  const state = useGameStore((s) => s.state);
  const library = useGameStore((s) => s.library);
  const error = useGameStore((s) => s.error);
  const play = useGameStore((s) => s.play);
  const endPlayerPhase = useGameStore((s) => s.endPlayerPhase);
  const canAct = state.phase === 'player' && state.playerActionsUsed < state.maxPlayerActionsPerRound;
  const canEndEarly =
    state.phase === 'player' &&
    state.playerActionsUsed > 0 &&
    state.playerActionsUsed < state.maxPlayerActionsPerRound;

  return (
    <div className="panel bottom">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <h3>Player phase</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {error ? <div className="muted">{error}</div> : <div className="muted">Play up to three cards</div>}
          <button
            type="button"
            className="card"
            style={{ padding: '6px 10px' }}
            disabled={!canEndEarly}
            onClick={() => endPlayerPhase()}
          >
            End phase early
          </button>
        </div>
      </div>
      <div className="card-row">
        {state.hand.map((id) => {
          const card = library.get(id);
          if (!card) return null;
          const affordable = canPay(state.resources, card.cost);
          const disabled = !affordable || !canAct || state.phase === 'game_over';
          return (
            <button key={id} type="button" className="card" disabled={disabled} onClick={() => play(id)}>
              <div className="card-title">{card.name}</div>
              <div className="card-meta">{card.type}</div>
              <div className="card-meta">{card.description}</div>
              <div className="card-meta">
                Money: {card.cost.money ?? 0}
                {/* m {card.cost.money ?? 0} · i {card.cost.influence ?? 0} · a {card.cost.authority ?? 0} */}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
