/**
 * P3-E9-T04 reports run-lifecycle constants.
 * State machine, family policies, pipeline steps, approval configs.
 */

import type {
  ApprovalBlockingCondition,
  ApprovalGateRequirement,
  DistributionAction,
  GenerationPipelineStep,
  ReleaseAuthorityLevel,
  RunArchivalReason,
  RunLifecycleStatus,
} from './enums.js';
import type {
  IApprovalGateConfig,
  IFamilyLifecyclePolicy,
  IGenerationPipelineStepDef,
  IRunLifecycleTransition,
} from './types.js';

// -- Enum Arrays --------------------------------------------------------------

export const ALL_RUN_LIFECYCLE_STATUSES = [
  'QUEUED',
  'GENERATING',
  'GENERATED',
  'APPROVED',
  'RELEASED',
  'ARCHIVED',
  'FAILED',
] as const satisfies ReadonlyArray<RunLifecycleStatus>;

export const ALL_APPROVAL_GATE_REQUIREMENTS = [
  'PE_APPROVAL_REQUIRED',
  'NO_APPROVAL_GATE',
] as const satisfies ReadonlyArray<ApprovalGateRequirement>;

export const ALL_RELEASE_AUTHORITY_LEVELS = [
  'PE_ONLY',
  'PER_PERMITTED',
  'GLOBAL',
] as const satisfies ReadonlyArray<ReleaseAuthorityLevel>;

export const ALL_GENERATION_PIPELINE_STEPS = [
  'READINESS_CHECK',
  'CREATE_RUN_RECORD',
  'ENQUEUE_JOB',
  'ASSEMBLE_REPORT',
  'RENDER_PDF',
  'STORE_ARTIFACT',
  'RECORD_RESULT',
] as const satisfies ReadonlyArray<GenerationPipelineStep>;

export const ALL_RUN_ARCHIVAL_REASONS = [
  'SUPERSEDED_BY_NEWER',
  'MANUAL_ARCHIVE',
  'POLICY_DRIVEN',
] as const satisfies ReadonlyArray<RunArchivalReason>;

export const ALL_DISTRIBUTION_ACTIONS = [
  'INTERNAL_DISTRIBUTION',
  'OWNER_DISTRIBUTION',
  'EXTERNAL_DISTRIBUTION',
] as const satisfies ReadonlyArray<DistributionAction>;

export const ALL_APPROVAL_BLOCKING_CONDITIONS = [
  'INTERNAL_REVIEW_CHAIN_INCOMPLETE',
  'APPROVAL_GATE_NOT_REQUIRED',
  'RUN_NOT_GENERATED',
] as const satisfies ReadonlyArray<ApprovalBlockingCondition>;

// -- Label Maps ---------------------------------------------------------------

export const RUN_LIFECYCLE_STATUS_LABELS: Readonly<Record<RunLifecycleStatus, string>> = {
  QUEUED: 'Queued',
  GENERATING: 'Generating',
  GENERATED: 'Generated',
  APPROVED: 'Approved',
  RELEASED: 'Released',
  ARCHIVED: 'Archived',
  FAILED: 'Failed',
};

export const APPROVAL_GATE_REQUIREMENT_LABELS: Readonly<Record<ApprovalGateRequirement, string>> = {
  PE_APPROVAL_REQUIRED: 'PE Approval Required',
  NO_APPROVAL_GATE: 'No Approval Gate',
};

export const RELEASE_AUTHORITY_LEVEL_LABELS: Readonly<Record<ReleaseAuthorityLevel, string>> = {
  PE_ONLY: 'PE Only',
  PER_PERMITTED: 'PER Permitted',
  GLOBAL: 'Global',
};

// -- Lifecycle Transitions ----------------------------------------------------

export const RUN_LIFECYCLE_TRANSITIONS: ReadonlyArray<IRunLifecycleTransition> = [
  { from: 'QUEUED', to: 'GENERATING', familyRestriction: null, requiresApproval: false, requiresChainComplete: false },
  { from: 'GENERATING', to: 'GENERATED', familyRestriction: null, requiresApproval: false, requiresChainComplete: false },
  { from: 'GENERATING', to: 'FAILED', familyRestriction: null, requiresApproval: false, requiresChainComplete: false },
  { from: 'GENERATED', to: 'APPROVED', familyRestriction: 'PX_REVIEW', requiresApproval: true, requiresChainComplete: true },
  { from: 'GENERATED', to: 'RELEASED', familyRestriction: null, requiresApproval: false, requiresChainComplete: false },
  { from: 'APPROVED', to: 'RELEASED', familyRestriction: null, requiresApproval: false, requiresChainComplete: false },
  { from: 'RELEASED', to: 'ARCHIVED', familyRestriction: null, requiresApproval: false, requiresChainComplete: false },
  { from: 'GENERATED', to: 'ARCHIVED', familyRestriction: null, requiresApproval: false, requiresChainComplete: false },
  { from: 'APPROVED', to: 'ARCHIVED', familyRestriction: null, requiresApproval: false, requiresChainComplete: false },
  { from: 'FAILED', to: 'ARCHIVED', familyRestriction: null, requiresApproval: false, requiresChainComplete: false },
  { from: 'GENERATED', to: 'FAILED', familyRestriction: null, requiresApproval: false, requiresChainComplete: false },
];

