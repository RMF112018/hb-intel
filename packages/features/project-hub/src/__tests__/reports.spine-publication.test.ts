import { describe, expect, it } from 'vitest';
import {
  // Enum arrays
  REPORTS_ACTIVITY_EVENT_TYPES,
  REPORTS_ACTIVITY_CATEGORIES,
  REPORTS_ACTIVITY_SIGNIFICANCES,
  REPORTS_WORK_QUEUE_ITEM_TYPES,
  REPORTS_HEALTH_METRIC_STATUSES,
  REPORTS_RELATED_ITEM_RELATIONSHIPS,
  // Label maps
  REPORTS_ACTIVITY_EVENT_TYPE_LABELS,
  REPORTS_WORK_QUEUE_ITEM_TYPE_LABELS,
  REPORTS_HEALTH_METRIC_STATUS_LABELS,
  // Definition arrays
  REPORTS_ACTIVITY_EVENT_DEFINITIONS,
  REPORTS_HEALTH_METRIC_DEFINITION,
  REPORTS_WORK_QUEUE_ITEM_DEFINITIONS,
  REPORTS_WORK_QUEUE_DEDUPLICATION_RULES,
  REPORTS_RELATED_ITEM_DEFINITIONS,
  REPORTS_HEALTH_THRESHOLD_CONFIG,
  REPORTS_SPINE_LIFECYCLE_STEPS,
  // Business rules
  getHealthMetricStatus,
  isWorkQueueItemDuplicate,
  shouldEscalateStaleWorkItem,
  doesFailedRunEmitActivityEvent,
  doesFailedRunCreateApprovalItem,
  isRelatedItemImmutable,
  getActivityEventForRunStatus,
  getWorkQueueOwnerForItemType,
  isHealthMetricRecalculatedOnApproval,
  isHealthMetricRecalculatedOnRelease,
  getDefaultHealthThresholdDays,
  isHealthMetricThresholdConfigurable,
  // Types (compile-time checks)
  type IReportsActivityEvent,
  type IReportsHealthMetric,
  type IReportsWorkQueueItem,
  type IReportsRelatedItemEntry,
} from '../index.js';

// =============================================================================
// Contract stability
// =============================================================================

