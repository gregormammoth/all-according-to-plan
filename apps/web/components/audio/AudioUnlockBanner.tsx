'use client';

import { useAudioStore } from '@/audio/audioStore';

export function AudioUnlockBanner() {
  const unlocked = useAudioStore((s) => s.unlocked);
  const showUnlockHint = useAudioStore((s) => s.showUnlockHint);
  const unlock = useAudioStore((s) => s.unlock);

  if (unlocked || !showUnlockHint) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[5000] w-[min(92vw,420px)] -translate-x-1/2 animate-slide-up">
      <button
        type="button"
        onClick={() => void unlock()}
        className="w-full rounded-md border border-state-steel/60 bg-state-graphite/95 px-4 py-3 text-left shadow-panel-deep backdrop-blur-sm transition-all duration-ui hover:border-state-amber/40"
      >
        <p className="font-display text-[10px] font-bold uppercase tracking-label text-state-paper-dim">
          State media audio
        </p>
        <p className="mt-1 text-sm font-semibold text-board-ink">Enable soundscape</p>
        <p className="mt-1 text-xs text-state-paper-dim">
          Bureaucratic ambience, crisis stings, and reactive tension. Required once per session.
        </p>
      </button>
    </div>
  );
}
