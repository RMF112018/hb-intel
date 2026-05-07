import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { REQUIRED_PCC_EVIDENCE_IDS, type PccEvidenceId } from './pcc-evidence.types';
import { skipIfMissingPccLiveEnv, type PccLiveEnv } from './pcc-live.env';
import { PccLivePageObject } from './pcc-live.page-object';
import { capturePccConditional } from './pcc-live.conditional-capture';
import { writePccConditionalEvidence } from './pcc-live.conditional-evidence-writer';
import {
  PCC_CONDITIONAL_CORE_EVIDENCE_IDS,
  PCC_CONDITIONAL_EVIDENCE_IDS,
  PCC_CONDITIONAL_RELATED_EVIDENCE_IDS,
} from './pcc-live.conditional.types';
import { PCC_LIVE_SURFACES, type PccLiveSurfaceDefinition } from './pcc-live.surfaces';

test('Conditional EV tuple is valid', () => {
  expect(PCC_CONDITIONAL_CORE_EVIDENCE_IDS).toEqual([
    'EV-57',
    'EV-67',
    'EV-68',
    'EV-82',
    'EV-94',
    'EV-96',
    'EV-102',
  ]);
  expect(PCC_CONDITIONAL_RELATED_EVIDENCE_IDS).toEqual([
    'EV-93',
    'EV-95',
    'EV-97',
    'EV-98',
    'EV-99',
    'EV-100',
    'EV-101',
    'EV-103',
    'EV-104',
    'EV-105',
    'EV-106',
  ]);
  expect(PCC_CONDITIONAL_EVIDENCE_IDS).toHaveLength(18);

  const unique = new Set(PCC_CONDITIONAL_EVIDENCE_IDS);
  expect(unique.size).toBe(PCC_CONDITIONAL_EVIDENCE_IDS.length);

  for (const id of PCC_CONDITIONAL_EVIDENCE_IDS) {
    expect(REQUIRED_PCC_EVIDENCE_IDS.includes(id as PccEvidenceId)).toBe(true);
  }
});

test('Conditional writer preserves sanitized output policy', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-conditional-writer-'));
  const unauthorizedPath = '/private/tmp/secrets/unauthorized.storageState.json';

  try {
    const curated =
      'docs/architecture/evidence/pcc-live/run-001/pcc-live-conditional-evidence.json';

    const result = await writePccConditionalEvidence({
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
        evRefs: PCC_CONDITIONAL_EVIDENCE_IDS,
        setup: [
          {
            laneId: 'unauthorized',
            status: 'blocked',
            configured: true,
            attempted: false,
            reason: `missing storageState at ${unauthorizedPath} qa.user@hedrickbrothers.com +1 (561) 555-9876 token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456`,
            evRefs: ['EV-96', 'EV-102'],
          },
        ],
        stateObservations: [
          {
            laneId: 'special-state',
            stateKind: 'read-only',
            observed: true,
            selector: 'div:nth-of-type(1)',
            snippet: '<button>read only ?x=1</button>',
            hasImpact: true,
            hasOwner: true,
            hasNextStep: true,
            needsReview: true,
          },
        ],
        layoutObservations: [
          {
            laneId: 'high-zoom',
            viewportWidth: 1024,
            viewportHeight: 768,
            zoomOrScaleLabel: 'simulated?x=1',
            horizontalOverflowDetected: true,
            clippedElementCount: 2,
            primaryActionVisible: true,
            activePanelVisible: true,
            needsReview: true,
          },
        ],
        focusObservations: [
          {
            laneId: 'drawer-modal',
            dialogCount: 1,
            modalCount: 1,
            drawerCount: 1,
            focusableCount: 0,
            focusRiskCount: 1,
            status: 'needs-review',
            notes: ['hard stop passed hard stop failed score-ready Phase 4 ready'],
          },
        ],
        authObservations: [
          {
            laneId: 'unauthorized',
            attemptedUrl:
              'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx?code=abc',
            unauthorizedStorageConfigured: true,
            pageLoaded: false,
            unauthorizedStateObserved: false,
            signInRedirectObserved: false,
            accessDeniedObserved: false,
            pccContentVisible: false,
            needsReview: true,
            notes: [
              `storageState path ${unauthorizedPath} cookie session token .auth test-results playwright-report trace.zip video.webm network.har`,
            ],
          },
        ],
        warnings: [
          `global warning qa.user@hedrickbrothers.com +1 (561) 555-9876 token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 <button> ?x=1 storageState ${unauthorizedPath} cookie session .auth test-results playwright-report trace.zip video.webm network.har hard stop passed hard stop failed score-ready Phase 4 ready`,
        ],
      },
      artifactPaths: [
        curated,
        unauthorizedPath,
        'test-results/raw-output.json',
        'playwright-report/index.html',
        '.auth/private.json',
        'tmp/storageState.json',
        'out/trace.zip',
        'out/video.webm',
        'out/network.har',
      ],
    });

    const files = [
      result.evidenceJsonPath,
      result.evidenceMarkdownPath,
      result.setupSummaryPath,
      result.stateSummaryPath,
      result.layoutSummaryPath,
      result.focusSummaryPath,
      result.authSummaryPath,
    ].map((f) => fs.readFileSync(f, 'utf-8'));

    expect(files[0]).toContain(curated);
    expect(files[1]).toContain(curated);

    const forbidden = [
      'qa.user@hedrickbrothers.com',
      '+1 (561) 555-9876',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      '?x=1',
      '<button',
      'storageState',
      unauthorizedPath,
      'cookie',
      'token',
      'session',
      '.auth',
      'test-results',
      'playwright-report',
      'trace.zip',
      'video.webm',
      'network.har',
      'hard stop passed',
      'hard stop failed',
      'score-ready',
      'Phase 4 ready',
    ];

    for (const bad of forbidden) {
      for (const text of files) {
        expect(text).not.toContain(bad);
      }
    }

    expect(files[0]).toContain('[redacted-email]');
    expect(files[0]).toContain('[redacted-phone]');
    expect(files[0]).toContain('[redacted-blob]');
    expect(files[1]).toContain('operator-review pending');
    expect(files[1]).toContain('not a final scorecard result');
    expect(files[0]).not.toContain('"captured"');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Conditional capture helper records operator-pending when conditional disabled', async ({
  browser,
  page,
}) => {
  await page.setContent('<div data-pcc-horizontal-tabs></div>');

  const fakePageObject = {
    goto: async () => {},
    waitForPccRoot: async () => {},
    assertSurfaceActive: async (surface: PccLiveSurfaceDefinition) => ({
      surfaceId: surface.id,
      label: surface.label,
      passed: true,
      activePanelFound: true,
      gridCount: 1,
      cardCount: 1,
      tabActive: true,
    }),
  } as unknown as PccLivePageObject;

  const env: PccLiveEnv = {
    siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject',
    pageUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx',
    storageStatePath: '/tmp/unused.json',
    evidenceOutputDir: '/tmp',
    expectedPackageVersion: '1.0.0.16',
    conditionalEnabled: false,
  };

  const result = await capturePccConditional({
    browser,
    page,
    pageObject: fakePageObject,
    env,
    surfaces: PCC_LIVE_SURFACES,
  });

  expect(result.setup).toHaveLength(6);
  for (const lane of result.setup) {
    expect(['operator-pending', 'not-configured']).toContain(lane.status);
    expect(lane.attempted).toBe(false);
  }

  expect(result.authObservations).toHaveLength(0);
  expect(JSON.stringify(result)).not.toContain('captured');
});

