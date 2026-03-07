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
export declare function resolveCanonicalAuthMode(): CanonicalAuthMode;
/**
 * Compatibility resolver for existing app entrypoints that still branch on
 * legacy values (`msal`, `spfx`).
 */
export declare function resolveAuthMode(): AuthMode;
/**
 * Translate legacy values to canonical modes.
 */
export declare function mapLegacyToCanonicalAuthMode(mode: AuthMode): CanonicalAuthMode;
/**
 * Translate canonical values to compatibility aliases used by existing code.
 */
export declare function mapCanonicalToLegacyAuthMode(mode: CanonicalAuthMode): AuthMode;
/**
 * Runtime metadata helper that can be consumed by diagnostics and status UI.
 */
export declare function describeResolvedAuthRuntime(): {
    canonicalMode: CanonicalAuthMode;
    compatibilityMode: AuthMode;
    production: boolean;
    overrideApplied: boolean;
};
//# sourceMappingURL=resolveAuthMode.d.ts.map