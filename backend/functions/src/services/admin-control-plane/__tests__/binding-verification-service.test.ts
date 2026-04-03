/**
 * P6A-07: Binding verification and drift detection tests.
 *
 * Tests validate individual check functions, the execution wrapper,
 * and the orchestration wrapper with audit/evidence integration.
 *
 * @module admin-control-plane/tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppBindingStatus, AdminAuditEventType } from '@hbc/models/admin-control-plane';
import type { IAdminActorContext, IAppBindingRecord } from '@hbc/models/admin-control-plane';
import {
  checkRequiredFields,
  checkFunctionAppReachable,
  checkApiAudienceValid,
  checkBindingNotStale,
  checkBindingNotSuperseded,
  executeBindingVerificationChecks,
  runAppBindingVerification,
} from '../binding-verification-service.js';
import { MockAdminAppBindingStore } from '../app-binding-store.js';

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-123',
  displayName: 'Test Admin',
  capturedAt: new Date().toISOString(),
};

function makeBinding(overrides?: Partial<IAppBindingRecord>): IAppBindingRecord {
  return {
    appId: 'accounting',
    functionAppUrl: 'https://hb-intel-func.azurewebsites.net',
    apiAudience: 'api://hb-intel-api-client-id-12345678',
    backendMode: 'production',
    allowBackendModeSwitch: false,
    version: 1,
    status: AppBindingStatus.Active,
    publishedAt: new Date().toISOString(),
    publishedBy: TEST_ACTOR,
    publishSource: 'test',
    lastVerifiedAt: new Date().toISOString(),
    lastVerificationResult: 'passed',
    ...overrides,
  };
}

// ─── Individual Check Tests ──────────────────────────────────────────────────

describe('P6A-07 checkRequiredFields', () => {
  it('returns no findings for valid binding', () => {
    const findings = checkRequiredFields(makeBinding());
    expect(findings).toHaveLength(0);
  });

  it('detects empty functionAppUrl', () => {
    const findings = checkRequiredFields(makeBinding({ functionAppUrl: '' }));
    expect(findings).toHaveLength(1);
    expect(findings[0].field).toBe('functionAppUrl');
    expect(findings[0].severity).toBe('critical');
  });

  it('detects empty apiAudience', () => {
    const findings = checkRequiredFields(makeBinding({ apiAudience: '' }));
    expect(findings).toHaveLength(1);
    expect(findings[0].field).toBe('apiAudience');
    expect(findings[0].severity).toBe('critical');
  });

  it('detects invalid URL format', () => {
    const findings = checkRequiredFields(makeBinding({ functionAppUrl: 'not-a-url' }));
    expect(findings).toHaveLength(1);
    expect(findings[0].field).toBe('functionAppUrl');
    expect(findings[0].severity).toBe('critical');
  });

  it('warns about non-api:// audience format', () => {
    const findings = checkRequiredFields(makeBinding({ apiAudience: 'https://example.com' }));
    expect(findings).toHaveLength(1);
    expect(findings[0].field).toBe('apiAudience');
    expect(findings[0].severity).toBe('warning');
  });

  it('detects multiple issues simultaneously', () => {
    const findings = checkRequiredFields(makeBinding({ functionAppUrl: '', apiAudience: '' }));
    expect(findings).toHaveLength(2);
  });
});

describe('P6A-07 checkFunctionAppReachable', () => {
  it('returns no findings for valid URL', () => {
    const findings = checkFunctionAppReachable(makeBinding());
    expect(findings).toHaveLength(0);
  });

  it('returns no findings for empty URL (handled by checkRequiredFields)', () => {
    const findings = checkFunctionAppReachable(makeBinding({ functionAppUrl: '' }));
    expect(findings).toHaveLength(0);
  });

  it('warns about hostname without dots', () => {
    const findings = checkFunctionAppReachable(makeBinding({ functionAppUrl: 'http://localhost' }));
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('warning');
  });
});

describe('P6A-07 checkApiAudienceValid', () => {
  it('returns no findings for valid api:// audience', () => {
    const findings = checkApiAudienceValid(makeBinding());
    expect(findings).toHaveLength(0);
  });

  it('warns about suspiciously short client ID', () => {
    const findings = checkApiAudienceValid(makeBinding({ apiAudience: 'api://abc' }));
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('warning');
  });
});

describe('P6A-07 checkBindingNotStale', () => {
  it('returns no findings for recently verified binding', () => {
    const findings = checkBindingNotStale(makeBinding());
    expect(findings).toHaveLength(0);
  });

  it('detects never-verified binding', () => {
    const findings = checkBindingNotStale(makeBinding({ lastVerifiedAt: null }));
    expect(findings).toHaveLength(1);
    expect(findings[0].field).toBe('staleness');
    expect(findings[0].severity).toBe('info');
  });

  it('detects stale binding (>30 days)', () => {
    const staleDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    const findings = checkBindingNotStale(makeBinding({ lastVerifiedAt: staleDate }));
    expect(findings).toHaveLength(1);
    expect(findings[0].field).toBe('staleness');
    expect(findings[0].severity).toBe('info');
  });
});

describe('P6A-07 checkBindingNotSuperseded', () => {
  it('returns no findings for Active binding', () => {
    const findings = checkBindingNotSuperseded(makeBinding());
    expect(findings).toHaveLength(0);
  });

  it('detects Superseded binding', () => {
    const findings = checkBindingNotSuperseded(makeBinding({ status: AppBindingStatus.Superseded }));
    expect(findings).toHaveLength(1);
    expect(findings[0].field).toBe('status');
    expect(findings[0].severity).toBe('warning');
  });

  it('detects Error binding', () => {
    const findings = checkBindingNotSuperseded(makeBinding({ status: AppBindingStatus.Error }));
    expect(findings).toHaveLength(1);
    expect(findings[0].field).toBe('status');
    expect(findings[0].severity).toBe('warning');
  });
});

// ─── Execution Wrapper Tests ─────────────────────────────────────────────────

describe('P6A-07 executeBindingVerificationChecks', () => {
  it('returns empty findings for fully valid binding', () => {
    const findings = executeBindingVerificationChecks(makeBinding());
    expect(findings).toHaveLength(0);
  });

  it('collects findings from multiple checks', () => {
    const findings = executeBindingVerificationChecks(makeBinding({
      functionAppUrl: '',
      apiAudience: '',
      lastVerifiedAt: null,
      status: AppBindingStatus.Error,
    }));

    // 2 required fields + staleness + status = at least 4
    expect(findings.length).toBeGreaterThanOrEqual(4);

    const fields = findings.map(f => f.field);
    expect(fields).toContain('functionAppUrl');
    expect(fields).toContain('apiAudience');
    expect(fields).toContain('staleness');
    expect(fields).toContain('status');
  });
});

// ─── Orchestration Tests ─────────────────────────────────────────────────────

describe('P6A-07 runAppBindingVerification', () => {
  let bindingStore: MockAdminAppBindingStore;
  let auditService: { recordEvent: ReturnType<typeof vi.fn>; listByRunId: ReturnType<typeof vi.fn>; listByEventType: ReturnType<typeof vi.fn> };
  let evidenceService: { recordEvidence: ReturnType<typeof vi.fn>; listByRunId: ReturnType<typeof vi.fn>; getEvidence: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bindingStore = new MockAdminAppBindingStore();
    auditService = {
      recordEvent: vi.fn().mockResolvedValue(undefined),
      listByRunId: vi.fn().mockResolvedValue([]),
      listByEventType: vi.fn().mockResolvedValue([]),
    };
    evidenceService = {
      recordEvidence: vi.fn().mockResolvedValue(undefined),
      listByRunId: vi.fn().mockResolvedValue([]),
      getEvidence: vi.fn().mockResolvedValue(null),
    };
  });

  it('returns inconclusive for missing binding', async () => {
    const result = await runAppBindingVerification('accounting', bindingStore, TEST_ACTOR, auditService, evidenceService);

    expect(result.outcome).toBe('inconclusive');
    expect(result.version).toBe(0);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].field).toBe('binding');
    expect(result.findings[0].severity).toBe('critical');
  });

  it('returns passed for valid binding', async () => {
    await bindingStore.publishBinding({
      appId: 'accounting',
      functionAppUrl: 'https://hb-intel-func.azurewebsites.net',
      apiAudience: 'api://hb-intel-api-client-id-12345678',
      backendMode: 'production',
      allowBackendModeSwitch: false,
      publishSource: 'test',
    }, TEST_ACTOR);

    const result = await runAppBindingVerification('accounting', bindingStore, TEST_ACTOR, auditService, evidenceService);

    expect(result.outcome).toBe('passed');
    expect(result.version).toBe(1);
  });

  it('returns drifted for binding with empty required fields', async () => {
    await bindingStore.publishBinding({
      appId: 'accounting',
      functionAppUrl: '',
      apiAudience: '',
      backendMode: 'production',
      allowBackendModeSwitch: false,
      publishSource: 'test',
    }, TEST_ACTOR);

    const result = await runAppBindingVerification('accounting', bindingStore, TEST_ACTOR, auditService, evidenceService);

    expect(result.outcome).toBe('drifted');
    expect(result.findings.some(f => f.field === 'functionAppUrl')).toBe(true);
    expect(result.findings.some(f => f.field === 'apiAudience')).toBe(true);
  });

  it('records BindingVerified audit event on pass', async () => {
    await bindingStore.publishBinding({
      appId: 'accounting',
      functionAppUrl: 'https://hb-intel-func.azurewebsites.net',
      apiAudience: 'api://hb-intel-api-client-id-12345678',
      backendMode: 'production',
      allowBackendModeSwitch: false,
      publishSource: 'test',
    }, TEST_ACTOR);

    await runAppBindingVerification('accounting', bindingStore, TEST_ACTOR, auditService, evidenceService);

    expect(auditService.recordEvent).toHaveBeenCalledTimes(1);
    const call = auditService.recordEvent.mock.calls[0][0];
    expect(call.eventType).toBe(AdminAuditEventType.BindingVerified);
    expect(call.summary).toContain('passed');
  });

  it('records BindingDriftDetected audit event on drift', async () => {
    await bindingStore.publishBinding({
      appId: 'accounting',
      functionAppUrl: '',
      apiAudience: 'api://valid-client-id-12345678',
      backendMode: 'production',
      allowBackendModeSwitch: false,
      publishSource: 'test',
    }, TEST_ACTOR);

    await runAppBindingVerification('accounting', bindingStore, TEST_ACTOR, auditService, evidenceService);

    expect(auditService.recordEvent).toHaveBeenCalledTimes(1);
    const call = auditService.recordEvent.mock.calls[0][0];
    expect(call.eventType).toBe(AdminAuditEventType.BindingDriftDetected);
  });

  it('captures verification evidence', async () => {
    await bindingStore.publishBinding({
      appId: 'accounting',
      functionAppUrl: 'https://hb-intel-func.azurewebsites.net',
      apiAudience: 'api://hb-intel-api-client-id-12345678',
      backendMode: 'production',
      allowBackendModeSwitch: false,
      publishSource: 'test',
    }, TEST_ACTOR);

    await runAppBindingVerification('accounting', bindingStore, TEST_ACTOR, auditService, evidenceService);

    expect(evidenceService.recordEvidence).toHaveBeenCalledTimes(1);
    const payload = evidenceService.recordEvidence.mock.calls[0][2];
    expect(payload.appId).toBe('accounting');
    expect(payload.outcome).toBe('passed');
  });

  it('records DriftDetected audit for missing binding', async () => {
    await runAppBindingVerification('nonexistent', bindingStore, TEST_ACTOR, auditService, evidenceService);

    expect(auditService.recordEvent).toHaveBeenCalledTimes(1);
    const call = auditService.recordEvent.mock.calls[0][0];
    expect(call.eventType).toBe(AdminAuditEventType.BindingDriftDetected);
    expect(call.summary).toContain('no binding configured');
  });

  it('treats info-only findings as passed (not drifted)', async () => {
    // Publish a valid binding but with never-verified state
    await bindingStore.publishBinding({
      appId: 'accounting',
      functionAppUrl: 'https://hb-intel-func.azurewebsites.net',
      apiAudience: 'api://hb-intel-api-client-id-12345678',
      backendMode: 'production',
      allowBackendModeSwitch: false,
      publishSource: 'test',
    }, TEST_ACTOR);

    // The mock store doesn't set lastVerifiedAt=null on the FIRST publish because
    // publishBinding sets it to null. So the newly published binding has lastVerifiedAt=null.
    // The staleness check will produce an info finding for "never verified".
    // But after the store's own verifyBinding runs (called inside runAppBindingVerification),
    // it updates lastVerifiedAt. The verification service's check ran on the ORIGINAL binding.
    // So the staleness finding should be present but should not cause 'drifted'.

    const result = await runAppBindingVerification('accounting', bindingStore, TEST_ACTOR, auditService, evidenceService);

    // Info findings (staleness) don't cause drift — outcome should still be 'passed'
    // because there are no critical or warning findings from required fields checks.
    // Note: the binding itself has valid required fields.
    expect(result.outcome).toBe('passed');
  });
});
