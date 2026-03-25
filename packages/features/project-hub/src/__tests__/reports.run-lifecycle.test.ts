import { describe, expect, it } from 'vitest';
import {
  // Enum arrays
  ALL_RUN_LIFECYCLE_STATUSES,
  ALL_APPROVAL_GATE_REQUIREMENTS,
  ALL_RELEASE_AUTHORITY_LEVELS,
  ALL_GENERATION_PIPELINE_STEPS,
  ALL_RUN_ARCHIVAL_REASONS,
  ALL_DISTRIBUTION_ACTIONS,
  ALL_APPROVAL_BLOCKING_CONDITIONS,
  // Label maps
  RUN_LIFECYCLE_STATUS_LABELS,
  APPROVAL_GATE_REQUIREMENT_LABELS,
  RELEASE_AUTHORITY_LEVEL_LABELS,
  // Constant collections
  RUN_LIFECYCLE_TRANSITIONS,
  FAMILY_LIFECYCLE_POLICIES,
  GENERATION_PIPELINE_STEPS,
  APPROVAL_GATE_CONFIGS,
  // Business rules
  isValidRunLifecycleTransition,
  isApprovalGateRequired,
  isInternalReviewChainRequiredForApproval,
  canApproveRun,
  canReleaseRun,
  canPerReleaseFamily,
  canPerApproveRun,
  isRunArchivable,
  doesReviewerRunAffectStandardSequence,
  getApprovalBlockingCondition,
  getFamilyLifecyclePolicy,
  allowsDirectRelease,
  isGenerationPipelineStepTerminal,
  canPeApproveRun,
  isRunRecordImmutableAfterArchival,
  // Types (compile-time checks)
  type IRunLifecycleTransition,
  type IFamilyLifecyclePolicy,
  type IGenerationPipelineStepDef,
  type IRunArchivalRecord,
  type IApprovalGateConfig,
  type IReleaseAuthorityConfig,
  type IDistributionRecord,
  type IApprovalPreconditionCheck,
} from '../index.js';

// =============================================================================
// Contract stability
// =============================================================================

