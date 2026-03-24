/**
 * P3-E10-T10 Lane Ownership and Shared Package Reuse enumerations.
 */

// -- Package Layer (§1.1) ---------------------------------------------------

export type CloseoutPackageLayer = 'Foundation' | 'Platform' | 'Shared' | 'Feature';

// -- Surface Target (§2.1) --------------------------------------------------

export type CloseoutSurfaceTarget = 'PWA' | 'SPFx';

// -- Shared Package (§3.1) --------------------------------------------------

export type CloseoutSharedPackage =
  | 'related-items'
  | 'versioned-record'
  | 'field-annotations'
  | 'workflow-handoff'
  | 'acknowledgment'
  | 'bic-next-move'
  | 'notification-intelligence';

// -- Spine Contract (§4) ----------------------------------------------------

export type CloseoutSpineContract = 'ActivitySpine' | 'HealthSpine' | 'WorkQueue';

// -- Lane Capability (§6) ---------------------------------------------------

export type CloseoutLaneCapability =
  | 'ProjectRecords'
  | 'OrgIntelligenceWrite'
  | 'LifecycleGating'
  | 'WorkQueue'
  | 'HealthSignal'
  | 'ActivitySignal'
  | 'ReportsSnapshot';