test('Synthetic high-zoom / short-height / drawer / special-state boundaries', async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.setContent(`
    <div data-pcc-horizontal-tabs>
      <button type="button" role="tab" data-pcc-tab-id="project-home" data-pcc-tab-active="true" aria-selected="true">Project Home</button>
    </div>
    <div data-pcc-active-surface-panel="project-home" style="width: 4000px;">
      <article data-pcc-card data-pcc-card-hierarchy="primary">
        <button aria-label="Primary Action">Primary Action</button>
      </article>
      <div role="dialog" aria-modal="true" data-pcc-dialog="true">Dialog</div>
      <div data-pcc-drawer="true">Drawer</div>
      <div data-pcc-state="read-only">read-only preview deferred unavailable blocked degraded stale missing configuration mock demo fixture source of record owner next action qa.user@hedrickbrothers.com +1 (561) 555-9876 ?token=abc</div>
    </div>
  `);

  const fakePageObject = {
    goto: async () => {},
    waitForPccRoot: async () => {},
    assertSurfaceActive: async (surface: PccLiveSurfaceDefinition) => ({
      surfaceId: surface.id,
      label: surface.label,
      passed: true,
      activePanelFound: true,
      gridCount: 1,
      cardCount: 1,
      tabActive: true,
    }),
  } as unknown as PccLivePageObject;

  const env: PccLiveEnv = {
    siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject',
    pageUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx',
    storageStatePath: '/tmp/unused.json',
    evidenceOutputDir: '/tmp',
    expectedPackageVersion: '1.0.0.16',
    conditionalEnabled: true,
  };

  const result = await capturePccConditional({
    browser,
    page,
    pageObject: fakePageObject,
    env,
    surfaces: PCC_LIVE_SURFACES,
  });

  expect(result.layoutObservations.some((o) => o.laneId === 'high-zoom')).toBe(true);
  expect(result.layoutObservations.some((o) => o.laneId === 'short-height')).toBe(true);
  expect(result.focusObservations.some((o) => o.laneId === 'drawer-modal')).toBe(true);
  expect(result.stateObservations.some((o) => o.laneId === 'special-state' && o.observed)).toBe(
    true,
  );

  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('qa.user@hedrickbrothers.com');
  expect(serialized).not.toContain('+1 (561) 555-9876');
  expect(serialized).not.toContain('?token=abc');
  expect(serialized).not.toContain('<div');
});

