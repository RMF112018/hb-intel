/**
 * P3-E7-T07 Data Migration, Import, and Future Integration constants.
 */

import type {
  IEvidenceUploadConfig,
  IFutureIntegrationPoint,
  IMigrationDefault,
  IMigrationFieldMapping,
  IMigrationResultMapping,
  IMigrationStatusMapping,
  IMigrationValidationCheckItem,
  ImportIdempotencyChoice,
  IVersionedRecordField,
} from './types.js';

export const MIGRATION_SCOPE = 'permits/migration' as const;

// ── Permit Field Mappings (§1.2) ────────────────────────────────────

export const PERMIT_FIELD_MAPPINGS: ReadonlyArray<IMigrationFieldMapping> = [
  { sourceField: 'id', targetField: 'issuedPermitId', notes: 'Preserve as UUID' },
  { sourceField: 'project_id', targetField: 'projectId', notes: 'Type coercion: number → string' },
  { sourceField: 'number', targetField: 'permitNumber', notes: 'Direct' },
  { sourceField: 'type', targetField: 'permitType', notes: 'Map to PermitType union' },
  { sourceField: 'status', targetField: 'currentStatus', notes: 'Via status mapping table' },
  { sourceField: 'authority', targetField: 'jurisdictionName', notes: 'Direct' },
  { sourceField: 'authorityContact.name', targetField: 'jurisdictionContact.contactName', notes: 'Renamed' },
  { sourceField: 'authorityContact.phone', targetField: 'jurisdictionContact.phone', notes: 'Optional; carry forward' },
  { sourceField: 'authorityContact.email', targetField: 'jurisdictionContact.email', notes: 'Optional; carry forward' },
  { sourceField: 'authorityContact.address', targetField: 'jurisdictionContact.address', notes: 'Optional; carry forward' },
  { sourceField: 'applicationDate', targetField: 'applicationDate', notes: 'Direct' },
  { sourceField: 'approvalDate', targetField: 'issuanceDate', notes: 'Rename; treat as issuance date' },
  { sourceField: 'expirationDate', targetField: 'expirationDate', notes: 'Direct' },
  { sourceField: 'renewalDate', targetField: 'renewalDate', notes: 'Direct; optional' },
  { sourceField: 'cost', targetField: 'permitFeeAmount', notes: 'Rename' },
  { sourceField: 'bondAmount', targetField: 'bondAmount', notes: 'Direct' },
  { sourceField: 'description', targetField: 'description', notes: 'Direct' },
  { sourceField: 'comments', targetField: '(lifecycle action notes)', notes: 'Store on synthetic ISSUED action' },
  { sourceField: 'conditions', targetField: 'conditions', notes: 'Direct (string[])' },
  { sourceField: 'tags', targetField: 'tags', notes: 'Direct (string[])' },
  { sourceField: 'priority', targetField: 'tags (append priority:level)', notes: 'No direct field; use tags' },
  { sourceField: 'expirationRisk', targetField: '(recalculated)', notes: 'Derived fresh; do not carry' },
  { sourceField: 'daysToExpiration', targetField: '(recalculated)', notes: 'Derived fresh; do not carry' },
];

// ── Inspection Visit Field Mappings ─────────────────────────────────

export const INSPECTION_VISIT_FIELD_MAPPINGS: ReadonlyArray<IMigrationFieldMapping> = [
  { sourceField: 'id', targetField: 'visitId', notes: 'Preserve UUID' },
  { sourceField: 'permitId', targetField: 'issuedPermitId', notes: 'Direct' },
  { sourceField: 'type', targetField: '(inspectorNotes header)', notes: 'No direct field; stored in notes' },
  { sourceField: 'scheduledDate', targetField: 'scheduledDate', notes: 'Direct' },
  { sourceField: 'completedDate', targetField: 'completedDate', notes: 'Direct' },
  { sourceField: 'inspector', targetField: 'inspectorName', notes: 'Direct' },
  { sourceField: 'inspectorContact.phone', targetField: 'inspectorContact.phone', notes: 'Direct' },
  { sourceField: 'inspectorContact.email', targetField: 'inspectorContact.email', notes: 'Direct' },
  { sourceField: 'inspectorContact.badge', targetField: 'inspectorContact.badgeNumber', notes: 'Rename' },
  { sourceField: 'result', targetField: 'result', notes: 'Via result mapping table' },
  { sourceField: 'complianceScore', targetField: '(dropped)', notes: 'Manual score not carried' },
  { sourceField: 'comments', targetField: 'inspectorNotes', notes: 'Rename' },
  { sourceField: 'resolutionNotes', targetField: 'internalNotes', notes: 'Rename' },
  { sourceField: 'followUpRequired', targetField: 'followUpRequired', notes: 'Direct' },
  { sourceField: 'duration', targetField: 'durationMinutes', notes: 'Direct' },
  { sourceField: 'createdAt', targetField: 'createdAt', notes: 'Direct' },
];