describe('P3-E9-T04 run-lifecycle — contract stability', () => {
  // -- Enum array lengths -----------------------------------------------------

  it('ALL_RUN_LIFECYCLE_STATUSES has 7 members', () => {
    expect(ALL_RUN_LIFECYCLE_STATUSES).toHaveLength(7);
  });

  it('ALL_APPROVAL_GATE_REQUIREMENTS has 2 members', () => {
    expect(ALL_APPROVAL_GATE_REQUIREMENTS).toHaveLength(2);
  });

  it('ALL_RELEASE_AUTHORITY_LEVELS has 3 members', () => {
    expect(ALL_RELEASE_AUTHORITY_LEVELS).toHaveLength(3);
  });

  it('ALL_GENERATION_PIPELINE_STEPS has 7 members', () => {
    expect(ALL_GENERATION_PIPELINE_STEPS).toHaveLength(7);
  });

  it('ALL_RUN_ARCHIVAL_REASONS has 3 members', () => {
    expect(ALL_RUN_ARCHIVAL_REASONS).toHaveLength(3);
  });

  it('ALL_DISTRIBUTION_ACTIONS has 3 members', () => {
    expect(ALL_DISTRIBUTION_ACTIONS).toHaveLength(3);
  });

  it('ALL_APPROVAL_BLOCKING_CONDITIONS has 3 members', () => {
    expect(ALL_APPROVAL_BLOCKING_CONDITIONS).toHaveLength(3);
  });

  // -- Label map key counts ---------------------------------------------------

  it('RUN_LIFECYCLE_STATUS_LABELS has 7 keys', () => {
    expect(Object.keys(RUN_LIFECYCLE_STATUS_LABELS)).toHaveLength(7);
  });

  it('APPROVAL_GATE_REQUIREMENT_LABELS has 2 keys', () => {
    expect(Object.keys(APPROVAL_GATE_REQUIREMENT_LABELS)).toHaveLength(2);
  });

  it('RELEASE_AUTHORITY_LEVEL_LABELS has 3 keys', () => {
    expect(Object.keys(RELEASE_AUTHORITY_LEVEL_LABELS)).toHaveLength(3);
  });

  // -- Constant collection sizes ----------------------------------------------

  it('RUN_LIFECYCLE_TRANSITIONS has 11 entries', () => {
    expect(RUN_LIFECYCLE_TRANSITIONS).toHaveLength(11);
  });

  it('FAMILY_LIFECYCLE_POLICIES has 4 entries', () => {
    expect(FAMILY_LIFECYCLE_POLICIES).toHaveLength(4);
  });

  it('GENERATION_PIPELINE_STEPS has 7 entries and last step is terminal', () => {
    expect(GENERATION_PIPELINE_STEPS).toHaveLength(7);
    const last = GENERATION_PIPELINE_STEPS[GENERATION_PIPELINE_STEPS.length - 1];
    expect(last.isTerminal).toBe(true);
  });

  it('APPROVAL_GATE_CONFIGS has 4 entries', () => {
    expect(APPROVAL_GATE_CONFIGS).toHaveLength(4);
  });

  // -- Family policy spot checks ----------------------------------------------

  it('PX_REVIEW policy has PE_APPROVAL_REQUIRED and chain required', () => {
    const policy = FAMILY_LIFECYCLE_POLICIES.find((p) => p.familyKey === 'PX_REVIEW');
    expect(policy).toBeDefined();
    expect(policy!.approvalGateConfig.gateRequirement).toBe('PE_APPROVAL_REQUIRED');
    expect(policy!.requiresInternalReviewChain).toBe(true);
  });

  it('OWNER_REPORT allows direct release and PER release', () => {
    const policy = FAMILY_LIFECYCLE_POLICIES.find((p) => p.familyKey === 'OWNER_REPORT');
    expect(policy).toBeDefined();
    expect(policy!.allowsDirectRelease).toBe(true);
    expect(policy!.releaseAuthorityConfig.perCanRelease).toBe(true);
  });

  // -- Type compile-time checks -----------------------------------------------

  it('IRunLifecycleTransition shape compiles', () => {
    const t: IRunLifecycleTransition = {
      from: 'QUEUED',
      to: 'GENERATING',
      familyRestriction: null,
      requiresApproval: false,
      requiresChainComplete: false,
    };
    expect(t.from).toBe('QUEUED');
  });

  it('IFamilyLifecyclePolicy shape compiles', () => {
    const p: IFamilyLifecyclePolicy = FAMILY_LIFECYCLE_POLICIES[0];
    expect(p.familyKey).toBeDefined();
  });

  it('IGenerationPipelineStepDef shape compiles', () => {
    const s: IGenerationPipelineStepDef = GENERATION_PIPELINE_STEPS[0];
    expect(s.step).toBeDefined();
  });

  it('IRunArchivalRecord shape compiles', () => {
    const r: IRunArchivalRecord = {
      archivalId: 'a1',
      runId: 'r1',
      reason: 'MANUAL_ARCHIVE',
      archivedByUPN: 'user@example.com',
      archivedAt: '2026-01-01T00:00:00Z',
      supersededByRunId: null,
    };
    expect(r.archivalId).toBe('a1');
  });

  it('IApprovalGateConfig shape compiles', () => {
    const c: IApprovalGateConfig = APPROVAL_GATE_CONFIGS[0];
    expect(c.familyKey).toBeDefined();
  });

  it('IReleaseAuthorityConfig shape compiles', () => {
    const r: IReleaseAuthorityConfig = FAMILY_LIFECYCLE_POLICIES[0].releaseAuthorityConfig;
    expect(r.familyKey).toBeDefined();
  });

  it('IDistributionRecord shape compiles', () => {
    const d: IDistributionRecord = {
      distributionId: 'd1',
      runId: 'r1',
      action: 'INTERNAL_DISTRIBUTION',
      distributedAt: '2026-01-01T00:00:00Z',
      distributedByUPN: 'user@example.com',
      recipientCount: 5,
    };
    expect(d.distributionId).toBe('d1');
  });

  it('IApprovalPreconditionCheck shape compiles', () => {
    const c: IApprovalPreconditionCheck = {
      checkId: 'c1',
      runId: 'r1',
      internalReviewChainComplete: true,
      approvalGateRequired: true,
      blockingCondition: null,
    };
    expect(c.checkId).toBe('c1');
  });
});

