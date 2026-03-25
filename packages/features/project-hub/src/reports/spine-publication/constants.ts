/**
 * P3-E9-T08 reports spine-publication constants.
 * Activity events, health metric, work queue items, related items, lifecycle.
 */

import type {
  ReportsActivityCategory,
  ReportsActivityEventType,
  ReportsActivitySignificance,
  ReportsHealthMetricStatus,
  ReportsRelatedItemRelationship,
  ReportsWorkQueueItemType,
} from './enums.js';
import type {
  IReportsHealthThresholdConfig,
  IReportsSpineLifecycleStep,
  IReportsWorkQueueDeduplicationRule,
} from './types.js';

// -- Enum Arrays --------------------------------------------------------------

export const REPORTS_ACTIVITY_EVENT_TYPES = [
  'DRAFT_REFRESHED',
  'APPROVED',
  'RELEASED',
  'STALE_WARNING',
] as const satisfies ReadonlyArray<ReportsActivityEventType>;

export const REPORTS_ACTIVITY_CATEGORIES = [
  'RECORD_CHANGE',
  'APPROVAL',
  'ALERT',
] as const satisfies ReadonlyArray<ReportsActivityCategory>;

export const REPORTS_ACTIVITY_SIGNIFICANCES = [
  'ROUTINE',
  'NOTABLE',
] as const satisfies ReadonlyArray<ReportsActivitySignificance>;

export const REPORTS_WORK_QUEUE_ITEM_TYPES = [
  'REPORT_DRAFT_STALE',
  'REPORT_APPROVAL_PENDING',
  'REPORT_DISTRIBUTION_PENDING',
] as const satisfies ReadonlyArray<ReportsWorkQueueItemType>;

export const REPORTS_HEALTH_METRIC_STATUSES = [
  'GREEN',
  'YELLOW',
  'RED',
] as const satisfies ReadonlyArray<ReportsHealthMetricStatus>;

export const REPORTS_RELATED_ITEM_RELATIONSHIPS = [
  'REFERENCES',
  'GOVERNED_BY',
] as const satisfies ReadonlyArray<ReportsRelatedItemRelationship>;

// -- Label Maps ---------------------------------------------------------------

export const REPORTS_ACTIVITY_EVENT_TYPE_LABELS: Readonly<Record<ReportsActivityEventType, string>> = {
  DRAFT_REFRESHED: 'Draft Refreshed',
  APPROVED: 'Approved',
  RELEASED: 'Released',
  STALE_WARNING: 'Stale Warning',
};

export const REPORTS_WORK_QUEUE_ITEM_TYPE_LABELS: Readonly<Record<ReportsWorkQueueItemType, string>> = {
  REPORT_DRAFT_STALE: 'Report Draft Stale',
  REPORT_APPROVAL_PENDING: 'Report Approval Pending',
  REPORT_DISTRIBUTION_PENDING: 'Report Distribution Pending',
};

export const REPORTS_HEALTH_METRIC_STATUS_LABELS: Readonly<Record<ReportsHealthMetricStatus, string>> = {
  GREEN: 'Green',
  YELLOW: 'Yellow',
  RED: 'Red',
};

// -- Definition Arrays --------------------------------------------------------

export const REPORTS_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<{
  readonly eventType: ReportsActivityEventType;
  readonly category: ReportsActivityCategory;
  readonly significance: ReportsActivitySignificance;
  readonly summaryTemplate: string;
}> = [
  { eventType: 'DRAFT_REFRESHED', category: 'RECORD_CHANGE', significance: 'ROUTINE', summaryTemplate: '{familyKey} draft refreshed at {triggeredAt} by {triggeredByUPN}' },
  { eventType: 'APPROVED', category: 'APPROVAL', significance: 'NOTABLE', summaryTemplate: '{familyKey} PX Review approved at {triggeredAt} by {triggeredByUPN}' },
  { eventType: 'RELEASED', category: 'RECORD_CHANGE', significance: 'NOTABLE', summaryTemplate: '{familyKey} released for distribution at {triggeredAt} by {triggeredByUPN}' },
  { eventType: 'STALE_WARNING', category: 'ALERT', significance: 'NOTABLE', summaryTemplate: '{familyKey} draft is stale ({daysSinceRefresh} days since last refresh)' },
];

