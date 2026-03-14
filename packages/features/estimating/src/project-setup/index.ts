/**
 * Project Setup — step-wizard integration module for the guided
 * project setup intake flow (W0-G3-T01).
 *
 * Exports wizard config, step definitions, field mapping, add-on
 * definitions, types, and draft key constants consumed by the
 * G4 estimating surface and PWA setup page.
 */

// Types
export type {
  ProjectSetupStepId,
  ProjectSetupWizardMode,
  IProjectSetupAddOnDefinition,
  IClarificationReturnState,
  IClarificationResponse,
  IClarificationResubmission,
} from './types/index.js';

export {
  PROJECT_SETUP_STEP_IDS,
  PROJECT_SETUP_DRAFT_KEY,
  PROJECT_SETUP_CLARIFICATION_DRAFT_KEY_PREFIX,
  CLARIFICATION_DRAFT_TTL_HOURS,
  buildClarificationDraftKey,
} from './types/index.js';

// Config
export {
  STEP_PROJECT_INFO,
  STEP_DEPARTMENT,
  STEP_TEAM,
  STEP_TEMPLATE,
  STEP_REVIEW,
  PROJECT_SETUP_STEPS,
  PROJECT_SETUP_WIZARD_CONFIG,
  PROJECT_SETUP_FIELD_MAP,
  resolveStepsForClarification,
  ADD_ON_DEFINITIONS,
  getAddOnsForDepartment,
  getOpenClarifications,
  buildClarificationReturnState,
  buildClarificationResponsePayload,
} from './config/index.js';
