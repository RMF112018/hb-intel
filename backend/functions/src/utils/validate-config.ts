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
  const adapterMode = process.env.HBC_ADAPTER_MODE ?? 'proxy';
  const isTest = process.env.NODE_ENV === 'test';
  return adapterMode !== 'mock' && !isTest;
}

/**
 * Provisioning-specific prerequisites that must be satisfied before the saga can execute.
 * These go beyond general startup validation — they include tenant permission gates
 * that may not be confirmed until IT completes setup.
 */
const PROVISIONING_PREREQUISITES = [
  { name: 'GRAPH_GROUP_PERMISSION_CONFIRMED', expected: 'true', description: 'Entra ID Group.ReadWrite.All permission confirmed by IT (see IT-Department-Setup-Guide.md §8.4)' },
  { name: 'AZURE_TENANT_ID', description: 'Entra ID tenant identifier (required for group-to-site permission assignment)' },
  { name: 'SHAREPOINT_TENANT_URL', description: 'Root SharePoint tenant URL' },
  { name: 'SHAREPOINT_HUB_SITE_ID', description: 'Hub site GUID for Step 7 association' },
  { name: 'SHAREPOINT_APP_CATALOG_URL', description: 'Tenant app catalog URL for Step 5 SPFx installation' },
  { name: 'HB_INTEL_SPFX_APP_ID', description: 'SPFx app package GUID for Step 5' },
  { name: 'OPEX_MANAGER_UPN', description: 'OpEx manager UPN for Step 6 Leaders group membership' },
] as const;

/**
 * Validates that all provisioning-specific prerequisites are satisfied.
 * Called at the start of SagaOrchestrator.execute() to fail fast with a clear error
 * rather than failing mid-saga at an arbitrary step.
 *
 * Skips in mock/test mode since mock services don't need real infrastructure.
 *
 * @throws {Error} Aggregated error listing all missing/unsatisfied prerequisites
 */
export function validateProvisioningPrerequisites(): void {
  if (!shouldValidateConfig()) return;

  const issues: string[] = [];

  for (const prereq of PROVISIONING_PREREQUISITES) {
    const value = process.env[prereq.name];
    if ('expected' in prereq) {
      if (value !== prereq.expected) {
        issues.push(`  - ${prereq.name} must be "${prereq.expected}" (${prereq.description})`);
      }
    } else if (!value) {
      issues.push(`  - ${prereq.name}: ${prereq.description}`);
    }
  }

  if (issues.length > 0) {
    throw new Error(
      [
        `[ProvisioningPrerequisites] ${issues.length} prerequisite(s) not satisfied:`,
        ...issues,
        '',
        'Provisioning cannot proceed until all prerequisites are met.',
        'See backend/functions/README.md "Provisioning Staging Gates" for the full checklist.',
      ].join('\n'),
    );
  }
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
