/**
 * Shared assertions for HB Kudos public/admin boundary proofs.
 *
 * These helpers enforce matrix rules that every relevant spec must
 * honor so the proof is uniform across the suite.
 */
import { expect, type Page } from '@playwright/test';
import { KUDOS_TESTIDS } from './kudosLocators';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

/** Public detail MUST NOT render audit timeline. */
export async function assertPublicDetailBoundary(page: Page): Promise<void> {
  await expect(page.locator(tid(KUDOS_TESTIDS.publicDetailPanel))).toBeVisible();
  await expect(page.locator(tid(KUDOS_TESTIDS.publicAuditTimeline))).toHaveCount(0);
}

/** Admin detail MUST render audit timeline. */
export async function assertAdminDetailBoundary(page: Page): Promise<void> {
  await expect(page.locator(tid(KUDOS_TESTIDS.companionDetailPanel))).toBeVisible();
  await expect(page.locator(tid(KUDOS_TESTIDS.companionAuditTimeline))).toBeVisible();
}

/** No visible CTA/button/link on the current view may be without a handler. */
export async function assertNoDeadCta(page: Page): Promise<void> {
  const buttons = page.locator('button:visible, a:visible[role="button"]');
  const count = await buttons.count();
  for (let i = 0; i < count; i += 1) {
    const btn = buttons.nth(i);
    const disabled = await btn.getAttribute('aria-disabled');
    const href = await btn.getAttribute('href');
    const hasHandler = (await btn.evaluate((el) => {
      const w = el as unknown as { onclick: unknown };
      return typeof w.onclick === 'function';
    })) || href !== null || disabled === 'true';
    expect(hasHandler, `dead CTA at index ${i}`).toBeTruthy();
  }
}

/** Every mutation path MUST trigger cache invalidation.
 *  Consumers attach a probe via `window.__hbKudosCacheProbe` in the
 *  dev harness; this helper reads the invalidation counter. */
export async function readCacheInvalidationCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const w = window as unknown as { __hbKudosCacheProbe?: { invalidations: number } };
    return w.__hbKudosCacheProbe?.invalidations ?? 0;
  });
}

/** Drift guard: assert the exported workflow enum is exactly 7 states. */
export async function assertWorkflowEnumLocked(page: Page): Promise<void> {
  const states = await page.evaluate(() => {
    const w = window as unknown as { __hbKudosProbe?: { workflowStates: string[] } };
    return w.__hbKudosProbe?.workflowStates ?? [];
  });
  expect(states).toEqual(
    expect.arrayContaining([
      'pending',
      'revisionRequested',
      'approved',
      'approvedScheduled',
      'rejected',
      'withdrawn',
      'removedUnpublished',
    ]),
  );
  expect(states).toHaveLength(7);
}
