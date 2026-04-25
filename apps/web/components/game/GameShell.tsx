'use client';

import { CardBar } from '@/components/game/CardBar';
import { CrisisPanel } from '@/components/game/CrisisPanel';
import { EventModal } from '@/components/game/EventModal';
import { FactionBoard } from '@/components/game/FactionBoard';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { PlayedCards } from '@/components/game/PlayedCards';
import { Timeline } from '@/components/game/Timeline';
import { AdvisorPanel } from '@/components/game/AdvisorPanel';
import { CastleScene } from '@/components/three/CastleScene';
import { useGameStore } from '@/state/gameStore';
import { calculateStabilityIndex } from '@all-according-to-plan/shared';

export function GameShell() {
  const round = useGameStore((s) => s.state.round);
  const maxRounds = useGameStore((s) => s.state.maxRounds);
  const playerActionsUsed = useGameStore((s) => s.state.playerActionsUsed);
  const maxPlayerActionsPerRound = useGameStore((s) => s.state.maxPlayerActionsPerRound);
  const phase = useGameStore((s) => s.state.phase);
  const stats = useGameStore((s) => s.state.stats);
  const stability = calculateStabilityIndex(stats);
  if (phase === 'game_over') {
    return <GameOverScreen />;
  }

  return (
    <div className="min-h-screen bg-board-cream">
      <EventModal />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-3 py-4 md:px-4">
        <Timeline
          round={round}
          maxRounds={maxRounds}
          playerActionsUsed={playerActionsUsed}
          maxPlayerActionsPerRound={maxPlayerActionsPerRound}
          phase={phase}
        />
        <FactionBoard stats={stats} />
        <div className="grid min-h-0 grid-cols-12 gap-4">
          <aside className="col-span-4 flex min-h-[220px] flex-col lg:min-h-[360px]">
            <PlayedCards />
          </aside>
          <main className="col-span-4 min-h-[280px] lg:min-h-[420px]">
            <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm sm:h-[360px] lg:h-[440px]">
              <CastleScene />
              <div className="pointer-events-none absolute inset-y-6 right-3 z-10 flex flex-col gap-2">
                <div className="rounded-md border border-emerald-200 bg-emerald-50/95 px-2 py-2 text-center shadow-sm backdrop-blur-sm">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-800">Stability</div>
                  <div className="text-sm font-black text-emerald-900">{stability}</div>
                </div>
                <div className="rounded-md border border-rose-200 bg-rose-50/95 px-2 py-2 text-center shadow-sm backdrop-blur-sm">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-rose-800">Unity</div>
                  <div className="text-sm font-black text-rose-900">
                    {Math.round((stats.people.loyalty + stats.elites.loyalty) / 2)}
                  </div>
                </div>
                <div className="rounded-md border border-sky-200 bg-sky-50/95 px-2 py-2 text-center shadow-sm backdrop-blur-sm">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-sky-800">Security</div>
                  <div className="text-sm font-black text-sky-900">
                    {Math.round((stats.security.loyalty + stats.security.fear) / 2)}
                  </div>
                </div>
              </div>
            </div>
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
