import type { Card, GamePhase, Resources } from '@all-according-to-plan/shared';
import {
  MAX_HAND_CARDS,
  canPay,
  formatCardCostLine,
  formatCardEffectsLine,
} from '@all-according-to-plan/shared';

export type PlayerHandRailProps = {
  cardIds: string[];
  resolveCard: (id: string) => Card | undefined;
  resources: Resources;
  phase: GamePhase;
  actionsRemaining: number;
  playSelectMode: boolean;
  maxHand?: number;
  onCardChosen: (cardId: string) => void;
};

export function PlayerHandRail({
  cardIds,
  resolveCard,
  resources,
  phase,
  actionsRemaining,
  playSelectMode,
  maxHand = MAX_HAND_CARDS,
  onCardChosen,
}: PlayerHandRailProps) {
  const canAct = phase === 'player' && actionsRemaining > 0;
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 4,
        minHeight: 132,
        alignItems: 'stretch',
      }}
    >
      {cardIds.map((id) => {
        const card = resolveCard(id);
        if (!card) return null;
        const affordable = canPay(resources, card.cost);
        const highlighted = playSelectMode && canAct && affordable;
        const disabled = !playSelectMode || !canAct || !affordable;
        return (
          <button
            key={id}
            type='button'
            style={{
              minWidth: 168,
              maxWidth: 220,
              borderRadius: 10,
              border: highlighted ? '1px solid #c45c3a' : '1px solid #2a2235',
              background: highlighted ? 'rgba(196, 92, 58, 0.14)' : 'rgba(22, 18, 31, 0.9)',
              padding: 10,
              textAlign: 'left',
              flexShrink: 0,
              boxShadow: highlighted ? '0 0 0 1px rgba(196, 92, 58, 0.35)' : undefined,
            }}
            disabled={disabled}
            onClick={() => onCardChosen(id)}
          >
            <div style={{ fontSize: 13, marginBottom: 6, color: '#e8e2f2' }}>{card.name}</div>
            <div style={{ fontSize: 11, color: '#9a8fb0', marginBottom: 4 }}>{card.type}</div>
            <div style={{ fontSize: 11, color: '#9a8fb0', marginBottom: 6, lineHeight: 1.35 }}>
              {card.description}
            </div>
            <div style={{ fontSize: 11, color: '#c9c0da', marginBottom: 4 }}>{formatCardCostLine(card.cost)}</div>
            <div style={{ fontSize: 10, color: '#8a7fa0', lineHeight: 1.35 }}>
              {card.immediateEffects ? formatCardEffectsLine(card.immediateEffects) : 'Effects: —'}
            </div>
            {card.delayedEffects && card.delayedEffects.length > 0 ? (
              <div style={{ fontSize: 10, color: '#6d6288', marginTop: 6, lineHeight: 1.35 }}>
                Next round: {card.delayedEffects.map((effects) => formatCardEffectsLine(effects)).join(' | ')}
              </div>
            ) : null}
          </button>
        );
      })}
      {cardIds.length === 0 ? (
        <div style={{ fontSize: 12, color: '#9a8fb0', alignSelf: 'center' }}>Hand empty</div>
      ) : null}
      <div style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 11, color: '#9a8fb0', flexShrink: 0 }}>
        {cardIds.length}/{maxHand}
      </div>
    </div>
  );
}
