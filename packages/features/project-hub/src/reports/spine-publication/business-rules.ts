/**
 * P3-E9-T08 reports spine-publication business rules.
 * Health metric, work queue deduplication, activity events, related items.
 */

import type { ReportsActivityEventType, ReportsHealthMetricStatus, ReportsWorkQueueItemType } from './enums.js';
import { REPORTS_HEALTH_METRIC_DEFINITION, REPORTS_WORK_QUEUE_ITEM_DEFINITIONS } from './constants.js';

// -- Health Metric Rules ------------------------------------------------------

/** Determine health metric status from days since last approved report. */
export const getHealthMetricStatus = (daysSinceApproved: number, threshold: number): ReportsHealthMetricStatus => {
  if (daysSinceApproved <= threshold) return 'GREEN';
  if (daysSinceApproved <= threshold * 1.5) return 'YELLOW';
  return 'RED';
};

/** Whether health metric is recalculated on approval. */
export const isHealthMetricRecalculatedOnApproval = (): true => true;

/** Whether health metric is recalculated on release. */
export const isHealthMetricRecalculatedOnRelease = (): true => true;

/** Default threshold in days for report currency health metric. */
export const getDefaultHealthThresholdDays = (): number => REPORTS_HEALTH_METRIC_DEFINITION.defaultThresholdDays;

/** Whether the health metric threshold is configurable. */
export const isHealthMetricThresholdConfigurable = (): true => true;

// -- Work Queue Rules ---------------------------------------------------------

/** Check if a work queue item of the given type already exists. */
export const isWorkQueueItemDuplicate = (
  existingItemTypes: readonly ReportsWorkQueueItemType[],
  newItemType: ReportsWorkQueueItemType,
): boolean => existingItemTypes.includes(newItemType);

/** Whether a stale work item should be escalated based on days since refresh. */
export const shouldEscalateStaleWorkItem = (daysSinceRefresh: number, threshold: number): boolean =>
  daysSinceRefresh >= threshold * 2;

/** Get the owner role for a given work queue item type. */
export const getWorkQueueOwnerForItemType = (itemType: ReportsWorkQueueItemType): string => {
  const def = REPORTS_WORK_QUEUE_ITEM_DEFINITIONS.find((d) => d.itemType === itemType);
  return def ? def.ownerRole : 'PM';
};

// -- Activity Event Rules -----------------------------------------------------

/** Failed runs do not emit activity events. */
export const doesFailedRunEmitActivityEvent = (): false => false;

/** Failed runs do not create approval work queue items. */
export const doesFailedRunCreateApprovalItem = (): false => false;

/** Get the activity event type for a given run status, or null if none. */
export const getActivityEventForRunStatus = (status: string): ReportsActivityEventType | null => {
  if (status === 'APPROVED') return 'APPROVED';
  if (status === 'RELEASED') return 'RELEASED';
  return null;
};

// -- Related Item Rules -------------------------------------------------------

/** Related item entries are always immutable. */
export const isRelatedItemImmutable = (): true => true;
