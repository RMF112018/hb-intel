import { describe, it, expect } from 'vitest';
import {
  SharePointStandardsArea,
  AdminRiskLevel,
  SHAREPOINT_CONTROL_ACTION_KEYS,
} from '@hbc/models/admin-control-plane';
import type {
  ISharePointComparisonResult,
  ISharePointManagedAsset,
  ISharePointDriftFinding,
  IAdminPreviewResponse,
} from '@hbc/models/admin-control-plane';

import {
  validateRepairBoundary,
  executeSharePointRepair,
} from '../sharepoint-repair-service.js';
import type { RepairExecutor } from '../sharepoint-repair-service.js';

// ─── Test Fixtures ──────────────────────────────────────────────────────────────

const testAsset: ISharePointManagedAsset = {
  projectId: 'proj-001',
  projectNumber: '2025-001',
  projectName: 'Test Project',
  siteUrl: 'https://contoso.sharepoint.com/sites/2025-001-TestProject',
  siteExists: true,
  provisionedAt: '2025-01-15T10:00:00.000Z',
};

const testActor = {
  upn: 'admin@contoso.com',
  oid: 'oid-001',
  displayName: 'Test Admin',
  resolvedAt: new Date().toISOString(),
  capturedAt: new Date().toISOString(),
};

const repairableFinding: ISharePointDriftFinding = {
  area: SharePointStandardsArea.DocumentLibraries,
  expectationId: 'lib:Drawings',
  label: 'Library "Drawings" with versioning enabled',
  expected: 'present, versioning=true',
  observed: null,
  severity: 'critical',
  message: 'Library "Drawings" — missing',
  repairable: true,
};

const nonRepairableFinding: ISharePointDriftFinding = {
  area: SharePointStandardsArea.SiteExistence,
  expectationId: 'site:exists',
  label: 'Site exists',
  expected: 'exists',
  observed: null,
  severity: 'critical',
  message: 'Site not found',
  repairable: false,
};

const hubFinding: ISharePointDriftFinding = {
  area: SharePointStandardsArea.HubAssociation,
  expectationId: 'hub:associated',
  label: 'Hub association',
  expected: 'associated',
  observed: null,
  severity: 'critical',
  message: 'Not associated with hub',
  repairable: true,
};

function buildComparison(findings: ISharePointDriftFinding[]): ISharePointComparisonResult {
  const repairableCount = findings.filter(f => f.repairable).length;
  return {
    asset: testAsset,
    outcome: findings.length > 0 ? 'drifted' : 'compliant',
    comparedAt: new Date().toISOString(),
    standardsVersion: 'code-default-v1',
    standardsSource: 'code-default',
    areaSummaries: [],
    totalExpectations: 13,
    totalPassed: 13 - findings.length,
    totalDriftCount: findings.length,
    totalRepairableCount: repairableCount,
    findings,
    uninspectableAreas: [],
  };
}

function buildPreview(hasItems: boolean): IAdminPreviewResponse {
  return {
    actionKey: SHAREPOINT_CONTROL_ACTION_KEYS.previewRepair,
    impactSummary: hasItems
      ? [{ resource: 'test', changeType: 'create' as const, description: 'test' }]
      : [],
    riskLevel: hasItems ? AdminRiskLevel.Low : AdminRiskLevel.ReadOnly,
    warnings: [],
  };
}

const successExecutor: RepairExecutor = async () => ({ outcome: 'created' });
const skipExecutor: RepairExecutor = async () => ({ outcome: 'skipped' });
const failExecutor: RepairExecutor = async () => ({ outcome: 'failed', errorMessage: 'Test failure' });
const throwingExecutor: RepairExecutor = async () => { throw new Error('Unexpected error'); };

// ─── validateRepairBoundary ─────────────────────────────────────────────────────

describe('validateRepairBoundary', () => {
  it('returns no blockers for valid repair request', () => {
    const blockers = validateRepairBoundary(
      buildComparison([repairableFinding]),
      buildPreview(true),
    );
    expect(blockers).toHaveLength(0);
  });

  it('blocks when preview is empty for drifted comparison', () => {
    const blockers = validateRepairBoundary(
      buildComparison([repairableFinding]),
      buildPreview(false),
    );
    expect(blockers.some(b => b.includes('Preview is required'))).toBe(true);
  });

  it('blocks when asset has no provisioning record', () => {
    const comparison = buildComparison([repairableFinding]);
    const unprovisionedComparison: ISharePointComparisonResult = {
      ...comparison,
      asset: { ...testAsset, provisionedAt: null },
    };
    const blockers = validateRepairBoundary(unprovisionedComparison, buildPreview(true));
    expect(blockers.some(b => b.includes('managed-asset boundary'))).toBe(true);
  });

  it('blocks when site does not exist', () => {
    const comparison = buildComparison([repairableFinding]);
    const noSiteComparison: ISharePointComparisonResult = {
      ...comparison,
      asset: { ...testAsset, siteExists: false },
    };
    const blockers = validateRepairBoundary(noSiteComparison, buildPreview(true));
    expect(blockers.some(b => b.includes('Site does not exist'))).toBe(true);
  });
});

