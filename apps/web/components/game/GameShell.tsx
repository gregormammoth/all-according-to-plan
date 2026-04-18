'use client';

import { CardBar } from '@/components/game/CardBar';
import { EventModal } from '@/components/game/EventModal';
import { CrisisPanel } from '@/components/game/CrisisPanel';
import { PlayedCards } from '@/components/game/PlayedCards';
import { Timeline } from '@/components/game/Timeline';
import { AdvisorPanel } from '@/components/game/AdvisorPanel';
import { CastleScene } from '@/components/three/CastleScene';
import { useGameStore } from '@/state/gameStore';

export function GameShell() {
  const round = useGameStore((s) => s.state.round);
  const maxRounds = useGameStore((s) => s.state.maxRounds);
  const playerActionsUsed = useGameStore((s) => s.state.playerActionsUsed);
  const maxPlayerActionsPerRound = useGameStore((s) => s.state.maxPlayerActionsPerRound);
  const phase = useGameStore((s) => s.state.phase);

  return (
    <div className="shell">
      <EventModal />
      <Timeline
        round={round}
        maxRounds={maxRounds}
        playerActionsUsed={playerActionsUsed}
        maxPlayerActionsPerRound={maxPlayerActionsPerRound}
        phase={phase}
      />
      <PlayedCards />
      <div className="panel scene">
        <CastleScene />
      </div>
      <div className="right-stack">
        <AdvisorPanel />
        <CrisisPanel />
      </div>
      <CardBar />
    </div>
  );
}
