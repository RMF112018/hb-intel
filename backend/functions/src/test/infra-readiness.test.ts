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
  it('host.json contains CORS configuration', () => {
    const hostJson = JSON.parse(readFileSync(resolve(FUNCTIONS_ROOT, 'host.json'), 'utf-8'));
    expect(hostJson.extensions?.http?.cors).toBeDefined();
    expect(hostJson.extensions.http.cors.allowedOrigins).toBeInstanceOf(Array);
    expect(hostJson.extensions.http.cors.allowedOrigins.length).toBeGreaterThan(0);
    expect(hostJson.extensions.http.cors.supportCredentials).toBe(true);
  });

  it('CORS allows SharePoint origins', () => {
    const hostJson = JSON.parse(readFileSync(resolve(FUNCTIONS_ROOT, 'host.json'), 'utf-8'));
    const origins: string[] = hostJson.extensions.http.cors.allowedOrigins;
    const hasSharePoint = origins.some((o) => o.includes('sharepoint.com'));
    expect(hasSharePoint).toBe(true);
  });

  it('CORS does not allow wildcard (*) origin', () => {
    const hostJson = JSON.parse(readFileSync(resolve(FUNCTIONS_ROOT, 'host.json'), 'utf-8'));
    const origins: string[] = hostJson.extensions.http.cors.allowedOrigins;
    expect(origins).not.toContain('*');
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
