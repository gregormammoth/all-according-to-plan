'use client';

import { AudioUnlockBanner } from '@/components/audio/AudioUnlockBanner';
import { CardBar } from '@/components/game/CardBar';
import { CrisisModal } from '@/components/game/CrisisModal';
import { CrisisPanel } from '@/components/game/CrisisPanel';
import { EventModal } from '@/components/game/EventModal';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { GameTopBar } from '@/components/game/GameTopBar';
import { PlayedCards } from '@/components/game/PlayedCards';
import { SituationBoard } from '@/components/game/SituationBoard';
import { ShakeLayer } from '@/components/motion/ShakeLayer';
import { Atmosphere } from '@/components/ui/Atmosphere';
import { useGameAudio } from '@/audio/useGameAudio';
import { useGameOverAudio } from '@/audio/useGameOverAudio';
import { useGameStore } from '@/state/gameStore';

export function GameShell() {
  useGameAudio();
  useGameOverAudio();
  const state = useGameStore((s) => s.state);
  const {
    round,
    maxRounds,
    playerActionsUsed,
    maxPlayerActionsPerRound,
    phase,
    stats,
    legitimacy,
    control,
    resources,
  } = state;

  if (phase === 'game_over') {
    return (
      <>
        <Atmosphere />
        <AudioUnlockBanner />
        <GameOverScreen />
      </>
    );
  }

  return (
    <div className="game-board">
      <Atmosphere />
      <AudioUnlockBanner />
      <EventModal />
      <CrisisModal />
      <GameTopBar
        round={round}
        maxRounds={maxRounds}
        playerActionsUsed={playerActionsUsed}
        maxPlayerActionsPerRound={maxPlayerActionsPerRound}
        phase={phase}
        legitimacy={legitimacy}
        control={control}
        money={resources.money}
        stats={stats}
      />
      <div className="game-stage">
        <aside className="game-stage-side game-stage-left">
          <PlayedCards />
        </aside>
        <main className="game-stage-center">
          <ShakeLayer>
            <SituationBoard stats={stats} />
          </ShakeLayer>
        </main>
        <aside className="game-stage-side game-stage-right">
          <CrisisPanel />
        </aside>
      </div>
      <footer className="game-hand-dock">
        <CardBar />
      </footer>
    </div>
  );
}
