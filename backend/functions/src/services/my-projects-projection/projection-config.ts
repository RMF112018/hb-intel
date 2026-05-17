import {
  isProjectionReadMode,
  PROJECTION_READ_MODES,
  PROJECTION_VERSION,
  type ProjectionReadMode,
} from './projection-types.js';

const SECRET_ENV_KEY = 'HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE';

const DEFAULT_PROJECTS_LIST_TITLE = 'Projects';
const DEFAULT_LEGACY_REGISTRY_LIST_TITLE = 'Legacy Project Fallback Registry';
const DEFAULT_REGISTRY_LIST_TITLE = 'My Projects Registry';
const DEFAULT_PROJECTION_VERSION = PROJECTION_VERSION;
const DEFAULT_MAX_FRESHNESS_MINUTES = 5;
const DEFAULT_QUEUE_NAME = 'my-projects-projection-sync';
const DEFAULT_DEBOUNCE_WINDOW_SECONDS = 60;
const DEFAULT_SUBSCRIPTION_EXPIRATION_DAYS = 27;
const DEFAULT_SUBSCRIPTION_RENEW_THRESHOLD_DAYS = 7;
const DEFAULT_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE = '0 15 2 * * *';
const DEFAULT_DRIFT_AUDIT_TIMER_SCHEDULE = '0 30 3 * * *';
const DEFAULT_WEEKLY_REPAIR_TIMER_SCHEDULE = '0 0 4 * * 0';
const DEFAULT_MONTHLY_PURGE_TIMER_SCHEDULE = '0 0 5 1 * *';
const DEFAULT_INACTIVE_RETENTION_DAYS = 90;
const DEFAULT_SYNC_LEASE_MINUTES = 10;
const DEFAULT_REBUILD_LEASE_MINUTES = 60;
const DEFAULT_DRIFT_AUDIT_LEASE_MINUTES = 60;
const DEFAULT_PURGE_LEASE_MINUTES = 30;
const DEFAULT_MAX_DELTA_PAGES_PER_RUN = 100;
const DEFAULT_SUBSCRIPTIONS_TABLE = 'MyProjectsProjectionSubscriptions';
const DEFAULT_DELTA_STATE_TABLE = 'MyProjectsProjectionDeltaState';
const DEFAULT_LEASES_TABLE = 'MyProjectsProjectionLeases';
const DEFAULT_RUNS_TABLE = 'MyProjectsProjectionRuns';

type EnvReader = (key: string) => string | undefined;

export type ProjectionConfigIssueCode =
  | 'missing-required'
  | 'invalid-boolean'
  | 'invalid-integer'
  | 'invalid-url'
  | 'invalid-cron'
  | 'invalid-read-mode';

export interface IProjectionConfigIssue {
  readonly key: string;
  readonly code: ProjectionConfigIssueCode;
  readonly message: string;
}

export interface IProjectionConfigValidationResult {
  readonly ok: boolean;
  readonly issues: readonly IProjectionConfigIssue[];
}

export interface IProjectionEnablement {
  readonly enabled: boolean;
  readonly readMode: ProjectionReadMode;
  readonly projectionVersion: string;
  readonly maxFreshnessMinutes: number;
}

export interface IProjectionSitesConfig {
  readonly sourceSiteUrl: string;
  readonly registrySiteUrl: string;
  readonly projectsListTitle: string;
  readonly legacyRegistryListTitle: string;
  readonly registryListTitle: string;
}

export interface IProjectionWebhookConfig {
  readonly notificationUrl: string;
  readonly clientState: string;
}

export interface IProjectionSubscriptionsConfig {
  readonly expirationDays: number;
  readonly renewThresholdDays: number;
  readonly renewalTimerEnabled: boolean;
  readonly renewalTimerSchedule: string;
}

export interface IProjectionQueueConfig {
  readonly queueName: string;
  readonly serviceBusFqdn: string;
  readonly debounceWindowSeconds: number;
}

export interface IProjectionTablesConfig {
  readonly accountUrl: string;
  readonly subscriptionsTable: string;
  readonly deltaStateTable: string;
  readonly leasesTable: string;
  readonly runsTable: string;
}

