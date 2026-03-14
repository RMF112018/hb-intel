/**
 * W0-G3-T01: Step definitions for the project setup wizard.
 *
 * Each step declares validation rules that the wizard enforces as hard gates
 * on Next/Complete. The spec references `location` but the model field is
 * `projectLocation` — validation uses the model field name.
 */
import type { IStep } from '@hbc/step-wizard';
import type { IProjectSetupRequest } from '@hbc/models';

/**
 * Step 1 — Project Information.
 * Fields: projectName (required), projectLocation (required),
 * estimatedValue (optional), clientName (optional), startDate (optional).
 */
export const STEP_PROJECT_INFO: IStep<IProjectSetupRequest> = {
  stepId: 'project-info',
  label: 'Project Information',
  required: true,
  order: 1,
  validate: (request: IProjectSetupRequest): string | null => {
    if (!request.projectName?.trim()) return 'Project name is required.';
    if (!request.projectLocation?.trim()) return 'Project location is required.';
    if (request.estimatedValue !== undefined && request.estimatedValue < 0)
      return 'Estimated value must be a positive number.';
    return null;
  },
};

/**
 * Step 2 — Department & Type.
 * Fields: department (required), projectType (required),
 * projectStage (optional), contractType (optional).
 */
export const STEP_DEPARTMENT: IStep<IProjectSetupRequest> = {
  stepId: 'department',
  label: 'Department & Type',
  required: true,
  order: 2,
  validate: (request: IProjectSetupRequest): string | null => {
    if (!request.department) return 'Department is required.';
    const validDepartments: readonly string[] = ['commercial', 'luxury-residential'];
    if (!validDepartments.includes(request.department))
      return 'Select a valid department.';
    if (!request.projectType) return 'Project type is required.';
    return null;
  },
};

/**
 * Step 3 — Project Team.
 * Fields: projectLeadId (required), groupMembers (optional), viewerUPNs (optional).
 */
export const STEP_TEAM: IStep<IProjectSetupRequest> = {
  stepId: 'project-team',
  label: 'Project Team',
  required: true,
  order: 3,
  validate: (request: IProjectSetupRequest): string | null => {
    if (!request.projectLeadId) return 'A project lead (PM or Superintendent) is required.';
    return null;
  },
};

/**
 * Step 4 — Template & Add-Ons.
 * Fields: addOns (optional). Not required — defaults are acceptable.
 */
export const STEP_TEMPLATE: IStep<IProjectSetupRequest> = {
  stepId: 'template-addons',
  label: 'Template & Add-Ons',
  required: false,
  order: 4,
  validate: (): string | null => {
    return null;
  },
};

/**
 * Step 5 — Review & Submit.
 * Cross-step consistency gate: re-validates all required fields.
 */
export const STEP_REVIEW: IStep<IProjectSetupRequest> = {
  stepId: 'review-submit',
  label: 'Review & Submit',
  required: true,
  order: 5,
  validate: (request: IProjectSetupRequest): string | null => {
    if (!request.projectName?.trim()) return 'Project name is required (return to Step 1).';
    if (!request.projectLocation?.trim()) return 'Project location is required (return to Step 1).';
    if (!request.department) return 'Department is required (return to Step 2).';
    if (!request.projectType) return 'Project type is required (return to Step 2).';
    if (!request.projectLeadId) return 'Project lead is required (return to Step 3).';
    return null;
  },
};

/** All five steps in sequential order. */
export const PROJECT_SETUP_STEPS: readonly IStep<IProjectSetupRequest>[] = [
  STEP_PROJECT_INFO,
  STEP_DEPARTMENT,
  STEP_TEAM,
  STEP_TEMPLATE,
  STEP_REVIEW,
];
