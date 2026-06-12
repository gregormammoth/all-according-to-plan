'use client';

import { AudioSettings } from '@/components/audio/AudioSettings';
import { AudioUnlockBanner } from '@/components/audio/AudioUnlockBanner';
import { CardBar } from '@/components/game/CardBar';
import { CrisisPanel } from '@/components/game/CrisisPanel';
import { EventModal } from '@/components/game/EventModal';
import { FactionBoard } from '@/components/game/FactionBoard';
import { RegimeStatusPanel } from '@/components/game/RegimeStatusPanel';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { PlayedCards } from '@/components/game/PlayedCards';
import { Timeline } from '@/components/game/Timeline';
import { AdvisorPanel } from '@/components/game/AdvisorPanel';
import { CastleScene } from '@/components/three/CastleScene';
import { ShakeLayer } from '@/components/motion/ShakeLayer';
import { Atmosphere } from '@/components/ui/Atmosphere';
import { AnimatedNumber } from '@/lib/motion/AnimatedNumber';
import { useGameAudio } from '@/audio/useGameAudio';
import { useGameOverAudio } from '@/audio/useGameOverAudio';
import { useGameStore } from '@/state/gameStore';
import { calculateStabilityIndex } from '@all-according-to-plan/shared';
import { cn } from '@/lib/ui/cn';
import { statHud } from '@/lib/ui/variants';

export function GameShell() {
  useGameAudio();
  useGameOverAudio();
  const round = useGameStore((s) => s.state.round);
  const maxRounds = useGameStore((s) => s.state.maxRounds);
  const playerActionsUsed = useGameStore((s) => s.state.playerActionsUsed);
  const maxPlayerActionsPerRound = useGameStore((s) => s.state.maxPlayerActionsPerRound);
  const phase = useGameStore((s) => s.state.phase);
  const stats = useGameStore((s) => s.state.stats);
  const legitimacy = useGameStore((s) => s.state.legitimacy);
  const control = useGameStore((s) => s.state.control);
  const stability = calculateStabilityIndex(stats);

  if (phase === 'game_over') {
    return (
      <>
        <Atmosphere />
        <AudioUnlockBanner />
        <div className="fixed right-4 top-4 z-[3000]">
          <AudioSettings />
        </div>
        <GameOverScreen />
      </>
    );
  }

  return (
    <div className="game-shell relative">
      <Atmosphere />
      <AudioUnlockBanner />
      <EventModal />
      <div className="relative z-[2] mx-auto flex max-w-[1600px] flex-col gap-4 px-3 py-4 md:px-4">
        <div className="flex justify-end">
          <AudioSettings />
        </div>
        <Timeline
          round={round}
          maxRounds={maxRounds}
          playerActionsUsed={playerActionsUsed}
          maxPlayerActionsPerRound={maxPlayerActionsPerRound}
          phase={phase}
        />
        <RegimeStatusPanel legitimacy={legitimacy} control={control} />
        <FactionBoard stats={stats} />
        <div className="grid min-h-0 grid-cols-12 gap-4">
          <aside className="col-span-4 flex min-h-[220px] flex-col lg:min-h-[360px]">
            <PlayedCards />
          </aside>
          <main className="col-span-4 min-h-[280px] lg:min-h-[420px]">
            <ShakeLayer>
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg border border-state-steel/60 bg-scene-frame shadow-panel-deep sm:h-[360px] lg:h-[440px]">
              <CastleScene />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(12,13,14,0.5)_100%)]" />
              <div className="pointer-events-none absolute inset-y-6 right-3 z-10 flex flex-col gap-2">
                <div className={cn(statHud, 'border-faction-people/30')}>
                  <div className="text-[9px] font-display font-bold uppercase tracking-label text-faction-people">
                    Stability
                  </div>
                  <div className="font-display text-sm font-bold text-board-ink">
                    <AnimatedNumber value={stability} />
                  </div>
                </div>
                <div className={cn(statHud, 'border-state-gold/30')}>
                  <div className="text-[9px] font-display font-bold uppercase tracking-label text-state-gold">
                    Unity
                  </div>
                  <div className="font-display text-sm font-bold text-board-ink">
                    <AnimatedNumber
                      value={Math.round((stats.people.loyalty + stats.elites.loyalty) / 2)}
                    />
                  </div>
                </div>
                <div className={cn(statHud, 'border-faction-security/30')}>
                  <div className="text-[9px] font-display font-bold uppercase tracking-label text-faction-security">
                    Security
                  </div>
                  <div className="font-display text-sm font-bold text-board-ink">
                    <AnimatedNumber
                      value={Math.round((stats.security.loyalty + stats.security.fear) / 2)}
                    />
                  </div>
                </div>
              </div>
            </div>
            </ShakeLayer>
          </main>
          <aside className="col-span-4 flex min-h-[220px] flex-col lg:min-h-[360px]">
            <CrisisPanel />
          </aside>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8">
            <CardBar />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <AdvisorPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
