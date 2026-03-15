/**
 * W0-G5-T08: Parity contract verification — wizard configuration matches T02 contract.
 */
import { describe, it, expect } from 'vitest';
import { PROJECT_SETUP_WIZARD_CONFIG, PROJECT_SETUP_STEPS } from '@hbc/features-estimating';

describe('Wizard config parity contract (T02)', () => {
  const EXPECTED_STEP_IDS = [
    'project-info',
    'department',
    'project-team',
    'template-addons',
    'review-submit',
  ];

  const EXPECTED_LABELS = [
    'Project Information',
    'Department & Type',
    'Project Team',
    'Template & Add-Ons',
    'Review & Submit',
  ];

  it('has exactly 5 steps', () => {
    expect(PROJECT_SETUP_STEPS).toHaveLength(5);
  });

  it('step IDs match T02 contract in order', () => {
    const ids = PROJECT_SETUP_STEPS.map((s) => s.stepId);
    expect(ids).toEqual(EXPECTED_STEP_IDS);
  });

  it('step labels match T02 contract in order', () => {
    const labels = PROJECT_SETUP_STEPS.map((s) => s.label);
    expect(labels).toEqual(EXPECTED_LABELS);
  });

  it('steps 1-3 and 5 are required; step 4 is optional', () => {
    expect(PROJECT_SETUP_STEPS[0].required).toBe(true);
    expect(PROJECT_SETUP_STEPS[1].required).toBe(true);
    expect(PROJECT_SETUP_STEPS[2].required).toBe(true);
    expect(PROJECT_SETUP_STEPS[3].required).toBe(false);
    expect(PROJECT_SETUP_STEPS[4].required).toBe(true);
  });

  it('config uses sequential order mode', () => {
    expect(PROJECT_SETUP_WIZARD_CONFIG.orderMode).toBe('sequential');
  });

  it('config allows reopen but not force complete', () => {
    expect(PROJECT_SETUP_WIZARD_CONFIG.allowReopen).toBe(true);
    expect(PROJECT_SETUP_WIZARD_CONFIG.allowForceComplete).toBe(false);
  });

  it('config has a draft key', () => {
    expect(PROJECT_SETUP_WIZARD_CONFIG.draftKey).toBeDefined();
    expect(typeof PROJECT_SETUP_WIZARD_CONFIG.draftKey).toBe('string');
  });
});
