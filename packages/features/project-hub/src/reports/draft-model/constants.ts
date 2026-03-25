/**
 * P3-E9-T03 reports draft-model constants.
 * Staleness thresholds, structural change rules, readiness checks, narrative constraints.
 */

import type {
  DraftConfirmationStatus,
  DraftStalenessWorkQueuePriority,
  NarrativeEditAction,
  ReadinessCheckResult,
  RefreshAction,
  SnapshotFreezeStatus,
  StalenessLevel,
  StructuralChangeClassification,
} from './enums.js';

// -- Enum Arrays --------------------------------------------------------------

export const DRAFT_CONFIRMATION_STATUSES = [
  'NOT_CONFIRMED',
  'CONFIRMING',
  'CONFIRMED',
  'CONFIRMATION_FAILED',
] as const satisfies ReadonlyArray<DraftConfirmationStatus>;

export const STALENESS_LEVELS = [
  'FRESH',
  'APPROACHING',
  'STALE',
  'CRITICALLY_STALE',
] as const satisfies ReadonlyArray<StalenessLevel>;

export const REFRESH_ACTIONS = [
  'MANUAL_PM',
  'SCHEDULED_AUTO',
] as const satisfies ReadonlyArray<RefreshAction>;

export const NARRATIVE_EDIT_ACTIONS = [
  'CREATED',
  'UPDATED',
  'CLEARED',
] as const satisfies ReadonlyArray<NarrativeEditAction>;

export const SNAPSHOT_FREEZE_STATUSES = [
  'PENDING',
  'FROZEN',
  'FAILED',
] as const satisfies ReadonlyArray<SnapshotFreezeStatus>;

export const READINESS_CHECK_RESULTS = [
  'READY',
  'NOT_READY',
  'BLOCKED',
] as const satisfies ReadonlyArray<ReadinessCheckResult>;

export const STRUCTURAL_CHANGE_CLASSIFICATIONS = [
  'STRUCTURAL',
  'NON_STRUCTURAL',
] as const satisfies ReadonlyArray<StructuralChangeClassification>;

export const DRAFT_STALENESS_WORK_QUEUE_PRIORITIES = [
  'NORMAL',
  'HIGH',
] as const satisfies ReadonlyArray<DraftStalenessWorkQueuePriority>;

// -- Label Maps ---------------------------------------------------------------

export const STALENESS_LEVEL_LABELS: Readonly<Record<StalenessLevel, string>> = {
  FRESH: 'Fresh',
  APPROACHING: 'Approaching Stale',
  STALE: 'Stale',
  CRITICALLY_STALE: 'Critically Stale',
};

export const DRAFT_CONFIRMATION_STATUS_LABELS: Readonly<Record<DraftConfirmationStatus, string>> = {
  NOT_CONFIRMED: 'Not Confirmed',
  CONFIRMING: 'Confirming',
  CONFIRMED: 'Confirmed',
  CONFIRMATION_FAILED: 'Confirmation Failed',
};

export const READINESS_CHECK_RESULT_LABELS: Readonly<Record<ReadinessCheckResult, string>> = {
  READY: 'Ready',
  NOT_READY: 'Not Ready',
  BLOCKED: 'Blocked',
};

// -- Threshold Constants ------------------------------------------------------

export const STALENESS_THRESHOLD_DEFAULT_DAYS = 7;
export const STALENESS_ESCALATION_MULTIPLIER = 2;

// -- Structural Change Examples -----------------------------------------------

export const STRUCTURAL_CHANGE_EXAMPLES: readonly string[] = [
  'Add or remove report sections',
  'Change section content type (e.g., module-snapshot to narrative-only)',
  'Change approval class or approval gate configuration',
  'Change family type classification',
  'Modify required section flags',
];

export const NON_STRUCTURAL_CHANGE_EXAMPLES: readonly string[] = [
  'Edit PM narrative content',
  'Change release class within allowed set',
  'Reorder sections within approved schema',
  'Update narrative defaults',
  'Modify audience class selection within allowed set',
];

// -- Readiness Check Requirements ---------------------------------------------

export const READINESS_CHECK_REQUIREMENTS: readonly string[] = [
  'All required source modules have snapshots available',
  'Active configuration version exists for the family',
  'PM narrative is present for all required narrative sections',
  'Internal review chain is complete (required for PX Review only, not generation)',
];

// -- Narrative Constraints ----------------------------------------------------

export const NARRATIVE_CONSTRAINTS: readonly string[] = [
  'Plain text or governed rich text only',
  'No data bindings or formula references',
  'No dynamic content references',
  'Optional max character limits per section (governed by template)',
];
