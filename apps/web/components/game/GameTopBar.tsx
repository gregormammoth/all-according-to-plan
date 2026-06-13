'use client';

import { motion } from 'framer-motion';
import { AudioSettings } from '@/components/audio/AudioSettings';
import { AnimatedNumber } from '@/lib/motion/AnimatedNumber';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { controlBand, legitimacyBand } from '@/lib/regime/bands';
import {
  elitesScore,
  peopleScore,
  regimeStatusLabel,
  securityScore,
} from '@/lib/ui/metrics';
import { transitions } from '@/lib/motion/variants';
import { cn } from '@/lib/ui/cn';
import type { PlayerStats } from '@all-according-to-plan/shared';

type GameTopBarProps = {
  round: number;
  maxRounds: number;
  playerActionsUsed: number;
  maxPlayerActionsPerRound: number;
  phase: string;
  legitimacy: number;
  control: number;
  money: number;
  stats: PlayerStats;
};

function MetricColumn({
  label,
  value,
  status,
  barClass,
  icon,
  danger,
}: {
  label: string;
  value: number;
  status?: string;
  barClass: string;
  icon: string;
  danger?: boolean;
}) {
  const { reduced } = useMotionPrefs();
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="metric-column">
      <div className="metric-column-head">
        <span className="metric-icon" aria-hidden>
          {icon}
        </span>
        <span className="metric-label">{label}</span>
        <span className={cn('metric-value', danger && 'metric-value-danger')}>
          <AnimatedNumber value={value} />
          <span className="metric-denom">/100</span>
        </span>
      </div>
      {status ? (
        <span className={cn('metric-status', danger && 'metric-status-danger')}>{status}</span>
      ) : null}
      <div className="metric-bar-track">
        <motion.div
          className={cn('metric-bar-fill', barClass)}
          initial={false}
          animate={{ scaleX: pct / 100 }}
          transition={reduced ? { duration: 0.01 } : transitions.bar}
        />
      </div>
    </div>
  );
}

export function GameTopBar({
  round,
  maxRounds,
  playerActionsUsed,
  maxPlayerActionsPerRound,
  phase,
  legitimacy,
  control,
  money,
  stats,
}: GameTopBarProps) {
  const { reduced } = useMotionPrefs();
  const activeRound = phase === 'game_over' ? maxRounds : Math.min(round, maxRounds);
  const actionsLeft =
    phase === 'game_over' || phase === 'event_modal'
      ? 0
      : Math.max(0, maxPlayerActionsPerRound - playerActionsUsed);
  const phaseLabel =
    phase === 'event_modal' ? 'Directive' : phase === 'game_over' ? 'Ended' : 'Governance';
  const rounds = Array.from({ length: maxRounds }, (_, i) => i + 1);
  const regimeStatus = regimeStatusLabel(legitimacy, control);
  const legBand = legitimacyBand(legitimacy);
  const ctrlBand = controlBand(control);
  const people = peopleScore(stats);
  const elites = elitesScore(stats);
  const security = securityScore(stats);

  return (
    <header className="game-top-bar">
      <div className="campaign-header-row">
        <div className="campaign-brand">
          <p className="campaign-kicker">Campaign</p>
          <h1 className="campaign-title">All According to Plan</h1>
          <p className="campaign-subtitle">The Third Decade</p>
        </div>

        <div className="campaign-cycle-track">
          <div className="cycle-meta">
            <span className="cycle-meta-label">
              Cycle <AnimatedNumber value={activeRound} /> / {maxRounds}
            </span>
            <span className="cycle-meta-divider">·</span>
            <span className="cycle-meta-label">
              Actions {actionsLeft} / {maxPlayerActionsPerRound}
            </span>
            <span className="cycle-meta-divider">·</span>
            <span className="cycle-meta-phase">Phase: {phaseLabel}</span>
          </div>
          <div className="cycle-timeline">
            {rounds.map((r) => (
              <motion.span
                key={r}
                className={cn('cycle-dot', r === activeRound && 'cycle-dot-active', r < activeRound && 'cycle-dot-past')}
                animate={r === activeRound && !reduced ? { scale: [1, 1.08, 1] } : undefined}
                transition={{ duration: 2.2, repeat: Infinity }}
              >
                {r}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="campaign-utilities">
          <div className="utility-treasury" title="Treasury">
            <span className="utility-icon">🏛</span>
            <span className="utility-value">
              $<AnimatedNumber value={money} />
            </span>
          </div>
          <div className="utility-stat" title="People satisfaction">
            <span className="utility-icon">👥</span>
            <span className="utility-value">{Math.round(stats.people.satisfaction * 10)}</span>
          </div>
          <div className="utility-stat" title="Security fear">
            <span className="utility-icon">⚖</span>
            <span className="utility-value">{Math.round(stats.security.loyalty * 10)}</span>
          </div>
          <AudioSettings />
        </div>
      </div>

      <div className="metrics-row">
        <MetricColumn
          label="Legitimacy"
          value={legitimacy}
          status={regimeStatus.legitimacy}
          barClass={legBand.barClass}
          icon="◆"
          danger={legitimacy < 40}
        />
        <MetricColumn
          label="People"
          value={people}
          barClass="bg-faction-people/85"
          icon="☷"
          danger={people < 40}
        />
        <MetricColumn
          label="Elites"
          value={elites}
          barClass="bg-state-gold/80"
          icon="♛"
          danger={elites < 40}
        />
        <MetricColumn
          label="Security"
          value={security}
          barClass="bg-faction-security/80"
          icon="⛨"
        />
        <MetricColumn
          label="Control"
          value={control}
          status={regimeStatus.control}
          barClass={ctrlBand.barClass}
          icon="▣"
          danger={control < 40}
        />
      </div>
    </header>
  );
}
