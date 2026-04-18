'use client';

import { useGameStore } from '@/state/gameStore';

export function CrisisPanel() {
  const history = useGameStore((s) => s.state.eventHistory);
  const last = useGameStore((s) => s.state.lastResolvedEvent);

  return (
    <div className="panel">
      <h3>Event stack</h3>
      {last ? (
        <div className="list-item" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 600 }}>
            Latest · Round {last.round}: {last.title}
          </div>
          <div className="muted">{last.description}</div>
        </div>
      ) : (
        <div className="muted" style={{ marginBottom: 8 }}>
          No events resolved yet this campaign.
        </div>
      )}
      <div className="muted" style={{ marginBottom: 8 }}>
        History (newest first)
      </div>
      <div className="list">
        {[...history].reverse().map((item, idx) => (
          <div key={`${item.eventId}-${item.round}-${idx}`} className="list-item">
            <div style={{ fontWeight: 600 }}>
              Round {item.round}: {item.title}
            </div>
            <div className="muted">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
