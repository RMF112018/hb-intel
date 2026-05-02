/**
 * PCC Responsibility Matrix — deterministic sample fixtures.
 *
 * Phase 3 / Wave 11 / Prompt 02. Read-model only. No tenant URLs, no
 * secrets, no live UPNs, no non-deterministic identifiers, no runtime
 * Graph/PnP/SharePoint REST/Procore/Sage/AHJ/Document Crunch/Adobe Sign
 * calls. Evidence is references-only; owner-contract rows are
 * placeholder/schema-only with `0` active default obligations; product-safe
 * editorial copy avoids legal-interpretation, contract-amendment, and
 * binding-obligation language.
 *
 * Fixture coverage:
 *   - corrected workbook posture (`109` defaultItems context, `82` PM, `27`
 *     Field, `98` strict marked, `47` ambiguous, `0` owner-contract active);
 *   - one PM template item with explicit RACI marks;
 *   - one PM template item with ambiguous source marks (`Unknown` +
 *     `requiresUserReview: true`);
 *   - one Field template item with explicit RACI;
 *   - one owner-contract `placeholder-schema-only` template;
 *   - five project instance records covering: healthy, missing accountable,
 *     missing current action owner + overdue, role-vacant + person-inactive
 *     + handoff-required, and owner-contract ambiguity;
 *   - exception records for the scenarios above plus one missing required
 *     evidence reference;
 *   - both `'computed'` and `'insufficient-data'` health-score branches;
 *   - source posture reusing `PccReadModelSourceStatus` and
 *     `ProjectReadinessConfidenceState`;
 *   - snapshot history (one governed read-only record);
 *   - audit events covering assignment / current-owner / snapshot /
 *     evidence-ref change types;
 *   - full assembled `PccResponsibilityMatrixReadModel`.
 */

import type {
  IResponsibilityAssignment,
  IResponsibilityAuditEvent,
  IResponsibilityContractObligationRef,
  IResponsibilityContractPartyMapping,
  IResponsibilityDecisionRights,
  IResponsibilityException,
  IResponsibilityEvidenceLinkRef,
  IResponsibilityHandoff,
  IResponsibilityMatrixHealthScoreComputed,
  IResponsibilityMatrixHealthScoreInsufficient,
  IResponsibilityMatrixSnapshot,
  IResponsibilityMatrixSourcePosture,
  IResponsibilityNormalizedAssignment,
  IResponsibilityPersonRef,
  IResponsibilityProjectInstanceRecord,
  IResponsibilityRoleRef,
  IResponsibilityTemplateLibraryRecord,
  IResponsibilityWorkbookSourceRef,
  IResponsibilityWorkbookSourceSummary,
  IResponsibilityWorkflowStep,
} from '../ResponsibilityMatrix.js';
import { RESPONSIBILITY_MATRIX_LANES } from '../ResponsibilityMatrix.js';
import type { PccResponsibilityMatrixReadModel } from '../PccReadModels.js';
import type { PccProjectId } from '../types.js';

const RESPONSIBILITY_PROJECT_ID = 'p-rm-0001' as PccProjectId;

const PM_WORKBOOK = 'Responsibility Matrix - Template.xlsx';
const OWNER_CONTRACT_WORKBOOK = 'Responsibility Matrix - Owner Contract Template.xlsx';

// ---------------------------------------------------------------------------
// Role / person reference fixtures. UPNs and identifiers use
// `example.invalid` and a deterministic `PERSON-RM-NN` shape so no real
// tenant data is implied.
// ---------------------------------------------------------------------------

const ROLE_PROJECT_MANAGER: IResponsibilityRoleRef = {
  roleCode: 'PM',
  label: 'Project Manager',
  required: true,
};

const ROLE_PROJECT_EXECUTIVE: IResponsibilityRoleRef = {
  roleCode: 'PX',
  label: 'Project Executive',
  required: true,
};

const ROLE_LEAD_SUPER: IResponsibilityRoleRef = {
  roleCode: 'LeadSuper',
  label: 'Lead Superintendent',
  required: true,
};

const ROLE_PM2: IResponsibilityRoleRef = {
  roleCode: 'PM2',
  label: 'Assistant Project Manager',
  required: false,
};

