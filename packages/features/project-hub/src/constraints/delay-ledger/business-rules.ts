/**
 * P3-E6-T03 Delay Ledger business rules.
 * Pure functions implementing D-01 through D-07 and evidence gate validators.
 */

import type { DelayStatus } from './enums.js';
import type {
  IDelayImmutabilityResult,
  IDelayRecord,
  IGateCheckResult,
  IScheduleReferenceValidation,
} from './types.js';
import { DELAY_IMMUTABLE_FIELDS, DEFAULT_NOTIFICATION_THRESHOLD_DAYS, TERMINAL_DELAY_STATUSES } from './constants.js';

/**
 * Generate a delay number in DEL-### format.
 * Pads the sequence number to at least 3 digits.
 */
export const generateDelayNumber = (sequenceNumber: number): string =>
  `DEL-${String(sequenceNumber).padStart(3, '0')}`;

/**
 * D-02: Validate notification date integrity.
 * notificationDate must be ≥ delayStartDate.
 */
export const validateNotificationDateIntegrity = (
  notificationDate: string,
  delayStartDate: string,
): boolean => notificationDate >= delayStartDate;

/**
 * D-03: Validate schedule reference consistency.
 * Integrated mode requires scheduleVersionId.
 * ManualFallback mode requires impactedActivityFreeText or impactedPathDescription.
 */
export const validateScheduleReferenceConsistency = (
  record: Pick<IDelayRecord, 'scheduleReferenceMode' | 'scheduleVersionId' | 'impactedActivityFreeText' | 'impactedPathDescription'>,
): IScheduleReferenceValidation => {
  const errors: string[] = [];

  if (record.scheduleReferenceMode === 'Integrated' && !record.scheduleVersionId) {
    errors.push('Integrated schedule reference mode requires scheduleVersionId.');
  }

  if (
    record.scheduleReferenceMode === 'ManualFallback' &&
    record.impactedActivityFreeText.length === 0 &&
    (!record.impactedPathDescription || record.impactedPathDescription.length < 50)
  ) {
    errors.push(
      'ManualFallback mode requires impactedActivityFreeText entries or impactedPathDescription (min 50 chars).',
    );
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Check whether a delay has a pending notification past the threshold.
 * Open delay without notificationDate and delayStartDate older than threshold days.
 */
export const isDelayNotificationPending = (
  record: Pick<IDelayRecord, 'notificationDate' | 'delayStartDate' | 'status'>,
  today: string,
  thresholdDays: number = DEFAULT_NOTIFICATION_THRESHOLD_DAYS,
): boolean => {
  if ((TERMINAL_DELAY_STATUSES as readonly DelayStatus[]).includes(record.status)) {
    return false;
  }
  if (record.notificationDate) {
    return false;
  }
  const start = new Date(record.delayStartDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > thresholdDays;
};

/**
 * D-04 / Quantified evidence gate check.
 * Returns whether all Quantified preconditions are met.
 */
export const isQuantifiedGateMet = (
  record: Pick<IDelayRecord, 'timeImpact' | 'commercialImpact' | 'criticalPathImpact'>,
): IGateCheckResult => {
  const unmetConditions: string[] = [];

  if (!record.timeImpact) {
    unmetConditions.push('timeImpact record is required.');
  } else {
    if (!record.timeImpact.estimatedCalendarDays || record.timeImpact.estimatedCalendarDays <= 0) {
      unmetConditions.push('timeImpact.estimatedCalendarDays must be a positive integer.');
    }
    if (!record.timeImpact.analysisMethod) {
      unmetConditions.push('timeImpact.analysisMethod is required.');
    }
    if (!record.timeImpact.analysisBasis || record.timeImpact.analysisBasis.length < 100) {
      unmetConditions.push('timeImpact.analysisBasis is required (min 100 characters).');
    }
  }

  if (!record.commercialImpact || !record.commercialImpact.separationConfirmed) {
    unmetConditions.push('commercialImpact.separationConfirmed must be true (D-04).');
  }

  if (!record.criticalPathImpact || record.criticalPathImpact === 'UNKNOWN') {
    unmetConditions.push('criticalPathImpact must be set to a value other than UNKNOWN.');
  }

  return { met: unmetConditions.length === 0, unmetConditions };
};

/**
 * Dispositioned evidence gate check.
 * Returns whether all Dispositioned preconditions are met.
 */
export const isDispositionedGateMet = (
  record: Pick<IDelayRecord, 'dispositionOutcome' | 'dispositionNotes' | 'notificationDate'>,
): IGateCheckResult => {
  const unmetConditions: string[] = [];

  if (!record.dispositionOutcome) {
    unmetConditions.push('dispositionOutcome is required.');
  }

  if (!record.dispositionNotes || record.dispositionNotes.length === 0) {
    unmetConditions.push('dispositionNotes is required (non-empty).');
  }

  if (!record.notificationDate) {
    unmetConditions.push('notificationDate must be populated before disposition.');
  }

  return { met: unmetConditions.length === 0, unmetConditions };
};

/**
 * Validate that immutable fields have not been changed.
 */
export const validateDelayRecordImmutability = (
  original: IDelayRecord,
  updated: Partial<IDelayRecord>,
): IDelayImmutabilityResult => {
  const violations: string[] = [];

  for (const field of DELAY_IMMUTABLE_FIELDS) {
    if (field in updated && updated[field as keyof IDelayRecord] !== original[field as keyof IDelayRecord]) {
      violations.push(`Field '${field}' is immutable and cannot be changed after creation.`);
    }
  }

  return { valid: violations.length === 0, violations };
};
