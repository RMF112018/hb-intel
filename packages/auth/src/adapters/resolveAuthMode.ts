import type { AuthMode, CanonicalAuthMode } from '../types.js';

/**
 * Resolve runtime mode from environment and host signals.
 *
 * Detection priority:
 * 1. Explicit non-production override (`HBC_AUTH_MODE_OVERRIDE`) with guard rails.
 * 2. SPFx host context auto-detection.
 * 3. PWA browser runtime default.
 * 4. Mock fallback for non-browser/test contexts.
 */
export function resolveCanonicalAuthMode(): CanonicalAuthMode {
  const production = isProductionRuntime();

  const override = getModeOverride();
  if (override && !production) {
    return mapLegacyToCanonicalAuthMode(override);
  }

  // Runtime host detection is intentionally conservative to avoid false SPFx
  // positives in standalone web execution.
  if (hasSpfxRuntimeContext()) {
    return 'spfx-context';
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'pwa-msal';
  }

  return 'mock';
}

/**
 * Compatibility resolver for existing app entrypoints that still branch on
 * legacy values (`msal`, `spfx`).
 */
export function resolveAuthMode(): AuthMode {
  const canonical = resolveCanonicalAuthMode();
  return mapCanonicalToLegacyAuthMode(canonical);
}

/**
 * Translate legacy values to canonical modes.
 */
export function mapLegacyToCanonicalAuthMode(mode: AuthMode): CanonicalAuthMode {
  if (mode === 'msal') return 'pwa-msal';
  if (mode === 'spfx') return 'spfx-context';
  return mode;
}

/**
 * Translate canonical values to compatibility aliases used by existing code.
 */
export function mapCanonicalToLegacyAuthMode(mode: CanonicalAuthMode): AuthMode {
  if (mode === 'pwa-msal') return 'msal';
  if (mode === 'spfx-context') return 'spfx';
  return mode;
}

/**
 * Runtime metadata helper that can be consumed by diagnostics and status UI.
 */
export function describeResolvedAuthRuntime(): {
  canonicalMode: CanonicalAuthMode;
  compatibilityMode: AuthMode;
  production: boolean;
  overrideApplied: boolean;
} {
  const production = isProductionRuntime();
  const override = getModeOverride();
  const canonicalMode = resolveCanonicalAuthMode();

  return {
    canonicalMode,
    compatibilityMode: mapCanonicalToLegacyAuthMode(canonicalMode),
    production,
    overrideApplied: Boolean(override) && !production,
  };
}

function isProductionRuntime(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  const nodeEnv = g?.process?.env?.NODE_ENV as string | undefined;
  return nodeEnv === 'production';
}

function getModeOverride(): AuthMode | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  const env = (g?.process?.env ?? {}) as Record<string, string | undefined>;
  const raw = env.HBC_AUTH_MODE_OVERRIDE;

  if (
    raw === 'msal' ||
    raw === 'spfx' ||
    raw === 'pwa-msal' ||
    raw === 'spfx-context' ||
    raw === 'mock' ||
    raw === 'dev-override'
  ) {
    return raw as AuthMode;
  }

  return null;
}

function hasSpfxRuntimeContext(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  return Boolean(g?._spPageContextInfo || g?.__spfxContext);
}
