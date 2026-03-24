/**
 * P3-E13-T08 Stage 1 Subcontract Execution Readiness Module foundation constants.
 * Operating model governance data serialized from T01 and P3-E13 master index.
 */

import type {
  AdjacentModuleCode,
  CaseActivationTrigger,
  CrossContractRole,
  ModuleIdentityExclusion,
  ReadinessAuthorityRule,
  ReadinessBusinessConcern,
  ReadinessOperatingLayer,
  ReadinessOwnerRole,
  ReadinessRecordClass,
  ReadinessSurfaceCode,
} from './enums.js';
import type {
  IBusinessConcernDef,
  ICaseActivationRule,
  ICrossContractPosition,
  ILockedArchitectureDecision,
  IModuleBoundaryDeclaration,
  IModuleIdentityExclusionDef,
  IOperatingOwnership,
  IReadinessCrossContractRef,
  IReadinessOperatingLayerDef,
  IReadinessRecordClassDef,
  IReadinessSurface,
  ISourceOfTruthBoundary,
} from './types.js';

// -- Module Scope ---------------------------------------------------------------

export const READINESS_MODULE_SCOPE = 'subcontract-readiness' as const;
export const READINESS_FOUNDATION_SCOPE = 'subcontract-readiness/foundation' as const;

// -- Enum Arrays ----------------------------------------------------------------

export const READINESS_SURFACE_CODES = [
  'CASE_REGISTRY', 'CASE_DETAIL_WORKSPACE', 'REQUIREMENT_EVALUATION_WORKBENCH',
  'EXCEPTION_PACKET_WORKSPACE', 'READINESS_DECISION_SURFACE', 'REVIEW_OVERLAY_SURFACE',
] as const satisfies ReadonlyArray<ReadinessSurfaceCode>;

export const READINESS_OPERATING_LAYERS = [
  'PRIMARY_OPERATIONAL', 'EXCEPTION_GOVERNANCE', 'GATE_AND_PUBLICATION',
] as const satisfies ReadonlyArray<ReadinessOperatingLayer>;

export const READINESS_RECORD_CLASSES = [
  'CLASS_1_PRIMARY_OPERATIONAL', 'CLASS_2_EXCEPTION_GOVERNANCE', 'CLASS_3_GATE_AND_DOWNSTREAM',
] as const satisfies ReadonlyArray<ReadinessRecordClass>;

export const ADJACENT_MODULE_CODES = [
  'FINANCIAL', 'STARTUP', 'REPORTS', 'HEALTH', 'WORK_QUEUE', 'FUTURE_VENDOR_MASTER',
] as const satisfies ReadonlyArray<AdjacentModuleCode>;

export const READINESS_AUTHORITY_RULES = [
  'CANONICAL_SOURCE', 'SPECIALIST_GOVERNED', 'CONSUMES_READINESS_OUTPUT', 'SEPARATE_REVIEW_LAYER',
] as const satisfies ReadonlyArray<ReadinessAuthorityRule>;

export const READINESS_OWNER_ROLES = [
  'PM', 'APM', 'PA', 'COMPLIANCE_RISK', 'PX', 'CFO', 'COMPLIANCE_MANAGER',
] as const satisfies ReadonlyArray<ReadinessOwnerRole>;

export const CASE_ACTIVATION_TRIGGERS = [
  'BUYOUT_AWARD_PATH_CREATED', 'PACKAGE_ASSEMBLED_FOR_EXECUTION',
  'RENEWAL_OR_RESUBMISSION_REQUIRED', 'PROACTIVE_COMPLIANCE_GOVERNANCE',
] as const satisfies ReadonlyArray<CaseActivationTrigger>;

export const CROSS_CONTRACT_ROLES = [
  'GATE_SOURCE', 'GATE_ENFORCER', 'DOWNSTREAM_CONSUMER', 'HISTORICAL_CONTEXT',
] as const satisfies ReadonlyArray<CrossContractRole>;

export const MODULE_IDENTITY_EXCLUSIONS = [
  'FLAT_CHECKLIST_MODULE', 'WAIVER_ONLY_ROUTING_FORM', 'VENDOR_MASTER_REPLACEMENT',
  'FINANCIAL_STATUS_TRACKER', 'REPORTS_LEDGER', 'WORK_QUEUE_PROCESS_MODEL',
] as const satisfies ReadonlyArray<ModuleIdentityExclusion>;

export const READINESS_BUSINESS_CONCERNS = [
  'PRE_AWARD_COMPLETENESS', 'EXECUTION_READINESS', 'DEFICIENCY_RESOLUTION',
  'EXCEPTION_HANDLING', 'CONTRACT_GATING',
] as const satisfies ReadonlyArray<ReadinessBusinessConcern>;

