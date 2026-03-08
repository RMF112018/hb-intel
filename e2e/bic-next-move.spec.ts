import { test, expect } from '@playwright/test';

test.describe('BIC Next Move — E2E', () => {

  test('D-04: Unassigned item renders amber warning badge and appears at top of My Work Feed', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=unassigned');
    await expect(page.locator('.hbc-bic-badge--unassigned')).toBeVisible();
    await expect(page.locator('.hbc-my-work-feed__item').first()).toContainText('Unassigned');
  });

  test('D-05: Essential variant hides urgency dot and action text', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=watch&variant=essential');
    await expect(page.locator('.hbc-bic-badge__dot')).not.toBeVisible();
    await expect(page.locator('.hbc-bic-badge__action')).not.toBeVisible();
  });

  test('D-05: Expert variant shows full chain in HbcBicDetail', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=with-full-chain&variant=expert');
    await expect(page.locator('.hbc-bic-detail__chain')).toBeVisible();
    await expect(page.locator('.hbc-bic-chain-node--from')).toBeVisible();
    await expect(page.locator('.hbc-bic-chain-node--to')).toBeVisible();
  });

  test('D-08: Transfer history collapsible renders in Expert mode', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=with-full-chain&variant=expert');
    await expect(page.locator('.hbc-bic-detail__history-toggle')).toBeVisible();
    await page.click('.hbc-bic-detail__history-toggle');
    await expect(page.locator('.hbc-bic-detail__history-list')).toBeVisible();
    await expect(page.locator('.hbc-bic-transfer-row')).toHaveCount(2);
  });

  test('D-09: onNavigate callback fires instead of full page reload', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=blocked-with-link');
    const navigationLog: string[] = [];
    await page.exposeFunction('__bicNavLog', (href: string) => navigationLog.push(href));
    await page.click('.hbc-bic-blocked-banner__link--spa');
    expect(navigationLog).toHaveLength(1);
    expect(navigationLog[0]).toMatch(/^\/\w/); // relative path
  });

  test('D-09: Plain anchor renders when onNavigate absent (SPFx context)', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=blocked-with-link&context=spfx');
    await expect(page.locator('.hbc-bic-blocked-banner__link--anchor')).toBeVisible();
    await expect(page.locator('.hbc-bic-blocked-banner__link--spa')).not.toBeVisible();
  });

  test('D-03: Transfer notification fires once on ownership change (dedup)', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=transfer-dedup-test');
    const notificationEvents = await page.evaluate(() =>
      (window as any).__bicTransferEventCount ?? 0
    );
    expect(notificationEvents).toBe(1); // Not 2, despite dual detection paths
  });

  test('D-06: Partial results warning shown when a module fails to load', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=module-failure');
    await expect(page.locator('.hbc-my-work-feed__partial-warning')).toBeVisible();
    await expect(page.locator('.hbc-my-work-feed__partial-warning')).toContainText('Some items could not be loaded');
  });

});
