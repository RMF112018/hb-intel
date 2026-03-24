/**
 * P3-E14-T10 Stage 1 Project Warranty Module foundation enumerations.
 * Operating model, two-layer architecture, SoT boundaries, adjacent modules, coverage sources.
 */

// -- Operating Layer (T01 §4.1) -----------------------------------------------

/** Two-layer architecture per T01 §4.1. */
export type WarrantyOperatingLayer =
  | 'LAYER_1_INTERNAL'
  | 'LAYER_2_EXTERNAL_DEFERRED';

// -- Key Actor (T01 §4.1) -----------------------------------------------------

/** Key actors per T01 §4.1 — Layer 1 active, Layer 2 deferred. */
export type WarrantyKeyActor =
  | 'PM'
  | 'PX'
  | 'APM_PA'
  | 'WARRANTY_MANAGER'
  | 'OWNER_DEFERRED'
  | 'HOMEOWNER_TENANT_DEFERRED'
  | 'SUBCONTRACTOR_DEFERRED'
  | 'PM_LAYER2_DEFERRED';

// -- SoT Authority (T01 §5.1) ------------------------------------------------

/** Source-of-truth authority owners per T01 §5.1. */
export type WarrantySoTAuthority =
  | 'WARRANTY_MODULE'
  | 'CLOSEOUT_MODULE'
  | 'STARTUP_MODULE'
  | 'FINANCIAL_MODULE'
  | 'HEALTH_SPINE'
  | 'WORK_QUEUE_SPINE'
  | 'ACTIVITY_SPINE'
  | 'REPORTS_MODULE'
  | 'RELATED_ITEMS';

// -- SoT Relationship (T01 §5.1) ---------------------------------------------

/** Warranty's relationship to each data concern per T01 §5.1. */
export type WarrantySoTRelationship =
  | 'AUTHOR_AND_MAINTAIN'
  | 'CONSUME_AS_REFERENCE'
  | 'PUBLISH_ADVISORY'
  | 'EMIT_EVENTS'
  | 'SURFACE_DATA_CANDIDATES'
  | 'PUBLISH_LINKS';

// -- Adjacent Module (T01 §5.2) -----------------------------------------------

/** Adjacent modules with explicit boundaries per T01 §5.2. */
export type WarrantyAdjacentModule =
  | 'CLOSEOUT'
  | 'STARTUP'
  | 'FINANCIAL'
  | 'REPORTS'
  | 'WORK_QUEUE_HEALTH';

// -- Coverage Source (T01 §3.1) -----------------------------------------------

/** Coverage item sources per T01 §3.1. */
export type WarrantyCoverageSource =
  | 'CLOSEOUT_TURNOVER'
  | 'STARTUP_COMMISSIONING'
  | 'MANUAL_ENTRY';

// -- Operational Flow Stage (T01 §3.1) ----------------------------------------

/** Operational flow stages per T01 §3.1. */
export type WarrantyOperationalFlowStage =
  | 'COVERAGE_POPULATED'
  | 'ISSUE_IDENTIFIED'
  | 'COVERAGE_DECISION_MADE'
  | 'SUBCONTRACTOR_ROUTING'
  | 'VISIT_AND_REPAIR'
  | 'VERIFICATION'
  | 'CLOSURE';

// -- Out-of-Scope Items (T01 §6) ---------------------------------------------

/** Explicit Phase 3 out-of-scope items per T01 §6. */
export type WarrantyOutOfScopeItem =
  | 'OWNER_PORTAL'
  | 'SUBCONTRACTOR_ACCESS'
  | 'OUTBOUND_NOTIFICATIONS'
  | 'OWNER_AUTH_ROLE'
  | 'EXTERNAL_SLA_DASHBOARD'
  | 'SHARED_RESOLUTION_WORKSPACE'
  | 'PROPERTY_MGMT_INTEGRATION'
  | 'PROACTIVE_MAINTENANCE'
  | 'DEFECT_LITIGATION'
  | 'LIEN_RELEASE';

// -- Layer 2 Seam Fields (T01 §4.3) ------------------------------------------

/** Layer 2 seam fields designed in Phase 3 per T01 §4.3. */
export type WarrantyLayer2SeamField =
  | 'SOURCE_CHANNEL'
  | 'ENTERED_BY'
  | 'EXTERNAL_REFERENCE_ID';
