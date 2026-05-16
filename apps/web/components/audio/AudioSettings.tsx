'use client';

import { useState } from 'react';
import { useAudio } from '@/audio/useAudio';

export function AudioSettings() {
  const [open, setOpen] = useState(false);
  const {
    settings,
    unlocked,
    unlock,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
  } = useAudio();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-700 shadow-sm hover:bg-stone-50"
        aria-expanded={open}
        aria-controls="audio-settings-panel"
      >
        {settings.muted ? 'Audio off' : 'Audio'}
      </button>
      {open ? (
        <div
          id="audio-settings-panel"
          className="absolute right-0 top-full z-[3000] mt-2 w-64 rounded-xl border border-stone-200 bg-white p-4 shadow-lg"
        >
          {!unlocked ? (
            <button
              type="button"
              onClick={() => void unlock()}
              className="mb-3 w-full rounded-lg border border-stone-800 bg-stone-900 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-stone-800"
            >
              Enable audio
            </button>
          ) : null}
          <label className="mb-3 flex items-center justify-between gap-2 text-xs font-semibold text-stone-700">
            <span>Mute</span>
            <input type="checkbox" checked={settings.muted} onChange={() => toggleMute()} />
          </label>
          <VolumeSlider
            label="Master"
            value={settings.masterVolume}
            onChange={setMasterVolume}
            disabled={!unlocked}
          />
          <VolumeSlider
            label="Music & ambience"
            value={settings.musicVolume}
            onChange={setMusicVolume}
            disabled={!unlocked}
          />
          <VolumeSlider
            label="Effects"
            value={settings.sfxVolume}
            onChange={setSfxVolume}
            disabled={!unlocked}
          />
          <p className="mt-3 text-[10px] leading-snug text-stone-500">
            Layers react to stability, fear, elections, and collapse pressure. Replace files under{' '}
            <code className="text-stone-600">public/audio</code> for production assets.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function VolumeSlider({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="mb-3 block text-xs text-stone-700">
      <span className="mb-1 flex justify-between font-semibold">
        <span>{label}</span>
        <span className="tabular-nums text-stone-500">{Math.round(value * 100)}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-stone-800 disabled:opacity-40"
      />
    </label>
  );
}
