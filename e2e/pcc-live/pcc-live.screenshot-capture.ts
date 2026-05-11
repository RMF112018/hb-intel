import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Page } from '@playwright/test';
import type { PccLivePageObject } from './pcc-live.page-object';
import type { PccLiveSurfaceDefinition } from './pcc-live.surfaces';
import type {
  PccDomCardSummary,
  PccScreenshotArtifact,
  PccScrollRootKind,
  PccSurfaceScreenshotEvidence,
} from './pcc-live.screenshot.types';

const CARD_SELECTOR = '[data-pcc-card]';
const HEADING_SELECTOR = '[role="heading"], h1, h2, h3, h4, h5, h6';
const HERO_SELECTOR = '[data-pcc-project-hero-band]';
const HORIZONTAL_SCROLL_TOLERANCE_PX = 2;
const LEFT_BOUND_TOLERANCE_PX = -2;
const SCROLL_POSITION_TOLERANCE_PX = 2;
const FOCUSED_HARD_FAIL_SURFACES = new Set(['cost-time', 'systems-administration']);

interface CaptureScrollDiagnostics {
  requestedScrollY?: number;
  actualScrollY: number;
  actualWindowScrollY: number;
  actualDocumentScrollLeft: number;
  actualBodyScrollLeft: number;
  maxHorizontalScrollLeftObserved: number;
  activeSurfacePanelLeft: number | null;
  activeSurfacePanelRight: number | null;
  activeSurfacePanelWidth: number | null;
  activeSurfacePanelScrollLeft: number | null;
  bentoGridLeft: number | null;
  bentoGridRight: number | null;
  bentoGridWidth: number | null;
  heroBandLeft: number | null;
  firstHeadingOrCardLeft: number | null;
  minRelevantLeft: number;
  documentClientWidth: number;
  documentScrollWidth: number;
  viewportWidth: number;
  viewportHeight: number;
  horizontalResetApplied: boolean;
  horizontalScrollWithinTolerance: boolean;
  surfacePanelLeftWithinTolerance: boolean;
  bentoGridLeftWithinTolerance: boolean;
  heroBandLeftWithinTolerance: boolean;
  firstHeadingOrCardLeftWithinTolerance: boolean;
  horizontalResetCandidateCount: number;
  horizontalResetAppliedCount: number;
  horizontalResetExcludedCount: number;
  horizontalNormalizationAttempts: number;
  horizontalNormalizationSucceeded: boolean;
  horizontalNormalizationFailures: string[];
  horizontalTopFailingCandidates: string[];
  captureReliabilityWarnings: string[];
}

interface ScrollRootSelection {
  kind: PccScrollRootKind;
  selector: string;
  contentScrollHeight: number;
  contentClientHeight: number;
  maxScrollY: number;
}

interface CaptureContext {
  surfaceId: PccScreenshotArtifact['surfaceId'];
  viewportWidth: number;
  viewportHeight: number;
  scrollRoot: ScrollRootSelection;
  segmentIndex?: number;
  segmentCount?: number;
  meaningfulScrollDelta: number;
  notScrollableReason?: string;
  requestedScrollY?: number;
}

interface PreparedCaptureState {
  diagnostics: CaptureScrollDiagnostics;
  horizontalResetApplied: boolean;
}

interface HorizontalNormalizationResult {
  applied: boolean;
  candidateCount: number;
  appliedCount: number;
  excludedCount: number;
  topFailingCandidates: string[];
}

function sanitizeHeading(input: string): { text: string; changed: boolean } {
  const original = input;
  const noQuery = original.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noCred = noEmail.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noTokenLike = noCred.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  const truncated = noTokenLike.slice(0, 120);
  return { text: truncated, changed: truncated !== original };
}

async function takeScreenshot(
  page: Page,
  targetPath: string,
  options: { fullPage?: boolean; mask?: string[] },
): Promise<void> {
  const maskLocators = (options.mask ?? []).map((selector) => page.locator(selector));
  await page.screenshot({
    path: targetPath,
    fullPage: options.fullPage,
    animations: 'disabled',
    caret: 'hide',
    mask: maskLocators,
  });
}

async function collectFileDiagnostics(
  filePath: string,
): Promise<{ contentSha256: string; fileSizeBytes: number }> {
  const bytes = await fs.readFile(filePath);
  const contentSha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return { contentSha256, fileSizeBytes: bytes.byteLength };
}

async function waitForLayoutStabilization(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  await page.waitForTimeout(80);
}

