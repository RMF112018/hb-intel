import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { REQUIRED_PCC_EVIDENCE_IDS, type PccEvidenceId } from './pcc-evidence.types';
import { skipIfMissingPccLiveEnv } from './pcc-live.env';
import { PccLivePageObject } from './pcc-live.page-object';
import { capturePccWorkflow } from './pcc-live.workflow-capture';
import { writePccWorkflowEvidence } from './pcc-live.workflow-evidence-writer';
import {
  PCC_WORKFLOW_EVIDENCE_IDS,
  type PccWorkflowSurfaceEvidence,
} from './pcc-live.workflow.types';
import { PCC_LIVE_SURFACES } from './pcc-live.surfaces';

test('Workflow EV tuple is valid', () => {
  expect(PCC_WORKFLOW_EVIDENCE_IDS).toHaveLength(24);

  const unique = new Set(PCC_WORKFLOW_EVIDENCE_IDS);
  expect(unique.size).toBe(PCC_WORKFLOW_EVIDENCE_IDS.length);

  for (const id of PCC_WORKFLOW_EVIDENCE_IDS) {
    expect(REQUIRED_PCC_EVIDENCE_IDS.includes(id as PccEvidenceId)).toBe(true);
  }

  expect([...PCC_WORKFLOW_EVIDENCE_IDS]).toEqual(
    Array.from({ length: 24 }, (_, i) => `EV-${83 + i}`),
  );
});