// ── Deficiency Field Mappings ───────────────────────────────────────

export const DEFICIENCY_FIELD_MAPPINGS: ReadonlyArray<IMigrationFieldMapping> = [
  { sourceField: 'id', targetField: 'deficiencyId', notes: 'Preserve UUID' },
  { sourceField: '(parent inspection)', targetField: 'visitId', notes: 'From parent IInspection.id' },
  { sourceField: '(parent permit)', targetField: 'issuedPermitId', notes: 'From parent chain' },
  { sourceField: 'description', targetField: 'description', notes: 'Direct' },
  { sourceField: 'severity', targetField: 'severity', notes: 'HIGH/MEDIUM carry; no LOW in old model' },
  { sourceField: 'resolved', targetField: 'resolutionStatus', notes: 'true→RESOLVED; false→OPEN' },
  { sourceField: 'resolutionNotes', targetField: 'resolutionNotes', notes: 'Direct; required if RESOLVED' },
];

// ── Checkpoint Field Mappings (§1.5) ────────────────────────────────

export const CHECKPOINT_FIELD_MAPPINGS: ReadonlyArray<IMigrationFieldMapping> = [
  { sourceField: 'inspectionId', targetField: 'checkpointId', notes: 'Preserve UUID' },
  { sourceField: 'projectId', targetField: 'projectId', notes: 'Direct' },
  { sourceField: 'permitId', targetField: 'issuedPermitId', notes: 'Direct' },
  { sourceField: 'inspectionName', targetField: 'checkpointName', notes: 'Direct' },
  { sourceField: 'codeReference', targetField: 'codeReference', notes: 'Direct' },
  { sourceField: 'dateCalledIn', targetField: 'dateCalledIn', notes: 'Direct' },
  { sourceField: 'result', targetField: 'currentResult', notes: 'Via result mapping' },
  { sourceField: 'comment', targetField: '(checkpoint name note)', notes: 'No direct notes field' },
  { sourceField: 'verifiedOnline', targetField: 'verifiedOnline', notes: 'Direct' },
  { sourceField: 'sequence', targetField: 'sequence', notes: 'Direct' },
];

// ── Status Mappings (§1.3) ──────────────────────────────────────────

export const PERMIT_STATUS_MAPPINGS: ReadonlyArray<IMigrationStatusMapping> = [
  { oldStatus: 'pending', newStatus: 'ACTIVE', notes: 'Old pending treated as active' },
  { oldStatus: 'approved', newStatus: 'ACTIVE', notes: 'Standard active state' },
  { oldStatus: 'renewed', newStatus: 'RENEWED', notes: 'Carry forward' },
  { oldStatus: 'expired', newStatus: 'EXPIRED', notes: 'Carry forward' },
  { oldStatus: 'rejected', newStatus: 'REJECTED', notes: 'Carry forward' },
];

// ── Result Mappings (§1.4) ──────────────────────────────────────────

export const INSPECTION_VISIT_RESULT_MAPPINGS: ReadonlyArray<IMigrationResultMapping> = [
  { oldResult: 'passed', newResult: 'PASSED' },
  { oldResult: 'conditional', newResult: 'PASSED_WITH_CONDITIONS' },
  { oldResult: 'failed', newResult: 'FAILED' },
  { oldResult: 'pending', newResult: 'PENDING' },
];

export const REQUIRED_INSPECTION_RESULT_MAPPINGS: ReadonlyArray<IMigrationResultMapping> = [
  { oldResult: 'Pass', newResult: 'PASS' },
  { oldResult: 'Fail', newResult: 'FAIL' },
  { oldResult: 'NA', newResult: 'NOT_APPLICABLE' },
  { oldResult: 'Pending', newResult: 'PENDING' },
];

