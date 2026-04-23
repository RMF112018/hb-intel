import { resolveBackendArtifactIdentity } from '../utils/backend-version.js';

export type SafetyIngestionTelemetryOperation = 'ingest' | 'preview' | 'replay';

export interface ISafetyIngestionTelemetryContext {
  requestId?: string;
  operation: SafetyIngestionTelemetryOperation;
  runId?: string;
  parentRunId?: string;
  attemptNumber?: number;
}

/**
 * Backend artifact version stamped onto every Safety ingestion telemetry
 * payload. Resolved once at module load via `resolveBackendArtifactIdentity()`
 * so the telemetry constant and the `/api/health` `artifact` block share a
 * single source of truth for version identity. Stamping at the telemetry
 * layer guarantees every ingest / preview / replay event in live logs proves
 * which artifact executed — directly closing the "deployment drift vs source"
 * ambiguity identified in phase-02 audit gap G-01.
 */
export const SAFETY_INGESTION_BACKEND_VERSION: string =
  resolveBackendArtifactIdentity().version;

type TelemetryPropertyValue = string | number | boolean | null | undefined;

const REDACTED_KEYS = [
  'filecontentbase64',
  'rawchecklistjson',
  'workbook',
  'bytes',
  'payload',
  'binary',
];

function sanitizeProperties(
  properties: Record<string, unknown>,
): Record<string, TelemetryPropertyValue> {
  const sanitized: Record<string, TelemetryPropertyValue> = {};
  for (const [key, value] of Object.entries(properties)) {
    const lowerKey = key.toLowerCase();
    if (REDACTED_KEYS.some((needle) => lowerKey.includes(needle))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    if (value === null || value === undefined) {
      sanitized[key] = value as null | undefined;
      continue;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      sanitized[key] = value.length;
      continue;
    }

    // Keep object payloads bounded and query-friendly.
    sanitized[key] = JSON.stringify(value).slice(0, 200);
  }
  return sanitized;
}

export function emitSafetyIngestionEvent(
  name: string,
  context: ISafetyIngestionTelemetryContext,
  properties: Record<string, unknown> = {},
): void {
  const payload = sanitizeProperties(properties);
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      level: 'info',
      _telemetryType: 'customEvent',
      name,
      backendVersion: SAFETY_INGESTION_BACKEND_VERSION,
      requestId: context.requestId,
      operation: context.operation,
      runId: context.runId,
      parentRunId: context.parentRunId,
      attemptNumber: context.attemptNumber,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
}

export function emitSafetyIngestionMetric(
  name: string,
  value: number,
  context: ISafetyIngestionTelemetryContext,
  properties: Record<string, unknown> = {},
): void {
  const payload = sanitizeProperties(properties);
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      level: 'info',
      _telemetryType: 'customMetric',
      name,
      value,
      backendVersion: SAFETY_INGESTION_BACKEND_VERSION,
      requestId: context.requestId,
      operation: context.operation,
      runId: context.runId,
      parentRunId: context.parentRunId,
      attemptNumber: context.attemptNumber,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
}
