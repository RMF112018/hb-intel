import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { REQUIRED_PCC_EVIDENCE_IDS, type PccEvidenceId } from './pcc-evidence.types';
import { skipIfMissingPccLiveEnv } from './pcc-live.env';
import { PccLivePageObject } from './pcc-live.page-object';
import { capturePccSurfaceScreenshots } from './pcc-live.screenshot-capture';
import {
  PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS,
  type PccDomCardSummary,
  type PccSurfaceScreenshotEvidence,
} from './pcc-live.screenshot.types';
import { writePccScreenshotEvidence } from './pcc-live.screenshot-evidence-writer';
import { PCC_LIVE_SURFACES } from './pcc-live.surfaces';

function sanitizeHeadingForTest(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noCred = noEmail.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noBlob = noCred.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, 120);
}

test('Screenshot evidence EV tuple is valid', () => {
  expect(PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS).toHaveLength(23);

  const set = new Set(PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS);
  expect(set.size).toBe(PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS.length);

  for (const id of PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS) {
    expect(REQUIRED_PCC_EVIDENCE_IDS.includes(id as PccEvidenceId)).toBe(true);
  }

  const expected = [
    ...Array.from({ length: 13 }, (_, i) => `EV-${i + 37}`),
    ...Array.from({ length: 10 }, (_, i) => `EV-${i + 125}`),
  ];
  expect([...PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS]).toEqual(expected);
});

