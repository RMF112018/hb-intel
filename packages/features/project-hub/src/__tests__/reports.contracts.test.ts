import { describe, expect, it } from 'vitest';
import {
  // Enum arrays
  REPORT_SECTION_CONTENT_TYPES,
  RELEASE_CLASSES,
  INTERNAL_REVIEW_CHAIN_STATUSES,
  CONFIG_VERSION_STATES,
  TEMPLATE_PROMOTION_STATUSES,
  REPORT_VALIDATION_RULES,
  // Label maps
  RELEASE_CLASS_LABELS,
  INTERNAL_REVIEW_CHAIN_STATUS_LABELS,
  CONFIG_VERSION_STATE_LABELS,
  // State machines
  REPORT_RUN_STATUS_TRANSITIONS,
  CONFIG_VERSION_STATE_TRANSITIONS,
  INTERNAL_REVIEW_CHAIN_TRANSITIONS,
  // Section definitions
  PX_REVIEW_SECTION_DEFINITIONS,
  OWNER_REPORT_SECTION_DEFINITIONS,
  // Validation rules
  REPORT_VALIDATION_RULE_DEFINITIONS,
  // Business rules
  isValidRunStatusTransition,
  isValidConfigVersionTransition,
  isValidReviewChainTransition,
  isRunApprovalRequired,
  canRunTransitionToReleased,
  isSnapshotRefImmutable,
  canPmEditNarrative,
  canPerEditNarrative,
  isScoreFieldReadOnly,
  isRecommendationFieldReadOnly,
  isValidationRuleSatisfied,
  canBypassInternalReviewChain,
  // Types (compile-time checks)
  type IReportRunRecord,
  type IProjectFamilyRegistration,
  type IProjectFamilyConfigVersion,
  type ISnapshotRef,
  type IInternalReviewChainState,
} from '../index.js';

// =============================================================================
// Contract stability
// =============================================================================