// -- Label Maps -----------------------------------------------------------------

export const READINESS_SURFACE_LABELS: Readonly<Record<ReadinessSurfaceCode, string>> = {
  CASE_REGISTRY: 'Case Registry / Queue',
  CASE_DETAIL_WORKSPACE: 'Case Detail Workspace',
  REQUIREMENT_EVALUATION_WORKBENCH: 'Requirement Evaluation Workbench',
  EXCEPTION_PACKET_WORKSPACE: 'Exception Packet Workspace',
  READINESS_DECISION_SURFACE: 'Readiness Decision / Gate Summary',
  REVIEW_OVERLAY_SURFACE: 'Review Overlay Surface',
};

export const OPERATING_LAYER_LABELS: Readonly<Record<ReadinessOperatingLayer, string>> = {
  PRIMARY_OPERATIONAL: 'Primary operational layer',
  EXCEPTION_GOVERNANCE: 'Exception governance layer',
  GATE_AND_PUBLICATION: 'Gate and publication layer',
};

export const ADJACENT_MODULE_LABELS: Readonly<Record<AdjacentModuleCode, string>> = {
  FINANCIAL: 'Financial',
  STARTUP: 'Startup',
  REPORTS: 'Reports',
  HEALTH: 'Health',
  WORK_QUEUE: 'Work Queue',
  FUTURE_VENDOR_MASTER: 'Future vendor-master / prequalification systems',
};

export const OWNER_ROLE_LABELS: Readonly<Record<ReadinessOwnerRole, string>> = {
  PM: 'PM',
  APM: 'APM',
  PA: 'PA',
  COMPLIANCE_RISK: 'Compliance / Risk',
  PX: 'PX',
  CFO: 'CFO',
  COMPLIANCE_MANAGER: 'Compliance Manager',
};

export const RECORD_CLASS_LABELS: Readonly<Record<ReadinessRecordClass, string>> = {
  CLASS_1_PRIMARY_OPERATIONAL: 'Class 1 — Primary Operational Ledgers',
  CLASS_2_EXCEPTION_GOVERNANCE: 'Class 2 — Exception Governance',
  CLASS_3_GATE_AND_DOWNSTREAM: 'Class 3 — Gate and Downstream Projections',
};

export const MODULE_IDENTITY_EXCLUSION_LABELS: Readonly<Record<ModuleIdentityExclusion, string>> = {
  FLAT_CHECKLIST_MODULE: 'a flat checklist module',
  WAIVER_ONLY_ROUTING_FORM: 'a waiver-only routing form',
  VENDOR_MASTER_REPLACEMENT: 'a vendor-master or enterprise prequalification replacement',
  FINANCIAL_STATUS_TRACKER: 'a Financial-owned status tracker',
  REPORTS_LEDGER: 'a Reports-owned ledger',
  WORK_QUEUE_PROCESS_MODEL: 'a Work Queue-owned process model',
};

export const BUSINESS_CONCERN_LABELS: Readonly<Record<ReadinessBusinessConcern, string>> = {
  PRE_AWARD_COMPLETENESS: 'Pre-award package completeness',
  EXECUTION_READINESS: 'Subcontract execution readiness',
  DEFICIENCY_RESOLUTION: 'Risk / compliance deficiency resolution',
  EXCEPTION_HANDLING: 'Exception handling',
  CONTRACT_GATING: 'Contract execution gating',
};

// -- Surface Definitions (T01 §4.1) -------------------------------------------

export const READINESS_SURFACES: ReadonlyArray<IReadinessSurface> = [
  { surfaceCode: 'CASE_REGISTRY', displayName: 'Case Registry / Queue', primaryUsers: ['PM', 'APM', 'PA', 'COMPLIANCE_RISK'], purpose: 'Find, sort, and route active readiness cases' },
  { surfaceCode: 'CASE_DETAIL_WORKSPACE', displayName: 'Case Detail Workspace', primaryUsers: ['PM', 'APM', 'PA', 'COMPLIANCE_RISK'], purpose: 'View parent case state, linked buyout context, profile binding, lineage, and renewal posture' },
  { surfaceCode: 'REQUIREMENT_EVALUATION_WORKBENCH', displayName: 'Requirement Evaluation Workbench', primaryUsers: ['COMPLIANCE_RISK'], purpose: 'Review artifacts, set evaluation outcomes, issue deficiencies, and resolve applicability' },
  { surfaceCode: 'EXCEPTION_PACKET_WORKSPACE', displayName: 'Exception Packet Workspace', primaryUsers: ['COMPLIANCE_RISK', 'PX', 'CFO', 'COMPLIANCE_MANAGER'], purpose: 'Create, submit, review, and act on governed exception iterations' },
  { surfaceCode: 'READINESS_DECISION_SURFACE', displayName: 'Readiness Decision / Gate Summary', primaryUsers: ['COMPLIANCE_RISK', 'PM', 'APM', 'PA'], purpose: 'View issued decision, blockers, escalation posture, and gate projection' },
  { surfaceCode: 'REVIEW_OVERLAY_SURFACE', displayName: 'Review Overlay Surface', primaryUsers: ['PX'], purpose: 'Read-only / annotation-only review without operational mutation' },
];

