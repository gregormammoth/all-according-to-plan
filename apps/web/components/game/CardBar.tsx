'use client';

import { ActionEconomyBar, PlayerHandRail } from '@all-according-to-plan/ui';
import { useGameStore } from '@/state/gameStore';

export function CardBar() {
  const state = useGameStore((s) => s.state);
  const library = useGameStore((s) => s.library);
  const error = useGameStore((s) => s.error);
  const playSelectMode = useGameStore((s) => s.playSelectMode);
  const togglePlaySelectMode = useGameStore((s) => s.togglePlaySelectMode);
  const play = useGameStore((s) => s.play);
  const draw = useGameStore((s) => s.draw);
  const gain = useGameStore((s) => s.gain);
  const actionsRemaining =
    state.phase === 'game_over' ? 0 : Math.max(0, state.maxPlayerActionsPerRound - state.playerActionsUsed);

  return (
    <div className="panel bottom">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 10,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3>Player phase</h3>
          <div className="muted" style={{ marginTop: 4 }}>
            Spend exactly {state.maxPlayerActionsPerRound} actions, then upkeep runs: bonus draw, +1 money, event,
            next round.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 200 }}>
          {error ? <div className="muted">{error}</div> : null}
          <ActionEconomyBar
            phase={state.phase}
            actionsRemaining={actionsRemaining}
            deckSize={state.deck.length}
            playSelectMode={playSelectMode}
            onTogglePlaySelectMode={() => togglePlaySelectMode()}
            onDrawCard={() => draw()}
            onGainResource={(r) => gain(r)}
          />
        </div>
      </div>
      <PlayerHandRail
        cardIds={state.hand}
        resolveCard={(id) => library.get(id)}
        resources={state.resources}
        phase={state.phase}
        actionsRemaining={actionsRemaining}
        playSelectMode={playSelectMode}
        onCardChosen={(id) => play(id)}
      />
    </div>
  );
}