async function normalizeHorizontalCaptureState(
  page: Page,
  resetToTop: boolean,
): Promise<HorizontalNormalizationResult> {
  return page.evaluate(
    ({ shouldResetToTop }) => {
      if (shouldResetToTop) {
        window.scrollTo(0, 0);
      }
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;

      const pccSelectors = [
        '[data-pcc-root]',
        '[data-pcc-active-surface-panel]',
        'main[role="tabpanel"][data-pcc-active-surface-panel]',
        '[data-pcc-bento-grid]',
        '[data-pcc-project-hero-band]',
        '[data-pcc-shell]',
        '[data-pcc-surface-shell]',
        '[data-pcc-horizontal-tabs]',
      ];
      const hostSelectors = [
        '#spPageChromeAppDiv',
        '[id^="vpc_WebPart.ProjectControlCenterWebPart.external"]',
      ];

      const seen = new Set<HTMLElement>();
      const candidates: Array<{ node: HTMLElement; reason: string }> = [];

      const addCandidate = (node: HTMLElement | null, reason: string) => {
        if (!node || seen.has(node)) return;
        seen.add(node);
        candidates.push({ node, reason });
      };

      for (const selector of pccSelectors) {
        for (const node of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
          addCandidate(node, `pcc-selector:${selector}`);
        }
      }

      for (const selector of hostSelectors) {
        for (const node of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
          addCandidate(node, `host-selector:${selector}`);
        }
      }

      const activeTab = document.querySelector<HTMLElement>(
        '[data-pcc-tab-id][aria-selected="true"], [data-pcc-tab-id][data-pcc-tab-active="true"]',
      );
      const activePanel = document.querySelector<HTMLElement>(
        'main[role="tabpanel"][data-pcc-active-surface-panel], [data-pcc-active-surface-panel]',
      );
      const bento = document.querySelector<HTMLElement>('[data-pcc-bento-grid]');

      const addAncestors = (node: HTMLElement | null, reason: string) => {
        let cur = node;
        for (let i = 0; i < 14 && cur; i += 1) {
          addCandidate(cur, `${reason}:ancestor-${i}`);
          cur = cur.parentElement;
        }
      };

      addAncestors(activeTab, 'active-tab');
      addAncestors(activePanel, 'active-panel');
      addAncestors(bento, 'bento-grid');

      const overflowFallback = Array.from(document.querySelectorAll<HTMLElement>('body *')).filter(
        (el) => {
          if (!el.offsetParent) return false;
          const style = getComputedStyle(el);
          if (style.visibility === 'hidden' || style.display === 'none') return false;
          const wide = el.scrollWidth > el.clientWidth + 1;
          const overflowX = /(auto|scroll|clip|hidden)/.test(style.overflowX);
          const shifted = el.getBoundingClientRect().left < -2;
          const transformed = style.transform !== 'none';
          return wide || overflowX || shifted || transformed;
        },
      );

      for (const node of overflowFallback.slice(0, 250)) {
        addCandidate(node, 'global-overflow-candidate');
      }

      let appliedCount = 0;
      let excludedCount = 0;
      const failed: string[] = [];

      for (const candidate of candidates) {
        if (!candidate.node.isConnected) {
          excludedCount += 1;
          continue;
        }
        const before = candidate.node.scrollLeft;
        candidate.node.scrollLeft = 0;
        const after = candidate.node.scrollLeft;
        if (Math.abs(after) <= 2) {
          appliedCount += before !== after ? 1 : 0;
        } else {
          failed.push(`${candidate.reason}:${candidate.node.tagName.toLowerCase()}:${after}`);
        }
      }

      return {
        applied: true,
        candidateCount: candidates.length,
        appliedCount,
        excludedCount,
        topFailingCandidates: failed.slice(0, 8),
      };
    },
    { shouldResetToTop: resetToTop },
  );
}

async function resetToTopAndClearHorizontalScroll(
  page: Page,
): Promise<HorizontalNormalizationResult> {
  return normalizeHorizontalCaptureState(page, true);
}

async function clearHorizontalScrollPreservingVerticalPosition(
  page: Page,
): Promise<HorizontalNormalizationResult> {
  return normalizeHorizontalCaptureState(page, false);
}

