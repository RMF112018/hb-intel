import { describe, expect, it } from 'vitest';
import {
  // Enum arrays
  DRAFT_CONFIRMATION_STATUSES,
  STALENESS_LEVELS,
  REFRESH_ACTIONS,
  NARRATIVE_EDIT_ACTIONS,
  SNAPSHOT_FREEZE_STATUSES,
  READINESS_CHECK_RESULTS,
  STRUCTURAL_CHANGE_CLASSIFICATIONS,
  DRAFT_STALENESS_WORK_QUEUE_PRIORITIES,
  // Label maps
  STALENESS_LEVEL_LABELS,
  DRAFT_CONFIRMATION_STATUS_LABELS,
  READINESS_CHECK_RESULT_LABELS,
  // Scalar constants
  STALENESS_THRESHOLD_DEFAULT_DAYS,
  STALENESS_ESCALATION_MULTIPLIER,
  STRUCTURAL_CHANGE_EXAMPLES,
  NON_STRUCTURAL_CHANGE_EXAMPLES,
  READINESS_CHECK_REQUIREMENTS,
  NARRATIVE_CONSTRAINTS,
  // Business rules
  isDraftStale,
  getStalenessLevel,
  requiresStalenessAcknowledgment,
  canPmConfirmDraft,
  canPerConfirmDraft,
  canPerInitiateRefresh,
  doesRefreshPreserveNarrative,
  doesRefreshAffectExistingRuns,
  isSnapshotFrozenAfterQueuedTransition,
  canNarrativeContainDataBindings,
  canPerAuthorNarrativeContent,
  isReadinessCheckPassing,
  isStructuralChange,
  doesStructuralChangeRequirePeReApproval,
  shouldEscalateStalenessWorkItem,
  // Types (compile-time checks)
  type IDraftState,
  type IStalenessCheck,
  type INarrativeEdit,
  type ISnapshotFreezeRecord,
  type IRefreshRecord,
  type IReadinessCheckRecord,
  type IStructuralChangeRecord,
  type IDraftStalenessWorkQueueItem,
} from '../index.js';

// -- Helpers ------------------------------------------------------------------

const daysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

// =============================================================================
// Contract stability
// =============================================================================

