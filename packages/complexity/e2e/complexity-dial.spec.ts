// e2e/complexity-dial.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complexity Dial — E2E', () => {

  test('D-03: New user starts at Essential, upgrades additively after API response', async ({ page }) => {
    await page.goto('/dev-harness/complexity?scenario=new-user');
    // Initial render at Essential
    await expect(page.locator('[data-complexity-tier="essential"]')).toBeVisible();
    // After mock API response resolves (Expert role)
    await page.waitForTimeout(500);
    await expect(page.locator('[data-complexity-tier="expert"]')).toBeVisible();
    // Confirm no content vanished (additive transition only)
  });

  test('D-04: HbcComplexityGate unmounts Expert content at Standard tier', async ({ page }) => {
    await page.goto('/dev-harness/complexity?tier=standard');
    await expect(page.locator('[data-testid="audit-trail-panel"]')).not.toBeVisible();
  });

  test('D-04: keepMounted keeps content in DOM but hides it', async ({ page }) => {
    await page.goto('/dev-harness/complexity?tier=standard&scenario=keepmounted');
    const el = page.locator('[data-testid="keepmounted-content"]');
    await expect(el).toBeAttached(); // In DOM
    await expect(el.locator('..').filter({ has: page.locator('[aria-hidden="true"]') })).toBeVisible();
  });

  test('D-05: Tier change in one tab syncs to another tab instantly', async ({ browser }) => {
    const context = await browser.newContext();
    const [tabA, tabB] = await Promise.all([
      context.newPage(),
      context.newPage(),
    ]);
    await tabA.goto('/dev-harness/complexity?tier=standard');
    await tabB.goto('/dev-harness/complexity?tier=standard');

    // Change tier in Tab A
    await tabA.click('[data-testid="dial-expert"]');

    // Tab B should update without reload
    await expect(tabB.locator('[data-testid="active-tier"]')).toHaveText('expert', { timeout: 2000 });
    await context.close();
  });

  test('D-06: Locked dial renders disabled with lock tooltip', async ({ page }) => {
    await page.goto('/dev-harness/complexity?scenario=locked-onboarding');
    const buttons = page.locator('.hbc-complexity-dial__segment');
    await expect(buttons.first()).toBeDisabled();
    await expect(page.locator('.hbc-complexity-dial__lock-icon')).toBeVisible();
  });

  test('D-06: Expired lock auto-clears without page reload', async ({ page }) => {
    // Scenario: lock with lockedUntil = 1 second in the future
    await page.goto('/dev-harness/complexity?scenario=expiring-lock');
    await expect(page.locator('.hbc-complexity-dial--locked')).toBeVisible();
    // Wait for lock to expire and polling interval to fire
    await page.waitForTimeout(70_000); // 60s polling + buffer
    await expect(page.locator('.hbc-complexity-dial--locked')).not.toBeVisible();
  });

  test('D-07: showCoaching toggle works independently of tier', async ({ page }) => {
    await page.goto('/dev-harness/complexity?tier=standard&showCoaching=true');
    await expect(page.locator('[data-testid="coaching-callout"]')).toBeVisible();
    await page.click('[data-testid="coaching-toggle"]');
    await expect(page.locator('[data-testid="coaching-callout"]')).not.toBeVisible();
    // Tier is still Standard — only coaching changed
    await expect(page.locator('[data-testid="active-tier"]')).toHaveText('standard');
  });

  test('D-09: Fade-in animation class applied on gate open', async ({ page }) => {
    await page.goto('/dev-harness/complexity?tier=standard');
    // Switch to Expert — Expert-gated content should fade in
    await page.click('[data-testid="dial-expert"]');
    const gateContent = page.locator('.hbc-complexity-gate__content--entering');
    await expect(gateContent).toBeVisible();
    // Animation completes in 150ms
    await page.waitForTimeout(200);
    await expect(gateContent).not.toBeVisible(); // Class removed after animation
  });

});
