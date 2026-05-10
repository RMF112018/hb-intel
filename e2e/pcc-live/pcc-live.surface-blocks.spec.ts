import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { REQUIRED_PCC_EVIDENCE_IDS, type PccEvidenceId } from './pcc-evidence.types';
import { PCC_LIVE_SURFACES } from './pcc-live.surfaces';
import {
  assemblePccSurfaceEvidenceBlocks,
  PCC_SURFACE_BLOCKS_DISCLAIMER,
} from './pcc-live.surface-blocks-assembler';
import { writePccSurfaceEvidenceBlocks } from './pcc-live.surface-blocks-writer';
import {
  PCC_SURFACE_BLOCK_EVIDENCE_IDS,
  PCC_SURFACE_BLOCK_MAPPING,
} from './pcc-live.surface-blocks.types';

// Phase 05 wave-b10 Prompt 08 — required block files migrated to the
// eight Phase 05 primary tabs (see PCC_SURFACE_BLOCK_MAPPING). Block
// JSON/MD filenames mirror PccSurfaceEvidenceBlockId.
const REQUIRED_FILES = [
  'pcc-live-surface-blocks-evidence.json',
  'pcc-live-surface-blocks-evidence.md',
  'surface-block-index.json',
  'surface-block-index.md',
  'blocks/project-home-surface-block.json',
  'blocks/project-home-surface-block.md',
  'blocks/core-tools-surface-block.json',
  'blocks/core-tools-surface-block.md',
  'blocks/documents-surface-block.json',
  'blocks/documents-surface-block.md',
  'blocks/estimating-preconstruction-surface-block.json',
  'blocks/estimating-preconstruction-surface-block.md',
  'blocks/startup-closeout-surface-block.json',
  'blocks/startup-closeout-surface-block.md',
  'blocks/project-controls-surface-block.json',
  'blocks/project-controls-surface-block.md',
  'blocks/cost-time-surface-block.json',
  'blocks/cost-time-surface-block.md',
  'blocks/systems-administration-surface-block.json',
  'blocks/systems-administration-surface-block.md',
  'blocks/shared-primitive-system-block.json',
  'blocks/shared-primitive-system-block.md',
  'blocks/cross-surface-evidence-index-block.json',
  'blocks/cross-surface-evidence-index-block.md',
  'primitive-evidence-summary.md',
  'cross-surface-gap-register.md',
] as const;

const FORBIDDEN = [
  'qa.user@hedrickbrothers.com',
  '+1 (561) 555-1212',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
  '?x=1',
  '<button',
  'storageState',
  'storage-state',
  'cookie',
  'token',
  'auth',
  'session',
  'secret',
  'test-results',
  'playwright-report',
  'trace.zip',
  'video.webm',
  'network.har',
  'hard stop passed',
  'hard stop failed',
  'score-ready',
  'Phase 4 ready',
  '56/56 achieved',
  '100/100',
  'mold breaker achieved',
] as const;

const OUT_OF_SCOPE_EVS = ['EV-37', 'EV-72', 'EV-83', 'EV-100', 'EV-106'] as const;

function assertNoForbidden(text: string): void {
  const normalized = text
    .replace(/No hard stop passed or failed\./gi, '')
    .replace(/does not mark any hard stop passed or failed/gi, '')
    .replace(/No EV captured\./gi, '')
    .replace(/does not mark any EV captured/gi, '');

  for (const token of FORBIDDEN) {
    expect(normalized).not.toContain(token);
  }

  const evMatches = normalized.match(/\bEV-\d+\b/g) ?? [];
  for (const ev of evMatches) {
    expect(
      PCC_SURFACE_BLOCK_EVIDENCE_IDS.includes(
        ev as (typeof PCC_SURFACE_BLOCK_EVIDENCE_IDS)[number],
      ),
    ).toBe(true);
  }

  for (const out of OUT_OF_SCOPE_EVS) {
    expect(normalized).not.toContain(out);
  }
}

