import { STARTUP_LIST_DEFINITIONS } from './startup-list-definitions.js';
import { CLOSEOUT_LIST_DEFINITIONS } from './closeout-list-definitions.js';
import { SAFETY_LIST_DEFINITIONS } from './safety-list-definitions.js';
import { PROJECT_CONTROLS_LIST_DEFINITIONS } from './project-controls-list-definitions.js';
import { FINANCIAL_LIST_DEFINITIONS } from './financial-list-definitions.js';
import type { IListDefinition } from '../services/sharepoint-service.js';

/**
 * W0-G2-T07: Composed workflow-family list definitions for Step 4 provisioning.
 * 26 lists across 5 families. Parent-before-child ordering is guaranteed by
 * provisioningOrder values (10=parent/flat, 20=child) — createDataLists sorts internally.
 */
export const HB_INTEL_WORKFLOW_LIST_DEFINITIONS: IListDefinition[] = [
  ...STARTUP_LIST_DEFINITIONS,
  ...CLOSEOUT_LIST_DEFINITIONS,
  ...SAFETY_LIST_DEFINITIONS,
  ...PROJECT_CONTROLS_LIST_DEFINITIONS,
  ...FINANCIAL_LIST_DEFINITIONS,
];
