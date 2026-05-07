import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { REQUIRED_PCC_EVIDENCE_IDS, type PccEvidenceId } from './pcc-evidence.types';
import {
  capturePccDoctrineSource,
  PCC_DOCTRINE_SOURCE_ALLOWED_AREAS,
} from './pcc-live.doctrine-source-capture';
import { writePccDoctrineSource } from './pcc-live.doctrine-source-writer';
import {
  PCC_DOCTRINE_SOURCE_EVIDENCE_IDS,
  type PccDoctrineCategory,
  type PccDoctrineSourceEvidenceRun,
  type PccMoldBreakerTheme,
} from './pcc-live.doctrine-source.types';

const REQUIRED_DOC_PATHS = [
  'docs/explanation/design-decisions/con-tech-ui-study.md',
  'docs/explanation/design-decisions/con-tech-ux-study.md',
  'docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md',
  'docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md',
  'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md',
] as const;

const REQUIRED_ARTIFACT_FILES = [
  'pcc-live-doctrine-source-evidence.json',
  'pcc-live-doctrine-source-evidence.md',
  'governing-doc-verification.json',
  'source-file-index.json',
  'source-file-index.md',
  'doctrine-conformance-map.json',
  'doctrine-conformance-map.md',
  'mold-breaker-review.md',
  'incumbent-failure-mode-map.md',
  'cognitive-load-review.md',
  'progressive-disclosure-review.md',
  'field-office-continuity-review.md',
  'primitive-source-review.md',
  'surface-source-review.md',
  'state-source-review.md',
  'test-coverage-review.md',
  'package-version-proof.md',
] as const;

const FORBIDDEN_STRINGS = [
  'qa.user@hedrickbrothers.com',
  '+1 (561) 555-1212',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
  '?x=1',
  '<button',
  'storageState',
  'cookie',
  'token',
  'session',
  '.auth',
  'test-results',
  'playwright-report',
  'trace.zip',
  'video.webm',
  'network.har',
  'score-ready',
  'Phase 4 ready',
  '56/56 achieved',
  '100/100',
  'mold breaker achieved',
  '"captured"',
];

const FORBIDDEN_CLAIM_PATTERNS = [
  /(^|[^a-z])hard stop passed([^a-z]|$)/i,
  /(^|[^a-z])hard stop failed([^a-z]|$)/i,
];

const DOCTRINE_CATEGORIES: readonly PccDoctrineCategory[] = [
  'shell-host-fit',
  'navigation-orientation',
  'bento-card-hierarchy',
  'responsive-container-discipline',
  'accessibility-semantics',
  'state-feedback',
  'source-of-record-boundary',
  'hbi-authority-boundary',
  'external-launch-boundary',
  'approval-mutation-boundary',
  'content-language-quality',
  'mold-breaker-differentiation',
  'test-coverage-evidence',
  'package-version-evidence',
] as const;

const MOLD_BREAKER_THEMES: readonly PccMoldBreakerTheme[] = [
  'incumbent-failure-mode-contrast',
  'cognitive-load-reduction',
  'progressive-disclosure',
  'field-office-continuity',
  'source-clarity-and-confidence',
  'role-action-clarity',
  'pwa-live-runtime-resilience',
  'mold-breaker-differentiation',
] as const;

function assertNoForbiddenStrings(text: string): void {
  const normalized = text
    .replace(/does not mark any hard stop passed or failed\.?/gi, '')
    .replace(/does not mark any EV captured/gi, '');
  for (const token of FORBIDDEN_STRINGS) {
    expect(normalized).not.toContain(token);
  }
  for (const pattern of FORBIDDEN_CLAIM_PATTERNS) {
    expect(normalized).not.toMatch(pattern);
  }
}

