'use client';

import { describeGameEventEffectLines } from '@all-according-to-plan/shared';
import { useGameStore } from '@/state/gameStore';

export function EventModal() {
  const isOpen = useGameStore((s) => s.eventModal.isOpen);
  const event = useGameStore((s) => s.eventModal.event);
  const acknowledgeEvent = useGameStore((s) => s.acknowledgeEvent);
  if (!isOpen || !event) {
    return null;
  }
  const effectLines = describeGameEventEffectLines(event);
  return (
    <div
      className="event-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="event-modal-backdrop" aria-hidden="true" />
      <div className="event-modal-panel">
        <div className="event-modal-severity">Severity: {event.severity}</div>
        <h2 id="event-modal-title" className="event-modal-title">
          {event.title}
        </h2>
        <p className="event-modal-description">{event.description}</p>
        {event.condition ? (
          <div className="event-modal-section">
            <div className="event-modal-label">Condition</div>
            <p className="event-modal-body">{event.condition}</p>
          </div>
        ) : null}
        <div className="event-modal-section">
          <div className="event-modal-label">Effects</div>
          <ul className="event-modal-effects">
            {effectLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
        {event.outcomePreview ? (
          <div className="event-modal-section">
            <div className="event-modal-label">Outcome preview</div>
            <div className="event-modal-outcomes">
              <div>
                <span className="event-modal-outcome-tag">Success</span>
                <p className="event-modal-body">{event.outcomePreview.success}</p>
              </div>
              <div>
                <span className="event-modal-outcome-tag">Failure</span>
                <p className="event-modal-body">{event.outcomePreview.failure}</p>
              </div>
            </div>
          </div>
        ) : null}
        <button type="button" className="event-modal-continue" onClick={() => acknowledgeEvent()}>
          Continue
        </button>
      </div>
    </div>
  );
}
