import { describe, expect, it } from 'vitest';

import {
  INTEGRATION_SCOPE,
  CONSTRAINTS_ACTIVITY_EVENT_TYPES,
  CONSTRAINTS_HANDOFF_TYPES,
  CONSTRAINTS_NOTIFICATION_TYPES,
  CONSTRAINTS_WORK_ITEM_TYPES,
  CONSTRAINTS_WORK_QUEUE_ITEM_TYPES,
  CONSTRAINTS_HEALTH_METRIC_NAMES,
  CONSTRAINTS_REPORT_TYPES,
  SHARED_PACKAGE_INTEGRATIONS,
  CONSTRAINTS_HANDOFF_CONFIGS,
  CONSTRAINTS_NOTIFICATION_CONFIGS,
  CONSTRAINTS_WORK_ITEM_CONFIGS,
  CONSTRAINTS_ACTIVITY_EVENT_CONFIGS,
  CONSTRAINTS_HEALTH_METRIC_CONFIGS,
  CONSTRAINTS_WORK_QUEUE_CONFIGS,
  CONSTRAINTS_REPORT_CONFIGS,
} from '../../index.js';

describe('P3-E6-T07 contract stability', () => {
  it('INTEGRATION_SCOPE is "constraints/integration"', () => {
    expect(INTEGRATION_SCOPE).toBe('constraints/integration');
  });

  it('locks CONSTRAINTS_ACTIVITY_EVENT_TYPES to exactly 14 values', () => {
    expect(CONSTRAINTS_ACTIVITY_EVENT_TYPES).toHaveLength(14);
  });

  it('locks CONSTRAINTS_HANDOFF_TYPES to exactly 5 values', () => {
    expect(CONSTRAINTS_HANDOFF_TYPES).toHaveLength(5);
  });

  it('locks CONSTRAINTS_NOTIFICATION_TYPES to exactly 8 values', () => {
    expect(CONSTRAINTS_NOTIFICATION_TYPES).toHaveLength(8);
  });

  it('locks CONSTRAINTS_WORK_ITEM_TYPES to exactly 9 values', () => {
    expect(CONSTRAINTS_WORK_ITEM_TYPES).toHaveLength(9);
  });

  it('locks CONSTRAINTS_WORK_QUEUE_ITEM_TYPES to exactly 7 values', () => {
    expect(CONSTRAINTS_WORK_QUEUE_ITEM_TYPES).toHaveLength(7);
  });

  it('locks CONSTRAINTS_HEALTH_METRIC_NAMES to exactly 11 values', () => {
    expect(CONSTRAINTS_HEALTH_METRIC_NAMES).toHaveLength(11);
  });

  it('locks CONSTRAINTS_REPORT_TYPES to exactly 6 values', () => {
    expect(CONSTRAINTS_REPORT_TYPES).toHaveLength(6);
  });

  it('SHARED_PACKAGE_INTEGRATIONS has exactly 11 entries', () => {
    expect(SHARED_PACKAGE_INTEGRATIONS).toHaveLength(11);
  });

  it('CONSTRAINTS_HANDOFF_CONFIGS has exactly 5 entries matching enum', () => {
    expect(CONSTRAINTS_HANDOFF_CONFIGS).toHaveLength(5);
    for (const type of CONSTRAINTS_HANDOFF_TYPES) {
      expect(CONSTRAINTS_HANDOFF_CONFIGS.find((c) => c.handoffType === type)).toBeTruthy();
    }
  });

  it('CONSTRAINTS_NOTIFICATION_CONFIGS has exactly 8 entries matching enum', () => {
    expect(CONSTRAINTS_NOTIFICATION_CONFIGS).toHaveLength(8);
    for (const type of CONSTRAINTS_NOTIFICATION_TYPES) {
      expect(CONSTRAINTS_NOTIFICATION_CONFIGS.find((c) => c.notificationType === type)).toBeTruthy();
    }
  });

  it('CONSTRAINTS_WORK_ITEM_CONFIGS has exactly 9 entries matching enum', () => {
    expect(CONSTRAINTS_WORK_ITEM_CONFIGS).toHaveLength(9);
    for (const type of CONSTRAINTS_WORK_ITEM_TYPES) {
      expect(CONSTRAINTS_WORK_ITEM_CONFIGS.find((c) => c.workItemType === type)).toBeTruthy();
    }
  });

  it('CONSTRAINTS_ACTIVITY_EVENT_CONFIGS has exactly 14 entries matching enum', () => {
    expect(CONSTRAINTS_ACTIVITY_EVENT_CONFIGS).toHaveLength(14);
    for (const type of CONSTRAINTS_ACTIVITY_EVENT_TYPES) {
      expect(CONSTRAINTS_ACTIVITY_EVENT_CONFIGS.find((c) => c.eventType === type)).toBeTruthy();
    }
  });

  it('each activity event config has non-empty payloadFields', () => {
    for (const config of CONSTRAINTS_ACTIVITY_EVENT_CONFIGS) {
      expect(config.payloadFields.length).toBeGreaterThan(0);
    }
  });

  it('CONSTRAINTS_HEALTH_METRIC_CONFIGS has exactly 11 entries matching enum', () => {
    expect(CONSTRAINTS_HEALTH_METRIC_CONFIGS).toHaveLength(11);
    for (const name of CONSTRAINTS_HEALTH_METRIC_NAMES) {
      expect(CONSTRAINTS_HEALTH_METRIC_CONFIGS.find((c) => c.metricName === name)).toBeTruthy();
    }
  });

  it('CONSTRAINTS_WORK_QUEUE_CONFIGS has exactly 7 entries', () => {
    expect(CONSTRAINTS_WORK_QUEUE_CONFIGS).toHaveLength(7);
  });

  it('CONSTRAINTS_REPORT_CONFIGS has exactly 6 entries matching enum', () => {
    expect(CONSTRAINTS_REPORT_CONFIGS).toHaveLength(6);
    for (const type of CONSTRAINTS_REPORT_TYPES) {
      expect(CONSTRAINTS_REPORT_CONFIGS.find((c) => c.reportType === type)).toBeTruthy();
    }
  });

  it('ReviewPackageExport uses Published state source', () => {
    const rpExport = CONSTRAINTS_REPORT_CONFIGS.find((c) => c.reportType === 'ReviewPackageExport');
    expect(rpExport?.stateSource).toBe('Published');
  });

  it('all shared package integrations have required fields', () => {
    for (const pkg of SHARED_PACKAGE_INTEGRATIONS) {
      expect(pkg.packageName).toBeTruthy();
      expect(pkg.integrationPoint).toBeTruthy();
      expect(pkg.stateMode).toBeTruthy();
    }
  });
});