test('Doctrine/source EV tuple is valid', () => {
  expect(PCC_DOCTRINE_SOURCE_EVIDENCE_IDS).toHaveLength(22);
  expect([...PCC_DOCTRINE_SOURCE_EVIDENCE_IDS]).toEqual(
    Array.from({ length: 22 }, (_, i) => `EV-${37 + i}`),
  );

  const unique = new Set(PCC_DOCTRINE_SOURCE_EVIDENCE_IDS);
  expect(unique.size).toBe(PCC_DOCTRINE_SOURCE_EVIDENCE_IDS.length);

  for (const ev of PCC_DOCTRINE_SOURCE_EVIDENCE_IDS) {
    expect(REQUIRED_PCC_EVIDENCE_IDS.includes(ev as PccEvidenceId)).toBe(true);
  }

  expect(PCC_DOCTRINE_SOURCE_EVIDENCE_IDS.some((ev) => Number(ev.replace('EV-', '')) > 58)).toBe(
    false,
  );
});

test('Governing document verification detects required docs', async () => {
  const result = await capturePccDoctrineSource({
    repoRoot: process.cwd(),
    runId: 'doc-verification-test',
    maxFilesPerSourceArea: 20,
  });

  expect(result.governingDocs).toHaveLength(5);
  const pathSet = new Set(result.governingDocs.map((doc) => doc.path));
  for (const required of REQUIRED_DOC_PATHS) {
    expect(pathSet.has(required)).toBe(true);
  }

  for (const doc of result.governingDocs) {
    expect(doc.exists).toBe(true);
    expect(doc.lineCount).toBeGreaterThan(0);
    expect(doc.detectedHeadings.length + doc.notes.length).toBeGreaterThan(0);
  }

  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('hard stop passed');
  expect(serialized).not.toContain('hard stop failed');
  expect(serialized).not.toContain('score-ready');
});

test('Source index is bounded and metadata-only', async () => {
  const result = await capturePccDoctrineSource({
    repoRoot: process.cwd(),
    runId: 'bounded-index-test',
    maxFilesPerSourceArea: 40,
  });

  const observedAreas = new Set(result.sourceIndex.map((entry) => entry.sourceArea));
  for (const area of PCC_DOCTRINE_SOURCE_ALLOWED_AREAS) {
    const hasArea = observedAreas.has(area);
    const hasMissingWarning = result.warnings.some((w) =>
      w.includes(`Source area missing: ${area}`),
    );
    expect(hasArea || hasMissingWarning).toBe(true);
  }

  for (const entry of result.sourceIndex) {
    expect(entry.path.startsWith('/')).toBe(false);
    expect(entry.path.startsWith('..')).toBe(false);
    expect(PCC_DOCTRINE_SOURCE_ALLOWED_AREAS.some((area) => entry.path.startsWith(area))).toBe(
      true,
    );
    expect(entry.path).not.toContain('node_modules');
    expect(entry.path).not.toContain('test-results');
    expect(entry.path).not.toContain('playwright-report');
    expect(entry.path).not.toContain('.auth');
    expect(entry.path.toLowerCase()).not.toContain('storage-state');
    expect(entry.boundedSignalSnippets.length).toBeLessThanOrEqual(3);
    for (const snippet of entry.boundedSignalSnippets) {
      expect(snippet.length).toBeLessThanOrEqual(160);
      assertNoForbiddenStrings(snippet);
    }
  }

  assertNoForbiddenStrings(JSON.stringify(result));
});

