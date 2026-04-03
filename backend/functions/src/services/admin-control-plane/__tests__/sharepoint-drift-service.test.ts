import { describe, it, expect } from 'vitest';
import { SharePointStandardsArea } from '@hbc/models/admin-control-plane';
import type {
  ISharePointManagedAsset,
  ISharePointPostureSnapshot,
  ISharePointPostureObservation,
} from '@hbc/models/admin-control-plane';

import {
  resolveCodeDefaultStandards,
  comparePostureToStandards,
  buildComparisonResult,
  runSharePointDriftDetection,
  CODE_DEFAULT_STANDARDS_VERSION,
} from '../sharepoint-drift-service.js';

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

function buildCompliantPosture(asset: ISharePointManagedAsset): ISharePointPostureSnapshot {
  const standards = resolveCodeDefaultStandards(asset);
  const observations: ISharePointPostureObservation[] = standards.expectations.map(exp => ({
    area: exp.area,
    expectationId: exp.expectationId,
    present: true,
    observed: exp.expected,
    metadata: null,
  }));

  return {
    asset,
    collectedAt: new Date().toISOString(),
    observations,
    uninspectableAreas: [],
  };
}

// ─── Standards Resolver ─────────────────────────────────────────────────────────

describe('resolveCodeDefaultStandards', () => {
  it('returns code-default source and version', () => {
    const snapshot = resolveCodeDefaultStandards(testAsset);
    expect(snapshot.version).toBe(CODE_DEFAULT_STANDARDS_VERSION);
    expect(snapshot.source).toBe('code-default');
  });

  it('includes expectations for all 9 standards areas', () => {
    const snapshot = resolveCodeDefaultStandards(testAsset);
    const areas = new Set(snapshot.expectations.map(e => e.area));
    expect(areas.size).toBe(Object.values(SharePointStandardsArea).length);
  });

  it('includes 3 core document library expectations', () => {
    const snapshot = resolveCodeDefaultStandards(testAsset);
    const libExpectations = snapshot.expectations.filter(
      e => e.area === SharePointStandardsArea.DocumentLibraries,
    );
    expect(libExpectations.length).toBe(3);
    expect(libExpectations.map(e => e.label)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Project Documents'),
        expect.stringContaining('Drawings'),
        expect.stringContaining('Specifications'),
      ]),
    );
  });

  it('includes 3 security group expectations (Leaders, Team, Viewers)', () => {
    const snapshot = resolveCodeDefaultStandards(testAsset);
    const groupExpectations = snapshot.expectations.filter(
      e => e.area === SharePointStandardsArea.SecurityGroups,
    );
    expect(groupExpectations.length).toBe(3);
    expect(groupExpectations.map(e => e.expectationId)).toEqual(
      expect.arrayContaining(['group:Leaders', 'group:Team', 'group:Viewers']),
    );
  });

  it('marks document libraries as repairable', () => {
    const snapshot = resolveCodeDefaultStandards(testAsset);
    const libs = snapshot.expectations.filter(
      e => e.area === SharePointStandardsArea.DocumentLibraries,
    );
    expect(libs.every(e => e.repairable)).toBe(true);
  });

  it('marks site existence as not repairable', () => {
    const snapshot = resolveCodeDefaultStandards(testAsset);
    const site = snapshot.expectations.find(
      e => e.area === SharePointStandardsArea.SiteExistence,
    );
    expect(site?.repairable).toBe(false);
  });

  it('populates areaCounts correctly', () => {
    const snapshot = resolveCodeDefaultStandards(testAsset);
    expect(snapshot.areaCounts[SharePointStandardsArea.SiteExistence]).toBe(1);
    expect(snapshot.areaCounts[SharePointStandardsArea.DocumentLibraries]).toBe(3);
    expect(snapshot.areaCounts[SharePointStandardsArea.SecurityGroups]).toBe(3);
    expect(snapshot.areaCounts[SharePointStandardsArea.HubAssociation]).toBe(1);
  });
});

// ─── Comparison Engine ──────────────────────────────────────────────────────────

