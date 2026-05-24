# Architecture decisions (ADRs)

Use for cross-cutting choices that future agents cannot infer from code alone.

## When to add a file

- `GameState` or RNG contract changes
- New persistence, multiplayer, or server authority
- Replacing a major subsystem (audio, state management)

## Filename

`NNNN-short-kebab-title.md` (e.g. `0001-client-authoritative-state.md`)

## Template

```markdown
# NNNN — Title

Date: YYYY-MM-DD
Status: accepted | superseded

## Context

## Decision

## Consequences

## Alternatives rejected
```

## Do not

Store gameplay rules here — use `GAME_MECHANICS.md`.

Store agent process here — use `AGENTS.md`.