describe('P3-E9-T02 reports contracts — contract stability', () => {
  // -- Enum array lengths -----------------------------------------------------

  it('locks REPORT_SECTION_CONTENT_TYPES to 3 entries', () => {
    expect(REPORT_SECTION_CONTENT_TYPES).toHaveLength(3);
  });

  it('locks RELEASE_CLASSES to 4 entries', () => {
    expect(RELEASE_CLASSES).toHaveLength(4);
  });

  it('locks INTERNAL_REVIEW_CHAIN_STATUSES to 4 entries', () => {
    expect(INTERNAL_REVIEW_CHAIN_STATUSES).toHaveLength(4);
  });

  it('locks CONFIG_VERSION_STATES to 4 entries', () => {
    expect(CONFIG_VERSION_STATES).toHaveLength(4);
  });

  it('locks TEMPLATE_PROMOTION_STATUSES to 5 entries', () => {
    expect(TEMPLATE_PROMOTION_STATUSES).toHaveLength(5);
  });

  it('locks REPORT_VALIDATION_RULES to 14 entries', () => {
    expect(REPORT_VALIDATION_RULES).toHaveLength(14);
  });

  // -- Label map key counts ---------------------------------------------------

  it('RELEASE_CLASS_LABELS covers all 4 release classes', () => {
    expect(Object.keys(RELEASE_CLASS_LABELS)).toHaveLength(4);
  });

  it('INTERNAL_REVIEW_CHAIN_STATUS_LABELS covers all 4 statuses', () => {
    expect(Object.keys(INTERNAL_REVIEW_CHAIN_STATUS_LABELS)).toHaveLength(4);
  });

  it('CONFIG_VERSION_STATE_LABELS covers all 4 states', () => {
    expect(Object.keys(CONFIG_VERSION_STATE_LABELS)).toHaveLength(4);
  });

  // -- State machine counts ---------------------------------------------------

  it('REPORT_RUN_STATUS_TRANSITIONS has 4 transitions', () => {
    expect(REPORT_RUN_STATUS_TRANSITIONS).toHaveLength(4);
  });

  it('CONFIG_VERSION_STATE_TRANSITIONS has 3 transitions', () => {
    expect(CONFIG_VERSION_STATE_TRANSITIONS).toHaveLength(3);
  });

  it('INTERNAL_REVIEW_CHAIN_TRANSITIONS has 4 transitions', () => {
    expect(INTERNAL_REVIEW_CHAIN_TRANSITIONS).toHaveLength(4);
  });

  // -- Section definition counts ----------------------------------------------

  it('PX_REVIEW_SECTION_DEFINITIONS has 6 sections', () => {
    expect(PX_REVIEW_SECTION_DEFINITIONS).toHaveLength(6);
  });

  it('OWNER_REPORT_SECTION_DEFINITIONS has 5 sections', () => {
    expect(OWNER_REPORT_SECTION_DEFINITIONS).toHaveLength(5);
  });

  // -- Validation rule definitions --------------------------------------------

  it('REPORT_VALIDATION_RULE_DEFINITIONS has 14 entries', () => {
    expect(REPORT_VALIDATION_RULE_DEFINITIONS).toHaveLength(14);
  });

  // -- Section definition invariants ------------------------------------------

  it('PX Review sections are all required', () => {
    expect(PX_REVIEW_SECTION_DEFINITIONS.every((s) => s.isRequired)).toBe(true);
  });

  it('Owner Report has narrative-overrideable sections', () => {
    const narrativeOverrideableSections = OWNER_REPORT_SECTION_DEFINITIONS.filter((s) => s.isNarrativeOverrideable);
    expect(narrativeOverrideableSections.length).toBeGreaterThan(0);
  });

  // -- Type compile-time checks -----------------------------------------------

  it('IReportRunRecord type is structurally valid', () => {
    const record: IReportRunRecord = {
      runId: 'run-1',
      projectId: 'proj-1',
      familyKey: 'PX_REVIEW',
      runType: 'STANDARD',
      status: 'PENDING',
      configVersionId: 'cv-1',
      snapshotRefs: [],
      generatedByUPN: 'pm@test.com',
      generatedAt: '2026-01-01T00:00:00Z',
      queuedAt: '2026-01-01T00:00:00Z',
      artifactUrl: null,
      approvalMetadata: null,
      releaseMetadata: null,
      internalReviewChain: null,
      failureReason: null,
      annotationArtifactRef: null,
      archivedAt: null,
    };
    expect(record.runId).toBe('run-1');
  });

  it('IProjectFamilyRegistration type is structurally valid', () => {
    const reg: IProjectFamilyRegistration = {
      registrationId: 'reg-1',
      projectId: 'proj-1',
      familyKey: 'PX_REVIEW',
      isActive: true,
      activatedAt: '2026-01-01T00:00:00Z',
      activeConfigVersionId: 'cv-1',
      draftConfigVersionId: null,
      promotionStatus: 'NOT_SUBMITTED',
      createdAt: '2026-01-01T00:00:00Z',
      createdByUPN: 'pe@test.com',
    };
    expect(reg.registrationId).toBe('reg-1');
  });

  it('IProjectFamilyConfigVersion type is structurally valid', () => {
    const config: IProjectFamilyConfigVersion = {
      configVersionId: 'cv-1',
      projectId: 'proj-1',
      familyKey: 'OWNER_REPORT',
      state: 'DRAFT',
      selectedReleaseClass: 'OWNER_FACING',
      selectedAudienceClasses: ['external-owner'],
      sectionOverrides: [],
      narrativeDefaults: [],
      structuralChanges: [],
      submittedForActivationAt: null,
      activatedAt: null,
      version: 1,
    };
    expect(config.configVersionId).toBe('cv-1');
  });

  it('ISnapshotRef type is structurally valid', () => {
    const ref: ISnapshotRef = {
      sourceModule: 'financial',
      snapshotId: 'snap-1',
      snapshotVersion: '1.0.0',
      capturedAt: '2026-01-01T00:00:00Z',
      confirmedAt: null,
    };
    expect(ref.sourceModule).toBe('financial');
  });

  it('IInternalReviewChainState type is structurally valid', () => {
    const chain: IInternalReviewChainState = {
      chainId: 'chain-1',
      runId: 'run-1',
      status: 'NOT_STARTED',
      submittedByPM_UPN: 'pm@test.com',
      submittedAt: '2026-01-01T00:00:00Z',
      reviewedByPE_UPN: null,
      reviewedAt: null,
      returnReason: null,
      completedAt: null,
    };
    expect(chain.chainId).toBe('chain-1');
  });
});

// =============================================================================
// Business rules
// =============================================================================

