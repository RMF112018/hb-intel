import fs from 'node:fs/promises';
import path from 'node:path';
import type { Page } from '@playwright/test';
import type { PccLivePageObject } from './pcc-live.page-object';
import type { PccLiveSurfaceDefinition } from './pcc-live.surfaces';
import type {
  PccDomCardSummary,
  PccScreenshotArtifact,
  PccSurfaceScreenshotEvidence,
} from './pcc-live.screenshot.types';

const CARD_SELECTOR = '[data-pcc-card]';
const HEADING_SELECTOR = '[role="heading"], h1, h2, h3, h4, h5, h6';

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

function artifactFromPath(
  surfaceId: PccScreenshotArtifact['surfaceId'],
  kind: PccScreenshotArtifact['kind'],
  screenshotPath: string,
  viewportWidth: number,
  viewportHeight: number,
  scrollY?: number,
): PccScreenshotArtifact {
  return {
    surfaceId,
    kind,
    path: screenshotPath,
    fileName: path.basename(screenshotPath),
    width: viewportWidth,
    height: viewportHeight,
    scrollY,
    viewportWidth,
    viewportHeight,
    operatorReviewRequired: true,
  };
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
      const aboveFold = path.join(screenshotDir, `surface-${surface.id}-above-fold.png`);
      await takeScreenshot(input.page, aboveFold, { mask: maskSelectors });
      surfaceShots.push(
        artifactFromPath(surface.id, 'above-fold', aboveFold, viewport.width, viewport.height),
      );

      const fullPage = path.join(screenshotDir, `surface-${surface.id}-full-page.png`);
      await takeScreenshot(input.page, fullPage, { fullPage: true, mask: maskSelectors });
      surfaceShots.push(
        artifactFromPath(surface.id, 'full-page', fullPage, viewport.width, viewport.height),
      );

      const pageHeight = await input.page.evaluate(() =>
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
        ),
      );

      const segmentCount = Math.max(
        1,
        Math.min(maxSegments, Math.ceil(pageHeight / viewport.height)),
      );
      for (let i = 0; i < segmentCount; i += 1) {
        const scrollY = i * viewport.height;
        await input.page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await input.page.waitForTimeout(100);
        const segmentPath = path.join(
          screenshotDir,
          `surface-${surface.id}-scroll-${String(i + 1).padStart(3, '0')}.png`,
        );
        await takeScreenshot(input.page, segmentPath, { mask: maskSelectors });
        surfaceShots.push(
          artifactFromPath(
            surface.id,
            'scroll-segment',
            segmentPath,
            viewport.width,
            viewport.height,
            scrollY,
          ),
        );
      }

      await input.page.evaluate(() => window.scrollTo(0, 0));
    } catch (error) {
      warnings.push(`Screenshot capture error: ${String(error).slice(0, 180)}`);
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
