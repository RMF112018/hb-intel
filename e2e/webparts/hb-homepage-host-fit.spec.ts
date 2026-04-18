import { expect, test } from '@playwright/test';

interface HostedCase {
  readonly label: string;
  readonly viewport: { width: number; height: number };
  readonly expectedEntryState: string | RegExp;
  readonly expectedReason?: string;
}

const HOSTED_CASES: readonly HostedCase[] = [
  {
    label: 'standard-laptop-baseline',
    viewport: { width: 1440, height: 900 },
    expectedEntryState: /standard-laptop|ultrawide-desktop/,
    expectedReason: 'width-match',
  },
  {
    label: 'ultrawide-desktop',
    viewport: { width: 1920, height: 1080 },
    expectedEntryState: /ultrawide-desktop|standard-laptop/,
    expectedReason: 'width-match',
  },
  {
    label: 'tablet-landscape',
    viewport: { width: 1024, height: 768 },
    expectedEntryState: /tablet-landscape|tablet-portrait-large/,
    expectedReason: 'width-match',
  },
  {
    label: 'tablet-portrait',
    viewport: { width: 820, height: 1180 },
    expectedEntryState: /tablet-portrait-large|tablet-portrait/,
    expectedReason: 'width-match',
  },
  {
    label: 'phone-portrait',
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
      if (typeof viewportCase.expectedEntryState === 'string') {
        expect(entryState).toBe(viewportCase.expectedEntryState);
      } else {
        expect(entryState ?? '').toMatch(viewportCase.expectedEntryState);
      }

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

      await assertNoHorizontalOverflow(page, '[data-hb-homepage-entry-stack="root"]');
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
