/**
 * Project Canvas E2E tests — D-SF13-T08
 *
 * Playwright stub pending dev-harness integration.
 * These tests require the dev-harness to be running with mock API endpoints.
 */
import { test, expect } from '@playwright/test';

test.describe('Project Canvas E2E', () => {
  // TODO: Configure baseURL from dev-harness once integrated
  const BASE_URL = 'http://localhost:3000';

  test('canvas loads and displays grid', async ({ page }) => {
    // Stub — requires dev-harness with canvas route
    await page.goto(`${BASE_URL}/canvas`);
    const canvas = page.getByTestId('hbc-project-canvas');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('data-state', 'ready');
  });

  test('editor opens when edit button clicked', async ({ page }) => {
    // Stub — requires dev-harness with editable canvas route
    await page.goto(`${BASE_URL}/canvas?editable=true`);
    const editButton = page.getByTestId('canvas-edit-button');
    await editButton.click();
    await expect(page.getByTestId('canvas-editor-active')).toBeVisible();
  });

  test('tile catalog displays available tiles', async ({ page }) => {
    // Stub — requires dev-harness with editor active
    await page.goto(`${BASE_URL}/canvas?editable=true`);
    await page.getByTestId('canvas-edit-button').click();
    await page.getByTestId('editor-add-tile-button').click();
    await expect(page.getByTestId('hbc-tile-catalog')).toBeVisible();
  });
});
