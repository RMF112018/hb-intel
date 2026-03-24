/**
 * P3-E7-T05 Permits Workflow and Downstream Surfaces enumerations.
 */

// ── Activity Spine Events (§1) ──────────────────────────────────────

export type PermitActivityEventType =
  | 'PERMIT_APPLICATION_SUBMITTED'
  | 'PERMIT_APPLICATION_APPROVED'
  | 'PERMIT_APPLICATION_REJECTED'
  | 'PERMIT_ISSUED'
  | 'PERMIT_STATUS_CHANGED'
  | 'STOP_WORK_ISSUED'
  | 'STOP_WORK_LIFTED'
  | 'VIOLATION_ISSUED'
  | 'INSPECTION_VISIT_RECORDED'
  | 'INSPECTION_CHECKPOINT_PASSED'
  | 'INSPECTION_CHECKPOINT_FAILED'
  | 'DEFICIENCY_OPENED'
  | 'DEFICIENCY_RESOLVED'
  | 'DEFICIENCY_VERIFIED'
  | 'REQUIRED_INSPECTIONS_GENERATED'
  | 'REQUIRED_INSPECTIONS_IMPORTED'
  | 'PERMIT_EXPIRATION_WARNING'
  | 'PERMIT_EXPIRED'
  | 'PERMIT_RENEWED'
  | 'PERMIT_CLOSED'
  | 'EVIDENCE_UPLOADED';

// ── Work Queue Rules (§3) ──────────────────────────────────────────

export type PermitWorkQueueRuleId =
  | 'WQ-PRM-01' | 'WQ-PRM-02' | 'WQ-PRM-03'
  | 'WQ-PRM-04' | 'WQ-PRM-05' | 'WQ-PRM-06' | 'WQ-PRM-07'
  | 'WQ-PRM-08' | 'WQ-PRM-09' | 'WQ-PRM-10' | 'WQ-PRM-11'
  | 'WQ-PRM-12' | 'WQ-PRM-13' | 'WQ-PRM-14' | 'WQ-PRM-15';

// ── Related Item Relationship Types (§4) ────────────────────────────

export type PermitRelationshipType =
  | 'PERMIT_GATES_MILESTONE'
  | 'PERMIT_IS_CONSTRAINT'
  | 'PERMIT_FEE_LINE'
  | 'INSPECTION_PRECEDES_MILESTONE'
  | 'CHECKPOINT_GATES_MILESTONE';

// ── Handoff Scenarios (§5) ──────────────────────────────────────────

export type PermitHandoffScenario =
  | 'SubmittedToJurisdiction'
  | 'JurisdictionReturnsForInfo'
  | 'InspectionScheduled'
  | 'DeficiencyAssigned'
  | 'ResolutionForVerification'
  | 'StopWorkResponse';

// ── Annotatable Record Types (§7.1) ─────────────────────────────────

export type PermitAnnotatableRecordType =
  | 'IssuedPermit'
  | 'InspectionVisit'
  | 'InspectionDeficiency'
  | 'RequiredInspectionCheckpoint';

// ── Work Queue Priority ─────────────────────────────────────────────

export type PermitWorkQueuePriority =
  | 'URGENT'
  | 'HIGH'
  | 'MEDIUM';
