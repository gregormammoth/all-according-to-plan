'use client';

import { calculateStabilityIndex } from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';

function Meter({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value * 10));
  return (
    <div className="meter">
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function AdvisorPanel() {
  const state = useGameStore((s) => s.state);
  const reset = useGameStore((s) => s.reset);
  const stability = calculateStabilityIndex(state.stats);

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Advisor</h3>
        <button
          type="button"
          className="card"
          style={{ padding: '6px 10px' }}
          onClick={() => reset()}
        >
          Reset run
        </button>
      </div>
      <div className="muted" style={{ marginBottom: 10 }}>
        Stability index {stability} · Round {state.round} · Phase {state.phase}
      </div>
      <div className="stat-grid">
        <div>
          <div className="muted">Money</div>
          <div>{state.resources.money}</div>
        </div>
        {/* <div>
          <div className="muted">Influence</div>
          <div>{state.resources.influence}</div>
        </div>
        <div>
          <div className="muted">Authority</div>
          <div>{state.resources.authority}</div>
        </div>
        <div>
          <div className="muted">Deck</div>
          <div>{state.deck.length}</div>
        </div> */}
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="muted">People satisfaction (0–10)</div>
        <Meter value={state.stats.people.satisfaction} />
      </div>
      {/* <div style={{ marginTop: 12 }}>
        <div className="muted">People fear (0–10)</div>
        <Meter value={state.stats.people.fear} />
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="muted">People loyalty (0–10)</div>
        <Meter value={state.stats.people.loyalty} />
      </div> */}
      <div style={{ marginTop: 12 }}>
        <div className="muted">Elites satisfaction (0–10)</div>
        <Meter value={state.stats.elites.satisfaction} />
      </div>
      {/* <div style={{ marginTop: 12 }}>
        <div className="muted">Elites loyalty (0–10)</div>
        <Meter value={state.stats.elites.loyalty} />
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="muted">Elites fear (0–10)</div>
        <Meter value={state.stats.elites.fear} />
      </div> */}
      <div style={{ marginTop: 12 }}>
        <div className="muted">Security satisfaction (0–10)</div>
        <Meter value={state.stats.security.satisfaction} />
      </div>
      {/* <div style={{ marginTop: 12 }}>
        <div className="muted">Security loyalty (0–10)</div>
        <Meter value={state.stats.security.loyalty} />
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="muted">Security fear (0–10)</div>
        <Meter value={state.stats.security.fear} />
      </div> */}
    </div>
  );
}
