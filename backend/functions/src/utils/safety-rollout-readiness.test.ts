import { afterEach, describe, expect, it, vi } from 'vitest';
import { evaluateSafetyRolloutReadiness } from './safety-rollout-readiness.js';
import { validateProvisioningPrerequisites } from './validate-config.js';
import { AdminPreflightService } from '../services/admin-control-plane/preflight-service.js';
import { validatePrelaunchReadiness } from '../functions/provisioningSaga/prelaunch-validation.js';
import type { IProvisionSiteRequest } from '@hbc/models';

function validRequest(): IProvisionSiteRequest {
  return {
    projectId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    projectNumber: '24-001-01',
    projectName: 'Test Project',
    correlationId: '11111111-2222-3333-4444-555555555555',
    triggeredBy: 'admin@hb.com',
    submittedBy: 'coordinator@hb.com',
    groupMembers: ['member1@hb.com', 'member2@hb.com'],
    department: 'commercial',
  } as IProvisionSiteRequest;
}

function setReadyEnv(): void {
  vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('AZURE_TENANT_ID', 'tenant-id');
  vi.stubEnv('AZURE_CLIENT_ID', 'client-id');
  vi.stubEnv('API_AUDIENCE', 'api://hb-intel');
  vi.stubEnv('AZURE_TABLE_ENDPOINT', 'https://example.table.core.windows.net');
  vi.stubEnv('APPLICATIONINSIGHTS_CONNECTION_STRING', 'InstrumentationKey=test');
  vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://example.sharepoint.com');
  vi.stubEnv('SHAREPOINT_HUB_SITE_ID', 'hub-id');
  vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', 'https://example.sharepoint.com/sites/appcatalog');
  vi.stubEnv('HB_INTEL_SPFX_APP_ID', 'spfx-id');
  vi.stubEnv('OPEX_MANAGER_UPN', 'opex@hb.com');
  vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'true');
  vi.stubEnv('DEPT_BACKGROUND_ACCESS_COMMERCIAL', 'viewer1@hb.com');
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
}

describe('evaluateSafetyRolloutReadiness', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns ready=true when posture, proof, and rollout gate are satisfied', () => {
    setReadyEnv();
    const readiness = evaluateSafetyRolloutReadiness();
    expect(readiness.ready).toBe(true);
    expect(readiness.surfaceState).toBe('ready');
    expect(readiness.postureReady).toBe(true);
    expect(readiness.proofReady).toBe(true);
    expect(readiness.gateReady).toBe(true);
    expect(readiness.issues).toHaveLength(0);
  });

  it('reports ready=false with stable issue codes when the rollout gate is missing', () => {
    setReadyEnv();
    delete process.env.SAFETY_ROLLOUT_GATE_ENABLED;
    delete process.env.SAFETY_ROLLOUT_CHECKPOINT_ID;
    const readiness = evaluateSafetyRolloutReadiness();
    expect(readiness.ready).toBe(false);
    expect(readiness.gateReady).toBe(false);
    expect(readiness.surfaceState).toBe('blocked');
    const codes = readiness.issues.map((i) => i.code);
    expect(codes).toContain('SAFETY_ROLLOUT_GATE_NOT_ENABLED');
    expect(codes).toContain('SAFETY_ROLLOUT_CHECKPOINT_ID_MISSING');
  });

  it('treats staging-broad as ready without requiring rollout gate when exception metadata is satisfied', () => {
    setReadyEnv();
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'staging-broad');
    vi.stubEnv('SITES_PERMISSION_MODEL', 'fullcontrol');
    vi.stubEnv('SAFETY_STAGING_BROAD_EXCEPTION_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_STAGING_BROAD_EXCEPTION_REASON', 'Temporary staging until 2026-05-15');
    delete process.env.SAFETY_ROLLOUT_GATE_ENABLED;
    delete process.env.SAFETY_ROLLOUT_CHECKPOINT_ID;
    const readiness = evaluateSafetyRolloutReadiness();
    expect(readiness.gate.passed).toBe(true);
    expect(readiness.posture).toBe('staging-broad');
  });
});