test('Writer produces all expected artifacts with sanitized output', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-doctrine-writer-'));
  try {
    const run = await capturePccDoctrineSource({
      repoRoot: process.cwd(),
      runId: 'writer-sanitize-test',
      maxFilesPerSourceArea: 20,
      tenantSiteUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject?x=1&token=abc',
    });

    run.warnings.push(
      'warn qa.user@hedrickbrothers.com +1 (561) 555-1212 ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 <button> ?x=1 storageState cookie token session .auth test-results playwright-report trace.zip video.webm network.har hard stop passed hard stop failed score-ready Phase 4 ready 56/56 achieved 100/100 mold breaker achieved',
    );

    const out = await writePccDoctrineSource({ outputDir: tmpDir, run });

    for (const filename of REQUIRED_ARTIFACT_FILES) {
      expect(fs.existsSync(path.join(tmpDir, filename))).toBe(true);
    }

    const generated = [
      out.evidenceJsonPath,
      out.evidenceMarkdownPath,
      out.governingDocVerificationPath,
      out.sourceFileIndexJsonPath,
      out.sourceFileIndexMarkdownPath,
      out.doctrineConformanceJsonPath,
      out.doctrineConformanceMarkdownPath,
      out.moldBreakerReviewPath,
      out.incumbentFailureModeMapPath,
      out.cognitiveLoadReviewPath,
      out.progressiveDisclosureReviewPath,
      out.fieldOfficeContinuityReviewPath,
      out.primitiveSourceReviewPath,
      out.surfaceSourceReviewPath,
      out.stateSourceReviewPath,
      out.testCoverageReviewPath,
      out.packageVersionProofPath,
    ].map((p) => fs.readFileSync(p, 'utf-8'));

    for (const text of generated) {
      assertNoForbiddenStrings(text);
    }
    expect(generated.some((text) => text.includes('not a final scorecard result'))).toBe(true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Doctrine categories and Mold Breaker themes are complete', async () => {
  const run = await capturePccDoctrineSource({
    repoRoot: process.cwd(),
    runId: 'category-theme-test',
    maxFilesPerSourceArea: 20,
  });

  expect(run.doctrineConformance).toHaveLength(DOCTRINE_CATEGORIES.length);
  expect(run.moldBreakerReview).toHaveLength(MOLD_BREAKER_THEMES.length);

  const categorySet = new Set(run.doctrineConformance.map((item) => item.category));
  for (const category of DOCTRINE_CATEGORIES) {
    expect(categorySet.has(category)).toBe(true);
  }

  const themeSet = new Set(run.moldBreakerReview.map((item) => item.theme));
  for (const theme of MOLD_BREAKER_THEMES) {
    expect(themeSet.has(theme)).toBe(true);
  }

  for (const item of run.doctrineConformance) {
    expect(item.relatedEvidenceIds.length).toBeGreaterThan(0);
    expect(item.expertReviewQuestions.length).toBeGreaterThan(0);
    expect(item.reviewDisposition).not.toBe('source-present');
  }

  for (const item of run.moldBreakerReview) {
    expect(item.relatedEvidenceIds.length).toBeGreaterThan(0);
    expect(item.expertReviewQuestions.length).toBeGreaterThan(0);
    expect(item.reviewDisposition).toBe('expert-review-required');
  }
});

test('Package version proof is review-support only', async () => {
  const run = await capturePccDoctrineSource({
    repoRoot: process.cwd(),
    runId: 'package-proof-test',
    maxFilesPerSourceArea: 20,
  });

  const proof = run.packageVersionProof;
  expect(['review-support', 'source-missing', 'expert-review-required']).toContain(
    proof.reviewDisposition,
  );
  expect(proof.notes.length).toBeGreaterThan(0);

  const text = JSON.stringify(proof).toLowerCase();
  expect(text).not.toContain('phase 4 ready');
  expect(text).not.toContain('deployment success');
});

test('Real repo source/doc audit can write outputs to temp directory', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-doctrine-real-'));
  try {
    const run = await capturePccDoctrineSource({
      repoRoot: process.cwd(),
      runId: 'real-repo-run',
      maxFilesPerSourceArea: 60,
      tenantSiteUrl: 'operator-review-pending',
      repoRootLabel: 'hb-intel',
    });

    const out = await writePccDoctrineSource({ outputDir: tmpDir, run });
    const evidence = JSON.parse(
      fs.readFileSync(out.evidenceJsonPath, 'utf-8'),
    ) as PccDoctrineSourceEvidenceRun;

    expect(evidence.summary.governingDocCount).toBe(5);
    expect(evidence.summary.indexedSourceFileCount).toBeGreaterThan(0);

    for (const filename of REQUIRED_ARTIFACT_FILES) {
      const full = path.join(tmpDir, filename);
      expect(fs.existsSync(full)).toBe(true);
      assertNoForbiddenStrings(fs.readFileSync(full, 'utf-8'));
    }

    expect(fs.readFileSync(out.evidenceMarkdownPath, 'utf-8')).toContain('expert-review-required');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
