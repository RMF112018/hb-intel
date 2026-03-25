/**
 * P3-E14-T10 Stage 8 Project Warranty Module reports-publication business rules.
 */

import type { WarrantyWorkQueuePriority, WarrantyWorkQueueRuleId } from './enums.js';
import { WARRANTY_WORK_QUEUE_RULE_DEFINITIONS } from './constants.js';

/** Activity events are fire-and-observe per T09 §3.3. Always returns true. */
export const isWarrantyActivityEventFireAndObserve = (): true => true;

/** Downstream consumers may not write to Warranty records per T09 §8. Always returns true. */
export const isWarrantyDownstreamWriteProhibited = (): true => true;

/** Health metrics must come from the adapter per T09 §4.1. Always returns true. */
export const isWarrantyHealthMetricFromAdapter = (): true => true;

/** Telemetry is non-blocking per T09 §7.7. Always returns true. */
export const isWarrantyTelemetryNonBlocking = (): true => true;

/** Returns the priority for a Work Queue rule per T09 §5.2. */
export const getWarrantyWorkQueueRulePriority = (
  ruleId: WarrantyWorkQueueRuleId,
): WarrantyWorkQueuePriority | undefined =>
  WARRANTY_WORK_QUEUE_RULE_DEFINITIONS.find((r) => r.ruleId === ruleId)?.priority;

/** Returns true if the Work Queue rule is dismissible per T09 §5.2. */
export const isWarrantyWorkQueueRuleDismissible = (
  ruleId: WarrantyWorkQueueRuleId,
): boolean =>
  WARRANTY_WORK_QUEUE_RULE_DEFINITIONS.find((r) => r.ruleId === ruleId)?.dismissible ?? false;
