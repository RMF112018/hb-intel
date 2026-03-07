import { endStartupPhase, startStartupPhase } from '../startup/startupTimingBridge.js';
/**
 * Resolve runtime mode from environment and host signals.
 *
 * Detection priority:
 * 1. Explicit non-production override (`HBC_AUTH_MODE_OVERRIDE`) with guard rails.
 * 2. SPFx host context auto-detection.
 * 3. PWA browser runtime default.
 * 4. Mock fallback for non-browser/test contexts.
 */
export function resolveCanonicalAuthMode() {
    startStartupPhase('runtime-detection', {
        source: 'auth-runtime-resolver',
        outcome: 'pending',
    });
    const production = isProductionRuntime();
    let resolvedMode = 'mock';
    const override = getModeOverride();
    if (override && !production) {
        resolvedMode = mapLegacyToCanonicalAuthMode(override);
        endStartupPhase('runtime-detection', {
            source: 'auth-runtime-resolver',
            runtimeMode: resolvedMode,
            outcome: 'success',
            details: { overrideApplied: true, production },
        });
        return resolvedMode;
    }
    // Runtime host detection is intentionally conservative to avoid false SPFx
    // positives in standalone web execution.
    if (hasSpfxRuntimeContext()) {
        resolvedMode = 'spfx-context';
        endStartupPhase('runtime-detection', {
            source: 'auth-runtime-resolver',
            runtimeMode: resolvedMode,
            outcome: 'success',
            details: { overrideApplied: false, production },
        });
        return resolvedMode;
    }
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        resolvedMode = 'pwa-msal';
        endStartupPhase('runtime-detection', {
            source: 'auth-runtime-resolver',
            runtimeMode: resolvedMode,
            outcome: 'success',
            details: { overrideApplied: false, production },
        });
        return resolvedMode;
    }
    endStartupPhase('runtime-detection', {
        source: 'auth-runtime-resolver',
        runtimeMode: resolvedMode,
        outcome: 'success',
        details: { overrideApplied: false, production },
    });
    return resolvedMode;
}
/**
 * Compatibility resolver for existing app entrypoints that still branch on
 * legacy values (`msal`, `spfx`).
 */
export function resolveAuthMode() {
    const canonical = resolveCanonicalAuthMode();
    return mapCanonicalToLegacyAuthMode(canonical);
}
/**
 * Translate legacy values to canonical modes.
 */
export function mapLegacyToCanonicalAuthMode(mode) {
    if (mode === 'msal')
        return 'pwa-msal';
    if (mode === 'spfx')
        return 'spfx-context';
    return mode;
}
/**
 * Translate canonical values to compatibility aliases used by existing code.
 */
export function mapCanonicalToLegacyAuthMode(mode) {
    if (mode === 'pwa-msal')
        return 'msal';
    if (mode === 'spfx-context')
        return 'spfx';
    return mode;
}
/**
 * Runtime metadata helper that can be consumed by diagnostics and status UI.
 */
export function describeResolvedAuthRuntime() {
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
function isProductionRuntime() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis;
    const nodeEnv = g?.process?.env?.NODE_ENV;
    return nodeEnv === 'production';
}
function getModeOverride() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis;
    const env = (g?.process?.env ?? {});
    const raw = env.HBC_AUTH_MODE_OVERRIDE;
    if (raw === 'msal' ||
        raw === 'spfx' ||
        raw === 'pwa-msal' ||
        raw === 'spfx-context' ||
        raw === 'mock' ||
        raw === 'dev-override') {
        return raw;
    }
    return null;
}
function hasSpfxRuntimeContext() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis;
    return Boolean(g?._spPageContextInfo || g?.__spfxContext);
}
//# sourceMappingURL=resolveAuthMode.js.map