describe('comparePostureToStandards', () => {
  it('returns no findings for fully compliant posture', () => {
    const standards = resolveCodeDefaultStandards(testAsset);
    const posture = buildCompliantPosture(testAsset);

    const { findings, areaSummaries } = comparePostureToStandards(standards, posture);
    expect(findings.length).toBe(0);

    const inspectable = areaSummaries.filter(a => a.expectationsChecked > 0);
    expect(inspectable.every(a => a.outcome === 'compliant')).toBe(true);
  });

  it('detects missing items as critical drift', () => {
    const standards = resolveCodeDefaultStandards(testAsset);
    const posture = buildCompliantPosture(testAsset);

    // Remove the "Drawings" library observation
    const filtered = posture.observations.filter(
      o => o.expectationId !== 'lib:Drawings',
    );
    const driftedPosture: ISharePointPostureSnapshot = {
      ...posture,
      observations: filtered,
    };

    const { findings } = comparePostureToStandards(standards, driftedPosture);
    expect(findings.length).toBe(1);
    expect(findings[0].area).toBe(SharePointStandardsArea.DocumentLibraries);
    expect(findings[0].severity).toBe('critical');
    expect(findings[0].repairable).toBe(true);
  });

  it('detects present-but-not-found items as critical drift', () => {
    const standards = resolveCodeDefaultStandards(testAsset);
    const posture = buildCompliantPosture(testAsset);

    const modified = posture.observations.map(o =>
      o.expectationId === 'hub:associated'
        ? { ...o, present: false, observed: 'not associated' }
        : o,
    );
    const driftedPosture: ISharePointPostureSnapshot = {
      ...posture,
      observations: modified,
    };

    const { findings } = comparePostureToStandards(standards, driftedPosture);
    const hubFinding = findings.find(f => f.expectationId === 'hub:associated');
    expect(hubFinding).toBeDefined();
    expect(hubFinding!.severity).toBe('critical');
    expect(hubFinding!.repairable).toBe(true);
  });

  it('detects value mismatches as warning drift', () => {
    const standards = resolveCodeDefaultStandards(testAsset);
    const posture = buildCompliantPosture(testAsset);

    const modified = posture.observations.map(o =>
      o.expectationId === 'lib:ProjectDocuments'
        ? { ...o, observed: 'present, versioning=false' }
        : o,
    );
    const driftedPosture: ISharePointPostureSnapshot = {
      ...posture,
      observations: modified,
    };

    const { findings } = comparePostureToStandards(standards, driftedPosture);
    const libFinding = findings.find(f => f.expectationId === 'lib:ProjectDocuments');
    expect(libFinding).toBeDefined();
    expect(libFinding!.severity).toBe('warning');
  });

  it('marks uninspectable areas as unknown', () => {
    const standards = resolveCodeDefaultStandards(testAsset);
    const posture: ISharePointPostureSnapshot = {
      asset: testAsset,
      collectedAt: new Date().toISOString(),
      observations: [],
      uninspectableAreas: [SharePointStandardsArea.SecurityGroups],
    };

    const { areaSummaries } = comparePostureToStandards(standards, posture);
    const groupSummary = areaSummaries.find(
      a => a.area === SharePointStandardsArea.SecurityGroups,
    );
    expect(groupSummary?.outcome).toBe('unknown');
    expect(groupSummary?.expectationsChecked).toBe(0);
  });
});

// ─── Full Comparison Result ─────────────────────────────────────────────────────