// ─── executeSharePointRepair ────────────────────────────────────────────────────

describe('executeSharePointRepair', () => {
  it('repairs all repairable findings successfully', async () => {
    const result = await executeSharePointRepair(
      buildComparison([repairableFinding, hubFinding]),
      buildPreview(true),
      successExecutor,
      testActor,
    );

    expect(result.outcome).toBe('all-repaired');
    expect(result.totalAttempted).toBe(2);
    expect(result.totalCreated).toBe(2);
    expect(result.totalFailed).toBe(0);
    expect(result.steps).toHaveLength(2);
  });

  it('excludes non-repairable findings', async () => {
    const result = await executeSharePointRepair(
      buildComparison([repairableFinding, nonRepairableFinding]),
      buildPreview(true),
      successExecutor,
      testActor,
    );

    expect(result.totalAttempted).toBe(1);
    expect(result.excludedNonRepairable).toBe(1);
    expect(result.steps).toHaveLength(1);
  });

  it('returns nothing-to-repair when no repairable findings exist', async () => {
    const result = await executeSharePointRepair(
      buildComparison([nonRepairableFinding]),
      buildPreview(true),
      successExecutor,
      testActor,
    );

    expect(result.outcome).toBe('nothing-to-repair');
    expect(result.totalAttempted).toBe(0);
    expect(result.excludedNonRepairable).toBe(1);
  });

  it('returns partial when some steps fail', async () => {
    let callCount = 0;
    const mixedExecutor: RepairExecutor = async () => {
      callCount++;
      return callCount === 1
        ? { outcome: 'created' }
        : { outcome: 'failed', errorMessage: 'Step 2 failed' };
    };

    const result = await executeSharePointRepair(
      buildComparison([repairableFinding, hubFinding]),
      buildPreview(true),
      mixedExecutor,
      testActor,
    );

    expect(result.outcome).toBe('partial');
    expect(result.totalCreated).toBe(1);
    expect(result.totalFailed).toBe(1);
  });

  it('handles thrown errors from executor', async () => {
    const result = await executeSharePointRepair(
      buildComparison([repairableFinding]),
      buildPreview(true),
      throwingExecutor,
      testActor,
    );

    expect(result.outcome).toBe('none-repaired');
    expect(result.totalFailed).toBe(1);
    expect(result.steps[0].errorMessage).toBe('Unexpected error');
  });

  it('returns all-repaired when all items are skipped (already exist)', async () => {
    const result = await executeSharePointRepair(
      buildComparison([repairableFinding]),
      buildPreview(true),
      skipExecutor,
      testActor,
    );

    expect(result.outcome).toBe('all-repaired');
    expect(result.totalSkipped).toBe(1);
    expect(result.totalCreated).toBe(0);
  });

  it('blocks when boundary validation fails', async () => {
    const comparison = buildComparison([repairableFinding]);
    const badComparison: ISharePointComparisonResult = {
      ...comparison,
      asset: { ...testAsset, provisionedAt: null },
    };

    const result = await executeSharePointRepair(
      badComparison,
      buildPreview(true),
      successExecutor,
      testActor,
    );

    expect(result.outcome).toBe('none-repaired');
    expect(result.totalAttempted).toBe(0);
    expect(result.steps.some(s => s.errorMessage?.includes('managed-asset boundary'))).toBe(true);
  });

  it('records step timing', async () => {
    const result = await executeSharePointRepair(
      buildComparison([repairableFinding]),
      buildPreview(true),
      successExecutor,
      testActor,
    );

    expect(result.steps[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('captures per-step area and expectation ID', async () => {
    const result = await executeSharePointRepair(
      buildComparison([repairableFinding]),
      buildPreview(true),
      successExecutor,
      testActor,
    );

    expect(result.steps[0].area).toBe(SharePointStandardsArea.DocumentLibraries);
    expect(result.steps[0].expectationId).toBe('lib:Drawings');
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

    await executeSharePointRepair(
      buildComparison([repairableFinding]),
      buildPreview(true),
      successExecutor,
      testActor,
      mockAudit as never,
      mockEvidence as never,
    );

    expect(auditRecorded).toBe(true);
    expect(evidenceRecorded).toBe(true);
  });

  it('populates asset and standardsVersion on result', async () => {
    const result = await executeSharePointRepair(
      buildComparison([repairableFinding]),
      buildPreview(true),
      successExecutor,
      testActor,
    );

    expect(result.asset.projectId).toBe('proj-001');
    expect(result.standardsVersion).toBe('code-default-v1');
    expect(result.completedAt).toBeTruthy();
  });
});
