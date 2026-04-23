import { createRequire } from 'node:module';

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
 * payload. Derived from the backend/functions `package.json` via a read at
 * module load time; if the read fails (bundled artifact, unusual runtime),
 * falls back to the env var `HBC_FUNCTIONS_BUILD_VERSION` or the literal
 * `unknown`. Stamping at the telemetry layer guarantees every ingest /
 * preview / replay event in live logs proves which artifact executed —
 * directly closing the "deployment drift vs source" ambiguity identified
 * in phase-02 audit gap G-01.
 */
export const SAFETY_INGESTION_BACKEND_VERSION: string = resolveBackendVersion();

function resolveBackendVersion(): string {
  const envOverride = process.env.HBC_FUNCTIONS_BUILD_VERSION?.trim();
  if (envOverride) return envOverride;
  try {
    // createRequire on import.meta.url resolves sibling package.json
    // without JSON-import assertions. Works under tsc + vitest + Azure
    // Functions host.
    const req = createRequire(import.meta.url);
    const candidates = [
      '../../package.json', // from dist/services
      '../../../package.json', // from src/services (tests)
    ];
    for (const candidate of candidates) {
      try {
        const parsed = req(candidate) as { name?: string; version?: string };
        if (parsed.name === '@hbc/functions' && typeof parsed.version === 'string') {
          return parsed.version;
        }
      } catch {
        // Try next candidate.
      }
    }
  } catch {
    // Fall through.
  }
  return 'unknown';
}

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
