import { describe, it, expect } from 'vitest';

import {
  executePostureChecks,
  buildPostureValidationResult,
  runPostureValidation,
  POSTURE_CHECK_CATALOG,
} from '../sharepoint-posture-service.js';
import type {
  PostureCollector,
  PostureCheckStatus,
  IPostureCheckFinding,
} from '../sharepoint-posture-service.js';

// ─── Test Fixtures ──────────────────────────────────────────────────────────────

const testActor = {
  upn: 'admin@contoso.com',
  oid: 'oid-001',
  displayName: 'Test Admin',
  resolvedAt: new Date().toISOString(),
  capturedAt: new Date().toISOString(),
};

const allHealthyCollector: PostureCollector = async () => ({
  status: 'healthy',
  detail: 'Check passed',
});

const allMissingCollector: PostureCollector = async () => ({
  status: 'missing',
  detail: 'Not found',
});

const throwingCollector: PostureCollector = async () => {
  throw new Error('Connection timeout');
};

function mixedCollector(healthyIds: string[]): PostureCollector {
  return async (checkId) => ({
    status: healthyIds.includes(checkId) ? 'healthy' as PostureCheckStatus : 'missing' as PostureCheckStatus,
    detail: healthyIds.includes(checkId) ? 'OK' : 'Not found',
  });
}

// ─── POSTURE_CHECK_CATALOG ──────────────────────────────────────────────────────

