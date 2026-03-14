import { describe, expect, it } from 'vitest';
import { PROJECT_SETUP_WIZARD_CONFIG } from '../config/projectSetupWizardConfig.js';
import { PROJECT_SETUP_DRAFT_KEY } from '../types/index.js';
import {
  ADD_ON_DEFINITIONS,
  getAddOnsForDepartment,
} from '../config/addOnDefinitions.js';
import { buildClarificationDraftKey } from '../types/IProjectSetupWizard.js';

describe('PROJECT_SETUP_WIZARD_CONFIG', () => {
  it('has title "New Project Setup"', () => {
    expect(PROJECT_SETUP_WIZARD_CONFIG.title).toBe('New Project Setup');
  });

  it('uses sequential order mode', () => {
    expect(PROJECT_SETUP_WIZARD_CONFIG.orderMode).toBe('sequential');
  });

  it('disallows force completion', () => {
    expect(PROJECT_SETUP_WIZARD_CONFIG.allowForceComplete).toBe(false);
  });

  it('allows step reopening (for department→step-4 dependency)', () => {
    expect(PROJECT_SETUP_WIZARD_CONFIG.allowReopen).toBe(true);
  });

  it('uses the canonical draft key constant', () => {
    expect(PROJECT_SETUP_WIZARD_CONFIG.draftKey).toBe(PROJECT_SETUP_DRAFT_KEY);
    expect(PROJECT_SETUP_WIZARD_CONFIG.draftKey).toBe('project-setup-form-draft');
  });

  it('does not set onAllComplete in static config', () => {
    expect(PROJECT_SETUP_WIZARD_CONFIG.onAllComplete).toBeUndefined();
  });

  it('contains 5 steps', () => {
    expect(PROJECT_SETUP_WIZARD_CONFIG.steps).toHaveLength(5);
  });

  it('has 4 required steps and 1 optional step', () => {
    const requiredCount = PROJECT_SETUP_WIZARD_CONFIG.steps.filter((s) => s.required).length;
    expect(requiredCount).toBe(4);
  });
});

describe('ADD_ON_DEFINITIONS', () => {
  it('defines safety-pack and closeout-pack', () => {
    const slugs = ADD_ON_DEFINITIONS.map((d) => d.slug);
    expect(slugs).toContain('safety-pack');
    expect(slugs).toContain('closeout-pack');
  });

  it('safety-pack is commercial only', () => {
    const safetyPack = ADD_ON_DEFINITIONS.find((d) => d.slug === 'safety-pack')!;
    expect(safetyPack.departments).toEqual(['commercial']);
  });

  it('closeout-pack is available to both departments', () => {
    const closeoutPack = ADD_ON_DEFINITIONS.find((d) => d.slug === 'closeout-pack')!;
    expect(closeoutPack.departments).toContain('commercial');
    expect(closeoutPack.departments).toContain('luxury-residential');
  });
});

describe('getAddOnsForDepartment', () => {
  it('returns all add-ons when department is undefined', () => {
    expect(getAddOnsForDepartment(undefined)).toEqual(ADD_ON_DEFINITIONS);
  });

  it('returns both packs for commercial', () => {
    const result = getAddOnsForDepartment('commercial');
    expect(result).toHaveLength(2);
  });

  it('returns only closeout-pack for luxury-residential', () => {
    const result = getAddOnsForDepartment('luxury-residential');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('closeout-pack');
  });
});

describe('buildClarificationDraftKey', () => {
  it('prefixes request ID with clarification prefix', () => {
    expect(buildClarificationDraftKey('req-abc-123')).toBe(
      'project-setup-clarification-req-abc-123',
    );
  });
});
