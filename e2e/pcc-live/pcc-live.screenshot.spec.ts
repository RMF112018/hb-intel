import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, expect, test } from '@playwright/test';
import { PCC_EVIDENCE_REGISTRY } from './pcc-evidence.registry';
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
    /\b(storageState|storage-state|cookies?|tokens?|auth|sessions?|secrets)\b/gi,
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
            scrollY: 0,
            viewportWidth: 1280,
            viewportHeight: 720,
            actualScrollY: 0,
            meaningfulScrollDelta: 0,
            scrollRootKind: 'window-document',
            scrollRootSelector: 'window/document',
            contentScrollHeight: 1200,
            contentClientHeight: 720,
            actualWindowScrollY: 0,
            actualDocumentScrollLeft: 0,
            actualBodyScrollLeft: 0,
            maxHorizontalScrollLeftObserved: 0,
            activeSurfacePanelLeft: 0,
            activeSurfacePanelRight: 1280,
            activeSurfacePanelWidth: 1280,
            activeSurfacePanelScrollLeft: 0,
            bentoGridLeft: 0,
            bentoGridRight: 1280,
            bentoGridWidth: 1280,
            documentClientWidth: 1280,
            documentScrollWidth: 1280,
            horizontalResetApplied: true,
            horizontalScrollWithinTolerance: true,
            surfacePanelLeftWithinTolerance: true,
            bentoGridLeftWithinTolerance: true,
            captureReliabilityWarnings: [],
            segmentClassification: 'meaningful',
            contentSha256: 'abc123',
            fileSizeBytes: 100,
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
        warnings: [
          'global warning qa.user@hedrickbrothers.com token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 session cookie storageState https://tenant/page?x=1',
        ],
      },
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
    const inventoryText = fs.readFileSync(result.inventoryJsonPath, 'utf-8');
    const domSummaryText = fs.readFileSync(result.domSummaryJsonPath, 'utf-8');
    const contactSheetText = fs.readFileSync(result.screenshotContactSheetPath, 'utf-8');
    const manifestText = fs.readFileSync(result.screenshotManifestByEvPath, 'utf-8');
    const firstScreenText = fs.readFileSync(result.firstScreenReviewIndexPath, 'utf-8');

    expect(fs.existsSync(result.inventoryJsonPath)).toBe(true);
    expect(fs.existsSync(result.domSummaryJsonPath)).toBe(true);
    expect(fs.existsSync(result.screenshotContactSheetPath)).toBe(true);
    expect(fs.existsSync(result.screenshotManifestByEvPath)).toBe(true);
    expect(fs.existsSync(result.firstScreenReviewIndexPath)).toBe(true);

    expect(jsonText).toContain(curated);
    expect(markdownText).toContain(curated);
    expect(jsonText).toContain('[redacted-email]');
    expect(jsonText).toContain('[redacted-cred]');
    expect(jsonText).toContain('[redacted-blob]');
    expect(markdownText).toContain('[redacted-email]');
    expect(markdownText).toContain('[redacted-cred]');

    const forbidden = [
      'qa.user@hedrickbrothers.com',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      '?x=1',
      'storageState',
      'cookie',
      'cookies',
      'token',
      'tokens',
      'session',
      'sessions',
      '.auth',
      'test-results',
      'playwright-report',
      'trace.zip',
      'video.webm',
      'network.har',
      'PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md',
    ];

    for (const bad of forbidden) {
      expect(jsonText).not.toContain(bad);
      expect(markdownText).not.toContain(bad);
      expect(inventoryText).not.toContain(bad);
      expect(domSummaryText).not.toContain(bad);
      expect(contactSheetText).not.toContain(bad);
      expect(manifestText).not.toContain(bad);
      expect(firstScreenText).not.toContain(bad);
    }

    expect(markdownText).toContain('operator-review required');
    expect(contactSheetText).toContain('operator-review-required');
    expect(contactSheetText).toContain('commit-eligible-after-scrub');
    expect(contactSheetText).toContain('Surface');
    expect(contactSheetText).toContain('Kind');
    expect(contactSheetText).toContain('Viewport');
    expect(contactSheetText).toContain('File');
    expect(firstScreenText).toContain('expert-review-required');
    expect(firstScreenText).toContain('operator-review-required');
    expect(firstScreenText).toContain('command-center clarity');
    expect(firstScreenText).not.toContain('full-page');
    expect(firstScreenText).not.toContain('scroll-segment');

    expect(contactSheetText).toContain('No final score is calculated.');
    expect(contactSheetText).toContain('No hard stop is passed or failed.');
    expect(contactSheetText).toContain('No EV is finally captured.');
    expect(contactSheetText).toContain('No Phase 4 readiness is approved.');

    expect(contactSheetText).not.toMatch(/!\[[^\]]*]\((\/|[A-Za-z]:\\)/);

    const inventory = JSON.parse(inventoryText) as Array<{
      operatorReviewRequired: boolean;
      path: string;
    }>;
    expect(inventory.length).toBeGreaterThan(0);
    for (const shot of inventory) {
      expect(shot.operatorReviewRequired).toBe(true);
      expect(shot.path).not.toContain('test-results');
      expect(shot.path).not.toContain('playwright-report');
      expect(shot.path).not.toContain('.auth');
    }

    const manifestRows = JSON.parse(manifestText) as Array<{
      evId: string;
      pillarRefs: string[];
      hardStopRefs: string[];
      surfaceId: string;
      surfaceLabel: string;
      screenshotKind: string;
      fileName: string;
      viewportWidth: number;
      viewportHeight: number;
      operatorReviewRequired: boolean;
      artifactPolicy: string;
      reviewPrompts: string[];
      displayPath: string;
    }>;
    expect(manifestRows.length).toBeGreaterThan(0);
    const first = manifestRows[0];
    expect(first.evId).toMatch(/^EV-\d+$/);
    expect(first.pillarRefs.length).toBeGreaterThan(0);
    expect(first.hardStopRefs.length).toBeGreaterThan(0);
    expect(first.surfaceId).toBe('project-home');
    expect(first.surfaceLabel).toBe('Project Home');
    expect(first.screenshotKind.length).toBeGreaterThan(0);
    expect(first.fileName.length).toBeGreaterThan(0);
    expect(first.viewportWidth).toBeGreaterThan(0);
    expect(first.viewportHeight).toBeGreaterThan(0);
    expect(first.operatorReviewRequired).toBe(true);
    expect(first.artifactPolicy).toBe('operator-review-required');
    expect(first.reviewPrompts.length).toBeGreaterThan(0);
    for (const row of manifestRows) {
      const registry = PCC_EVIDENCE_REGISTRY.find((record) => record.id === row.evId);
      expect(registry).toBeDefined();
      expect(row.pillarRefs).toEqual(registry!.pillarRefs);
      expect(row.hardStopRefs).toEqual(registry!.hardStopRefs);
      expect(row.displayPath.startsWith('/')).toBe(false);
    }

    const noClaimsText =
      `${jsonText}\n${markdownText}\n${contactSheetText}\n${manifestText}\n${firstScreenText}`.toLowerCase();
    expect(noClaimsText).not.toContain('hard stop passed');
    expect(noClaimsText).not.toContain('hard stop failed');
    expect(noClaimsText).not.toContain('100/100');
    expect(noClaimsText).not.toContain('56/56 achieved');
    expect(noClaimsText).not.toContain('phase 4 ready');
    expect(noClaimsText).not.toContain('"captured"');
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
  expect(sanitized).not.toContain('cookie');
  expect(sanitized).not.toContain('session');
  expect(sanitized).not.toContain('?secret=yes');
  expect(sanitized).toContain('[redacted-email]');
  expect(sanitized).toContain('[redacted-cred]');
  expect(sanitized).toContain('[redacted-blob]');
  expect(sanitized.length).toBeLessThanOrEqual(120);
});

