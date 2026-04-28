/**
 * Aggregate PCC frozen-vocabulary re-exports for ergonomic consumption.
 *
 * All values originate in their respective domain modules; this file is a
 * convenience surface only. No new vocabulary is introduced here.
 */

export {
  PCC_PROJECT_STAGES,
  PCC_PROJECT_STATUSES,
  PCC_PROJECT_TYPES,
} from './PccProjectEnums.js';

export { PCC_PERSONAS, PCC_PERSONA_LABELS } from './PccUserRoles.js';
export { PCC_WORK_CENTER_IDS } from './PccWorkCenters.js';
export { PCC_WORKFLOW_MODULE_IDS } from './WorkflowModules.js';
export { WORKFLOW_ITEM_STATUSES } from './WorkflowItems.js';
export { APPROVAL_CHECKPOINT_STATES } from './ApprovalCheckpoint.js';
export {
  EXTERNAL_SYSTEM_IDS,
  EXTERNAL_SYSTEM_POSTURES,
} from './ExternalSystems.js';
export { DOCUMENT_CONTROL_SOURCE_IDS } from './DocumentControl.js';
export { SITE_HEALTH_SEVERITIES } from './SiteHealth.js';
export { PRIORITY_ACTION_CATEGORIES, PRIORITY_ACTION_CATEGORY_LABELS } from './PriorityActions.js';
export { PCC_SETTINGS_SCOPES } from './PccSettings.js';
