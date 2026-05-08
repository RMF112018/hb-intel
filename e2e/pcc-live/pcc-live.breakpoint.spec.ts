import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { REQUIRED_PCC_EVIDENCE_IDS, type PccEvidenceId } from './pcc-evidence.types';
import { skipIfMissingPccLiveEnv } from './pcc-live.env';
import { PccLivePageObject } from './pcc-live.page-object';
import {
  capturePccBreakpoints,
  measureBreakpointCards,
  measureBreakpointGrid,
  measureBreakpointTouchTargets,
} from './pcc-live.breakpoint-capture';
import { writePccBreakpointEvidence } from './pcc-live.breakpoint-evidence-writer';
import {
  PCC_LIVE_RESPONSIVE_MODES,
  PCC_LIVE_VIEWPORT_MATRIX,
  resolvePccLiveResponsiveMode,
} from './pcc-live.breakpoint-matrix';
import {
  PCC_BREAKPOINT_EVIDENCE_IDS,
  type PccLiveBreakpointSurfaceEvidence,
} from './pcc-live.breakpoint.types';
import { PCC_LIVE_SURFACES } from './pcc-live.surfaces';

test('Breakpoint EV tuple and viewport matrix are valid', () => {
  expect(PCC_BREAKPOINT_EVIDENCE_IDS).toHaveLength(13);
  expect(PCC_LIVE_VIEWPORT_MATRIX).toHaveLength(8);
  expect(PCC_LIVE_RESPONSIVE_MODES).toHaveLength(8);

  const unique = new Set(PCC_BREAKPOINT_EVIDENCE_IDS);
  expect(unique.size).toBe(PCC_BREAKPOINT_EVIDENCE_IDS.length);

  for (const id of PCC_BREAKPOINT_EVIDENCE_IDS) {
    expect(REQUIRED_PCC_EVIDENCE_IDS.includes(id as PccEvidenceId)).toBe(true);
  }

  expect([...PCC_BREAKPOINT_EVIDENCE_IDS]).toEqual(
    Array.from({ length: 13 }, (_, i) => `EV-${59 + i}`),
  );

  expect(resolvePccLiveResponsiveMode(320)).toBe('phone');
  expect(resolvePccLiveResponsiveMode(480)).toBe('tabletPortrait');
  expect(resolvePccLiveResponsiveMode(768)).toBe('tabletPortrait');
  expect(resolvePccLiveResponsiveMode(769)).toBe('tabletLandscape');
  expect(resolvePccLiveResponsiveMode(1024)).toBe('tabletLandscape');
  expect(resolvePccLiveResponsiveMode(1025)).toBe('smallLaptop');
  expect(resolvePccLiveResponsiveMode(1180)).toBe('smallLaptop');
  expect(resolvePccLiveResponsiveMode(1181)).toBe('standardLaptop');
  expect(resolvePccLiveResponsiveMode(1440)).toBe('standardLaptop');
  expect(resolvePccLiveResponsiveMode(1441)).toBe('largeLaptop');
  expect(resolvePccLiveResponsiveMode(1599)).toBe('largeLaptop');
  expect(resolvePccLiveResponsiveMode(1600)).toBe('desktop');
  expect(resolvePccLiveResponsiveMode(1919)).toBe('desktop');
  expect(resolvePccLiveResponsiveMode(1920)).toBe('ultrawide');
});