// -- Operating Layer Definitions (T01 §4.2) -----------------------------------

export const READINESS_OPERATING_LAYER_DEFINITIONS: ReadonlyArray<IReadinessOperatingLayerDef> = [
  { layer: 'PRIMARY_OPERATIONAL', description: 'Parent case, requirement items, artifacts, evaluations, lineage, and renewal state' },
  { layer: 'EXCEPTION_GOVERNANCE', description: 'Exception case, immutable submission iterations, approval slots, actions, and delegation records' },
  { layer: 'GATE_AND_PUBLICATION', description: 'Readiness decision, Financial gate projection, activity / health / work / related-items outputs, and precedent publication' },
];

// -- Record Class Definitions (P3-E13 Master Index) ---------------------------

export const READINESS_RECORD_CLASS_DEFINITIONS: ReadonlyArray<IReadinessRecordClassDef> = [
  { recordClass: 'CLASS_1_PRIMARY_OPERATIONAL', records: ['SubcontractReadinessCase', 'ReadinessRequirementItem', 'RequirementArtifact', 'RequirementEvaluation'] },
  { recordClass: 'CLASS_2_EXCEPTION_GOVERNANCE', records: ['ExceptionCase', 'ExceptionSubmissionIteration', 'ExceptionApprovalSlot', 'ExceptionApprovalAction', 'ExceptionDelegationEvent'] },
  { recordClass: 'CLASS_3_GATE_AND_DOWNSTREAM', records: ['ExecutionReadinessDecision', 'ReadinessGateProjection', 'GlobalPrecedentReference'] },
];

// -- Module Boundary Declarations (T01 §5) ------------------------------------

export const MODULE_BOUNDARY_DECLARATIONS: ReadonlyArray<IModuleBoundaryDeclaration> = [
  { adjacentModule: 'FINANCIAL', adjacentModuleOwns: 'Buyout line lifecycle, commitment / contract-status progression, enforcement of the ContractExecuted gate', readinessModuleOwns: 'Readiness records, specialist evaluation, exception handling, issued readiness decision, published gate projection', boundaryRule: 'Financial reads the gate output. It does not author readiness truth.' },
  { adjacentModule: 'STARTUP', adjacentModuleOwns: 'Startup readiness program, mobilization authorization, baseline lock', readinessModuleOwns: 'Subcontract execution readiness case, requirement evaluation, exception governance, readiness decision', boundaryRule: 'Startup may reference readiness state only where startup context benefits from visibility. Startup does not own readiness evaluation, exceptions, or decision issuance.' },
  { adjacentModule: 'REPORTS', adjacentModuleOwns: 'Report families, publication lifecycle, run ledger', readinessModuleOwns: 'Readiness case state, packet history, specialist evaluation ledgers', boundaryRule: 'Reports consumes downstream read models only. Reports does not own case state, packet history, or specialist evaluation ledgers.' },
  { adjacentModule: 'HEALTH', adjacentModuleOwns: 'Health metric aggregation, health spine routing', readinessModuleOwns: 'Primary readiness ledger, blocked case signals, pending exception signals', boundaryRule: 'Health consumes derived readiness signals. Health is not the primary ledger for readiness.' },
  { adjacentModule: 'WORK_QUEUE', adjacentModuleOwns: 'Work item routing, queue presentation, completion tracking', readinessModuleOwns: 'Workflow authority, routed actions, reminders, overdue items, approval tasks', boundaryRule: 'Work Queue receives routed actions. Work Queue is not the underlying workflow authority.' },
  { adjacentModule: 'FUTURE_VENDOR_MASTER', adjacentModuleOwns: 'Vendor identity, insurance, licensing, prequalification from external systems', readinessModuleOwns: 'Project-level SubcontractReadinessCase as source of truth for execution readiness', boundaryRule: 'Future systems may contribute input facts, external statuses, reference artifacts, and advisories. They do not displace the project-level readiness case.' },
];

