export const SOURCE_LIST_KINDS = ['Projects', 'LegacyRegistry'] as const;
export type SourceListKind = (typeof SOURCE_LIST_KINDS)[number];

export function isSourceListKind(value: unknown): value is SourceListKind {
  return typeof value === 'string' && (SOURCE_LIST_KINDS as readonly string[]).includes(value);
}

export const PROJECTION_RUN_TYPES = [
  'seed',
  'incremental',
  'subscription-renewal',
  'drift-audit',
  'drift-repair',
  'purge',
  'manual-rebuild',
] as const;
export type ProjectionRunType = (typeof PROJECTION_RUN_TYPES)[number];

export function isProjectionRunType(value: unknown): value is ProjectionRunType {
  return typeof value === 'string' && (PROJECTION_RUN_TYPES as readonly string[]).includes(value);
}

export const PROJECTION_RUN_STATUSES = [
  'running',
  'succeeded',
  'failed',
  'partial',
  'skipped',
] as const;
export type ProjectionRunStatus = (typeof PROJECTION_RUN_STATUSES)[number];

export function isProjectionRunStatus(value: unknown): value is ProjectionRunStatus {
  return (
    typeof value === 'string' && (PROJECTION_RUN_STATUSES as readonly string[]).includes(value)
  );
}

export const PROJECTION_READ_MODES = ['legacy', 'projection'] as const;
export type ProjectionReadMode = (typeof PROJECTION_READ_MODES)[number];

export function isProjectionReadMode(value: unknown): value is ProjectionReadMode {
  return typeof value === 'string' && (PROJECTION_READ_MODES as readonly string[]).includes(value);
}

export const PROJECTION_VERSION = 'v1' as const;
export const PROJECTION_MESSAGE_TYPE = 'my-projects-projection-sync' as const;
export const PROJECTION_MESSAGE_SCHEMA_VERSION = 'v1' as const;
export const PROJECTION_MESSAGE_ID_PREFIX = 'my-projects-projection' as const;
