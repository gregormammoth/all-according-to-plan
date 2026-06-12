import { describe, expect, it } from 'vitest';
import { ENABLE_ELECTIONS } from '@all-according-to-plan/shared';
import {
  applyRegimePressure,
  isRegimeCollapsed,
} from './regime';
import { createInitialState } from './state';

describe('isRegimeCollapsed', () => {
  it('returns true when legitimacy or control is zero', () => {
    expect(isRegimeCollapsed({ legitimacy: 0, control: 50 })).toBe(true);
    expect(isRegimeCollapsed({ legitimacy: 50, control: 0 })).toBe(true);
    expect(isRegimeCollapsed({ legitimacy: 1, control: 1 })).toBe(false);
  });
});

describe('applyRegimePressure', () => {
  it('reduces tracks when faction loyalty and satisfaction are low', () => {
    const stats = createInitialState().stats;
    const tracks = applyRegimePressure(stats, 75, 75);
    expect(tracks.legitimacy).toBeLessThan(75);
    expect(tracks.control).toBeLessThan(75);
  });
});

describe('election feature flag', () => {
  it('keeps election code available but disabled by default', () => {
    expect(ENABLE_ELECTIONS).toBe(false);
  });
});
