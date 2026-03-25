// D-PH7-BW-10: E2E spec for project-hub webpart
// Stage 11.5: Horizontal scroll prohibition verification
import { test, expect } from '@playwright/test';

test.describe('Project Hub Webpart', () => {
  test('renders without error boundary', async ({ page }) => {
    await page.goto('/?tab=project-hub');
    const content = page.locator('.harness-content');
    await expect(content).not.toBeEmpty();
    await expect(content.locator('[data-error-boundary]')).toHaveCount(0);
  });

  test('shows simplified shell content', async ({ page }) => {
    await page.goto('/?tab=project-hub');
    const content = page.locator('.harness-content');
    await expect(content).not.toBeEmpty();
  });
});

/**
 * Stage 11.5 — Horizontal Scroll Prohibition Verification
 *
 * Verifies that the live routed Project Hub SPFx shell and representative
 * routed surfaces do not produce horizontal overflow at governed breakpoints.
 *
 * Per P3-C1 §14.3 MB-04: Horizontal scrolling is PROHIBITED as a default
 * behavior for data surfaces.
 */
test.describe('Stage 11.5: Horizontal scroll prohibition', () => {
  /**
   * Helper: assert no horizontal overflow on the routed surface container.
   * Checks real DOM overflow (scrollWidth <= clientWidth).
   */
  async function assertNoHorizontalOverflow(
    page: import('@playwright/test').Page,
    selector: string,
  ) {
    const overflow = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { found: false, scrollWidth: 0, clientWidth: 0, overflows: false };
      return {
        found: true,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        overflows: el.scrollWidth > el.clientWidth,
      };
    }, selector);

    expect(overflow.found, `Element ${selector} should exist`).toBe(true);
    expect(
      overflow.overflows,
      `Element ${selector} should not overflow horizontally (scrollWidth: ${overflow.scrollWidth}, clientWidth: ${overflow.clientWidth})`,
    ).toBe(false);
  }

  test.describe('Desktop / Tablet landscape (1024px)', () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test('dashboard/home route has no horizontal overflow at 1024px', async ({ page }) => {
      await page.goto('/?tab=project-hub');
      await page.waitForLoadState('domcontentloaded');
      await assertNoHorizontalOverflow(page, '[data-hbc-shell="shell-content"]');
      await assertNoHorizontalOverflow(page, '#root');
    });

    test('shell layout has no horizontal overflow at 1024px', async ({ page }) => {
      await page.goto('/?tab=project-hub');
      await page.waitForLoadState('domcontentloaded');
      await assertNoHorizontalOverflow(page, '[data-hbc-shell="shell-layout"]');
      await assertNoHorizontalOverflow(page, '[data-hbc-shell="shell-body"]');
    });
  });

  test.describe('Narrow width (<640px)', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('narrow-width dashboard reflows without horizontal scroll', async ({ page }) => {
      await page.goto('/?tab=project-hub');
      await page.waitForLoadState('domcontentloaded');
      await assertNoHorizontalOverflow(page, '[data-hbc-shell="shell-content"]');
      await assertNoHorizontalOverflow(page, '#root');
    });

    test('narrow-width shell layout does not overflow', async ({ page }) => {
      await page.goto('/?tab=project-hub');
      await page.waitForLoadState('domcontentloaded');
      await assertNoHorizontalOverflow(page, '[data-hbc-shell="shell-layout"]');
    });
  });

  test.describe('Tablet portrait (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('tablet portrait dashboard has no horizontal overflow', async ({ page }) => {
      await page.goto('/?tab=project-hub');
      await page.waitForLoadState('domcontentloaded');
      await assertNoHorizontalOverflow(page, '[data-hbc-shell="shell-content"]');
    });
  });
});
