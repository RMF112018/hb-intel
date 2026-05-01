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
  PCC_PERSONA_TIER,
  PCC_PERSONA_CATEGORY,
  PCC_PERSONA_TO_PROJECT_ROLE,
  mapPccPersonaToProjectRole,
  type PccPersona,
  type PccUserRole,
  type PccPersonaTier,
  type PccPersonaCategory,
} from './PccUserRoles.js';

// Work centers (contract template registry — 21 entries from §8.1)
export {
  PCC_WORK_CENTER_IDS,
  PCC_WORK_CENTERS,
  type PccWorkCenterId,
  type PccWorkCenterMvpTier,
  type IPccWorkCenter,
} from './PccWorkCenters.js';

// MVP surfaces (eight Phase 3 PCC app navigation surfaces)
export {
  PCC_MVP_SURFACE_IDS,
  PCC_MVP_SURFACES,
  type PccMvpSurfaceId,
  type PccMvpSurfaceTier,
  type IPccMvpSurface,
} from './PccMvpSurfaces.js';

// Priority actions
export {
  PRIORITY_ACTION_CATEGORIES,
  PRIORITY_ACTION_CATEGORY_LABELS,
  PRIORITY_ACTION_CATEGORY_META,
  type PriorityActionCategory,
  type IPriorityActionCategoryMeta,
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
  WORKFLOW_STATUS_META,
  type WorkflowItemStatus,
  type IWorkflowItem,
  type IWorkflowItemAssignment,
  type IWorkflowItemAssignmentHistoryEntry,
  type IWorkflowItemTransition,
  type IWorkflowStatusMeta,
} from './WorkflowItems.js';

// Business audit
export {
  BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES,
  type BusinessAuditSourceContextType,
  type BusinessAuditSourceContext,
  type IBusinessAuditEvent,
} from './BusinessAuditEvent.js';

// Approval checkpoints
export {
  APPROVAL_CHECKPOINT_STATES,
  APPROVAL_CHECKPOINT_TYPES,
  APPROVAL_AUTHORITY_TYPES,
  REVIEWER_ACTIONS,
  type ApprovalCheckpointState,
  type ApprovalCheckpointType,
  type ApprovalAuthorityType,
  type ReviewerAction,
  type IReviewerActionRecord,
  type IApprovalCheckpoint,
} from './ApprovalCheckpoint.js';

// Comments
export type { IComment, ICommentHistoryEntry } from './Comments.js';

// Feature flags (read-model metadata only)
export {
  PCC_FEATURE_FLAG_IDS,
  PCC_FEATURE_FLAG_POSTURES,
  PCC_FEATURE_FLAGS,
  type PccFeatureFlagId,
  type PccFeatureFlagPosture,
  type IPccFeatureFlag,
} from './PccFeatureFlags.js';

// Module flags (read-model metadata only)
export {
  PCC_MODULE_FLAG_POSTURES,
  PCC_MODULE_FLAGS,
  type PccModuleFlagPosture,
  type IPccModuleFlag,
} from './PccModuleFlags.js';

// Fixture guards (pure utility)
export {
  PCC_FORBIDDEN_FIXTURE_KEYS,
  PCC_FORBIDDEN_FIXTURE_VALUE_PATTERNS,
  findForbiddenFixtureKeys,
  type PccForbiddenFixtureKey,
} from './PccFixtureGuards.js';

// Fixtures
export * from './fixtures/index.js';

// External systems
export {
  EXTERNAL_SYSTEM_IDS,
  EXTERNAL_SYSTEM_POSTURES,
  EXTERNAL_SYSTEM_CATALOG,
  LAUNCH_LINK_STATES,
  EXTERNAL_SYSTEM_REQUIRED_BEFORE,
  type ExternalSystemId,
  type ExternalSystemPosture,
  type ExternalSystemMappingStatus,
  type IntegrationHealthStatus,
  type IExternalSystemLink,
  type IExternalSystemCatalogEntry,
  type LaunchLinkState,
  type ExternalSystemRequiredBefore,
  type ILaunchLinkProjectContext,
  type IExternalSystemMissingConfig,
  type ILaunchLink,
} from './ExternalSystems.js';

