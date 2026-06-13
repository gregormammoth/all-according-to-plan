'use client';

import Image from 'next/image';
import { memo, useState } from 'react';
import type { CrisisDefinition } from '@all-according-to-plan/shared';
import {
  CRISIS_ART_GRADIENT,
  getCrisisArtSrc,
  getCrisisArtTheme,
} from '@/lib/crises/artwork';
import { cn } from '@/lib/ui/cn';

type CrisisArtworkProps = {
  crisis: CrisisDefinition;
  className?: string;
};

export const CrisisArtwork = memo(function CrisisArtwork({ crisis, className }: CrisisArtworkProps) {
  const theme = getCrisisArtTheme(crisis);
  const [failed, setFailed] = useState(false);
  const src = getCrisisArtSrc(theme);

  return (
    <div
      className={cn(
        'panel-card-art-media relative h-full w-full overflow-hidden bg-gradient-to-b',
        CRISIS_ART_GRADIENT[theme],
        className
      )}
    >
      {!failed ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 280px, 320px"
          className="object-cover object-center opacity-90 contrast-[1.05] saturate-[0.88] transition-[opacity,filter] duration-200 ease-out group-hover:opacity-100 group-hover:saturate-100"
          onError={() => setFailed(true)}
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(12,13,14,0.88)_100%)]"
        aria-hidden
      />
    </div>
  );
});
