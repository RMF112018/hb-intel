import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { REQUIRED_PCC_EVIDENCE_IDS, type PccEvidenceId } from './pcc-evidence.types';
import { skipIfMissingPccLiveEnv } from './pcc-live.env';
import { PccLivePageObject } from './pcc-live.page-object';
import { capturePccContent } from './pcc-live.content-capture';
import { writePccContentReview } from './pcc-live.content-review-writer';
import {
  PCC_CONTENT_LANGUAGE_EVIDENCE_IDS,
  type PccContentReviewFinding,
  type PccContentSurfaceSummary,
  type PccVisibleCopyRecord,
} from './pcc-live.content.types';
import { PCC_LIVE_SURFACES, type PccLiveSurfaceDefinition } from './pcc-live.surfaces';

test('Content-language EV tuple is valid', () => {
  expect(PCC_CONTENT_LANGUAGE_EVIDENCE_IDS).toHaveLength(24);
  const unique = new Set(PCC_CONTENT_LANGUAGE_EVIDENCE_IDS);
  expect(unique.size).toBe(PCC_CONTENT_LANGUAGE_EVIDENCE_IDS.length);
  for (const id of PCC_CONTENT_LANGUAGE_EVIDENCE_IDS) {
    expect(REQUIRED_PCC_EVIDENCE_IDS.includes(id as PccEvidenceId)).toBe(true);
  }
  expect([...PCC_CONTENT_LANGUAGE_EVIDENCE_IDS]).toEqual(
    Array.from({ length: 24 }, (_, i) => `EV-${83 + i}`),
  );
});