export interface IProjectionDriftConfig {
  readonly driftAuditEnabled: boolean;
  readonly driftAuditTimerSchedule: string;
  readonly weeklyRepairEnabled: boolean;
  readonly weeklyRepairTimerSchedule: string;
}

export interface IProjectionPurgeConfig {
  readonly monthlyPurgeEnabled: boolean;
  readonly monthlyPurgeTimerSchedule: string;
  readonly inactiveRetentionDays: number;
}

export interface IProjectionLeasesConfig {
  readonly syncLeaseMinutes: number;
  readonly rebuildLeaseMinutes: number;
  readonly driftAuditLeaseMinutes: number;
  readonly purgeLeaseMinutes: number;
  readonly maxDeltaPagesPerRun: number;
}

export interface IProjectionConfig {
  readonly enablement: IProjectionEnablement;
  readonly sites: IProjectionSitesConfig;
  readonly webhook: IProjectionWebhookConfig;
  readonly subscriptions: IProjectionSubscriptionsConfig;
  readonly queue: IProjectionQueueConfig;
  readonly tables: IProjectionTablesConfig;
  readonly drift: IProjectionDriftConfig;
  readonly purge: IProjectionPurgeConfig;
  readonly leases: IProjectionLeasesConfig;
}

function readTrimmed(env: EnvReader, key: string): string {
  return (env(key) ?? '').trim();
}

function parseBoolean(value: string, fallback: boolean): boolean {
  if (value === '') {
    return fallback;
  }
  const lowered = value.toLowerCase();
  if (lowered === 'true') {
    return true;
  }
  if (lowered === 'false') {
    return false;
  }
  return fallback;
}

function isBooleanLiteral(value: string): boolean {
  if (value === '') {
    return true;
  }
  const lowered = value.toLowerCase();
  return lowered === 'true' || lowered === 'false';
}