test('EV tuple and fixed mapping validity', () => {
  expect(PCC_SURFACE_BLOCK_EVIDENCE_IDS).toHaveLength(10);
  expect([...PCC_SURFACE_BLOCK_EVIDENCE_IDS]).toEqual(
    Array.from({ length: 10 }, (_, idx) => `EV-${125 + idx}`),
  );

  const unique = new Set(PCC_SURFACE_BLOCK_EVIDENCE_IDS);
  expect(unique.size).toBe(PCC_SURFACE_BLOCK_EVIDENCE_IDS.length);

  for (const ev of PCC_SURFACE_BLOCK_EVIDENCE_IDS) {
    expect(REQUIRED_PCC_EVIDENCE_IDS.includes(ev as PccEvidenceId)).toBe(true);
  }

  expect(PCC_SURFACE_BLOCK_MAPPING).toHaveLength(10);
  // Phase 05 wave-b10 Prompt 08 — surface block IDs migrated to the
  // eight Phase 05 primary tabs. EV-125..EV-132 anchor identity is
  // preserved; only per-surface block id strings + surface IDs change.
  expect(PCC_SURFACE_BLOCK_MAPPING).toEqual([
    {
      evId: 'EV-125',
      blockId: 'project-home-surface-block',
      blockType: 'surface',
      surfaceId: 'project-home',
    },
    {
      evId: 'EV-126',
      blockId: 'core-tools-surface-block',
      blockType: 'surface',
      surfaceId: 'core-tools',
    },
    {
      evId: 'EV-127',
      blockId: 'documents-surface-block',
      blockType: 'surface',
      surfaceId: 'documents',
    },
    {
      evId: 'EV-128',
      blockId: 'estimating-preconstruction-surface-block',
      blockType: 'surface',
      surfaceId: 'estimating-preconstruction',
    },
    {
      evId: 'EV-129',
      blockId: 'startup-closeout-surface-block',
      blockType: 'surface',
      surfaceId: 'startup-closeout',
    },
    {
      evId: 'EV-130',
      blockId: 'project-controls-surface-block',
      blockType: 'surface',
      surfaceId: 'project-controls',
    },
    {
      evId: 'EV-131',
      blockId: 'cost-time-surface-block',
      blockType: 'surface',
      surfaceId: 'cost-time',
    },
    {
      evId: 'EV-132',
      blockId: 'systems-administration-surface-block',
      blockType: 'surface',
      surfaceId: 'systems-administration',
    },
    {
      evId: 'EV-133',
      blockId: 'shared-primitive-system-block',
      blockType: 'primitive-system',
      primitiveScope: 'shared-primitive-system',
    },
    {
      evId: 'EV-134',
      blockId: 'cross-surface-evidence-index-block',
      blockType: 'cross-surface-index',
      primitiveScope: 'cross-surface-evidence-index',
    },
  ]);

  const surfaceMappings = PCC_SURFACE_BLOCK_MAPPING.filter((m) => m.blockType === 'surface');
  expect(surfaceMappings).toHaveLength(8);
  expect(new Set(surfaceMappings.map((m) => m.surfaceId)).size).toBe(8);
  for (const s of PCC_LIVE_SURFACES) {
    expect(surfaceMappings.some((m) => m.surfaceId === s.id)).toBe(true);
  }
});

