import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { REQUIRED_PCC_EVIDENCE_IDS, type PccEvidenceId } from './pcc-evidence.types';
import { skipIfMissingPccLiveEnv } from './pcc-live.env';
import { PccLivePageObject } from './pcc-live.page-object';
import {
  capturePccAccessibility,
  collectAriaLabelObservations,
  collectTouchTargetObservations,
  summarizeAxeViolations,
} from './pcc-live.accessibility-capture';
import {
  PCC_ACCESSIBILITY_EVIDENCE_IDS,
  type PccAccessibilitySurfaceEvidence,
} from './pcc-live.accessibility.types';
import { writePccAccessibilityEvidence } from './pcc-live.accessibility-evidence-writer';
import { PCC_LIVE_SURFACES } from './pcc-live.surfaces';

test('Accessibility EV tuple is valid', () => {
  expect(PCC_ACCESSIBILITY_EVIDENCE_IDS).toHaveLength(11);

  const unique = new Set(PCC_ACCESSIBILITY_EVIDENCE_IDS);
  expect(unique.size).toBe(PCC_ACCESSIBILITY_EVIDENCE_IDS.length);

  for (const id of PCC_ACCESSIBILITY_EVIDENCE_IDS) {
    expect(REQUIRED_PCC_EVIDENCE_IDS.includes(id as PccEvidenceId)).toBe(true);
  }

  expect([...PCC_ACCESSIBILITY_EVIDENCE_IDS]).toEqual(
    Array.from({ length: 11 }, (_, i) => `EV-${72 + i}`),
  );
});

