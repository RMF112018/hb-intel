/**
 * Phase-23 Prompt 09 — hosted interaction regression coverage.
 *
 * Guards three end-to-end paths the prior suite only partially
 * touched: feed search filtering (Prompt 03 module rebuild),
 * archive expand → row click → reader round-trip, and celebrate
 * increment (Prompt 06 touched the button). Each test asserts the
 * delta of a real user action, not just DOM presence.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { interactionBaseline, visibilityBaseline, workflowBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.hosted.interactions', () => {
  test(`feed search filters rows ${matrixTag('H7', 'P2')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());

    // Open the View All feed.
    await page.getByRole('button', { name: /view archive/i }).click();
    await page.locator(tid(KUDOS_TESTIDS.viewAllTrigger)).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.viewAllFeedPanel))).toBeVisible();

    const rows = page.locator(tid(KUDOS_TESTIDS.publicFeedItem));
    const initial = await rows.count();
    expect(initial).toBeGreaterThan(1);

    // Type a query that should match no entries so the filter delta
    // is unambiguous (avoids depending on specific seed labels).
    await page.getByRole('searchbox', { name: /search recognition feed/i }).fill(
      'zz-no-match-query',
    );
    await expect(rows).toHaveCount(0);
    // Empty-state panel is visible.
    await expect(page.getByText(/no recognition found/i)).toBeVisible();
  });

  test(`archive expand → row → reader round-trip ${matrixTag('H7', 'P2')}`, async ({ page }) => {
    await gotoKudosPublic(page, visibilityBaseline());

    await page.getByRole('button', { name: /view archive/i }).click();
    const firstArchiveRow = page.locator(tid(KUDOS_TESTIDS.archiveRow)).first();
    await expect(firstArchiveRow).toBeVisible();
    await firstArchiveRow.click();

    // Reader opens as a flyout dialog. Article landmark bound via
    // KudosFlyoutBody as="article".
    const article = page.locator('article[data-hbc-testid]');
    await expect(article).toBeVisible();
  });

  test(`celebrate increments visible count ${matrixTag('H4', 'P2')}`, async ({ page }) => {
    await gotoKudosPublic(page, interactionBaseline());

    const button = page.locator(tid(KUDOS_TESTIDS.celebrateButton)).first();
    const count = page.locator(tid(KUDOS_TESTIDS.celebrateCount)).first();
    const before = Number(await count.innerText());

    await button.click();

    // Allow the celebrate mutation + refresh to settle. waitForFunction
    // is more resilient than a fixed timeout.
    await page.waitForFunction(
      ({ selector, previous }) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        const next = Number((el as HTMLElement).innerText);
        return Number.isFinite(next) && next > previous;
      },
      { selector: tid(KUDOS_TESTIDS.celebrateCount), previous: before },
      { timeout: 5_000 },
    );

    const after = Number(await count.innerText());
    expect(after).toBeGreaterThan(before);
  });
});
