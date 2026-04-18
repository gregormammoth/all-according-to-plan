'use client';

import { useGameStore } from '@/state/gameStore';

export function PlayedCards() {
  const state = useGameStore((s) => s.state);
  const library = useGameStore((s) => s.library);

  return (
    <div className="panel left">
      <h3>Played cards</h3>
      <div className="list">
        {[...state.playedCardIds].reverse().map((id, idx) => {
          const card = library.get(id);
          return (
            <div key={`${id}-${idx}`} className="list-item">
              <div style={{ fontWeight: 600 }}>{card?.name ?? id}</div>
              <div className="muted">{card?.type}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
