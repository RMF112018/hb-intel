import fs from 'node:fs/promises';
import path from 'node:path';
import type { Page } from '@playwright/test';
import type { PccLivePageObject } from './pcc-live.page-object';
import {
  PCC_LIVE_RESPONSIVE_COLUMNS,
  resolvePccLiveResponsiveMode,
} from './pcc-live.breakpoint-matrix';
import { measureTouchTargets } from './pcc-live.touch-targets';
import type {
  PccLiveBreakpointScreenshotArtifact,
  PccLiveBreakpointSurfaceEvidence,
  PccLiveCardMeasurement,
  PccLiveGridMeasurement,
  PccLiveTouchTargetMeasurement,
  PccLiveViewportDefinition,
} from './pcc-live.breakpoint.types';
import type { PccLiveSurfaceDefinition } from './pcc-live.surfaces';

const GRID_SELECTOR = '[data-pcc-bento-grid]';
const CARD_SELECTOR = '[data-pcc-card]';
const PANEL_SELECTOR = '[data-pcc-active-surface-panel]';
const LEFT_BOUND_TOLERANCE_PX = -2;

const MASK_SELECTORS = [
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

function toNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sanitizeWarning(value: string): string {
  const noQuery = value.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noCred = noEmail.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  return noCred.slice(0, 240);
}

export async function measureBreakpointGrid(
  page: Page,
  surface: PccLiveSurfaceDefinition,
  viewport: PccLiveViewportDefinition,
): Promise<PccLiveGridMeasurement | null> {
  const data = await page
    .locator(GRID_SELECTOR)
    .first()
    .evaluate((grid) => {
      const rect = grid.getBoundingClientRect();
      const doc = document.documentElement;
      return {
        width: rect.width,
        height: rect.height,
        observedMode: grid.getAttribute('data-pcc-mode') ?? undefined,
        observedGridSafety: grid.getAttribute('data-pcc-grid-safety') ?? undefined,
        docScrollWidth: doc.scrollWidth,
        docClientWidth: doc.clientWidth,
        overflowX: Math.max(0, doc.scrollWidth - doc.clientWidth),
        hasHorizontalScroll: doc.scrollWidth > doc.clientWidth + 1,
      };
    })
    .catch(() => null);

  if (!data) return null;

  const derivedMode = resolvePccLiveResponsiveMode(data.width);

  return {
    surfaceId: surface.id,
    viewportId: viewport.id,
    browserViewportWidth: viewport.width,
    browserViewportHeight: viewport.height,
    measuredContainerWidth: data.width,
    measuredContainerHeight: data.height,
    observedMode: data.observedMode,
    derivedMode,
    expectedColumns: PCC_LIVE_RESPONSIVE_COLUMNS[derivedMode],
    observedGridSafety: data.observedGridSafety,
    horizontalScrollDetected: data.hasHorizontalScroll,
    viewportOverflowX: data.overflowX,
    documentScrollWidth: data.docScrollWidth,
    documentClientWidth: data.docClientWidth,
  };
}

export async function measureBreakpointCards(
  page: Page,
  surface: PccLiveSurfaceDefinition,
  viewport: PccLiveViewportDefinition,
  cap: number,
): Promise<PccLiveCardMeasurement[]> {
  const cards = page.locator(CARD_SELECTOR);
  const count = Math.min(await cards.count(), cap);
  const items: PccLiveCardMeasurement[] = [];

  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    const values = await card.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement;
      const grid = el.closest('[data-pcc-bento-grid]');
      const gridRect = grid?.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const clipped =
        !!gridRect &&
        (rect.left < gridRect.left - 1 ||
          rect.right > gridRect.right + 1 ||
          rect.top < gridRect.top - 1 ||
          rect.bottom > gridRect.bottom + 1);

      const interactive = Array.from(
        el.querySelectorAll(
          'button, a[href], [role="button"], [role="tab"], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((node) => {
        const elem = node as HTMLElement;
        if (!elem.offsetParent) return false;
        if ((elem as HTMLInputElement).disabled) return false;
        return true;
      });

      return {
        footprint: el.getAttribute('data-pcc-footprint') ?? undefined,
        hierarchy: el.getAttribute('data-pcc-card-hierarchy') ?? undefined,
        tier: el.getAttribute('data-pcc-card-tier') ?? undefined,
        region: el.getAttribute('data-pcc-card-region') ?? undefined,
        headingLevel: el.getAttribute('data-pcc-heading-level') ?? undefined,
        dataMode: el.getAttribute('data-pcc-mode') ?? undefined,
        columnSpan: el.getAttribute('data-pcc-column-span'),
        rowSpan: el.getAttribute('data-pcc-row-span'),
        measuredHeight: el.getAttribute('data-pcc-measured-height'),
        boundingWidth: rect.width,
        boundingHeight: rect.height,
        directChildOfGrid: !!parent?.matches('[data-pcc-bento-grid]'),
        clipped,
        overflowX: el.scrollWidth > el.clientWidth + 1 || style.overflowX === 'hidden',
        overflowY: el.scrollHeight > el.clientHeight + 1 || style.overflowY === 'hidden',
        touchRects: interactive.map((node) => {
          const elem = node as HTMLElement;
          const r = elem.getBoundingClientRect();
          return { width: r.width, height: r.height };
        }),
      };
    });

    const threshold = viewport.touch ? 44 : 32;
    const minTouchTargetIssueCount = values.touchRects.filter(
      (r) => r.width < threshold || r.height < threshold,
    ).length;

    items.push({
      surfaceId: surface.id,
      viewportId: viewport.id,
      index: i,
      footprint: values.footprint,
      hierarchy: values.hierarchy,
      tier: values.tier,
      region: values.region,
      headingLevel: values.headingLevel,
      dataMode: values.dataMode,
      columnSpan: toNumber(values.columnSpan),
      rowSpan: toNumber(values.rowSpan),
      measuredHeight: toNumber(values.measuredHeight),
      boundingWidth: values.boundingWidth,
      boundingHeight: values.boundingHeight,
      directChildOfGrid: values.directChildOfGrid,
      clipped: values.clipped,
      overflowX: values.overflowX,
      overflowY: values.overflowY,
      minTouchTargetIssueCount,
    });
  }

  return items;
}