const ROLE_OWNER: IResponsibilityRoleRef = {
  roleCode: 'Owner',
  label: 'Owner Representative',
  required: true,
};

const PERSON_PM_PRIMARY: IResponsibilityPersonRef = {
  personId: 'PERSON-RM-01',
  displayName: 'Sample PM',
  isActive: true,
};

const PERSON_PX_PRIMARY: IResponsibilityPersonRef = {
  personId: 'PERSON-RM-02',
  displayName: 'Sample PX',
  isActive: true,
};

const PERSON_LEAD_SUPER_INACTIVE: IResponsibilityPersonRef = {
  personId: 'PERSON-RM-03',
  displayName: 'Sample Lead Super',
  isActive: false,
};

const PERSON_PM_BACKUP: IResponsibilityPersonRef = {
  personId: 'PERSON-RM-04',
  displayName: 'Sample Backup PM',
  isActive: true,
};

// ---------------------------------------------------------------------------
// Workbook source summary. Counts mirror Wave 11 canonical posture.
// ---------------------------------------------------------------------------

export const SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY: IResponsibilityWorkbookSourceSummary =
  {
    defaultItemsTotal: 109,
    pmItems: 82,
    fieldItems: 27,
    strictMarkedRows: 98,
    ambiguousItemsTotal: 47,
    ownerContractActiveDefaultObligations: 0,
    sourceFiles: [PM_WORKBOOK, OWNER_CONTRACT_WORKBOOK],
  };

// ---------------------------------------------------------------------------
// Source-traceability fixtures.
// ---------------------------------------------------------------------------

const SOURCE_PM_RACI_RESOLVED: IResponsibilityWorkbookSourceRef = {
  workbookType: 'general-responsibility-matrix',
  sourceFile: PM_WORKBOOK,
  sourceSheet: 'PM',
  sourceRow: 12,
  sourceSection: 'Project Setup',
  sourceTask: 'Establish project communication plan',
  sourceMarks: ['R', 'A', 'I'],
  requiresUserReview: false,
  mappingNotes: 'Explicit RACI marks resolved directly.',
};

const SOURCE_PM_RACI_AMBIGUOUS: IResponsibilityWorkbookSourceRef = {
  workbookType: 'general-responsibility-matrix',
  sourceFile: PM_WORKBOOK,
  sourceSheet: 'PM',
  sourceRow: 41,
  sourceSection: 'Construction',
  sourceTask: 'Coordinate change-order log review cadence',
  sourceMarks: ['Support', 'Review'],
  requiresUserReview: true,
  mappingNotes: 'Non-explicit marks pending governed review.',
};

const SOURCE_FIELD_RACI_RESOLVED: IResponsibilityWorkbookSourceRef = {
  workbookType: 'general-responsibility-matrix',
  sourceFile: PM_WORKBOOK,
  sourceSheet: 'Field',
  sourceRow: 19,
  sourceSection: 'Field Coordination',
  sourceTask: 'Daily coordination meeting facilitation',
  sourceMarks: ['R', 'A'],
  requiresUserReview: false,
};

const SOURCE_OWNER_CONTRACT_PLACEHOLDER: IResponsibilityWorkbookSourceRef = {
  workbookType: 'owner-contract-responsibility-matrix',
  sourceFile: OWNER_CONTRACT_WORKBOOK,
  sourceSheet: 'Template',
  sourceRow: 6,
  sourceMarks: ['None'],
  requiresUserReview: true,
  mappingNotes: 'Owner-contract placeholder row pending governed activation.',
};

// ---------------------------------------------------------------------------
// Normalized RACI assignments referenced by template baselines.
// ---------------------------------------------------------------------------

const ASSIGNMENT_PM_RESPONSIBLE: IResponsibilityNormalizedAssignment = {
  roleRef: ROLE_PROJECT_MANAGER,
  raciValue: 'Responsible',
  sourceMark: 'R',
  requiresUserReview: false,
};

const ASSIGNMENT_PX_ACCOUNTABLE: IResponsibilityNormalizedAssignment = {
  roleRef: ROLE_PROJECT_EXECUTIVE,
  raciValue: 'Accountable',
  sourceMark: 'A',
  requiresUserReview: false,
};

