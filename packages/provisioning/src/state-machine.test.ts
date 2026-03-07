import { describe, expect, it } from 'vitest';
import {
  STATE_TRANSITIONS,
  isValidTransition,
  type ProjectSetupRequestState,
} from './state-machine.js';

describe('D-PH6-08 isValidTransition', () => {
  const allStates = Object.keys(STATE_TRANSITIONS) as ProjectSetupRequestState[];

  it('returns true for every documented valid transition', () => {
    for (const from of allStates) {
      for (const to of STATE_TRANSITIONS[from]) {
        expect(isValidTransition(from, to)).toBe(true);
      }
    }
  });

  it('returns false for every undocumented transition', () => {
    for (const from of allStates) {
      for (const to of allStates) {
        if (!STATE_TRANSITIONS[from].includes(to)) {
          expect(isValidTransition(from, to)).toBe(false);
        }
      }
    }
  });
});
