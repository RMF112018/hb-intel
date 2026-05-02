import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  EVIDENCE_STATUSES,
  FEE_STATUSES,
  INSPECTION_RESULT_STATUSES,
  INSPECTION_STATUSES,
  JURISDICTION_TYPES,
  PERMIT_INSPECTION_CHECKPOINT_KINDS,
  PERMIT_INSPECTION_READINESS_POSTURES,
  PERMIT_INSPECTION_SOURCE_FAMILIES,
  PERMIT_STATUSES,
  PRIORITY_ACTION_CATEGORIES,
  PROJECT_READINESS_SOURCE_MODULES,
  RELATED_RECORD_TYPES,
  SOURCE_CLASSIFICATIONS,
  SITE_HEALTH_SEVERITIES,
} from './index.js';
import {
  PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE,
  PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE_ALIAS,
  SAMPLE_FEE_EXPOSURE,
  SAMPLE_INSPECTIONS,
  SAMPLE_PERMIT_INSPECTION_AHJ_PROFILES,
  SAMPLE_PERMIT_INSPECTION_APPROVAL_SIGNALS,
  SAMPLE_PERMIT_INSPECTION_PRIORITY_ACTION_SIGNALS,
  SAMPLE_PERMIT_INSPECTION_READINESS_SIGNALS,
  SAMPLE_PERMIT_INSPECTION_SUMMARY,
  SAMPLE_PERMIT_INSPECTION_TRANSITIONS,
  SAMPLE_PERMITS,
  SAMPLE_REINSPECTION_LINEAGES,
} from './fixtures/permitInspectionControlCenter.js';

function strip(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ' ')
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, ' ')
    .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, ' ');
}

const FORBIDDEN_IMPORT_PATTERNS: readonly RegExp[] = [
  /\b@microsoft\/sp-/,
  /\b@pnp\//,
  /\b@azure\//,
  /\baxios\b/,
  /\bnode-fetch\b/,
  /procore-sdk/i,
  /\b@hbc\/auth\b/,
  /\b@hbc\/spfx-/,
  /\b@hbc\/sharepoint-/,
  /\b@hbc\/functions\b/,
  /\b@hbc\/project-site-provisioning\b/,
  /\b@hbc\/project-site-template\b/,
  /\bnode:fs\b/,
  /\bnode:net\b/,
  /\bnode:http\b/,
];

const CONTRACT_FILE = fileURLToPath(new URL('./PermitInspectionControlCenter.ts', import.meta.url));

describe('Permit & Inspection Control Center vocabularies', () => {
  it('every constant tuple is non-empty and unique', () => {
    const tuples: ReadonlyArray<readonly [string, readonly string[]]> = [
      ['PERMIT_STATUSES', PERMIT_STATUSES],
      ['INSPECTION_STATUSES', INSPECTION_STATUSES],
      ['INSPECTION_RESULT_STATUSES', INSPECTION_RESULT_STATUSES],
      ['FEE_STATUSES', FEE_STATUSES],
      ['EVIDENCE_STATUSES', EVIDENCE_STATUSES],
      ['JURISDICTION_TYPES', JURISDICTION_TYPES],
      ['SOURCE_CLASSIFICATIONS', SOURCE_CLASSIFICATIONS],
      ['RELATED_RECORD_TYPES', RELATED_RECORD_TYPES],
      ['PERMIT_INSPECTION_SOURCE_FAMILIES', PERMIT_INSPECTION_SOURCE_FAMILIES],
      ['PERMIT_INSPECTION_CHECKPOINT_KINDS', PERMIT_INSPECTION_CHECKPOINT_KINDS],
      ['PERMIT_INSPECTION_READINESS_POSTURES', PERMIT_INSPECTION_READINESS_POSTURES],
    ];
    for (const [name, tuple] of tuples) {
      expect(tuple.length, `${name} should be non-empty`).toBeGreaterThan(0);
      expect(new Set(tuple).size, `${name} should have unique values`).toBe(tuple.length);
    }
  });

  it('locks the canonical Wave 10 vocabulary cardinalities', () => {
    expect(PERMIT_STATUSES.length).toBe(11);
    expect(INSPECTION_STATUSES.length).toBe(11);
    expect(INSPECTION_RESULT_STATUSES.length).toBe(4);
    expect(FEE_STATUSES.length).toBe(6);
    expect(EVIDENCE_STATUSES.length).toBe(5);
    expect(JURISDICTION_TYPES.length).toBe(5);
    expect(SOURCE_CLASSIFICATIONS.length).toBe(5);
    expect(RELATED_RECORD_TYPES.length).toBe(3);
    expect(PERMIT_INSPECTION_SOURCE_FAMILIES.length).toBe(2);
    expect(PERMIT_INSPECTION_CHECKPOINT_KINDS.length).toBe(3);
    expect(PERMIT_INSPECTION_READINESS_POSTURES.length).toBe(4);
  });

  it('preserves internal source-family identifiers verbatim', () => {
    expect([...PERMIT_INSPECTION_SOURCE_FAMILIES]).toEqual(['permits', 'required-inspections']);
  });
});

