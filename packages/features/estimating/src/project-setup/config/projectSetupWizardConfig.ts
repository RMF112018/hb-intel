/**
 * W0-G3-T01: Assembled IStepWizardConfig for the project setup guided flow.
 *
 * Config decisions:
 * - orderMode: 'sequential' — steps unlock linearly
 * - allowForceComplete: false — cannot skip required validation
 * - allowReopen: true — needed for department→step-4 dependency (R1 risk)
 * - onAllComplete: not set in static config — consuming surface provides at runtime
 * - draftKey: static constant; T05 governs full strategy
 */
import type { IStepWizardConfig } from '@hbc/step-wizard';
import type { IProjectSetupRequest } from '@hbc/models';
import { PROJECT_SETUP_STEPS } from './projectSetupSteps.js';
import { PROJECT_SETUP_DRAFT_KEY } from '../types/index.js';

export const PROJECT_SETUP_WIZARD_CONFIG: IStepWizardConfig<IProjectSetupRequest> = {
  title: 'New Project Setup',
  steps: [...PROJECT_SETUP_STEPS],
  orderMode: 'sequential',
  allowForceComplete: false,
  allowReopen: true,
  draftKey: PROJECT_SETUP_DRAFT_KEY,
};