const ASSIGNMENT_PM2_INFORMED: IResponsibilityNormalizedAssignment = {
  roleRef: ROLE_PM2,
  raciValue: 'Informed',
  sourceMark: 'I',
  requiresUserReview: false,
};

const ASSIGNMENT_PM_UNKNOWN: IResponsibilityNormalizedAssignment = {
  roleRef: ROLE_PROJECT_MANAGER,
  raciValue: 'Unknown',
  sourceMark: 'Support',
  requiresUserReview: true,
};

const ASSIGNMENT_LEAD_SUPER_RESPONSIBLE: IResponsibilityNormalizedAssignment = {
  roleRef: ROLE_LEAD_SUPER,
  raciValue: 'Responsible',
  sourceMark: 'R',
  requiresUserReview: false,
};

const ASSIGNMENT_PX_FIELD_ACCOUNTABLE: IResponsibilityNormalizedAssignment = {
  roleRef: ROLE_PROJECT_EXECUTIVE,
  raciValue: 'Accountable',
  sourceMark: 'A',
  requiresUserReview: false,
};

// ---------------------------------------------------------------------------
// Optional axes for the explicit-RACI PM template.
// ---------------------------------------------------------------------------

const CONTRACT_PARTY_CONTRACTOR: IResponsibilityContractPartyMapping = {
  contractParty: 'Contractor',
  mappingNotes: 'Contractor scope per project responsibility allocation.',
  requiresUserReview: false,
};

const CONTRACT_PARTY_OWNER_PLACEHOLDER: IResponsibilityContractPartyMapping = {
  contractParty: 'Owner',
  mappingNotes: 'Placeholder party scaffold pending governed activation.',
  requiresUserReview: true,
};

const OBLIGATION_REF_OWNER_PLACEHOLDER: IResponsibilityContractObligationRef = {
  contractDocumentRef: 'OWNER-CONTRACT-PLACEHOLDER',
  articleSection: 'TBD',
  obligationSummary: 'Placeholder reference pending governed obligation activation.',
};

const DECISION_RIGHTS_PM_DECIDER: IResponsibilityDecisionRights = {
  recommender: ROLE_PROJECT_MANAGER,
  decider: ROLE_PROJECT_EXECUTIVE,
  performer: ROLE_PROJECT_MANAGER,
  inputs: [ROLE_LEAD_SUPER, ROLE_PM2],
};

// ---------------------------------------------------------------------------
// Template library records.
// ---------------------------------------------------------------------------

const TEMPLATE_PM_RESOLVED: IResponsibilityTemplateLibraryRecord = {
  templateItemId: 'RM-PM-0012',
  templateVersion: '1.0.0',
  status: 'approved',
  effectiveDateUtc: '2026-01-01T00:00:00.000Z',
  sourceSnapshot: SOURCE_PM_RACI_RESOLVED,
  classification: 'active-default-item',
  criticality: 'high',
  domain: 'contracts-commercial',
  sourceTask: SOURCE_PM_RACI_RESOLVED.sourceTask ?? '',
  baselineRaci: [ASSIGNMENT_PM_RESPONSIBLE, ASSIGNMENT_PX_ACCOUNTABLE, ASSIGNMENT_PM2_INFORMED],
  baselineContractPartyMapping: CONTRACT_PARTY_CONTRACTOR,
  decisionRights: DECISION_RIGHTS_PM_DECIDER,
};

const TEMPLATE_PM_AMBIGUOUS: IResponsibilityTemplateLibraryRecord = {
  templateItemId: 'RM-PM-0041',
  templateVersion: '1.0.0',
  status: 'draft',
  sourceSnapshot: SOURCE_PM_RACI_AMBIGUOUS,
  classification: 'ambiguous-review-required',
  criticality: 'medium',
  domain: 'cost-accounting',
  sourceTask: SOURCE_PM_RACI_AMBIGUOUS.sourceTask ?? '',
  baselineRaci: [ASSIGNMENT_PM_UNKNOWN],
};

const TEMPLATE_FIELD_RESOLVED: IResponsibilityTemplateLibraryRecord = {
  templateItemId: 'RM-FLD-0019',
  templateVersion: '1.0.0',
  status: 'approved',
  effectiveDateUtc: '2026-01-01T00:00:00.000Z',
  sourceSnapshot: SOURCE_FIELD_RACI_RESOLVED,
  classification: 'active-default-item',
  criticality: 'high',
  domain: 'field-operations',
  sourceTask: SOURCE_FIELD_RACI_RESOLVED.sourceTask ?? '',
  baselineRaci: [ASSIGNMENT_LEAD_SUPER_RESPONSIBLE, ASSIGNMENT_PX_FIELD_ACCOUNTABLE],
};