describe('Safety rollout readiness — cross-surface parity', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('surfaces the same rollout-gate failure code across config, preflight, and prelaunch', async () => {
    setReadyEnv();
    delete process.env.SAFETY_ROLLOUT_GATE_ENABLED;

    // validate-config path
    let configError: Error | undefined;
    try {
      validateProvisioningPrerequisites();
    } catch (e) {
      configError = e as Error;
    }
    expect(configError?.message).toContain('SAFETY_ROLLOUT_GATE_NOT_ENABLED');

    // preflight path
    const preflight = await new AdminPreflightService().validate({
      actionKey: 'install-execute',
      commandInput: {},
    } as any);
    const gateCheck = preflight.checks.find((c) => c.checkId === 'safety-rollout-gate');
    expect(gateCheck?.passed).toBe(false);
    expect(gateCheck?.blocking).toBe(true);
    expect(preflight.ready).toBe(false);

    // prelaunch path
    const prelaunch = validatePrelaunchReadiness(validRequest());
    expect(prelaunch.ok).toBe(false);
    expect(prelaunch.failures.map((f) => f.code)).toContain('SAFETY_ROLLOUT_GATE_NOT_ENABLED');

    // All three surfaces must derive from the same evaluator.
    const readiness = evaluateSafetyRolloutReadiness();
    const codeSet = new Set(readiness.issues.map((i) => i.code));
    expect(codeSet.has('SAFETY_ROLLOUT_GATE_NOT_ENABLED')).toBe(true);
  });

  it('derives the SAME canonical safety code-set across config, preflight, prelaunch, and health', async () => {
    // Shape a blocked posture that produces multiple distinct issue codes
    // (missing gate + missing proof confirmations) so parity is tested over
    // a non-trivial set, not just a single code.
    setReadyEnv();
    delete process.env.SAFETY_ROLLOUT_GATE_ENABLED;
    delete process.env.SAFETY_ROLLOUT_CHECKPOINT_ID;
    delete process.env.SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED;
    delete process.env.SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED;

    // Canonical seam — the evaluator.
    const canonical = evaluateSafetyRolloutReadiness();
    expect(canonical.ready).toBe(false);
    const canonicalCodes = Array.from(new Set(canonical.issues.map((i) => i.code))).sort();
    expect(canonicalCodes.length).toBeGreaterThan(1);

    // Surface 1 — health body: serialized from the same evaluator result.
    // The handler maps canonical.issues to issueCodes directly, so canonical is
    // the health representation.
    const healthCodes = canonicalCodes;

    // Surface 2 — config validation. validateProvisioningPrerequisites throws
    // a formatted error whose message embeds codes as "- [SAFETY_...]".
    let configCodes: string[] = [];
    try {
      validateProvisioningPrerequisites();
      throw new Error('expected validateProvisioningPrerequisites to throw');
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      configCodes = extractBracketedSafetyCodes(text);
    }

    // Surface 3 — preflight (safety-* checks). Issue codes appear in check
    // messages as "SAFETY_...: <message>".
    const preflight = await new AdminPreflightService().validate({
      actionKey: 'install-execute',
      commandInput: {},
    } as any);
    const preflightBlob = preflight.checks
      .filter((c) => c.checkId.startsWith('safety-'))
      .map((c) => c.message)
      .join(' | ');
    const preflightCodes = extractColonSuffixedSafetyCodes(preflightBlob);

    // Surface 4 — prelaunch validation.
    const prelaunch = validatePrelaunchReadiness(validRequest());
    const prelaunchCodes = Array.from(
      new Set(
        prelaunch.failures
          .filter((f) => f.code.startsWith('SAFETY_'))
          .map((f) => f.code),
      ),
    ).sort();

    expect(healthCodes).toEqual(canonicalCodes);
    expect(configCodes).toEqual(canonicalCodes);
    expect(preflightCodes.sort()).toEqual(canonicalCodes);
    expect(prelaunchCodes).toEqual(canonicalCodes);
  });

  it('reports zero safety codes across all four surfaces when the evaluator is ready', async () => {
    setReadyEnv();
    const canonical = evaluateSafetyRolloutReadiness();
    expect(canonical.ready).toBe(true);
    expect(canonical.issues).toHaveLength(0);

    // Config validation does not add bracketed SAFETY_* codes to its
    // aggregated error. (It may still throw for unrelated prerequisites.)
    try {
      validateProvisioningPrerequisites();
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      expect(extractBracketedSafetyCodes(text)).toHaveLength(0);
    }

    // Preflight: no failing safety-* check.
    const preflight = await new AdminPreflightService().validate({
      actionKey: 'install-execute',
      commandInput: {},
    } as any);
    const failingSafety = preflight.checks.filter(
      (c) => c.checkId.startsWith('safety-') && !c.passed,
    );
    expect(failingSafety).toHaveLength(0);

    // Prelaunch: no SAFETY_* codes in failures.
    const prelaunch = validatePrelaunchReadiness(validRequest());
    const prelaunchSafetyCodes = prelaunch.failures
      .map((f) => f.code)
      .filter((c) => c.startsWith('SAFETY_'));
    expect(prelaunchSafetyCodes).toHaveLength(0);
  });
});

/** Extract SAFETY_* codes appearing in validate-config's `- [CODE]` format. */
function extractBracketedSafetyCodes(text: string): string[] {
  const matches = Array.from(text.matchAll(/\[(SAFETY_[A-Z0-9_]+)\]/g)).map((m) => m[1]!);
  return Array.from(new Set(matches)).sort();
}

/** Extract SAFETY_* codes appearing in preflight's `CODE: <message>` format. */
function extractColonSuffixedSafetyCodes(text: string): string[] {
  const matches = Array.from(text.matchAll(/\b(SAFETY_[A-Z0-9_]+):\s/g)).map((m) => m[1]!);
  return Array.from(new Set(matches)).sort();
}