// -- Family Lifecycle Policies ------------------------------------------------

export const FAMILY_LIFECYCLE_POLICIES: ReadonlyArray<IFamilyLifecyclePolicy> = [
  {
    familyKey: 'PX_REVIEW',
    approvalGateConfig: { familyKey: 'PX_REVIEW', gateRequirement: 'PE_APPROVAL_REQUIRED', approverRole: 'PE', requiresInternalReviewChain: true, chainBlocksApproval: true },
    releaseAuthorityConfig: { familyKey: 'PX_REVIEW', authorityLevel: 'PE_ONLY', peCanRelease: true, perCanRelease: false },
    requiresInternalReviewChain: true,
    allowsDirectRelease: false,
    perCanGenerateReviewerRun: true,
  },
  {
    familyKey: 'OWNER_REPORT',
    approvalGateConfig: { familyKey: 'OWNER_REPORT', gateRequirement: 'NO_APPROVAL_GATE', approverRole: 'N/A', requiresInternalReviewChain: false, chainBlocksApproval: false },
    releaseAuthorityConfig: { familyKey: 'OWNER_REPORT', authorityLevel: 'PER_PERMITTED', peCanRelease: true, perCanRelease: true },
    requiresInternalReviewChain: false,
    allowsDirectRelease: true,
    perCanGenerateReviewerRun: true,
  },
  {
    familyKey: 'SUB_SCORECARD',
    approvalGateConfig: { familyKey: 'SUB_SCORECARD', gateRequirement: 'NO_APPROVAL_GATE', approverRole: 'N/A', requiresInternalReviewChain: false, chainBlocksApproval: false },
    releaseAuthorityConfig: { familyKey: 'SUB_SCORECARD', authorityLevel: 'PE_ONLY', peCanRelease: true, perCanRelease: false },
    requiresInternalReviewChain: false,
    allowsDirectRelease: true,
    perCanGenerateReviewerRun: false,
  },
  {
    familyKey: 'LESSONS_LEARNED',
    approvalGateConfig: { familyKey: 'LESSONS_LEARNED', gateRequirement: 'NO_APPROVAL_GATE', approverRole: 'N/A', requiresInternalReviewChain: false, chainBlocksApproval: false },
    releaseAuthorityConfig: { familyKey: 'LESSONS_LEARNED', authorityLevel: 'PE_ONLY', peCanRelease: true, perCanRelease: false },
    requiresInternalReviewChain: false,
    allowsDirectRelease: true,
    perCanGenerateReviewerRun: false,
  },
];

// -- Generation Pipeline Steps ------------------------------------------------

export const GENERATION_PIPELINE_STEPS: ReadonlyArray<IGenerationPipelineStepDef> = [
  { step: 'READINESS_CHECK', order: 1, description: 'Verify draft readiness (T03 §4.3)', isTerminal: false },
  { step: 'CREATE_RUN_RECORD', order: 2, description: 'Create run record with status QUEUED', isTerminal: false },
  { step: 'ENQUEUE_JOB', order: 3, description: 'Submit to async generation queue', isTerminal: false },
  { step: 'ASSEMBLE_REPORT', order: 4, description: 'Assemble from frozen snapshots + narrative', isTerminal: false },
  { step: 'RENDER_PDF', order: 5, description: 'Render PDF artifact', isTerminal: false },
  { step: 'STORE_ARTIFACT', order: 6, description: 'Store in governed SharePoint document library', isTerminal: false },
  { step: 'RECORD_RESULT', order: 7, description: 'Record artifact URL and update status to GENERATED or FAILED', isTerminal: true },
];

// -- Derived: Approval Gate Configs -------------------------------------------

export const APPROVAL_GATE_CONFIGS: ReadonlyArray<IApprovalGateConfig> = FAMILY_LIFECYCLE_POLICIES.map((p) => p.approvalGateConfig);
