/**
 * B3 Layer 2 — Adapter-Mode Startup Guard
 *
 * Normalizes adapter-mode vocabulary and enforces mock-isolation rules.
 * Called during service factory initialization to fail fast on invalid states.
 *
 * Canonical adapter modes (Phase 1):
 *   'mock'  — In-memory mock services (dev/test only)
 *   'proxy' — Real production services (Managed Identity, SharePoint, Graph)
 *
 * Backward compatibility:
 *   'real'  — Treated as alias for 'proxy' (legacy; will be removed post-Phase 1)
 *
 * Reference: P1-B3 Mock Isolation Policy, Lane 3 (Layer 2 enforcement)
 */

/** Canonical backend adapter mode after normalization. */
export type BackendAdapterMode = 'mock' | 'proxy';

/**
 * Normalize an adapter-mode string to canonical vocabulary.
 * - 'proxy' → 'proxy' (canonical production mode)
 * - 'real' → 'proxy' (backward-compat alias)
 * - 'mock' → 'mock' (canonical dev/test mode)
 * - anything else → throws
 *
 * @throws {Error} If the mode is not recognized
 */
export function normalizeAdapterMode(raw: string): BackendAdapterMode {
  switch (raw) {
    case 'proxy':
    case 'real': // backward-compat alias → canonical 'proxy'
      return 'proxy';
    case 'mock':
      return 'mock';
    default:
      throw new Error(
        `[AdapterModeGuard] Unknown adapter mode: "${raw}". ` +
        'Valid values: "proxy" (production), "mock" (dev/test). ' +
        'Set HBC_ADAPTER_MODE in environment or local.settings.json.'
      );
  }
}

/**
 * B3 Layer 2 startup guard.
 *
 * Validates adapter mode and enforces mock-isolation rules:
 * 1. Normalizes HBC_ADAPTER_MODE to canonical vocabulary
 * 2. Rejects unknown mode values
 * 3. Blocks mock mode in Azure Functions Production environment
 *    (unless NODE_ENV=test, which indicates a test runner context)
 *
 * @returns The normalized adapter mode for use by service factory
 * @throws {Error} If mode is invalid or mock-in-production is detected
 */
export function assertAdapterModeValid(): BackendAdapterMode {
  const raw = process.env.HBC_ADAPTER_MODE ?? 'proxy';
  const mode = normalizeAdapterMode(raw);

  const isProduction = process.env.AZURE_FUNCTIONS_ENVIRONMENT === 'Production';
  const isTest = process.env.NODE_ENV === 'test';

  if (mode === 'mock' && isProduction && !isTest) {
    throw new Error(
      '[AdapterModeGuard] Mock mode is not permitted in production. ' +
      'HBC_ADAPTER_MODE=mock is set but AZURE_FUNCTIONS_ENVIRONMENT=Production. ' +
      'Use HBC_ADAPTER_MODE=proxy for production deployments.'
    );
  }

  return mode;
}
