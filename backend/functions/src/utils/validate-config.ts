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

import { WAVE0_REQUIRED_CONFIG, type ConfigTier } from '../config/wave0-env-registry.js';
import { diagnosePermissionModel } from './diagnose-permissions.js';

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

  // Sites.Selected conditional gate: when the active permission model is
  // sites-selected (default), IT must confirm the per-site grant workflow
  // (Option A2) is operational before provisioning can proceed.
  const { model } = diagnosePermissionModel();
  if (model === 'sites-selected' && process.env.SITES_SELECTED_GRANT_CONFIRMED !== 'true') {
    issues.push(
      '  - SITES_SELECTED_GRANT_CONFIRMED must be "true" — ' +
      'Sites.Selected (Path A) is active. IT must confirm the per-site grant workflow (Option A2) is operational. ' +
      'See sites-selected-validation.md §3 and tools/grant-site-access.sh.',
    );
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
 * P4-02: Validate only settings in the specified config tier.
 * Core tier validates at startup; SharePoint tier validates on first SP operation.
 *
 * @param tier - The config tier to validate ('core', 'sharepoint', or 'provisioning')
 * @throws {Error} Aggregated error listing all missing variables in the tier
 */
export function validateConfigTier(tier: ConfigTier): void {
  if (!shouldValidateConfig()) return;

  const missing: string[] = [];

  for (const entry of WAVE0_REQUIRED_CONFIG) {
    if (!entry.requiredInProd || entry.configTier !== tier) continue;

    const value = process.env[entry.name];
    if (value === undefined || value === '') {
      missing.push(`  - ${entry.name} (${entry.bucket}): ${entry.description}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      [
        `[StartupValidation:${tier}] Missing ${missing.length} required ${tier}-tier variable(s):`,
        ...missing,
        '',
        'See docs/reference/configuration/wave-0-config-registry.md for the full registry.',
      ].join('\n'),
    );
  }
}

/**
 * P4-02: Validate only core-tier settings (auth, table storage, adapter mode).
 * These are required for ANY request — health probe excepted.
 */
export function validateCoreConfig(): void {
  validateConfigTier('core');
}

/**
 * P4-02: Validate SharePoint-tier settings.
 * Required for SharePoint-dependent operations but not for health or auth-only routes.
 */
export function validateSharePointConfig(): void {
  validateConfigTier('sharepoint');
}

/**
 * P1-09: Validate only the config tiers required by the Project Setup domain host.
 *
 * The Project Setup host needs:
 *   - core tier (auth, table storage, adapter mode) — required at startup
 *   - sharepoint tier (SharePoint URLs) — required for request persistence
 *
 * The Project Setup host does NOT need at startup:
 *   - provisioning tier (saga prerequisites) — validated at saga execution time
 *   - domain CRUD config (leads, projects, etc.) — not part of this host
 *   - email delivery config — stub, not consumed
 *   - notification API base URL — has localhost fallback
 *
 * See: ADR-0124, Phase-1_Backend-Boundary-Freeze.md (AC-6)
 */
export function validateProjectSetupStartupConfig(): void {
  validateCoreConfig();
  // SharePoint config is required for Project Setup request persistence
  // but logged as warning rather than blocking — matches existing tiered behavior
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
