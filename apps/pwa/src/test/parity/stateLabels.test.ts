/**
 * W0-G5-T08: Parity contract verification — all lifecycle states have labels and badge variants.
 */
import { describe, it, expect } from 'vitest';
import { PROJECT_SETUP_STATUS_LABELS, getStateBadgeVariant } from '@hbc/provisioning';
import type { ProjectSetupRequestState } from '@hbc/models';

const ALL_STATES: ProjectSetupRequestState[] = [
  'Submitted',
  'UnderReview',
  'NeedsClarification',
  'AwaitingExternalSetup',
  'ReadyToProvision',
  'Provisioning',
  'Completed',
  'Failed',
];

describe('State labels parity (T02)', () => {
  it('all 8 states have non-empty display labels', () => {
    for (const state of ALL_STATES) {
      expect(PROJECT_SETUP_STATUS_LABELS[state]).toBeDefined();
      expect(PROJECT_SETUP_STATUS_LABELS[state].length).toBeGreaterThan(0);
    }
  });

  it('all 8 states map to valid badge variants', () => {
    const VALID_VARIANTS = ['pending', 'inProgress', 'warning', 'completed', 'error'];
    for (const state of ALL_STATES) {
      const variant = getStateBadgeVariant(state);
      expect(VALID_VARIANTS).toContain(variant);
    }
  });

  it('Completed maps to completed variant', () => {
    expect(getStateBadgeVariant('Completed')).toBe('completed');
  });

  it('Failed maps to error variant', () => {
    expect(getStateBadgeVariant('Failed')).toBe('error');
  });

  it('NeedsClarification maps to warning variant', () => {
    expect(getStateBadgeVariant('NeedsClarification')).toBe('warning');
  });
});
