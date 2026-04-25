/**
 * HB Homepage SPFx → runtime bridge for Safety Field Excellence dynamic
 * activation.
 *
 * Operators historically had to author a nested `safetyFieldExcellenceDynamic`
 * JSON block on the HbHomepageWebPart instance properties — which the SPFx
 * property-pane editor does not expose. To remove that raw-JSON dependency
 * without breaking existing tenant configurations, this bridge accepts both
 * shapes on `webPartProperties`:
 *
 *  - the existing nested `safetyFieldExcellenceDynamic` object (legacy /
 *    raw-JSON path), and
 *  - a flat set of `safetyFieldExcellence*` property-pane fields exposed by
 *    `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`.
 *
 * The bridge normalizes both into the runtime shape that
 * `SafetyFieldExcellenceZone` and `resolveSafetyFunctionAppWiring` already
 * consume:
 *
 *  - `webPartProperties.safetyFieldExcellenceDynamic` (nested config block)
 *  - `webPartProperties.functionAppBaseUrl`            (top-level URL)
 *  - `webPartProperties.functionAppAudience`           (preferred audience)
 *
 * Rules:
 *  - If `safetyFieldExcellenceDynamic` is already a valid object, it is
 *    preserved. Nested explicit values win over flat values when both exist.
 *  - If only flat fields are present, the nested block is constructed from
 *    them — but only when a recognized `sourceMode` is set. Without a source
 *    mode, dynamic activation is intentionally skipped (curated-only stays
 *    the safe default).
 *  - Top-level `functionAppBaseUrl` is populated from the flat field when
 *    missing, so `resolveSafetyFunctionAppWiring` can read it directly.
 *  - Top-level `functionAppAudience` is populated from the flat field when
 *    missing. The legacy `backendAudience` property is left untouched.
 *  - This module never reads or writes manifest defaults, never hard-codes a
 *    tenant Function App URL or audience, and never alters non-Safety
 *    `webPartProperties` keys.
 */

import type {
  SafetyFieldExcellenceDynamicConfig,
  SafetyFieldExcellenceSourceMode,
} from '../../../homepage/webparts/operationalAwarenessContracts.js';

const VALID_SOURCE_MODES: ReadonlyArray<SafetyFieldExcellenceSourceMode> = [
  'curated-only',
  'dynamic-preview',
  'dynamic-with-curated-fallback',
  'dynamic-only',
];

export const SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS = {
  sourceMode: 'safetyFieldExcellenceSourceMode',
  functionAppBaseUrl: 'safetyFieldExcellenceFunctionAppBaseUrl',
  functionAppAudience: 'safetyFieldExcellenceFunctionAppAudience',
  safetyHubUrl: 'safetyFieldExcellenceSafetyHubUrl',
  includeStale: 'safetyFieldExcellenceIncludeStale',
  diagnosticsEnabled: 'safetyFieldExcellenceDiagnosticsEnabled',
  emergencyUseCuratedFallback: 'safetyFieldExcellenceEmergencyUseCuratedFallback',
} as const;

export function bridgeSafetyFieldExcellenceDynamicConfig(
  webPartProperties: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!webPartProperties) return webPartProperties;

  const next: Record<string, unknown> = { ...webPartProperties };

  const existingNested = isPlainObject(next.safetyFieldExcellenceDynamic)
    ? (next.safetyFieldExcellenceDynamic as Record<string, unknown>)
    : undefined;
  const flatNested = buildNestedFromFlat(next);
  const merged = mergeNested(flatNested, existingNested);

  if (merged) {
    next.safetyFieldExcellenceDynamic = merged;
  }

  if (!sanitizeString(next.functionAppBaseUrl)) {
    const fromFlat = sanitizeString(
      next[SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS.functionAppBaseUrl],
    );
    if (fromFlat) next.functionAppBaseUrl = fromFlat;
  }

  if (!sanitizeString(next.functionAppAudience)) {
    const fromFlat = sanitizeString(
      next[SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS.functionAppAudience],
    );
    if (fromFlat) next.functionAppAudience = fromFlat;
  }

  return next;
}

function buildNestedFromFlat(
  props: Record<string, unknown>,
): SafetyFieldExcellenceDynamicConfig | undefined {
  const sourceMode = sanitizeSourceMode(
    props[SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS.sourceMode],
  );
  if (!sourceMode) return undefined;

  const result: { -readonly [K in keyof SafetyFieldExcellenceDynamicConfig]: SafetyFieldExcellenceDynamicConfig[K] } = {
    sourceMode,
  };

  const baseUrl = sanitizeString(
    props[SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS.functionAppBaseUrl],
  );
  if (baseUrl) result.functionAppBaseUrl = baseUrl;

  const safetyHubUrl = sanitizeString(
    props[SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS.safetyHubUrl],
  );
  if (safetyHubUrl) result.safetyHubUrl = safetyHubUrl;

  const includeStale = props[SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS.includeStale];
  if (typeof includeStale === 'boolean') result.includeStale = includeStale;

  const diagnosticsEnabled =
    props[SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS.diagnosticsEnabled];
  if (typeof diagnosticsEnabled === 'boolean') result.diagnosticsEnabled = diagnosticsEnabled;

  const emergencyUseCuratedFallback =
    props[SAFETY_FIELD_EXCELLENCE_FLAT_PROPERTY_KEYS.emergencyUseCuratedFallback];
  if (typeof emergencyUseCuratedFallback === 'boolean') {
    result.emergencyUseCuratedFallback = emergencyUseCuratedFallback;
  }

  return result;
}

function mergeNested(
  fromFlat: SafetyFieldExcellenceDynamicConfig | undefined,
  existing: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!fromFlat && !existing) return undefined;
  if (!existing) return fromFlat as Record<string, unknown>;
  if (!fromFlat) return existing;
  // Nested explicit values win; flat fills in keys nested didn't define.
  return { ...(fromFlat as Record<string, unknown>), ...existing };
}

function sanitizeSourceMode(value: unknown): SafetyFieldExcellenceSourceMode | undefined {
  const trimmed = sanitizeString(value);
  if (!trimmed) return undefined;
  return (VALID_SOURCE_MODES as ReadonlyArray<string>).includes(trimmed)
    ? (trimmed as SafetyFieldExcellenceSourceMode)
    : undefined;
}

function sanitizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isPlainObject(value: unknown): boolean {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
