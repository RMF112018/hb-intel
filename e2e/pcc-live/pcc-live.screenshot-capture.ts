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
const HORIZONTAL_SCROLL_TOLERANCE_PX = 2;
const LEFT_BOUND_TOLERANCE_PX = -2;
const SCROLL_POSITION_TOLERANCE_PX = 2;

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
  documentClientWidth: number;
  documentScrollWidth: number;
  viewportWidth: number;
  viewportHeight: number;
  horizontalResetApplied: boolean;
  horizontalScrollWithinTolerance: boolean;
  surfacePanelLeftWithinTolerance: boolean;
  bentoGridLeftWithinTolerance: boolean;
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

async function clearHorizontalScroll(page: Page, resetToTop: boolean): Promise<boolean> {
  return page.evaluate(
    ({ shouldResetToTop }) => {
      if (shouldResetToTop) {
        window.scrollTo(0, 0);
      }
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;

      const selectors = [
        '[data-pcc-root]',
        '[data-pcc-active-surface-panel]',
        'main[role="tabpanel"][data-pcc-active-surface-panel]',
        '[data-pcc-bento-grid]',
        '[data-pcc-shell]',
        '[data-pcc-surface-shell]',
      ];

      for (const selector of selectors) {
        const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
        for (const node of nodes) {
          node.scrollLeft = 0;
        }
      }

      const fallback = Array.from(document.querySelectorAll<HTMLElement>('body *')).filter((el) => {
        if (!el.offsetParent) return false;
        if (el.scrollWidth <= el.clientWidth + 1) return false;
        const style = getComputedStyle(el);
        if (style.visibility === 'hidden' || style.display === 'none') return false;
        return /(auto|scroll|clip)/.test(style.overflowX);
      });

      for (const node of fallback.slice(0, 250)) {
        node.scrollLeft = 0;
      }

      return true;
    },
    { shouldResetToTop: resetToTop },
  );
}

async function resetToTopAndClearHorizontalScroll(page: Page): Promise<boolean> {
  return clearHorizontalScroll(page, true);
}

async function clearHorizontalScrollPreservingVerticalPosition(page: Page): Promise<boolean> {
  return clearHorizontalScroll(page, false);
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
  horizontalResetApplied: boolean,
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

      const panelRect = panel ? panel.getBoundingClientRect() : null;
      const bentoRect = bento ? bento.getBoundingClientRect() : null;

      const nodes: HTMLElement[] = [doc as unknown as HTMLElement, body];
      if (panel) nodes.push(panel);
      if (bento) nodes.push(bento);

      let maxObserved = 0;
      for (const node of nodes) {
        maxObserved = Math.max(maxObserved, Math.abs(node.scrollLeft));
      }

      const actualScrollY =
        rootKind === 'window-document'
          ? window.scrollY
          : (document.querySelector<HTMLElement>(rootSelector)?.scrollTop ?? window.scrollY);

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

  return {
    requestedScrollY,
    ...diag,
    horizontalResetApplied,
    horizontalScrollWithinTolerance,
    surfacePanelLeftWithinTolerance,
    bentoGridLeftWithinTolerance,
    captureReliabilityWarnings,
  };
}

async function collectPreparedState(
  page: Page,
  scrollRoot: ScrollRootSelection,
  resetStrategy: 'top-and-horizontal' | 'horizontal-only',
  requestedScrollY?: number,
): Promise<PreparedCaptureState> {
  const horizontalResetApplied =
    resetStrategy === 'top-and-horizontal'
      ? await resetToTopAndClearHorizontalScroll(page)
      : await clearHorizontalScrollPreservingVerticalPosition(page);
  await waitForLayoutStabilization(page);

  let diag = await collectDiagnostics(page, scrollRoot, horizontalResetApplied, requestedScrollY);
  if (
    !diag.horizontalScrollWithinTolerance ||
    !diag.surfacePanelLeftWithinTolerance ||
    !diag.bentoGridLeftWithinTolerance
  ) {
    if (resetStrategy === 'top-and-horizontal') {
      await resetToTopAndClearHorizontalScroll(page);
    } else {
      await clearHorizontalScrollPreservingVerticalPosition(page);
    }
    await waitForLayoutStabilization(page);
    const retryDiag = await collectDiagnostics(page, scrollRoot, true, requestedScrollY);
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
    horizontalResetApplied,
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
    documentClientWidth: diagnostics.documentClientWidth,
    documentScrollWidth: diagnostics.documentScrollWidth,
    horizontalResetApplied: diagnostics.horizontalResetApplied,
    horizontalScrollWithinTolerance: diagnostics.horizontalScrollWithinTolerance,
    surfacePanelLeftWithinTolerance: diagnostics.surfacePanelLeftWithinTolerance,
    bentoGridLeftWithinTolerance: diagnostics.bentoGridLeftWithinTolerance,
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
    const smoke = await input.pageObject.assertSurfaceActive(surface);

    const surfaceShots: PccScreenshotArtifact[] = [];
    const warnings: string[] = [];

    try {
      const scrollRoot = await selectScrollRoot(input.page);
      const aboveFold = path.join(screenshotDir, `surface-${surface.id}-above-fold.png`);
      const aboveFoldPrepared = await collectPreparedState(
        input.page,
        scrollRoot,
        'top-and-horizontal',
      );
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
      warnings.push(`Screenshot capture error: ${String(error).slice(0, 180)}`);
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
