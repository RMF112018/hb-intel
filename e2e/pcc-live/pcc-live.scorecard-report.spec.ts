import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
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
      'evidence/surface-blocks/pcc-live-surface-blocks-evidence.json',
      'evidence/doctrine/pcc-live-doctrine-source-evidence.md',
      'evidence/content/pcc-live-content-evidence.md',
    ],
  });

  expect(run.summary.artifactReferenceCount).toBeGreaterThan(0);
  expect(run.artifactInventory.length).toBeGreaterThan(0);
  expect(run.findings.length).toBeGreaterThan(0);
  expect(run.residualRisks.length).toBeGreaterThan(0);
  expect(run.finalDisposition).toBe('report-ready-for-expert-review');
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
    const result = await writePccScorecardReport({
      outputDir: tmpDir,
      assembleInput: { runId: 'writer-completeness' },
    });
    const names = result.files.map((file) => path.basename(file)).sort();
    expect(names).toEqual([...REQUIRED_OUTPUTS].sort());
    for (const file of REQUIRED_OUTPUTS) {
      expect(fs.existsSync(path.join(tmpDir, file))).toBe(true);
      const text = fs.readFileSync(path.join(tmpDir, file), 'utf-8');
      expect(text).not.toContain(FORBIDDEN_SCORECARD_V2);
    }
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
