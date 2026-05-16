'use client';

import { useState } from 'react';
import { useAudio } from '@/audio/useAudio';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/ui/cn';
import { labelMeta, panelBase } from '@/lib/ui/variants';

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
      <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {settings.muted ? 'Audio off' : 'Audio'}
      </Button>
      {open ? (
        <div id="audio-settings-panel" className={cn(panelBase, 'absolute right-0 top-full z-[3000] mt-2 w-64 !p-4')}>
          {!unlocked ? (
            <Button variant="primary" className="mb-3 w-full" onClick={() => void unlock()}>
              Enable audio
            </Button>
          ) : null}
          <label className="mb-3 flex items-center justify-between gap-2 text-xs font-semibold text-state-paper">
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
          <VolumeSlider label="Effects" value={settings.sfxVolume} onChange={setSfxVolume} disabled={!unlocked} />
          <p className={cn(labelMeta, 'mt-3 leading-snug')}>
            Layers react to stability, fear, elections, and collapse pressure.
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
    <label className="mb-3 block text-xs text-state-paper">
      <span className="mb-1 flex justify-between font-display font-semibold uppercase tracking-label">
        <span>{label}</span>
        <span className="tabular-nums text-state-paper-dim">{Math.round(value * 100)}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-state-amber disabled:opacity-40"
      />
    </label>
  );
}
