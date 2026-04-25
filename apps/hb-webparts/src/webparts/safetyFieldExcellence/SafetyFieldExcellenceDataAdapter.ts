/**
 * Backend data adapter for Safety Field Excellence.
 *
 * Calls only `GET /api/safety-field-excellence/homepage/current` against
 * the configured Function App base URL, with a delegated bearer token
 * supplied by the SPFx host (`AadHttpClient`/`AadTokenProvider` pattern).
 * Never imports backend code, never re-implements scoring, never queries
 * SharePoint Safety lists directly, never uses MSAL.
 */

import type {
  BackendCurrentHighlightPublished,
} from './safetyFieldExcellencePayloadMapper.js';

export type SafetyFieldExcellenceFetchOutcomeKind =
  | 'published'
  | 'no-published'
  | 'auth-error'
  | 'network-error'
  | 'invalid-payload';

export type SafetyFieldExcellenceFetchOutcome =
  | {
      readonly kind: 'published';
      readonly status: number;
      readonly current: BackendCurrentHighlightPublished;
    }
  | {
      readonly kind: 'no-published';
      readonly status: number;
      readonly message?: string;
    }
  | {
      readonly kind: 'auth-error';
      readonly status: number;
    }
  | {
      readonly kind: 'network-error';
      readonly status?: number;
      readonly message: string;
    }
  | {
      readonly kind: 'invalid-payload';
      readonly status: number;
      readonly reason: string;
    };

export interface SafetyFieldExcellenceFetchOptions {
  readonly functionAppBaseUrl: string;
  readonly includeStale?: boolean;
  readonly getToken: () => Promise<string>;
  readonly fetchImpl?: typeof fetch;
  readonly abortSignal?: AbortSignal;
}

export const HOMEPAGE_CURRENT_PATH = '/api/safety-field-excellence/homepage/current';

export function buildHomepageCurrentUrl(
  functionAppBaseUrl: string,
  includeStale: boolean,
): string {
  const trimmed = functionAppBaseUrl.replace(/\/+$/, '');
  const query = includeStale ? '?includeStale=true' : '';
  return `${trimmed}${HOMEPAGE_CURRENT_PATH}${query}`;
}

export async function fetchSafetyFieldExcellenceCurrent(
  options: SafetyFieldExcellenceFetchOptions,
): Promise<SafetyFieldExcellenceFetchOutcome> {
  const url = buildHomepageCurrentUrl(
    options.functionAppBaseUrl,
    Boolean(options.includeStale),
  );
  const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);

  let token: string;
  try {
    token = await options.getToken();
  } catch (err) {
    return {
      kind: 'network-error',
      message: err instanceof Error ? err.message : 'token acquisition failed',
    };
  }
  if (!token) {
    return { kind: 'auth-error', status: 401 };
  }

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: options.abortSignal,
    });
  } catch (err) {
    return {
      kind: 'network-error',
      message: err instanceof Error ? err.message : 'network request failed',
    };
  }

  if (response.status === 401 || response.status === 403) {
    return { kind: 'auth-error', status: response.status };
  }

  if (!response.ok) {
    return {
      kind: 'network-error',
      status: response.status,
      message: `unexpected status ${response.status}`,
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { kind: 'invalid-payload', status: response.status, reason: 'json-parse-failed' };
  }

  const data = unwrapEnvelope(body);
  if (!data || typeof data !== 'object') {
    return { kind: 'invalid-payload', status: response.status, reason: 'response-not-object' };
  }

  const state = (data as { state?: unknown }).state;
  if (state === 'no-published-highlight') {
    const message = sanitizeMessage((data as { message?: unknown }).message);
    return { kind: 'no-published', status: response.status, message };
  }
  if (state !== 'published') {
    return {
      kind: 'invalid-payload',
      status: response.status,
      reason: `unrecognized state '${String(state)}'`,
    };
  }

  // The published shape lives under `highlight` in Wave 04's response.
  const highlightCandidate = (data as { highlight?: unknown }).highlight;
  const highlight = highlightCandidate && typeof highlightCandidate === 'object'
    ? (highlightCandidate as Record<string, unknown>)
    : (data as Record<string, unknown>);

  if ((highlight as { publishStatus?: unknown }).publishStatus !== undefined &&
      (highlight as { publishStatus?: unknown }).publishStatus !== 'published') {
    return {
      kind: 'invalid-payload',
      status: response.status,
      reason: 'publishStatus-not-published',
    };
  }

  const homepagePayload = (highlight as { homepagePayload?: unknown }).homepagePayload;
  if (homepagePayload === undefined || homepagePayload === null) {
    return {
      kind: 'invalid-payload',
      status: response.status,
      reason: 'homepagePayload-missing',
    };
  }

  // Refuse if the response includes any forbidden field that suggests
  // backend redaction failed.
  const forbiddenFieldKey = findForbiddenField(highlight);
  if (forbiddenFieldKey) {
    return {
      kind: 'invalid-payload',
      status: response.status,
      reason: `forbidden-field-present: ${forbiddenFieldKey}`,
    };
  }

  const current: BackendCurrentHighlightPublished = {
    state: 'published',
    highlightItemId: toOptionalNumber((highlight as { itemId?: unknown }).itemId)
      ?? toOptionalNumber((highlight as { highlightItemId?: unknown }).highlightItemId),
    itemId: toOptionalNumber((highlight as { itemId?: unknown }).itemId),
    reportingPeriodId: toOptionalString((highlight as { reportingPeriodId?: unknown }).reportingPeriodId),
    reportingPeriodSpItemId: toOptionalNumber(
      (highlight as { reportingPeriodSpItemId?: unknown }).reportingPeriodSpItemId,
    ),
    periodLabel: toOptionalString((highlight as { periodLabel?: unknown }).periodLabel),
    weekStartDate: toOptionalString((highlight as { weekStartDate?: unknown }).weekStartDate),
    weekEndDate: toOptionalString((highlight as { weekEndDate?: unknown }).weekEndDate),
    publishStatus: 'published',
    publishedAt: toOptionalString((highlight as { publishedAt?: unknown }).publishedAt) ?? null,
    freshUntil: toOptionalString((highlight as { freshUntil?: unknown }).freshUntil) ?? null,
    isStale: Boolean((highlight as { isStale?: unknown }).isStale ?? false),
    dataConfidence: toDataConfidence((highlight as { dataConfidence?: unknown }).dataConfidence),
    homepagePayload,
  };
  return { kind: 'published', status: response.status, current };
}

function unwrapEnvelope(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  // Common success envelope shapes used elsewhere in the repo.
  const envelope = body as Record<string, unknown>;
  if (envelope.success === true && envelope.data && typeof envelope.data === 'object') {
    return envelope.data;
  }
  if (envelope.success === true && envelope.state) {
    return envelope;
  }
  if (envelope.state) return envelope;
  return body;
}

const FORBIDDEN_KEY_FRAGMENTS = [
  'rawchecklist',
  'sourceinspectionidsjson',
  'sourcefindingidsjson',
  'inspectorname',
  'inspectorupn',
  'employee',
  'token',
  'graphtoken',
];

function findForbiddenField(record: Record<string, unknown>): string | undefined {
  for (const key of Object.keys(record)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_KEY_FRAGMENTS.some((needle) => lower.includes(needle))) return key;
  }
  return undefined;
}

function sanitizeMessage(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return value;
}

function toDataConfidence(value: unknown): 'high' | 'medium' | 'low' | undefined {
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  return undefined;
}
