import { describe, expect, it } from 'vitest';
import { ENABLE_ELECTIONS } from '@all-according-to-plan/shared';
import {
  applyCrisisOutcome,
  beginCrisisResolve,
  canResolveCrisis,
  crisisTestSuccessChance,
  processEndOfRoundCrises,
  rollPendingCrisis,
  spawnRandomCrisis,
} from './crisis';
import { getDefaultCrisisLibrary } from './crisis-library';
import { beginEventModal } from './round';
import { createInitialState } from './state';

const library = getDefaultCrisisLibrary();

describe('ENABLE_ELECTIONS', () => {
  it('is disabled so election rounds use normal events', () => {
    expect(ENABLE_ELECTIONS).toBe(false);
    let state = createInitialState();
    state = {
      ...state,
      round: 4,
      playerActionsUsed: 3,
      maxPlayerActionsPerRound: 3,
    };
    state = beginEventModal(state);
    expect(state.pendingEvent?.type).not.toBe('election');
  });
});

describe('spawnRandomCrisis', () => {
  it('is deterministic for the same seed and round', () => {
    const base = createInitialState();
    const a = spawnRandomCrisis(base, library, 2);
    const b = spawnRandomCrisis(base, library, 2);
    expect(a.state.activeCrises).toEqual(b.state.activeCrises);
  });
});

describe('processEndOfRoundCrises', () => {
  it('applies ongoing effects and increments doom', () => {
    const state = {
      ...createInitialState(),
      activeCrises: [{ crisisId: 'student_protests', doom: 0, createdRound: 1 }],
      legitimacy: 60,
    };
    const next = processEndOfRoundCrises(state, library);
    expect(next.legitimacy).toBeLessThan(60);
    expect(next.activeCrises[0]?.doom).toBe(1);
  });
});

describe('canResolveCrisis', () => {
  it('requires enough actions for multi-action resolution', () => {
    const state = {
      ...createInitialState(),
      activeCrises: [{ crisisId: 'military_discontent', doom: 0, createdRound: 1 }],
      playerActionsUsed: 2,
      maxPlayerActionsPerRound: 3,
      resources: { money: 10, influence: 10, authority: 10 },
    };
    const check = canResolveCrisis(state, 'military_discontent', library);
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.error).toMatch(/actions/i);
    }
  });
});

describe('crisisTestSuccessChance', () => {
  it('adds bonus for legitimacy above 50', () => {
    expect(crisisTestSuccessChance('legitimacy', 75, 50)).toBe(100);
    expect(crisisTestSuccessChance('legitimacy', 40, 50)).toBe(50);
  });
});

describe('crisis resolution flow', () => {
  it('opens modal for tested crises and resolves atomically via resolveCrisis', () => {
    const state = {
      ...createInitialState(),
      activeCrises: [{ crisisId: 'corruption_scandal', doom: 0, createdRound: 1 }],
      legitimacy: 60,
      resources: { money: 10, influence: 0, authority: 0 },
    };
    const begun = beginCrisisResolve(state, 'corruption_scandal', library);
    expect(begun.ok).toBe(true);
    if (!begun.ok) return;
    expect(begun.state.phase).toBe('crisis_modal');
    expect(begun.state.crisisStep).toBe('rolling');

    const rolled = rollPendingCrisis(begun.state, library);
    expect(rolled.ok).toBe(true);
    if (!rolled.ok) return;
    expect(rolled.state.crisisStep).toBe('revealed');
    expect(rolled.state.crisisDiceResult).not.toBeNull();

    const applied = applyCrisisOutcome(rolled.state, library);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(applied.state.phase).toBe('player');
    expect(applied.state.playerActionsUsed).toBe(1);
  });
});