test('Screenshot capture self-skips without live env', async () => {
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    test.skip(
      true,
      'Browser launch unavailable in current runtime; skipping live screenshot lane test.',
    );
    return;
  }

  const context = await browser.newContext({
    storageState: env.storageStatePath,
  });
  const page = await context.newPage();

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
  expect(fs.existsSync(runResult.screenshotContactSheetPath)).toBe(true);
  expect(fs.existsSync(runResult.screenshotManifestByEvPath)).toBe(true);
  expect(fs.existsSync(runResult.firstScreenReviewIndexPath)).toBe(true);

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
      expect(typeof shot.actualScrollY).toBe('number');
      expect(typeof shot.horizontalResetApplied).toBe('boolean');
      expect(Array.isArray(shot.captureReliabilityWarnings)).toBe(true);
      expect(typeof shot.surfacePanelLeftWithinTolerance).toBe('boolean');
      expect(typeof shot.bentoGridLeftWithinTolerance).toBe('boolean');
      if (shot.kind === 'scroll-segment') {
        expect(
          shot.segmentClassification === 'meaningful' ||
            shot.segmentClassification === 'duplicate' ||
            shot.segmentClassification === 'not-scrollable',
        ).toBe(true);
      }
    }
    const scrollSegments = surface.screenshots.filter((s) => s.kind === 'scroll-segment');
    expect(scrollSegments.length).toBeGreaterThan(0);
    for (const segment of scrollSegments) {
      const moved = Math.abs((segment.requestedScrollY ?? 0) - segment.actualScrollY) <= 2;
      const explicitNotScrollable = segment.segmentClassification === 'not-scrollable';
      expect(moved || explicitNotScrollable).toBe(true);
    }
  }

  expect(runResult.screenshotCount).toBeGreaterThan(0);
  await context.close();
  await browser.close();
});

