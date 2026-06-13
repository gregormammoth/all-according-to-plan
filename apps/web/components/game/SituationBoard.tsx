'use client';

import { motion } from 'framer-motion';
import { CRISIS_DOOM_THRESHOLD, crisesDocument, type PlayerStats } from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';
import {
  eliteAlignmentLabel,
  securityPresenceLabel,
  sentimentLabel,
  peopleScore,
} from '@/lib/ui/metrics';
import { AnimatedNumber } from '@/lib/motion/AnimatedNumber';
import { useMotionPrefs } from '@/lib/motion/MotionProvider';
import { transitions } from '@/lib/motion/variants';
import { cn } from '@/lib/ui/cn';

const crisisById = new Map(crisesDocument.crises.map((c) => [c.id, c]));

function deriveInsights(stats: PlayerStats, activeCrises: { crisisId: string }[]): string[] {
  const lines: string[] = [];
  for (const c of activeCrises) {
    const def = crisisById.get(c.crisisId);
    if (def) lines.push(`${def.name} unresolved — ongoing penalties apply each cycle.`);
  }
  if (stats.people.satisfaction <= 4) {
    lines.push('Student protests spreading in industrial districts.');
  }
  if (stats.security.loyalty <= 4) {
    lines.push('Military loyalty declining.');
  }
  if (stats.elites.loyalty <= 4) {
    lines.push('Elite donors meeting without invitation.');
  }
  if (stats.people.fear >= 7) {
    lines.push('Security presence visible in major cities.');
  }
  if (lines.length === 0) {
    lines.push('Routine intelligence — no extraordinary threats on today\'s brief.');
  }
  return lines.slice(0, 5);
}

export function SituationBoard({ stats }: { stats: PlayerStats }) {
  const { reduced } = useMotionPrefs();
  const activeCrises = useGameStore((s) => s.state.activeCrises);
  const sentiment = sentimentLabel(peopleScore(stats));
  const eliteLabel = eliteAlignmentLabel(stats.elites.loyalty);
  const securityLabel = securityPresenceLabel(stats.security);
  const eliteLit = Math.round((stats.elites.loyalty / 10) * 8);
  const securitySegments = Math.round(((stats.security.loyalty + stats.security.fear) / 20) * 10);
  const sentimentPct = peopleScore(stats);
  const insights = deriveInsights(stats, activeCrises);

  return (
    <div className="situation-board-iron">
      <div className="situation-hero">
        <div className="situation-hero-sky" />
        <div className="situation-hero-building" aria-hidden />
        <div className="situation-hero-vignette" />
        <p className="situation-hero-caption">Ministry of Internal Order · Capital District</p>
      </div>

      <div className="situation-gauges">
        <div className="situation-gauge-block">
          <div className="situation-gauge-head">
            <span className="situation-gauge-title">Public Sentiment</span>
            <span className={cn('situation-gauge-badge', sentimentPct < 40 && 'situation-gauge-badge-warn')}>
              {sentiment}
            </span>
          </div>
          <div className="situation-gauge-track">
            <motion.div
              className="situation-gauge-fill sentiment-fill"
              initial={false}
              animate={{ scaleX: sentimentPct / 100 }}
              transition={reduced ? { duration: 0.01 } : transitions.bar}
            />
          </div>
        </div>

        <div className="situation-gauge-block">
          <div className="situation-gauge-head">
            <span className="situation-gauge-title">Elite Alignment</span>
            <span className="situation-gauge-badge">{eliteLabel}</span>
          </div>
          <div className="elite-icons-row">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className={cn('elite-icon', i < eliteLit && 'elite-icon-lit')} aria-hidden>
                👤
              </span>
            ))}
          </div>
        </div>

        <div className="situation-gauge-block">
          <div className="situation-gauge-head">
            <span className="situation-gauge-title">Security Presence</span>
            <span className="situation-gauge-badge situation-gauge-badge-strong">{securityLabel}</span>
          </div>
          <div className="security-segments">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={cn('security-segment', i < securitySegments && 'security-segment-lit')} />
            ))}
          </div>
        </div>
      </div>

      <div className="situation-insights">
        <h3 className="situation-insights-title">Key Insights</h3>
        <ul className="situation-insights-list">
          {insights.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {activeCrises.length > 0 ? (
          <p className="situation-insights-foot">
            <AnimatedNumber value={activeCrises.length} /> active crisis{activeCrises.length === 1 ? '' : 'es'} · doom
            threshold {CRISIS_DOOM_THRESHOLD}
          </p>
        ) : null}
      </div>
    </div>
  );
}
