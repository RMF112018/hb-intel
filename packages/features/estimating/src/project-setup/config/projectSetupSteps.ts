/**
 * W0-G3-T01: Step definitions for the project setup wizard.
 *
 * Each step declares validation rules that the wizard enforces as hard gates
 * on Next/Complete.
 */
import type { IStep } from '@hbc/step-wizard';
import type { IProjectSetupRequest } from '@hbc/models';
import { isValidProjectTypeForDepartment } from './departmentTypeOptions.js';
import { getEligibleTimberscanApprovers } from './projectTeamFields.js';

/**
 * TEMPORARY: Disables all required-field enforcement for the Project Setup flow.
 * When false, required asterisks are hidden, empty-field validation is skipped,
 * and step/submit gating does not block on empty required fields.
 *
 * Format validation (e.g. "estimated value must be positive", "project type must
 * be valid for department") is preserved even when this is false.
 *
 * To restore required-field enforcement, set this to `true`.
 */
export const PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = false;

/**
 * Step 1 — Project Information.
 * Fields: projectName (required), clientName (optional), structured location
 * fields (all required), estimatedValue (optional), startDate (optional),
 * procoreProject (optional).
 */
export const STEP_PROJECT_INFO: IStep<IProjectSetupRequest> = {
  stepId: 'project-info',
  label: 'Project Information',
  required: true, // Step required for wizard navigation — independent of field-level required
  order: 1,
  validate: (request: IProjectSetupRequest): string | null => {
    // Required-field checks (temporarily disabled)
    if (PROJECT_SETUP_REQUIRED_FIELDS_ENABLED) {
      if (!request.projectName?.trim()) return 'Project name is required.';
      if (!request.projectStreetAddress?.trim()) return 'Street address is required.';
      if (!request.projectCity?.trim()) return 'City is required.';
      if (!request.projectCounty?.trim()) return 'County is required.';
      if (!request.projectState?.trim()) return 'State is required.';
      if (!request.projectZip?.trim()) return 'Zip is required.';
    }
    // Format validation (always active)
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
  required: true, // Step required for wizard navigation — independent of field-level required
  order: 2,
  validate: (request: IProjectSetupRequest): string | null => {
    // Required-field checks (temporarily disabled)
    if (PROJECT_SETUP_REQUIRED_FIELDS_ENABLED) {
      if (!request.department) return 'Department is required.';
      if (!request.projectType) return 'Project type is required.';
    }
    // Format validation (always active when values present)
    const validDepartments: readonly string[] = ['commercial', 'luxury-residential'];
    if (request.department && !validDepartments.includes(request.department))
      return 'Select a valid department.';
    if (request.department && request.projectType && !isValidProjectTypeForDepartment(request.department, request.projectType))
      return 'Select a valid project type for the selected department.';
    return null;
  },
};

/**
 * Step 3 — Project Team.
 * Fields: projectExecutiveUpn (required), projectManagerUpn (optional),
 * leadEstimatorUpn (required), supportingEstimatorUpns (optional),
 * additionalTeamMemberUpns (optional), timberscanApproverUpn (required).
 */
export const STEP_TEAM: IStep<IProjectSetupRequest> = {
  stepId: 'project-team',
  label: 'Project Team',
  required: true, // Step required for wizard navigation — independent of field-level required
  order: 3,
  validate: (request: IProjectSetupRequest): string | null => {
    // Required-field checks (temporarily disabled)
    if (PROJECT_SETUP_REQUIRED_FIELDS_ENABLED) {
      if (!request.projectExecutiveUpn) return 'Project Executive is required.';
      if (!request.leadEstimatorUpn) return 'Lead Estimator is required.';
      if (!request.timberscanApproverUpn) return 'Timberscan Approver is required.';
    }
    // Format validation (always active when values present)
    if (request.timberscanApproverUpn) {
      const eligibleApprovers = getEligibleTimberscanApprovers(request);
      if (!eligibleApprovers.includes(request.timberscanApproverUpn)) {
        return 'Timberscan Approver must be selected from the current project team.';
      }
    }
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
  required: true, // Step required for wizard navigation — independent of field-level required
  order: 5,
  validate: (request: IProjectSetupRequest): string | null => {
    // Required-field checks (temporarily disabled)
    if (PROJECT_SETUP_REQUIRED_FIELDS_ENABLED) {
      if (!request.projectName?.trim()) return 'Project name is required (return to Step 1).';
      if (!request.projectStreetAddress?.trim())
        return 'Street address is required (return to Step 1).';
      if (!request.projectCity?.trim()) return 'City is required (return to Step 1).';
      if (!request.projectCounty?.trim()) return 'County is required (return to Step 1).';
      if (!request.projectState?.trim()) return 'State is required (return to Step 1).';
      if (!request.projectZip?.trim()) return 'Zip is required (return to Step 1).';
      if (!request.department) return 'Department is required (return to Step 2).';
      if (!request.projectType) return 'Project type is required (return to Step 2).';
      if (!request.projectExecutiveUpn) return 'Project Executive is required (return to Step 3).';
      if (!request.leadEstimatorUpn) return 'Lead Estimator is required (return to Step 3).';
      if (!request.timberscanApproverUpn) {
        return 'Timberscan Approver is required (return to Step 3).';
      }
    }
    // Format validation (always active when values present)
    if (request.department && request.projectType && !isValidProjectTypeForDepartment(request.department, request.projectType))
      return 'Select a valid project type for the selected department (return to Step 2).';
    if (request.timberscanApproverUpn && !getEligibleTimberscanApprovers(request).includes(request.timberscanApproverUpn)) {
      return 'Timberscan Approver must be selected from the current project team (return to Step 3).';
    }
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
