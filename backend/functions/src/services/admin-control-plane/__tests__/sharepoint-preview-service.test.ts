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
  ISharePointAreaComparisonSummary,
} from '@hbc/models/admin-control-plane';

import {
  generateRepairPreview,
  runSharePointRepairPreview,
} from '../sharepoint-preview-service.js';

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
};

function buildCompliantResult(): ISharePointComparisonResult {
  return {
    asset: testAsset,
    outcome: 'compliant',
    comparedAt: new Date().toISOString(),
    standardsVersion: 'code-default-v1',
    standardsSource: 'code-default',
    areaSummaries: [],
    totalExpectations: 13,
    totalPassed: 13,
    totalDriftCount: 0,
    totalRepairableCount: 0,
    findings: [],
    uninspectableAreas: [],
  };
}

function buildDriftedResult(findings: ISharePointDriftFinding[]): ISharePointComparisonResult {
  const repairableCount = findings.filter(f => f.repairable).length;
  return {
    asset: testAsset,
    outcome: 'drifted',
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

const repairableFinding: ISharePointDriftFinding = {
  area: SharePointStandardsArea.DocumentLibraries,
  expectationId: 'lib:Drawings',
  label: 'Library "Drawings" with versioning enabled',
  expected: 'present, versioning=true',
  observed: null,
  severity: 'critical',
  message: 'Library "Drawings" with versioning enabled — missing',
  repairable: true,
};

const nonRepairableFinding: ISharePointDriftFinding = {
  area: SharePointStandardsArea.SiteExistence,
  expectationId: 'site:exists',
  label: 'Site exists at https://contoso.sharepoint.com/sites/2025-001-TestProject',
  expected: 'exists',
  observed: null,
  severity: 'critical',
  message: 'Site exists — not found during inspection',
  repairable: false,
};

const warningFinding: ISharePointDriftFinding = {
  area: SharePointStandardsArea.WebParts,
  expectationId: 'webparts:catalogPresent',
  label: 'HB Intel SPFx package in app catalog',
  expected: 'present in tenant app catalog',
  observed: 'not found',
  severity: 'warning',
  message: 'HB Intel SPFx package — not found in catalog',
  repairable: false,
};

// ─── generateRepairPreview ──────────────────────────────────────────────────────

describe('generateRepairPreview', () => {
  it('returns empty impact and warning for compliant comparison', () => {
    const preview = generateRepairPreview(buildCompliantResult());

    expect(preview.impactSummary).toHaveLength(0);
    expect(preview.warnings).toHaveLength(1);
    expect(preview.warnings[0]).toContain('No drift detected');
    expect(preview.riskLevel).toBe(AdminRiskLevel.ReadOnly);
    expect(preview.actionKey).toBe(SHAREPOINT_CONTROL_ACTION_KEYS.previewRepair);
  });

  it('converts repairable findings to create impact items', () => {
    const preview = generateRepairPreview(buildDriftedResult([repairableFinding]));

    expect(preview.impactSummary).toHaveLength(1);
    expect(preview.impactSummary[0].changeType).toBe('create');
    expect(preview.impactSummary[0].resource).toContain('Document Library');
    expect(preview.impactSummary[0].description).toContain('Create missing');
  });

  it('converts non-repairable findings to no-change items', () => {
    const preview = generateRepairPreview(buildDriftedResult([nonRepairableFinding]));

    expect(preview.impactSummary).toHaveLength(1);
    expect(preview.impactSummary[0].changeType).toBe('no-change');
    expect(preview.impactSummary[0].description).toContain('Not auto-repairable');
  });

  it('adds warning for non-repairable critical findings', () => {
    const preview = generateRepairPreview(buildDriftedResult([nonRepairableFinding]));

    expect(preview.warnings.some(w => w.includes('cannot be auto-repaired'))).toBe(true);
  });

  it('does not add warning for non-repairable warning-severity findings', () => {
    const preview = generateRepairPreview(buildDriftedResult([warningFinding]));

    expect(preview.warnings.every(w => !w.includes('cannot be auto-repaired'))).toBe(true);
  });

  it('separates repairable and non-repairable in mixed findings', () => {
    const preview = generateRepairPreview(
      buildDriftedResult([repairableFinding, nonRepairableFinding, warningFinding]),
    );

    const creates = preview.impactSummary.filter(i => i.changeType === 'create');
    const noChanges = preview.impactSummary.filter(i => i.changeType === 'no-change');

    expect(creates).toHaveLength(1);
    expect(noChanges).toHaveLength(2);
    expect(preview.impactSummary).toHaveLength(3);
  });

  it('returns Low risk when repairable items exist', () => {
    const preview = generateRepairPreview(buildDriftedResult([repairableFinding]));
    expect(preview.riskLevel).toBe(AdminRiskLevel.Low);
  });

  it('returns ReadOnly risk when only non-repairable items exist', () => {
    const preview = generateRepairPreview(buildDriftedResult([nonRepairableFinding]));
    expect(preview.riskLevel).toBe(AdminRiskLevel.ReadOnly);
  });

  it('warns about uninspectable areas', () => {
    const base = buildDriftedResult([repairableFinding]);
    const result: ISharePointComparisonResult = {
      ...base,
      uninspectableAreas: [SharePointStandardsArea.SecurityGroups],
    };

    const preview = generateRepairPreview(result);
    expect(preview.warnings.some(w => w.includes('could not be inspected'))).toBe(true);
  });

  it('describes restore action when observed value exists', () => {
    const finding: ISharePointDriftFinding = {
      ...repairableFinding,
      observed: 'present, versioning=false',
      severity: 'warning',
    };
    const preview = generateRepairPreview(buildDriftedResult([finding]));

    expect(preview.impactSummary[0].description).toContain('Restore');
    expect(preview.impactSummary[0].description).toContain('versioning=false');
  });

  it('is a pure function — does not mutate input', () => {
    const result = buildDriftedResult([repairableFinding]);
    const findingsBefore = [...result.findings];

    generateRepairPreview(result);

    expect(result.findings).toEqual(findingsBefore);
  });
});

// ─── runSharePointRepairPreview ─────────────────────────────────────────────────

describe('runSharePointRepairPreview', () => {
  it('returns preview response', async () => {
    const preview = await runSharePointRepairPreview(
      buildDriftedResult([repairableFinding]),
      testActor,
    );

    expect(preview.actionKey).toBe(SHAREPOINT_CONTROL_ACTION_KEYS.previewRepair);
    expect(preview.impactSummary.length).toBeGreaterThan(0);
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

    await runSharePointRepairPreview(
      buildDriftedResult([repairableFinding]),
      testActor,
      mockAudit as never,
      mockEvidence as never,
    );

    expect(auditRecorded).toBe(true);
    expect(evidenceRecorded).toBe(true);
  });
});