async function selectScrollRoot(page: Page): Promise<ScrollRootSelection> {
  return page.evaluate(() => {
    type Candidate = {
      kind: 'active-surface-panel' | 'pcc-container';
      selector: string;
      element: HTMLElement;
    };

    const activePanel = document.querySelector<HTMLElement>(
      'main[role="tabpanel"][data-pcc-active-surface-panel], [data-pcc-active-surface-panel]',
    );

    const candidates: Candidate[] = [];

    if (activePanel) {
      candidates.push({
        kind: 'active-surface-panel',
        selector:
          'main[role="tabpanel"][data-pcc-active-surface-panel], [data-pcc-active-surface-panel]',
        element: activePanel,
      });
    }

    const containerSelectors = [
      '[data-pcc-surface-shell]',
      '[data-pcc-shell]',
      '[data-pcc-root]',
      '[data-pcc-bento-grid]',
      'main[role="main"]',
    ];

    for (const selector of containerSelectors) {
      const node = document.querySelector<HTMLElement>(selector);
      if (!node) continue;
      candidates.push({ kind: 'pcc-container', selector, element: node });
    }

    for (const candidate of candidates) {
      const maxY = Math.max(0, candidate.element.scrollHeight - candidate.element.clientHeight);
      if (maxY > 2) {
        return {
          kind: candidate.kind,
          selector: candidate.selector,
          contentScrollHeight: candidate.element.scrollHeight,
          contentClientHeight: candidate.element.clientHeight,
          maxScrollY: maxY,
        };
      }
    }

    const doc = document.documentElement;
    const maxDocY = Math.max(0, doc.scrollHeight - window.innerHeight);
    return {
      kind: 'window-document' as const,
      selector: 'window/document',
      contentScrollHeight: doc.scrollHeight,
      contentClientHeight: window.innerHeight,
      maxScrollY: maxDocY,
    };
  });
}

async function setScrollYForRoot(page: Page, root: ScrollRootSelection, y: number): Promise<void> {
  await page.evaluate(
    ({ rootKind, rootSelector, nextY }) => {
      const target = Math.max(0, nextY);
      if (rootKind === 'window-document') {
        window.scrollTo(0, target);
        return;
      }

      const element = document.querySelector<HTMLElement>(rootSelector);
      if (!element) {
        window.scrollTo(0, target);
        return;
      }
      element.scrollTop = target;
    },
    { rootKind: root.kind, rootSelector: root.selector, nextY: y },
  );
}