// -- Source-of-Truth Boundaries (T01 §8) --------------------------------------

export const SOURCE_OF_TRUTH_BOUNDARIES: ReadonlyArray<ISourceOfTruthBoundary> = [
  { dataConcern: 'Parent case identity and lineage', authority: 'Subcontract Execution Readiness', authorityRule: 'CANONICAL_SOURCE' },
  { dataConcern: 'Requirement profile binding', authority: 'Subcontract Execution Readiness', authorityRule: 'SPECIALIST_GOVERNED' },
  { dataConcern: 'Artifact receipts and linked evidence', authority: 'Subcontract Execution Readiness', authorityRule: 'CANONICAL_SOURCE' },
  { dataConcern: 'Compliance evaluation outcomes', authority: 'Subcontract Execution Readiness', authorityRule: 'SPECIALIST_GOVERNED' },
  { dataConcern: 'Exception approvals and delegation history', authority: 'Subcontract Execution Readiness', authorityRule: 'CANONICAL_SOURCE' },
  { dataConcern: 'Contract-execution gate enforcement', authority: 'Financial', authorityRule: 'CONSUMES_READINESS_OUTPUT' },
  { dataConcern: 'Review annotations', authority: '@hbc/field-annotations', authorityRule: 'SEPARATE_REVIEW_LAYER' },
];

// -- Operating Ownership (T01 §6) ---------------------------------------------

export const OPERATING_OWNERSHIP: ReadonlyArray<IOperatingOwnership> = [
  { concern: 'Case assembly and submission', primaryOwner: 'PM', notes: 'Assemble package context, upload artifacts, respond to deficiencies' },
  { concern: 'Routine item evaluation', primaryOwner: 'COMPLIANCE_RISK', notes: 'Owns normal specialist review and evaluation outcomes' },
  { concern: 'Readiness issuance', primaryOwner: 'COMPLIANCE_RISK', notes: 'Owns routine issuance of the readiness decision' },
  { concern: 'Business-risk visibility', primaryOwner: 'PX', notes: 'Participates where the case is flagged or policy demands PX visibility' },
  { concern: 'Defined exception approvals', primaryOwner: 'PX', notes: 'Required authorities remain policy-driven and packet-type specific; CFO and Compliance Manager where required' },
];

// -- Case Activation Rules (T01 §7) -------------------------------------------

export const CASE_ACTIVATION_RULES: ReadonlyArray<ICaseActivationRule> = [
  { trigger: 'BUYOUT_AWARD_PATH_CREATED', description: 'A governed buyout / award path is created' },
  { trigger: 'PACKAGE_ASSEMBLED_FOR_EXECUTION', description: 'A subcontract package is assembled for execution' },
  { trigger: 'RENEWAL_OR_RESUBMISSION_REQUIRED', description: 'A renewal or resubmission is required for the same identity' },
  { trigger: 'PROACTIVE_COMPLIANCE_GOVERNANCE', description: 'Compliance / Risk opens a case proactively because the package must be governed before execution' },
];

// -- Module Identity Exclusions (T01 §2) --------------------------------------

export const MODULE_IDENTITY_EXCLUSION_DEFINITIONS: ReadonlyArray<IModuleIdentityExclusionDef> = [
  { exclusionCode: 'FLAT_CHECKLIST_MODULE', description: 'a flat checklist module' },
  { exclusionCode: 'WAIVER_ONLY_ROUTING_FORM', description: 'a waiver-only routing form' },
  { exclusionCode: 'VENDOR_MASTER_REPLACEMENT', description: 'a vendor-master or enterprise prequalification replacement' },
  { exclusionCode: 'FINANCIAL_STATUS_TRACKER', description: 'a Financial-owned status tracker' },
  { exclusionCode: 'REPORTS_LEDGER', description: 'a Reports-owned ledger' },
  { exclusionCode: 'WORK_QUEUE_PROCESS_MODEL', description: 'a Work Queue-owned process model' },
];

// -- Business Concerns (T01 §3) -----------------------------------------------

export const BUSINESS_CONCERN_DEFINITIONS: ReadonlyArray<IBusinessConcernDef> = [
  { concern: 'PRE_AWARD_COMPLETENESS', whatModuleOwns: 'Tracks required artifacts and specialist review posture for governed readiness items' },
  { concern: 'EXECUTION_READINESS', whatModuleOwns: 'Produces the authoritative decision used by Financial to allow or block contract execution' },
  { concern: 'DEFICIENCY_RESOLUTION', whatModuleOwns: 'Records item-level deficiencies, rulings, and specialist evaluation state' },
  { concern: 'EXCEPTION_HANDLING', whatModuleOwns: 'Routes governed exception submissions, approvals, and delegation history' },
  { concern: 'CONTRACT_GATING', whatModuleOwns: 'Publishes read-only gate state consumed by Buyout / Financial' },
];