// Document Control sources
export {
  DOCUMENT_CONTROL_SOURCE_IDS,
  DOCUMENT_CONTROL_SOURCES,
  DOCUMENT_CONTROL_LANES,
  DOCUMENT_CONTROL_WAVE7_LANES,
  DOCUMENT_CONTROL_LEGACY_TO_WAVE7_LANE,
  DOCUMENT_CONTROL_WAVE7_TO_LEGACY_LANE,
  DOCUMENT_CONTROL_ACTION_IDS,
  DOCUMENT_CONTROL_ACTIONS,
  DOCUMENT_CONTROL_SOURCE_KIND_IDS,
  DOCUMENT_CONTROL_EXTERNAL_SYSTEM_IDS,
  DOCUMENT_CONTROL_SOURCE_HEALTH_STATES,
  DOCUMENT_CONTROL_ACTION_FAMILIES,
  DOCUMENT_CONTROL_ACTION_CODES,
  DOCUMENT_CONTROL_ROLE_CODES,
  DOCUMENT_CONTROL_ROLE_VOCABULARY,
  DOCUMENT_CONTROL_REVIEW_STATES,
  DOCUMENT_CONTROL_REVIEW_TYPES,
  DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES,
  type DocumentControlSourceId,
  type DocumentControlSource,
  type DocumentControlSourcePosture,
  type DocumentControlLinkBehavior,
  type DocumentControlLane,
  type DocumentControlWave7Lane,
  type DocumentControlActionId,
  type DocumentControlActionExecutionState,
  type DocumentControlCapabilityPosture,
  type DocumentControlSourceKindId,
  type DocumentControlExternalSystemId,
  type DocumentControlSourceHealthState,
  type DocumentControlActionFamily,
  type DocumentControlRoleCode,
  type DocumentControlReviewState,
  type DocumentControlReviewType,
  type IDocumentControlSource,
  type IDocumentControlAction,
  type ISharePointBinding,
  type IMyProjectFilesBindingPolicy,
  type IMyProjectFilesBinding,
  type IExternalSourceBinding,
  type ProjectDocumentSourceBinding,
  type IProjectDocumentSourceRegistryEntry,
  type IProjectDocumentSourceHealth,
  type IDocumentControlActionCode,
  type IDocumentControlRoleVocabularyEntry,
  type IDocumentControlRoleActionAuthority,
  type IDocumentControlUniversalHardNoRule,
} from './DocumentControl.js';

// Site Health
export {
  SITE_HEALTH_SEVERITIES,
  REPAIR_TIERS,
  type SiteHealthSeverity,
  type SiteHealthCheckState,
  type SiteHealthRepairTier,
  type ISiteHealthCheck,
  type IDriftIndicator,
  type ISiteHealthSummary,
} from './SiteHealth.js';

// Repair requests
export {
  REPAIR_REQUEST_STATES,
  REPAIR_REQUEST_OWNER_PERSONAS,
  type RepairRequestState,
  type RepairRequestOwnerPersona,
  type IRepairRequest,
} from './RepairRequests.js';

// Settings scopes
export {
  PCC_SETTINGS_SCOPES,
  type PccSettingsScope,
  type IPccSettingsRef,
} from './PccSettings.js';

// Role-capability matrix (read-model, not auth runtime)
export {
  TEAM_ACCESS_MANAGER_PERSONAS,
  TEAM_ACCESS_LANES,
  TEAM_ACCESS_AUDIENCE_STATES,
  TEAM_ACCESS_MEMBER_KINDS,
  TEAM_ACCESS_REQUEST_STATUSES,
  TEAM_ACCESS_EXECUTION_STATUSES,
  type TeamAccessManagerPersona,
  type TeamAccessLane,
  type TeamAccessAudienceState,
  type TeamAccessMemberKind,
  type TeamAccessRequestStatus,
  type TeamAccessExecutionStatus,
  type ITeamAccessMemberRecord,
  type ITeamAccessCurrentUserContext,
  type ITeamAccessViewerLaneModel,
  type ITeamAccessRequestPreview,
  type ITeamAccessPermissionRequestLaneModel,
  type ITeamAccessAccessManagerLaneModel,
  type ITeamAccessPreviewModel,
} from './TeamAccess.js';

export {
  PCC_CAPABILITY_IDS,
  PCC_CAPABILITIES,
  PCC_PERSONA_CAPABILITIES,
  personaHasCapability,
  type PccCapabilityId,
  type IPccCapability,
} from './PccCapabilities.js';

// Wave 3 Prompt 03 read-model envelope contracts
export {
  PCC_READ_MODEL_MODES,
  PCC_READ_MODEL_SOURCE_STATUSES,
  type PccReadModelMode,
  type PccReadModelSourceStatus,
  type PccReadModelWarning,
  type PccReadModelEnvelope,
  type PccProjectProfileReadModel,
  type PccWorkCenterRegistryReadModel,
  type PccProjectHomeReadModel,
  type PccPriorityActionsReadModel,
  type PccDocumentControlReadModel,
  type PccExternalLinksReadModel,
  type PccSiteHealthReadModel,
  type PccTeamAccessReadModel,
  type PccSettingsReadModel,
  type PccReadModelResponseMap,
} from './PccReadModels.js';
