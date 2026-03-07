import { describe, expect, it } from 'vitest';
import {
  STATE_TRANSITIONS,
  STATE_NOTIFICATION_TARGETS,
  isValidTransition,
} from './state-machine.js';
import type { ProjectSetupRequestState } from '@hbc/models';

/**
 * D-PH6-15 Layer 1 backend state-machine verification.
 * Ensures API-side transition rules match the documented lifecycle contract.
 */
describe('D-PH6-15 backend isValidTransition', () => {
  const states = Object.keys(STATE_TRANSITIONS) as ProjectSetupRequestState[];

  it('accepts all documented transitions', () => {
    for (const from of states) {
      for (const to of STATE_TRANSITIONS[from]) {
        expect(isValidTransition(from, to)).toBe(true);
      }
    }
  });

  it('rejects undocumented transitions', () => {
    for (const from of states) {
      for (const to of states) {
        if (!STATE_TRANSITIONS[from].includes(to)) {
          expect(isValidTransition(from, to)).toBe(false);
        }
      }
    }
  });

  it('exposes non-empty notification targets for actionable destination states', () => {
    expect(STATE_NOTIFICATION_TARGETS.NeedsClarification).toEqual(['submitter']);
    expect(STATE_NOTIFICATION_TARGETS.ReadyToProvision).toEqual(['controller']);
    expect(STATE_NOTIFICATION_TARGETS.Provisioning).toEqual(['group']);
    expect(STATE_NOTIFICATION_TARGETS.Completed).toEqual(['group']);
    expect(STATE_NOTIFICATION_TARGETS.Failed).toEqual(['controller', 'submitter']);
  });
});