test('Workflow writer preserves sanitized output policy', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-workflow-writer-'));

  try {
    const curated =
      'docs/architecture/evidence/pcc-live/20260507-134047/workflow-1778175784527/pcc-live-workflow-evidence.json';
    const curatedMultiNumeric =
      'docs/architecture/evidence/pcc-live/20260507-134047/surface-screenshots-1778175753367/card-01-1280x720.png';

    const surfaces: PccWorkflowSurfaceEvidence[] = [
      {
        surfaceId: 'external-systems',
        label: 'External Platforms',
        actions: [
          {
            surfaceId: 'external-systems',
            selector: 'a:nth-of-type(1)',
            tagName: 'a',
            role: 'link',
            kind: 'launch',
            enabled: true,
            disabled: false,
            ariaDisabled: false,
            hasDisabledReason: false,
            hasAccessibleName: true,
            labelSnippet:
              'Launch Procore qa.user@hedrickbrothers.com +1 (561) 555-9876 token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
            destinationHost: 'app.procore.com',
            destinationPath: '/project/123?x=1',
            destinationIsExternal: true,
            mutationKeywordDetected: false,
            readOnlyOrPreviewContext: false,
            falseAffordanceRisk: 'none-observed',
            needsReview: false,
          },
        ],
        priority: {
          surfaceId: 'external-systems',
          primaryActionCount: 1,
          priorityCardCount: 1,
          referenceCardCount: 0,
          priorityBeforeReference: true,
          needsReview: false,
          notes: ['ok'],
        },
        states: [
          {
            surfaceId: 'external-systems',
            stateKind: 'read-only',
            observed: true,
            selector: 'div:nth-of-type(1)',
            copySnippet: '<button>read only message ?x=1</button>',
            hasImpact: true,
            hasOwner: true,
            hasNextStep: true,
            needsReview: true,
          },
        ],
        sources: [
          {
            surfaceId: 'external-systems',
            sourceSystem: 'Mock',
            observed: true,
            selector: 'div:nth-of-type(2)',
            ownershipSnippet: 'owner qa.user@hedrickbrothers.com +1 (561) 555-9876',
            readOnlyBoundaryObserved: true,
            writeAuthorityClaimObserved: false,
            needsReview: true,
          },
        ],
        hbiAuthority: {
          surfaceId: 'external-systems',
          selector: 'div:nth-of-type(3)',
          hbiMentionObserved: true,
          commandSearchObserved: true,
          advisoryLanguageObserved: true,
          mutationAuthorityClaimObserved: false,
          riskyKeywordCount: 1,
          needsReview: true,
        },
        externalPlatform: {
          surfaceId: 'external-systems',
          launchSurfaceObserved: true,
          launchOnlyLanguageObserved: true,
          externalLinkCount: 1,
          unsafeExecutableActionCount: 1,
          destinationHosts: ['app.procore.com?token=abc'],
          needsReview: true,
        },
        approvalsQueue: {
          surfaceId: 'external-systems',
          queueObserved: true,
          approveActionCount: 1,
          rejectActionCount: 1,
          submitActionCount: 1,
          readOnlyOrPreviewBoundaryObserved: true,
          disabledReasonCount: 1,
          riskyExecutableActionCount: 1,
          needsReview: true,
        },
        continuity: {
          surfaceId: 'external-systems',
          ownerSignalCount: 1,
          responsibilitySignalCount: 1,
          crossSurfaceReferenceCount: 1,
          lifecycleLanguageCount: 1,
          nextActionLanguageCount: 1,
          needsReview: true,
        },
        warnings: [
          'warn qa.user@hedrickbrothers.com +1 (561) 555-9876 token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 <button> storageState cookie session test-results/playwright-report trace.zip video.webm network.har hard stop passed hard stop failed score-ready Phase 4 ready',
        ],
      },
    ];

    const result = await writePccWorkflowEvidence({
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
        evRefs: PCC_WORKFLOW_EVIDENCE_IDS,
        surfaces,
        warnings: [
          'global qa.user@hedrickbrothers.com +1 (561) 555-9876 token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 <button> ?x=1 storageState cookie token session .auth test-results playwright-report trace.zip video.webm network.har hard stop passed hard stop failed score-ready Phase 4 ready',
        ],
      },
      artifactPaths: [
        curated,
        curatedMultiNumeric,
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
      result.actionSummaryPath,
      result.stateSummaryPath,
      result.sourceSummaryPath,
      result.falseAffordanceSummaryPath,
      result.hbiAuthoritySummaryPath,
    ].map((file) => fs.readFileSync(file, 'utf-8'));

    expect(files[0]).toContain(curated);
    expect(files[0]).toContain(curatedMultiNumeric);
    expect(files[1]).toContain(curated);
    expect(files[1]).toContain(curatedMultiNumeric);
    expect(files[0]).not.toContain('[redacted-phone]/workflow-[redacted-phone]');

    const forbidden = [
      'qa.user@hedrickbrothers.com',
      '+1 (561) 555-9876',
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
    expect(files[0]).not.toContain('"captured"');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Workflow capture helpers preserve synthetic DOM boundaries', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.setContent(`
    <div data-pcc-horizontal-tabs>
      <button type="button" role="tab" data-pcc-tab-id="external-systems" data-pcc-tab-active="true" aria-selected="true">External Platforms</button>
      <button type="button" role="tab" data-pcc-tab-id="approvals">Approvals</button>
    </div>

    <div data-pcc-active-surface-panel="external-systems">
      <div data-pcc-bento-grid data-pcc-grid-safety="enabled" data-pcc-mode="desktop">
        <article data-pcc-card data-pcc-card-hierarchy="primary" data-pcc-card-tier="tier1" data-pcc-card-region="command" data-pcc-footprint="wide">
          <a href="https://app.procore.com/project/42?token=abc" data-pcc-launch="true">Launch Procore</a>
          <button data-pcc-external-system="true" aria-label="Approve sync now">Approve Sync</button>
        </article>
        <article data-pcc-card data-pcc-card-hierarchy="supporting" data-pcc-card-tier="tier3" data-pcc-card-region="reference" data-pcc-footprint="rail">
          reference card
        </article>
      </div>
      <div role="alert" data-pcc-state="read-only">Read-only preview deferred unavailable unauthorized stale missing configuration mock demo fixture owner due next action</div>
      <div data-pcc-source-system="SharePoint" data-pcc-source-of-record="true">Source: SharePoint fixture mock</div>
      <div data-pcc-hbi="true" data-pcc-command-search="true">HBI advisory. Do not approve/reject/commit.</div>
      <div>Owner: qa.user@hedrickbrothers.com Phone: +1 (561) 555-9876 Raw <span>HTML</span></div>
    </div>

    <div data-pcc-active-surface-panel="approvals">
      <button aria-label="Approve item">Approve</button>
      <button aria-label="Reject item">Reject</button>
      <button aria-label="Submit item">Submit</button>
      <button disabled aria-label="Approve disabled no reason">Approve disabled</button>
      <button disabled aria-label="Reject disabled with reason" aria-describedby="reason-1">Reject disabled</button>
      <div id="reason-1">Needs authorization</div>
      <div data-pcc-preview="true">Preview queue read-only</div>
    </div>
  `);

  const clickMarkers = await page.evaluate(() => {
    const clicks: string[] = [];
    document.addEventListener('click', (ev) => {
      const target = ev.target as HTMLElement;
      clicks.push(target.tagName.toLowerCase());
    });
    return clicks.length;
  });
  expect(clickMarkers).toBe(0);

  const fakePageObject = {
    goto: async () => {},
    waitForPccRoot: async () => {},
    assertSurfaceActive: async (surface: { id: string; label: string }) => ({
      surfaceId: surface.id,
      label: surface.label,
      passed: true,
      activePanelFound: true,
      gridCount: 1,
      cardCount: 2,
      tabActive: true,
    }),
  } as unknown as PccLivePageObject;

  const result = await capturePccWorkflow({
    page,
    pageObject: fakePageObject,
    pageUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx',
    surfaces: [
      {
        id: 'external-systems',
        label: 'External Platforms',
        expectedTabSelector: '',
        expectedActivePanelSelector: '',
        expectedEvRefs: ['EV-52', 'EV-55'],
      },
      {
        id: 'approvals',
        label: 'Approvals',
        expectedTabSelector: '',
        expectedActivePanelSelector: '',
        expectedEvRefs: ['EV-52', 'EV-55'],
      },
    ],
  });

  expect(result.surfaceCount).toBe(2);
  const external = result.surfaces.find((s) => s.surfaceId === 'external-systems');
  const approvals = result.surfaces.find((s) => s.surfaceId === 'approvals');
  expect(external).toBeDefined();
  expect(approvals).toBeDefined();

  const launchLink = external!.actions.find((a) => a.kind === 'launch');
  expect(launchLink).toBeDefined();
  expect(launchLink!.destinationHost).toBe('app.procore.com');
  expect(launchLink!.destinationPath).toBe('/project/42');

  const externalMutation = external!.actions.find((a) => a.mutationKeywordDetected);
  expect(externalMutation?.needsReview).toBe(true);

  expect(approvals!.approvalsQueue?.riskyExecutableActionCount).toBeGreaterThan(0);
  expect(approvals!.approvalsQueue?.disabledReasonCount).toBeGreaterThan(0);

  const disabledWithoutReason = approvals!.actions.filter(
    (a) => (a.disabled || a.ariaDisabled) && !a.hasDisabledReason,
  );
  const disabledWithReason = approvals!.actions.filter(
    (a) => (a.disabled || a.ariaDisabled) && a.hasDisabledReason,
  );
  expect(disabledWithoutReason.length).toBeGreaterThan(0);
  expect(disabledWithReason.length).toBeGreaterThan(0);

  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('qa.user@hedrickbrothers.com');
  expect(serialized).not.toContain('+1 (561) 555-9876');
  expect(serialized).not.toContain('<span>');
  expect(serialized).not.toContain('?token=abc');
});

test('Live workflow capture self-skips without live env', async ({ page }) => {
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  const pageObject = new PccLivePageObject(page);
  const runId = `workflow-${Date.now()}`;
  const outputDir = path.join(env.evidenceOutputDir, runId);

  const captured = await capturePccWorkflow({
    page,
    pageObject,
    pageUrl: env.pageUrl,
    surfaces: PCC_LIVE_SURFACES,
  });

  const written = await writePccWorkflowEvidence({
    outputDir,
    run: {
      runId,
      generatedAtIso: new Date().toISOString(),
      tenantSiteUrl: env.siteUrl,
      tenantPageUrl: env.pageUrl,
      expectedPackageVersion: env.expectedPackageVersion,
      selfSkipped: false,
      runState: 'completed',
      evRefs: PCC_WORKFLOW_EVIDENCE_IDS,
      surfaces: captured.surfaces,
      warnings: captured.surfaces.flatMap((s) => s.warnings),
    },
    artifactPaths: [
      path.join(outputDir, 'pcc-live-workflow-evidence.json'),
      path.join(outputDir, 'pcc-live-workflow-evidence.md'),
      path.join(outputDir, 'pcc-live-action-summary.json'),
      path.join(outputDir, 'pcc-live-state-summary.json'),
      path.join(outputDir, 'pcc-live-source-summary.json'),
      path.join(outputDir, 'pcc-live-false-affordance-summary.json'),
      path.join(outputDir, 'pcc-live-hbi-authority-summary.json'),
    ],
  });

  expect(captured.surfaces).toHaveLength(8);
  expect(fs.existsSync(written.evidenceJsonPath)).toBe(true);
  expect(fs.existsSync(written.evidenceMarkdownPath)).toBe(true);
  expect(fs.existsSync(written.actionSummaryPath)).toBe(true);
  expect(fs.existsSync(written.stateSummaryPath)).toBe(true);
  expect(fs.existsSync(written.sourceSummaryPath)).toBe(true);
  expect(fs.existsSync(written.falseAffordanceSummaryPath)).toBe(true);
  expect(fs.existsSync(written.hbiAuthoritySummaryPath)).toBe(true);

  const files = [
    written.evidenceJsonPath,
    written.evidenceMarkdownPath,
    written.actionSummaryPath,
    written.stateSummaryPath,
    written.sourceSummaryPath,
    written.falseAffordanceSummaryPath,
    written.hbiAuthoritySummaryPath,
  ].map((f) => fs.readFileSync(f, 'utf-8'));

  for (const text of files) {
    expect(text).not.toContain('<button');
    expect(text).not.toContain('"captured"');
    expect(text).not.toContain('hard stop passed');
    expect(text).not.toContain('hard stop failed');
  }
});
