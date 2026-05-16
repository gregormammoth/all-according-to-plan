'use client';

import { useAudioStore } from '@/audio/audioStore';

export function AudioUnlockBanner() {
  const unlocked = useAudioStore((s) => s.unlocked);
  const showUnlockHint = useAudioStore((s) => s.showUnlockHint);
  const unlock = useAudioStore((s) => s.unlock);

  if (unlocked || !showUnlockHint) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[5000] w-[min(92vw,420px)] -translate-x-1/2">
      <button
        type="button"
        onClick={() => void unlock()}
        className="w-full rounded-xl border border-stone-300 bg-stone-900/92 px-4 py-3 text-left shadow-lg backdrop-blur-sm transition hover:bg-stone-800"
      >
        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">State media audio</div>
        <div className="mt-1 text-sm font-semibold text-stone-100">Enable soundscape</div>
        <p className="mt-1 text-xs text-stone-400">
          Bureaucratic ambience, crisis stings, and reactive tension. Required once per session.
        </p>
      </button>
    </div>
  );
}
