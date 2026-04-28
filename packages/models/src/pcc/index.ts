/**
 * PCC (Project Control Center) — shared foundations.
 *
 * Implementation-neutral TypeScript model contracts shared across PCC
 * surfaces (SPFx, backend, fixtures). Source of truth:
 * `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`.
 *
 * Boundary discipline (Wave 1 scope lock):
 *   - pure TypeScript, no runtime side effects;
 *   - no SPFx, PnP, Azure SDK, backend runtime, or Procore SDK imports;
 *   - no tenant URLs, no secrets, no API clients;
 *   - legacy enums in `../project/ProjectEnums.ts` and `../auth/ProjectRoles.ts`
 *     are intentionally not mutated.
 *
 * @module pcc
 */

// Branded identifiers
export type {
  PccProjectId,
  PccProjectNumber,
  PccUserId,
  PccWorkflowItemId,
  PccApprovalCheckpointId,
  PccBusinessAuditEventId,
  PccSiteUrl,
} from './types.js';

// Project lifecycle vocabulary
export {
  PCC_PROJECT_STAGES,
  PCC_PROJECT_STATUSES,
  PCC_PROJECT_TYPES,
  type PccProjectStage,
  type PccProjectStatus,
  type PccProjectType,
} from './PccProjectEnums.js';

// Project profile read model
export type { IProjectProfile } from './IProjectProfile.js';

// Personas / roles
export {
  PCC_PERSONAS,
  PCC_PERSONA_LABELS,
  PCC_PERSONA_TO_PROJECT_ROLE,
  mapPccPersonaToProjectRole,
  type PccPersona,
  type PccUserRole,
} from './PccUserRoles.js';

// Work centers
export {
  PCC_WORK_CENTER_IDS,
  PCC_WORK_CENTERS,
  type PccWorkCenterId,
  type PccWorkCenterMvpTier,
  type IPccWorkCenter,
} from './PccWorkCenters.js';

// Priority actions
export {
  PRIORITY_ACTION_CATEGORIES,
  PRIORITY_ACTION_CATEGORY_LABELS,
  type PriorityActionCategory,
  type IPriorityAction,
} from './PriorityActions.js';

// Workflow modules
export {
  PCC_WORKFLOW_MODULE_IDS,
  PCC_WORKFLOW_MODULES,
  type WorkflowModuleId,
  type WorkflowModuleMvpTier,
  type IWorkflowModule,
} from './WorkflowModules.js';

// Workflow items
export {
  WORKFLOW_ITEM_STATUSES,
  type WorkflowItemStatus,
  type IWorkflowItem,
  type IWorkflowItemAssignment,
} from './WorkflowItems.js';

// Business audit
export type { IBusinessAuditEvent } from './BusinessAuditEvent.js';

// Approval checkpoints
export {
  APPROVAL_CHECKPOINT_STATES,
  type ApprovalCheckpointState,
  type IApprovalCheckpoint,
} from './ApprovalCheckpoint.js';

// External systems
export {
  EXTERNAL_SYSTEM_IDS,
  EXTERNAL_SYSTEM_POSTURES,
  EXTERNAL_SYSTEM_CATALOG,
  type ExternalSystemId,
  type ExternalSystemPosture,
  type ExternalSystemMappingStatus,
  type IntegrationHealthStatus,
  type IExternalSystemLink,
  type IExternalSystemCatalogEntry,
} from './ExternalSystems.js';

// Document Control sources
export {
  DOCUMENT_CONTROL_SOURCE_IDS,
  DOCUMENT_CONTROL_SOURCES,
  type DocumentControlSourceId,
  type DocumentControlSource,
  type DocumentControlSourcePosture,
  type DocumentControlLinkBehavior,
  type IDocumentControlSource,
} from './DocumentControl.js';

// Site Health
export {
  SITE_HEALTH_SEVERITIES,
  type SiteHealthSeverity,
  type SiteHealthCheckState,
  type ISiteHealthSummary,
} from './SiteHealth.js';

// Settings scopes
export {
  PCC_SETTINGS_SCOPES,
  type PccSettingsScope,
  type IPccSettingsRef,
} from './PccSettings.js';
