import { describe, expect, it } from 'vitest';
import {
  getProjectionConfig,
  validateProjectionConfig,
} from '../my-projects-projection/projection-config.js';

const SECRET_SENTINEL = 'THIS-SECRET-MUST-NOT-LEAK';

function makeEnabledEnv(
  overrides: Record<string, string | undefined> = {},
): (key: string) => string | undefined {
  const base: Record<string, string> = {
    HBC_MY_PROJECTS_PROJECTION_ENABLED: 'true',
    HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE: 'legacy',
    HBC_MY_PROJECTS_PROJECTION_VERSION: 'v1',
    HBC_MY_PROJECTS_PROJECTION_MAX_FRESHNESS_MINUTES: '5',
    HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL:
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    HBC_MY_PROJECTS_PROJECTION_REGISTRY_SITE_URL:
      'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
    HBC_MY_PROJECTS_PROJECTION_REGISTRY_LIST_TITLE: 'My Projects Registry',
    HBC_MY_PROJECTS_PROJECTION_PROJECTS_LIST_TITLE: 'Projects',
    HBC_MY_PROJECTS_PROJECTION_LEGACY_REGISTRY_LIST_TITLE: 'Legacy Project Fallback Registry',
    HBC_MY_PROJECTS_PROJECTION_NOTIFICATION_URL:
      'https://func-hbintel-staging.azurewebsites.net/api/webhooks/my-projects-projection/graph',
    HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE: SECRET_SENTINEL,
    HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_EXPIRATION_DAYS: '27',
    HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEW_THRESHOLD_DAYS: '7',
    HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_ENABLED: 'true',
    HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE: '0 15 2 * * *',
    HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_ENABLED: 'true',
    HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_SCHEDULE: '0 */1 * * * *',
    HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_MAX_ATTEMPTS: '5',
    HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_CLAIM_LEASE_MINUTES: '10',
    HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME: 'my-projects-projection-sync',
    HBC_MY_PROJECTS_PROJECTION_DEBOUNCE_WINDOW_SECONDS: '60',
    HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTIONS_TABLE: 'MyProjectsProjectionSubscriptions',
    HBC_MY_PROJECTS_PROJECTION_DELTA_STATE_TABLE: 'MyProjectsProjectionDeltaState',
    HBC_MY_PROJECTS_PROJECTION_LEASES_TABLE: 'MyProjectsProjectionLeases',
    HBC_MY_PROJECTS_PROJECTION_RUNS_TABLE: 'MyProjectsProjectionRuns',
    HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_ENABLED: 'true',
    HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_TIMER_SCHEDULE: '0 30 3 * * *',
    HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED: 'false',
    HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_TIMER_SCHEDULE: '0 0 4 * * 0',
    HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_ENABLED: 'true',
    HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_TIMER_SCHEDULE: '0 0 5 1 * *',
    HBC_MY_PROJECTS_PROJECTION_REGISTRY_INACTIVE_RETENTION_DAYS: '90',
    HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_SUCCESS_RETENTION_DAYS: '30',
    HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_FAILURE_RETENTION_DAYS: '90',
    HBC_MY_PROJECTS_PROJECTION_RUN_RETENTION_DAYS: '180',
    HBC_MY_PROJECTS_PROJECTION_RESOLVED_FAILURE_RETENTION_DAYS: '180',
    HBC_MY_PROJECTS_PROJECTION_SYNC_LEASE_MINUTES: '10',
    HBC_MY_PROJECTS_PROJECTION_REBUILD_LEASE_MINUTES: '60',
    HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_LEASE_MINUTES: '60',
    HBC_MY_PROJECTS_PROJECTION_PURGE_LEASE_MINUTES: '30',
    HBC_MY_PROJECTS_PROJECTION_MAX_DELTA_PAGES_PER_RUN: '100',
  };
  const merged: Record<string, string | undefined> = { ...base, ...overrides };
  return (key: string) => merged[key];
}