describe('P3-E9-T08 spine-publication — contract stability', () => {
  // Enum array lengths
  it('REPORTS_ACTIVITY_EVENT_TYPES has 4 members', () => {
    expect(REPORTS_ACTIVITY_EVENT_TYPES).toHaveLength(4);
  });

  it('REPORTS_ACTIVITY_CATEGORIES has 3 members', () => {
    expect(REPORTS_ACTIVITY_CATEGORIES).toHaveLength(3);
  });

  it('REPORTS_ACTIVITY_SIGNIFICANCES has 2 members', () => {
    expect(REPORTS_ACTIVITY_SIGNIFICANCES).toHaveLength(2);
  });

  it('REPORTS_WORK_QUEUE_ITEM_TYPES has 3 members', () => {
    expect(REPORTS_WORK_QUEUE_ITEM_TYPES).toHaveLength(3);
  });

  it('REPORTS_HEALTH_METRIC_STATUSES has 3 members', () => {
    expect(REPORTS_HEALTH_METRIC_STATUSES).toHaveLength(3);
  });

  it('REPORTS_RELATED_ITEM_RELATIONSHIPS has 2 members', () => {
    expect(REPORTS_RELATED_ITEM_RELATIONSHIPS).toHaveLength(2);
  });

  // Label map key counts
  it('REPORTS_ACTIVITY_EVENT_TYPE_LABELS has 4 keys', () => {
    expect(Object.keys(REPORTS_ACTIVITY_EVENT_TYPE_LABELS)).toHaveLength(4);
  });

  it('REPORTS_WORK_QUEUE_ITEM_TYPE_LABELS has 3 keys', () => {
    expect(Object.keys(REPORTS_WORK_QUEUE_ITEM_TYPE_LABELS)).toHaveLength(3);
  });

  it('REPORTS_HEALTH_METRIC_STATUS_LABELS has 3 keys', () => {
    expect(Object.keys(REPORTS_HEALTH_METRIC_STATUS_LABELS)).toHaveLength(3);
  });

  // Definition arrays
  it('REPORTS_ACTIVITY_EVENT_DEFINITIONS has 4 entries', () => {
    expect(REPORTS_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(4);
  });

  it('REPORTS_WORK_QUEUE_ITEM_DEFINITIONS has 3 entries', () => {
    expect(REPORTS_WORK_QUEUE_ITEM_DEFINITIONS).toHaveLength(3);
  });

  it('REPORTS_WORK_QUEUE_DEDUPLICATION_RULES has 3 entries with maxPerProjectFamily === 1', () => {
    expect(REPORTS_WORK_QUEUE_DEDUPLICATION_RULES).toHaveLength(3);
    for (const rule of REPORTS_WORK_QUEUE_DEDUPLICATION_RULES) {
      expect(rule.maxPerProjectFamily).toBe(1);
    }
  });

  it('REPORTS_RELATED_ITEM_DEFINITIONS has 2 entries, all isImmutable true', () => {
    expect(REPORTS_RELATED_ITEM_DEFINITIONS).toHaveLength(2);
    for (const def of REPORTS_RELATED_ITEM_DEFINITIONS) {
      expect(def.isImmutable).toBe(true);
    }
  });

  it('REPORTS_HEALTH_THRESHOLD_CONFIG.thresholdDays === 30', () => {
    expect(REPORTS_HEALTH_THRESHOLD_CONFIG.thresholdDays).toBe(30);
  });

  it('REPORTS_SPINE_LIFECYCLE_STEPS has 8 entries', () => {
    expect(REPORTS_SPINE_LIFECYCLE_STEPS).toHaveLength(8);
  });

  it('REPORTS_HEALTH_METRIC_DEFINITION.metricName === REPORT_CURRENCY', () => {
    expect(REPORTS_HEALTH_METRIC_DEFINITION.metricName).toBe('REPORT_CURRENCY');
  });

  it('REPORTS_HEALTH_METRIC_DEFINITION.dimension === OFFICE', () => {
    expect(REPORTS_HEALTH_METRIC_DEFINITION.dimension).toBe('OFFICE');
  });

  // Type checks (compile-time only — if this compiles, the types exist)
  it('type IReportsActivityEvent is assignable', () => {
    const event: IReportsActivityEvent = {
      eventId: 'e1',
      eventType: 'DRAFT_REFRESHED',
      category: 'RECORD_CHANGE',
      significance: 'ROUTINE',
      projectId: 'p1',
      familyKey: 'PX_REVIEW',
      relatedRunId: null,
      triggeredByUPN: 'user@example.com',
      triggeredAt: '2026-01-01T00:00:00Z',
      summary: 'Draft refreshed',
    };
    expect(event.eventId).toBe('e1');
  });

  it('type IReportsHealthMetric is assignable', () => {
    const metric: IReportsHealthMetric = {
      metricId: 'm1',
      projectId: 'p1',
      metricName: 'REPORT_CURRENCY',
      dimension: 'OFFICE',
      daysSinceLastApproved: 10,
      thresholdDays: 30,
      status: 'GREEN',
    };
    expect(metric.metricId).toBe('m1');
  });

  it('type IReportsWorkQueueItem is assignable', () => {
    const item: IReportsWorkQueueItem = {
      workItemId: 'w1',
      projectId: 'p1',
      familyKey: 'PX_REVIEW',
      itemType: 'REPORT_DRAFT_STALE',
      ownerRole: 'PM',
      priority: 'NORMAL',
      isEscalated: false,
      resolvedAt: null,
    };
    expect(item.workItemId).toBe('w1');
  });

  it('type IReportsRelatedItemEntry is assignable', () => {
    const entry: IReportsRelatedItemEntry = {
      entryId: 'r1',
      sourceRunId: 'run1',
      targetSnapshotId: 'snap1',
      relationship: 'REFERENCES',
      sourceModule: 'COST',
      createdAt: '2026-01-01T00:00:00Z',
    };
    expect(entry.entryId).toBe('r1');
  });
});

// =============================================================================
// Business rules
// =============================================================================

describe('P3-E9-T08 spine-publication — business rules', () => {
  // getHealthMetricStatus
  describe('getHealthMetricStatus', () => {
    it('returns GREEN for 20 days with threshold 30', () => {
      expect(getHealthMetricStatus(20, 30)).toBe('GREEN');
    });

    it('returns YELLOW for 35 days with threshold 30', () => {
      expect(getHealthMetricStatus(35, 30)).toBe('YELLOW');
    });

    it('returns RED for 50 days with threshold 30', () => {
      expect(getHealthMetricStatus(50, 30)).toBe('RED');
    });

    it('returns GREEN at boundary (30, 30)', () => {
      expect(getHealthMetricStatus(30, 30)).toBe('GREEN');
    });

    it('returns YELLOW at boundary (45, 30)', () => {
      expect(getHealthMetricStatus(45, 30)).toBe('YELLOW');
    });

    it('returns RED just past YELLOW boundary (46, 30)', () => {
      expect(getHealthMetricStatus(46, 30)).toBe('RED');
    });
  });

  // isWorkQueueItemDuplicate
  describe('isWorkQueueItemDuplicate', () => {
    it('returns true when existing has same type', () => {
      expect(isWorkQueueItemDuplicate(['REPORT_DRAFT_STALE'], 'REPORT_DRAFT_STALE')).toBe(true);
    });

    it('returns false when existing has different type', () => {
      expect(isWorkQueueItemDuplicate(['REPORT_DRAFT_STALE'], 'REPORT_APPROVAL_PENDING')).toBe(false);
    });

    it('returns false when existing is empty', () => {
      expect(isWorkQueueItemDuplicate([], 'REPORT_DRAFT_STALE')).toBe(false);
    });
  });

  // shouldEscalateStaleWorkItem
  describe('shouldEscalateStaleWorkItem', () => {
    it('returns true when days >= 2x threshold (14, 7)', () => {
      expect(shouldEscalateStaleWorkItem(14, 7)).toBe(true);
    });

    it('returns false when days < 2x threshold (13, 7)', () => {
      expect(shouldEscalateStaleWorkItem(13, 7)).toBe(false);
    });

    it('returns true when days > 2x threshold (15, 7)', () => {
      expect(shouldEscalateStaleWorkItem(15, 7)).toBe(true);
    });
  });

  // Boolean rules
  it('doesFailedRunEmitActivityEvent returns false', () => {
    expect(doesFailedRunEmitActivityEvent()).toBe(false);
  });

  it('doesFailedRunCreateApprovalItem returns false', () => {
    expect(doesFailedRunCreateApprovalItem()).toBe(false);
  });

  it('isRelatedItemImmutable returns true', () => {
    expect(isRelatedItemImmutable()).toBe(true);
  });

  // getActivityEventForRunStatus
  describe('getActivityEventForRunStatus', () => {
    it('returns APPROVED for APPROVED status', () => {
      expect(getActivityEventForRunStatus('APPROVED')).toBe('APPROVED');
    });

    it('returns RELEASED for RELEASED status', () => {
      expect(getActivityEventForRunStatus('RELEASED')).toBe('RELEASED');
    });

    it('returns null for GENERATED status', () => {
      expect(getActivityEventForRunStatus('GENERATED')).toBeNull();
    });

    it('returns null for FAILED status', () => {
      expect(getActivityEventForRunStatus('FAILED')).toBeNull();
    });
  });

  // getWorkQueueOwnerForItemType
  describe('getWorkQueueOwnerForItemType', () => {
    it('returns PM for REPORT_DRAFT_STALE', () => {
      expect(getWorkQueueOwnerForItemType('REPORT_DRAFT_STALE')).toBe('PM');
    });

    it('returns PE for REPORT_APPROVAL_PENDING', () => {
      expect(getWorkQueueOwnerForItemType('REPORT_APPROVAL_PENDING')).toBe('PE');
    });

    it('returns PM for REPORT_DISTRIBUTION_PENDING', () => {
      expect(getWorkQueueOwnerForItemType('REPORT_DISTRIBUTION_PENDING')).toBe('PM');
    });
  });

  // Remaining boolean/constant rules
  it('isHealthMetricRecalculatedOnApproval returns true', () => {
    expect(isHealthMetricRecalculatedOnApproval()).toBe(true);
  });

  it('isHealthMetricRecalculatedOnRelease returns true', () => {
    expect(isHealthMetricRecalculatedOnRelease()).toBe(true);
  });

  it('getDefaultHealthThresholdDays returns 30', () => {
    expect(getDefaultHealthThresholdDays()).toBe(30);
  });

  it('isHealthMetricThresholdConfigurable returns true', () => {
    expect(isHealthMetricThresholdConfigurable()).toBe(true);
  });
});