// -- Cross-Contract Positions (T01 §9) ----------------------------------------

export const CROSS_CONTRACT_POSITIONS: ReadonlyArray<ICrossContractPosition> = [
  { relativeModule: 'P3-E4 Financial', docRef: 'P3-E4 §6', thisModuleRole: 'GATE_SOURCE', description: 'This module is the gate source; Financial is the gate enforcer' },
  { relativeModule: 'P3-E11 Startup', docRef: 'P3-E11', thisModuleRole: 'GATE_SOURCE', description: 'Startup may link or display readiness context but never owns readiness workflow state' },
  { relativeModule: 'P3-D2 / P3-D3 / P3-D4', docRef: 'P3-D2, P3-D3, P3-D4', thisModuleRole: 'GATE_SOURCE', description: 'Health, Work Queue, and Related Items are downstream publication consumers, not primary ledgers' },
  { relativeModule: 'P3-E12', docRef: 'P3-E12', thisModuleRole: 'GATE_SOURCE', description: 'The checklist / mutable-waiver framing is historical only. It must not govern implementation decisions.' },
];

// -- Locked Architecture Decisions (P3-E13 Master Index) ----------------------

export const LOCKED_ARCHITECTURE_DECISIONS: ReadonlyArray<ILockedArchitectureDecision> = [
  { decisionNumber: 1, decision: 'The module is a parent-case operating model, not a flat checklist module.' },
  { decisionNumber: 2, decision: 'Financial gates on an issued ExecutionReadinessDecision, not on generic checklist completion.' },
  { decisionNumber: 3, decision: 'Requirement items are generated from governed requirement profiles, not from a universal fixed 12-item model.' },
  { decisionNumber: 4, decision: 'Every requirement item carries both artifact state and compliance evaluation state.' },
  { decisionNumber: 5, decision: 'SDI / prequalification is a governed requirement family with multiple valid outcomes and future integration seams.' },
  { decisionNumber: 6, decision: 'Exception handling is based on immutable ExceptionSubmissionIteration records, not mutable waiver headers.' },
  { decisionNumber: 7, decision: 'Approval delegation is controlled reassignment inside preserved approval slots with full audit history.' },
  { decisionNumber: 8, decision: 'GlobalPrecedentReference is reference publication only and never auto-satisfies future cases.' },
  { decisionNumber: 9, decision: 'Compliance / Risk owns routine evaluation and readiness issuance; PX participates in flagged business-risk visibility and defined exception approvals.' },
  { decisionNumber: 10, decision: 'One active case exists per same legal entity plus same underlying award intent; material identity changes require supersede / void plus new case.' },
  { decisionNumber: 11, decision: 'Workflow status is separate from readiness decision / outcome.' },
  { decisionNumber: 12, decision: 'Downstream Health / Work Queue / Reports / Related Items / activity artifacts are projections or publications, not primary ledgers.' },
  { decisionNumber: 13, decision: 'Timer-driven reminders, escalations, and routed work must use shared work-intelligence primitives rather than local substitutes.' },
];

// -- Cross-Reference Map (P3-E13 Master Index) --------------------------------

export const READINESS_CROSS_CONTRACT_REFS: ReadonlyArray<IReadinessCrossContractRef> = [
  { concern: 'Module classification', governingSource: 'P3-E1 §3.11' },
  { concern: 'SoT and action boundary', governingSource: 'P3-E2 §16' },
  { concern: 'Financial / Buyout gate', governingSource: 'P3-E4 §6 + T07 §1' },
  { concern: 'Activity publication', governingSource: 'P3-D1 + T05 §4' },
  { concern: 'Health publication', governingSource: 'P3-D2 + T05 §5' },
  { concern: 'Work Queue publication', governingSource: 'P3-D3 + T05 §4' },
  { concern: 'Related Items publication', governingSource: 'P3-D4 + T07 §5' },
  { concern: 'Lane capability', governingSource: 'P3-G1 §4.8.3 + T06 §4' },
  { concern: 'Cross-lane escalation', governingSource: 'P3-G2 §8.8 + T06 §4' },
  { concern: 'Acceptance evidence', governingSource: 'P3-H1 + T08 §5-§7' },
];
