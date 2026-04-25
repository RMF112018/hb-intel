/**
 * Pure helpers for resolving Safety Field Excellence Function App wiring
 * from SPFx web-part properties.
 *
 * The HB Homepage standalone runtime (`apps/hb-homepage/src/mount.tsx`)
 * receives untyped `webPartProperties` from SPFx and must derive:
 *
 *   - `functionAppBaseUrl`        — base URL for the Safety Function App
 *   - `functionAppAudience`       — audience used to acquire a delegated
 *                                   Function App token
 *   - `getFunctionAppToken`       — bound token provider derived from the
 *                                   audience plus the host's
 *                                   `aadTokenProviderFactory`
 *
 * `functionAppAudience` is the **preferred** property for Safety Field
 * Excellence going forward. The legacy `backendAudience` property is
 * accepted as a tenant-continuity fallback because it has historically
 * served PnP Ops and other Function App-backed paths; it is not removed
 * here. New homepage configurations should set `functionAppAudience`
 * explicitly.
 *
 * `functionAppBaseUrl` may also be supplied nested under
 * `safetyFieldExcellenceDynamic.functionAppBaseUrl`. The nested form is
 * accepted as a fallback so existing tenant configs that already place
 * the URL inside the Safety dynamic block keep working without
 * duplication.
 *
 * These helpers are intentionally pure and side-effect-free so the
 * mount-time resolution logic can be unit-tested without standing up
 * the SPFx host.
 */

export interface ResolvedSafetyFunctionAppWiring {
  readonly functionAppBaseUrl?: string;
  readonly getFunctionAppToken?: () => Promise<string>;
}

export function readFunctionAppBaseUrl(
  webPartProperties: Record<string, unknown> | undefined,
): string | undefined {
  if (!webPartProperties) return undefined;
  const direct = sanitizeString(webPartProperties.functionAppBaseUrl);
  if (direct) return direct;
  const nested = webPartProperties.safetyFieldExcellenceDynamic;
  if (nested && typeof nested === 'object') {
    const fromNested = sanitizeString(
      (nested as Record<string, unknown>).functionAppBaseUrl,
    );
    if (fromNested) return fromNested;
  }
  return undefined;
}

export function readFunctionAppAudience(
  webPartProperties: Record<string, unknown> | undefined,
): string | undefined {
  if (!webPartProperties) return undefined;
  const preferred = sanitizeString(webPartProperties.functionAppAudience);
  if (preferred) return preferred;
  const legacy = sanitizeString(webPartProperties.backendAudience);
  if (legacy) return legacy;
  return undefined;
}

export function resolveSafetyFunctionAppWiring(
  webPartProperties: Record<string, unknown> | undefined,
  createTokenProvider: (audience: string) => (() => Promise<string>) | undefined,
): ResolvedSafetyFunctionAppWiring {
  const functionAppBaseUrl = readFunctionAppBaseUrl(webPartProperties);
  const audience = readFunctionAppAudience(webPartProperties);
  const getFunctionAppToken = audience ? createTokenProvider(audience) : undefined;
  return { functionAppBaseUrl, getFunctionAppToken };
}

function sanitizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
