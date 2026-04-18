import type { CSSProperties } from 'react';
import type { GamePhase, ResourceType } from '@all-according-to-plan/shared';

export type ActionEconomyBarProps = {
  phase: GamePhase;
  actionsRemaining: number;
  deckSize: number;
  playSelectMode: boolean;
  onTogglePlaySelectMode: () => void;
  onDrawCard: () => void;
  onGainResource: (resource: ResourceType) => void;
};

const btn: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid #2a2235',
  background: 'rgba(22, 18, 31, 0.9)',
  color: '#e8e2f2',
  fontSize: 12,
};

export function ActionEconomyBar({
  phase,
  actionsRemaining,
  deckSize,
  playSelectMode,
  onTogglePlaySelectMode,
  onDrawCard,
  onGainResource,
}: ActionEconomyBarProps) {
  const canAct = phase === 'player' && actionsRemaining > 0;
  const dead = phase === 'game_over' || !canAct;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <button
        type="button"
        style={{
          ...btn,
          borderColor: playSelectMode ? '#c45c3a' : '#2a2235',
          background: playSelectMode ? 'rgba(196, 92, 58, 0.18)' : btn.background,
        }}
        disabled={dead}
        onClick={() => onTogglePlaySelectMode()}
      >
        Play card
      </button>
      <button type="button" style={btn} disabled={dead || deckSize === 0} onClick={() => onDrawCard()}>
        Draw card
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {/* <span style={{ fontSize: 11, color: '#9a8fb0' }}>Gain +1</span> */}
        <button type="button" style={btn} onClick={() => onGainResource('money')}>
          Gain +1 money
        </button>
        {/* <button type="button" style={btn} disabled={dead} onClick={() => onGainResource('influence')}>
          Influence
        </button>
        <button type="button" style={btn} disabled={dead} onClick={() => onGainResource('authority')}>
          Authority
        </button> */}
      </div>
    </div>
  );
}