test('Synthetic full block assembly', () => {
  const run = assemblePccSurfaceEvidenceBlocks({
    runId: 'surface-block-synthetic',
    generatedAtIso: new Date().toISOString(),
    tenantSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject',
    tenantPageUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/pcc.aspx',
    expectedPackageVersion: '1.0.0.16',
    surfaces: PCC_LIVE_SURFACES,
    screenshotRun: { summary: { totalSurfaces: 8 } },
    breakpointRun: { summary: { totalViewports: 7, totalCards: 44, totalOverflowRiskCount: 2 } },
    accessibilityRun: {
      summary: {
        totalAxeViolationSummaries: 4,
        totalKeyboardFocusStops: 11,
        totalAriaNeedsReview: 2,
        totalContrastNeedsReview: 1,
      },
    },
    workflowRun: {
      summary: { totalDisabledWithoutReason: 1, totalFalseAffordanceNeedsReview: 2 },
      surfaces: [
        {
          surfaceId: 'project-home',
          actions: [{}, {}],
          states: [{}, {}],
          sources: [{}],
          priority: { primaryActionCount: 2, referenceCardCount: 1 },
          warnings: ['safe warning'],
        },
      ],
    },
    conditionalRun: { summary: { stateObservationCount: 2 } },
    contentRun: {
      summary: { findingCount: 5, needsReviewCount: 2 },
      surfaces: [{ surfaceId: 'project-home', visibleCopyCount: 8 }],
    },
    doctrineSourceRun: {
      summary: {
        doctrineCategoryCount: 14,
        moldBreakerThemeCount: 8,
        expertReviewRequiredCount: 21,
      },
    },
    surfaceSmokeRun: { warnings: ['safe smoke warning'] },
    runtimeErrorSummary: { warningCount: 1, errorCount: 0 },
    artifactPaths: [
      'evidence/screenshot/project-home-summary.json',
      'evidence/workflow/project-home-workflow.md',
      'evidence/accessibility/project-home-accessibility.json',
      'evidence/content/project-home-content.md',
      'evidence/doctrine/doctrine-source.md',
    ],
  });

  expect(run.blocks).toHaveLength(10);
  expect(run.evRefs).toEqual(PCC_SURFACE_BLOCK_EVIDENCE_IDS);
  expect(run.disclaimer).toBe(PCC_SURFACE_BLOCKS_DISCLAIMER);

  for (const block of run.blocks) {
    expect(block.disposition).toBeDefined();
    expect(block.screenshotSummary).toBeDefined();
    expect(block.sourceStateSummary).toBeDefined();
    expect(block.cardHierarchySummary).toBeDefined();
    expect(block.workflowSummary).toBeDefined();
    expect(block.accessibilitySummary).toBeDefined();
    expect(block.breakpointSummary).toBeDefined();
    expect(block.runtimeSummary).toBeDefined();
    expect(block.contentSummary).toBeDefined();
    expect(block.doctrineSummary).toBeDefined();
    expect(block.pendingGaps.length <= 8).toBe(true);
    expect(block.expertReviewQuestions.length).toBeGreaterThan(0);
    expect(block.expertReviewQuestions.length <= 8).toBe(true);
  }

  const projectHome = run.blocks.find((b) => b.evId === 'EV-125');
  expect(projectHome?.surfaceId).toBe('project-home');
  expect(projectHome?.screenshotSummary.referenceCount).toBe(1);
  expect(projectHome?.screenshotSummary.hasSurfaceScreenshot).toBe(true);

  expect(projectHome?.breakpointSummary.viewportCount).toBe(7);
  expect(projectHome?.cardHierarchySummary.cardCount).toBe(44);
  expect(projectHome?.breakpointSummary.overflowIssueCount).toBe(2);

  expect(projectHome?.accessibilitySummary.axeViolationCount).toBe(4);
  expect(projectHome?.accessibilitySummary.keyboardFocusStopCount).toBe(11);
  expect(projectHome?.accessibilitySummary.ariaNeedsReviewCount).toBe(2);
  expect(projectHome?.accessibilitySummary.contrastNeedsReviewCount).toBe(1);

  expect(projectHome?.workflowSummary.actionCount).toBe(2);
  expect(projectHome?.sourceStateSummary.stateMarkerCount).toBe(2);
  expect(projectHome?.sourceStateSummary.sourceMarkerCount).toBe(1);
  expect(projectHome?.sourceStateSummary.needsReviewCount).toBe(1);
  expect(projectHome?.workflowSummary.disabledWithoutReasonCount).toBe(1);
  expect(projectHome?.workflowSummary.falseAffordanceNeedsReviewCount).toBe(2);

  expect(projectHome?.contentSummary.copySignalCount).toBe(8);
  expect(projectHome?.contentSummary.findingCount).toBe(5);
  expect(projectHome?.contentSummary.needsReviewCount).toBe(2);

  expect(projectHome?.doctrineSummary.doctrineSignalCount).toBe(14);
  expect(projectHome?.doctrineSummary.moldBreakerSignalCount).toBe(8);
  expect(projectHome?.doctrineSummary.expertReviewRequiredCount).toBe(21);
});

