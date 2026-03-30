import { describe, expect, it } from 'vitest';
import type { IProjectSetupRequest } from '@hbc/models';
import {
  STEP_PROJECT_INFO,
  STEP_DEPARTMENT,
  STEP_TEAM,
  STEP_TEMPLATE,
  STEP_REVIEW,
  PROJECT_SETUP_STEPS,
} from '../config/projectSetupSteps.js';

/** Minimal valid request fixture. */
function validRequest(overrides?: Partial<IProjectSetupRequest>): IProjectSetupRequest {
  return {
    requestId: 'req-1',
    projectId: 'proj-1',
    projectName: 'Test Project',
    projectStreetAddress: '100 Main Street',
    projectCity: 'New York',
    projectCounty: 'New York',
    projectState: 'NY',
    projectZip: '10001',
    projectLocation: '100 Main Street, New York, New York, NY, 10001',
    officeDivision: 'HB HQ General Commercial (01-43)',
    projectType: 'Corporate headquarters',
    projectStage: 'Pursuit',
    submittedBy: 'user@example.com',
    submittedAt: '2026-03-14T00:00:00.000Z',
    state: 'Submitted',
    groupMembers: ['member@example.com'],
    department: 'commercial',
    projectLeadId: 'lead@example.com',
    procoreProject: 'Yes',
    ...overrides,
  };
}

// TC-FLOW-01: Step count/order, TC-FLOW-02: Required-step validation, TC-FLOW-03: Template-addons optional
describe('PROJECT_SETUP_STEPS', () => {
  // TC-FLOW-01: 5 steps in sequential order
  it('contains exactly 5 steps in sequential order', () => {
    expect(PROJECT_SETUP_STEPS).toHaveLength(5);
    expect(PROJECT_SETUP_STEPS.map((s) => s.stepId)).toEqual([
      'project-info',
      'department',
      'project-team',
      'template-addons',
      'review-submit',
    ]);
  });

  it('assigns 1-based order to every step', () => {
    PROJECT_SETUP_STEPS.forEach((step, i) => {
      expect(step.order).toBe(i + 1);
    });
  });

  // TC-FLOW-02: Required steps, TC-FLOW-03: Step 4 optional
  it('marks steps 1, 2, 3, 5 as required and step 4 as optional', () => {
    expect(PROJECT_SETUP_STEPS.map((s) => s.required)).toEqual([
      true,
      true,
      true,
      false,
      true,
    ]);
  });
});

describe('STEP_PROJECT_INFO validation', () => {
  it('passes for a valid request', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest())).toBeNull();
  });

  it('fails when projectName is empty', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ projectName: '' }))).toBe(
      'Project name is required.',
    );
  });

  it('fails when projectName is whitespace', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ projectName: '   ' }))).toBe(
      'Project name is required.',
    );
  });

  it('fails when street address is empty', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ projectStreetAddress: '' }))).toBe(
      'Street address is required.',
    );
  });

  it('fails when city is empty', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ projectCity: '' }))).toBe(
      'City is required.',
    );
  });

  it('fails when county is empty', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ projectCounty: '' }))).toBe(
      'County is required.',
    );
  });

  it('fails when state is empty', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ projectState: '' }))).toBe(
      'State is required.',
    );
  });

  it('fails when zip is empty', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ projectZip: '' }))).toBe(
      'Zip is required.',
    );
  });

  it('passes when procoreProject is unset', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ procoreProject: undefined }))).toBeNull();
  });

  it('fails when estimatedValue is negative', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ estimatedValue: -1 }))).toBe(
      'Estimated value must be a positive number.',
    );
  });

  it('passes when estimatedValue is zero', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ estimatedValue: 0 }))).toBeNull();
  });

  it('passes when estimatedValue is undefined', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ estimatedValue: undefined }))).toBeNull();
  });
});