async function collectDiagnostics(
  page: Page,
  scrollRoot: ScrollRootSelection,
  normalization: HorizontalNormalizationResult,
  normalizationAttempts: number,
  requestedScrollY?: number,
): Promise<CaptureScrollDiagnostics> {
  const diag = await page.evaluate(
    ({ rootKind, rootSelector }) => {
      const doc = document.documentElement;
      const body = document.body;
      const panel = document.querySelector<HTMLElement>(
        'main[role="tabpanel"][data-pcc-active-surface-panel], [data-pcc-active-surface-panel]',
      );
      const bento = document.querySelector<HTMLElement>('[data-pcc-bento-grid]');
      const hero = document.querySelector<HTMLElement>('[data-pcc-project-hero-band]');
      const heading = document.querySelector<HTMLElement>(
        '[data-pcc-active-surface-panel] [role="heading"], [data-pcc-active-surface-panel] h1, [data-pcc-active-surface-panel] h2, [data-pcc-active-surface-panel] h3, [data-pcc-active-surface-panel] [data-pcc-card]',
      );

      const panelRect = panel ? panel.getBoundingClientRect() : null;
      const bentoRect = bento ? bento.getBoundingClientRect() : null;
      const heroRect = hero ? hero.getBoundingClientRect() : null;
      const headingRect = heading ? heading.getBoundingClientRect() : null;

      const nodes: HTMLElement[] = [doc as unknown as HTMLElement, body];
      if (panel) nodes.push(panel);
      if (bento) nodes.push(bento);
      if (hero) nodes.push(hero);
      if (heading) nodes.push(heading);

      let maxObserved = 0;
      for (const node of nodes) {
        maxObserved = Math.max(maxObserved, Math.abs(node.scrollLeft));
      }

      const actualScrollY =
        rootKind === 'window-document'
          ? window.scrollY
          : (document.querySelector<HTMLElement>(rootSelector)?.scrollTop ?? window.scrollY);

      const leftVals = [panelRect?.left, bentoRect?.left, heroRect?.left, headingRect?.left].filter(
        (v): v is number => typeof v === 'number',
      );

      return {
        actualScrollY,
        actualWindowScrollY: window.scrollY,
        actualDocumentScrollLeft: doc.scrollLeft,
        actualBodyScrollLeft: body.scrollLeft,
        maxHorizontalScrollLeftObserved: maxObserved,
        activeSurfacePanelLeft: panelRect ? panelRect.left : null,
        activeSurfacePanelRight: panelRect ? panelRect.right : null,
        activeSurfacePanelWidth: panelRect ? panelRect.width : null,
        activeSurfacePanelScrollLeft: panel ? panel.scrollLeft : null,
        bentoGridLeft: bentoRect ? bentoRect.left : null,
        bentoGridRight: bentoRect ? bentoRect.right : null,
        bentoGridWidth: bentoRect ? bentoRect.width : null,
        heroBandLeft: heroRect ? heroRect.left : null,
        firstHeadingOrCardLeft: headingRect ? headingRect.left : null,
        minRelevantLeft: leftVals.length > 0 ? Math.min(...leftVals) : 0,
        documentClientWidth: doc.clientWidth,
        documentScrollWidth: doc.scrollWidth,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    },
    { rootKind: scrollRoot.kind, rootSelector: scrollRoot.selector },
  );

  const captureReliabilityWarnings: string[] = [];
  const horizontalScrollWithinTolerance =
    Math.abs(diag.actualDocumentScrollLeft) <= HORIZONTAL_SCROLL_TOLERANCE_PX &&
    Math.abs(diag.actualBodyScrollLeft) <= HORIZONTAL_SCROLL_TOLERANCE_PX &&
    Math.abs(diag.maxHorizontalScrollLeftObserved) <= HORIZONTAL_SCROLL_TOLERANCE_PX;
  const surfacePanelLeftWithinTolerance =
    diag.activeSurfacePanelLeft === null || diag.activeSurfacePanelLeft >= LEFT_BOUND_TOLERANCE_PX;
  const bentoGridLeftWithinTolerance =
    diag.bentoGridLeft === null || diag.bentoGridLeft >= LEFT_BOUND_TOLERANCE_PX;
  const heroBandLeftWithinTolerance =
    diag.heroBandLeft === null || diag.heroBandLeft >= LEFT_BOUND_TOLERANCE_PX;
  const firstHeadingOrCardLeftWithinTolerance =
    diag.firstHeadingOrCardLeft === null || diag.firstHeadingOrCardLeft >= LEFT_BOUND_TOLERANCE_PX;

  if (requestedScrollY !== undefined) {
    const delta = Math.abs(diag.actualScrollY - requestedScrollY);
    if (delta > SCROLL_POSITION_TOLERANCE_PX) {
      captureReliabilityWarnings.push(
        `actual-scroll-mismatch requested=${requestedScrollY} actual=${diag.actualScrollY} tolerance=${SCROLL_POSITION_TOLERANCE_PX}`,
      );
    }
  }

  if (!horizontalScrollWithinTolerance) {
    captureReliabilityWarnings.push(
      `horizontal-scroll-drift doc=${diag.actualDocumentScrollLeft} body=${diag.actualBodyScrollLeft} maxObserved=${diag.maxHorizontalScrollLeftObserved}`,
    );
  }

  if (!surfacePanelLeftWithinTolerance) {
    captureReliabilityWarnings.push(
      `active-surface-panel-left-clipped left=${diag.activeSurfacePanelLeft} threshold=${LEFT_BOUND_TOLERANCE_PX}`,
    );
  }

  if (!bentoGridLeftWithinTolerance) {
    captureReliabilityWarnings.push(
      `bento-grid-left-clipped left=${diag.bentoGridLeft} threshold=${LEFT_BOUND_TOLERANCE_PX}`,
    );
  }
  if (!heroBandLeftWithinTolerance) {
    captureReliabilityWarnings.push(
      `hero-band-left-clipped left=${diag.heroBandLeft} threshold=${LEFT_BOUND_TOLERANCE_PX}`,
    );
  }
  if (!firstHeadingOrCardLeftWithinTolerance) {
    captureReliabilityWarnings.push(
      `first-heading-card-left-clipped left=${diag.firstHeadingOrCardLeft} threshold=${LEFT_BOUND_TOLERANCE_PX}`,
    );
  }
  if (diag.minRelevantLeft < LEFT_BOUND_TOLERANCE_PX) {
    captureReliabilityWarnings.push(
      `min-relevant-left-clipped minRelevantLeft=${diag.minRelevantLeft} threshold=${LEFT_BOUND_TOLERANCE_PX}`,
    );
  }
  if (normalization.topFailingCandidates.length > 0) {
    captureReliabilityWarnings.push('horizontal-normalization-failed');
  }

  return {
    requestedScrollY,
    ...diag,
    horizontalResetApplied: normalization.applied,
    horizontalScrollWithinTolerance,
    surfacePanelLeftWithinTolerance,
    bentoGridLeftWithinTolerance,
    heroBandLeftWithinTolerance,
    firstHeadingOrCardLeftWithinTolerance,
    horizontalResetCandidateCount: normalization.candidateCount,
    horizontalResetAppliedCount: normalization.appliedCount,
    horizontalResetExcludedCount: normalization.excludedCount,
    horizontalNormalizationAttempts: normalizationAttempts,
    horizontalNormalizationSucceeded: normalization.topFailingCandidates.length === 0,
    horizontalNormalizationFailures: normalization.topFailingCandidates,
    horizontalTopFailingCandidates: normalization.topFailingCandidates,
    captureReliabilityWarnings,
  };
}

async function collectPreparedState(
  page: Page,
  scrollRoot: ScrollRootSelection,
  resetStrategy: 'top-and-horizontal' | 'horizontal-only',
  requestedScrollY?: number,
): Promise<PreparedCaptureState> {
  const initialNormalization =
    resetStrategy === 'top-and-horizontal'
      ? await resetToTopAndClearHorizontalScroll(page)
      : await clearHorizontalScrollPreservingVerticalPosition(page);
  await waitForLayoutStabilization(page);

  let attempts = 1;
  let normalization = initialNormalization;
  let diag = await collectDiagnostics(page, scrollRoot, normalization, attempts, requestedScrollY);
  if (
    !diag.horizontalScrollWithinTolerance ||
    !diag.surfacePanelLeftWithinTolerance ||
    !diag.bentoGridLeftWithinTolerance ||
    !diag.heroBandLeftWithinTolerance ||
    !diag.firstHeadingOrCardLeftWithinTolerance
  ) {
    normalization =
      resetStrategy === 'top-and-horizontal'
        ? await resetToTopAndClearHorizontalScroll(page)
        : await clearHorizontalScrollPreservingVerticalPosition(page);
    attempts += 1;
    await waitForLayoutStabilization(page);
    const retryDiag = await collectDiagnostics(
      page,
      scrollRoot,
      normalization,
      attempts,
      requestedScrollY,
    );
    diag = {
      ...retryDiag,
      captureReliabilityWarnings: [
        ...retryDiag.captureReliabilityWarnings,
        'reliability-retry-applied-after-failed-reset',
      ],
    };
  }

  return {
    diagnostics: diag,
    horizontalResetApplied: normalization.applied,
  };
}

function buildArtifactFromPreCaptureState(
  screenshotPath: string,
  kind: PccScreenshotArtifact['kind'],
  context: CaptureContext,
  diagnostics: CaptureScrollDiagnostics,
): PccScreenshotArtifact {
  return {
    surfaceId: context.surfaceId,
    kind,
    path: screenshotPath,
    fileName: path.basename(screenshotPath),
    width: context.viewportWidth,
    height: context.viewportHeight,
    scrollY: diagnostics.actualScrollY,
    viewportWidth: context.viewportWidth,
    viewportHeight: context.viewportHeight,
    segmentIndex: context.segmentIndex,
    segmentCount: context.segmentCount,
    requestedScrollY: context.requestedScrollY,
    actualScrollY: diagnostics.actualScrollY,
    meaningfulScrollDelta: context.meaningfulScrollDelta,
    scrollRootKind: context.scrollRoot.kind,
    scrollRootSelector: context.scrollRoot.selector,
    contentScrollHeight: context.scrollRoot.contentScrollHeight,
    contentClientHeight: context.scrollRoot.contentClientHeight,
    actualWindowScrollY: diagnostics.actualWindowScrollY,
    actualDocumentScrollLeft: diagnostics.actualDocumentScrollLeft,
    actualBodyScrollLeft: diagnostics.actualBodyScrollLeft,
    maxHorizontalScrollLeftObserved: diagnostics.maxHorizontalScrollLeftObserved,
    activeSurfacePanelLeft: diagnostics.activeSurfacePanelLeft,
    activeSurfacePanelRight: diagnostics.activeSurfacePanelRight,
    activeSurfacePanelWidth: diagnostics.activeSurfacePanelWidth,
    activeSurfacePanelScrollLeft: diagnostics.activeSurfacePanelScrollLeft,
    bentoGridLeft: diagnostics.bentoGridLeft,
    bentoGridRight: diagnostics.bentoGridRight,
    bentoGridWidth: diagnostics.bentoGridWidth,
    heroBandLeft: diagnostics.heroBandLeft,
    firstHeadingOrCardLeft: diagnostics.firstHeadingOrCardLeft,
    minRelevantLeft: diagnostics.minRelevantLeft,
    documentClientWidth: diagnostics.documentClientWidth,
    documentScrollWidth: diagnostics.documentScrollWidth,
    horizontalResetApplied: diagnostics.horizontalResetApplied,
    horizontalScrollWithinTolerance: diagnostics.horizontalScrollWithinTolerance,
    surfacePanelLeftWithinTolerance: diagnostics.surfacePanelLeftWithinTolerance,
    bentoGridLeftWithinTolerance: diagnostics.bentoGridLeftWithinTolerance,
    heroBandLeftWithinTolerance: diagnostics.heroBandLeftWithinTolerance,
    firstHeadingOrCardLeftWithinTolerance: diagnostics.firstHeadingOrCardLeftWithinTolerance,
    horizontalResetCandidateCount: diagnostics.horizontalResetCandidateCount,
    horizontalResetAppliedCount: diagnostics.horizontalResetAppliedCount,
    horizontalResetExcludedCount: diagnostics.horizontalResetExcludedCount,
    horizontalNormalizationAttempts: diagnostics.horizontalNormalizationAttempts,
    horizontalNormalizationSucceeded: diagnostics.horizontalNormalizationSucceeded,
    horizontalNormalizationFailures: diagnostics.horizontalNormalizationFailures,
    horizontalTopFailingCandidates: diagnostics.horizontalTopFailingCandidates,
    captureReliabilityWarnings: diagnostics.captureReliabilityWarnings,
    notScrollableReason: context.notScrollableReason,
    segmentClassification: context.notScrollableReason ? 'not-scrollable' : undefined,
    operatorReviewRequired: true,
  };
}

async function captureArtifactWithPreCaptureDiagnostics(
  page: Page,
  screenshotPath: string,
  kind: PccScreenshotArtifact['kind'],
  context: CaptureContext,
  diagnostics: CaptureScrollDiagnostics,
  screenshotOptions: { fullPage?: boolean; mask?: string[] },
): Promise<PccScreenshotArtifact> {
  await takeScreenshot(page, screenshotPath, screenshotOptions);
  const artifact = buildArtifactFromPreCaptureState(screenshotPath, kind, context, diagnostics);
  const fileDiag = await collectFileDiagnostics(screenshotPath);
  artifact.contentSha256 = fileDiag.contentSha256;
  artifact.fileSizeBytes = fileDiag.fileSizeBytes;
  return artifact;
}

function markDuplicateDiagnostics(
  surfaceShots: PccScreenshotArtifact[],
  surfaceWarnings: string[],
): void {
  const aboveFold = surfaceShots.find((shot) => shot.kind === 'above-fold');
  const segments = surfaceShots.filter((shot) => shot.kind === 'scroll-segment');
  const scrollableByRoot = segments.some(
    (shot) => shot.contentScrollHeight - shot.contentClientHeight > 2,
  );

  for (const segment of segments) {
    if (!segment.segmentClassification) {
      segment.segmentClassification =
        segment.meaningfulScrollDelta > SCROLL_POSITION_TOLERANCE_PX
          ? 'meaningful'
          : 'not-scrollable';
    }

    if (
      aboveFold?.contentSha256 &&
      segment.contentSha256 &&
      aboveFold.contentSha256 === segment.contentSha256
    ) {
      if (segment.segmentClassification !== 'not-scrollable' && scrollableByRoot) {
        segment.segmentClassification = 'duplicate';
        const msg = `duplicate-scroll-capture above-fold-matches-${segment.fileName}`;
        segment.captureReliabilityWarnings.push(msg);
        surfaceWarnings.push(msg);
      }
    }
  }

  for (let i = 1; i < segments.length; i += 1) {
    const prev = segments[i - 1];
    const curr = segments[i];
    if (prev.contentSha256 && curr.contentSha256 && prev.contentSha256 === curr.contentSha256) {
      if (curr.segmentClassification !== 'not-scrollable' && scrollableByRoot) {
        curr.segmentClassification = 'duplicate';
        const msg = `duplicate-scroll-segments ${prev.fileName}=${curr.fileName}`;
        curr.captureReliabilityWarnings.push(msg);
        surfaceWarnings.push(msg);
      }
    }
  }
}

function assertFocusedSurfaceCaptureGate(
  surfaceId: PccScreenshotArtifact['surfaceId'],
  kind: PccScreenshotArtifact['kind'],
  diag: CaptureScrollDiagnostics,
): void {
  if (!FOCUSED_HARD_FAIL_SURFACES.has(surfaceId)) return;
  const clippingWarnings = diag.captureReliabilityWarnings.filter(
    (w) =>
      w.includes('horizontal-scroll-drift') ||
      w.includes('active-surface-panel-left-clipped') ||
      w.includes('bento-grid-left-clipped') ||
      w.includes('hero-band-left-clipped') ||
      w.includes('first-heading-card-left-clipped') ||
      w.includes('min-relevant-left-clipped') ||
      w.includes('horizontal-normalization-failed'),
  );
  const failed =
    !diag.horizontalScrollWithinTolerance ||
    !diag.surfacePanelLeftWithinTolerance ||
    !diag.bentoGridLeftWithinTolerance ||
    !diag.heroBandLeftWithinTolerance ||
    !diag.firstHeadingOrCardLeftWithinTolerance ||
    diag.minRelevantLeft < LEFT_BOUND_TOLERANCE_PX ||
    clippingWarnings.length > 0;

  if (!failed) return;
  const details = [
    `surfaceId=${surfaceId}`,
    `artifact=${kind}`,
    `minRelevantLeft=${diag.minRelevantLeft}`,
    `activeSurfacePanelLeft=${diag.activeSurfacePanelLeft}`,
    `bentoGridLeft=${diag.bentoGridLeft}`,
    `heroBandLeft=${diag.heroBandLeft}`,
    `firstHeadingOrCardLeft=${diag.firstHeadingOrCardLeft}`,
    `horizontalNormalizationAttempts=${diag.horizontalNormalizationAttempts}`,
    `topFailingCandidates=${diag.horizontalTopFailingCandidates.join(' | ') || 'none'}`,
    `warnings=${clippingWarnings.join(' | ') || 'none'}`,
  ];
  throw new Error(`Focused clipping hard-fail: ${details.join('; ')}`);
}

async function extractCardSummaries(
  page: Page,
  surfaceId: PccScreenshotArtifact['surfaceId'],
  cap: number,
): Promise<PccDomCardSummary[]> {
  const cards = page.locator(CARD_SELECTOR);
  const count = Math.min(await cards.count(), cap);
  const summaries: PccDomCardSummary[] = [];

  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    const headingNode = card.locator(HEADING_SELECTOR).first();

    const rawHeading =
      (await headingNode.textContent().catch(() => null)) ??
      (await card.getAttribute('aria-label').catch(() => null)) ??
      '';

    const { text, changed } = sanitizeHeading(rawHeading.trim());

    summaries.push({
      surfaceId,
      index: i,
      hierarchy: (await card.getAttribute('data-pcc-card-hierarchy')) ?? undefined,
      tier: (await card.getAttribute('data-pcc-card-tier')) ?? undefined,
      region: (await card.getAttribute('data-pcc-card-region')) ?? undefined,
      footprint: (await card.getAttribute('data-pcc-footprint')) ?? undefined,
      headingLevel: (await card.getAttribute('data-pcc-heading-level')) ?? undefined,
      headingText: text || undefined,
      cardSelector: `${CARD_SELECTOR}:nth-of-type(${i + 1})`,
      textWasSanitized: changed,
    });
  }

  return summaries;
}

