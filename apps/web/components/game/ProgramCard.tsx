'use client';

import type { Card } from '@all-according-to-plan/shared';
import { CardArtwork } from '@/components/cards/CardArtwork';
import { getArchetypeLabel, getEffectSummary } from '@/lib/cards/labels';

export function ProgramCard({ card }: { card: Card }) {
  const effects = getEffectSummary(card, 3);
  const archetype = getArchetypeLabel(card);
  const effectLine = effects.map((l) => l.replace(/^•\s*/, '')).join(' · ');

  return (
    <article className="program-row-card">
      <div className="program-row-thumb">
        <CardArtwork card={card} className="!aspect-square h-full w-full min-h-0" />
      </div>
      <div className="program-row-body">
        <h4 className="program-row-title">{card.name}</h4>
        <p className="program-row-category">{archetype}</p>
        {effectLine ? <p className="program-row-effects">{effectLine}</p> : null}
      </div>
      <div className="program-row-duration">
        <span className="program-row-duration-num">∞</span>
        <span className="program-row-duration-label">Active</span>
      </div>
    </article>
  );
}