describe('P3-E9-T03 reports draft-model — contract stability', () => {
  // -- Enum array lengths -----------------------------------------------------

  it('locks DRAFT_CONFIRMATION_STATUSES to 4 entries', () => {
    expect(DRAFT_CONFIRMATION_STATUSES).toHaveLength(4);
  });

  it('locks STALENESS_LEVELS to 4 entries', () => {
    expect(STALENESS_LEVELS).toHaveLength(4);
  });

  it('locks REFRESH_ACTIONS to 2 entries', () => {
    expect(REFRESH_ACTIONS).toHaveLength(2);
  });

  it('locks NARRATIVE_EDIT_ACTIONS to 3 entries', () => {
    expect(NARRATIVE_EDIT_ACTIONS).toHaveLength(3);
  });

  it('locks SNAPSHOT_FREEZE_STATUSES to 3 entries', () => {
    expect(SNAPSHOT_FREEZE_STATUSES).toHaveLength(3);
  });

  it('locks READINESS_CHECK_RESULTS to 3 entries', () => {
    expect(READINESS_CHECK_RESULTS).toHaveLength(3);
  });

  it('locks STRUCTURAL_CHANGE_CLASSIFICATIONS to 2 entries', () => {
    expect(STRUCTURAL_CHANGE_CLASSIFICATIONS).toHaveLength(2);
  });

  it('locks DRAFT_STALENESS_WORK_QUEUE_PRIORITIES to 2 entries', () => {
    expect(DRAFT_STALENESS_WORK_QUEUE_PRIORITIES).toHaveLength(2);
  });

  // -- Label map key counts ---------------------------------------------------

  it('STALENESS_LEVEL_LABELS covers all 4 levels', () => {
    expect(Object.keys(STALENESS_LEVEL_LABELS)).toHaveLength(4);
  });

  it('DRAFT_CONFIRMATION_STATUS_LABELS covers all 4 statuses', () => {
    expect(Object.keys(DRAFT_CONFIRMATION_STATUS_LABELS)).toHaveLength(4);
  });

  it('READINESS_CHECK_RESULT_LABELS covers all 3 results', () => {
    expect(Object.keys(READINESS_CHECK_RESULT_LABELS)).toHaveLength(3);
  });

  // -- Scalar constants -------------------------------------------------------

  it('STALENESS_THRESHOLD_DEFAULT_DAYS is 7', () => {
    expect(STALENESS_THRESHOLD_DEFAULT_DAYS).toBe(7);
  });

  it('STALENESS_ESCALATION_MULTIPLIER is 2', () => {
    expect(STALENESS_ESCALATION_MULTIPLIER).toBe(2);
  });

  // -- Reference arrays -------------------------------------------------------

  it('STRUCTURAL_CHANGE_EXAMPLES has 5 entries', () => {
    expect(STRUCTURAL_CHANGE_EXAMPLES).toHaveLength(5);
  });

  it('NON_STRUCTURAL_CHANGE_EXAMPLES has 5 entries', () => {
    expect(NON_STRUCTURAL_CHANGE_EXAMPLES).toHaveLength(5);
  });

  it('READINESS_CHECK_REQUIREMENTS has 4 entries', () => {
    expect(READINESS_CHECK_REQUIREMENTS).toHaveLength(4);
  });

  it('NARRATIVE_CONSTRAINTS has 4 entries', () => {
    expect(NARRATIVE_CONSTRAINTS).toHaveLength(4);
  });

  // -- Type compile-time checks -----------------------------------------------

  it('IDraftState type is structurally valid', () => {
    const state: IDraftState = {
      draftStateId: 'ds-1',
      projectId: 'proj-1',
      familyKey: 'PX_REVIEW',
      configVersionId: 'cv-1',
      lastRefreshedAt: '2026-01-01T00:00:00Z',
      confirmationStatus: 'NOT_CONFIRMED',
      stalenessLevel: 'FRESH',
      stalenessAcknowledgedAt: null,
      narrativeEditCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
    };
    expect(state.draftStateId).toBe('ds-1');
  });

  it('IStalenessCheck type is structurally valid', () => {
    const check: IStalenessCheck = {
      checkId: 'sc-1',
      draftStateId: 'ds-1',
      checkedAt: '2026-01-10T00:00:00Z',
      lastRefreshedAt: '2026-01-01T00:00:00Z',
      stalenessThresholdDays: 7,
      isStale: true,
      stalenessLevel: 'STALE',
    };
    expect(check.checkId).toBe('sc-1');
  });

  it('INarrativeEdit type is structurally valid', () => {
    const edit: INarrativeEdit = {
      editId: 'ne-1',
      draftStateId: 'ds-1',
      sectionKey: 'executive-summary',
      content: 'Updated narrative.',
      editedByUPN: 'pm@test.com',
      editedAt: '2026-01-05T00:00:00Z',
      previousContent: null,
    };
    expect(edit.editId).toBe('ne-1');
  });

  it('ISnapshotFreezeRecord type is structurally valid', () => {
    const record: ISnapshotFreezeRecord = {
      freezeRecordId: 'sfr-1',
      runId: 'run-1',
      draftStateId: 'ds-1',
      snapshotRefs: [],
      freezeStatus: 'PENDING',
      frozenAt: null,
      failureReason: null,
    };
    expect(record.freezeRecordId).toBe('sfr-1');
  });

  it('IRefreshRecord type is structurally valid', () => {
    const record: IRefreshRecord = {
      refreshId: 'rr-1',
      draftStateId: 'ds-1',
      refreshAction: 'MANUAL_PM',
      refreshedAt: '2026-01-05T00:00:00Z',
      refreshedByUPN: 'pm@test.com',
      sectionsRefreshed: ['schedule', 'financial'],
      narrativePreserved: true,
    };
    expect(record.refreshId).toBe('rr-1');
  });

  it('IReadinessCheckRecord type is structurally valid', () => {
    const record: IReadinessCheckRecord = {
      checkId: 'rc-1',
      draftStateId: 'ds-1',
      checkedAt: '2026-01-05T00:00:00Z',
      allSourceModulesHaveSnapshots: true,
      activeConfigExists: true,
      narrativePresentForRequiredSections: true,
      internalReviewChainComplete: true,
      overallResult: 'READY',
    };
    expect(record.checkId).toBe('rc-1');
  });
});