export interface CapturePccSurfaceScreenshotsInput {
  page: Page;
  pageObject: PccLivePageObject;
  surfaces: readonly PccLiveSurfaceDefinition[];
  outputDir: string;
  maxScrollSegments?: number;
  maxCardSummariesPerSurface?: number;
}

export interface CapturePccSurfaceScreenshotsResult {
  surfaces: PccSurfaceScreenshotEvidence[];
  screenshotCount: number;
  domCardSummaryCount: number;
  screenshotDir: string;
}

export async function capturePccSurfaceScreenshots(
  input: CapturePccSurfaceScreenshotsInput,
): Promise<CapturePccSurfaceScreenshotsResult> {
  const screenshotDir = path.join(input.outputDir, 'screenshots');
  await fs.mkdir(screenshotDir, { recursive: true });

  const maxSegments = input.maxScrollSegments ?? 8;
  const maxCardSummaries = input.maxCardSummariesPerSurface ?? 80;
  const viewport = input.page.viewportSize() ?? { width: 1280, height: 720 };

  const maskSelectors = [
    'input',
    'textarea',
    '[contenteditable="true"]',
    '[data-pcc-sensitive]',
    '[data-pcc-email]',
    '[data-pcc-phone]',
    '[data-pcc-user-email]',
    '[data-pcc-user-name]',
    '[data-pcc-contact]',
    '[data-pcc-avatar]',
    '[data-pcc-profile]',
  ];

  const results: PccSurfaceScreenshotEvidence[] = [];

  for (const surface of input.surfaces) {
    try {
      const preNavRoot = await selectScrollRoot(input.page);
      await collectPreparedState(input.page, preNavRoot, 'top-and-horizontal', 0);
    } catch {
      // Best effort pre-navigation normalization.
    }
    const smoke = await input.pageObject.assertSurfaceActive(surface);

    const surfaceShots: PccScreenshotArtifact[] = [];
    const warnings: string[] = [];

    try {
      const scrollRoot = await selectScrollRoot(input.page);
      await collectPreparedState(input.page, scrollRoot, 'top-and-horizontal', 0);
      await waitForLayoutStabilization(input.page);
      const aboveFold = path.join(screenshotDir, `surface-${surface.id}-above-fold.png`);
      const aboveFoldPrepared = await collectPreparedState(
        input.page,
        scrollRoot,
        'top-and-horizontal',
      );
      assertFocusedSurfaceCaptureGate(surface.id, 'above-fold', aboveFoldPrepared.diagnostics);
      surfaceShots.push(
        await captureArtifactWithPreCaptureDiagnostics(
          input.page,
          aboveFold,
          'above-fold',
          {
            surfaceId: surface.id,
            viewportWidth: viewport.width,
            viewportHeight: viewport.height,
            scrollRoot,
            meaningfulScrollDelta: 0,
          },
          aboveFoldPrepared.diagnostics,
          { mask: maskSelectors },
        ),
      );

      const fullPage = path.join(screenshotDir, `surface-${surface.id}-full-page.png`);
      const fullPagePrepared = await collectPreparedState(
        input.page,
        scrollRoot,
        'top-and-horizontal',
      );
      assertFocusedSurfaceCaptureGate(surface.id, 'full-page', fullPagePrepared.diagnostics);
      surfaceShots.push(
        await captureArtifactWithPreCaptureDiagnostics(
          input.page,
          fullPage,
          'full-page',
          {
            surfaceId: surface.id,
            viewportWidth: viewport.width,
            viewportHeight: viewport.height,
            scrollRoot,
            meaningfulScrollDelta: 0,
          },
          fullPagePrepared.diagnostics,
          { fullPage: true, mask: maskSelectors },
        ),
      );

      const maxScrollableY = Math.max(0, scrollRoot.maxScrollY);
      if (maxScrollableY <= SCROLL_POSITION_TOLERANCE_PX) {
        const segmentPath = path.join(screenshotDir, `surface-${surface.id}-scroll-001.png`);
        const segmentPrepared = await collectPreparedState(
          input.page,
          scrollRoot,
          'top-and-horizontal',
          0,
        );
        assertFocusedSurfaceCaptureGate(surface.id, 'scroll-segment', segmentPrepared.diagnostics);
        surfaceShots.push(
          await captureArtifactWithPreCaptureDiagnostics(
            input.page,
            segmentPath,
            'scroll-segment',
            {
              surfaceId: surface.id,
              viewportWidth: viewport.width,
              viewportHeight: viewport.height,
              scrollRoot,
              segmentIndex: 1,
              segmentCount: 1,
              requestedScrollY: 0,
              meaningfulScrollDelta: 0,
              notScrollableReason: 'content-not-scrollable',
            },
            segmentPrepared.diagnostics,
            { mask: maskSelectors },
          ),
        );
      } else {
        const segmentCount = Math.max(
          1,
          Math.min(
            maxSegments,
            Math.ceil(scrollRoot.contentScrollHeight / Math.max(1, scrollRoot.contentClientHeight)),
          ),
        );
        const targets = new Set<number>();
        for (let i = 0; i < segmentCount; i += 1) {
          const y = Math.min(
            maxScrollableY,
            Math.round((i / Math.max(1, segmentCount - 1)) * maxScrollableY),
          );
          targets.add(y);
        }
        targets.delete(0);

        const sortedTargets = [...targets].sort((a, b) => a - b);
        let segmentIndex = 1;
        for (const targetY of sortedTargets) {
          await setScrollYForRoot(input.page, scrollRoot, targetY);
          await waitForLayoutStabilization(input.page);
          const segmentPrepared = await collectPreparedState(
            input.page,
            scrollRoot,
            'horizontal-only',
            targetY,
          );
          assertFocusedSurfaceCaptureGate(
            surface.id,
            'scroll-segment',
            segmentPrepared.diagnostics,
          );
          const segmentPath = path.join(
            screenshotDir,
            `surface-${surface.id}-scroll-${String(segmentIndex).padStart(3, '0')}.png`,
          );
          surfaceShots.push(
            await captureArtifactWithPreCaptureDiagnostics(
              input.page,
              segmentPath,
              'scroll-segment',
              {
                surfaceId: surface.id,
                viewportWidth: viewport.width,
                viewportHeight: viewport.height,
                scrollRoot,
                segmentIndex,
                segmentCount: sortedTargets.length,
                requestedScrollY: targetY,
                meaningfulScrollDelta: targetY,
              },
              segmentPrepared.diagnostics,
              { mask: maskSelectors },
            ),
          );
          segmentIndex += 1;
        }
      }

      await setScrollYForRoot(input.page, scrollRoot, 0);
      await waitForLayoutStabilization(input.page);
    } catch (error) {
      const message = `Screenshot capture error: ${String(error).slice(0, 400)}`;
      warnings.push(message);
      if (FOCUSED_HARD_FAIL_SURFACES.has(surface.id)) {
        throw new Error(message);
      }
    }

    markDuplicateDiagnostics(surfaceShots, warnings);

    for (const shot of surfaceShots) {
      for (const warning of shot.captureReliabilityWarnings) {
        warnings.push(`artifact ${shot.fileName}: ${warning}`);
      }
    }

    const cardSummaries = await extractCardSummaries(input.page, surface.id, maxCardSummaries);
    if (cardSummaries.length === 0) {
      warnings.push('No [data-pcc-card] summaries detected for this surface.');
    }

    if (smoke.warning) warnings.push(smoke.warning);

    results.push({
      surfaceId: surface.id,
      label: surface.label,
      passed: smoke.passed,
      screenshots: surfaceShots,
      cardSummaries,
      warnings,
    });
  }

  return {
    surfaces: results,
    screenshotCount: results.reduce((sum, s) => sum + s.screenshots.length, 0),
    domCardSummaryCount: results.reduce((sum, s) => sum + s.cardSummaries.length, 0),
    screenshotDir,
  };
}