describe('Wave 10 target-added permit and inspection fields', () => {
  it('every permit fixture exposes a numeric `revision` field', () => {
    for (const permit of SAMPLE_PERMITS) {
      expect(typeof permit.revision, `${permit.permitId} revision typeof`).toBe('number');
      expect(permit.revision).toBeGreaterThanOrEqual(0);
    }
  });

  it('at least one permit fixture sets both `applicationValue` and `permitFee`', () => {
    const withFees = SAMPLE_PERMITS.filter(
      (p) => p.applicationValue !== undefined && p.permitFee !== undefined,
    );
    expect(withFees.length).toBeGreaterThan(0);
    for (const permit of withFees) {
      expect(typeof permit.applicationValue).toBe('number');
      expect(typeof permit.permitFee).toBe('number');
    }
  });

  it('reinspection inspection fixture sets `reInspectionFee`', () => {
    const reinspection = SAMPLE_INSPECTIONS.find((i) => i.status === 'reinspection-scheduled');
    expect(reinspection).toBeDefined();
    expect(typeof reinspection?.reInspectionFee).toBe('number');
    expect(reinspection?.reInspectionFee).toBeGreaterThan(0);
  });

  it('reinspection lineage carries `reInspectionFee` and parent/child traceability', () => {
    expect(SAMPLE_REINSPECTION_LINEAGES.length).toBeGreaterThan(0);
    const inspectionIds = new Set(SAMPLE_INSPECTIONS.map((i) => i.inspectionId));
    for (const lineage of SAMPLE_REINSPECTION_LINEAGES) {
      expect(typeof lineage.reInspectionFee).toBe('number');
      expect(lineage.failedItemSummary.length).toBeGreaterThan(0);
      expect(
        inspectionIds.has(lineage.parentInspectionId),
        `parent ${lineage.parentInspectionId} resolves`,
      ).toBe(true);
      if (lineage.childReinspectionId) {
        expect(
          inspectionIds.has(lineage.childReinspectionId),
          `child ${lineage.childReinspectionId} resolves`,
        ).toBe(true);
      }
    }
  });
});

describe('AHJ launcher-only posture', () => {
  it('every AHJ profile sets `launcherOnly: true`', () => {
    expect(SAMPLE_PERMIT_INSPECTION_AHJ_PROFILES.length).toBeGreaterThan(0);
    for (const ahj of SAMPLE_PERMIT_INSPECTION_AHJ_PROFILES) {
      expect(ahj.launcherOnly, `${ahj.ahjId} launcherOnly`).toBe(true);
    }
  });

  it('AHJ portal URLs use only example.invalid hostnames', () => {
    for (const ahj of SAMPLE_PERMIT_INSPECTION_AHJ_PROFILES) {
      if (ahj.portalUrl) {
        expect(ahj.portalUrl).toMatch(/^https:\/\/[^/]*example\.invalid/);
      }
      if (ahj.inspectionPortalUrl) {
        expect(ahj.inspectionPortalUrl).toMatch(/^https:\/\/[^/]*example\.invalid/);
      }
    }
  });
});

