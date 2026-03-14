/**
 * Wave 0 Configuration Validation — Startup Gate Scaffold
 *
 * Validates that all required environment variables are present before the
 * function app processes requests. Imports the typed registry from
 * wave0-env-registry.ts so there is a single source of truth for config names.
 *
 * IMPORTANT: This function is exported but NOT called at startup.
 * G2.6 (Startup Validation Gate) will wire the call into the initialization path.
 *
 * Reference: docs/reference/configuration/wave-0-config-registry.md
 */

import { WAVE0_REQUIRED_CONFIG } from '../config/wave0-env-registry.js';

/**
 * Validates that all required production environment variables are present.
 * Throws an aggregated error listing every missing variable if any are absent.
 *
 * @throws {Error} Aggregated error with all missing variable names
 */
export function validateRequiredConfig(): void {
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
        `Missing ${missing.length} required environment variable(s):`,
        ...missing,
        '',
        'See docs/reference/configuration/wave-0-config-registry.md for the full registry.',
        'Ensure all required settings are configured in your environment or local.settings.json.',
      ].join('\n'),
    );
  }
}
