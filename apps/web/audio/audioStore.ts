'use client';

import { create } from 'zustand';
import { getAudioManager } from './AudioManager';
import {
  AUDIO_STORAGE_KEY,
  DEFAULT_AUDIO_SETTINGS,
  type AudioSettings,
} from './types';

function loadPersistedSettings(): AudioSettings {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = window.localStorage.getItem(AUDIO_STORAGE_KEY);
    if (!raw) return DEFAULT_AUDIO_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      ...DEFAULT_AUDIO_SETTINGS,
      ...parsed,
      masterVolume: clamp(parsed.masterVolume ?? DEFAULT_AUDIO_SETTINGS.masterVolume),
      musicVolume: clamp(parsed.musicVolume ?? DEFAULT_AUDIO_SETTINGS.musicVolume),
      sfxVolume: clamp(parsed.sfxVolume ?? DEFAULT_AUDIO_SETTINGS.sfxVolume),
    };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

function persistSettings(settings: AudioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* quota / private mode */
  }
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n));
}

type AudioStoreState = {
  settings: AudioSettings;
  unlocked: boolean;
  showUnlockHint: boolean;
  hydrated: boolean;
  hydrate: () => void;
  unlock: () => Promise<void>;
  setMasterVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
};

function applyToManager(settings: AudioSettings): void {
  getAudioManager().configure(settings);
}

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  settings: DEFAULT_AUDIO_SETTINGS,
  unlocked: false,
  showUnlockHint: true,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const settings = loadPersistedSettings();
    applyToManager(settings);
    set({ settings, hydrated: true });
  },
  unlock: async () => {
    if (get().unlocked) return;
    const ok = await getAudioManager().unlock();
    if (!ok) return;
    set({ unlocked: true, showUnlockHint: false });
    await getAudioManager().preloadCategories(['ui', 'event']);
    window.setTimeout(() => {
      void getAudioManager().preloadLoops();
    }, 2000);
  },
  setMasterVolume: (v) => {
    const settings = { ...get().settings, masterVolume: clamp(v) };
    persistSettings(settings);
    applyToManager(settings);
    set({ settings });
  },
  setMusicVolume: (v) => {
    const settings = { ...get().settings, musicVolume: clamp(v) };
    persistSettings(settings);
    applyToManager(settings);
    set({ settings });
  },
  setSfxVolume: (v) => {
    const settings = { ...get().settings, sfxVolume: clamp(v) };
    persistSettings(settings);
    applyToManager(settings);
    set({ settings });
  },
  setMuted: (muted) => {
    const settings = { ...get().settings, muted };
    persistSettings(settings);
    applyToManager(settings);
    set({ settings });
  },
  toggleMute: () => {
    get().setMuted(!get().settings.muted);
  },
}));
