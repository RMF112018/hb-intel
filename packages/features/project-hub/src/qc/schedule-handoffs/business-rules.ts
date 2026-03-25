/**
 * P3-E15-T10 Stage 9 Project QC Module schedule-handoffs business rules.
 */

import type {
  QualityReadinessSignal,
  BaselineVisibleSurface,
  HandoffTarget,
  HandoffContentType,
  DeferredFieldCapability,
  ScheduleAwareRecordType,
} from './enums.js';
import {
  QC_QUALITY_READINESS_SIGNALS,
  QC_BASELINE_VISIBLE_SURFACES,
  QC_DEFERRED_FIELD_CAPABILITIES,
  HANDOFF_TARGET_CONTENT_MAP,
  SCHEDULE_AWARE_RECORD_TYPE_LIST,
} from './constants.js';

// -- Schedule Reference Rules ---------------------------------------------------

/** Schedule context refs are always read-only from the QC perspective. */
export const isScheduleRefReadOnly = (): true => true;

/** QC does not own schedule data; it consumes schedule context as a reader. */
export const isQcScheduleAuthoritative = (): false => false;

/** QC cannot write schedule records. */
export const canQcWriteScheduleRecords = (): false => false;

// -- Field Execution Boundary ---------------------------------------------------

/** QC does not own field execution; that belongs to Site Controls. */
export const canQcOwnFieldExecution = (): false => false;

// -- Handoff Preservation -------------------------------------------------------

/** Handoff payloads are preserved through snapshots for traceability. */
export const isHandoffPreservedThroughSnapshot = (): true => true;

// -- Deferred Capability Check --------------------------------------------------

/** Determines if a field capability is deferred to Phase 6. */
export const isDeferredToPhase6 = (capability: DeferredFieldCapability): boolean =>
  (QC_DEFERRED_FIELD_CAPABILITIES as readonly string[]).includes(capability);

// -- Baseline Visibility Check --------------------------------------------------

/** Determines if a surface is baseline-visible in Phase 3. */
export const isBaselineVisibleInPhase3 = (surface: BaselineVisibleSurface): boolean =>
  (QC_BASELINE_VISIBLE_SURFACES as readonly string[]).includes(surface);

// -- Downstream Boundary Rules --------------------------------------------------

/** Handoff does not violate downstream module boundaries. */
export const doesHandoffViolateDownstreamBoundary = (): false => false;

/** QC does not own punch workflow; that belongs to Closeout. */
export const canQcOwnPunchWorkflow = (): false => false;

/** QC does not own commissioning; that belongs to Startup. */
export const canQcOwnCommissioning = (): false => false;

/** QC does not own warranty case execution; that belongs to Warranty. */
export const canQcOwnWarrantyCaseExecution = (): false => false;

// -- Readiness Signal Validation ------------------------------------------------

/** Validates that a readiness signal is a recognized value. */
export const isReadinessSignalValid = (signal: QualityReadinessSignal): boolean =>
  (QC_QUALITY_READINESS_SIGNALS as readonly string[]).includes(signal);

// -- Handoff Content Resolution -------------------------------------------------

/** Returns the expected content types for a given handoff target. */
export const getHandoffContentForTarget = (target: HandoffTarget): readonly HandoffContentType[] => {
  const entry = HANDOFF_TARGET_CONTENT_MAP.find((e) => e.target === target);
  return entry ? entry.expectedContentTypes : [];
};

// -- Schedule-Aware Record Check ------------------------------------------------

/** Determines if a record type participates in schedule awareness. */
export const isRecordScheduleAware = (recordType: ScheduleAwareRecordType): boolean =>
  (SCHEDULE_AWARE_RECORD_TYPE_LIST as readonly string[]).includes(recordType);

// -- Expansion Boundary ---------------------------------------------------------

/** QC cannot expand into field mobile execution; that is a Site Controls concern. */
export const canQcExpandIntoFieldMobileExecution = (): false => false;
