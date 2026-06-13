'use client';

import Image from 'next/image';
import { memo, useState } from 'react';
import type { Card } from '@all-according-to-plan/shared';
import { CARD_ART_GRADIENT, getCardArtSrc, getCardArtTheme } from '@/lib/cards/artwork';
import { cn } from '@/lib/ui/cn';

type CardArtworkProps = {
  card: Card;
  className?: string;
  priority?: boolean;
};

export const CardArtwork = memo(function CardArtwork({ card, className, priority }: CardArtworkProps) {
  const theme = getCardArtTheme(card);
  const [failed, setFailed] = useState(false);
  const src = getCardArtSrc(theme);

  return (
    <div
      className={cn(
        'directive-card-art relative aspect-[16/10] w-full overflow-hidden',
        'bg-gradient-to-b',
        CARD_ART_GRADIENT[theme],
        className
      )}
    >
      {!failed ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 200px, 240px"
          className="object-cover object-center opacity-90 contrast-[1.05] saturate-[0.85] transition-[opacity,filter] duration-200 ease-out group-hover:opacity-100 group-hover:contrast-[1.1] group-hover:saturate-100 group-[.directive-card-disabled]:opacity-40"
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(12,13,14,0.92)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-2 top-2 rounded border border-state-paper/10 bg-state-charcoal/60 px-1.5 py-0.5 font-display text-[8px] font-bold uppercase tracking-[0.2em] text-state-paper-dim"
        aria-hidden
      >
        Classified
      </div>
    </div>
  );
});