test('Scroll-segment preserves requested window-document scroll before capture', async () => {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    test.skip(true, 'Browser launch unavailable in current runtime; skipping synthetic fixture.');
    return;
  }
  const context = await browser.newContext({ viewport: { width: 1200, height: 700 } });
  const page = await context.newPage();
  await page.setContent(`
    <main data-pcc-root>
      <section data-pcc-active-surface-panel="project-home">
        <div data-pcc-bento-grid style="height: 100px; width: 100%;"></div>
      </section>
      <div style="height: 2800px;"></div>
      <article data-pcc-card><h2>Synthetic Card</h2></article>
    </main>
  `);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-scroll-window-'));
  const fakePageObject = {
    assertSurfaceActive: async () => ({ passed: true as const }),
  } as unknown as PccLivePageObject;

  try {
    const captured = await capturePccSurfaceScreenshots({
      page,
      pageObject: fakePageObject,
      surfaces: [PCC_LIVE_SURFACES[0]],
      outputDir: tmpDir,
      maxScrollSegments: 2,
    });

    const segments = captured.surfaces[0].screenshots.filter((s) => s.kind === 'scroll-segment');
    const meaningfulWindowSegment = segments.find(
      (s) =>
        s.scrollRootKind === 'window-document' &&
        (s.requestedScrollY ?? 0) > 0 &&
        s.segmentClassification === 'meaningful',
    );

    expect(meaningfulWindowSegment).toBeDefined();
    expect((meaningfulWindowSegment!.requestedScrollY ?? 0) > 0).toBe(true);
    expect(
      Math.abs(
        (meaningfulWindowSegment!.requestedScrollY ?? 0) - meaningfulWindowSegment!.actualScrollY,
      ) <= 2,
    ).toBe(true);
    expect(meaningfulWindowSegment!.horizontalScrollWithinTolerance).toBe(true);
    expect(meaningfulWindowSegment!.captureReliabilityWarnings.join(' ')).not.toContain(
      'actual-scroll-mismatch',
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    await context.close();
    await browser.close();
  }
});

test('Scroll-segment preserves requested active-panel/container scroll before capture', async () => {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    test.skip(true, 'Browser launch unavailable in current runtime; skipping synthetic fixture.');
    return;
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.setContent(`
    <main data-pcc-root>
      <section
        data-pcc-active-surface-panel="project-home"
        style="height: 260px; overflow-y: auto; overflow-x: auto; border: 1px solid #ccc;"
      >
        <div data-pcc-bento-grid style="width: 1500px; height: 1500px;">
          <div style="height: 260px; background: #e6f0ff;">Panel Row 1</div>
          <div style="height: 260px; background: #ffd9d9;">Panel Row 2</div>
          <div style="height: 260px; background: #d9ffd9;">Panel Row 3</div>
          <div style="height: 260px; background: #fff4cc;">Panel Row 4</div>
          <div style="height: 260px; background: #e9ddff;">Panel Row 5</div>
          <div style="height: 200px; background: #d9f7ff;">Panel Tail</div>
        </div>
      </section>
      <article data-pcc-card><h2>Synthetic Card</h2></article>
    </main>
  `);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-scroll-panel-'));
  const fakePageObject = {
    assertSurfaceActive: async () => ({ passed: true as const }),
  } as unknown as PccLivePageObject;

  try {
    const captured = await capturePccSurfaceScreenshots({
      page,
      pageObject: fakePageObject,
      surfaces: [PCC_LIVE_SURFACES[0]],
      outputDir: tmpDir,
      maxScrollSegments: 2,
    });

    const segments = captured.surfaces[0].screenshots.filter((s) => s.kind === 'scroll-segment');
    const meaningfulPanelSegment = segments.find(
      (s) =>
        (s.scrollRootKind === 'active-surface-panel' || s.scrollRootKind === 'pcc-container') &&
        (s.requestedScrollY ?? 0) > 0 &&
        s.segmentClassification === 'meaningful',
    );

    expect(meaningfulPanelSegment).toBeDefined();
    expect((meaningfulPanelSegment!.requestedScrollY ?? 0) > 0).toBe(true);
    expect(
      Math.abs(
        (meaningfulPanelSegment!.requestedScrollY ?? 0) - meaningfulPanelSegment!.actualScrollY,
      ) <= 2,
    ).toBe(true);
    expect(meaningfulPanelSegment!.horizontalScrollWithinTolerance).toBe(true);
    expect(meaningfulPanelSegment!.captureReliabilityWarnings.join(' ')).not.toContain(
      'actual-scroll-mismatch',
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    await context.close();
    await browser.close();
  }
});

function runResultPath(outputDir: string, fileName: string): string {
  return path.join(outputDir, fileName);
}
