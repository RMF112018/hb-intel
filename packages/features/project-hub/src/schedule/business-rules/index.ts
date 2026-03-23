import {
  DEFAULT_COMMITMENT_APPROVAL_THRESHOLDS,
  DEFAULT_HOURS_PER_DAY,
  FIELD_SUMMARY_INDEX,
} from '../constants/index.js';
import type {
  CommitmentType,
  IAutoPublishCriteria,
  IFieldSummaryEntry,
  ScheduleAuthorityLayer,
} from '../types/index.js';

/**
 * P3-E5-T10 business rules domain logic.
 * Pure, deterministic, no external dependencies beyond types.
 */

// ── §21.1 Commitment Approval Threshold ──────────────────────────────

/**
 * Get the governed approval threshold for a commitment type (§21.1).
 * Returns the default threshold; governed overrides applied at runtime.
 */
export const getApprovalThresholdForType = (
  type: CommitmentType,
): number => {
  const entry = DEFAULT_COMMITMENT_APPROVAL_THRESHOLDS.find(
    (t) => t.commitmentType === type,
  );
  return entry?.thresholdDays ?? 5;
};

// ── §21.2 Duration Conversion ────────────────────────────────────────

/**
 * Convert hours to working days (§21.2).
 * Default 8 hours per day from applicable CalendarRule.
 */
export const convertHoursToDays = (
  hours: number,
  hoursPerDay: number = DEFAULT_HOURS_PER_DAY,
): number => {
  if (hoursPerDay <= 0) return 0;
  return Math.round((hours / hoursPerDay) * 100) / 100;
};

/**
 * Convert working days to hours (§21.2).
 */
export const convertDaysToHours = (
  days: number,
  hoursPerDay: number = DEFAULT_HOURS_PER_DAY,
): number => {
  return days * hoursPerDay;
};

// ── §21.3 Auto-Publish Eligibility ───────────────────────────────────

/**
 * Evaluate whether all auto-publish criteria are satisfied (§21.3).
 * All 6 conditions must be true for auto-publish to be permitted.
 */
export const evaluateAutoPublishEligibility = (
  criteria: IAutoPublishCriteria,
): boolean => {
  return (
    criteria.noHardPublishBlockers &&
    criteria.overallStatusOnTrackOrAtRisk &&
    criteria.confidenceLabelHighOrModerate &&
    criteria.noConflictRequiresReviewMilestones &&
    criteria.sourceWithinFreshnessWindow &&
    criteria.lifecycleTransitionValid
  );
};

// ── §21.4 Variance Sign Convention ───────────────────────────────────

/**
 * Apply variance sign convention (§21.4).
 * Positive = behind schedule (unfavorable). Negative = ahead (favorable).
 */
export const applyVarianceSignConvention = (
  forecastDate: string,
  baselineDate: string,
): number => {
  const forecast = new Date(forecastDate);
  const baseline = new Date(baselineDate);
  return Math.round((forecast.getTime() - baseline.getTime()) / (1000 * 60 * 60 * 24));
};

// ── §21.6 Staleness Detection ────────────────────────────────────────

/**
 * Calculate days since last active import (§21.6).
 */
export const calculateDaysSinceLastImport = (
  activatedAt: string,
  today: string,
): number => {
  const activated = new Date(activatedAt);
  const now = new Date(today);
  return Math.round((now.getTime() - activated.getTime()) / (1000 * 60 * 60 * 24));
};

// ── §21.7 Delete Flag Handling ───────────────────────────────────────

/**
 * Check if an activity is delete-flagged from source (§21.7).
 * Delete-flagged activities are ingested but excluded from UI and milestone auto-detection.
 */
export const isActivityDeleteFlagged = (deleteFlag: boolean): boolean => {
  return deleteFlag;
};

// ── §28 Field Summary Lookups ────────────────────────────────────────

/**
 * Look up the field summary entry for a record type (§28).
 */
export const getFieldSummaryForRecord = (
  recordType: string,
): IFieldSummaryEntry | undefined => {
  return FIELD_SUMMARY_INDEX.find((e) => e.recordType === recordType);
};

/**
 * Get the authority layer for a record type (§28).
 */
export const getAuthorityLayerForRecord = (
  recordType: string,
): ScheduleAuthorityLayer | undefined => {
  return FIELD_SUMMARY_INDEX.find((e) => e.recordType === recordType)?.authorityLayer;
};
