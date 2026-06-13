'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/state/gameStore';

export function ReportsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const state = useGameStore((s) => s.state);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="reports-modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reports-title"
        >
          <button type="button" className="reports-modal-backdrop" aria-label="Close reports" onClick={onClose} />
          <motion.div
            className="reports-modal-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-state-steel/40 pb-3">
              <div>
                <p className="font-display text-[9px] font-bold uppercase tracking-[0.14em] text-state-brass">
                  Ministry archive
                </p>
                <h2 id="reports-title" className="font-display text-lg font-bold text-board-ink">
                  Situation reports
                </h2>
              </div>
              <button type="button" className="reports-close-btn" onClick={onClose}>
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-display text-[10px] font-bold uppercase tracking-label text-state-paper-dim">
                  Event chronicle
                </h3>
                <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-xs">
                  {[...state.eventHistory].reverse().map((e, i) => (
                    <li key={`${e.eventId}-${e.round}-${i}`} className="rounded border border-state-steel/30 bg-state-graphite/40 px-2 py-1.5">
                      <span className="font-display font-bold text-board-ink">
                        Cycle {e.round} · {e.title}
                      </span>
                      {e.outcomeLabel ? (
                        <p className="mt-0.5 text-state-paper-dim">{e.outcomeLabel}</p>
                      ) : null}
                    </li>
                  ))}
                  {state.eventHistory.length === 0 ? (
                    <li className="text-state-paper-dim">No events recorded yet.</li>
                  ) : null}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-[10px] font-bold uppercase tracking-label text-state-paper-dim">
                  Operational log
                </h3>
                <div className="mt-2 max-h-48 overflow-y-auto rounded border border-state-steel/30 bg-state-charcoal/60 p-2 text-[11px] leading-relaxed text-state-paper-dim">
                  {[...state.log].reverse().map((line, i) => (
                    <div key={i} className="border-b border-state-steel/20 py-1 last:border-0">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