describe('P3-E9-T02 reports contracts — business rules', () => {
  // -- Config version state transitions ---------------------------------------

  it('allows DRAFT → ACTIVE', () => {
    expect(isValidConfigVersionTransition('DRAFT', 'ACTIVE')).toBe(true);
  });

  it('rejects DRAFT → SUPERSEDED', () => {
    expect(isValidConfigVersionTransition('DRAFT', 'SUPERSEDED')).toBe(false);
  });

  it('allows ACTIVE → SUPERSEDED', () => {
    expect(isValidConfigVersionTransition('ACTIVE', 'SUPERSEDED')).toBe(true);
  });

  // -- Internal review chain transitions --------------------------------------

  it('allows NOT_STARTED → SUBMITTED', () => {
    expect(isValidReviewChainTransition('NOT_STARTED', 'SUBMITTED')).toBe(true);
  });

  it('allows SUBMITTED → COMPLETE', () => {
    expect(isValidReviewChainTransition('SUBMITTED', 'COMPLETE')).toBe(true);
  });

  it('allows RETURNED → SUBMITTED', () => {
    expect(isValidReviewChainTransition('RETURNED', 'SUBMITTED')).toBe(true);
  });

  it('rejects NOT_STARTED → COMPLETE', () => {
    expect(isValidReviewChainTransition('NOT_STARTED', 'COMPLETE')).toBe(false);
  });

  // -- Run status transitions -------------------------------------------------

  it('allows PENDING → GENERATING', () => {
    expect(isValidRunStatusTransition('PENDING', 'GENERATING')).toBe(true);
  });

  it('rejects PENDING → COMPLETED', () => {
    expect(isValidRunStatusTransition('PENDING', 'COMPLETED')).toBe(false);
  });

  // -- Approval gates ---------------------------------------------------------

  it('PX_REVIEW requires approval', () => {
    expect(isRunApprovalRequired('PX_REVIEW')).toBe(true);
  });

  it('OWNER_REPORT does not require approval', () => {
    expect(isRunApprovalRequired('OWNER_REPORT')).toBe(false);
  });

  // -- Release transitions ----------------------------------------------------

  it('PX_REVIEW can release from COMPLETED', () => {
    expect(canRunTransitionToReleased('COMPLETED', 'PX_REVIEW')).toBe(true);
  });

  it('OWNER_REPORT can release from COMPLETED', () => {
    expect(canRunTransitionToReleased('COMPLETED', 'OWNER_REPORT')).toBe(true);
  });

  // -- Field authority --------------------------------------------------------

  it('snapshot refs are immutable', () => {
    expect(isSnapshotRefImmutable()).toBe(true);
  });

  it('PM can edit narrative', () => {
    expect(canPmEditNarrative()).toBe(true);
  });

  it('PER cannot edit narrative', () => {
    expect(canPerEditNarrative()).toBe(false);
  });

  it('score fields are read-only', () => {
    expect(isScoreFieldReadOnly()).toBe(true);
  });

  it('recommendation fields are read-only', () => {
    expect(isRecommendationFieldReadOnly()).toBe(true);
  });

  // -- Validation rule evaluation ---------------------------------------------

  it('FAMILY_KEY_REQUIRED satisfied when value present', () => {
    expect(isValidationRuleSatisfied('FAMILY_KEY_REQUIRED', true)).toBe(true);
  });

  it('FAMILY_KEY_REQUIRED not satisfied when value absent', () => {
    expect(isValidationRuleSatisfied('FAMILY_KEY_REQUIRED', false)).toBe(false);
  });

  it('non-required rule is satisfied by default', () => {
    expect(isValidationRuleSatisfied('RELEASE_CLASS_MATCH', false)).toBe(true);
  });

  // -- Internal review chain bypass -------------------------------------------

  it('OWNER_REPORT with bypass flag can bypass review chain', () => {
    expect(canBypassInternalReviewChain('OWNER_REPORT', true)).toBe(true);
  });

  it('PX_REVIEW cannot bypass review chain even with flag', () => {
    expect(canBypassInternalReviewChain('PX_REVIEW', true)).toBe(false);
  });

  it('OWNER_REPORT without bypass flag cannot bypass', () => {
    expect(canBypassInternalReviewChain('OWNER_REPORT', false)).toBe(false);
  });
});