const TEMPLATE_OWNER_CONTRACT_PLACEHOLDER: IResponsibilityTemplateLibraryRecord = {
  templateItemId: 'RM-OC-PLACEHOLDER-0006',
  templateVersion: '1.0.0',
  status: 'draft',
  sourceSnapshot: SOURCE_OWNER_CONTRACT_PLACEHOLDER,
  classification: 'placeholder-schema-only',
  criticality: 'low',
  domain: 'contracts-commercial',
  sourceTask: 'Owner-contract placeholder row pending governed activation.',
  baselineRaci: [],
  baselineContractPartyMapping: CONTRACT_PARTY_OWNER_PLACEHOLDER,
  obligationRef: OBLIGATION_REF_OWNER_PLACEHOLDER,
};

export const SAMPLE_RESPONSIBILITY_MATRIX_TEMPLATES: readonly IResponsibilityTemplateLibraryRecord[] =
  [
    TEMPLATE_PM_RESOLVED,
    TEMPLATE_PM_AMBIGUOUS,
    TEMPLATE_FIELD_RESOLVED,
    TEMPLATE_OWNER_CONTRACT_PLACEHOLDER,
  ];

// ---------------------------------------------------------------------------
// Project-instance assignments and supporting fixtures.
// ---------------------------------------------------------------------------

const ASSIGNMENT_HEALTHY: IResponsibilityAssignment = {
  ownerRole: ROLE_PROJECT_MANAGER,
  supportRoles: [ROLE_PM2],
  reviewerRoles: [ROLE_PROJECT_EXECUTIVE],
  signOffRoles: [ROLE_PROJECT_EXECUTIVE],
  accountableOwner: PERSON_PX_PRIMARY,
  currentActionOwner: PERSON_PM_PRIMARY,
  dueDateUtc: '2026-06-30T00:00:00.000Z',
  isOverdue: false,
  lifecycleState: 'created',
};

const ASSIGNMENT_MISSING_ACCOUNTABLE: IResponsibilityAssignment = {
  ownerRole: ROLE_PROJECT_MANAGER,
  supportRoles: [],
  reviewerRoles: [],
  signOffRoles: [],
  currentActionOwner: PERSON_PM_PRIMARY,
  dueDateUtc: '2026-06-30T00:00:00.000Z',
  isOverdue: false,
  lifecycleState: 'created',
};

const ASSIGNMENT_OVERDUE_NO_CURRENT: IResponsibilityAssignment = {
  ownerRole: ROLE_PROJECT_MANAGER,
  supportRoles: [],
  reviewerRoles: [ROLE_PROJECT_EXECUTIVE],
  signOffRoles: [ROLE_PROJECT_EXECUTIVE],
  accountableOwner: PERSON_PX_PRIMARY,
  dueDateUtc: '2026-04-15T00:00:00.000Z',
  isOverdue: true,
  lifecycleState: 'reassigned',
};

const ASSIGNMENT_VACANT_INACTIVE: IResponsibilityAssignment = {
  ownerRole: ROLE_LEAD_SUPER,
  supportRoles: [ROLE_PM2],
  reviewerRoles: [],
  signOffRoles: [ROLE_PROJECT_EXECUTIVE],
  accountableOwner: PERSON_LEAD_SUPER_INACTIVE,
  currentActionOwner: PERSON_LEAD_SUPER_INACTIVE,
  dueDateUtc: '2026-05-15T00:00:00.000Z',
  isOverdue: true,
  lifecycleState: 'handoff-pending',
};

const ASSIGNMENT_OWNER_CONTRACT_AMBIGUITY: IResponsibilityAssignment = {
  ownerRole: ROLE_OWNER,
  supportRoles: [],
  reviewerRoles: [],
  signOffRoles: [],
  isOverdue: false,
  lifecycleState: 'unassigned',
  sharedAccountabilityException: {
    reason:
      'Owner-contract placeholder pending governed party-mapping activation; shared posture is documentation-only.',
  },
};

