# Audio system

Frontend-only audio for **All According to Plan**. No coupling to `game-engine`; reacts to `GameState` snapshots from Zustand.

## Architecture

```
apps/web/audio/
  types.ts           — categories, settings, atmosphere profile
  soundManifest.ts   — ids, paths, volumes, loop flags
  proceduralSfx.ts   — Web Audio fallbacks (bureaucratic / oppressive palette)
  atmosphere.ts      — layer target math from stability, fear, elections
  AudioManager.ts    — Howler + layering, crossfade tick, lazy load
  audioStore.ts      — settings persistence (localStorage)
  useAudio.ts        — play / volume hooks
  useGameAudio.ts    — atmosphere + event step reactions
  index.ts

apps/web/components/audio/
  AudioProvider.tsx
  AudioSettings.tsx
  AudioUnlockBanner.tsx
```

## Flow

1. `AudioProvider` hydrates settings on mount.
2. User clicks **Enable soundscape** → `unlock()` resumes `AudioContext`, preloads UI SFX.
3. `useGameAudio` pushes `AtmosphereProfile` each frame stats change → music/ambience layer volumes.
4. Components call `playSfx('card_play')` for one-shots.

## Sound categories

| Category | Examples |
|----------|----------|
| `ui` | hover, play, draw, gain, modal, dice, reveal tiers |
| `event` | crisis sting |
| `election` | election sting, pulse bed |
| `ambience` | hum, static, crowd, rain, drone, siren |
| `music` | base, election tension, danger, collapse |

## Reactivity (atmosphere)

Driven by `computeAtmosphereFromStats` + `computeLayerTargets` / `computeAmbienceTargets`:

- Low **stability** → danger layer, industrial hum, rain
- High **fear** → radio static, military drone
- **Election rounds** → election tension layer, stronger drone in event modal
- **Near collapse** → collapse alarm, distant sirens (sparse)
- **Consecutive event failures** → danger + static bump
- **`game_over`** → collapse bed, subdued base

## Settings

Stored under `localStorage` key `aap-audio-settings-v1`:

- master, music, SFX volumes (0–1)
- mute toggle

## Preload strategy

1. On unlock: `ui`, `event` one-shots
2. After 2s: music + ambience loops (lazy)
3. Individual sounds load on first `play()` via `ensureHowl`

## Crossfade

`AudioManager` runs a 50ms interval; layer `currentVolume` eases toward `targetVolume` at rate `0.04` per tick (~800ms full sweep). `crossfadeMusicLayer()` available for explicit long fades.

## Positional audio (future)

`playPositional(soundId, { x, y, z })` sets Howl 3D position when `spatial: true` in manifest. Wire from `CastleScene` camera-relative coords later.

## Browser / mobile

- **Autoplay policy**: audio starts only after user gesture (`AudioUnlockBanner`).
- **iOS**: keep UI sounds short; prefer built-in Web Audio fallback or MP3 in manifest.
- **Background tab**: Howler may throttle; layers resume on focus.
- **Silent mode**: iOS hardware mute switch affects Web Audio — document for players.

## Performance

- Lazy Howl instances; failed file loads use procedural engine (no repeated network 404s after cache).
- Loops use `html5: true` in Howler for long beds (lower memory on some browsers).
- One fade interval for all layers — no per-component timers.
- Avoid playing hover SFX more than once per card per hover pass (CardBar ref guard).

## Memory

- `dispose()` on hot reload / teardown unloads Howls and stops procedural loops.
- Limit concurrent loops to manifest layers only (~9 beds max).

## Debugging

```ts
getAudioManager().setDebug(true);
```

Logs unlock, load failures, and fallback usage. Inspect `useAudioStore.getState()` in React DevTools.

## Future adaptive soundtrack

1. **Stem bus** — export layers as synchronized stems (base, percussion, strings, alarms); switch stems via atmosphere targets instead of volume-only.
2. **Markov tension states** — discrete states (`calm`, `uneasy`, `crisis`, `election`) with hysteresis to avoid flicker.
3. **Wwise/FMOD Web** — if scope grows; keep `AudioManager` interface stable.
4. **Server-side mix** — unnecessary for this project; keep client-only.

## Integration examples

```tsx
const { play: playSfx, unlocked } = useAudio();
playSfx('card_play');

useGameAudio();

<AudioSettings />
```

Replace procedural beds by adding OGG files under `public/audio/` per `soundManifest.ts`.