// =============================================================================
// Business rules
// =============================================================================

describe('P3-E9-T04 run-lifecycle — business rules', () => {
  // -- isValidRunLifecycleTransition ------------------------------------------

  describe('isValidRunLifecycleTransition', () => {
    it('QUEUED → GENERATING is valid', () => {
      expect(isValidRunLifecycleTransition('QUEUED', 'GENERATING', 'PX_REVIEW')).toBe(true);
    });

    it('GENERATED → APPROVED for PX_REVIEW is valid', () => {
      expect(isValidRunLifecycleTransition('GENERATED', 'APPROVED', 'PX_REVIEW')).toBe(true);
    });

    it('GENERATED → APPROVED for OWNER_REPORT is invalid (family restriction)', () => {
      expect(isValidRunLifecycleTransition('GENERATED', 'APPROVED', 'OWNER_REPORT')).toBe(false);
    });

    it('GENERATED → RELEASED for OWNER_REPORT is valid', () => {
      expect(isValidRunLifecycleTransition('GENERATED', 'RELEASED', 'OWNER_REPORT')).toBe(true);
    });

    it('QUEUED → RELEASED is invalid', () => {
      expect(isValidRunLifecycleTransition('QUEUED', 'RELEASED', 'PX_REVIEW')).toBe(false);
    });
  });

  // -- isApprovalGateRequired -------------------------------------------------

  describe('isApprovalGateRequired', () => {
    it('PX_REVIEW requires approval gate', () => {
      expect(isApprovalGateRequired('PX_REVIEW')).toBe(true);
    });

    it('OWNER_REPORT does not require approval gate', () => {
      expect(isApprovalGateRequired('OWNER_REPORT')).toBe(false);
    });

    it('SUB_SCORECARD does not require approval gate', () => {
      expect(isApprovalGateRequired('SUB_SCORECARD')).toBe(false);
    });
  });

  // -- isInternalReviewChainRequiredForApproval -------------------------------

  describe('isInternalReviewChainRequiredForApproval', () => {
    it('PX_REVIEW requires internal review chain', () => {
      expect(isInternalReviewChainRequiredForApproval('PX_REVIEW')).toBe(true);
    });

    it('OWNER_REPORT does not require internal review chain', () => {
      expect(isInternalReviewChainRequiredForApproval('OWNER_REPORT')).toBe(false);
    });
  });

  // -- canApproveRun ----------------------------------------------------------

  describe('canApproveRun', () => {
    it('(GENERATED, chain complete, PX_REVIEW) → true', () => {
      expect(canApproveRun('GENERATED', true, 'PX_REVIEW')).toBe(true);
    });

    it('(GENERATED, chain incomplete, PX_REVIEW) → false', () => {
      expect(canApproveRun('GENERATED', false, 'PX_REVIEW')).toBe(false);
    });

    it('(GENERATED, chain complete, OWNER_REPORT) → false (no gate)', () => {
      expect(canApproveRun('GENERATED', true, 'OWNER_REPORT')).toBe(false);
    });
  });

  // -- canReleaseRun ----------------------------------------------------------

  describe('canReleaseRun', () => {
    it('(APPROVED, PX_REVIEW) → true', () => {
      expect(canReleaseRun('APPROVED', 'PX_REVIEW')).toBe(true);
    });

    it('(GENERATED, PX_REVIEW) → false (needs approval first)', () => {
      expect(canReleaseRun('GENERATED', 'PX_REVIEW')).toBe(false);
    });

    it('(GENERATED, OWNER_REPORT) → true (no gate)', () => {
      expect(canReleaseRun('GENERATED', 'OWNER_REPORT')).toBe(true);
    });
  });

  // -- canPerReleaseFamily ----------------------------------------------------

  describe('canPerReleaseFamily', () => {
    it('PER_PERMITTED authority → true', () => {
      expect(canPerReleaseFamily('OWNER_REPORT', 'PER_PERMITTED')).toBe(true);
    });

    it('PE_ONLY authority → false', () => {
      expect(canPerReleaseFamily('PX_REVIEW', 'PE_ONLY')).toBe(false);
    });

    it('GLOBAL authority → true', () => {
      expect(canPerReleaseFamily('ANY', 'GLOBAL')).toBe(true);
    });
  });

  // -- canPerApproveRun -------------------------------------------------------

  it('canPerApproveRun always returns false', () => {
    expect(canPerApproveRun()).toBe(false);
  });

  // -- isRunArchivable --------------------------------------------------------

  describe('isRunArchivable', () => {
    it('GENERATED → archivable', () => {
      expect(isRunArchivable('GENERATED')).toBe(true);
    });

    it('RELEASED → archivable', () => {
      expect(isRunArchivable('RELEASED')).toBe(true);
    });

    it('FAILED → archivable', () => {
      expect(isRunArchivable('FAILED')).toBe(true);
    });

    it('QUEUED → not archivable', () => {
      expect(isRunArchivable('QUEUED')).toBe(false);
    });

    it('GENERATING → not archivable', () => {
      expect(isRunArchivable('GENERATING')).toBe(false);
    });
  });

  // -- doesReviewerRunAffectStandardSequence ----------------------------------

  it('doesReviewerRunAffectStandardSequence always returns false', () => {
    expect(doesReviewerRunAffectStandardSequence()).toBe(false);
  });

  // -- getApprovalBlockingCondition -------------------------------------------

  describe('getApprovalBlockingCondition', () => {
    it('(QUEUED, true, true) → RUN_NOT_GENERATED', () => {
      expect(getApprovalBlockingCondition('QUEUED', true, true)).toBe('RUN_NOT_GENERATED');
    });

    it('(GENERATED, true, false) → APPROVAL_GATE_NOT_REQUIRED', () => {
      expect(getApprovalBlockingCondition('GENERATED', true, false)).toBe('APPROVAL_GATE_NOT_REQUIRED');
    });

    it('(GENERATED, false, true) → INTERNAL_REVIEW_CHAIN_INCOMPLETE', () => {
      expect(getApprovalBlockingCondition('GENERATED', false, true)).toBe('INTERNAL_REVIEW_CHAIN_INCOMPLETE');
    });

    it('(GENERATED, true, true) → null (no blocking condition)', () => {
      expect(getApprovalBlockingCondition('GENERATED', true, true)).toBeNull();
    });
  });

  // -- getFamilyLifecyclePolicy -----------------------------------------------

  it('getFamilyLifecyclePolicy returns policy for known family', () => {
    const policy = getFamilyLifecyclePolicy('PX_REVIEW');
    expect(policy).not.toBeNull();
    expect(policy!.familyKey).toBe('PX_REVIEW');
  });

  it('getFamilyLifecyclePolicy returns null for unknown family', () => {
    expect(getFamilyLifecyclePolicy('UNKNOWN')).toBeNull();
  });

  // -- allowsDirectRelease ----------------------------------------------------

  describe('allowsDirectRelease', () => {
    it('OWNER_REPORT allows direct release', () => {
      expect(allowsDirectRelease('OWNER_REPORT')).toBe(true);
    });

    it('PX_REVIEW does not allow direct release', () => {
      expect(allowsDirectRelease('PX_REVIEW')).toBe(false);
    });
  });

  // -- isGenerationPipelineStepTerminal ---------------------------------------

  describe('isGenerationPipelineStepTerminal', () => {
    it('RECORD_RESULT is terminal', () => {
      expect(isGenerationPipelineStepTerminal('RECORD_RESULT')).toBe(true);
    });

    it('READINESS_CHECK is not terminal', () => {
      expect(isGenerationPipelineStepTerminal('READINESS_CHECK')).toBe(false);
    });
  });

  // -- canPeApproveRun --------------------------------------------------------

  it('canPeApproveRun always returns true', () => {
    expect(canPeApproveRun()).toBe(true);
  });

  // -- isRunRecordImmutableAfterArchival --------------------------------------

  it('isRunRecordImmutableAfterArchival always returns true', () => {
    expect(isRunRecordImmutableAfterArchival()).toBe(true);
  });
});