describe('Evidence references-only posture', () => {
  function collectLinks() {
    return [
      ...SAMPLE_PERMITS.flatMap((p) => p.evidenceLinks),
      ...SAMPLE_INSPECTIONS.flatMap((i) => i.evidenceLinks),
      ...SAMPLE_REINSPECTION_LINEAGES.flatMap((l) => l.evidenceLinks),
      ...SAMPLE_FEE_EXPOSURE.flatMap((f) => f.receiptEvidenceLinks),
    ];
  }

  it('every evidence link is owned by Document Control', () => {
    const links = collectLinks();
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.ownedByDocumentControl).toBe(true);
    }
  });

  it('every evidence link uses an EvidenceStatus literal', () => {
    const allowed = new Set<string>(EVIDENCE_STATUSES);
    for (const link of collectLinks()) {
      expect(allowed.has(link.status), `${link.id} status`).toBe(true);
    }
  });

  it('at least one record exposes a required-missing evidence link', () => {
    const missing = collectLinks().filter((e) => e.status === 'required-missing');
    expect(missing.length).toBeGreaterThan(0);
  });
});

describe('Source-family continuity', () => {
  it('every permit fixture has sourceFamily `permits`', () => {
    for (const permit of SAMPLE_PERMITS) {
      expect(permit.sourceFamily).toBe('permits');
    }
  });

  it('every inspection fixture has sourceFamily `required-inspections`', () => {
    for (const inspection of SAMPLE_INSPECTIONS) {
      expect(inspection.sourceFamily).toBe('required-inspections');
    }
  });

  it('every workbook source lineage uses workbook-derived or workbook-enhanced classification', () => {
    const allowed = new Set<string>(SOURCE_CLASSIFICATIONS);
    const allLineages = [
      ...SAMPLE_PERMITS.map((p) => p.sourceLineage),
      ...SAMPLE_INSPECTIONS.map((i) => i.sourceLineage),
      ...SAMPLE_PERMIT_INSPECTION_AHJ_PROFILES.map((a) => a.sourceLineage),
    ];
    for (const lineage of allLineages) {
      expect(allowed.has(lineage.classification)).toBe(true);
      expect(lineage.workbookFile.length).toBeGreaterThan(0);
      expect(lineage.sheet.length).toBeGreaterThan(0);
      expect(lineage.range.length).toBeGreaterThan(0);
    }
  });
});

describe('Readiness signal preserves locked source-module identifier', () => {
  it('every readiness signal targets the preserved `permit-log` source-module', () => {
    expect(SAMPLE_PERMIT_INSPECTION_READINESS_SIGNALS.length).toBeGreaterThan(0);
    const allowed = new Set<string>(PROJECT_READINESS_SOURCE_MODULES);
    for (const signal of SAMPLE_PERMIT_INSPECTION_READINESS_SIGNALS) {
      expect(signal.readinessSourceModuleId).toBe('permit-log');
      expect(
        allowed.has(signal.readinessSourceModuleId),
        'permit-log remains in PROJECT_READINESS_SOURCE_MODULES',
      ).toBe(true);
    }
  });

  it('readiness postures are within the Wave 10 vocabulary', () => {
    const allowed = new Set<string>(PERMIT_INSPECTION_READINESS_POSTURES);
    for (const signal of SAMPLE_PERMIT_INSPECTION_READINESS_SIGNALS) {
      expect(allowed.has(signal.posture)).toBe(true);
    }
  });
});

describe('Priority-action and approval signals reference shared vocabularies', () => {
  it('priority-action signals only use existing PriorityActionCategory literals', () => {
    const categories = new Set<string>(PRIORITY_ACTION_CATEGORIES);
    const severities = new Set<string>(SITE_HEALTH_SEVERITIES);
    for (const signal of SAMPLE_PERMIT_INSPECTION_PRIORITY_ACTION_SIGNALS) {
      expect(categories.has(signal.priorityActionCategory), `${signal.signalId} category`).toBe(
        true,
      );
      if (signal.severity) {
        expect(severities.has(signal.severity)).toBe(true);
      }
    }
  });

  it('approval signals use Wave 10 checkpoint-kind vocabulary', () => {
    const allowed = new Set<string>(PERMIT_INSPECTION_CHECKPOINT_KINDS);
    expect(SAMPLE_PERMIT_INSPECTION_APPROVAL_SIGNALS.length).toBeGreaterThan(0);
    for (const signal of SAMPLE_PERMIT_INSPECTION_APPROVAL_SIGNALS) {
      expect(allowed.has(signal.checkpointKind)).toBe(true);
    }
  });
});

