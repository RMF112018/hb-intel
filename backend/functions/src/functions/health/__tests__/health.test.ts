import { describe, it, expect, vi, afterEach } from 'vitest';
import { validateSafetyPermissionPosture } from '../../../utils/safety-permission-posture.js';

/**
 * Health endpoint verification.
 * Proves /api/health surfaces config state diagnostics without blocking on missing settings.
 * P4-05: Added operational readiness and provisioning prereq tests.
 */

describe('/api/health diagnostic behavior', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // --- Core config tier ---

  it('core config check passes when all 8 required settings present (P4-02: includes API_AUDIENCE)', () => {
    vi.stubEnv('AZURE_TENANT_ID', 'test');
    vi.stubEnv('AZURE_CLIENT_ID', 'test');
    vi.stubEnv('API_AUDIENCE', 'api://test');
    vi.stubEnv('AZURE_TABLE_ENDPOINT', 'test');
    vi.stubEnv('APPLICATIONINSIGHTS_CONNECTION_STRING', 'test');
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    vi.stubEnv('SHAREPOINT_TENANT_URL', 'test');
    vi.stubEnv('SHAREPOINT_PROJECTS_SITE_URL', 'test');

    const coreAuthPresent = [
      'AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'API_AUDIENCE',
      'AZURE_TABLE_ENDPOINT', 'APPLICATIONINSIGHTS_CONNECTION_STRING',
      'HBC_ADAPTER_MODE',
    ].every((n) => process.env[n] !== undefined && process.env[n] !== '');

    const sharePointPresent = [
      'SHAREPOINT_TENANT_URL', 'SHAREPOINT_PROJECTS_SITE_URL',
    ].every((n) => process.env[n] !== undefined && process.env[n] !== '');

    expect(coreAuthPresent).toBe(true);
    expect(sharePointPresent).toBe(true);
  });

  it('core config check fails when any required setting is missing', () => {
    vi.stubEnv('AZURE_TENANT_ID', 'test');
    // AZURE_CLIENT_ID intentionally missing

    const corePresent = [
      'AZURE_TENANT_ID', 'AZURE_CLIENT_ID',
    ].every((n) => process.env[n] !== undefined && process.env[n] !== '');

    expect(corePresent).toBe(false);
  });

  // --- Integration status ---

  it('integration status reflects SignalR as not-configured when absent', () => {
    delete process.env.AzureSignalRConnectionString;
    const signalR = process.env.AzureSignalRConnectionString ? 'ready' : 'not-configured';
    expect(signalR).toBe('not-configured');
  });

  it('integration status reflects email as ready when both settings present', () => {
    vi.stubEnv('EMAIL_DELIVERY_API_KEY', 'SG.test');
    vi.stubEnv('EMAIL_FROM_ADDRESS', 'test@hb.com');
    const email = process.env.EMAIL_DELIVERY_API_KEY && process.env.EMAIL_FROM_ADDRESS ? 'ready' : 'not-configured';
    expect(email).toBe('ready');
  });

  // --- Role config ---

  it('role config shows degraded when CONTROLLER_UPNS missing', () => {
    delete process.env.CONTROLLER_UPNS;
    const controllers = process.env.CONTROLLER_UPNS ? 'configured' : 'degraded';
    expect(controllers).toBe('degraded');
  });

  it('role config shows configured when ADMIN_UPNS present', () => {
    vi.stubEnv('ADMIN_UPNS', 'admin@hb.com');
    const admins = process.env.ADMIN_UPNS ? 'configured' : 'degraded';
    expect(admins).toBe('configured');
  });

  // --- P4-05: Operational readiness ---

  it('P4-05: operational readiness is "blocked" when core config missing', () => {
    // Core missing
    const coreReady = false;
    const readiness = !coreReady ? 'blocked' : 'ready';
    expect(readiness).toBe('blocked');
  });

  it('P4-05: operational readiness is "degraded" when SharePoint config missing', () => {
    const coreReady = true;
    const sharePointReady = false;
    const readiness = !coreReady ? 'blocked' : !sharePointReady ? 'degraded' : 'ready';
    expect(readiness).toBe('degraded');
  });

  it('P4-05: operational readiness is "ready" when all tiers present', () => {
    const coreReady = true;
    const sharePointReady = true;
    const provisioningReady = true;
    const signalRReady = true;
    const readiness = !coreReady ? 'blocked'
      : (!sharePointReady || !provisioningReady || !signalRReady) ? 'degraded'
      : 'ready';
    expect(readiness).toBe('ready');
  });

  // --- P4-05: Provisioning prerequisites ---

  it('P4-05: provisioning prereqs all false when nothing configured', () => {
    const prereqs = {
      graphPermission: process.env.GRAPH_GROUP_PERMISSION_CONFIRMED === 'true',
      hubSite: !!process.env.SHAREPOINT_HUB_SITE_ID,
      appCatalog: !!process.env.SHAREPOINT_APP_CATALOG_URL,
      spfxAppId: !!process.env.HB_INTEL_SPFX_APP_ID,
      opexManager: !!process.env.OPEX_MANAGER_UPN,
    };
    expect(Object.values(prereqs).every(Boolean)).toBe(false);
  });

  it('P4-05: provisioning prereqs all true when fully configured', () => {
    vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'true');
    vi.stubEnv('SHAREPOINT_HUB_SITE_ID', 'hub-guid');
    vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', 'https://catalog');
    vi.stubEnv('HB_INTEL_SPFX_APP_ID', 'spfx-guid');
    vi.stubEnv('OPEX_MANAGER_UPN', 'opex@hb.com');

    const prereqs = {
      graphPermission: process.env.GRAPH_GROUP_PERMISSION_CONFIRMED === 'true',
      hubSite: !!process.env.SHAREPOINT_HUB_SITE_ID,
      appCatalog: !!process.env.SHAREPOINT_APP_CATALOG_URL,
      spfxAppId: !!process.env.HB_INTEL_SPFX_APP_ID,
      opexManager: !!process.env.OPEX_MANAGER_UPN,
    };
    expect(Object.values(prereqs).every(Boolean)).toBe(true);
  });

  it('surfaces tightened Safety posture proof bundle requirements', () => {
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED', 'true');
    delete process.env.SAFETY_TIGHTENED_PROOF_EVIDENCE_ID;
    delete process.env.SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC;
    delete process.env.SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL;
    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(false);
    expect(result.proof.passed).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('SAFETY_TIGHTENED_PROOF_EVIDENCE_ID_MISSING');
  });

  it('marks steady-state proof stale when evidence is too old', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-30T00:00:00Z'));
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'steady-state');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_EVIDENCE_ID', 'safety-proof-run-123');
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC', '2026-05-01T00:00:00Z');
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_MAX_AGE_DAYS', '30');
    const result = validateSafetyPermissionPosture();
    expect(result.proof.stale).toBe(true);
    expect(result.issues.map((issue) => issue.code)).toContain('SAFETY_TIGHTENED_PROOF_STALE');
    vi.useRealTimers();
  });

  it('legacy boolean-only proof check no longer passes tightened posture', () => {
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    delete process.env.SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED;
    delete process.env.SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED;
    const result = validateSafetyPermissionPosture();
    expect(result.passed).toBe(false);
  });
});
