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
  const rounds = Array.from({ length: maxRounds }, (_, i) => i + 1);
  const activeRound = phase === 'game_over' ? maxRounds : Math.min(round, maxRounds);
  const actionsLeft =
    phase === 'game_over' || phase === 'event_modal'
      ? 0
      : Math.max(0, maxPlayerActionsPerRound - playerActionsUsed);
  const phaseLabel =
    phase === 'event_modal' ? 'event — acknowledge' : phase === 'game_over' ? 'game over' : phase;
  return (
    <div className="panel timeline">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2>All According to Plan</h2>
          <div className="muted">Round-based campaign pacing</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="pill">Phase {phaseLabel}</span>
          <span className="pill">
            Round <strong>{activeRound}</strong> / {maxRounds}
          </span>
          <span className="pill">
            Player actions <strong>{actionsLeft}</strong> / {maxPlayerActionsPerRound}
          </span>
        </div>
      </div>
      <div className="timeline-years">
        {rounds.map((r) => (
          <div key={r} className={`year-node ${r === activeRound ? 'active' : ''}`}>
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}