describe('Summary counts match fixture content', () => {
  it('summary counts are deterministic snapshots of the fixture body', () => {
    const expectedExpiring = SAMPLE_PERMITS.filter((p) => p.status === 'expiring').length;
    const expectedPendingRevision = SAMPLE_PERMITS.filter(
      (p) => p.status === 'pending-revision',
    ).length;
    const expectedFailed = SAMPLE_INSPECTIONS.filter((i) => i.status === 'failed').length;
    const expectedOpenReinspection = SAMPLE_INSPECTIONS.filter(
      (i) => i.status === 'reinspection-scheduled',
    ).length;
    const expectedOpenFee = SAMPLE_FEE_EXPOSURE.filter(
      (f) => f.feeStatus === 'pending-receipt' || f.feeStatus === 'disputed',
    ).length;

    expect(SAMPLE_PERMIT_INSPECTION_SUMMARY.permitCount).toBe(SAMPLE_PERMITS.length);
    expect(SAMPLE_PERMIT_INSPECTION_SUMMARY.inspectionCount).toBe(SAMPLE_INSPECTIONS.length);
    expect(SAMPLE_PERMIT_INSPECTION_SUMMARY.expiringCount).toBe(expectedExpiring);
    expect(SAMPLE_PERMIT_INSPECTION_SUMMARY.pendingRevisionCount).toBe(expectedPendingRevision);
    expect(SAMPLE_PERMIT_INSPECTION_SUMMARY.failedInspectionCount).toBe(expectedFailed);
    expect(SAMPLE_PERMIT_INSPECTION_SUMMARY.openReinspectionCount).toBe(expectedOpenReinspection);
    expect(SAMPLE_PERMIT_INSPECTION_SUMMARY.openFeeExposureCount).toBe(expectedOpenFee);
    expect(SAMPLE_PERMIT_INSPECTION_SUMMARY.ahjLauncherCount).toBe(
      SAMPLE_PERMIT_INSPECTION_AHJ_PROFILES.length,
    );
  });

  it('top-level fixture wraps the underlying arrays and summary verbatim', () => {
    expect(PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE.permits).toBe(SAMPLE_PERMITS);
    expect(PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE.inspections).toBe(SAMPLE_INSPECTIONS);
    expect(PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE.summary).toBe(SAMPLE_PERMIT_INSPECTION_SUMMARY);
    expect(PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE.permitTransitions).toBe(
      SAMPLE_PERMIT_INSPECTION_TRANSITIONS.permits,
    );
    expect(PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE.inspectionTransitions).toBe(
      SAMPLE_PERMIT_INSPECTION_TRANSITIONS.inspections,
    );
    expect(PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE_ALIAS).toBe(
      PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE,
    );
  });
});

describe('Contract source has no runtime/import boundary leakage', () => {
  it('PermitInspectionControlCenter.ts imports only from sibling pcc/* modules', () => {
    const stripped = strip(readFileSync(CONTRACT_FILE, 'utf8'));
    const importLines = stripped
      .split('\n')
      .filter((line) => /\bimport\b/.test(line) || /\bfrom\b/.test(line));
    for (const line of importLines) {
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(pattern.test(line), `forbidden import: ${line.trim()}`).toBe(false);
      }
    }
  });

  it('contract source contains no mutation/runtime tokens', () => {
    const stripped = strip(readFileSync(CONTRACT_FILE, 'utf8'));
    const forbidden: readonly RegExp[] = [
      /\bfetch\b/i,
      /\baxios\b/i,
      /\bclient\b/i,
      /\bservice\b/i,
      /\bupload\b/i,
      /\bsync\b/i,
      /\bmirror\b/i,
      /\bwriteBack\b/i,
      /\bprovision\b/i,
    ];
    for (const pattern of forbidden) {
      expect(stripped, `matched ${pattern}`).not.toMatch(pattern);
    }
  });
});
