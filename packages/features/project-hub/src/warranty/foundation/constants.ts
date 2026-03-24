/**
 * P3-E14-T10 Stage 1 Project Warranty Module foundation constants.
 * Operating model governance data serialized from T01.
 */

import type {
  WarrantyAdjacentModule,
  WarrantyCoverageSource,
  WarrantyKeyActor,
  WarrantyLayer2SeamField,
  WarrantyOperatingLayer,
  WarrantyOperationalFlowStage,
  WarrantyOutOfScopeItem,
  WarrantySoTAuthority,
  WarrantySoTRelationship,
} from './enums.js';
import type {
  IWarrantyAdjacentModuleBoundary,
  IWarrantyCoverageSourceDef,
  IWarrantyLayer2SeamFieldDef,
  IWarrantyLockedInvariant,
  IWarrantyOperationalFlowStageDef,
  IWarrantyOutOfScopeDef,
  IWarrantySoTBoundary,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const WARRANTY_OPERATING_LAYERS = [
  'LAYER_1_INTERNAL', 'LAYER_2_EXTERNAL_DEFERRED',
] as const satisfies ReadonlyArray<WarrantyOperatingLayer>;

export const WARRANTY_KEY_ACTORS = [
  'PM', 'PX', 'APM_PA', 'WARRANTY_MANAGER',
  'OWNER_DEFERRED', 'HOMEOWNER_TENANT_DEFERRED', 'SUBCONTRACTOR_DEFERRED', 'PM_LAYER2_DEFERRED',
] as const satisfies ReadonlyArray<WarrantyKeyActor>;

export const WARRANTY_SOT_AUTHORITIES = [
  'WARRANTY_MODULE', 'CLOSEOUT_MODULE', 'STARTUP_MODULE', 'FINANCIAL_MODULE',
  'HEALTH_SPINE', 'WORK_QUEUE_SPINE', 'ACTIVITY_SPINE', 'REPORTS_MODULE', 'RELATED_ITEMS',
] as const satisfies ReadonlyArray<WarrantySoTAuthority>;

export const WARRANTY_SOT_RELATIONSHIPS = [
  'AUTHOR_AND_MAINTAIN', 'CONSUME_AS_REFERENCE', 'PUBLISH_ADVISORY',
  'EMIT_EVENTS', 'SURFACE_DATA_CANDIDATES', 'PUBLISH_LINKS',
] as const satisfies ReadonlyArray<WarrantySoTRelationship>;

export const WARRANTY_ADJACENT_MODULES = [
  'CLOSEOUT', 'STARTUP', 'FINANCIAL', 'REPORTS', 'WORK_QUEUE_HEALTH',
] as const satisfies ReadonlyArray<WarrantyAdjacentModule>;

export const WARRANTY_COVERAGE_SOURCES = [
  'CLOSEOUT_TURNOVER', 'STARTUP_COMMISSIONING', 'MANUAL_ENTRY',
] as const satisfies ReadonlyArray<WarrantyCoverageSource>;

export const WARRANTY_OPERATIONAL_FLOW_STAGES = [
  'COVERAGE_POPULATED', 'ISSUE_IDENTIFIED', 'COVERAGE_DECISION_MADE',
  'SUBCONTRACTOR_ROUTING', 'VISIT_AND_REPAIR', 'VERIFICATION', 'CLOSURE',
] as const satisfies ReadonlyArray<WarrantyOperationalFlowStage>;

export const WARRANTY_OUT_OF_SCOPE_ITEMS = [
  'OWNER_PORTAL', 'SUBCONTRACTOR_ACCESS', 'OUTBOUND_NOTIFICATIONS',
  'OWNER_AUTH_ROLE', 'EXTERNAL_SLA_DASHBOARD', 'SHARED_RESOLUTION_WORKSPACE',
  'PROPERTY_MGMT_INTEGRATION', 'PROACTIVE_MAINTENANCE', 'DEFECT_LITIGATION', 'LIEN_RELEASE',
] as const satisfies ReadonlyArray<WarrantyOutOfScopeItem>;

export const WARRANTY_LAYER2_SEAM_FIELDS = [
  'SOURCE_CHANNEL', 'ENTERED_BY', 'EXTERNAL_REFERENCE_ID',
] as const satisfies ReadonlyArray<WarrantyLayer2SeamField>;

// -- Label Maps -----------------------------------------------------------------

export const WARRANTY_OPERATING_LAYER_LABELS: Readonly<Record<WarrantyOperatingLayer, string>> = {
  LAYER_1_INTERNAL: 'Layer 1 — Project Hub internal',
  LAYER_2_EXTERNAL_DEFERRED: 'Layer 2 — External collaborative workspace (deferred)',
};

export const WARRANTY_KEY_ACTOR_LABELS: Readonly<Record<WarrantyKeyActor, string>> = {
  PM: 'PM',
  PX: 'PX',
  APM_PA: 'APM / PA',
  WARRANTY_MANAGER: 'Warranty Manager',
  OWNER_DEFERRED: 'Owner (deferred to Layer 2)',
  HOMEOWNER_TENANT_DEFERRED: 'Homeowner / Tenant (deferred to Layer 2)',
  SUBCONTRACTOR_DEFERRED: 'Subcontractor (deferred to Layer 2)',
  PM_LAYER2_DEFERRED: 'PM in Layer 2 context (deferred)',
};

export const WARRANTY_ADJACENT_MODULE_LABELS: Readonly<Record<WarrantyAdjacentModule, string>> = {
  CLOSEOUT: 'Closeout (P3-E10)',
  STARTUP: 'Startup / Commissioning (P3-E11)',
  FINANCIAL: 'Financial (P3-E4)',
  REPORTS: 'Reports (P3-F1)',
  WORK_QUEUE_HEALTH: 'Work Queue (P3-D3) and Health Spine (P3-D2)',
};

export const WARRANTY_COVERAGE_SOURCE_LABELS: Readonly<Record<WarrantyCoverageSource, string>> = {
  CLOSEOUT_TURNOVER: 'Closeout turnover package (P3-E10)',
  STARTUP_COMMISSIONING: 'Startup commissioning records (P3-E11)',
  MANUAL_ENTRY: 'Manual entry for manufacturer warranties',
};

export const WARRANTY_OUT_OF_SCOPE_LABELS: Readonly<Record<WarrantyOutOfScopeItem, string>> = {
  OWNER_PORTAL: 'Owner-facing intake portal and authentication',
  SUBCONTRACTOR_ACCESS: 'Direct subcontractor access to warranty surfaces',
  OUTBOUND_NOTIFICATIONS: 'Outbound email / push notification to external parties',
  OWNER_AUTH_ROLE: 'Owner role in @hbc/auth authority model',
  EXTERNAL_SLA_DASHBOARD: 'External SLA reporting dashboard for owners',
  SHARED_RESOLUTION_WORKSPACE: 'Shared PM + owner + sub resolution workspace',
  PROPERTY_MGMT_INTEGRATION: 'Integration with property management systems',
  PROACTIVE_MAINTENANCE: 'Proactive maintenance scheduling',
  DEFECT_LITIGATION: 'Construction defect litigation management',
  LIEN_RELEASE: 'Final lien release tracking',
};

// -- SoT Boundary Matrix (T01 §5.1) -------------------------------------------

export const WARRANTY_SOT_BOUNDARIES: ReadonlyArray<IWarrantySoTBoundary> = [
  { dataConcern: 'Warranty coverage definitions', sotOwner: 'WARRANTY_MODULE', warrantyRelationship: 'AUTHOR_AND_MAINTAIN', notes: 'What is covered, by whom, for how long' },
  { dataConcern: 'Source warranty documents (certificates, turnover package)', sotOwner: 'CLOSEOUT_MODULE', warrantyRelationship: 'CONSUME_AS_REFERENCE', notes: 'Consume as linked reference; never re-author' },
  { dataConcern: 'Commissioning evidence, startup system readiness', sotOwner: 'STARTUP_MODULE', warrantyRelationship: 'CONSUME_AS_REFERENCE', notes: 'Consume as linked reference; never re-author' },
  { dataConcern: 'Active warranty case lifecycle', sotOwner: 'WARRANTY_MODULE', warrantyRelationship: 'AUTHOR_AND_MAINTAIN', notes: 'Case state, SLA, escalation, resolution' },
  { dataConcern: 'Subcontractor scope acknowledgment and resolution', sotOwner: 'WARRANTY_MODULE', warrantyRelationship: 'AUTHOR_AND_MAINTAIN', notes: 'Acknowledgment, acceptance, dispute, declaration' },
  { dataConcern: 'Owner communication history (Phase 3)', sotOwner: 'WARRANTY_MODULE', warrantyRelationship: 'AUTHOR_AND_MAINTAIN', notes: 'PM-entered OwnerIntakeLog; seam designed for Layer 2' },
  { dataConcern: 'Back-charge cost records, financial commitments', sotOwner: 'FINANCIAL_MODULE', warrantyRelationship: 'PUBLISH_ADVISORY', notes: 'Publish advisory; never write Financial records' },
  { dataConcern: 'Health metrics derived from warranty posture', sotOwner: 'HEALTH_SPINE', warrantyRelationship: 'EMIT_EVENTS', notes: 'Health computes and publishes to canvas' },
  { dataConcern: 'Work Queue routing items', sotOwner: 'WORK_QUEUE_SPINE', warrantyRelationship: 'EMIT_EVENTS', notes: 'Work Queue routes and surfaces' },
  { dataConcern: 'Activity event stream', sotOwner: 'ACTIVITY_SPINE', warrantyRelationship: 'EMIT_EVENTS', notes: 'Activity Timeline aggregates' },
  { dataConcern: 'Report artifacts assembled from warranty data', sotOwner: 'REPORTS_MODULE', warrantyRelationship: 'SURFACE_DATA_CANDIDATES', notes: 'Never own report artifacts' },
  { dataConcern: 'Related items graph', sotOwner: 'RELATED_ITEMS', warrantyRelationship: 'PUBLISH_LINKS', notes: 'Never own the graph' },
];

// -- Adjacent Module Boundaries (T01 §5.2) ------------------------------------

export const WARRANTY_ADJACENT_MODULE_BOUNDARIES: ReadonlyArray<IWarrantyAdjacentModuleBoundary> = [
  { adjacentModule: 'CLOSEOUT', whatAdjacentOwns: 'Turnover package — O&M manuals, warranty certificates, as-built documentation', whatWarrantyDoes: 'Consumes turnover records as references for coverage item registration', constraint: 'Warranty may never write to Closeout records' },
  { adjacentModule: 'STARTUP', whatAdjacentOwns: 'Commissioning evidence trail — system startup, testing, acceptance', whatWarrantyDoes: 'Reads commissioning reference for system coverage items', constraint: 'Warranty does not write to Startup records' },
  { adjacentModule: 'FINANCIAL', whatAdjacentOwns: 'All cost and commitment records', whatWarrantyDoes: 'Publishes back-charge advisory with case reference and PM-estimated impact', constraint: 'Warranty never creates a Financial commitment record' },
  { adjacentModule: 'REPORTS', whatAdjacentOwns: 'Report artifact assembly and release', whatWarrantyDoes: 'Publishes report-candidate data (posture summaries, aging, coverage expiration)', constraint: 'Reports owns the artifact; Warranty owns the underlying data' },
  { adjacentModule: 'WORK_QUEUE_HEALTH', whatAdjacentOwns: 'Aggregation, routing, and surfacing of events and metrics', whatWarrantyDoes: 'Emits events and metrics; spines aggregate and route', constraint: 'Work Queue items do not advance warranty case lifecycle; PM/system transitions do' },
];

// -- Operational Flow Stages (T01 §3.1) ----------------------------------------

export const WARRANTY_OPERATIONAL_FLOW_STAGE_DEFINITIONS: ReadonlyArray<IWarrantyOperationalFlowStageDef> = [
  { stage: 'COVERAGE_POPULATED', description: 'PM registers WarrantyCoverageItems from Closeout turnover, Startup commissioning, or manual entry' },
  { stage: 'ISSUE_IDENTIFIED', description: 'Owner or site issue identified; PM logs OwnerIntakeLog; WarrantyCase created (status: Open)' },
  { stage: 'COVERAGE_DECISION_MADE', description: 'PM/Warranty Manager determines scope: In scope → Assigned, Out of scope → Not_Covered, Not a claim → Denied, Already open → Duplicate' },
  { stage: 'SUBCONTRACTOR_ROUTING', description: 'SubcontractorAcknowledgment created; sub must acknowledge and accept/dispute scope; SLA response window starts' },
  { stage: 'VISIT_AND_REPAIR', description: 'WarrantyVisit scheduled; work transitions through Scheduled → InProgress → Corrected; evidence attached' },
  { stage: 'VERIFICATION', description: 'PM/Warranty Manager schedules verification visit; status: PendingVerification → Verified' },
  { stage: 'CLOSURE', description: 'WarrantyCaseResolutionRecord created (immutable); back-charge advisory published if flagged; case status: Closed' },
];

// -- Coverage Sources (T01 §3.1) -----------------------------------------------

export const WARRANTY_COVERAGE_SOURCE_DEFINITIONS: ReadonlyArray<IWarrantyCoverageSourceDef> = [
  { source: 'CLOSEOUT_TURNOVER', description: 'Closeout turnover package (P3-E10) — warranty certificates, O&M documentation' },
  { source: 'STARTUP_COMMISSIONING', description: 'Startup commissioning records (P3-E11) — system startup, testing, acceptance baseline' },
  { source: 'MANUAL_ENTRY', description: 'Manual entry for manufacturer warranties not captured in turnover or commissioning' },
];

// -- Out-of-Scope Items (T01 §6) -----------------------------------------------

export const WARRANTY_OUT_OF_SCOPE_DEFINITIONS: ReadonlyArray<IWarrantyOutOfScopeDef> = [
  { item: 'OWNER_PORTAL', reasonDeferred: 'Layer 2 external workspace scope' },
  { item: 'SUBCONTRACTOR_ACCESS', reasonDeferred: 'Layer 2 external workspace scope' },
  { item: 'OUTBOUND_NOTIFICATIONS', reasonDeferred: 'Layer 2 + notification infrastructure scope' },
  { item: 'OWNER_AUTH_ROLE', reasonDeferred: 'Layer 2 prerequisite; not Phase 3' },
  { item: 'EXTERNAL_SLA_DASHBOARD', reasonDeferred: 'Layer 2 scope' },
  { item: 'SHARED_RESOLUTION_WORKSPACE', reasonDeferred: 'Layer 2 scope' },
  { item: 'PROPERTY_MGMT_INTEGRATION', reasonDeferred: 'Future integration scope' },
  { item: 'PROACTIVE_MAINTENANCE', reasonDeferred: 'Facility management domain, not warranty' },
  { item: 'DEFECT_LITIGATION', reasonDeferred: 'Legal domain' },
  { item: 'LIEN_RELEASE', reasonDeferred: 'Financial / Closeout domain' },
];

// -- Layer 2 Seam Fields (T01 §4.3) -------------------------------------------

export const WARRANTY_LAYER2_SEAM_FIELD_DEFINITIONS: ReadonlyArray<IWarrantyLayer2SeamFieldDef> = [
  { field: 'SOURCE_CHANNEL', purpose: 'OwnerIntakeLog accepts future sourceChannel (e.g., OWNER_PORTAL, PM_ENTERED) so intake source is distinguishable' },
  { field: 'ENTERED_BY', purpose: 'SubcontractorAcknowledgment distinguishes PM-on-behalf from direct subcontractor entry' },
  { field: 'EXTERNAL_REFERENCE_ID', purpose: 'Identity keying stable across both layers using projectId + external party identifiers' },
];

// -- Locked Invariants (T01 §4.2) ----------------------------------------------

export const WARRANTY_LOCKED_INVARIANTS: ReadonlyArray<IWarrantyLockedInvariant> = [
  { invariant: 'CANONICAL_RECORD_INVARIANT', description: 'Layer 2 must write to the Phase 3 record model, not fork it. No parallel canonical case store may be created.' },
  { invariant: 'LAYER2_SEAM_OPTIONAL', description: 'Layer 2 seam fields (sourceChannel, enteredBy, externalReferenceId) are optional discriminators on Phase 3 records, not required fields.' },
  { invariant: 'NO_DATA_FORK', description: 'When Layer 2 is designed, its data model must extend the Phase 3 types, not replace them.' },
  { invariant: 'AWAITING_OWNER_STATE', description: 'WarrantyCase status model includes AwaitingOwner to support cases blocked on owner access — essential for Layer 2.' },
];
