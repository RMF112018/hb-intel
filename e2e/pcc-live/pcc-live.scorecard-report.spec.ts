import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import type { PccEvidencePackageCompletenessRun } from './pcc-live.package-completeness.types';
import { REQUIRED_PCC_EVIDENCE_IDS } from './pcc-evidence.types';
import { PCC_HARD_STOP_IDS, PCC_SCORECARD_PILLAR_IDS } from './pcc-scorecard.types';
import {
  PCC_SCORECARD_REPORT_DISCLAIMER,
  PCC_SCORECARD_REPORT_OUTPUT_FILES,
  assemblePccScorecardReport,
} from './pcc-live.scorecard-report-assembler';
import { writePccScorecardReport } from './pcc-live.scorecard-report-writer';

const FORBIDDEN = [
  'qa.user@hedrickbrothers.com',
  '+1 (561) 555-1212',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
  '?x=1',
  '<button',
  'storageState',
  'storage-state',
  'cookie',
  'token',
  'auth',
  'session',
  'secret',
  'secrets',
  'test-results',
  'playwright-report',
  'trace.zip',
  'video.webm',
  'network.har',
  '.auth',
  '.e2e-auth',
  'hard stop passed',
  'hard stop failed',
  'score-ready',
  'Phase 4 ready',
  '56/56 achieved',
  '100/100',
  'mold breaker achieved',
  'deployment ready',
] as const;

const WORD_BOUNDARY_FORBIDDEN = [
  'storageState',
  'storage-state',
  'cookie',
  'token',
  'auth',
  'session',
  'secret',
  'secrets',
] as const;

const REQUIRED_OUTPUTS = [...PCC_SCORECARD_REPORT_OUTPUT_FILES];
const FORBIDDEN_SCORECARD_V2 = 'PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md';
const PACKAGE_COMPLETENESS_PATHS = [
  'evidence-package-completeness.json',
  'evidence-package-completeness.md',
] as const;

function syntheticPackageCompletenessRun(
  statusByGroup: Partial<Record<string, string>> = {},
): PccEvidencePackageCompletenessRun {
  const groupIds = [
    'surface-smoke',
    'surface-screenshots',
    'breakpoints',
    'accessibility',
    'workflow',
    'content',
    'doctrine-source',
    'conditional',
    'surface-blocks',
    'scorecard-report',
  ] as const;

  const groups = groupIds.map((groupId) => {
    const status = (statusByGroup[groupId] ?? 'present') as
      | 'present'
      | 'missing'
      | 'operator-pending'
      | 'not-configured'
      | 'self-skipped'
      | 'blocked'
      | 'unavailable';
    return {
      groupId,
      label: groupId,
      required: groupId !== 'conditional',
      expectedGlobOrPrefix: `${groupId}-*`,
      expectedFiles: ['placeholder.json'],
      observed: status === 'present',
      observedPathCount: status === 'present' ? 1 : 0,
      observedPaths: status === 'present' ? [`${groupId}-001/placeholder.json`] : [],
      missingExpectedFiles: [],
      status,
      notes: [],
      recommendedAction: 'operator follow-up',
    };
  });

  return {
    runId: 'synthetic-package-completeness',
    generatedAtIso: '2026-05-08T00:00:00.000Z',
    inventorySource: 'artifact-paths',
    groups,
    summary: {
      expectedGroupCount: groups.length,
      presentGroupCount: groups.filter((g) => g.status === 'present').length,
      missingGroupCount: groups.filter((g) => g.status === 'missing').length,
      operatorPendingGroupCount: groups.filter((g) => g.status === 'operator-pending').length,
      notConfiguredGroupCount: groups.filter((g) => g.status === 'not-configured').length,
      selfSkippedGroupCount: groups.filter((g) => g.status === 'self-skipped').length,
      blockedGroupCount: groups.filter((g) => g.status === 'blocked').length,
      unavailableGroupCount: groups.filter((g) => g.status === 'unavailable').length,
      requiredMissingGroupCount: groups.filter((g) => g.required && g.status !== 'present').length,
      observedPathCount: groups.filter((g) => g.status === 'present').length,
      excludedUnsafePathCount: 0,
      excludedUnsafePathReasons: [],
    },
    disclaimer: 'synthetic',
    finalDisposition: 'expert-review-required',
  };
}

function normalizeAllowed(text: string): string {
  return text
    .replaceAll(PCC_SCORECARD_REPORT_DISCLAIMER, '')
    .replaceAll('No hard stop passed or failed.', '')
    .replaceAll('No EV captured by Prompt 13.', '');
}

