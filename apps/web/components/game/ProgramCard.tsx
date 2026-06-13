'use client';

import type { Card } from '@all-according-to-plan/shared';
import { CardArtwork } from '@/components/cards/CardArtwork';
import { PanelCard } from '@/components/cards/PanelCard';
import { getArchetypeLabel } from '@/lib/cards/labels';

export function ProgramCard({ card }: { card: Card }) {
  const archetype = getArchetypeLabel(card);

  return (
    <PanelCard
      compact
      tone="gold"
      art={<CardArtwork card={card} variant="panel" />}
      title={card.name}
      subtitle={archetype}
      description={card.description}
    />
  );
}
