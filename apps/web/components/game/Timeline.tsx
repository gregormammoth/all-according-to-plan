'use client';

type TimelineProps = {
  round: number;
  maxRounds: number;
  playerActionsUsed: number;
  maxPlayerActionsPerRound: number;
  phase: string;
};

export function Timeline({
  round,
  maxRounds,
  playerActionsUsed,
  maxPlayerActionsPerRound,
  phase,
}: TimelineProps) {
  const isElectionRound = (r: number) => r % 4 === 0 && r < 25;
  const rounds = Array.from({ length: maxRounds }, (_, i) => i + 1);
  const activeRound = phase === 'game_over' ? maxRounds : Math.min(round, maxRounds);
  const actionsLeft =
    phase === 'game_over' || phase === 'event_modal'
      ? 0
      : Math.max(0, maxPlayerActionsPerRound - playerActionsUsed);
  const phaseLabel =
    phase === 'event_modal' ? 'EVENT' : phase === 'game_over' ? 'GAME OVER' : 'PLAYER';
  const phasePillClass =
    phase === 'player'
      ? 'border-yellow-500 bg-yellow-400 text-black'
      : phase === 'event_modal'
        ? 'border-amber-400 bg-amber-100 text-amber-950'
        : 'border-stone-300 bg-stone-200 text-stone-800';

  return (
    <header className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-board-ink md:text-2xl">
            All According to Plan
          </h1>
          <p className="mt-1 text-sm text-stone-600">Round-based campaign pacing</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${phasePillClass}`}
          >
            Phase: {phaseLabel}
          </span>
          <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-stone-800">
            Round {activeRound} / {maxRounds}
          </span>
          <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-stone-800">
            Actions {actionsLeft} / {maxPlayerActionsPerRound}
          </span>
        </div>
      </div>
      <div className="mt-4 flex gap-1 pb-1">
        {rounds.map((r) => (
          <div
            key={r}
            className={`relative flex h-9 min-w-[2.25rem] shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              r === activeRound
                ? 'bg-yellow-400 text-black shadow-sm ring-2 ring-yellow-500/40'
                : isElectionRound(r)
                  ? 'border border-amber-300 bg-amber-50 text-amber-900'
                  : 'border border-stone-200 bg-stone-50 text-stone-500'
            }`}
            title={isElectionRound(r) ? `Round ${r} election` : `Round ${r}`}
          >
            {r}
            {isElectionRound(r) ? (
              <span className='absolute -right-1 -top-1 rounded-full border border-amber-300 bg-amber-100 px-1 text-[8px] font-black leading-3 text-amber-900'>
                E
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </header>
  );
}
