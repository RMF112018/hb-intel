import {
  isSourceListKind,
  PROJECTION_MESSAGE_ID_PREFIX,
  PROJECTION_MESSAGE_SCHEMA_VERSION,
  PROJECTION_MESSAGE_TYPE,
  type SourceListKind,
} from './projection-types.js';

export interface IMyProjectsProjectionSyncMessage {
  readonly schemaVersion: typeof PROJECTION_MESSAGE_SCHEMA_VERSION;
  readonly messageType: typeof PROJECTION_MESSAGE_TYPE;
  readonly sourceListKind: SourceListKind;
  readonly receivedAtUtc: string;
  readonly debounceBucketUtc: string;
  readonly notificationBatchId: string;
  readonly subscriptionId?: string | null;
  readonly notificationCount?: number;
  readonly correlationId?: string | null;
}

const ALLOWED_MESSAGE_KEYS: ReadonlySet<string> = new Set([
  'schemaVersion',
  'messageType',
  'sourceListKind',
  'receivedAtUtc',
  'debounceBucketUtc',
  'notificationBatchId',
  'subscriptionId',
  'notificationCount',
  'correlationId',
]);

export function computeDebounceBucketUtc(nowUtc: Date, windowSeconds: number): string {
  if (!(nowUtc instanceof Date) || Number.isNaN(nowUtc.getTime())) {
    throw new RangeError('computeDebounceBucketUtc: nowUtc must be a valid Date.');
  }
  if (!Number.isFinite(windowSeconds) || !Number.isInteger(windowSeconds) || windowSeconds < 1) {
    throw new RangeError('computeDebounceBucketUtc: windowSeconds must be a positive integer.');
  }
  const windowMs = windowSeconds * 1000;
  const flooredMs = Math.floor(nowUtc.getTime() / windowMs) * windowMs;
  return new Date(flooredMs).toISOString();
}

export function buildProjectionSyncMessageId(
  sourceListKind: SourceListKind,
  debounceBucketUtc: string,
): string {
  if (!isSourceListKind(sourceListKind)) {
    throw new RangeError(
      'buildProjectionSyncMessageId: sourceListKind must be a known SourceListKind.',
    );
  }
  if (typeof debounceBucketUtc !== 'string' || debounceBucketUtc.length === 0) {
    throw new RangeError(
      'buildProjectionSyncMessageId: debounceBucketUtc must be a non-empty ISO-8601 string.',
    );
  }
  return `${PROJECTION_MESSAGE_ID_PREFIX}:${sourceListKind}:${debounceBucketUtc}`;
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

export function isProjectionSyncMessage(value: unknown): value is IMyProjectsProjectionSyncMessage {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  for (const key of Object.keys(candidate)) {
    if (!ALLOWED_MESSAGE_KEYS.has(key)) {
      return false;
    }
  }
  if (candidate.schemaVersion !== PROJECTION_MESSAGE_SCHEMA_VERSION) {
    return false;
  }
  if (candidate.messageType !== PROJECTION_MESSAGE_TYPE) {
    return false;
  }
  if (!isSourceListKind(candidate.sourceListKind)) {
    return false;
  }
  if (!isIsoDateTime(candidate.receivedAtUtc)) {
    return false;
  }
  if (!isIsoDateTime(candidate.debounceBucketUtc)) {
    return false;
  }
  if (
    typeof candidate.notificationBatchId !== 'string' ||
    candidate.notificationBatchId.length === 0
  ) {
    return false;
  }
  if (
    candidate.subscriptionId !== undefined &&
    candidate.subscriptionId !== null &&
    typeof candidate.subscriptionId !== 'string'
  ) {
    return false;
  }
  if (candidate.notificationCount !== undefined) {
    if (
      typeof candidate.notificationCount !== 'number' ||
      !Number.isInteger(candidate.notificationCount) ||
      candidate.notificationCount < 0
    ) {
      return false;
    }
  }
  if (
    candidate.correlationId !== undefined &&
    candidate.correlationId !== null &&
    typeof candidate.correlationId !== 'string'
  ) {
    return false;
  }
  return true;
}
