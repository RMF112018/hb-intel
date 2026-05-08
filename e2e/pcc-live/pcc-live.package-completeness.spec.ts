import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  evaluatePccEvidencePackageCompleteness,
  getPccEvidencePackageExpectedGroups,
  renderPccEvidencePackageCompletenessMarkdown,
  writePccEvidencePackageCompleteness,
} from './pcc-live.package-completeness';
import { PCC_SCORECARD_REPORT_OUTPUT_FILES } from './pcc-live.scorecard-report-assembler';
import { assemblePccScorecardReport } from './pcc-live.scorecard-report-assembler';

const ALL_GROUP_IDS = [
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

const SAFE_SYNTHETIC_PATHS = [
  'surface-smoke-001/pcc-live-surface-smoke.json',
  'surface-smoke-001/pcc-live-surface-smoke.md',
  'surface-screenshots-001/pcc-live-screenshot-evidence.json',
  'surface-screenshots-001/pcc-live-screenshot-evidence.md',
  'surface-screenshots-001/pcc-live-screenshot-inventory.json',
  'surface-screenshots-001/pcc-live-dom-card-summary.json',
  'surface-screenshots-001/screenshot-contact-sheet.md',
  'surface-screenshots-001/screenshot-manifest-by-ev.json',
  'surface-screenshots-001/first-screen-review-index.md',
  'breakpoints-001/pcc-live-breakpoint-evidence.json',
  'breakpoints-001/pcc-live-breakpoint-evidence.md',
  'breakpoints-001/pcc-live-breakpoint-matrix.json',
  'breakpoints-001/pcc-live-breakpoint-card-measurements.json',
  'breakpoints-001/pcc-live-breakpoint-touch-targets.json',
  'breakpoints-001/pcc-live-breakpoint-issue-register.json',
  'breakpoints-001/pcc-live-breakpoint-issue-register.md',
  'accessibility-001/pcc-live-accessibility-evidence.json',
  'accessibility-001/pcc-live-accessibility-evidence.md',
  'accessibility-001/pcc-live-axe-summary.json',
  'accessibility-001/pcc-live-keyboard-focus-summary.json',
  'accessibility-001/pcc-live-aria-label-summary.json',
  'accessibility-001/pcc-live-contrast-summary.json',
  'workflow-001/pcc-live-workflow-evidence.json',
  'workflow-001/pcc-live-workflow-evidence.md',
  'content-001/pcc-live-content-evidence.json',
  'content-001/pcc-live-content-evidence.md',
  'doctrine-source-001/pcc-live-doctrine-source-evidence.json',
  'doctrine-source-001/pcc-live-doctrine-source-evidence.md',
  'conditional-001/pcc-live-conditional-evidence.json',
  'conditional-001/pcc-live-conditional-evidence.md',
  'surface-blocks-001/pcc-live-surface-blocks-evidence.json',
  'surface-blocks-001/pcc-live-surface-blocks-evidence.md',
  ...PCC_SCORECARD_REPORT_OUTPUT_FILES.map((file) => `scorecard-report-001/${file}`),
] as const;

const UNSAFE_PATHS = [
  'test-results/raw-output.json',
  'playwright-report/index.html',
  '.auth/state.json',
  'tmp/storageState.json',
  'logs/cookie-dump.txt',
  'logs/token-dump.txt',
  'logs/session-dump.txt',
  'out/trace.zip',
  'out/network.har',
  'out/video.webm',
] as const;

test('expected group taxonomy is complete and unique', () => {
  const groups = getPccEvidencePackageExpectedGroups();
  expect(groups).toHaveLength(10);
  expect(groups.map((g) => g.groupId)).toEqual(ALL_GROUP_IDS);
  expect(new Set(groups.map((g) => g.groupId)).size).toBe(10);

  for (const group of groups) {
    expect(group.expectedDirectoryPrefix.length).toBeGreaterThan(0);
    expect(group.expectedFiles.length).toBeGreaterThan(0);
    expect(group.notes.length).toBeGreaterThan(0);
    expect(typeof group.requiredForFullPhase4ScoringPackage).toBe('boolean');
  }
});

test('complete synthetic package reports all groups as present', async () => {
  const run = await evaluatePccEvidencePackageCompleteness({
    runId: '20260507-134047',
    artifactPaths: SAFE_SYNTHETIC_PATHS,
  });

  expect(run.groups).toHaveLength(10);
  for (const group of run.groups) {
    expect(group.status).toBe('present');
  }
  expect(run.summary.presentGroupCount).toBe(run.summary.expectedGroupCount);
  expect(run.summary.requiredMissingGroupCount).toBe(0);
});

test('missing doctrine-source surface-blocks and scorecard-report are surfaced', async () => {
  const run = await evaluatePccEvidencePackageCompleteness({
    artifactPaths: SAFE_SYNTHETIC_PATHS.filter(
      (p) =>
        !p.startsWith('doctrine-source-') &&
        !p.startsWith('surface-blocks-') &&
        !p.startsWith('scorecard-report-'),
    ),
  });

  const byId = new Map(run.groups.map((g) => [g.groupId, g]));
  expect(byId.get('doctrine-source')?.status).toBe('missing');
  expect(byId.get('surface-blocks')?.status).toBe('missing');
  expect(byId.get('scorecard-report')?.status).toBe('missing');

  const md = renderPccEvidencePackageCompletenessMarkdown(run);
  expect(md).toContain('doctrine-source');
  expect(md).toContain('surface-blocks');
  expect(md).toContain('scorecard-report');
  expect(JSON.stringify(run)).toContain('missing');
});

test('conditional defaults to operator-pending when absent', async () => {
  const run = await evaluatePccEvidencePackageCompleteness({
    artifactPaths: SAFE_SYNTHETIC_PATHS.filter((p) => !p.startsWith('conditional-')),
  });

  const conditional = run.groups.find((g) => g.groupId === 'conditional');
  expect(conditional?.status).toBe('operator-pending');
});

test('conditional override supports not-configured and self-skipped with required note/action', async () => {
  const baseInput = {
    artifactPaths: SAFE_SYNTHETIC_PATHS.filter((p) => !p.startsWith('conditional-')),
    notesByGroup: { conditional: ['Conditional lane intentionally disabled for this run.'] },
  } as const;

  const notConfigured = await evaluatePccEvidencePackageCompleteness({
    ...baseInput,
    statusOverrides: { conditional: 'not-configured' },
    recommendedActionsByGroup: { conditional: 'Record conditional lane disablement in closeout.' },
  });
  expect(notConfigured.groups.find((g) => g.groupId === 'conditional')?.status).toBe(
    'not-configured',
  );

  const selfSkipped = await evaluatePccEvidencePackageCompleteness({
    ...baseInput,
    statusOverrides: { conditional: 'self-skipped' },
    recommendedActionsByGroup: {
      conditional: 'Attach self-skip reason artifact and review operator notes.',
    },
  });
  expect(selfSkipped.groups.find((g) => g.groupId === 'conditional')?.status).toBe('self-skipped');

  await expect(
    evaluatePccEvidencePackageCompleteness({
      artifactPaths: SAFE_SYNTHETIC_PATHS,
      statusOverrides: { conditional: 'not-configured' },
    }),
  ).rejects.toThrow(/requires non-empty notes and recommended action/i);
});

test('blocked and unavailable overrides are supported and not counted as present', async () => {
  const run = await evaluatePccEvidencePackageCompleteness({
    artifactPaths: SAFE_SYNTHETIC_PATHS,
    statusOverrides: {
      'doctrine-source': 'blocked',
      'surface-blocks': 'unavailable',
    },
    notesByGroup: {
      'doctrine-source': ['Policy gate blocked doctrine-source artifact promotion.'],
      'surface-blocks': ['Surface blocks lane artifacts not provided to evaluator.'],
    },
    recommendedActionsByGroup: {
      'doctrine-source': 'Resolve blocker and rerun doctrine-source writer.',
      'surface-blocks': 'Provide lane inventory or rerun surface-blocks package generation.',
    },
  });

  expect(run.groups.find((g) => g.groupId === 'doctrine-source')?.status).toBe('blocked');
  expect(run.groups.find((g) => g.groupId === 'surface-blocks')?.status).toBe('unavailable');
  expect(run.summary.presentGroupCount).toBeLessThan(run.summary.expectedGroupCount);
});

test('group stays present with partial files and missingExpectedFiles remain visible', async () => {
  const run = await evaluatePccEvidencePackageCompleteness({
    artifactPaths: SAFE_SYNTHETIC_PATHS.filter(
      (p) => p !== 'doctrine-source-001/pcc-live-doctrine-source-evidence.md',
    ),
  });

  const doctrine = run.groups.find((g) => g.groupId === 'doctrine-source');
  expect(doctrine?.status).toBe('present');
  expect(doctrine?.missingExpectedFiles).toContain('pcc-live-doctrine-source-evidence.md');

  const md = renderPccEvidencePackageCompletenessMarkdown(run);
  expect(md).toContain('pcc-live-doctrine-source-evidence.md');
});

test('unsafe raw artifacts are excluded with auditable reason summary and safe paths preserved', async () => {
  const run = await evaluatePccEvidencePackageCompleteness({
    runId: '20260507-134047',
    artifactPaths: [...SAFE_SYNTHETIC_PATHS, ...UNSAFE_PATHS],
  });

  expect(run.summary.excludedUnsafePathCount).toBe(UNSAFE_PATHS.length);
  expect(run.summary.excludedUnsafePathReasons.length).toBeGreaterThan(0);

  const text = JSON.stringify(run);
  for (const unsafe of UNSAFE_PATHS) {
    expect(text).not.toContain(unsafe);
  }

  expect(text).toContain('20260507-134047');
  expect(text).toContain('workflow-001/pcc-live-workflow-evidence.json');
});

test('writer emits JSON and Markdown with boundary statements', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-package-completeness-'));
  try {
    const result = await writePccEvidencePackageCompleteness({
      outputDir: tmpDir,
      runId: 'writer-run',
      artifactPaths: SAFE_SYNTHETIC_PATHS,
    });

    expect(fs.existsSync(result.jsonPath)).toBe(true);
    expect(fs.existsSync(result.markdownPath)).toBe(true);

    const json = fs.readFileSync(result.jsonPath, 'utf-8');
    const md = fs.readFileSync(result.markdownPath, 'utf-8');

    expect(json).toContain('"groups"');
    expect(md).toContain('| Group | Status | Required | Observed paths | Missing expected files |');

    expect(md).toContain('Review support only.');
    expect(md).toContain('No final score is calculated.');
    expect(md).toContain('No hard stop is passed or failed.');
    expect(md).toContain('No EV is finally captured.');
    expect(md).toContain('No Phase 4 readiness is approved.');

    const combined = `${json}\n${md}`.toLowerCase();
    expect(combined).not.toContain('hard stop passed');
    expect(combined).not.toContain('hard stop failed');
    expect(combined).not.toContain('100/100');
    expect(combined).not.toContain('56/56 achieved');
    expect(combined).not.toContain('phase 4 ready');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('scorecard-report compatibility remains intact', () => {
  const run = assemblePccScorecardReport();
  expect(run.finalDisposition).toBe('report-ready-for-expert-review');
});