test('Screenshot writer preserves sanitized output policy', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-screenshot-writer-'));

  try {
    const curated = 'docs/architecture/evidence/pcc-live/run-001/pcc-live-screenshot-evidence.json';

    const surfaces: PccSurfaceScreenshotEvidence[] = [
      {
        surfaceId: 'project-home',
        label: 'Project Home',
        passed: true,
        screenshots: [
          {
            surfaceId: 'project-home',
            kind: 'above-fold',
            path: 'docs/architecture/evidence/pcc-live/run-001/screenshots/surface-project-home-above-fold.png',
            fileName: 'surface-project-home-above-fold.png',
            width: 1280,
            height: 720,
            viewportWidth: 1280,
            viewportHeight: 720,
            operatorReviewRequired: true,
          },
        ],
        cardSummaries: [
          {
            surfaceId: 'project-home',
            index: 0,
            hierarchy: 'primary',
            tier: 'tier1',
            region: 'command',
            footprint: 'wide',
            headingLevel: '2',
            headingText:
              'owner qa.user@hedrickbrothers.com token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 https://tenant/page?x=1',
            cardSelector: '[data-pcc-card]:nth-of-type(1)',
            textWasSanitized: true,
          },
        ],
        warnings: [
          'warn qa.user@hedrickbrothers.com token=ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 session cookie storageState https://tenant/page?x=1',
        ],
      },
    ];

    const result = await writePccScreenshotEvidence({
      outputDir: tmpDir,
      run: {
        runId: 'writer-test',
        generatedAtIso: new Date().toISOString(),
        tenantSiteUrl:
          'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject?token=abc',
        tenantPageUrl:
          'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx?auth=abc',
        expectedPackageVersion: '1.0.0.16',
        selfSkipped: false,
        runState: 'writer-test-only',
        evRefs: PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS,
        surfaces,
      },
      warnings: [
        'global warning qa.user@hedrickbrothers.com token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      ],
      artifactPaths: [
        curated,
        'test-results/raw-output.json',
        'playwright-report/index.html',
        '.auth/private.json',
        'tmp/storageState.json',
        'out/trace.zip',
        'out/video.webm',
        'out/network.har',
      ],
    });

    const jsonText = fs.readFileSync(result.evidenceJsonPath, 'utf-8');
    const markdownText = fs.readFileSync(result.evidenceMarkdownPath, 'utf-8');

    expect(fs.existsSync(result.inventoryJsonPath)).toBe(true);
    expect(fs.existsSync(result.domSummaryJsonPath)).toBe(true);

    expect(jsonText).toContain(curated);
    expect(markdownText).toContain(curated);

    const forbidden = [
      'qa.user@hedrickbrothers.com',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      '?x=1',
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
    ];

    for (const bad of forbidden) {
      expect(jsonText).not.toContain(bad);
      expect(markdownText).not.toContain(bad);
    }

    expect(jsonText).toContain('[redacted-email]');
    expect(jsonText).toContain('[redacted-cred]');
    expect(jsonText).toContain('[redacted-blob]');
    expect(markdownText).toContain('operator-review required');

    const inventory = JSON.parse(fs.readFileSync(result.inventoryJsonPath, 'utf-8')) as Array<{
      operatorReviewRequired: boolean;
    }>;
    expect(inventory.length).toBeGreaterThan(0);
    for (const shot of inventory) {
      expect(shot.operatorReviewRequired).toBe(true);
    }

    expect(jsonText).not.toContain('"captured"');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('DOM card summary sanitizer trims unsafe heading text', () => {
  const unsafe =
    'Owner qa.user@hedrickbrothers.com token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 storageState cookie session https://tenant/page?secret=yes';

  const sanitized = sanitizeHeadingForTest(unsafe);
  expect(sanitized).not.toContain('qa.user@hedrickbrothers.com');
  expect(sanitized).not.toContain('ABCDEFGHIJKLMNOPQRSTUVWXYZ123456');
  expect(sanitized).not.toContain('storageState');
  expect(sanitized).not.toContain('?secret=yes');
  expect(sanitized).toContain('[redacted-email]');
  expect(sanitized).toContain('[redacted-cred]');
  expect(sanitized).toContain('[redacted-blob]');
  expect(sanitized.length).toBeLessThanOrEqual(120);
});

test('Screenshot capture self-skips without live env', async ({ page }) => {
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  const pageObject = new PccLivePageObject(page);
  await pageObject.goto(env.pageUrl);
  await pageObject.waitForPccRoot();

  const runId = `surface-screenshots-${Date.now()}`;
  const outputDir = path.join(env.evidenceOutputDir, runId);

  const captured = await capturePccSurfaceScreenshots({
    page,
    pageObject,
    surfaces: PCC_LIVE_SURFACES,
    outputDir,
  });

  const runResult = await writePccScreenshotEvidence({
    outputDir,
    run: {
      runId,
      generatedAtIso: new Date().toISOString(),
      tenantSiteUrl: env.siteUrl,
      tenantPageUrl: env.pageUrl,
      expectedPackageVersion: env.expectedPackageVersion,
      selfSkipped: false,
      runState: 'completed',
      evRefs: PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS,
      surfaces: captured.surfaces,
    },
    warnings: captured.surfaces.flatMap((surface) => surface.warnings),
    artifactPaths: [
      runResultPath(outputDir, 'pcc-live-screenshot-evidence.json'),
      runResultPath(outputDir, 'pcc-live-screenshot-evidence.md'),
      runResultPath(outputDir, 'pcc-live-screenshot-inventory.json'),
      runResultPath(outputDir, 'pcc-live-dom-card-summary.json'),
    ],
  });

  expect(fs.existsSync(runResult.evidenceJsonPath)).toBe(true);
  expect(fs.existsSync(runResult.evidenceMarkdownPath)).toBe(true);
  expect(fs.existsSync(runResult.inventoryJsonPath)).toBe(true);
  expect(fs.existsSync(runResult.domSummaryJsonPath)).toBe(true);

  expect(captured.surfaces).toHaveLength(8);
  for (const surface of captured.surfaces) {
    expect(surface.screenshots.some((s) => s.kind === 'above-fold')).toBe(true);
    expect(surface.screenshots.some((s) => s.kind === 'full-page')).toBe(true);
    expect(surface.screenshots.some((s) => s.kind === 'scroll-segment')).toBe(true);
    const hasCards = surface.cardSummaries.length > 0;
    const hasWarning = surface.warnings.length > 0;
    expect(hasCards || hasWarning).toBe(true);
    for (const shot of surface.screenshots) {
      expect(shot.operatorReviewRequired).toBe(true);
    }
  }

  expect(runResult.screenshotCount).toBeGreaterThan(0);
});

function runResultPath(outputDir: string, fileName: string): string {
  return path.join(outputDir, fileName);
}