// =============================================================================
// Business rules
// =============================================================================

describe('P3-E9-T03 reports draft-model — business rules', () => {
  // -- isDraftStale ------------------------------------------------------------

  it('isDraftStale returns false when within threshold', () => {
    expect(isDraftStale(daysAgo(1), 7)).toBe(false);
  });

  it('isDraftStale returns true when beyond threshold', () => {
    expect(isDraftStale(daysAgo(8), 7)).toBe(true);
  });

  it('isDraftStale returns false at exactly threshold boundary', () => {
    // At exactly 7 days, daysSinceRefresh === 7 which is NOT > 7
    expect(isDraftStale(daysAgo(7), 7)).toBe(false);
  });

  // -- getStalenessLevel ------------------------------------------------------

  it('getStalenessLevel returns FRESH within 50% of threshold', () => {
    expect(getStalenessLevel(daysAgo(2), 7)).toBe('FRESH');
  });

  it('getStalenessLevel returns APPROACHING between 50%-100% of threshold', () => {
    expect(getStalenessLevel(daysAgo(5), 7)).toBe('APPROACHING');
  });

  it('getStalenessLevel returns STALE between 100%-200% of threshold', () => {
    expect(getStalenessLevel(daysAgo(10), 7)).toBe('STALE');
  });

  it('getStalenessLevel returns CRITICALLY_STALE beyond 200% of threshold', () => {
    expect(getStalenessLevel(daysAgo(15), 7)).toBe('CRITICALLY_STALE');
  });

  // -- requiresStalenessAcknowledgment ----------------------------------------

  it('requiresStalenessAcknowledgment returns true for STALE', () => {
    expect(requiresStalenessAcknowledgment('STALE')).toBe(true);
  });

  it('requiresStalenessAcknowledgment returns true for CRITICALLY_STALE', () => {
    expect(requiresStalenessAcknowledgment('CRITICALLY_STALE')).toBe(true);
  });

  it('requiresStalenessAcknowledgment returns false for FRESH', () => {
    expect(requiresStalenessAcknowledgment('FRESH')).toBe(false);
  });

  it('requiresStalenessAcknowledgment returns false for APPROACHING', () => {
    expect(requiresStalenessAcknowledgment('APPROACHING')).toBe(false);
  });

  // -- Authority rules --------------------------------------------------------

  it('canPmConfirmDraft returns true', () => {
    expect(canPmConfirmDraft()).toBe(true);
  });

  it('canPerConfirmDraft returns false', () => {
    expect(canPerConfirmDraft()).toBe(false);
  });

  it('canPerInitiateRefresh returns false', () => {
    expect(canPerInitiateRefresh()).toBe(false);
  });

  // -- Refresh rules ----------------------------------------------------------

  it('doesRefreshPreserveNarrative returns true', () => {
    expect(doesRefreshPreserveNarrative()).toBe(true);
  });

  it('doesRefreshAffectExistingRuns returns false', () => {
    expect(doesRefreshAffectExistingRuns()).toBe(false);
  });

  // -- Snapshot freeze --------------------------------------------------------

  it('isSnapshotFrozenAfterQueuedTransition returns true', () => {
    expect(isSnapshotFrozenAfterQueuedTransition()).toBe(true);
  });

  // -- Narrative rules --------------------------------------------------------

  it('canNarrativeContainDataBindings returns false', () => {
    expect(canNarrativeContainDataBindings()).toBe(false);
  });

  it('canPerAuthorNarrativeContent returns false', () => {
    expect(canPerAuthorNarrativeContent()).toBe(false);
  });

  // -- isReadinessCheckPassing ------------------------------------------------

  it('isReadinessCheckPassing returns true when all conditions met', () => {
    const check: IReadinessCheckRecord = {
      checkId: 'rc-1',
      draftStateId: 'ds-1',
      checkedAt: '2026-01-05T00:00:00Z',
      allSourceModulesHaveSnapshots: true,
      activeConfigExists: true,
      narrativePresentForRequiredSections: true,
      internalReviewChainComplete: true,
      overallResult: 'READY',
    };
    expect(isReadinessCheckPassing(check)).toBe(true);
  });

  it('isReadinessCheckPassing returns false when snapshots missing', () => {
    const check: IReadinessCheckRecord = {
      checkId: 'rc-2',
      draftStateId: 'ds-1',
      checkedAt: '2026-01-05T00:00:00Z',
      allSourceModulesHaveSnapshots: false,
      activeConfigExists: true,
      narrativePresentForRequiredSections: true,
      internalReviewChainComplete: true,
      overallResult: 'NOT_READY',
    };
    expect(isReadinessCheckPassing(check)).toBe(false);
  });

  it('isReadinessCheckPassing returns false when config missing', () => {
    const check: IReadinessCheckRecord = {
      checkId: 'rc-3',
      draftStateId: 'ds-1',
      checkedAt: '2026-01-05T00:00:00Z',
      allSourceModulesHaveSnapshots: true,
      activeConfigExists: false,
      narrativePresentForRequiredSections: true,
      internalReviewChainComplete: true,
      overallResult: 'NOT_READY',
    };
    expect(isReadinessCheckPassing(check)).toBe(false);
  });

  it('isReadinessCheckPassing returns false when narrative missing', () => {
    const check: IReadinessCheckRecord = {
      checkId: 'rc-4',
      draftStateId: 'ds-1',
      checkedAt: '2026-01-05T00:00:00Z',
      allSourceModulesHaveSnapshots: true,
      activeConfigExists: true,
      narrativePresentForRequiredSections: false,
      internalReviewChainComplete: true,
      overallResult: 'NOT_READY',
    };
    expect(isReadinessCheckPassing(check)).toBe(false);
  });

  it('isReadinessCheckPassing returns false when review chain incomplete', () => {
    const check: IReadinessCheckRecord = {
      checkId: 'rc-5',
      draftStateId: 'ds-1',
      checkedAt: '2026-01-05T00:00:00Z',
      allSourceModulesHaveSnapshots: true,
      activeConfigExists: true,
      narrativePresentForRequiredSections: true,
      internalReviewChainComplete: false,
      overallResult: 'NOT_READY',
    };
    expect(isReadinessCheckPassing(check)).toBe(false);
  });

  // -- isStructuralChange -----------------------------------------------------

  it('isStructuralChange returns true for STRUCTURAL', () => {
    expect(isStructuralChange('STRUCTURAL')).toBe(true);
  });

  it('isStructuralChange returns false for NON_STRUCTURAL', () => {
    expect(isStructuralChange('NON_STRUCTURAL')).toBe(false);
  });

  // -- doesStructuralChangeRequirePeReApproval --------------------------------

  it('doesStructuralChangeRequirePeReApproval returns true', () => {
    expect(doesStructuralChangeRequirePeReApproval()).toBe(true);
  });

  // -- shouldEscalateStalenessWorkItem ----------------------------------------

  it('shouldEscalateStalenessWorkItem returns true when at escalation threshold', () => {
    expect(shouldEscalateStalenessWorkItem(15, 7)).toBe(true);
  });

  it('shouldEscalateStalenessWorkItem returns true at exactly 2x threshold', () => {
    expect(shouldEscalateStalenessWorkItem(14, 7)).toBe(true);
  });

  it('shouldEscalateStalenessWorkItem returns false below escalation threshold', () => {
    expect(shouldEscalateStalenessWorkItem(13, 7)).toBe(false);
  });
});