test('Unauthorized lane synthetic/not-configured behavior', async ({ browser, page }) => {
  await page.setContent('<div data-pcc-horizontal-tabs></div>');

  const fakePageObject = {
    goto: async () => {},
    waitForPccRoot: async () => {},
    assertSurfaceActive: async (surface: PccLiveSurfaceDefinition) => ({
      surfaceId: surface.id,
      label: surface.label,
      passed: true,
      activePanelFound: true,
      gridCount: 1,
      cardCount: 1,
      tabActive: true,
    }),
  } as unknown as PccLivePageObject;

  const missingConfiguredEnv: PccLiveEnv = {
    siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject',
    pageUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx',
    storageStatePath: '/tmp/unused.json',
    evidenceOutputDir: '/tmp',
    expectedPackageVersion: '1.0.0.16',
    conditionalEnabled: true,
  };

  const missingPathEnv: PccLiveEnv = {
    ...missingConfiguredEnv,
    unauthorizedStorageStatePath: '/private/tmp/does-not-exist-unauthorized.json',
  };

  const missingConfiguredResult = await capturePccConditional({
    browser,
    page,
    pageObject: fakePageObject,
    env: missingConfiguredEnv,
    surfaces: PCC_LIVE_SURFACES,
  });
  expect(missingConfiguredResult.setup.find((s) => s.laneId === 'unauthorized')?.status).toBe(
    'not-configured',
  );

  const missingPathResult = await capturePccConditional({
    browser,
    page,
    pageObject: fakePageObject,
    env: missingPathEnv,
    surfaces: PCC_LIVE_SURFACES,
  });
  expect(missingPathResult.setup.find((s) => s.laneId === 'unauthorized')?.status).toBe('blocked');

  const serialized = JSON.stringify(missingPathResult);
  expect(serialized).not.toContain('/private/tmp/does-not-exist-unauthorized.json');
});

test('Live conditional capture self-skips or operator-pending without conditional env', async ({
  browser,
  page,
}) => {
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  const pageObject = new PccLivePageObject(page);
  const runId = `conditional-${Date.now()}`;
  const outputDir = path.join(env.evidenceOutputDir, runId);

  const captured = await capturePccConditional({
    browser,
    page,
    pageObject,
    env,
    surfaces: PCC_LIVE_SURFACES,
  });

  const written = await writePccConditionalEvidence({
    outputDir,
    run: {
      runId,
      generatedAtIso: new Date().toISOString(),
      tenantSiteUrl: env.siteUrl,
      tenantPageUrl: env.pageUrl,
      expectedPackageVersion: env.expectedPackageVersion,
      selfSkipped: false,
      runState: env.conditionalEnabled ? 'completed' : 'operator-pending',
      evRefs: captured.evRefs,
      setup: captured.setup,
      stateObservations: captured.stateObservations,
      layoutObservations: captured.layoutObservations,
      focusObservations: captured.focusObservations,
      authObservations: captured.authObservations,
      warnings: captured.warnings,
    },
    artifactPaths: [
      path.join(outputDir, 'pcc-live-conditional-evidence.json'),
      path.join(outputDir, 'pcc-live-conditional-evidence.md'),
      path.join(outputDir, 'pcc-live-conditional-setup-summary.json'),
      path.join(outputDir, 'pcc-live-conditional-state-summary.json'),
      path.join(outputDir, 'pcc-live-conditional-layout-summary.json'),
      path.join(outputDir, 'pcc-live-conditional-focus-summary.json'),
      path.join(outputDir, 'pcc-live-conditional-auth-summary.json'),
    ],
  });

  expect(fs.existsSync(written.evidenceJsonPath)).toBe(true);
  expect(fs.existsSync(written.evidenceMarkdownPath)).toBe(true);
  expect(fs.existsSync(written.setupSummaryPath)).toBe(true);
  expect(fs.existsSync(written.stateSummaryPath)).toBe(true);
  expect(fs.existsSync(written.layoutSummaryPath)).toBe(true);
  expect(fs.existsSync(written.focusSummaryPath)).toBe(true);
  expect(fs.existsSync(written.authSummaryPath)).toBe(true);

  const files = [
    written.evidenceJsonPath,
    written.evidenceMarkdownPath,
    written.setupSummaryPath,
    written.stateSummaryPath,
    written.layoutSummaryPath,
    written.focusSummaryPath,
    written.authSummaryPath,
  ].map((f) => fs.readFileSync(f, 'utf-8'));

  for (const text of files) {
    expect(text).not.toContain('<button');
    expect(text).not.toContain('"captured"');
    expect(text).not.toContain('hard stop passed');
    expect(text).not.toContain('hard stop failed');
    expect(text.toLowerCase()).not.toContain('storagestate');
  }

  if (!env.conditionalEnabled) {
    const statuses = captured.setup.map((s) => s.status);
    expect(statuses.every((s) => s === 'operator-pending' || s === 'not-configured')).toBe(true);
  }
});