const HANDOFF_VACANT_PENDING: IResponsibilityHandoff = {
  handoffId: 'RM-HND-0001',
  fromPerson: PERSON_LEAD_SUPER_INACTIVE,
  toPerson: PERSON_PM_BACKUP,
  requestedAtUtc: '2026-04-25T12:00:00.000Z',
  accepted: false,
  reason: 'Lead Super marked inactive; reassignment requested.',
};

const WORKFLOW_STEP_REVIEW_HEALTHY: IResponsibilityWorkflowStep = {
  stepId: 'RM-STP-0001',
  stepType: 'review',
  requiredReviewers: [ROLE_PROJECT_EXECUTIVE],
  optionalReviewers: [ROLE_PM2],
  pendingActionOwner: PERSON_PX_PRIMARY,
  statusHistory: [
    {
      state: 'pending',
      transitionedAtUtc: '2026-05-01T08:00:00.000Z',
      actor: PERSON_PM_PRIMARY,
    },
  ],
};

const EVIDENCE_MISSING: IResponsibilityEvidenceLinkRef = {
  documentControlSourceId: 'project-record',
  itemRef: 'communication-plan-evidence',
  status: 'missing',
};

const EVIDENCE_PRESENT: IResponsibilityEvidenceLinkRef = {
  documentControlSourceId: 'project-record',
  itemRef: 'communication-plan-evidence-v1',
  status: 'present',
};

// ---------------------------------------------------------------------------
// Project-instance records.
// ---------------------------------------------------------------------------

const INSTANCE_HEALTHY: IResponsibilityProjectInstanceRecord = {
  projectId: RESPONSIBILITY_PROJECT_ID,
  instanceId: 'RM-INS-0001',
  templateItemId: TEMPLATE_PM_RESOLVED.templateItemId,
  templateVersion: TEMPLATE_PM_RESOLVED.templateVersion,
  classification: 'active-default-item',
  criticality: 'high',
  domain: 'contracts-commercial',
  sourceTask: TEMPLATE_PM_RESOLVED.sourceTask,
  assignment: ASSIGNMENT_HEALTHY,
  workflowSteps: [WORKFLOW_STEP_REVIEW_HEALTHY],
  evidenceLinks: [EVIDENCE_PRESENT],
  exceptions: [],
};

const INSTANCE_MISSING_ACCOUNTABLE: IResponsibilityProjectInstanceRecord = {
  projectId: RESPONSIBILITY_PROJECT_ID,
  instanceId: 'RM-INS-0002',
  templateItemId: TEMPLATE_PM_AMBIGUOUS.templateItemId,
  templateVersion: TEMPLATE_PM_AMBIGUOUS.templateVersion,
  classification: 'ambiguous-review-required',
  criticality: 'medium',
  domain: 'cost-accounting',
  sourceTask: TEMPLATE_PM_AMBIGUOUS.sourceTask,
  assignment: ASSIGNMENT_MISSING_ACCOUNTABLE,
  exceptions: [
    {
      code: 'MISSING_ACCOUNTABLE_OWNER',
      severity: 'high',
      summary: 'No accountable owner assigned for active operational item.',
      relatedItemId: 'RM-INS-0002',
    },
  ],
};

const INSTANCE_OVERDUE_NO_CURRENT: IResponsibilityProjectInstanceRecord = {
  projectId: RESPONSIBILITY_PROJECT_ID,
  instanceId: 'RM-INS-0003',
  templateItemId: TEMPLATE_PM_RESOLVED.templateItemId,
  templateVersion: TEMPLATE_PM_RESOLVED.templateVersion,
  classification: 'active-default-item',
  criticality: 'critical',
  domain: 'schedule-planning',
  sourceTask: 'Critical path schedule update review',
  assignment: ASSIGNMENT_OVERDUE_NO_CURRENT,
  evidenceLinks: [EVIDENCE_MISSING],
  exceptions: [
    {
      code: 'MISSING_CURRENT_ACTION_OWNER',
      severity: 'high',
      summary: 'No current action owner assigned; ball-in-court unresolved.',
      relatedItemId: 'RM-INS-0003',
    },
    {
      code: 'OVERDUE_ACTION',
      severity: 'critical',
      summary: 'Required action is past due.',
      relatedItemId: 'RM-INS-0003',
    },
    {
      code: 'MISSING_REQUIRED_EVIDENCE_REFERENCE',
      severity: 'medium',
      summary: 'Required evidence reference missing.',
      relatedItemId: 'RM-INS-0003',
    },
  ],
};

