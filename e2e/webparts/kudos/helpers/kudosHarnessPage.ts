/**
 * Entry-point helpers for reaching the Kudos public and companion
 * surfaces inside the dev harness.
 *
 * The dev harness exposes Kudos routes under `?tab=kudos` (public) and
 * `?tab=kudos-companion` (admin). The Kudos tab hook `seedKudos()` is
 * attached to `window.__hbKudosSeed` in harness preview builds so the
 * suite can inject deterministic baselines before the surface mounts.
 *
 * If the harness Kudos tab is not yet wired (see 10-Harness-Architecture
 * §Prerequisites), these helpers will fail fast with a clear message so
 * the failure is not mistaken for a product regression.
 */
import { expect, type Page } from '@playwright/test';
import type { SeededAuditEvent, SeededKudosItem } from './kudosSeed';

export interface SeedPayload {
  items: SeededKudosItem[];
  audits?: SeededAuditEvent[];
  currentUserId?: string;
  currentUserRole?: 'public' | 'reviewer' | 'admin';
}

async function waitForHarnessSeedHook(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __hbKudosSeed?: unknown };
      return typeof w.__hbKudosSeed === 'function';
    },
    undefined,
    { timeout: 10_000 },
  );
}

export async function gotoKudosPublic(page: Page, seed: SeedPayload): Promise<void> {
  await page.goto('/?tab=kudos');
  await waitForHarnessSeedHook(page);
  await page.evaluate((payload) => {
    const w = window as unknown as { __hbKudosSeed: (p: unknown) => void };
    w.__hbKudosSeed(payload);
  }, seed);
  await expect(page.locator('[data-hbc-testid="hb-kudos-public-root"]')).toBeVisible();
}

export async function gotoKudosCompanion(page: Page, seed: SeedPayload): Promise<void> {
  await page.goto('/?tab=kudos-companion');
  await waitForHarnessSeedHook(page);
  await page.evaluate((payload) => {
    const w = window as unknown as { __hbKudosSeed: (p: unknown) => void };
    w.__hbKudosSeed(payload);
  }, seed);
  await expect(page.locator('[data-hbc-testid="hb-kudos-companion-root"]')).toBeVisible();
}
