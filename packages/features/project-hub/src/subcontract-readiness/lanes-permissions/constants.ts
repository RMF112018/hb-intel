/**
 * P3-E13-T08 Stage 6 Subcontract Execution Readiness Module lanes-permissions constants.
 * Authority model, annotation targets, lane depth, UX surfaces, visibility.
 */

import type {
  AnnotationTarget,
  ApplicationLane,
  DistinctActionType,
  PWADepthCapability,
  ReadinessAuthorityRoleT06,
  SPFxDepthCapability,
  UXSurfaceExpectation,
  VisibilityTier,
} from './enums.js';
import type {
  IAnnotationTargetDef,
  IDistinctActionDef,
  IPWADepthCapabilityDef,
  IRoleBehaviorDef,
  ISPFxDepthCapabilityDef,
  IUXSurfaceExpectationDef,
  IVisibilityTierDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const READINESS_AUTHORITY_ROLES_T06 = [
  'PM_APM_PA', 'COMPLIANCE_RISK', 'PX', 'CFO',
  'COMPLIANCE_MANAGER', 'PER_REVIEW_ONLY', 'READ_ONLY_CONSUMER',
] as const satisfies ReadonlyArray<ReadinessAuthorityRoleT06>;

export const DISTINCT_ACTION_TYPES = [
  'ANNOTATION', 'APPROVAL', 'READINESS_ISSUANCE', 'GATE_ENFORCEMENT',
] as const satisfies ReadonlyArray<DistinctActionType>;

export const ANNOTATION_TARGETS = [
  'CASE_HEADER_SUMMARY', 'REQUIREMENT_ITEM_DETAIL', 'ITEM_EVALUATION_DETAIL',
  'EXCEPTION_ITERATION_DETAIL', 'READINESS_DECISION_DETAIL', 'LINEAGE_SUPERSESSION_SUMMARY',
] as const satisfies ReadonlyArray<AnnotationTarget>;

export const APPLICATION_LANES = [
  'PWA', 'SPFX',
] as const satisfies ReadonlyArray<ApplicationLane>;

export const PWA_DEPTH_CAPABILITIES = [
  'DENSE_EVALUATION', 'EXCEPTION_HISTORY', 'ITERATION_DIFF',
  'LINEAGE_INSPECTION', 'CROSS_MODULE_ANALYSIS',
  'CASE_DETAIL_AUTHORING', 'PRECEDENT_MANAGEMENT',
] as const satisfies ReadonlyArray<PWADepthCapability>;

export const SPFX_DEPTH_CAPABILITIES = [
  'CASE_LIST_SUMMARY', 'ITEM_DEFICIENCY_STATUS', 'ASSEMBLY_SUBMISSION',
  'SIMPLE_APPROVAL_ACTIONS', 'DECISION_POSTURE_READONLY',
] as const satisfies ReadonlyArray<SPFxDepthCapability>;

export const UX_SURFACE_EXPECTATIONS = [
  'WORKSPACE_PAGE_SHELL', 'DENSE_TABLE_LIST', 'DUAL_STATE_DISTINCTION',
  'LINEAGE_INDICATORS', 'ISSUANCE_STATUS_VISIBLE',
  'EXCEPTION_ITERATION_HISTORY', 'RENEWAL_EXPIRATION_POSTURE', 'SMART_EMPTY_STATE',
] as const satisfies ReadonlyArray<UXSurfaceExpectation>;

export const VISIBILITY_TIERS = [
  'OPERATIONAL', 'SPECIALIST', 'REVIEW',
] as const satisfies ReadonlyArray<VisibilityTier>;

// -- Label Maps -----------------------------------------------------------------

export const READINESS_AUTHORITY_ROLE_T06_LABELS: Readonly<Record<ReadinessAuthorityRoleT06, string>> = {
  PM_APM_PA: 'PM / APM / PA',
  COMPLIANCE_RISK: 'Compliance / Risk',
  PX: 'PX',
  CFO: 'CFO',
  COMPLIANCE_MANAGER: 'Compliance Manager',
  PER_REVIEW_ONLY: 'PER / review-only roles',
  READ_ONLY_CONSUMER: 'Read-only consumers',
};

export const DISTINCT_ACTION_TYPE_LABELS: Readonly<Record<DistinctActionType, string>> = {
  ANNOTATION: 'Annotation — review-only, non-mutating',
  APPROVAL: 'Approval — governed action on an exception iteration slot',
  READINESS_ISSUANCE: 'Readiness issuance — specialist issuance of the active decision',
  GATE_ENFORCEMENT: 'Gate enforcement — Financial consuming the issued decision',
};

export const VISIBILITY_TIER_LABELS: Readonly<Record<VisibilityTier, string>> = {
  OPERATIONAL: 'Operational actors (PM / APM / PA)',
  SPECIALIST: 'Specialist actors (Compliance / Risk)',
  REVIEW: 'Review actors (PER and similar)',
};

// -- Role Behavior Definitions (T06 §1.1) --------------------------------------

export const ROLE_BEHAVIOR_DEFINITIONS: ReadonlyArray<IRoleBehaviorDef> = [
  { role: 'PM_APM_PA', primaryBehavior: 'Assemble package, upload evidence, respond to deficiencies, submit for specialist review, view current gate posture' },
  { role: 'COMPLIANCE_RISK', primaryBehavior: 'Own routine requirement evaluation, applicability rulings, readiness issuance, and exception-case administration' },
  { role: 'PX', primaryBehavior: 'Receives flagged business-risk visibility and acts where policy requires PX exception approval' },
  { role: 'CFO', primaryBehavior: 'Acts only where packet policy requires financial-risk approval authority' },
  { role: 'COMPLIANCE_MANAGER', primaryBehavior: 'Acts where packet policy requires managed compliance authority distinct from routine evaluator actions' },
  { role: 'PER_REVIEW_ONLY', primaryBehavior: 'Read-only or annotation-only visibility on supported review-capable surfaces' },
  { role: 'READ_ONLY_CONSUMER', primaryBehavior: 'Observe current readiness posture without authoring actions' },
];

// -- Distinct Action Definitions (T06 §2) --------------------------------------

export const DISTINCT_ACTION_DEFINITIONS: ReadonlyArray<IDistinctActionDef> = [
  { actionType: 'ANNOTATION', description: 'Review-only, non-mutating annotation' },
  { actionType: 'APPROVAL', description: 'Governed action on an exception iteration slot' },
  { actionType: 'READINESS_ISSUANCE', description: 'Specialist issuance of the active decision' },
  { actionType: 'GATE_ENFORCEMENT', description: 'Financial consuming the issued decision to block or allow contract execution' },
];

// -- Annotation Target Definitions (T06 §3) ------------------------------------

export const ANNOTATION_TARGET_DEFINITIONS: ReadonlyArray<IAnnotationTargetDef> = [
  { target: 'CASE_HEADER_SUMMARY', description: 'Case header and summary' },
  { target: 'REQUIREMENT_ITEM_DETAIL', description: 'Requirement item detail' },
  { target: 'ITEM_EVALUATION_DETAIL', description: 'Item evaluation detail' },
  { target: 'EXCEPTION_ITERATION_DETAIL', description: 'Exception iteration detail' },
  { target: 'READINESS_DECISION_DETAIL', description: 'Readiness decision detail' },
  { target: 'LINEAGE_SUPERSESSION_SUMMARY', description: 'Lineage / supersession summary where shown' },
];

// -- Annotation Invariants (T06 §3) --------------------------------------------

export const ANNOTATION_INVARIANTS = [
  'Review-only',
  'Non-mutating',
  'Stored through @hbc/field-annotations',
  'Separate from primary readiness ledgers',
] as const;

// -- PWA Depth Definitions (T06 §4.1) -----------------------------------------

export const PWA_DEPTH_CAPABILITY_DEFINITIONS: ReadonlyArray<IPWADepthCapabilityDef> = [
  { capability: 'DENSE_EVALUATION', description: 'Dense requirement evaluation' },
  { capability: 'EXCEPTION_HISTORY', description: 'Exception packet history' },
  { capability: 'ITERATION_DIFF', description: 'Iteration diff and history review' },
  { capability: 'LINEAGE_INSPECTION', description: 'Lineage and supersession inspection' },
  { capability: 'CROSS_MODULE_ANALYSIS', description: 'Cross-module analysis' },
  { capability: 'CASE_DETAIL_AUTHORING', description: 'Complete case-detail authoring' },
  { capability: 'PRECEDENT_MANAGEMENT', description: 'Precedent-reference management' },
];

// -- SPFx Depth Definitions (T06 §4.2) ----------------------------------------

export const SPFX_DEPTH_CAPABILITY_DEFINITIONS: ReadonlyArray<ISPFxDepthCapabilityDef> = [
  { capability: 'CASE_LIST_SUMMARY', description: 'Case list and case summary' },
  { capability: 'ITEM_DEFICIENCY_STATUS', description: 'Item and deficiency status' },
  { capability: 'ASSEMBLY_SUBMISSION', description: 'Straightforward assembly and submission tasks' },
  { capability: 'SIMPLE_APPROVAL_ACTIONS', description: 'Approval actions where the interaction is simple' },
  { capability: 'DECISION_POSTURE_READONLY', description: 'Read-only visibility into decision posture and linked buyout context' },
];

// -- UX Surface Expectation Definitions (T06 §5) -------------------------------

export const UX_SURFACE_EXPECTATION_DEFINITIONS: ReadonlyArray<IUXSurfaceExpectationDef> = [
  { expectation: 'WORKSPACE_PAGE_SHELL', description: 'WorkspacePageShell for top-level surfaces' },
  { expectation: 'DENSE_TABLE_LIST', description: 'Dense table / list treatment for registry and workbench surfaces' },
  { expectation: 'DUAL_STATE_DISTINCTION', description: 'Visible distinction between artifact state and evaluation state' },
  { expectation: 'LINEAGE_INDICATORS', description: 'Visible lineage / supersession indicators' },
  { expectation: 'ISSUANCE_STATUS_VISIBLE', description: 'Visible issuance status separate from workflow status' },
  { expectation: 'EXCEPTION_ITERATION_HISTORY', description: 'Visible exception-iteration history' },
  { expectation: 'RENEWAL_EXPIRATION_POSTURE', description: 'Visible renewal / expiration posture where relevant' },
  { expectation: 'SMART_EMPTY_STATE', description: 'HbcSmartEmptyState for empty or pre-activation surfaces' },
];

// -- Visibility Tier Definitions (T06 §6) --------------------------------------

export const VISIBILITY_TIER_DEFINITIONS: ReadonlyArray<IVisibilityTierDef> = [
  { tier: 'OPERATIONAL', visibleData: ['Package assembly state', 'Requirement status', 'Deficiencies', 'Decision posture', 'Linked buyout context', 'Read-only exception outcomes'] },
  { tier: 'SPECIALIST', visibleData: ['Item metadata', 'Evaluation history', 'Packet history', 'Delegation audit', 'Decision issuance controls'] },
  { tier: 'REVIEW', visibleData: ['Governed read projections', 'Annotation affordances where policy permits'] },
];