test('Report type / coverage assembly', () => {
  const run = assemblePccScorecardReport();
  expect(run.requiredEvidenceCount).toBe(REQUIRED_PCC_EVIDENCE_IDS.length);
  expect(run.evidenceCoverage).toHaveLength(REQUIRED_PCC_EVIDENCE_IDS.length);
  expect(run.evidenceCoverage.map((row) => row.evidenceId)).toEqual(REQUIRED_PCC_EVIDENCE_IDS);
  expect(new Set(run.evidenceCoverage.map((row) => row.evidenceId)).size).toBe(
    REQUIRED_PCC_EVIDENCE_IDS.length,
  );
  expect(JSON.stringify(run)).not.toContain(FORBIDDEN_SCORECARD_V2);
});

test('Pillar and hard-stop worksheets', () => {
  const run = assemblePccScorecardReport();
  expect(run.pillarRows).toHaveLength(9);
  expect(run.hardStopRows).toHaveLength(10);
  expect(run.pillarRows.map((row) => row.pillarId)).toEqual(PCC_SCORECARD_PILLAR_IDS);
  expect(run.hardStopRows.map((row) => row.hardStopId)).toEqual(PCC_HARD_STOP_IDS);
  for (const row of run.pillarRows) {
    expect(row.manualScore).toBeNull();
    expect(row.automatedScore).toBeNull();
  }
  for (const row of run.hardStopRows) {
    expect(row.reviewStatus).toBe('manual-review-required');
  }
});

test('Synthetic full report assembly', () => {
  const run = assemblePccScorecardReport({
    runId: 'synthetic-run',
    tenantSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject?x=1&token=abc',
    artifactPaths: [
      'surface-blocks-001/pcc-live-surface-blocks-evidence.json',
      'doctrine-source-001/pcc-live-doctrine-source-evidence.md',
      'evidence/content/pcc-live-content-evidence.md',
      'scorecard-report-001/audit-package-index.json',
      'scorecard-report-001/manual-review-checklist.md',
      ...PACKAGE_COMPLETENESS_PATHS,
    ],
  });

  expect(run.summary.artifactReferenceCount).toBeGreaterThan(0);
  expect(run.artifactInventory.length).toBeGreaterThan(0);
  expect(run.findings.length).toBeGreaterThan(0);
  expect(run.residualRisks.length).toBeGreaterThan(0);
  expect(run.finalDisposition).toBe('report-ready-for-expert-review');
  expect(
    run.artifactInventory.some((artifact) => artifact.sourceLane === 'package-completeness'),
  ).toBe(true);
  expect(run.artifactInventory.some((artifact) => artifact.sourceLane === 'surface-blocks')).toBe(
    true,
  );
  expect(run.artifactInventory.some((artifact) => artifact.sourceLane === 'doctrine-source')).toBe(
    true,
  );
  expect(
    run.artifactInventory.some((artifact) => artifact.path.includes('scorecard-report-001')),
  ).toBe(true);
});

test('All-present package completeness run creates no evidence-package-gap finding', () => {
  const run = assemblePccScorecardReport({
    packageCompletenessRun: syntheticPackageCompletenessRun(),
    artifactPaths: [...PACKAGE_COMPLETENESS_PATHS],
  });
  expect(run.findings.some((f) => f.category === 'evidence-package-gap')).toBe(false);
});

test('Missing package groups create explicit evidence-package-gap findings', () => {
  const run = assemblePccScorecardReport({
    packageCompletenessRun: syntheticPackageCompletenessRun({
      'doctrine-source': 'missing',
      'surface-blocks': 'operator-pending',
      'scorecard-report': 'missing',
    }),
    artifactPaths: [...PACKAGE_COMPLETENESS_PATHS],
  });

  const gapFindings = run.findings.filter((f) => f.category === 'evidence-package-gap');
  expect(gapFindings.length).toBeGreaterThan(0);
  const text = JSON.stringify(run).toLowerCase();
  expect(text).not.toContain('hard stop failed');
  expect(text).not.toContain('phase 4 not ready');
  expect(text).not.toContain('score invalid');
});

test('Missing source handling', () => {
  const run = assemblePccScorecardReport({ artifactPaths: [] });
  expect(run.findings.some((f) => f.disposition === 'operator-review-pending')).toBe(true);
  expect(run.residualRisks.some((r) => r.disposition === 'expert-review-required')).toBe(true);
  expect(run.finalDisposition).toBe('report-ready-for-expert-review');
});