describe('buildComparisonResult', () => {
  it('returns compliant outcome for fully compliant posture', () => {
    const standards = resolveCodeDefaultStandards(testAsset);
    const posture = buildCompliantPosture(testAsset);
    const result = buildComparisonResult(testAsset, standards, posture);

    expect(result.outcome).toBe('compliant');
    expect(result.totalDriftCount).toBe(0);
    expect(result.totalRepairableCount).toBe(0);
    expect(result.findings.length).toBe(0);
    expect(result.standardsVersion).toBe(CODE_DEFAULT_STANDARDS_VERSION);
    expect(result.standardsSource).toBe('code-default');
  });

  it('returns drifted outcome when any area has drift', () => {
    const standards = resolveCodeDefaultStandards(testAsset);
    const posture = buildCompliantPosture(testAsset);

    const filtered = posture.observations.filter(
      o => o.expectationId !== 'lib:Drawings',
    );
    const driftedPosture: ISharePointPostureSnapshot = { ...posture, observations: filtered };

    const result = buildComparisonResult(testAsset, standards, driftedPosture);
    expect(result.outcome).toBe('drifted');
    expect(result.totalDriftCount).toBe(1);
    expect(result.totalRepairableCount).toBe(1);
  });

  it('returns unknown outcome when areas are uninspectable and none drifted', () => {
    const standards = resolveCodeDefaultStandards(testAsset);
    const posture: ISharePointPostureSnapshot = {
      asset: testAsset,
      collectedAt: new Date().toISOString(),
      observations: [],
      uninspectableAreas: Object.values(SharePointStandardsArea),
    };

    const result = buildComparisonResult(testAsset, standards, posture);
    expect(result.outcome).toBe('unknown');
  });

  it('populates area summaries for all 9 areas', () => {
    const standards = resolveCodeDefaultStandards(testAsset);
    const posture = buildCompliantPosture(testAsset);
    const result = buildComparisonResult(testAsset, standards, posture);

    expect(result.areaSummaries.length).toBe(9);
  });
});

// ─── Orchestration ──────────────────────────────────────────────────────────────

describe('runSharePointDriftDetection', () => {
  it('runs end-to-end with a compliant posture collector', async () => {
    const collectPosture = async (a: ISharePointManagedAsset) => buildCompliantPosture(a);

    const result = await runSharePointDriftDetection(
      testAsset,
      collectPosture,
      testActor,
    );

    expect(result.outcome).toBe('compliant');
    expect(result.asset.projectId).toBe(testAsset.projectId);
    expect(result.standardsVersion).toBe(CODE_DEFAULT_STANDARDS_VERSION);
  });

  it('runs end-to-end with a drifted posture collector', async () => {
    const collectPosture = async (a: ISharePointManagedAsset): Promise<ISharePointPostureSnapshot> => {
      const compliant = buildCompliantPosture(a);
      return {
        ...compliant,
        observations: compliant.observations.filter(o => o.expectationId !== 'hub:associated'),
      };
    };

    const result = await runSharePointDriftDetection(
      testAsset,
      collectPosture,
      testActor,
    );

    expect(result.outcome).toBe('drifted');
    expect(result.totalDriftCount).toBeGreaterThan(0);
  });

  it('invokes audit and evidence services when provided', async () => {
    const collectPosture = async (a: ISharePointManagedAsset) => buildCompliantPosture(a);

    let auditRecorded = false;
    let evidenceRecorded = false;

    const mockAudit: ISharePointDriftTestAuditService = {
      recordEvent: async () => { auditRecorded = true; },
      listByRunId: async () => [],
      listByEventType: async () => [],
    };

    const mockEvidence: ISharePointDriftTestEvidenceService = {
      recordEvidence: async () => { evidenceRecorded = true; },
      listByRunId: async () => [],
      getEvidence: async () => null,
    };

    await runSharePointDriftDetection(
      testAsset,
      collectPosture,
      testActor,
      mockAudit as never,
      mockEvidence as never,
    );

    expect(auditRecorded).toBe(true);
    expect(evidenceRecorded).toBe(true);
  });
});

// Minimal test-only interfaces to avoid importing full service types
interface ISharePointDriftTestAuditService {
  recordEvent: (record: unknown) => Promise<void>;
  listByRunId: (runId: string) => Promise<readonly unknown[]>;
  listByEventType: (eventType: unknown, options?: unknown) => Promise<readonly unknown[]>;
}

interface ISharePointDriftTestEvidenceService {
  recordEvidence: (ref: unknown, retention: unknown, payload?: unknown) => Promise<void>;
  listByRunId: (runId: string) => Promise<readonly unknown[]>;
  getEvidence: (evidenceId: string) => Promise<unknown | null>;
}