const INSTANCE_VACANT_INACTIVE: IResponsibilityProjectInstanceRecord = {
  projectId: RESPONSIBILITY_PROJECT_ID,
  instanceId: 'RM-INS-0004',
  templateItemId: TEMPLATE_FIELD_RESOLVED.templateItemId,
  templateVersion: TEMPLATE_FIELD_RESOLVED.templateVersion,
  classification: 'active-default-item',
  criticality: 'high',
  domain: 'field-operations',
  sourceTask: TEMPLATE_FIELD_RESOLVED.sourceTask,
  assignment: ASSIGNMENT_VACANT_INACTIVE,
  handoffs: [HANDOFF_VACANT_PENDING],
  exceptions: [
    {
      code: 'PERSON_INACTIVE',
      severity: 'high',
      summary: 'Assigned person is inactive in roster.',
      relatedItemId: 'RM-INS-0004',
    },
    {
      code: 'ROLE_VACANT',
      severity: 'medium',
      summary: 'Role currently has no active person assigned.',
      relatedItemId: 'RM-INS-0004',
    },
    {
      code: 'HANDOFF_REQUIRED',
      severity: 'medium',
      summary: 'Handoff requested but not yet accepted.',
      relatedItemId: 'RM-INS-0004',
    },
  ],
};

const INSTANCE_OWNER_CONTRACT_AMBIGUITY: IResponsibilityProjectInstanceRecord = {
  projectId: RESPONSIBILITY_PROJECT_ID,
  instanceId: 'RM-INS-0005',
  templateItemId: TEMPLATE_OWNER_CONTRACT_PLACEHOLDER.templateItemId,
  templateVersion: TEMPLATE_OWNER_CONTRACT_PLACEHOLDER.templateVersion,
  classification: 'placeholder-schema-only',
  criticality: 'low',
  domain: 'contracts-commercial',
  sourceTask: TEMPLATE_OWNER_CONTRACT_PLACEHOLDER.sourceTask,
  assignment: ASSIGNMENT_OWNER_CONTRACT_AMBIGUITY,
  exceptions: [
    {
      code: 'OWNER_CONTRACT_AMBIGUITY',
      severity: 'low',
      summary: 'Owner-contract placeholder row pending governed activation.',
      relatedItemId: 'RM-INS-0005',
    },
  ],
};

export const SAMPLE_RESPONSIBILITY_MATRIX_PROJECT_INSTANCES: readonly IResponsibilityProjectInstanceRecord[] =
  [
    INSTANCE_HEALTHY,
    INSTANCE_MISSING_ACCOUNTABLE,
    INSTANCE_OVERDUE_NO_CURRENT,
    INSTANCE_VACANT_INACTIVE,
    INSTANCE_OWNER_CONTRACT_AMBIGUITY,
  ];

export const SAMPLE_RESPONSIBILITY_MATRIX_EXCEPTIONS: readonly IResponsibilityException[] = [
  ...INSTANCE_MISSING_ACCOUNTABLE.exceptions,
  ...INSTANCE_OVERDUE_NO_CURRENT.exceptions,
  ...INSTANCE_VACANT_INACTIVE.exceptions,
  ...INSTANCE_OWNER_CONTRACT_AMBIGUITY.exceptions,
];

// ---------------------------------------------------------------------------
// Health-score fixtures (both branches of the discriminated union).
// ---------------------------------------------------------------------------

export const SAMPLE_RESPONSIBILITY_MATRIX_HEALTH_SCORE: IResponsibilityMatrixHealthScoreComputed = {
  state: 'computed',
  band: 'at-risk',
  openCriticalExceptions: 1,
  overdueActions: 1,
  missingAccountableOwners: 1,
  missingCurrentActionOwners: 1,
  pendingEvidence: 1,
  unresolvedDecisionRightsGaps: 0,
};

export const SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE: IResponsibilityMatrixHealthScoreInsufficient =
  {
    state: 'insufficient-data',
    reason: 'Workbook ingestion not yet complete for this project.',
  };

