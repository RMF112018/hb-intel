import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { skipIfMissingPccLiveEnv } from './pcc-live.env';
import { PccLivePageObject } from './pcc-live.page-object';
import { writePccLiveSurfaceSmokeEvidence } from './pcc-live.evidence-writer';
import {
  PCC_LIVE_SURFACE_IDS,
  PCC_LIVE_SURFACE_REGISTRY,
  PCC_LIVE_SURFACES,
} from './pcc-live.surfaces';

test('PCC live surface registry is complete and selector-safe', () => {
  expect(PCC_LIVE_SURFACES).toHaveLength(8);
  expect(PCC_LIVE_SURFACE_IDS).toHaveLength(8);

  for (const surface of PCC_LIVE_SURFACES) {
    expect(surface.expectedTabSelector).toBe(`[data-pcc-tab-id="${surface.id}"]`);
    expect(surface.expectedActivePanelSelector).toBe(
      `[data-pcc-active-surface-panel="${surface.id}"]`,
    );
    // Wave 15A wave-b7 Prompt 05 — broad compatibility selector stays;
    // shell-specific selector is added as evidence-only (never gates
    // the live `passed` calculation). See PccLivePageObject.
    expect(surface.expectedShellActivePanelSelector).toBe(
      `main[role="tabpanel"][data-pcc-active-surface-panel="${surface.id}"]`,
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
          activePanelCount: 2,
          activePanelOwnerTagName: 'MAIN',
          activePanelRole: 'tabpanel',
          activePanelId: 'pcc-active-surface-panel',
          activePanelIsShellMain: true,
          shellActivePanelFound: true,
          shellActivePanelCount: 1,
          gridCount: 1,
          cardCount: 3,
          tabActive: true,
          warning:
            'Warning for qa.user@hedrickbrothers.com token=ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 and https://tenant/site?p=secret',
        },
      ],
      runtimeErrors: {
        consoleErrorCount: 1,
        pageErrorCount: 1,
        items: [
          {
            type: 'console',
            count: 1,
            messageHash: 'h1',
            message:
              'console error for qa.user@hedrickbrothers.com storageState token=ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 session cookie https://tenant/site?p=secret',
          },
          {
            type: 'pageerror',
            count: 1,
            messageHash: 'h2',
            message: 'pageerror has auth secrets and query https://tenant/page?token=secret',
          },
        ],
      },
      selfSkipped: false,
      runState: 'writer-test-only',
      warnings: [
        'warning with email qa.user@hedrickbrothers.com token=ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 cookie session storageState https://tenant/path?q=secret',
      ],
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
      'qa.user@hedrickbrothers.com',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      '?q=secret',
      'cookie',
      'token',
      'session',
    ];

    for (const bad of forbidden) {
      expect(jsonText).not.toContain(bad);
      expect(markdownText).not.toContain(bad);
    }

    expect(jsonText).toContain('[redacted-email]');
    expect(markdownText).toContain('[redacted-email]');
    expect(jsonText).toContain('[redacted-blob]');
    expect(markdownText).toContain('[redacted-blob]');
    expect(jsonText).toContain('[redacted-cred]');
    expect(markdownText).toContain('[redacted-cred]');

    // Wave 15A wave-b7 Prompt 05 — owner / shell evidence fields
    // surface in both JSON and Markdown without leaking any forbidden
    // token (the values 'MAIN', 'tabpanel', and
    // 'pcc-active-surface-panel' do not collide with the redacted
    // keyword set above).
    expect(jsonText).toContain('"activePanelCount": 2');
    expect(jsonText).toContain('"activePanelOwnerTagName": "MAIN"');
    expect(jsonText).toContain('"activePanelRole": "tabpanel"');
    expect(jsonText).toContain('"activePanelId": "pcc-active-surface-panel"');
    expect(jsonText).toContain('"activePanelIsShellMain": true');
    expect(jsonText).toContain('"shellActivePanelCount": 1');

    expect(markdownText).toContain('Active Panel Count');
    expect(markdownText).toContain('Shell Main');
    expect(markdownText).toContain('MAIN role=tabpanel id=pcc-active-surface-panel');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// Non-live page-object tests — Wave 15A wave-b7 Prompt 05.
//
// These tests run without tenant env / auth. They use page.route to
// intercept all requests and return a minimal HTML body so page.goto
// to a fake https URL succeeds (the page-object's
// assertCurrentUrlWithinExpectedOrigin guard requires `^https://`).
// page.setContent then injects the surface-shaped DOM, and
// assertSurfaceActive exercises the same branch live tenant smoke
// uses, just against controlled markup.

test('PCC surface smoke records shell active-panel ownership without making it a hard gate', async ({
  page,
}) => {
  await page.route('**/*', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<html><head></head><body></body></html>',
    }),
  );
  await page.goto('https://pcc-live-fixture.invalid/');
  await page.setContent(`
    <div data-pcc-horizontal-tabs>
      <button type="button" role="tab" aria-selected="false" data-pcc-tab-id="project-home" data-pcc-tab-active="false">Project Home</button>
      <button type="button" role="tab" aria-selected="false" data-pcc-tab-id="documents" data-pcc-tab-active="false">Documents</button>
    </div>
    <main id="pcc-active-surface-panel" role="tabpanel" data-pcc-active-surface-panel="documents">
      <div data-pcc-bento-grid>
        <article data-pcc-card data-pcc-active-surface-panel="documents">Documents command</article>
        <article data-pcc-card>Detail</article>
      </div>
    </main>
    <script>
      document.querySelector('[data-pcc-tab-id="documents"]').addEventListener('click', () => {
        const tab = document.querySelector('[data-pcc-tab-id="documents"]');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('data-pcc-tab-active', 'true');
      });
    </script>
  `);

  const po = new PccLivePageObject(page);
  const result = await po.assertSurfaceActive(PCC_LIVE_SURFACE_REGISTRY.documents);

  expect(result.passed).toBe(true);
  expect(result.activePanelFound).toBe(true);
  expect(result.activePanelCount).toBe(2);
  expect(result.activePanelOwnerTagName).toBe('MAIN');
  expect(result.activePanelRole).toBe('tabpanel');
  expect(result.activePanelId).toBe('pcc-active-surface-panel');
  expect(result.activePanelIsShellMain).toBe(true);
  expect(result.shellActivePanelFound).toBe(true);
  expect(result.shellActivePanelCount).toBe(1);
  expect(result.warning).toBeUndefined();
});

