/**
 * P3-E9-T08 reports spine-publication TypeScript contracts.
 */

import type {
  ReportsActivityCategory,
  ReportsActivityEventType,
  ReportsActivitySignificance,
  ReportsHealthMetricStatus,
  ReportsRelatedItemRelationship,
  ReportsWorkQueueItemType,
} from './enums.js';

// -- Activity Event -----------------------------------------------------------

/** A single activity event emitted by the Reports module spine. */
export interface IReportsActivityEvent {
  readonly eventId: string;
  readonly eventType: ReportsActivityEventType;
  readonly category: ReportsActivityCategory;
  readonly significance: ReportsActivitySignificance;
  readonly projectId: string;
  readonly familyKey: string;
  readonly relatedRunId: string | null;
  readonly triggeredByUPN: string;
  readonly triggeredAt: string;
  readonly summary: string;
}

// -- Health Metric ------------------------------------------------------------

/** Health metric tracking report currency for a project. */
export interface IReportsHealthMetric {
  readonly metricId: string;
  readonly projectId: string;
  readonly metricName: 'REPORT_CURRENCY';
  readonly dimension: 'OFFICE';
  readonly daysSinceLastApproved: number;
  readonly thresholdDays: number;
  readonly status: ReportsHealthMetricStatus;
}

// -- Work Queue Item ----------------------------------------------------------

/** A work queue item produced by the Reports module. */
export interface IReportsWorkQueueItem {
  readonly workItemId: string;
  readonly projectId: string;
  readonly familyKey: string;
  readonly itemType: ReportsWorkQueueItemType;
  readonly ownerRole: string;
  readonly priority: string;
  readonly isEscalated: boolean;
  readonly resolvedAt: string | null;
}

// -- Related Item Entry -------------------------------------------------------

/** A related item entry linking a report run to a module snapshot. */
export interface IReportsRelatedItemEntry {
  readonly entryId: string;
  readonly sourceRunId: string;
  readonly targetSnapshotId: string;
  readonly relationship: ReportsRelatedItemRelationship;
  readonly sourceModule: string;
  readonly createdAt: string;
}

// -- Work Queue Deduplication Rule --------------------------------------------

/** Rule governing deduplication of work queue items per project-family. */
export interface IReportsWorkQueueDeduplicationRule {
  readonly itemType: ReportsWorkQueueItemType;
  readonly maxPerProjectFamily: number;
  readonly description: string;
}

// -- Health Threshold Config --------------------------------------------------

/** Configuration for report currency health metric thresholds. */
export interface IReportsHealthThresholdConfig {
  readonly thresholdDays: number;
  readonly greenMax: number;
  readonly yellowMax: number;
  readonly isConfigurable: boolean;
}

// -- Spine Lifecycle Step -----------------------------------------------------

/** A step in the Reports spine lifecycle sequence. */
export interface IReportsSpineLifecycleStep {
  readonly stepOrder: number;
  readonly trigger: string;
  readonly spineEvent: string | null;
  readonly workQueueAction: string | null;
  readonly description: string;
}
