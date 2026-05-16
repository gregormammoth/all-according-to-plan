# Audio assets

Drop production files here using the paths referenced in `apps/web/audio/soundManifest.ts`.

## Folders

| Folder | Purpose |
|--------|---------|
| `music/` | Looping score layers (base, election tension, danger, collapse) |
| `ui/` | Short interface sounds |
| `events/` | Crisis stings |
| `ambience/` | World loops and one-shots (sirens, hum, static, crowd, weather, drones) |
| `elections/` | Election-specific stings and pulse beds |

## Format

- Prefer **OGG Vorbis** for loops (smaller, seamless).
- Provide **MP3** fallbacks for Safari if needed (manifest supports multiple `src` entries).
- Keep UI one-shots under **300ms** where possible.
- Normalize loops to **−18 LUFS** integrated; one-shots **−14 LUFS** peak-managed.
- Loop points: zero-cross aligned; no clicks at wrap.

## Placeholders

Run from `apps/web`:

```bash
node scripts/generate-audio-placeholders.mjs
```

Until real assets exist, the engine uses **procedural Web Audio** fallbacks (dystopian drones, static, low thuds).

## Free sources (check licenses)

- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/) — industrial, crowds (attribution)
- [Freesound](https://freesound.org/) — search: `radio static`, `distant siren`, `crowd murmur`, `drone`
- [OpenGameArt](https://opengameart.org/) — filter dark ambient / cinematic
- [Soniss GDC bundles](https://sonniss.com/gameaudiogdc) — large royalty-free packs
- [Komposite](https://komposite.io/) / [Inkwell](https://www.scoringberlin.com/) — occasional free cinematic packs

Curate toward: cold, bureaucratic, oppressive — avoid cartoon UI packs.
