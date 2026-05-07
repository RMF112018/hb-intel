import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { skipIfMissingPccLiveEnv } from './pcc-live.env';
import { PccLivePageObject } from './pcc-live.page-object';
import { writePccLiveSurfaceSmokeEvidence } from './pcc-live.evidence-writer';
import { PCC_LIVE_SURFACE_IDS, PCC_LIVE_SURFACES } from './pcc-live.surfaces';

test('PCC live surface registry is complete and selector-safe', () => {
  expect(PCC_LIVE_SURFACES).toHaveLength(8);
  expect(PCC_LIVE_SURFACE_IDS).toHaveLength(8);

  for (const surface of PCC_LIVE_SURFACES) {
    expect(surface.expectedTabSelector).toBe(`[data-pcc-tab-id="${surface.id}"]`);
    expect(surface.expectedActivePanelSelector).toBe(
      `[data-pcc-active-surface-panel="${surface.id}"]`,
    );
    expect(surface.expectedEvRefs).toEqual(['EV-52', 'EV-55']);
  }
});

test('PCC hosted runtime exposes root shell markers', async ({ page }) => {
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  const po = new PccLivePageObject(page);
  await po.goto(env.pageUrl);
  await po.waitForPccRoot();

  const counts = await po.getRootMarkerCounts();
  expect(counts.tabs).toBeGreaterThan(0);
  expect(counts.grid).toBeGreaterThan(0);
  expect(counts.card).toBeGreaterThan(0);
});

test('PCC hosted runtime navigates all eight surfaces through safe tabs', async ({ page }) => {
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  const po = new PccLivePageObject(page);
  await po.goto(env.pageUrl);
  await po.waitForPccRoot();

  const surfaceResults = await po.inspectAllSurfaces(PCC_LIVE_SURFACES);
  const runtimeErrors = await po.getConsoleAndPageErrorSummary();

  const outputDir = path.join(env.evidenceOutputDir, `surface-smoke-${Date.now()}`);
  await writePccLiveSurfaceSmokeEvidence({
    outputDir,
    runId: `pcc-live-surface-smoke-${Date.now()}`,
    generatedAtIso: new Date().toISOString(),
    tenantSiteUrl: env.siteUrl,
    tenantPageUrl: env.pageUrl,
    expectedPackageVersion: env.expectedPackageVersion,
    surfaces: surfaceResults,
    runtimeErrors,
    selfSkipped: false,
    runState: 'completed',
    warnings: surfaceResults
      .filter((s) => !s.passed)
      .map((s) => s.warning ?? `Surface ${s.surfaceId} failed`),
    artifactPaths: [
      `${outputDir}/pcc-live-surface-smoke.json`,
      `${outputDir}/pcc-live-surface-smoke.md`,
      'test-results/raw-output.json',
      'playwright-report/index.html',
    ],
  });

  const failed = surfaceResults.filter((surface) => !surface.passed);
  expect(
    failed,
    `Surface smoke failed for: ${failed.map((surface) => `${surface.surfaceId} (${surface.warning ?? 'no warning'})`).join(', ')}`,
  ).toHaveLength(0);
});

test('PCC smoke evidence writer preserves sanitized output policy', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-surface-smoke-'));

  try {
    const curated = 'docs/architecture/evidence/pcc-live/run-001/pcc-live-surface-smoke.json';
    const result = await writePccLiveSurfaceSmokeEvidence({
      outputDir: tmpDir,
      runId: 'writer-test',
      generatedAtIso: new Date().toISOString(),
      tenantSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject',
      tenantPageUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx',
      expectedPackageVersion: '1.0.0.16',
      surfaces: [
        {
          surfaceId: 'project-home',
          label: 'Project Home',
          passed: true,
          activePanelFound: true,
          gridCount: 1,
          cardCount: 3,
          tabActive: true,
        },
      ],
      runtimeErrors: {
        consoleErrorCount: 0,
        pageErrorCount: 0,
        items: [],
      },
      selfSkipped: false,
      runState: 'writer-test-only',
      artifactPaths: [
        curated,
        'test-results/raw-output.json',
        'playwright-report/index.html',
        '.auth/private.json',
        'tmp/storageState.json',
        'logs/token-dump.txt',
        'logs/session.log',
        'out/trace.zip',
        'out/video.webm',
        'out/network.har',
      ],
    });

    const jsonText = fs.readFileSync(result.jsonPath, 'utf-8');
    const markdownText = fs.readFileSync(result.markdownPath, 'utf-8');

    expect(jsonText).toContain(curated);
    expect(markdownText).toContain(curated);

    const forbidden = [
      'test-results/raw-output.json',
      'playwright-report/index.html',
      '.auth/private.json',
      'storageState',
      'token-dump',
      'session.log',
      'trace.zip',
      'video.webm',
      'network.har',
    ];

    for (const bad of forbidden) {
      expect(jsonText).not.toContain(bad);
      expect(markdownText).not.toContain(bad);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
