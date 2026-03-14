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
    projectLocation: 'New York, NY',
    projectType: 'Ground-Up',
    projectStage: 'Pursuit',
    submittedBy: 'user@example.com',
    submittedAt: '2026-03-14T00:00:00.000Z',
    state: 'Submitted',
    groupMembers: ['member@example.com'],
    department: 'commercial',
    projectLeadId: 'lead@example.com',
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

  it('fails when projectLocation is empty', () => {
    expect(STEP_PROJECT_INFO.validate!(validRequest({ projectLocation: '' }))).toBe(
      'Project location is required.',
    );
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
    expect(STEP_DEPARTMENT.validate!(validRequest({ department: 'luxury-residential' }))).toBeNull();
  });

  it('fails when projectType is empty', () => {
    expect(STEP_DEPARTMENT.validate!(validRequest({ projectType: '' }))).toBe(
      'Project type is required.',
    );
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

  it('catches missing projectLocation', () => {
    expect(STEP_REVIEW.validate!(validRequest({ projectLocation: '' }))).toContain('Step 1');
  });

  it('catches missing department', () => {
    expect(STEP_REVIEW.validate!(validRequest({ department: undefined }))).toContain('Step 2');
  });

  it('catches missing projectType', () => {
    expect(STEP_REVIEW.validate!(validRequest({ projectType: '' }))).toContain('Step 2');
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
});
