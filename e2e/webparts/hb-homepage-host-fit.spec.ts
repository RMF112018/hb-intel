import { expect, test } from '@playwright/test';

interface HostedCase {
  readonly label: string;
  readonly viewport: { width: number; height: number };
  readonly expectedEntryState: string;
  readonly expectedReason?: string;
}

const HOSTED_CASES: readonly HostedCase[] = [
  {
    label: 'ultrawide-desktop-1920x1080',
    viewport: { width: 1920, height: 1080 },
    expectedEntryState: 'ultrawide-desktop',
    expectedReason: 'width-match',
  },
  {
    label: 'standard-laptop-1512x982',
    viewport: { width: 1512, height: 982 },
    expectedEntryState: 'standard-laptop',
    expectedReason: 'width-match',
  },
  {
    label: 'standard-laptop-1366x1024',
    viewport: { width: 1366, height: 1024 },
    expectedEntryState: 'standard-laptop',
    expectedReason: 'width-match',
  },
  {
    label: 'phone-portrait-430x992',
    viewport: { width: 430, height: 992 },
    expectedEntryState: 'phone-portrait',
    expectedReason: 'width-match',
  },
  {
    label: 'phone-portrait-390x844',
    viewport: { width: 390, height: 844 },
    expectedEntryState: 'phone-portrait',
    expectedReason: 'width-match',
  },
  {
    label: 'short-height-constrained',
    viewport: { width: 1300, height: 420 },
    expectedEntryState: 'phone-landscape',
    expectedReason: 'short-height-override',
  },
] as const;

async function assertNoHorizontalOverflow(
  page: import('@playwright/test').Page,
  selector: string,
): Promise<void> {
  const metrics = await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) {
      return {
        found: false,
        scrollWidth: 0,
        clientWidth: 0,
        overflows: false,
      };
    }
    return {
      found: true,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      overflows: el.scrollWidth > el.clientWidth,
    };
  }, selector);

  expect(metrics.found, `Expected ${selector} to exist`).toBe(true);
  expect(
    metrics.overflows,
    `${selector} overflows (scrollWidth=${metrics.scrollWidth}, clientWidth=${metrics.clientWidth})`,
  ).toBe(false);
}