describe('STEP_DEPARTMENT validation', () => {
  it('passes for a valid department and projectType', () => {
    expect(STEP_DEPARTMENT.validate!(validRequest())).toBeNull();
  });

  it('fails when department is undefined', () => {
    expect(STEP_DEPARTMENT.validate!(validRequest({ department: undefined }))).toBe(
      'Department is required.',
    );
  });

  it('fails when department is an invalid value', () => {
    expect(
      STEP_DEPARTMENT.validate!(validRequest({ department: 'invalid' as 'commercial' })),
    ).toBe('Select a valid department.');
  });

  it('passes for luxury-residential department', () => {
    expect(
      STEP_DEPARTMENT.validate!(
        validRequest({
          department: 'luxury-residential',
          projectType: 'Custom-built luxury residences',
        }),
      ),
    ).toBeNull();
  });

  it('fails when projectType is empty', () => {
    expect(STEP_DEPARTMENT.validate!(validRequest({ projectType: '' }))).toBe(
      'Project type is required.',
    );
  });

  it('fails when projectType does not belong to the selected department', () => {
    expect(
      STEP_DEPARTMENT.validate!(
        validRequest({
          department: 'luxury-residential',
          projectType: 'Corporate headquarters',
        }),
      ),
    ).toBe('Select a valid project type for the selected department.');
  });
});

describe('STEP_TEAM validation', () => {
  it('passes when projectLeadId is set', () => {
    expect(STEP_TEAM.validate!(validRequest())).toBeNull();
  });

  it('fails when projectLeadId is undefined', () => {
    expect(STEP_TEAM.validate!(validRequest({ projectLeadId: undefined }))).toBe(
      'A project lead (PM or Superintendent) is required.',
    );
  });

  it('fails when projectLeadId is empty string', () => {
    expect(STEP_TEAM.validate!(validRequest({ projectLeadId: '' }))).toBe(
      'A project lead (PM or Superintendent) is required.',
    );
  });
});

describe('STEP_TEMPLATE validation', () => {
  it('always passes (step is optional, no blocking validation)', () => {
    expect(STEP_TEMPLATE.validate!(validRequest())).toBeNull();
    expect(STEP_TEMPLATE.validate!(validRequest({ addOns: [] }))).toBeNull();
    expect(STEP_TEMPLATE.validate!(validRequest({ addOns: ['safety-pack'] }))).toBeNull();
  });
});

describe('STEP_REVIEW validation (cross-step consistency gate)', () => {
  it('passes when all required fields are present', () => {
    expect(STEP_REVIEW.validate!(validRequest())).toBeNull();
  });

  it('catches missing projectName', () => {
    expect(STEP_REVIEW.validate!(validRequest({ projectName: '' }))).toContain('Step 1');
  });

  it('catches missing street address', () => {
    expect(STEP_REVIEW.validate!(validRequest({ projectStreetAddress: '' }))).toContain('Step 1');
  });

  it('catches missing city', () => {
    expect(STEP_REVIEW.validate!(validRequest({ projectCity: '' }))).toContain('Step 1');
  });

  it('catches missing department', () => {
    expect(STEP_REVIEW.validate!(validRequest({ department: undefined }))).toContain('Step 2');
  });

  it('catches missing projectType', () => {
    expect(STEP_REVIEW.validate!(validRequest({ projectType: '' }))).toContain('Step 2');
  });

  it('catches invalid projectType for the selected department', () => {
    expect(
      STEP_REVIEW.validate!(
        validRequest({
          department: 'luxury-residential',
          projectType: 'Corporate headquarters',
        }),
      ),
    ).toBe('Select a valid project type for the selected department (return to Step 2).');
  });

  it('catches missing projectLeadId', () => {
    expect(STEP_REVIEW.validate!(validRequest({ projectLeadId: undefined }))).toContain('Step 3');
  });

  it('reports the first missing field (projectName before department)', () => {
    const result = STEP_REVIEW.validate!(
      validRequest({ projectName: '', department: undefined }),
    );
    expect(result).toBe('Project name is required (return to Step 1).');
  });

  it('reports structured location fields before later steps', () => {
    const result = STEP_REVIEW.validate!(
      validRequest({ projectCounty: '', department: undefined }),
    );
    expect(result).toBe('County is required (return to Step 1).');
  });
});
