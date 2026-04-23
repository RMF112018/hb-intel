import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validatePrelaunchReadiness,
  assertPrelaunchReady,
  type IPrelaunchValidationResult,
} from '../prelaunch-validation.js';
import type { IProvisionSiteRequest } from '@hbc/models';

/** Minimal valid request that passes all request-data checks. */
function validRequest(overrides?: Partial<IProvisionSiteRequest>): IProvisionSiteRequest {
  return {
    projectId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    projectNumber: '24-001-01',
    projectName: 'Test Project',
    correlationId: '11111111-2222-3333-4444-555555555555',
    triggeredBy: 'admin@hb.com',
    submittedBy: 'coordinator@hb.com',
    groupMembers: ['member1@hb.com', 'member2@hb.com'],
    department: 'commercial',
    ...overrides,
  } as IProvisionSiteRequest;
}

/** Set all environment prerequisites to valid values. */
function setAllEnvPrereqs(): void {
  vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'true');
  vi.stubEnv('AZURE_TENANT_ID', 'tenant-id');
  vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://example.sharepoint.com');
  vi.stubEnv('SHAREPOINT_HUB_SITE_ID', 'hub-id');
  vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', 'https://example.sharepoint.com/sites/appcatalog');
  vi.stubEnv('HB_INTEL_SPFX_APP_ID', 'spfx-id');
  vi.stubEnv('OPEX_MANAGER_UPN', 'opex@hb.com');
  vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
  vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
  vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
  vi.stubEnv('SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED', 'true');
  vi.stubEnv('SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED', 'true');
  vi.stubEnv('SAFETY_TIGHTENED_PROOF_EVIDENCE_ID', 'safety-proof-run-001');
  vi.stubEnv('SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC', '2026-04-22T13:00:00Z');
  vi.stubEnv('SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL', 'sites-selected');
  vi.stubEnv('SAFETY_ROLLOUT_GATE_ENABLED', 'true');
  vi.stubEnv('SAFETY_ROLLOUT_CHECKPOINT_ID', 'safety-rollout-2026-04-23');
  // P7-07: Bootstrap prerequisites
  vi.stubEnv('AZURE_TABLE_ENDPOINT', 'https://example.table.core.windows.net');
  vi.stubEnv('AZURE_CLIENT_ID', 'client-id');
  vi.stubEnv('API_AUDIENCE', 'api://hb-intel');
  vi.stubEnv('APPLICATIONINSIGHTS_CONNECTION_STRING', 'InstrumentationKey=test');
  // P7-07: Entra readiness — department viewer config for default test request
  vi.stubEnv('DEPT_BACKGROUND_ACCESS_COMMERCIAL', 'viewer1@hb.com');
}

