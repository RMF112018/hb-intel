import { expect, type Page } from '@playwright/test';

/**
 * Phase 4b.16 shared assertion helper for domain smoke specs.
 *
 * Ensures each domain route renders through WorkspacePageShell and exposes
 * stable shell framing semantics without relying on brittle CSS selectors.
 */
export async function assertWorkspacePageShellRoute(
  page: Page,
  route: string,
  heading: string,
): Promise<void> {
  await page.goto(route);

  await expect(page.locator('[data-hbc-ui="workspace-page-shell"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('[data-error-boundary]')).toHaveCount(0);
}

export function isPwaProject(baseURL?: string): boolean {
  return baseURL?.includes('localhost:4000') ?? false;
}

