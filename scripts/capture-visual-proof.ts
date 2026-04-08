/**
 * Playwright screenshot capture for homepage surface family visual proof.
 * Wave-01r Prompt-01: Capture Visual Proof
 *
 * Usage: npx playwright test scripts/capture-visual-proof.ts --config=scripts/capture-visual-proof.config.ts
 */
import { test } from '@playwright/test';
import { join } from 'path';

const EVIDENCE_DIR = join(__dirname, '..', 'docs', 'architecture', 'reviews', 'evidence', 'ui-system-visual-proof');

/** Storybook story URL pattern for iframe mode (renders component without Storybook chrome). */
function storyUrl(storyId: string): string {
  return `/iframe.html?id=${storyId}&viewMode=story`;
}

const SURFACES = [
  {
    name: 'HbcSignatureHeroSurface',
    storyId: 'homepage-surfaces-hbcsignatureherosurface--default',
    consumer: 'HbHeroBanner',
    widths: [1280, 768],
  },
  {
    name: 'HbcCommandSurface',
    storyId: 'homepage-surfaces-hbccommandsurface--default',
    consumer: 'PriorityActionsRail',
    widths: [1280, 768],
  },
  {
    name: 'HbcDiscoverySurface',
    storyId: 'homepage-surfaces-hbcdiscoverysurface--default',
    consumer: 'SmartSearchWayfinding',
    widths: [1280, 768],
  },
  {
    name: 'HbcEditorialSurface',
    storyId: 'homepage-surfaces-hbceditorialsurface--default',
    consumer: 'LeadershipMessage',
    widths: [1280, 768],
  },
  {
    name: 'HbcOperationalSurface',
    storyId: 'homepage-surfaces-hbcoperationalsurface--default',
    consumer: 'SafetyFieldExcellence',
    widths: [1280, 768],
  },
];

// Additional variant captures
const VARIANTS = [
  {
    name: 'HbcSignatureHeroSurface-compact',
    storyId: 'homepage-surfaces-hbcsignatureherosurface--compact-layout',
    widths: [1280],
  },
  {
    name: 'HbcCommandSurface-high-urgency',
    storyId: 'homepage-surfaces-hbccommandsurface--high-urgency',
    widths: [1280],
  },
  {
    name: 'HbcCommandSurface-critical-urgency',
    storyId: 'homepage-surfaces-hbccommandsurface--critical-urgency',
    widths: [1280],
  },
];

for (const surface of SURFACES) {
  for (const width of surface.widths) {
    const label = width >= 1024 ? 'desktop' : 'tablet';
    test(`${surface.name} — ${label} (${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(storyUrl(surface.storyId));
      await page.waitForLoadState('networkidle');
      // Allow animations to settle
      await page.waitForTimeout(800);
      await page.screenshot({
        path: join(EVIDENCE_DIR, `${surface.name}--${label}.png`),
        fullPage: true,
      });
    });
  }
}

for (const variant of VARIANTS) {
  for (const width of variant.widths) {
    test(`${variant.name} (${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(storyUrl(variant.storyId));
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);
      await page.screenshot({
        path: join(EVIDENCE_DIR, `${variant.name}--desktop.png`),
        fullPage: true,
      });
    });
  }
}