// ---------------------------------------------------------------------------
// Source posture and snapshot fixtures.
// ---------------------------------------------------------------------------

export const SAMPLE_RESPONSIBILITY_MATRIX_SOURCE_POSTURE: IResponsibilityMatrixSourcePosture = {
  sourceStatus: 'available',
  confidence: 'medium',
  lastIngestedAtUtc: '2026-04-30T00:00:00.000Z',
  pendingHumanReviewCount: SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY.ambiguousItemsTotal,
};

const SNAPSHOT_BASELINE: IResponsibilityMatrixSnapshot = {
  snapshotId: 'RM-SNAP-0001',
  generatedAtUtc: '2026-04-30T00:00:00.000Z',
  projectId: RESPONSIBILITY_PROJECT_ID,
  readOnly: true,
  counts: SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY,
  healthScore: SAMPLE_RESPONSIBILITY_MATRIX_HEALTH_SCORE,
  summary: 'Wave 11 baseline snapshot for governed responsibility posture.',
};

export const SAMPLE_RESPONSIBILITY_MATRIX_SNAPSHOT_HISTORY: readonly IResponsibilityMatrixSnapshot[] =
  [SNAPSHOT_BASELINE];

// ---------------------------------------------------------------------------
// Audit-event fixtures. Cover assignment / current-owner / snapshot /
// evidence-ref change types so downstream prompts can rely on the family
// being represented.
// ---------------------------------------------------------------------------

export const SAMPLE_RESPONSIBILITY_MATRIX_AUDIT_EVENTS: readonly IResponsibilityAuditEvent[] = [
  {
    eventId: 'RM-AUD-0001',
    eventType: 'assignment-changed',
    occurredAtUtc: '2026-04-20T10:00:00.000Z',
    actor: PERSON_PX_PRIMARY,
    entityRef: INSTANCE_MISSING_ACCOUNTABLE.instanceId,
    summary: 'Assignment updated; accountable owner pending review.',
  },
  {
    eventId: 'RM-AUD-0002',
    eventType: 'current-owner-changed',
    occurredAtUtc: '2026-04-25T12:00:00.000Z',
    actor: PERSON_PM_PRIMARY,
    entityRef: INSTANCE_VACANT_INACTIVE.instanceId,
    summary: 'Current action owner reassigned due to inactive person.',
  },
  {
    eventId: 'RM-AUD-0003',
    eventType: 'evidence-ref-changed',
    occurredAtUtc: '2026-04-28T08:30:00.000Z',
    actor: PERSON_PM_PRIMARY,
    entityRef: INSTANCE_OVERDUE_NO_CURRENT.instanceId,
    summary: 'Evidence reference state updated to missing.',
  },
  {
    eventId: 'RM-AUD-0004',
    eventType: 'snapshot-generated',
    occurredAtUtc: '2026-04-30T00:00:00.000Z',
    actor: PERSON_PX_PRIMARY,
    entityRef: SNAPSHOT_BASELINE.snapshotId,
    summary: 'Baseline responsibility snapshot generated for audit context.',
  },
];

// ---------------------------------------------------------------------------
// Full assembled read-model.
// ---------------------------------------------------------------------------

export const SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL: PccResponsibilityMatrixReadModel = {
  templates: SAMPLE_RESPONSIBILITY_MATRIX_TEMPLATES,
  projectInstances: SAMPLE_RESPONSIBILITY_MATRIX_PROJECT_INSTANCES,
  exceptions: SAMPLE_RESPONSIBILITY_MATRIX_EXCEPTIONS,
  healthScore: SAMPLE_RESPONSIBILITY_MATRIX_HEALTH_SCORE,
  workbookSourceSummary: SAMPLE_RESPONSIBILITY_MATRIX_WORKBOOK_SOURCE_SUMMARY,
  sourcePosture: SAMPLE_RESPONSIBILITY_MATRIX_SOURCE_POSTURE,
  snapshotHistory: SAMPLE_RESPONSIBILITY_MATRIX_SNAPSHOT_HISTORY,
  auditEvents: SAMPLE_RESPONSIBILITY_MATRIX_AUDIT_EVENTS,
  laneVocabulary: RESPONSIBILITY_MATRIX_LANES,
};