function parsePositiveInteger(value: string): number | null {
  if (value.trim().length === 0) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function isValidHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidSixFieldCron(value: string): boolean {
  const parts = value.trim().split(/\s+/);
  return parts.length === 6 && parts.every((part) => part.length > 0);
}

function requireString(issues: IProjectionConfigIssue[], key: string, value: string): void {
  if (value.length === 0) {
    issues.push({
      key,
      code: 'missing-required',
      message: `${key} is required.`,
    });
  }
}

function requireHttpsUrl(issues: IProjectionConfigIssue[], key: string, value: string): void {
  if (value.length === 0) {
    issues.push({
      key,
      code: 'missing-required',
      message: `${key} is required.`,
    });
    return;
  }
  if (!isValidHttpsUrl(value)) {
    issues.push({
      key,
      code: 'invalid-url',
      message: `${key} must be a valid https URL.`,
    });
  }
}

function requireSixFieldCron(issues: IProjectionConfigIssue[], key: string, value: string): void {
  if (value.length === 0) {
    issues.push({
      key,
      code: 'missing-required',
      message: `${key} is required.`,
    });
    return;
  }
  if (!isValidSixFieldCron(value)) {
    issues.push({
      key,
      code: 'invalid-cron',
      message: `${key} must be a six-field cron expression.`,
    });
  }
}

function requireBooleanLiteral(issues: IProjectionConfigIssue[], key: string, value: string): void {
  if (value.length === 0) {
    issues.push({
      key,
      code: 'missing-required',
      message: `${key} is required.`,
    });
    return;
  }
  if (!isBooleanLiteral(value)) {
    issues.push({
      key,
      code: 'invalid-boolean',
      message: `${key} must be "true" or "false".`,
    });
  }
}

export function validateProjectionConfig(
  env: EnvReader = (key) => process.env[key],
): IProjectionConfigValidationResult {
  const issues: IProjectionConfigIssue[] = [];

  const enabledRaw = readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_ENABLED');
  requireBooleanLiteral(issues, 'HBC_MY_PROJECTS_PROJECTION_ENABLED', enabledRaw);

  const readModeRaw = readTrimmed(env, 'HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE');
  if (readModeRaw.length === 0) {
    issues.push({
      key: 'HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE',
      code: 'missing-required',
      message: 'HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE is required.',
    });
  } else if (!isProjectionReadMode(readModeRaw)) {
    issues.push({
      key: 'HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE',
      code: 'invalid-read-mode',
      message: `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE must be one of: ${PROJECTION_READ_MODES.join(', ')}.`,
    });
  }

  const isEnabled = isBooleanLiteral(enabledRaw) && parseBoolean(enabledRaw, false);

  if (isEnabled) {
    requireHttpsUrl(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL'),
    );
    requireHttpsUrl(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_REGISTRY_SITE_URL',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_REGISTRY_SITE_URL'),
    );
    requireHttpsUrl(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_NOTIFICATION_URL',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_NOTIFICATION_URL'),
    );
    requireHttpsUrl(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL'),
    );

    requireString(issues, SECRET_ENV_KEY, readTrimmed(env, SECRET_ENV_KEY));
    requireString(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN'),
    );

    requireSixFieldCron(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE'),
    );
    requireSixFieldCron(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_TIMER_SCHEDULE',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_TIMER_SCHEDULE'),
    );
    requireSixFieldCron(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_TIMER_SCHEDULE',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_TIMER_SCHEDULE'),
    );
    requireSixFieldCron(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_TIMER_SCHEDULE',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_TIMER_SCHEDULE'),
    );

    requireBooleanLiteral(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_ENABLED',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_ENABLED'),
    );
    requireBooleanLiteral(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_ENABLED',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_ENABLED'),
    );
    requireBooleanLiteral(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED'),
    );
    requireBooleanLiteral(
      issues,
      'HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_ENABLED',
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_ENABLED'),
    );
  }

  for (const optionalIntegerKey of [
    'HBC_MY_PROJECTS_PROJECTION_MAX_FRESHNESS_MINUTES',
    'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_EXPIRATION_DAYS',
    'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEW_THRESHOLD_DAYS',
    'HBC_MY_PROJECTS_PROJECTION_DEBOUNCE_WINDOW_SECONDS',
    'HBC_MY_PROJECTS_PROJECTION_INACTIVE_RETENTION_DAYS',
    'HBC_MY_PROJECTS_PROJECTION_SYNC_LEASE_MINUTES',
    'HBC_MY_PROJECTS_PROJECTION_REBUILD_LEASE_MINUTES',
    'HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_LEASE_MINUTES',
    'HBC_MY_PROJECTS_PROJECTION_PURGE_LEASE_MINUTES',
    'HBC_MY_PROJECTS_PROJECTION_MAX_DELTA_PAGES_PER_RUN',
  ]) {
    const raw = readTrimmed(env, optionalIntegerKey);
    if (raw.length > 0 && parsePositiveInteger(raw) === null) {
      issues.push({
        key: optionalIntegerKey,
        code: 'invalid-integer',
        message: `${optionalIntegerKey} must be a positive integer.`,
      });
    }
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function getProjectionConfig(env: EnvReader = (key) => process.env[key]): IProjectionConfig {
  const result = validateProjectionConfig(env);
  if (!result.ok) {
    const sanitized = result.issues
      .map((issue) => `${issue.key} [${issue.code}]: ${issue.message}`)
      .join('; ');
    throw new Error(`My Projects projection configuration invalid. ${sanitized}`);
  }

  const enabled = parseBoolean(readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_ENABLED'), false);
  const readModeRaw = readTrimmed(env, 'HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE');
  const readMode: ProjectionReadMode = isProjectionReadMode(readModeRaw) ? readModeRaw : 'legacy';

  const enablement: IProjectionEnablement = {
    enabled,
    readMode,
    projectionVersion:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_VERSION') || DEFAULT_PROJECTION_VERSION,
    maxFreshnessMinutes:
      parsePositiveInteger(readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_MAX_FRESHNESS_MINUTES')) ??
      DEFAULT_MAX_FRESHNESS_MINUTES,
  };

  const sites: IProjectionSitesConfig = {
    sourceSiteUrl: readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL'),
    registrySiteUrl: readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_REGISTRY_SITE_URL'),
    projectsListTitle:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_PROJECTS_LIST_TITLE') ||
      DEFAULT_PROJECTS_LIST_TITLE,
    legacyRegistryListTitle:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_LEGACY_REGISTRY_LIST_TITLE') ||
      DEFAULT_LEGACY_REGISTRY_LIST_TITLE,
    registryListTitle:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_REGISTRY_LIST_TITLE') ||
      DEFAULT_REGISTRY_LIST_TITLE,
  };

  const webhook: IProjectionWebhookConfig = {
    notificationUrl: readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_NOTIFICATION_URL'),
    clientState: readTrimmed(env, SECRET_ENV_KEY),
  };

  const subscriptions: IProjectionSubscriptionsConfig = {
    expirationDays:
      parsePositiveInteger(
        readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_EXPIRATION_DAYS'),
      ) ?? DEFAULT_SUBSCRIPTION_EXPIRATION_DAYS,
    renewThresholdDays:
      parsePositiveInteger(
        readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEW_THRESHOLD_DAYS'),
      ) ?? DEFAULT_SUBSCRIPTION_RENEW_THRESHOLD_DAYS,
    renewalTimerEnabled: parseBoolean(
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_ENABLED'),
      false,
    ),
    renewalTimerSchedule:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE') ||
      DEFAULT_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE,
  };

  const queue: IProjectionQueueConfig = {
    queueName: readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME') || DEFAULT_QUEUE_NAME,
    serviceBusFqdn: readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN'),
    debounceWindowSeconds:
      parsePositiveInteger(
        readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_DEBOUNCE_WINDOW_SECONDS'),
      ) ?? DEFAULT_DEBOUNCE_WINDOW_SECONDS,
  };

  const tables: IProjectionTablesConfig = {
    accountUrl: readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL'),
    subscriptionsTable:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTIONS_TABLE') ||
      DEFAULT_SUBSCRIPTIONS_TABLE,
    deltaStateTable:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_DELTA_STATE_TABLE') || DEFAULT_DELTA_STATE_TABLE,
    leasesTable:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_LEASES_TABLE') || DEFAULT_LEASES_TABLE,
    runsTable: readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_RUNS_TABLE') || DEFAULT_RUNS_TABLE,
  };

  const drift: IProjectionDriftConfig = {
    driftAuditEnabled: parseBoolean(
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_ENABLED'),
      true,
    ),
    driftAuditTimerSchedule:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_TIMER_SCHEDULE') ||
      DEFAULT_DRIFT_AUDIT_TIMER_SCHEDULE,
    weeklyRepairEnabled: parseBoolean(
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED'),
      false,
    ),
    weeklyRepairTimerSchedule:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_TIMER_SCHEDULE') ||
      DEFAULT_WEEKLY_REPAIR_TIMER_SCHEDULE,
  };

  const purge: IProjectionPurgeConfig = {
    monthlyPurgeEnabled: parseBoolean(
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_ENABLED'),
      true,
    ),
    monthlyPurgeTimerSchedule:
      readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_TIMER_SCHEDULE') ||
      DEFAULT_MONTHLY_PURGE_TIMER_SCHEDULE,
    inactiveRetentionDays:
      parsePositiveInteger(
        readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_INACTIVE_RETENTION_DAYS'),
      ) ?? DEFAULT_INACTIVE_RETENTION_DAYS,
  };

  const leases: IProjectionLeasesConfig = {
    syncLeaseMinutes:
      parsePositiveInteger(readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_SYNC_LEASE_MINUTES')) ??
      DEFAULT_SYNC_LEASE_MINUTES,
    rebuildLeaseMinutes:
      parsePositiveInteger(readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_REBUILD_LEASE_MINUTES')) ??
      DEFAULT_REBUILD_LEASE_MINUTES,
    driftAuditLeaseMinutes:
      parsePositiveInteger(
        readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_LEASE_MINUTES'),
      ) ?? DEFAULT_DRIFT_AUDIT_LEASE_MINUTES,
    purgeLeaseMinutes:
      parsePositiveInteger(readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_PURGE_LEASE_MINUTES')) ??
      DEFAULT_PURGE_LEASE_MINUTES,
    maxDeltaPagesPerRun:
      parsePositiveInteger(
        readTrimmed(env, 'HBC_MY_PROJECTS_PROJECTION_MAX_DELTA_PAGES_PER_RUN'),
      ) ?? DEFAULT_MAX_DELTA_PAGES_PER_RUN,
  };

  return {
    enablement,
    sites,
    webhook,
    subscriptions,
    queue,
    tables,
    drift,
    purge,
    leases,
  };
}