test('PCC surface smoke records non-shell active-panel ownership as warning without failing compatibility smoke', async ({
  page,
}) => {
  await page.route('**/*', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<html><head></head><body></body></html>',
    }),
  );
  await page.goto('https://pcc-live-fixture.invalid/');
  await page.setContent(`
    <div data-pcc-horizontal-tabs>
      <button type="button" role="tab" aria-selected="false" data-pcc-tab-id="documents" data-pcc-tab-active="false">Documents</button>
    </div>
    <div data-pcc-bento-grid>
      <article data-pcc-card data-pcc-active-surface-panel="documents">Documents command</article>
      <article data-pcc-card>Detail</article>
    </div>
    <script>
      document.querySelector('[data-pcc-tab-id="documents"]').addEventListener('click', () => {
        const tab = document.querySelector('[data-pcc-tab-id="documents"]');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('data-pcc-tab-active', 'true');
      });
    </script>
  `);

  const po = new PccLivePageObject(page);
  const result = await po.assertSurfaceActive(PCC_LIVE_SURFACE_REGISTRY.documents);

  expect(result.passed).toBe(true);
  expect(result.activePanelFound).toBe(true);
  expect(result.activePanelCount).toBe(1);
  expect(result.activePanelOwnerTagName).toBe('ARTICLE');
  expect(result.activePanelIsShellMain).toBe(false);
  expect(result.shellActivePanelFound).toBe(false);
  expect(result.shellActivePanelCount).toBe(0);
  expect(result.warning).toContain('passed compatibility smoke');
  expect(result.warning).toContain('shell main ownership not observed');
  expect(result.warning).toContain('Tenant package may lag Phase 2');
});