test('Missing source handling', () => {
  const run = assemblePccSurfaceEvidenceBlocks({ surfaces: PCC_LIVE_SURFACES });
  expect(run.blocks).toHaveLength(10);

  for (const block of run.blocks) {
    expect(['operator-review-pending', 'source-missing', 'expert-review-required']).toContain(
      block.disposition,
    );
    expect(block.pendingGaps.length).toBeGreaterThan(0);
  }
});

test('Writer artifact completeness', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-surface-blocks-writer-'));
  try {
    const run = assemblePccSurfaceEvidenceBlocks({
      runId: 'writer-test',
      surfaces: PCC_LIVE_SURFACES,
      screenshotRun: { summary: { totalSurfaces: 8 } },
    });
    const out = await writePccSurfaceEvidenceBlocks({ outputDir: tmpDir, run });

    expect(out.blockJsonPaths).toHaveLength(10);
    expect(out.blockMarkdownPaths).toHaveLength(10);

    for (const rel of REQUIRED_FILES) {
      expect(fs.existsSync(path.join(tmpDir, rel))).toBe(true);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Sanitization and EV scope lockdown', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-surface-blocks-sanitize-'));
  try {
    const run = assemblePccSurfaceEvidenceBlocks({
      runId: 'unsafe-qa.user@hedrickbrothers.com',
      tenantSiteUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject?x=1&token=abc',
      tenantPageUrl: '<button> EV-37 EV-72 EV-83 EV-100 EV-106',
      runtimeErrorSummary: {
        warningCount: 1,
        errorCount: 1,
        raw: 'qa.user@hedrickbrothers.com +1 (561) 555-1212 ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 storageState cookie token auth session secret test-results playwright-report trace.zip video.webm network.har hard stop passed hard stop failed score-ready Phase 4 ready 56/56 achieved 100/100 mold breaker achieved',
      },
      artifactPaths: [
        'test-results/raw.json',
        'playwright-report/index.html',
        'safe/evidence/EV-125-summary.md',
      ],
    });

    const out = await writePccSurfaceEvidenceBlocks({ outputDir: tmpDir, run });
    const files = REQUIRED_FILES.map((rel) => ({
      rel,
      text: fs.readFileSync(path.join(tmpDir, rel), 'utf-8'),
    }));

    for (const file of files) {
      const { text } = file;
      assertNoForbidden(text);
      if (file.rel.endsWith('.md')) {
        for (const statement of [
          'Final judgment: expert-review-required.',
          'No score calculated.',
          'No EV captured.',
          'No hard stop passed or failed.',
        ]) {
          expect(text).toContain(statement);
        }
      }
    }

    const evidenceJson = fs.readFileSync(out.evidenceJsonPath, 'utf-8');
    const evMatches = evidenceJson.match(/\bEV-\d+\b/g) ?? [];
    for (const ev of evMatches) {
      expect(
        PCC_SURFACE_BLOCK_EVIDENCE_IDS.includes(
          ev as (typeof PCC_SURFACE_BLOCK_EVIDENCE_IDS)[number],
        ),
      ).toBe(true);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Surface coverage and primitive/cross-surface completeness', () => {
  const run = assemblePccSurfaceEvidenceBlocks({ surfaces: PCC_LIVE_SURFACES });
  const surfaceBlocks = run.blocks.filter((b) => b.blockType === 'surface');
  expect(surfaceBlocks).toHaveLength(8);

  for (const surface of PCC_LIVE_SURFACES) {
    expect(surfaceBlocks.filter((b) => b.surfaceId === surface.id)).toHaveLength(1);
  }

  expect(run.blocks.some((b) => b.blockId === 'shared-primitive-system-block')).toBe(true);
  expect(run.blocks.some((b) => b.blockId === 'cross-surface-evidence-index-block')).toBe(true);
  expect(new Set(run.blocks.map((b) => b.blockId)).size).toBe(10);
});
