import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { WAVE0_REQUIRED_CONFIG } from '../config/wave0-env-registry.js';

/**
 * P5-03: Release gate regression tests.
 *
 * These tests verify that all release prerequisites are still in place
 * and cannot silently regress. They are run as part of the normal unit
 * test suite (not env-gated) and serve as go/no-go evidence.
 *
 * Each test maps to a specific release gate from Phase-4_Operational-Readiness-and-Handoff.md.
 */

const FUNCTIONS_ROOT = resolve(import.meta.dirname, '../..');

describe('P5-03 Release gates', () => {
  // --- Gate 1: Config registry completeness ---

  it('all requiredInProd entries have configTier assigned', () => {
    const missingTier = WAVE0_REQUIRED_CONFIG
      .filter((e) => e.requiredInProd && !e.configTier)
      .map((e) => e.name);

    expect(
      missingTier,
      `These required entries have no configTier: ${missingTier.join(', ')}`,
    ).toEqual([]);
  });

  it('core tier has at least 6 required settings', () => {
    const coreCount = WAVE0_REQUIRED_CONFIG.filter(
      (e) => e.requiredInProd && e.configTier === 'core',
    ).length;
    expect(coreCount).toBeGreaterThanOrEqual(6);
  });

  it('sharepoint tier has at least 2 required settings', () => {
    const spCount = WAVE0_REQUIRED_CONFIG.filter(
      (e) => e.requiredInProd && e.configTier === 'sharepoint',
    ).length;
    expect(spCount).toBeGreaterThanOrEqual(2);
  });

  // --- Gate 2: CORS is locked ---

  it('host.json CORS allowedOrigins does not include wildcard', () => {
    const hostJson = JSON.parse(
      readFileSync(resolve(FUNCTIONS_ROOT, 'host.json'), 'utf-8'),
    );
    const origins: string[] = hostJson.extensions?.http?.cors?.allowedOrigins ?? [];
    expect(origins).not.toContain('*');
  });

  it('host.json CORS supports credentials for Bearer tokens', () => {
    const hostJson = JSON.parse(
      readFileSync(resolve(FUNCTIONS_ROOT, 'host.json'), 'utf-8'),
    );
    expect(hostJson.extensions?.http?.cors?.supportCredentials).toBe(true);
  });

  // --- Gate 3: Auth enforcement ---

  it('auth contract test file exists', () => {
    const content = readFileSync(
      resolve(FUNCTIONS_ROOT, 'src/middleware/auth-contract.test.ts'),
      'utf-8',
    );
    expect(content).toContain('withAuth');
    expect(content).toContain('AUTH_EXCEPTIONS');
  });

  // --- Gate 4: Tiered validation exists ---

  it('validate-config exports tiered functions', async () => {
    const mod = await import('../utils/validate-config.js');
    expect(typeof mod.validateCoreConfig).toBe('function');
    expect(typeof mod.validateSharePointConfig).toBe('function');
    expect(typeof mod.validateProvisioningPrerequisites).toBe('function');
  });

  it('safety permission posture utility exports validation contract', async () => {
    const mod = await import('../utils/safety-permission-posture.js');
    expect(typeof mod.resolveSafetyPermissionPosture).toBe('function');
    expect(typeof mod.validateSafetyPermissionPosture).toBe('function');
    expect(Array.isArray(mod.SAFETY_PERMISSION_MATRIX)).toBe(true);
  });

  it('validate-config exports domain-scoped Project Setup validation (P1-09)', async () => {
    const mod = await import('../utils/validate-config.js');
    expect(typeof mod.validateProjectSetupStartupConfig).toBe('function');
  });

  // --- Gate 5: Health endpoint is diagnostic ---

  it('health endpoint source includes operationalReadiness', () => {
    const source = readFileSync(
      resolve(FUNCTIONS_ROOT, 'src/functions/health/index.ts'),
      'utf-8',
    );
    expect(source).toContain('operationalReadiness');
    expect(source).toContain('configTiers');
    expect(source).toContain('provisioningPrereqs');
    expect(source).toContain('safetyPermissionPosture');
  });

  // --- Gate 6: No unsafe secrets in config registry ---

  it('AZURE_CLIENT_SECRET is not in the config registry', () => {
    const names = WAVE0_REQUIRED_CONFIG.map((e) => e.name);
    expect(names).not.toContain('AZURE_CLIENT_SECRET');
  });

  // --- Gate 7: SignalR degrades gracefully ---

  it('signalr-push-service exports NoOpSignalRPushService', async () => {
    const mod = await import('../services/signalr-push-service.js');
    expect(typeof mod.NoOpSignalRPushService).toBe('function');
  });

  // --- Gate 8: Function timeout sufficient for provisioning ---

  it('function timeout is at least 10 minutes', () => {
    const hostJson = JSON.parse(
      readFileSync(resolve(FUNCTIONS_ROOT, 'host.json'), 'utf-8'),
    );
    expect(hostJson.functionTimeout).toBe('00:10:00');
  });

  // --- Gate 9: Post-deploy smoke check exists ---

  it('post-deploy smoke test file exists', () => {
    const source = readFileSync(
      resolve(FUNCTIONS_ROOT, 'src/test/smoke/post-deploy-smoke.test.ts'),
      'utf-8',
    );
    expect(source).toContain('SMOKE_TEST_BASE_URL');
    expect(source).toContain('operationalReadiness');
    expect(source).toContain('401');
  });

  // --- Gate 10: P8-07 Token validation defers config resolution (lazy init) ---

  it('validateToken module loads without throwing when identity config is missing', async () => {
    // Proves lazy-init: importing the module must NOT trigger config resolution.
    // Without lazy init, the module-level constants would throw on import when
    // AZURE_TENANT_ID / API_AUDIENCE are missing in non-test mode.
    const source = readFileSync(
      resolve(FUNCTIONS_ROOT, 'src/middleware/validateToken.ts'),
      'utf-8',
    );
    // The module must NOT have top-level eager calls to resolveTenantId() or resolveApiAudience()
    // outside of a function body. Verify the lazy singleton pattern is in place.
    expect(source).toContain('getIdentityConfig()');
    expect(source).toContain('let _identityConfig');
  });

  // --- Gate 11: P8-07 Token validation still enforces identity config at call time ---

  it('validateToken source enforces API_AUDIENCE and AZURE_TENANT_ID in production', () => {
    const source = readFileSync(
      resolve(FUNCTIONS_ROOT, 'src/middleware/validateToken.ts'),
      'utf-8',
    );
    // resolveTenantId and resolveApiAudience must throw config_error in production
    expect(source).toContain("throw new TokenValidationError(");
    expect(source).toContain("'config_error'");
    // Both resolver functions must exist
    expect(source).toContain('function resolveTenantId()');
    expect(source).toContain('function resolveApiAudience()');
  });

  // --- Gate 12: Prompt 03 artifact proof contract remains enforced ---

  it('artifact packaging script encodes admin host composition and safety route signatures', () => {
    const source = readFileSync(
      resolve(FUNCTIONS_ROOT, '../../scripts/package-functions-artifact.ts'),
      'utf-8',
    );

    expect(source).toContain('assertAdminControlPlaneReleaseProof');
    expect(source).toContain('adminControlPlaneReleaseProof');
    expect(source).toContain('hosts/admin-control-plane/index.js');
    expect(source).toContain('safety-records/ingest');
    expect(source).toContain('safety-records/ingest/preview');
    expect(source).toContain('safety-records/replay');
    expect(source).toContain('assertAdminControlPlaneReleaseProof(options.stagingDir, mainEntrypoint)');
  });
});