export const REPORTS_HEALTH_METRIC_DEFINITION: Readonly<{
  readonly metricName: 'REPORT_CURRENCY';
  readonly dimension: 'OFFICE';
  readonly defaultThresholdDays: number;
  readonly description: string;
}> = {
  metricName: 'REPORT_CURRENCY',
  dimension: 'OFFICE',
  defaultThresholdDays: 30,
  description: 'Days since last approved or released report (PX Review or Owner Report)',
};

export const REPORTS_WORK_QUEUE_ITEM_DEFINITIONS: ReadonlyArray<{
  readonly itemType: ReportsWorkQueueItemType;
  readonly ownerRole: string;
  readonly defaultPriority: string;
  readonly escalationRule: string;
  readonly resolvesWhen: string;
}> = [
  { itemType: 'REPORT_DRAFT_STALE', ownerRole: 'PM', defaultPriority: 'NORMAL', escalationRule: 'Escalates to HIGH at 2x staleness threshold', resolvesWhen: 'Draft refreshed' },
  { itemType: 'REPORT_APPROVAL_PENDING', ownerRole: 'PE', defaultPriority: 'HIGH', escalationRule: 'No escalation — already HIGH', resolvesWhen: 'PE approves run' },
  { itemType: 'REPORT_DISTRIBUTION_PENDING', ownerRole: 'PM', defaultPriority: 'HIGH', escalationRule: 'No escalation — already HIGH', resolvesWhen: 'Distribution confirmation received' },
];

export const REPORTS_WORK_QUEUE_DEDUPLICATION_RULES: ReadonlyArray<IReportsWorkQueueDeduplicationRule> = [
  { itemType: 'REPORT_DRAFT_STALE', maxPerProjectFamily: 1, description: 'At most one stale-draft item per project-family' },
  { itemType: 'REPORT_APPROVAL_PENDING', maxPerProjectFamily: 1, description: 'At most one approval-pending item per project-family' },
  { itemType: 'REPORT_DISTRIBUTION_PENDING', maxPerProjectFamily: 1, description: 'At most one distribution-pending item per project-family' },
];

export const REPORTS_RELATED_ITEM_DEFINITIONS: ReadonlyArray<{
  readonly relationship: ReportsRelatedItemRelationship;
  readonly description: string;
  readonly isImmutable: boolean;
}> = [
  { relationship: 'REFERENCES', description: 'Report run references module snapshot (provenance)', isImmutable: true },
  { relationship: 'GOVERNED_BY', description: 'PX Review run governed by internal review chain', isImmutable: true },
];

export const REPORTS_HEALTH_THRESHOLD_CONFIG: Readonly<IReportsHealthThresholdConfig> = {
  thresholdDays: 30,
  greenMax: 30,
  yellowMax: 45,
  isConfigurable: true,
};

export const REPORTS_SPINE_LIFECYCLE_STEPS: ReadonlyArray<IReportsSpineLifecycleStep> = [
  { stepOrder: 1, trigger: 'PM refreshes draft', spineEvent: 'DRAFT_REFRESHED', workQueueAction: null, description: 'Draft refreshed with live module data' },
  { stepOrder: 2, trigger: 'PM confirms draft and queues generation', spineEvent: null, workQueueAction: null, description: 'Snapshots frozen, run record created' },
  { stepOrder: 3, trigger: 'Generation completes', spineEvent: null, workQueueAction: 'Create REPORT_APPROVAL_PENDING (PX Review only)', description: 'Run status transitions to GENERATED' },
  { stepOrder: 4, trigger: 'Staleness exceeds 2x threshold', spineEvent: 'STALE_WARNING', workQueueAction: 'Create REPORT_DRAFT_STALE', description: 'PM alerted to refresh draft' },
  { stepOrder: 5, trigger: 'PE approves PX Review run', spineEvent: 'APPROVED', workQueueAction: 'Resolve REPORT_APPROVAL_PENDING', description: 'Run transitions to APPROVED' },
  { stepOrder: 6, trigger: 'Run released for distribution', spineEvent: 'RELEASED', workQueueAction: 'Create REPORT_DISTRIBUTION_PENDING', description: 'Artifact available for distribution' },
  { stepOrder: 7, trigger: 'Distribution confirmed', spineEvent: null, workQueueAction: 'Resolve REPORT_DISTRIBUTION_PENDING', description: 'Distribution cycle complete' },
  { stepOrder: 8, trigger: 'Health metric recalculated', spineEvent: null, workQueueAction: null, description: 'Report Currency metric updated post-approval/release' },
];