describe('POSTURE_CHECK_CATALOG', () => {
  it('contains app-catalog and api-access categories', () => {
    const categories = new Set(POSTURE_CHECK_CATALOG.map(c => c.category));
    expect(categories.has('app-catalog')).toBe(true);
    expect(categories.has('api-access')).toBe(true);
  });

  it('has 4 app-catalog checks and 4 api-access checks', () => {
    const appCatalog = POSTURE_CHECK_CATALOG.filter(c => c.category === 'app-catalog');
    const apiAccess = POSTURE_CHECK_CATALOG.filter(c => c.category === 'api-access');
    expect(appCatalog.length).toBe(4);
    expect(apiAccess.length).toBe(4);
  });

  it('all checks are advisory-only in Phase 8', () => {
    expect(POSTURE_CHECK_CATALOG.every(c => c.advisoryOnly)).toBe(true);
  });

  it('all checks have recommended actions', () => {
    expect(POSTURE_CHECK_CATALOG.every(c => c.recommendedAction !== null)).toBe(true);
  });

  it('has unique check IDs', () => {
    const ids = POSTURE_CHECK_CATALOG.map(c => c.checkId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── executePostureChecks ───────────────────────────────────────────────────────

describe('executePostureChecks', () => {
  it('returns one finding per catalog entry when all healthy', async () => {
    const findings = await executePostureChecks(allHealthyCollector);
    expect(findings.length).toBe(POSTURE_CHECK_CATALOG.length);
    expect(findings.every(f => f.status === 'healthy')).toBe(true);
  });

  it('returns missing status for all-missing collector', async () => {
    const findings = await executePostureChecks(allMissingCollector);
    expect(findings.every(f => f.status === 'missing')).toBe(true);
  });

  it('catches thrown errors and returns unknown status', async () => {
    const findings = await executePostureChecks(throwingCollector);
    expect(findings.every(f => f.status === 'unknown')).toBe(true);
    expect(findings[0].detail).toContain('Connection timeout');
  });

  it('clears recommendedAction for healthy checks', async () => {
    const findings = await executePostureChecks(allHealthyCollector);
    expect(findings.every(f => f.recommendedAction === null)).toBe(true);
  });

  it('populates recommendedAction for unhealthy checks', async () => {
    const findings = await executePostureChecks(allMissingCollector);
    expect(findings.every(f => f.recommendedAction !== null)).toBe(true);
  });

  it('marks all findings as advisory-only', async () => {
    const findings = await executePostureChecks(allHealthyCollector);
    expect(findings.every(f => f.advisoryOnly)).toBe(true);
  });
});

// ─── buildPostureValidationResult ───────────────────────────────────────────────

describe('buildPostureValidationResult', () => {
  it('returns healthy when all checks pass', () => {
    const findings: IPostureCheckFinding[] = POSTURE_CHECK_CATALOG.map(def => ({
      category: def.category,
      checkId: def.checkId,
      label: def.label,
      status: 'healthy' as PostureCheckStatus,
      severity: 'info' as const,
      detail: 'OK',
      advisoryOnly: true,
      recommendedAction: null,
    }));

    const result = buildPostureValidationResult(findings);
    expect(result.overallHealth).toBe('healthy');
    expect(result.healthyCount).toBe(POSTURE_CHECK_CATALOG.length);
  });

  it('returns unhealthy when any check is missing', () => {
    const findings: IPostureCheckFinding[] = [
      {
        category: 'app-catalog',
        checkId: 'catalog:hbIntelPackagePresent',
        label: 'Test',
        status: 'missing',
        severity: 'critical',
        detail: 'Missing',
        advisoryOnly: true,
        recommendedAction: 'Fix it',
      },
    ];

    const result = buildPostureValidationResult(findings);
    expect(result.overallHealth).toBe('unhealthy');
    expect(result.missingCount).toBe(1);
  });

  it('returns degraded when checks are degraded or unknown', () => {
    const findings: IPostureCheckFinding[] = [
      {
        category: 'api-access',
        checkId: 'api:test',
        label: 'Test',
        status: 'degraded',
        severity: 'warning',
        detail: 'Degraded',
        advisoryOnly: true,
        recommendedAction: null,
      },
    ];

    const result = buildPostureValidationResult(findings);
    expect(result.overallHealth).toBe('degraded');
  });

  it('counts categories correctly', () => {
    const findings: IPostureCheckFinding[] = [
      { category: 'app-catalog', checkId: 'a', label: 'A', status: 'healthy', severity: 'info', detail: '', advisoryOnly: true, recommendedAction: null },
      { category: 'app-catalog', checkId: 'b', label: 'B', status: 'healthy', severity: 'info', detail: '', advisoryOnly: true, recommendedAction: null },
      { category: 'api-access', checkId: 'c', label: 'C', status: 'healthy', severity: 'info', detail: '', advisoryOnly: true, recommendedAction: null },
    ];

    const result = buildPostureValidationResult(findings);
    expect(result.appCatalogCheckCount).toBe(2);
    expect(result.apiAccessCheckCount).toBe(1);
  });
});

// ─── runPostureValidation ───────────────────────────────────────────────────────

describe('runPostureValidation', () => {
  it('returns a complete validation result', async () => {
    const result = await runPostureValidation(allHealthyCollector, testActor);
    expect(result.overallHealth).toBe('healthy');
    expect(result.findings.length).toBe(POSTURE_CHECK_CATALOG.length);
    expect(result.validatedAt).toBeTruthy();
  });

  it('handles mixed posture correctly', async () => {
    const collector = mixedCollector(['catalog:tenantCatalogExists', 'catalog:hbIntelPackagePresent']);
    const result = await runPostureValidation(collector, testActor);
    expect(result.overallHealth).toBe('unhealthy'); // some missing
    expect(result.healthyCount).toBe(2);
    expect(result.missingCount).toBeGreaterThan(0);
  });

  it('invokes audit and evidence services', async () => {
    let auditRecorded = false;
    let evidenceRecorded = false;

    const mockAudit = {
      recordEvent: async () => { auditRecorded = true; },
      listByRunId: async () => [],
      listByEventType: async () => [],
    };

    const mockEvidence = {
      recordEvidence: async () => { evidenceRecorded = true; },
      listByRunId: async () => [],
      getEvidence: async () => null,
    };

    await runPostureValidation(
      allHealthyCollector,
      testActor,
      mockAudit as never,
      mockEvidence as never,
    );

    expect(auditRecorded).toBe(true);
    expect(evidenceRecorded).toBe(true);
  });
});
