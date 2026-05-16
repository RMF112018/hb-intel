/**
 * My Projects (project-links) read-model runtime diagnostics.
 *
 * Tier-1 telemetry contract: when either source loader (Projects list or
 * Legacy Project Fallback Registry list) catches a `GraphListClient` throw,
 * the provider emits one event per failed loader naming the failing stage so
 * the operator can discriminate the cause from the next hosted reproduction
 * without redeploying a richer Graph diagnostic.
 *
 * The classifier here pattern-matches the exact throw strings emitted by
 * `GraphListClient` (`backend/functions/src/services/legacy-fallback/graph-list-client.ts`):
 *   - `graph-list-client: token acquisition failed`                    → `'token'`
 *   - `graph-list-client: list 'TITLE' not found on site SITEID`       → `'list'`
 *   - `graph METHOD /sites/.../lists/.../items?...     -> STATUS: ...` → `'items'`
 *   - `graph METHOD /sites/.../lists?...               -> STATUS: ...` → `'list'`
 *   - `graph METHOD /sites/HOST:/sites/PATH            -> STATUS: ...` → `'site'`
 *   - anything else                                                    → `'other'`
 *
 * Properties are sanitized: bearer tokens and JWT-shaped strings are scrubbed
 * before emission. No actor identifiers, OIDs, UPNs, or token fragments may
 * appear in event properties.
 */

export type MyProjectLinksRuntimeEventName = 'projects-loader.failed' | 'registry-loader.failed';

export type MyProjectLinksLoaderStage = 'token' | 'site' | 'list' | 'items' | 'other';

/**
 * Properties contributed by the provider for each loader-failure event.
 * `correlationId` is intentionally absent here — the route-level reporter
 * (`createMyProjectLinksRuntimeDiagnosticsReporter`) adds it on emission so
 * the provider has no need to thread the request id into the properties
 * shape itself. Matches the Adobe Sign reporter convention in the same
 * routes file.
 */
export interface MyProjectLinksRuntimeDiagnosticProperties {
  readonly listName: string;
  readonly stage: MyProjectLinksLoaderStage;
  readonly sanitizedMessage?: string;
}

export interface MyProjectLinksRuntimeDiagnosticReporter {
  trackMyProjectLinksRuntimeEvent(
    name: MyProjectLinksRuntimeEventName,
    properties: MyProjectLinksRuntimeDiagnosticProperties,
  ): void;
}

const TOKEN_FAILURE_PREFIX = 'graph-list-client: token acquisition failed';
const LIST_NOT_FOUND_PATTERN = /^graph-list-client: list '.+?' not found on site /;
const GRAPH_FETCH_PATTERN = /^graph\s+\S+\s+(\S+)\s+->\s+\d+/;

/**
 * Classify the GraphListClient throw into a stage so the operator can tell
 * which layer failed (token acquisition vs site lookup vs list catalogue
 * vs list-items fetch).
 */
export function classifyGraphErrorStage(error: unknown): MyProjectLinksLoaderStage {
  const message = error instanceof Error ? error.message : '';
  if (!message) return 'other';
  if (message.startsWith(TOKEN_FAILURE_PREFIX)) return 'token';
  if (LIST_NOT_FOUND_PATTERN.test(message)) return 'list';
  const fetchMatch = message.match(GRAPH_FETCH_PATTERN);
  if (!fetchMatch) return 'other';
  const path = fetchMatch[1] ?? '';
  if (/\/lists\/[^/?]+\/items(\b|\?)/.test(path)) return 'items';
  if (/\/lists(\?|$)/.test(path)) return 'list';
  // resolveSiteId fetches `/sites/HOST:/sites/PATH` (colon-syntax).
  if (/\/sites\/[^/?]+:\//.test(path)) return 'site';
  // Any other site-scoped path that did not match the items/lists patterns above.
  if (/\/sites\/[^/?]+(?:\?|$)/.test(path)) return 'site';
  return 'other';
}

const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._\-+/=]+/gi;
const JWT_PATTERN = /eyJ[A-Za-z0-9._-]{10,}/g;
const DEFAULT_MAX_LEN = 500;

/**
 * Strip bearer tokens and JWT-shaped substrings from an error message and
 * truncate. Safe for Application Insights ingestion — never emits the raw
 * Graph response body that GraphListClient embeds in its throw text.
 */
export function sanitizeForTelemetry(error: unknown, maxLen: number = DEFAULT_MAX_LEN): string {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  let cleaned = raw
    .replace(BEARER_PATTERN, 'Bearer [REDACTED]')
    .replace(JWT_PATTERN, '[JWT_REDACTED]');
  if (cleaned.length > maxLen) cleaned = cleaned.slice(0, maxLen) + '…';
  return cleaned;
}