// ── Migration Defaults ──────────────────────────────────────────────

export const MIGRATION_DEFAULTS: ReadonlyArray<IMigrationDefault> = [
  { field: 'threadRelationshipType', defaultValue: 'STANDALONE', reason: 'No thread data in prior model' },
  { field: 'threadRootPermitId', defaultValue: 'null', reason: 'No thread data' },
  { field: 'parentPermitId', defaultValue: 'null', reason: 'No thread data' },
  { field: 'accountableRole', defaultValue: 'PROJECT_MANAGER', reason: 'Default; PM to review post-migration' },
  { field: 'watcherPartyIds', defaultValue: '[]', reason: 'Empty; PM to populate' },
  { field: 'correctiveActionRequired', defaultValue: 'See resolution notes', reason: 'Placeholder for deficiency migration' },
  { field: 'requiresReinspection', defaultValue: 'false', reason: 'Default; team to update' },
  { field: 'isBlockingCloseout', defaultValue: 'true', reason: 'Conservative; team to review' },
];

// ── Migration Validation Checklist (§1.6) ───────────────────────────

export const MIGRATION_VALIDATION_CHECKLIST: ReadonlyArray<IMigrationValidationCheckItem> = [
  { checkId: 'MV-01', description: 'All prior IPermit records have a corresponding IssuedPermit record' },
  { checkId: 'MV-02', description: 'All prior IInspection records have a corresponding InspectionVisit record' },
  { checkId: 'MV-03', description: 'All prior IInspectionIssue records have a corresponding InspectionDeficiency record' },
  { checkId: 'MV-04', description: 'All prior IRequiredInspectionRecord records have a corresponding RequiredInspectionCheckpoint' },
  { checkId: 'MV-05', description: 'Each IssuedPermit has exactly one synthetic ISSUED PermitLifecycleAction' },
  { checkId: 'MV-06', description: 'complianceScore field is absent from all migrated records' },
  { checkId: 'MV-07', description: 'Health tiers are recalculated for all migrated permits' },
  { checkId: 'MV-08', description: 'Work queue items are generated where applicable' },
];

// ── Import Idempotency Choices (§2.2) ───────────────────────────────

export const IMPORT_IDEMPOTENCY_CHOICES = [
  'Append', 'Replace', 'Cancel',
] as const satisfies ReadonlyArray<ImportIdempotencyChoice>;

// ── Evidence Upload Config (§3) ─────────────────────────────────────

export const EVIDENCE_UPLOAD_CONFIG: IEvidenceUploadConfig = {
  supportedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  maxFileSizeBytes: 50 * 1024 * 1024, // 50 MB
  storageModel: 'Project document storage; storageUri holds reference',
};

// ── Versioned Record Fields (§4.1) ──────────────────────────────────

export const VERSIONED_RECORD_FIELDS: ReadonlyArray<IVersionedRecordField> = [
  { fieldName: 'expirationDate', reason: 'Renewal date changes are material for compliance' },
  { fieldName: 'jurisdictionContact', reason: 'Contact changes affect relationship ownership' },
  { fieldName: 'permitFeeAmount', reason: 'Financial amounts; audit-sensitive' },
  { fieldName: 'bondAmount', reason: 'Financial amounts; audit-sensitive' },
  { fieldName: 'conditions', reason: 'Jurisdiction conditions may be amended' },
  { fieldName: 'description', reason: 'Material changes to permit scope' },
  { fieldName: 'accountableRole', reason: 'Accountability chain changes' },
  { fieldName: 'currentResponsiblePartyId', reason: 'Accountability chain changes' },
];

// ── Future Integration Points (§5.1) ────────────────────────────────

export const FUTURE_INTEGRATION_POINTS: ReadonlyArray<IFutureIntegrationPoint> = [
  { integration: 'Jurisdiction portal status sync', description: 'Pull permit status updates from jurisdiction API', phase: 'Future' },
  { integration: 'Inspection scheduling API', description: 'Submit inspection requests directly to jurisdiction', phase: 'Future' },
  { integration: 'Electronic permit issuance', description: 'Receive issued permit documents automatically', phase: 'Future' },
  { integration: 'Violation notice sync', description: 'Pull violation notices from jurisdiction system', phase: 'Future' },
];