test('Accessibility writer preserves sanitized output policy', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-accessibility-writer-'));

  try {
    const curated =
      'docs/architecture/evidence/pcc-live/run-001/pcc-live-accessibility-evidence.json';

    const surfaces: PccAccessibilitySurfaceEvidence[] = [
      {
        surfaceId: 'project-home',
        label: 'Project Home',
        axeViolations: [
          {
            surfaceId: 'project-home',
            ruleId: 'color-contrast',
            impact: 'serious',
            count: 2,
            help: 'Fix contrast for qa.user@hedrickbrothers.com',
            helpUrl: 'https://example.test/help?token=abc',
            tags: ['wcag2aa'],
            sanitizedTargets: ['div[role="button"]:nth-of-type(1)'],
          },
        ],
        keyboardFocus: [
          {
            surfaceId: 'project-home',
            focusStep: 1,
            role: 'button',
            tagName: 'button',
            selector: 'button:nth-of-type(1)',
            hasAccessibleName: false,
            hasVisibleFocusIndicator: true,
            boundingWidth: 30,
            boundingHeight: 30,
          },
        ],
        ariaLabels: [
          {
            surfaceId: 'project-home',
            selector: 'button:nth-of-type(1)',
            tagName: 'button',
            role: 'button',
            ariaLabel: undefined,
            ariaLabelledBy: undefined,
            ariaDescribedBy: 'disabled-reason',
            accessibleNamePresent: false,
            disabled: true,
            disabledReasonPresent: true,
            needsReview: true,
          },
        ],
        contrast: [
          {
            surfaceId: 'project-home',
            ruleId: 'color-contrast',
            count: 2,
            needsReview: true,
            details:
              'warning with node.html <button> and failureSummary and any/all/none qa.user@hedrickbrothers.com token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456?x=1',
          },
        ],
        reducedMotion: {
          surfaceId: 'project-home',
          reducedMotionEmulated: true,
          animationRiskCount: 1,
          transitionRiskCount: 1,
          needsReview: true,
        },
        hoverOnly: {
          surfaceId: 'project-home',
          hoverOnlyRiskCount: 1,
          selectors: ['[class*="hover"]'],
          needsReview: true,
        },
        dialogFocus: {
          surfaceId: 'project-home',
          status: 'not-observed',
          dialogCount: 0,
          modalCount: 0,
          notes: ['none'],
        },
        touchTargets: [
          {
            surfaceId: 'project-home',
            selector: 'button:nth-of-type(1)',
            role: 'button',
            tagName: 'button',
            width: 30,
            height: 30,
            belowRecommendedSize: true,
          },
        ],
        warnings: [
          'raw warning qa.user@hedrickbrothers.com token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 <button> node.html failureSummary any/all/none storageState cookie session ?x=1',
        ],
      },
    ];

    const result = await writePccAccessibilityEvidence({
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
        evRefs: PCC_ACCESSIBILITY_EVIDENCE_IDS,
        surfaces,
        warnings: [
          'global warning qa.user@hedrickbrothers.com token ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 <button> node.html failureSummary any/all/none storageState cookie session ?x=1',
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

    const evidenceJson = fs.readFileSync(result.evidenceJsonPath, 'utf-8');
    const evidenceMd = fs.readFileSync(result.evidenceMarkdownPath, 'utf-8');
    const axeSummary = fs.readFileSync(result.axeSummaryPath, 'utf-8');
    const keyboardSummary = fs.readFileSync(result.keyboardSummaryPath, 'utf-8');
    const ariaSummary = fs.readFileSync(result.ariaSummaryPath, 'utf-8');
    const contrastSummary = fs.readFileSync(result.contrastSummaryPath, 'utf-8');

    const allOutputs = [
      evidenceJson,
      evidenceMd,
      axeSummary,
      keyboardSummary,
      ariaSummary,
      contrastSummary,
    ];

    expect(evidenceJson).toContain(curated);
    expect(evidenceMd).toContain(curated);
    expect(evidenceJson).toContain('[redacted-email]');

    const forbidden = [
      'qa.user@hedrickbrothers.com',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      '?x=1',
      '<button',
      'node.html',
      'failureSummary',
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
      for (const text of allOutputs) {
        expect(text).not.toContain(bad);
      }
    }

    expect(evidenceMd).toContain('operator-review pending');
    expect(evidenceMd).toContain('not a final scorecard result');
    expect(evidenceJson).not.toContain('"captured"');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Accessibility capture helpers preserve synthetic DOM boundaries', async ({ page }) => {
  await page.setContent(`
    <div data-pcc-active-surface-panel="project-home">
      <button id="unlabeled"></button>
      <button aria-label="Open panel"></button>
      <button disabled></button>
      <button disabled aria-describedby="why-disabled"></button>
      <div id="why-disabled">Reason text here</div>
      <a href="#">Link</a>
      <button style="width:30px;height:30px;">Small</button>
      <div role="dialog" aria-modal="true"><button aria-label="Close">X</button></div>
    </div>
  `);

  const aria = await collectAriaLabelObservations(
    page,
    'project-home',
    '[data-pcc-active-surface-panel="project-home"]',
    30,
  );
  expect(aria.some((x) => x.accessibleNamePresent === false)).toBe(true);
  expect(aria.some((x) => x.accessibleNamePresent === true)).toBe(true);
  expect(aria.some((x) => x.disabled && !x.disabledReasonPresent)).toBe(true);
  expect(aria.some((x) => x.disabled && x.disabledReasonPresent)).toBe(true);

  const touches = await collectTouchTargetObservations(
    page,
    'project-home',
    '[data-pcc-active-surface-panel="project-home"]',
    40,
  );
  expect(touches.some((x) => x.belowRecommendedSize)).toBe(true);

  const serialized = JSON.stringify({ aria, touches });
  expect(serialized).not.toContain('Reason text here');
  expect(serialized).not.toContain('Small');
});

test('Axe summary strips raw DOM HTML', () => {
  const summary = summarizeAxeViolations('project-home', [
    {
      id: 'color-contrast',
      impact: 'serious',
      help: 'Help text',
      helpUrl: 'https://example.test/help?x=1',
      tags: ['wcag2aa'],
      nodes: [
        {
          target: ['div > button:nth-child(1)'],
          html: '<button>Raw Html</button>',
          failureSummary: 'Some raw failureSummary',
          any: [{ message: '<div>raw any html</div>' }],
          all: [{ message: '<div>raw all html</div>' }],
          none: [{ message: '<div>raw none html</div>' }],
        },
      ],
    },
  ]);

  expect(summary).toHaveLength(1);
  const text = JSON.stringify(summary);
  expect(text).toContain('color-contrast');
  expect(text).not.toContain('<button');
  expect(text).not.toContain('node.html');
  expect(text).not.toContain('failureSummary');
  expect(text).not.toContain('raw any html');
  expect(text).not.toContain('raw all html');
  expect(text).not.toContain('raw none html');
});

test('Live accessibility capture self-skips without live env', async ({ page }) => {
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  const pageObject = new PccLivePageObject(page);
  const runId = `accessibility-${Date.now()}`;
  const outputDir = path.join(env.evidenceOutputDir, runId);

  const captured = await capturePccAccessibility({
    page,
    pageObject,
    pageUrl: env.pageUrl,
    surfaces: PCC_LIVE_SURFACES,
    axeEnabled: true,
  });

  const written = await writePccAccessibilityEvidence({
    outputDir,
    run: {
      runId,
      generatedAtIso: new Date().toISOString(),
      tenantSiteUrl: env.siteUrl,
      tenantPageUrl: env.pageUrl,
      expectedPackageVersion: env.expectedPackageVersion,
      selfSkipped: false,
      runState: 'completed',
      evRefs: PCC_ACCESSIBILITY_EVIDENCE_IDS,
      surfaces: captured.surfaces,
      warnings: captured.surfaces.flatMap((s) => s.warnings),
    },
    artifactPaths: [
      path.join(outputDir, 'pcc-live-accessibility-evidence.json'),
      path.join(outputDir, 'pcc-live-accessibility-evidence.md'),
      path.join(outputDir, 'pcc-live-axe-summary.json'),
      path.join(outputDir, 'pcc-live-keyboard-focus-summary.json'),
      path.join(outputDir, 'pcc-live-aria-label-summary.json'),
      path.join(outputDir, 'pcc-live-contrast-summary.json'),
    ],
  });

  expect(captured.surfaces).toHaveLength(8);
  expect(fs.existsSync(written.evidenceJsonPath)).toBe(true);
  expect(fs.existsSync(written.evidenceMarkdownPath)).toBe(true);
  expect(fs.existsSync(written.axeSummaryPath)).toBe(true);
  expect(fs.existsSync(written.keyboardSummaryPath)).toBe(true);
  expect(fs.existsSync(written.ariaSummaryPath)).toBe(true);
  expect(fs.existsSync(written.contrastSummaryPath)).toBe(true);

  const all = [
    fs.readFileSync(written.evidenceJsonPath, 'utf-8'),
    fs.readFileSync(written.evidenceMarkdownPath, 'utf-8'),
    fs.readFileSync(written.axeSummaryPath, 'utf-8'),
    fs.readFileSync(written.keyboardSummaryPath, 'utf-8'),
    fs.readFileSync(written.ariaSummaryPath, 'utf-8'),
    fs.readFileSync(written.contrastSummaryPath, 'utf-8'),
  ];

  for (const text of all) {
    expect(text).not.toContain('<button');
    expect(text).not.toContain('node.html');
    expect(text).not.toContain('"captured"');
  }
});