describe('validateProjectionConfig', () => {
  it('accepts a fully-populated enabled configuration', () => {
    const result = validateProjectionConfig(makeEnabledEnv());
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it.each([
    'HBC_MY_PROJECTS_PROJECTION_ENABLED',
    'HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE',
    'HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL',
    'HBC_MY_PROJECTS_PROJECTION_REGISTRY_SITE_URL',
    'HBC_MY_PROJECTS_PROJECTION_NOTIFICATION_URL',
    'HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE',
    'HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_ENABLED',
    'HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_SCHEDULE',
    'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE',
    'HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_TIMER_SCHEDULE',
    'HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_TIMER_SCHEDULE',
    'HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_TIMER_SCHEDULE',
    'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_ENABLED',
    'HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_ENABLED',
    'HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED',
    'HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_ENABLED',
  ])('reports %s as missing when absent', (key) => {
    const result = validateProjectionConfig(makeEnabledEnv({ [key]: undefined }));
    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) => issue.key === key && issue.code === 'missing-required'),
    ).toBe(true);
  });

  it('rejects non-https URLs', () => {
    const result = validateProjectionConfig(
      makeEnabledEnv({ HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL: 'http://example.com' }),
    );
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) =>
          issue.key === 'HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL' &&
          issue.code === 'invalid-url',
      ),
    ).toBe(true);
  });

  it('rejects non-boolean enablement values', () => {
    const result = validateProjectionConfig(
      makeEnabledEnv({ HBC_MY_PROJECTS_PROJECTION_ENABLED: 'maybe' }),
    );
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) =>
          issue.key === 'HBC_MY_PROJECTS_PROJECTION_ENABLED' && issue.code === 'invalid-boolean',
      ),
    ).toBe(true);
  });

  it('rejects an unknown read mode', () => {
    const result = validateProjectionConfig(
      makeEnabledEnv({ HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE: 'mixed' }),
    );
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) =>
          issue.key === 'HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE' &&
          issue.code === 'invalid-read-mode',
      ),
    ).toBe(true);
  });

  it.each([
    'HBC_MY_PROJECTS_PROJECTION_DEBOUNCE_WINDOW_SECONDS',
    'HBC_MY_PROJECTS_PROJECTION_REGISTRY_INACTIVE_RETENTION_DAYS',
    'HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_SUCCESS_RETENTION_DAYS',
    'HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_FAILURE_RETENTION_DAYS',
    'HBC_MY_PROJECTS_PROJECTION_RUN_RETENTION_DAYS',
    'HBC_MY_PROJECTS_PROJECTION_RESOLVED_FAILURE_RETENTION_DAYS',
    'HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_MAX_ATTEMPTS',
    'HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_CLAIM_LEASE_MINUTES',
    'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_EXPIRATION_DAYS',
  ])('rejects non-positive integer %s', (key) => {
    const result = validateProjectionConfig(makeEnabledEnv({ [key]: '0' }));
    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) => issue.key === key && issue.code === 'invalid-integer'),
    ).toBe(true);
  });

  it('rejects an invalid cron schedule', () => {
    const result = validateProjectionConfig(
      makeEnabledEnv({
        HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE: '0 0 * * *',
      }),
    );
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) =>
          issue.key === 'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE' &&
          issue.code === 'invalid-cron',
      ),
    ).toBe(true);
  });

  it('rejects an invalid pending-work processor timer schedule', () => {
    const result = validateProjectionConfig(
      makeEnabledEnv({
        HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_SCHEDULE: '0 0 * * *',
      }),
    );
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) =>
          issue.key === 'HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_SCHEDULE' &&
          issue.code === 'invalid-cron',
      ),
    ).toBe(true);
  });

  it('passes in disabled mode without Azure settings', () => {
    const env = (key: string): string | undefined => {
      if (key === 'HBC_MY_PROJECTS_PROJECTION_ENABLED') return 'false';
      if (key === 'HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE') return 'legacy';
      return undefined;
    };
    const result = validateProjectionConfig(env);
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });
});

