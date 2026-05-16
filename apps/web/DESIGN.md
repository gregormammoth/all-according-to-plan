# UI design system — All According to Plan

Authoritarian operating-system aesthetic: cold steel, bureaucratic paper, restrained brass, no neon or gacha chrome.

## Tokens (`tailwind.config.ts`)

| Token | Role |
|-------|------|
| `state-void` / `charcoal` / `graphite` | Background depth |
| `state-steel` / `concrete` | Borders, inactive UI |
| `board-ink` / `state-paper` | Primary text |
| `state-amber` | Authority, primary actions |
| `faction-people` (cyan) | People faction |
| `state-gold` | Elites, assets |
| `faction-security` / `faction-danger` | Security, events, crisis |

## Elevation

- `shadow-panel` — standard surfaces
- `shadow-panel-deep` — scene frame, modals
- `shadow-card` / `shadow-card-hover` / `shadow-card-pressed` — hand cards
- `shadow-btn` / `shadow-btn-hover` — mechanical controls

## Motion

- Duration: `duration-ui` (200ms), `duration-slow` (350ms)
- Easing: `ease-ui`, `ease-ui-out`
- Card hover: lift + scale + perspective tilt (CSS in `globals.css` `.game-card`)
- Modal: `animate-fade-in`, `modal-panel` slide-up

## Components

| Module | Use |
|--------|-----|
| `lib/ui/variants.ts` | `panelBase`, `btnVariant`, `pillVariant`, labels |
| `lib/cardFrame.ts` | Asset vs event card skins |
| `components/ui/Panel.tsx` | Metal panels |
| `components/ui/Button.tsx` | State-issued buttons |
| `components/ui/Atmosphere.tsx` | Vignette, noise, scanlines, fog |

## Typography

- **Display:** Barlow Condensed — titles, labels, buttons
- **Body:** IBM Plex Sans — descriptions, advisor copy
- Labels: `uppercase`, `tracking-label` / `tracking-archive`

## Before / after

**Before:** Light cream board, white cards, yellow Tailwind defaults, emerald/indigo card types.

**After:** Dark command-center shell, metal panels, brass asset cards, crimson-tinted event cards, tactile hovers, atmospheric overlays, faction-colored data only where meaningful.