test('Breakpoint writer preserves sanitized output policy', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-breakpoint-writer-'));

  try {
    const curated = 'docs/architecture/evidence/pcc-live/run-001/pcc-live-breakpoint-evidence.json';

    const surfaces: PccLiveBreakpointSurfaceEvidence[] = [
      {
        surfaceId: 'project-home',
        label: 'Project Home',
        viewportId: 'phone-390',
        viewportLabel: 'Phone 390',
        grid: {
          surfaceId: 'project-home',
          viewportId: 'phone-390',
          browserViewportWidth: 390,
          browserViewportHeight: 844,
          measuredContainerWidth: 360,
          measuredContainerHeight: 700,
          observedMode: 'tabletPortrait',
          derivedMode: 'phone',
          expectedColumns: 1,
          observedGridSafety: 'enabled',
          horizontalScrollDetected: true,
          viewportOverflowX: 24,
          documentScrollWidth: 414,
          documentClientWidth: 390,
        },
        cards: [
          {
            surfaceId: 'project-home',
            viewportId: 'phone-390',
            index: 0,
            footprint: 'standard',
            hierarchy: 'primary',
            tier: 'tier1',
            region: 'command',
            headingLevel: '2',
            dataMode: 'phone',
            columnSpan: 1,
            rowSpan: 4,
            measuredHeight: 320,
            boundingWidth: 350,
            boundingHeight: 310,
            directChildOfGrid: false,
            clipped: true,
            overflowX: true,
            overflowY: true,
            minTouchTargetIssueCount: 1,
          },
        ],
        touchTargets: [
          {
            surfaceId: 'project-home',
            viewportId: 'phone-390',
            selector: 'button:nth-of-type(1)',
            role: 'button',
            tagName: 'button',
            width: 40,
            height: 40,
            belowRecommendedSize: true,
          },
        ],
        screenshot: {
          surfaceId: 'project-home',
          viewportId: 'phone-390',
          path: 'docs/architecture/evidence/pcc-live/run-001/breakpoint-screenshots/breakpoint-phone-390-project-home.png',
          fileName: 'breakpoint-phone-390-project-home.png',
          viewportWidth: 390,
          viewportHeight: 844,
          operatorReviewRequired: true,
        },
        warnings: [
          'warning qa.user@hedrickbrothers.com token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 session cookie storageState https://tenant/page?x=1',
        ],
      },
    ];

    const result = await writePccBreakpointEvidence({
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
        evRefs: PCC_BREAKPOINT_EVIDENCE_IDS,
        surfaces,
        warnings: [
          'global warning qa.user@hedrickbrothers.com token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 session cookie storageState https://tenant/page?x=1',
        ],
      },
      artifactPaths: [
        curated,
        'docs/architecture/evidence/pcc-live/run-001/pcc-live-breakpoint-issue-register.json',
        'docs/architecture/evidence/pcc-live/run-001/pcc-live-breakpoint-issue-register.md',
        'test-results/raw-output.json',
        'playwright-report/index.html',
        '.auth/private.json',
        'tmp/storageState.json',
        'tmp/cookies-dump.json',
        'tmp/tokens-dump.json',
        'tmp/sessions-dump.json',
        'out/trace.zip',
        'out/video.webm',
        'out/network.har',
      ],
    });

    const evidenceJson = fs.readFileSync(result.evidenceJsonPath, 'utf-8');
    const evidenceMd = fs.readFileSync(result.evidenceMarkdownPath, 'utf-8');
    const matrixJson = fs.readFileSync(result.matrixJsonPath, 'utf-8');
    const cardsJson = fs.readFileSync(result.cardMeasurementsJsonPath, 'utf-8');
    const touchJson = fs.readFileSync(result.touchTargetsJsonPath, 'utf-8');
    const issueJson = fs.readFileSync(result.issueRegisterJsonPath, 'utf-8');
    const issueMd = fs.readFileSync(result.issueRegisterMarkdownPath, 'utf-8');

    const allFiles = [
      evidenceJson,
      evidenceMd,
      matrixJson,
      cardsJson,
      touchJson,
      issueJson,
      issueMd,
    ];

    expect(evidenceJson).toContain(curated);
    expect(evidenceMd).toContain(curated);
    expect(evidenceJson).toContain('[redacted-email]');
    expect(evidenceJson).toContain('[redacted-cred]');
    expect(evidenceJson).toContain('[redacted-blob]');

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
    ];

    for (const bad of forbidden) {
      for (const fileText of allFiles) {
        expect(fileText).not.toContain(bad);
      }
    }

    expect(evidenceMd).toContain('operator-review required');
    expect(evidenceMd).toContain('not a final scorecard result');
    expect(evidenceJson).not.toContain('"captured"');
    expect(issueMd).toContain('Review support only.');
    expect(issueMd).toContain('No hard stop is passed or failed.');
    expect(issueMd).toContain('No final score is calculated.');
    expect(issueMd).toContain('No EV is finally captured.');
    expect(issueMd).toContain('No Phase 4 readiness is approved.');

    expect(result.issueRegisterIssueCount).toBeGreaterThan(0);
    expect(issueMd).toContain('## mode-mismatch');
    expect(issueMd).toContain('## horizontal-overflow');
    expect(issueMd).toContain('## card-clipping');
    expect(issueMd).toContain('## card-overflow-x');
    expect(issueMd).toContain('## card-overflow-y');
    expect(issueMd).toContain('## direct-child-invariant');
    expect(issueMd).toContain('## touch-target-size');
    expect(issueMd).toContain('### project-home (Project Home)');
    expect(issueMd).toContain('#### phone-390 (Phone 390)');

    const issuePayload = JSON.parse(issueJson) as {
      runId: string;
      generatedAtIso: string;
      summary: { totalIssueCount: number; issueCountByType: Record<string, number> };
      issues: Array<{
        issueType: string;
        evRefs: string[];
        pillarRefs: string[];
        hardStopRefs: string[];
        operatorReviewRequired: boolean;
      }>;
      disclaimer: string;
    };
    expect(issuePayload.runId).toBe('writer-test');
    expect(issuePayload.generatedAtIso.length).toBeGreaterThan(0);
    expect(issuePayload.summary.totalIssueCount).toBe(issuePayload.issues.length);
    expect(issuePayload.summary.issueCountByType['mode-mismatch']).toBeGreaterThan(0);
    expect(issuePayload.summary.issueCountByType['horizontal-overflow']).toBeGreaterThan(0);
    expect(issuePayload.summary.issueCountByType['card-clipping']).toBeGreaterThan(0);
    expect(issuePayload.summary.issueCountByType['card-overflow-x']).toBeGreaterThan(0);
    expect(issuePayload.summary.issueCountByType['card-overflow-y']).toBeGreaterThan(0);
    expect(issuePayload.summary.issueCountByType['direct-child-invariant']).toBeGreaterThan(0);
    expect(issuePayload.summary.issueCountByType['touch-target-size']).toBeGreaterThan(0);
    expect(issuePayload.disclaimer).toContain('Review support only');

    for (const row of issuePayload.issues) {
      expect(row.operatorReviewRequired).toBe(true);
      expect(row.evRefs.length).toBeGreaterThan(0);
      expect(row.pillarRefs.length).toBeGreaterThan(0);
      expect(row.hardStopRefs.length).toBeGreaterThan(0);
    }

    const cardRecords = JSON.parse(cardsJson) as Array<{ minTouchTargetIssueCount: number }>;
    const touchRecords = JSON.parse(touchJson) as Array<{ belowRecommendedSize: boolean }>;
    const matrixRecords = JSON.parse(matrixJson) as Array<{ viewportId: string }>;
    expect(cardRecords.length).toBeGreaterThan(0);
    expect(touchRecords.length).toBeGreaterThan(0);
    expect(matrixRecords.length).toBeGreaterThan(0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Breakpoint capture helpers preserve measurement boundaries', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.setContent(`
    <div data-pcc-bento-grid data-pcc-mode="tabletLandscape" data-pcc-grid-safety="enabled" style="display:grid;grid-template-columns:repeat(6,1fr);width:900px;gap:8px;">
      <article data-pcc-card data-pcc-column-span="2" data-pcc-row-span="3" data-pcc-measured-height="240" data-pcc-card-hierarchy="primary" data-pcc-card-tier="tier1" data-pcc-card-region="command" data-pcc-footprint="standard" data-pcc-heading-level="2" style="width:260px;height:220px;overflow:hidden;">
        <button style="width:30px;height:30px;">Too Small</button>
      </article>
      <div>
        <article data-pcc-card data-pcc-column-span="1" data-pcc-row-span="2" data-pcc-measured-height="180" data-pcc-card-hierarchy="supporting" data-pcc-card-tier="tier3" data-pcc-card-region="reference" data-pcc-footprint="compact" data-pcc-heading-level="3" style="width:200px;height:160px;">
          <a href="#" style="width:50px;height:50px;display:inline-block;">OK</a>
        </article>
      </div>
    </div>
  `);

  const surface = PCC_LIVE_SURFACES[0];
  const viewport = PCC_LIVE_VIEWPORT_MATRIX[2];

  const grid = await measureBreakpointGrid(page, surface, viewport);
  expect(grid).not.toBeNull();
  expect(grid?.derivedMode).toBe('tabletLandscape');

  const cards = await measureBreakpointCards(page, surface, viewport, 20);
  expect(cards).toHaveLength(2);
  expect(cards[0].directChildOfGrid).toBe(true);
  expect(cards[1].directChildOfGrid).toBe(false);
  expect(cards[0].columnSpan).toBe(2);
  expect(cards[0].rowSpan).toBe(3);
  expect(cards[0].measuredHeight).toBe(240);

  const touchTargets = await measureBreakpointTouchTargets(page, surface, viewport, 50);
  expect(touchTargets.length).toBeGreaterThan(0);
  expect(touchTargets.some((target) => target.belowRecommendedSize)).toBe(true);

  const serializedCards = JSON.stringify(cards);
  expect(serializedCards).not.toContain('Too Small');
  expect(serializedCards).not.toContain('OK');
});

test('Live breakpoint capture self-skips without live env', async ({ page }) => {
  test.setTimeout(300_000);
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  const pageObject = new PccLivePageObject(page);
  const runId = `breakpoints-${Date.now()}`;
  const outputDir = path.join(env.evidenceOutputDir, runId);

  const captured = await capturePccBreakpoints({
    page,
    pageObject,
    pageUrl: env.pageUrl,
    surfaces: PCC_LIVE_SURFACES,
    viewports: PCC_LIVE_VIEWPORT_MATRIX,
    outputDir,
  });

  const written = await writePccBreakpointEvidence({
    outputDir,
    run: {
      runId,
      generatedAtIso: new Date().toISOString(),
      tenantSiteUrl: env.siteUrl,
      tenantPageUrl: env.pageUrl,
      expectedPackageVersion: env.expectedPackageVersion,
      selfSkipped: false,
      runState: 'completed',
      evRefs: PCC_BREAKPOINT_EVIDENCE_IDS,
      surfaces: captured.surfaces,
      warnings: captured.surfaces.flatMap((surface) => surface.warnings),
    },
    artifactPaths: [
      path.join(outputDir, 'pcc-live-breakpoint-evidence.json'),
      path.join(outputDir, 'pcc-live-breakpoint-evidence.md'),
      path.join(outputDir, 'pcc-live-breakpoint-matrix.json'),
      path.join(outputDir, 'pcc-live-breakpoint-card-measurements.json'),
      path.join(outputDir, 'pcc-live-breakpoint-touch-targets.json'),
      path.join(outputDir, 'pcc-live-breakpoint-issue-register.json'),
      path.join(outputDir, 'pcc-live-breakpoint-issue-register.md'),
    ],
  });

  expect(fs.existsSync(written.evidenceJsonPath)).toBe(true);
  expect(fs.existsSync(written.evidenceMarkdownPath)).toBe(true);
  expect(fs.existsSync(written.matrixJsonPath)).toBe(true);
  expect(fs.existsSync(written.cardMeasurementsJsonPath)).toBe(true);
  expect(fs.existsSync(written.touchTargetsJsonPath)).toBe(true);
  expect(fs.existsSync(written.issueRegisterJsonPath)).toBe(true);
  expect(fs.existsSync(written.issueRegisterMarkdownPath)).toBe(true);

  expect(new Set(captured.surfaces.map((s) => s.surfaceId)).size).toBe(PCC_LIVE_SURFACES.length);
  expect(new Set(captured.surfaces.map((s) => s.viewportId)).size).toBe(
    PCC_LIVE_VIEWPORT_MATRIX.length,
  );
  expect(captured.screenshotCount).toBeGreaterThan(0);

  for (const row of captured.surfaces) {
    expect(row.grid).toBeDefined();
    expect(row.screenshot?.operatorReviewRequired).toBe(true);
  }
});