describe('getProjectionConfig', () => {
  it('returns a typed config matching the locked defaults', () => {
    const config = getProjectionConfig(makeEnabledEnv());
    expect(config.enablement.enabled).toBe(true);
    expect(config.enablement.readMode).toBe('legacy');
    expect(config.enablement.projectionVersion).toBe('v1');
    expect(config.enablement.maxFreshnessMinutes).toBe(5);
    expect(config.sites.registryListTitle).toBe('My Projects Registry');
    expect(config.pendingWork.processorTimerEnabled).toBe(true);
    expect(config.pendingWork.processorTimerSchedule).toBe('0 */1 * * * *');
    expect(config.pendingWork.maxAttempts).toBe(5);
    expect(config.pendingWork.claimLeaseMinutes).toBe(10);
    expect(config.queue.queueName).toBe('my-projects-projection-sync');
    expect(config.queue.debounceWindowSeconds).toBe(60);
    expect(config.subscriptions.expirationDays).toBe(27);
    expect(config.subscriptions.renewThresholdDays).toBe(7);
    expect(config.purge.registryInactiveRetentionDays).toBe(90);
    expect(config.purge.pendingWorkSuccessRetentionDays).toBe(30);
    expect(config.purge.pendingWorkFailureRetentionDays).toBe(90);
    expect(config.purge.runRetentionDays).toBe(180);
    expect(config.purge.resolvedFailureRetentionDays).toBe(180);
    expect(config.drift.weeklyRepairEnabled).toBe(false);
    expect(config.purge.monthlyPurgeEnabled).toBe(true);
    expect(config.leases.maxDeltaPagesPerRun).toBe(100);
    expect(config.tables.subscriptionsTable).toBe('MyProjectsProjectionSubscriptions');
  });

  it('returns a disabled config without Azure settings when enablement is false', () => {
    const env = (key: string): string | undefined => {
      if (key === 'HBC_MY_PROJECTS_PROJECTION_ENABLED') return 'false';
      if (key === 'HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE') return 'legacy';
      return undefined;
    };
    const config = getProjectionConfig(env);
    expect(config.enablement.enabled).toBe(false);
    expect(config.enablement.readMode).toBe('legacy');
    expect(config.pendingWork.processorTimerEnabled).toBe(true);
    expect(config.queue.queueName).toBe('my-projects-projection-sync');
    expect(config.tables.subscriptionsTable).toBe('MyProjectsProjectionSubscriptions');
  });

  it('accepts enabled config without Service Bus/Table settings', () => {
    const config = getProjectionConfig(
      makeEnabledEnv({
        HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN: undefined,
        HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL: undefined,
      }),
    );
    expect(config.enablement.enabled).toBe(true);
    expect(config.queue.serviceBusFqdn).toBe('');
    expect(config.tables.accountUrl).toBe('');
  });

  it('throws on invalid configuration', () => {
    expect(() =>
      getProjectionConfig(
        makeEnabledEnv({ HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL: 'not-a-url' }),
      ),
    ).toThrow(/My Projects projection configuration invalid/i);
  });

  it('does not leak the client-state secret in error output', () => {
    let thrown: Error | undefined;
    try {
      getProjectionConfig(
        makeEnabledEnv({ HBC_MY_PROJECTS_PROJECTION_NOTIFICATION_URL: 'not-a-url' }),
      );
    } catch (error) {
      thrown = error as Error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown?.message ?? '').not.toContain(SECRET_SENTINEL);
  });

  it('does not embed the client-state secret value in any validation issue', () => {
    const result = validateProjectionConfig(
      makeEnabledEnv({ HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE: undefined }),
    );
    const serialized = JSON.stringify(result.issues);
    expect(serialized).not.toContain(SECRET_SENTINEL);
  });
});