test.describe('HB Homepage hosted fit proof', () => {
  for (const viewportCase of HOSTED_CASES) {
    test(viewportCase.label, async ({ page }, testInfo) => {
      await page.setViewportSize(viewportCase.viewport);
      await page.goto('/?tab=hb-homepage');

      const wrapperRoot = page.locator('[data-hb-homepage-entry-stack="root"]');
      const shellRoot = page.locator('[data-shell-post-hero="true"]');
      await expect(wrapperRoot).toBeVisible();
      await expect(shellRoot).toBeVisible();

      if (viewportCase.label === 'short-height-constrained') {
        await page.addStyleTag({
          content: `
            [data-shell-post-hero="true"] {
              height: 420px !important;
              overflow: auto !important;
            }
          `,
        });
        await expect(shellRoot).toHaveAttribute(
          'data-shell-entry-state-reason',
          'short-height-override',
        );
      }

      // Core containment + ownership diagnostics (Prompts 01–04)
      await expect(wrapperRoot).toHaveAttribute(
        'data-hb-homepage-outer-envelope-owner',
        'hb-homepage-wrapper',
      );
      await expect(wrapperRoot).toHaveAttribute(
        'data-hb-homepage-outer-envelope-contract',
        'hb-homepage-wrapper-outer-envelope-v1',
      );

      const actionsRegion = page.locator(
        '[data-hb-homepage-entry-stack-region="priority-actions"]',
      );
      const shellRegion = page.locator('[data-hb-homepage-entry-stack-region="shell"]');
      const heroRegion = page.locator('[data-hb-homepage-entry-stack-region="hero"]');
      const heroRoot = page.locator('[data-hbc-premium="signature-hero"]');
      const launcherRoot = page.locator('[data-hb-homepage-launcher-band="root"]');
      const heroRegionCount = await heroRegion.count();
      if (heroRegionCount > 0) {
        await expect(heroRegion).toBeVisible();
      }
      const heroRootCount = await heroRoot.count();
      if (heroRootCount > 0) {
        await expect(heroRoot).toBeVisible();
      }
      const launcherRootCount = await launcherRoot.count();
      if (launcherRootCount > 0) {
        await expect(launcherRoot).toBeVisible();
      }
      await expect(actionsRegion).toHaveAttribute(
        'data-hb-homepage-region-contained-by',
        'hb-homepage-wrapper-outer-envelope-v1',
      );
      await expect(shellRegion).toHaveAttribute(
        'data-hb-homepage-region-contained-by',
        'hb-homepage-wrapper-outer-envelope-v1',
      );

      // Width truth + measurement diagnostics (Prompts 03–06)
      await expect(shellRoot).toHaveAttribute(
        'data-shell-width-source',
        'entry-stack-outer-envelope',
      );
      await expect(shellRoot).toHaveAttribute(
        'data-shell-width-accounting',
        'authoritative-minus-shell-inline-inset',
      );
      await expect(shellRoot).toHaveAttribute('data-shell-entry-state');
      await expect(shellRoot).toHaveAttribute('data-shell-entry-state-reason');
      await expect(shellRoot).toHaveAttribute('data-shell-fit-path');

      const entryState = await shellRoot.getAttribute('data-shell-entry-state');
      expect(entryState).toBe(viewportCase.expectedEntryState);

      if (viewportCase.expectedReason) {
        await expect(shellRoot).toHaveAttribute(
          'data-shell-entry-state-reason',
          viewportCase.expectedReason,
        );
      }

      const widthMetrics = await shellRoot.evaluate((el) => ({
        usable: Number(el.getAttribute('data-shell-width')),
        authoritative: Number(el.getAttribute('data-shell-width-authoritative')),
        insetTotal: Number(el.getAttribute('data-shell-width-inline-inset-total')),
      }));
      expect(widthMetrics.usable).toBeGreaterThan(0);
      expect(widthMetrics.authoritative).toBeGreaterThanOrEqual(widthMetrics.usable);
      expect(widthMetrics.insetTotal).toBeGreaterThanOrEqual(0);

      const alignmentProof = await page.evaluate(() => {
        const wrapper = document.querySelector('[data-hb-homepage-entry-stack="root"]');
        const hero = document.querySelector('[data-hbc-premium="signature-hero"]');
        const launcher = document.querySelector('[data-hb-homepage-launcher-band="root"]');
        const shell = document.querySelector('[data-shell-post-hero="true"]');
        return {
          wrapperState: wrapper?.getAttribute('data-hb-homepage-entry-state'),
          wrapperReason: wrapper?.getAttribute('data-hb-homepage-entry-state-reason'),
          heroState: hero?.getAttribute('data-hbc-hero-entry-state'),
          heroReason: hero?.getAttribute('data-hbc-hero-entry-reason'),
          launcherState: launcher?.getAttribute('data-hbc-launcher-shell-state'),
          launcherReason: launcher?.getAttribute('data-hbc-launcher-entry-reason'),
          shellState: shell?.getAttribute('data-shell-entry-state'),
          shellReason: shell?.getAttribute('data-shell-entry-state-reason'),
        };
      });
      if (alignmentProof.wrapperState) {
        expect(alignmentProof.wrapperState).toBe(alignmentProof.shellState);
      }
      if (alignmentProof.launcherState) {
        expect(alignmentProof.launcherState).toBe(alignmentProof.shellState);
      }
      if (alignmentProof.wrapperReason) {
        expect(alignmentProof.wrapperReason).toBe(alignmentProof.shellReason);
      }
      if (alignmentProof.launcherReason) {
        expect(alignmentProof.launcherReason).toBe(alignmentProof.shellReason);
      }
      if (alignmentProof.heroState) {
        expect(alignmentProof.heroState).toBe(alignmentProof.shellState);
      }
      if (alignmentProof.heroReason) {
        expect(alignmentProof.heroReason).toBe(alignmentProof.shellReason);
      }

      const regionOrder = await page
        .locator('[data-hb-homepage-entry-stack-region]')
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            region: node.getAttribute('data-hb-homepage-entry-stack-region'),
            order: node.getAttribute('data-hb-homepage-entry-stack-order'),
          })),
        );
      if (regionOrder.some((r) => r.region === 'hero')) {
        expect(regionOrder).toEqual([
          { region: 'hero', order: '1' },
          { region: 'priority-actions', order: '2' },
          { region: 'shell', order: '3' },
        ]);
      } else {
        expect(regionOrder).toEqual([
          { region: 'priority-actions', order: '1' },
          { region: 'shell', order: '2' },
        ]);
      }

      const oneHeroProof = await page.evaluate(() => ({
        heroCount: document.querySelectorAll('[data-hbc-premium="signature-hero"]').length,
        wrapperHeroCount: document.querySelectorAll(
          '[data-hb-homepage-entry-stack-region="hero"][data-hb-homepage-entry-stack-hero-authority="shared-entry-state"]',
        ).length,
        duplicateGuardCount: document.querySelectorAll(
          '[data-hb-signature-hero-duplicate-guard="suppressed-standalone-homepage"]',
        ).length,
      }));
      expect(oneHeroProof.heroCount).toBeLessThanOrEqual(1);
      expect(oneHeroProof.wrapperHeroCount).toBeLessThanOrEqual(1);
      expect(oneHeroProof.duplicateGuardCount).toBe(0);

      await assertNoHorizontalOverflow(page, '[data-hb-homepage-entry-stack="root"]');
      if (heroRegionCount > 0) {
        await assertNoHorizontalOverflow(page, '[data-hb-homepage-entry-stack-region="hero"]');
      }
      await assertNoHorizontalOverflow(
        page,
        '[data-hb-homepage-entry-stack-region="priority-actions"]',
      );
      await assertNoHorizontalOverflow(page, '[data-shell-post-hero="true"]');
      await assertNoHorizontalOverflow(page, '.harness-content');
      await assertNoHorizontalOverflow(page, '#root');

      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach(`hb-homepage-${viewportCase.label}`, {
        body: screenshot,
        contentType: 'image/png',
      });
    });
  }
});