test('Content writer preserves sanitized output policy', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-content-writer-'));
  try {
    const records: PccVisibleCopyRecord[] = [
      {
        surfaceId: 'project-home',
        kind: 'hbi-copy',
        selector: 'button[role="button"]:nth-of-type(1)',
        textSnippet:
          'HBI recommend review qa.user@hedrickbrothers.com +1 (561) 555-1212 token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 <button>?x=1 storageState',
        textHash: 'tx-123',
        charCount: 120,
        wordCount: 10,
        visible: true,
        signals: {
          constructionVocabulary: false,
          ownershipLanguage: false,
          nextActionLanguage: true,
          sourceBoundaryLanguage: false,
          sourceConfidenceLanguage: false,
          freshnessLanguage: false,
          hbiMention: true,
          hbiAdvisoryLanguage: true,
          hbiMutationAuthorityRisk: false,
          readOnlyPreviewDeferredLanguage: false,
          disabledReasonLanguage: false,
          mockFixtureDemoLanguage: false,
          crossModuleLanguage: false,
        },
        needsReview: false,
      },
    ];

    const findings: PccContentReviewFinding[] = [
      {
        category: 'hbi-authority-language',
        disposition: 'needs-review',
        evidenceIds: ['EV-100', 'EV-101'],
        title: 'HBI authority risk hard stop passed score-ready',
        rationale: 'raw <button> with token and cookie/session',
        supportingCopyHashes: ['tx-123'],
        reviewerPrompt: 'Review boundary language',
      },
    ];

    const surfaces: PccContentSurfaceSummary[] = [
      {
        surfaceId: 'project-home',
        label: 'Project Home',
        visibleCopyCount: 1,
        headingCount: 0,
        actionLabelCount: 0,
        disabledReasonCount: 0,
        stateCopyCount: 0,
        sourceLabelCount: 0,
        hbiCopyCount: 1,
        ownerResponsibilityCount: 0,
        mockFixtureLabelCount: 0,
        needsReviewCount: 1,
      },
    ];

    const curated = 'docs/architecture/evidence/pcc-live/run-001/pcc-live-content-evidence.json';
    const out = await writePccContentReview({
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
        evRefs: PCC_CONTENT_LANGUAGE_EVIDENCE_IDS,
        surfaces,
        copyRecords: records,
        findings,
        warnings: [
          'warn qa.user@hedrickbrothers.com +1 (561) 555-1212 ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 <button> ?x=1 storageState cookie token session .auth test-results playwright-report trace.zip video.webm network.har hard stop passed hard stop failed score-ready Phase 4 ready',
        ],
      },
      artifactPaths: [
        curated,
        '/private/tmp/secrets/unauthorized.storageState.json',
        'test-results/raw-output.json',
        'playwright-report/index.html',
      ],
    });

    const files = [
      out.evidenceJsonPath,
      out.evidenceMarkdownPath,
      out.extractedVisibleCopyPath,
      out.findingsPath,
      out.constructionReviewPath,
      out.stateCopyReviewPath,
      out.sourceOfRecordReviewPath,
      out.hbiAuthorityReviewPath,
      out.disabledReasonReviewPath,
    ].map((f) => fs.readFileSync(f, 'utf-8'));

    expect(files[0]).toContain(curated);
    const forbidden = [
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
    expect(files[0]).not.toContain('"captured"');
    expect(files[0]).toContain('not a final scorecard result');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Synthetic visible-copy extraction covers required copy kinds', async ({ page }) => {
  await page.setContent(`
    <div data-pcc-horizontal-tabs>
      <button type="button" role="tab" data-pcc-tab-id="project-home" data-pcc-tab-active="true" aria-selected="true">Project Home</button>
    </div>
    <div data-pcc-active-surface-panel="project-home">
      <h2>Readiness Heading</h2>
      <div data-pcc-card-heading>Card Alpha</div>
      <button aria-label="Primary Action">Do Work</button>
      <button disabled aria-describedby="reason-1">Disabled Action</button>
      <div id="reason-1">Blocked until owner assigns next action</div>
      <button disabled>Disabled No Reason</button>
      <div role="alert" data-pcc-state="read-only">read-only preview deferred unavailable blocked degraded stale missing configuration</div>
      <div data-pcc-source-of-record="SharePoint">source of record SharePoint confidence medium stale</div>
      <div data-pcc-hbi="true">HBI suggest review before approve/commit</div>
      <div data-pcc-mock="true">Owner: Superintendent. Next action due today. Mock fixture demo only. See approvals and documents.</div>
      <a href="#approvals">Open approvals and documents flow</a>
      <div style="display:none">HIDDEN_SENTINEL_DO_NOT_CAPTURE</div>
      <div hidden><span>HIDDEN_PARENT_SENTINEL_DO_NOT_CAPTURE</span></div>
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

  const result = await capturePccContent({
    page,
    pageObject: fakePageObject,
    pageUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx',
    surfaces: [{ ...PCC_LIVE_SURFACES[0] }],
  });

  const kinds = new Set(result.copyRecords.map((r) => r.kind));
  expect(kinds.has('heading')).toBe(true);
  expect(kinds.has('card-title')).toBe(true);
  expect(kinds.has('action-label')).toBe(true);
  expect(kinds.has('disabled-reason')).toBe(true);
  expect(kinds.has('state-copy')).toBe(true);
  expect(kinds.has('source-label')).toBe(true);
  expect(kinds.has('hbi-copy')).toBe(true);
  expect(kinds.has('owner-responsibility')).toBe(true);
  expect(kinds.has('mock-fixture-label')).toBe(true);
  expect(kinds.has('cross-module-reference')).toBe(true);

  expect(result.findings.some((f) => f.category === 'disabled-reason-copy')).toBe(true);
  expect(result.findings.some((f) => f.category === 'hbi-authority-language')).toBe(true);
  expect(result.findings.some((f) => f.category === 'source-of-record-language')).toBe(true);

  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('<div');
  expect(serialized).not.toContain('?');
  expect(JSON.stringify(result.copyRecords)).not.toContain('HIDDEN_SENTINEL_DO_NOT_CAPTURE');
  expect(JSON.stringify(result.copyRecords)).not.toContain('HIDDEN_PARENT_SENTINEL_DO_NOT_CAPTURE');
  expect(JSON.stringify(result.findings)).not.toContain('HIDDEN_SENTINEL_DO_NOT_CAPTURE');
  expect(JSON.stringify(result.findings)).not.toContain('HIDDEN_PARENT_SENTINEL_DO_NOT_CAPTURE');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-content-hidden-sentinel-'));
  try {
    const out = await writePccContentReview({
      outputDir: tmpDir,
      run: {
        runId: 'hidden-sentinel-test',
        generatedAtIso: new Date().toISOString(),
        tenantSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject',
        tenantPageUrl:
          'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx',
        expectedPackageVersion: '1.0.0.16',
        selfSkipped: false,
        runState: 'writer-test-only',
        evRefs: PCC_CONTENT_LANGUAGE_EVIDENCE_IDS,
        surfaces: result.surfaces,
        copyRecords: result.copyRecords,
        findings: result.findings,
      },
    });
    const generatedFiles = [
      out.evidenceJsonPath,
      out.evidenceMarkdownPath,
      out.extractedVisibleCopyPath,
      out.findingsPath,
      out.constructionReviewPath,
      out.stateCopyReviewPath,
      out.sourceOfRecordReviewPath,
      out.hbiAuthorityReviewPath,
      out.disabledReasonReviewPath,
    ].map((file) => fs.readFileSync(file, 'utf-8'));
    for (const text of generatedFiles) {
      expect(text).not.toContain('HIDDEN_SENTINEL_DO_NOT_CAPTURE');
      expect(text).not.toContain('HIDDEN_PARENT_SENTINEL_DO_NOT_CAPTURE');
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Synthetic review templates include required sections', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-content-template-'));
  try {
    const out = await writePccContentReview({
      outputDir: tmpDir,
      run: {
        runId: 'template-test',
        generatedAtIso: new Date().toISOString(),
        tenantSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject',
        tenantPageUrl:
          'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx',
        expectedPackageVersion: '1.0.0.16',
        selfSkipped: false,
        runState: 'writer-test-only',
        evRefs: PCC_CONTENT_LANGUAGE_EVIDENCE_IDS,
        surfaces: [],
        copyRecords: [],
        findings: [],
      },
    });

    const reviewFiles = [
      out.constructionReviewPath,
      out.stateCopyReviewPath,
      out.sourceOfRecordReviewPath,
      out.hbiAuthorityReviewPath,
      out.disabledReasonReviewPath,
    ].map((f) => fs.readFileSync(f, 'utf-8'));

    for (const text of reviewFiles) {
      expect(text).toContain('## Purpose');
      expect(text).toContain('## Scope');
      expect(text).toContain('## Related Scorecard Pillars');
      expect(text).toContain('## Related Hard Stops');
      expect(text).toContain('## Related EV IDs');
      expect(text).toContain('## Reviewer Checklist');
      expect(text).toContain('## Findings Table');
      expect(text).toContain('## Open Reviewer Notes');
      expect(text).toContain('review support only');
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Content capture does not click or mutate', async ({ page }) => {
  await page.setContent(`
    <div data-pcc-horizontal-tabs>
      <button type="button" role="tab" data-pcc-tab-id="project-home" data-pcc-tab-active="true" aria-selected="true">Project Home</button>
    </div>
    <div data-pcc-active-surface-panel="project-home">
      <button id="danger">Do Not Click</button>
      <a id="ext" href="https://example.com">External</a>
      <div data-pcc-hbi="true">HBI advisory only</div>
    </div>
    <script>
      window.__clickCount = 0;
      document.addEventListener('click', () => window.__clickCount += 1);
    </script>
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

  await capturePccContent({
    page,
    pageObject: fakePageObject,
    pageUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx',
    surfaces: [{ ...PCC_LIVE_SURFACES[0] }],
  });

  const clicks = await page.evaluate(
    () => (window as unknown as { __clickCount: number }).__clickCount,
  );
  expect(clicks).toBe(0);
  expect(page.url()).not.toContain('example.com');
});

test('Live content capture self-skips without live env', async ({ page }) => {
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  const pageObject = new PccLivePageObject(page);
  const runId = `content-${Date.now()}`;
  const outputDir = path.join(env.evidenceOutputDir, runId);

  const captured = await capturePccContent({
    page,
    pageObject,
    pageUrl: env.pageUrl,
    surfaces: PCC_LIVE_SURFACES,
  });

  const out = await writePccContentReview({
    outputDir,
    run: {
      runId,
      generatedAtIso: new Date().toISOString(),
      tenantSiteUrl: env.siteUrl,
      tenantPageUrl: env.pageUrl,
      expectedPackageVersion: env.expectedPackageVersion,
      selfSkipped: false,
      runState: 'completed',
      evRefs: captured.evRefs,
      surfaces: captured.surfaces,
      copyRecords: captured.copyRecords,
      findings: captured.findings,
      warnings: captured.warnings,
    },
  });

  const files = [
    out.evidenceJsonPath,
    out.evidenceMarkdownPath,
    out.extractedVisibleCopyPath,
    out.findingsPath,
    out.constructionReviewPath,
    out.stateCopyReviewPath,
    out.sourceOfRecordReviewPath,
    out.hbiAuthorityReviewPath,
    out.disabledReasonReviewPath,
  ];

  for (const f of files) {
    expect(fs.existsSync(f)).toBe(true);
    const text = fs.readFileSync(f, 'utf-8');
    expect(text).not.toContain('<button');
    expect(text).not.toContain('"captured"');
    expect(text).not.toContain('hard stop passed');
    expect(text).not.toContain('hard stop failed');
    expect(text.toLowerCase()).not.toContain('storagestate');
  }
});