export async function measureBreakpointTouchTargets(
  page: Page,
  surface: PccLiveSurfaceDefinition,
  viewport: PccLiveViewportDefinition,
  cap: number,
): Promise<{
  touchTargets: PccLiveTouchTargetMeasurement[];
  diagnostics: PccLiveBreakpointSurfaceEvidence['touchTargetScopeDiagnostics'];
}> {
  const threshold = viewport.touch ? 44 : 32;
  const measured = await measureTouchTargets({
    page,
    primaryRootSelector: `${PANEL_SELECTOR}[data-pcc-active-surface-panel="${surface.id}"]`,
    fallbackRootSelector: 'body',
    thresholdPx: threshold,
    measurementLane: 'breakpoint',
    cap,
    excludeDisabled: false,
  });

  return {
    touchTargets: measured.rows.map((item) => ({
      surfaceId: surface.id,
      viewportId: viewport.id,
      selector: item.selector,
      role: item.role,
      tagName: item.tagName,
      width: item.width,
      height: item.height,
      thresholdPx: item.thresholdPx,
      measurementLane: 'breakpoint',
      disabled: item.disabled,
      visible: item.visible,
      x: item.x,
      y: item.y,
      belowRecommendedSize: item.belowRecommendedSize,
    })),
    diagnostics: measured.diagnostics,
  };
}

async function takeBreakpointScreenshot(
  page: Page,
  outputDir: string,
  surface: PccLiveSurfaceDefinition,
  viewport: PccLiveViewportDefinition,
): Promise<PccLiveBreakpointScreenshotArtifact> {
  const fileName = `breakpoint-${viewport.id}-${surface.id}.png`;
  const shotPath = path.join(outputDir, 'breakpoint-screenshots', fileName);
  await fs.mkdir(path.dirname(shotPath), { recursive: true });

  await page.screenshot({
    path: shotPath,
    animations: 'disabled',
    caret: 'hide',
    mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
  });

  return {
    surfaceId: surface.id,
    viewportId: viewport.id,
    path: shotPath,
    fileName,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    operatorReviewRequired: true,
  };
}

async function resetHorizontalState(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
    const selectors = ['[data-pcc-active-surface-panel]', '[data-pcc-bento-grid]', '[data-pcc-shell]'];
    for (const selector of selectors) {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
      for (const node of nodes) node.scrollLeft = 0;
    }
  });
  await page.waitForTimeout(80);
}

async function collectLeftBoundDiagnostics(page: Page): Promise<{
  panelLeft: number | null;
  bentoLeft: number | null;
}> {
  return page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>(
      'main[role="tabpanel"][data-pcc-active-surface-panel], [data-pcc-active-surface-panel]',
    );
    const bento = document.querySelector<HTMLElement>('[data-pcc-bento-grid]');
    return {
      panelLeft: panel ? panel.getBoundingClientRect().left : null,
      bentoLeft: bento ? bento.getBoundingClientRect().left : null,
    };
  });
}