describe('validatePrelaunchReadiness', () => {
  beforeEach(() => {
    setAllEnvPrereqs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // --- Happy path ---

  it('returns ok:true when all prerequisites and request data are valid', () => {
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('valid request still launches when all env vars are set', () => {
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(true);
  });

  // --- Environment prerequisite failures ---

  it('detects missing SHAREPOINT_TENANT_URL', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('MISSING_ENV_SHAREPOINT_TENANT_URL');
  });

  it('detects GRAPH_GROUP_PERMISSION_CONFIRMED not set to true', () => {
    vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'false');
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('ENV_GRAPH_PERMISSION_NOT_CONFIRMED');
  });

  it('aggregates multiple missing env vars', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    delete process.env.SHAREPOINT_HUB_SITE_ID;
    delete process.env.OPEX_MANAGER_UPN;
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(false);
    expect(result.failures.length).toBeGreaterThanOrEqual(3);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('MISSING_ENV_SHAREPOINT_TENANT_URL');
    expect(codes).toContain('MISSING_ENV_SHAREPOINT_HUB_SITE_ID');
    expect(codes).toContain('MISSING_ENV_OPEX_MANAGER_UPN');
  });

  it('detects Sites.Selected grant not confirmed', () => {
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    delete process.env.SITES_SELECTED_GRANT_CONFIRMED;
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('ENV_SITES_SELECTED_GRANT_NOT_CONFIRMED');
  });

  it('skips Sites.Selected gate when fullcontrol is active', () => {
    vi.stubEnv('SITES_PERMISSION_MODEL', 'fullcontrol');
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'staging-broad');
    vi.stubEnv('SAFETY_STAGING_BROAD_EXCEPTION_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_STAGING_BROAD_EXCEPTION_REASON', 'Temporary staging exception until 2026-05-15');
    delete process.env.SITES_SELECTED_GRANT_CONFIRMED;
    const result = validatePrelaunchReadiness(validRequest());
    const codes = result.failures.map((f) => f.code);
    expect(codes).not.toContain('ENV_SITES_SELECTED_GRANT_NOT_CONFIRMED');
  });

  it('detects missing tightened posture proof flags', () => {
    delete process.env.SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED;
    delete process.env.SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED;
    const result = validatePrelaunchReadiness(validRequest());
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('SAFETY_TIGHTENED_POSTURE_PROOF_NOT_CONFIRMED');
    expect(codes).toContain('SAFETY_TIGHTENED_E2E_PROOF_NOT_CONFIRMED');
  });

  it('detects missing tightened proof bundle metadata', () => {
    delete process.env.SAFETY_TIGHTENED_PROOF_EVIDENCE_ID;
    delete process.env.SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC;
    delete process.env.SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL;
    const result = validatePrelaunchReadiness(validRequest());
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('SAFETY_TIGHTENED_PROOF_EVIDENCE_ID_MISSING');
    expect(codes).toContain('SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC_MISSING');
    expect(codes).toContain('SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL_MISSING');
  });

  it('skips environment checks in mock mode', () => {
    vi.unstubAllEnvs();
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    // All env vars missing — would fail if checked
    const result = validatePrelaunchReadiness(validRequest());
    // Only request-data checks run — valid request passes
    expect(result.ok).toBe(true);
  });

  it('skips environment checks in test mode', () => {
    vi.unstubAllEnvs();
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    vi.stubEnv('NODE_ENV', 'test');
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(true);
  });

  // --- Request data validation ---

  it('detects missing projectId', () => {
    const result = validatePrelaunchReadiness(validRequest({ projectId: '' }));
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('REQUEST_MISSING_PROJECT_ID');
  });

  it('detects missing projectNumber', () => {
    const result = validatePrelaunchReadiness(validRequest({ projectNumber: '' }));
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('REQUEST_MISSING_PROJECT_NUMBER');
  });

  it('detects invalid projectNumber format', () => {
    const result = validatePrelaunchReadiness(validRequest({ projectNumber: 'ABC-123' }));
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('REQUEST_INVALID_PROJECT_NUMBER_FORMAT');
  });

  it('detects missing projectName', () => {
    const result = validatePrelaunchReadiness(validRequest({ projectName: '' }));
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('REQUEST_MISSING_PROJECT_NAME');
  });

  it('detects missing triggeredBy', () => {
    const result = validatePrelaunchReadiness(validRequest({ triggeredBy: '' }));
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('REQUEST_MISSING_TRIGGERED_BY');
  });

  it('detects missing submittedBy', () => {
    const result = validatePrelaunchReadiness(validRequest({ submittedBy: '' }));
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('REQUEST_MISSING_SUBMITTED_BY');
  });

  it('detects empty groupMembers array', () => {
    const result = validatePrelaunchReadiness(validRequest({ groupMembers: [] }));
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('REQUEST_EMPTY_GROUP_MEMBERS');
  });

  // --- Mixed failures ---

  it('aggregates environment and request-data failures together', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    const result = validatePrelaunchReadiness(validRequest({ groupMembers: [] }));
    expect(result.ok).toBe(false);
    const categories = new Set(result.failures.map((f) => f.category));
    expect(categories).toContain('environment');
    expect(categories).toContain('request-data');
  });

  // --- Failure structure ---

  it('every failure has code, category, message, and remediation', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    const result = validatePrelaunchReadiness(validRequest({ projectId: '' }));
    for (const failure of result.failures) {
      expect(failure.code).toBeTruthy();
      expect(failure.category).toBeTruthy();
      expect(failure.message).toBeTruthy();
      expect(failure.remediation).toBeTruthy();
    }
  });

  it('failure codes are stable machine-readable strings', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    delete process.env.OPEX_MANAGER_UPN;
    const result = validatePrelaunchReadiness(validRequest({ projectId: '' }));
    const codes = result.failures.map((f) => f.code);
    // Codes should be uppercase with underscores — no spaces or special chars
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z][A-Z0-9_]+$/);
    }
  });

  // --- P7-07: Bootstrap prerequisite failures ---

  it('detects missing AZURE_TABLE_ENDPOINT', () => {
    delete process.env.AZURE_TABLE_ENDPOINT;
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('BOOTSTRAP_MISSING_TABLE_ENDPOINT');
    expect(result.failures.find((f) => f.code === 'BOOTSTRAP_MISSING_TABLE_ENDPOINT')?.category).toBe('bootstrap');
  });

  it('detects missing AZURE_CLIENT_ID', () => {
    delete process.env.AZURE_CLIENT_ID;
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('BOOTSTRAP_MISSING_CLIENT_ID');
  });

  it('detects missing API_AUDIENCE', () => {
    delete process.env.API_AUDIENCE;
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('BOOTSTRAP_MISSING_API_AUDIENCE');
  });

  it('detects missing APPLICATIONINSIGHTS_CONNECTION_STRING', () => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('BOOTSTRAP_MISSING_APP_INSIGHTS');
  });

  it('aggregates multiple bootstrap failures', () => {
    delete process.env.AZURE_TABLE_ENDPOINT;
    delete process.env.AZURE_CLIENT_ID;
    delete process.env.API_AUDIENCE;
    const result = validatePrelaunchReadiness(validRequest());
    expect(result.ok).toBe(false);
    const bootstrapFailures = result.failures.filter((f) => f.category === 'bootstrap');
    expect(bootstrapFailures.length).toBeGreaterThanOrEqual(3);
  });

  it('bootstrap check remediation references install/setup wizard', () => {
    delete process.env.AZURE_TABLE_ENDPOINT;
    const result = validatePrelaunchReadiness(validRequest());
    const failure = result.failures.find((f) => f.code === 'BOOTSTRAP_MISSING_TABLE_ENDPOINT');
    expect(failure?.remediation).toContain('install');
  });

  it('skips bootstrap checks in mock mode', () => {
    vi.unstubAllEnvs();
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    // All bootstrap vars missing — would fail if checked
    const result = validatePrelaunchReadiness(validRequest());
    const bootstrapFailures = result.failures.filter((f) => f.category === 'bootstrap');
    expect(bootstrapFailures).toHaveLength(0);
  });

  // --- P7-07: Entra readiness checks ---

  it('detects missing department viewer config when department is set', () => {
    delete process.env.DEPT_BACKGROUND_ACCESS_COMMERCIAL;
    const result = validatePrelaunchReadiness(validRequest({ department: 'commercial' }));
    expect(result.ok).toBe(false);
    const codes = result.failures.map((f) => f.code);
    expect(codes).toContain('ENTRA_MISSING_DEPT_VIEWER_CONFIG');
    expect(result.failures.find((f) => f.code === 'ENTRA_MISSING_DEPT_VIEWER_CONFIG')?.category).toBe('entra-readiness');
  });

  it('passes when department viewer config is set', () => {
    vi.stubEnv('DEPT_BACKGROUND_ACCESS_COMMERCIAL', 'viewer1@hb.com,viewer2@hb.com');
    const result = validatePrelaunchReadiness(validRequest({ department: 'commercial' }));
    const codes = result.failures.map((f) => f.code);
    expect(codes).not.toContain('ENTRA_MISSING_DEPT_VIEWER_CONFIG');
  });

  it('skips department viewer check when no department set', () => {
    const result = validatePrelaunchReadiness(validRequest({ department: undefined }));
    const codes = result.failures.map((f) => f.code);
    expect(codes).not.toContain('ENTRA_MISSING_DEPT_VIEWER_CONFIG');
  });

  it('handles hyphenated department names in env var lookup', () => {
    const result = validatePrelaunchReadiness(validRequest({ department: 'luxury-residential' as any }));
    const failure = result.failures.find((f) => f.code === 'ENTRA_MISSING_DEPT_VIEWER_CONFIG');
    expect(failure?.message).toContain('DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL');
  });

  it('skips Entra readiness checks in mock mode', () => {
    vi.unstubAllEnvs();
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    const result = validatePrelaunchReadiness(validRequest({ department: 'commercial' }));
    const entraFailures = result.failures.filter((f) => f.category === 'entra-readiness');
    expect(entraFailures).toHaveLength(0);
  });
});

describe('assertPrelaunchReady', () => {
  beforeEach(() => {
    setAllEnvPrereqs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not throw when all prerequisites are satisfied', () => {
    expect(() => assertPrelaunchReady(validRequest())).not.toThrow();
  });

  it('returns the validation result on success', () => {
    const result = assertPrelaunchReady(validRequest());
    expect(result.ok).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('throws with aggregated error when prerequisites fail', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    expect(() => assertPrelaunchReady(validRequest())).toThrow('PrelaunchValidation');
    expect(() => assertPrelaunchReady(validRequest())).toThrow('MISSING_ENV_SHAREPOINT_TENANT_URL');
  });

  it('thrown error includes failure count', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    try {
      assertPrelaunchReady(validRequest());
      expect.fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('1 issue(s)');
    }
  });

  it('thrown error includes remediation guidance', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    try {
      assertPrelaunchReady(validRequest());
      expect.fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('Set SHAREPOINT_TENANT_URL');
    }
  });

  it('thrown error references operator documentation', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    try {
      assertPrelaunchReady(validRequest());
      expect.fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('Provisioning Staging Gates');
    }
  });
});
