import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * P4-05: Infrastructure readiness regression tests.
 *
 * These tests verify that Phase 4 infrastructure hardening choices
 * are preserved and cannot silently regress.
 */

// src/test/ → ../../ → backend/functions/
const FUNCTIONS_ROOT = resolve(import.meta.dirname, '../..');

describe('P4-05 Infrastructure readiness', () => {
  it('host.json does not declare CORS (App Service CORS is the single enforcement seam)', () => {
    const hostJson = JSON.parse(readFileSync(resolve(FUNCTIONS_ROOT, 'host.json'), 'utf-8'));
    // In Azure, App Service CORS overrides host.json CORS. Declaring CORS in
    // both places creates a silent dual-seam drift risk. The authoritative
    // enforcement seam is the Azure Function App CORS configuration managed
    // by the deploy pipeline; host.json must not shadow it.
    expect(hostJson.extensions?.http?.cors).toBeUndefined();
  });

  it('validate-config exposes rollout-posture validation', async () => {
    const mod = await import('../utils/validate-config.js');
    expect(typeof mod.validateRolloutPostureConfig).toBe('function');
    expect(typeof mod.isRolloutPostureActive).toBe('function');
  });

  it('rollout-posture CORS validation rejects wildcard origins', async () => {
    const mod = await import('../utils/validate-config.js');
    const prev = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      process.env.HBC_ADAPTER_MODE = 'proxy';
      process.env.ENVIRONMENT_POSTURE = 'rollout';
      process.env.AZURE_TENANT_ID = 'tid';
      process.env.AZURE_CLIENT_ID = 'cid';
      process.env.API_AUDIENCE = 'api://cid';
      process.env.AZURE_TABLE_ENDPOINT = 'https://tbl';
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = 'ic=1';
      process.env.SHAREPOINT_TENANT_URL = 'https://x.sharepoint.com';
      process.env.SHAREPOINT_PROJECTS_SITE_URL = 'https://x.sharepoint.com/sites/a';
      process.env.HBC_FUNCTIONS_BUILD_SHA = 'abc';
      process.env.HBC_FUNCTIONS_BUILD_VERSION = '0.0.0';
      process.env.ADMIN_READINESS_APP_ROLE = 'HBIntelAdmin';
      process.env.CORS_ALLOWED_ORIGINS = '*';
      expect(() => mod.validateRolloutPostureConfig()).toThrow(/CORS_ALLOWED_ORIGINS.*wildcard/);
    } finally {
      Object.assign(process.env, prev);
      for (const k of Object.keys(process.env)) if (!(k in prev)) delete process.env[k];
    }
  });

  it('rollout-posture CORS validation rejects missing tenant origin', async () => {
    const mod = await import('../utils/validate-config.js');
    const prev = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      process.env.HBC_ADAPTER_MODE = 'proxy';
      process.env.ENVIRONMENT_POSTURE = 'rollout';
      process.env.AZURE_TENANT_ID = 'tid';
      process.env.AZURE_CLIENT_ID = 'cid';
      process.env.API_AUDIENCE = 'api://cid';
      process.env.AZURE_TABLE_ENDPOINT = 'https://tbl';
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = 'ic=1';
      process.env.SHAREPOINT_TENANT_URL = 'https://contoso.sharepoint.com';
      process.env.SHAREPOINT_PROJECTS_SITE_URL = 'https://contoso.sharepoint.com/sites/a';
      process.env.HBC_FUNCTIONS_BUILD_SHA = 'abc';
      process.env.HBC_FUNCTIONS_BUILD_VERSION = '0.0.0';
      process.env.ADMIN_READINESS_APP_ROLE = 'HBIntelAdmin';
      process.env.CORS_ALLOWED_ORIGINS = 'https://other.sharepoint.com,https://localhost:4321';
      expect(() => mod.validateRolloutPostureConfig()).toThrow(
        /must include SHAREPOINT_TENANT_URL origin/i,
      );
    } finally {
      Object.assign(process.env, prev);
      for (const k of Object.keys(process.env)) if (!(k in prev)) delete process.env[k];
    }
  });

  it('rollout-posture CORS validation accepts explicit tenant origin', async () => {
    const mod = await import('../utils/validate-config.js');
    const prev = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      process.env.HBC_ADAPTER_MODE = 'proxy';
      process.env.ENVIRONMENT_POSTURE = 'rollout';
      process.env.AZURE_TENANT_ID = 'tid';
      process.env.AZURE_CLIENT_ID = 'cid';
      process.env.API_AUDIENCE = 'api://cid';
      process.env.AZURE_TABLE_ENDPOINT = 'https://tbl';
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = 'ic=1';
      process.env.SHAREPOINT_TENANT_URL = 'https://contoso.sharepoint.com';
      process.env.SHAREPOINT_PROJECTS_SITE_URL = 'https://contoso.sharepoint.com/sites/a';
      process.env.HBC_FUNCTIONS_BUILD_SHA = 'abc';
      process.env.HBC_FUNCTIONS_BUILD_VERSION = '0.0.0';
      process.env.ADMIN_READINESS_APP_ROLE = 'HBIntelAdmin';
      process.env.CORS_ALLOWED_ORIGINS =
        'https://contoso.sharepoint.com,https://localhost:4321';
      expect(() => mod.validateRolloutPostureConfig()).not.toThrow();
    } finally {
      Object.assign(process.env, prev);
      for (const k of Object.keys(process.env)) if (!(k in prev)) delete process.env[k];
    }
  });

  it('host.json has 10-minute function timeout for provisioning saga', () => {
    const hostJson = JSON.parse(readFileSync(resolve(FUNCTIONS_ROOT, 'host.json'), 'utf-8'));
    expect(hostJson.functionTimeout).toBe('00:10:00');
  });

  it('host.json has SignalR extension configured', () => {
    const hostJson = JSON.parse(readFileSync(resolve(FUNCTIONS_ROOT, 'host.json'), 'utf-8'));
    expect(hostJson.extensions?.signalR?.connectionStringSetting).toBe('AzureSignalRConnectionString');
  });

  it('tiered validation functions exist', async () => {
    const mod = await import('../utils/validate-config.js');
    expect(typeof mod.validateCoreConfig).toBe('function');
    expect(typeof mod.validateSharePointConfig).toBe('function');
    expect(typeof mod.validateConfigTier).toBe('function');
    expect(typeof mod.validateProvisioningPrerequisites).toBe('function');
  });

  it('config registry exports ConfigTier type', async () => {
    const mod = await import('../config/wave0-env-registry.js');
    expect(mod.WAVE0_REQUIRED_CONFIG).toBeDefined();
    // Verify configTier field exists on core entries
    const coreEntries = mod.WAVE0_REQUIRED_CONFIG.filter(
      (e: { configTier?: string }) => e.configTier === 'core',
    );
    expect(coreEntries.length).toBeGreaterThanOrEqual(5);
  });
});