export interface CapturePccBreakpointsInput {
  page: Page;
  pageObject: PccLivePageObject;
  pageUrl: string;
  surfaces: readonly PccLiveSurfaceDefinition[];
  viewports: readonly PccLiveViewportDefinition[];
  outputDir: string;
  maxCardsPerSurfaceViewport?: number;
  maxTouchTargetsPerSurfaceViewport?: number;
}

export interface CapturePccBreakpointsResult {
  surfaces: PccLiveBreakpointSurfaceEvidence[];
  viewportCount: number;
  surfaceCount: number;
  screenshotCount: number;
  cardMeasurementCount: number;
  touchTargetMeasurementCount: number;
  warningCount: number;
}

export async function capturePccBreakpoints(
  input: CapturePccBreakpointsInput,
): Promise<CapturePccBreakpointsResult> {
  const rows: PccLiveBreakpointSurfaceEvidence[] = [];
  const maxCards = input.maxCardsPerSurfaceViewport ?? 120;
  const maxTouchTargets = input.maxTouchTargetsPerSurfaceViewport ?? 250;

  for (const viewport of input.viewports) {
    await input.page.setViewportSize({ width: viewport.width, height: viewport.height });
    await input.pageObject.goto(input.pageUrl);
    await input.pageObject.waitForPccRoot();

    for (const surface of input.surfaces) {
      const warnings: string[] = [];
      await input.pageObject.assertSurfaceActive(surface);
      await resetHorizontalState(input.page);
      const bounds = await collectLeftBoundDiagnostics(input.page);
      if (bounds.panelLeft !== null && bounds.panelLeft < LEFT_BOUND_TOLERANCE_PX) {
        warnings.push(
          `Capture reliability warning: active panel left clipping panelLeft=${bounds.panelLeft} threshold=${LEFT_BOUND_TOLERANCE_PX}.`,
        );
      }
      if (bounds.bentoLeft !== null && bounds.bentoLeft < LEFT_BOUND_TOLERANCE_PX) {
        warnings.push(
          `Capture reliability warning: bento left clipping bentoLeft=${bounds.bentoLeft} threshold=${LEFT_BOUND_TOLERANCE_PX}.`,
        );
      }

      const grid = await measureBreakpointGrid(input.page, surface, viewport);
      if (!grid) {
        warnings.push('Missing [data-pcc-bento-grid] measurement.');
        continue;
      }

      if (grid.observedMode && grid.observedMode !== grid.derivedMode) {
        warnings.push(
          `Mode mismatch observed=${String(grid.observedMode)} derived=${grid.derivedMode} viewport=${viewport.id}`,
        );
      }
      if (grid.horizontalScrollDetected) {
        warnings.push(`Horizontal overflow detected on viewport=${viewport.id}.`);
      }

      const cards = await measureBreakpointCards(input.page, surface, viewport, maxCards);
      if (cards.some((card) => !card.directChildOfGrid)) {
        warnings.push(`Direct-child stability issues detected on viewport=${viewport.id}.`);
      }
      if (cards.some((card) => card.clipped || card.overflowX || card.overflowY)) {
        warnings.push(`Card clipping/overflow issues detected on viewport=${viewport.id}.`);
      }

      const touchTargetResult = await measureBreakpointTouchTargets(
        input.page,
        surface,
        viewport,
        maxTouchTargets,
      );
      const touchTargets = touchTargetResult.touchTargets;
      if (touchTargets.some((target) => target.belowRecommendedSize)) {
        warnings.push(`Touch target size issues detected on viewport=${viewport.id}.`);
      }
      if (touchTargets.length === 0 && touchTargetResult.diagnostics?.zeroMeasureReason) {
        warnings.push(
          `Touch-target diagnostics (${viewport.id}): ${touchTargetResult.diagnostics.zeroMeasureReason}.`,
        );
      }

      const screenshot = await takeBreakpointScreenshot(
        input.page,
        input.outputDir,
        surface,
        viewport,
      );

      rows.push({
        surfaceId: surface.id,
        label: surface.label,
        viewportId: viewport.id,
        viewportLabel: viewport.label,
        grid,
        cards,
        touchTargets,
        touchTargetScopeDiagnostics: touchTargetResult.diagnostics,
        screenshot,
        warnings: warnings.map((warning) => sanitizeWarning(warning)),
      });
    }
  }

  return {
    surfaces: rows,
    viewportCount: input.viewports.length,
    surfaceCount: input.surfaces.length,
    screenshotCount: rows.filter((row) => row.screenshot).length,
    cardMeasurementCount: rows.reduce((sum, row) => sum + row.cards.length, 0),
    touchTargetMeasurementCount: rows.reduce((sum, row) => sum + row.touchTargets.length, 0),
    warningCount: rows.reduce((sum, row) => sum + row.warnings.length, 0),
  };
}
