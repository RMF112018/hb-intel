/**
 * Wave 0 Configuration Validation — Startup Gate (G2.6)
 *
 * Validates that all required environment variables are present before the
 * function app processes requests. Called by createServiceFactory() on first
 * invocation in non-mock mode. Skips validation in mock/test mode since
 * mock services don't need real infrastructure config.
 *
 * Reference: docs/reference/configuration/wave-0-config-registry.md
 */

import { WAVE0_REQUIRED_CONFIG } from '../config/wave0-env-registry.js';

/**
 * Returns true if startup config validation should run.
 * Skips in mock mode or test mode since mock services don't need real config.
 */
export function shouldValidateConfig(): boolean {
  const adapterMode = process.env.HBC_ADAPTER_MODE ?? 'real';
  const isTest = process.env.NODE_ENV === 'test';
  return adapterMode !== 'mock' && !isTest;
}

/**
 * Validates that all required production environment variables are present.
 * Throws an aggregated error listing every missing variable if any are absent.
 * Skips validation entirely in mock/test mode.
 *
 * @throws {Error} Aggregated error with all missing variable names
 */
export function validateRequiredConfig(): void {
  if (!shouldValidateConfig()) {
    return;
  }

  const missing: string[] = [];

  for (const entry of WAVE0_REQUIRED_CONFIG) {
    if (!entry.requiredInProd) {
      continue;
    }

    const value = process.env[entry.name];
    if (value === undefined || value === '') {
      missing.push(`  - ${entry.name} (${entry.bucket}): ${entry.description}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      [
        `[StartupValidation] Missing ${missing.length} required environment variable(s):`,
        ...missing,
        '',
        'See docs/reference/configuration/wave-0-config-registry.md for the full registry.',
        'Ensure all required settings are configured in your environment or local.settings.json.',
      ].join('\n'),
    );
  }
}