test('Writer artifact completeness', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-scorecard-report-'));
  try {
    const packageRun = syntheticPackageCompletenessRun();
    const result = await writePccScorecardReport({
      outputDir: tmpDir,
      assembleInput: {
        runId: 'writer-completeness',
        packageCompletenessRun: packageRun,
        artifactPaths: [...PACKAGE_COMPLETENESS_PATHS],
      },
    });
    const names = result.files.map((file) => path.basename(file)).sort();
    expect(names).toEqual([...REQUIRED_OUTPUTS].sort());
    for (const file of REQUIRED_OUTPUTS) {
      expect(fs.existsSync(path.join(tmpDir, file))).toBe(true);
      const text = fs.readFileSync(path.join(tmpDir, file), 'utf-8');
      expect(text).not.toContain(FORBIDDEN_SCORECARD_V2);
    }
    const inventoryJson = fs.readFileSync(path.join(tmpDir, 'artifact-inventory.json'), 'utf-8');
    const inventoryMd = fs.readFileSync(path.join(tmpDir, 'artifact-inventory.md'), 'utf-8');
    const indexJson = fs.readFileSync(path.join(tmpDir, 'audit-package-index.json'), 'utf-8');
    const indexMd = fs.readFileSync(path.join(tmpDir, 'audit-package-index.md'), 'utf-8');
    const checklist = fs.readFileSync(path.join(tmpDir, 'manual-review-checklist.md'), 'utf-8');
    const readme = fs.readFileSync(path.join(tmpDir, 'final-report-readme.md'), 'utf-8');

    expect(inventoryJson).toContain('evidence-package-completeness.json');
    expect(inventoryMd).toContain('evidence-package-completeness.md');
    expect(indexJson).toContain('evidence-package-completeness.json');
    expect(indexMd).toContain('evidence-package-completeness.md');
    expect(checklist).toContain('package-completeness artifacts');
    expect(readme).toContain('Package-completeness support artifacts');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Sanitization and forbidden claim lockdown', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-scorecard-sanitize-'));
  try {
    await writePccScorecardReport({
      outputDir: tmpDir,
      assembleInput: {
        runId: 'unsafe-qa.user@hedrickbrothers.com',
        tenantPageUrl:
          'https://example.com/path?x=1 <button> hard stop passed hard stop failed score-ready Phase 4 ready',
        artifactPaths: [
          'test-results/output.json',
          'playwright-report/index.html',
          'trace.zip',
          'video.webm',
          'network.har',
          '.auth/state.json',
          'safe/evidence/EV-125.md',
        ],
        environmentValidationExceptions: [
          'pnpm install --frozen-lockfile blocked by host policy for qa.user@hedrickbrothers.com +1 (561) 555-1212 ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
        ],
      },
    });

    for (const file of REQUIRED_OUTPUTS) {
      const text = normalizeAllowed(fs.readFileSync(path.join(tmpDir, file), 'utf-8'));
      for (const token of FORBIDDEN) {
        if (WORD_BOUNDARY_FORBIDDEN.includes(token as (typeof WORD_BOUNDARY_FORBIDDEN)[number])) {
          continue;
        }
        expect(text).not.toContain(token);
      }
      for (const token of WORD_BOUNDARY_FORBIDDEN) {
        expect(text).not.toMatch(new RegExp(`\\b${token.replace('-', '\\-')}\\b`, 'i'));
      }
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('No automatic scoring', () => {
  const run = assemblePccScorecardReport();
  for (const row of run.pillarRows) {
    expect(row.manualScore).toBeNull();
    expect(row.automatedScore).toBeNull();
  }
  for (const row of run.expertScoringWorksheet) {
    expect(row.manualScore).toBeNull();
    expect(row.automatedScore).toBeNull();
  }
  for (const row of run.hardStopRows) {
    expect(row.reviewStatus).toBe('manual-review-required');
  }
  expect((run as Record<string, unknown>).totalScore).toBeUndefined();
});

test('Regression compatibility', () => {
  const run = assemblePccScorecardReport();
  expect(run.pillarRows.map((row) => row.pillarId)).toEqual(PCC_SCORECARD_PILLAR_IDS);
  expect(run.hardStopRows.map((row) => row.hardStopId)).toEqual(PCC_HARD_STOP_IDS);
  expect(run.evidenceCoverage.map((row) => row.evidenceId)).toEqual(REQUIRED_PCC_EVIDENCE_IDS);
});
