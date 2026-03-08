import { test, expect } from '@playwright/test';

test.describe('@hbc/sharepoint-docs — E2E', () => {
  const SCORECARD_URL = '/bd/scorecard/test-scorecard-id';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-ready"]');
  });

  test('D-10: blocks .exe file upload with clear error message', async ({ page }) => {
    await page.goto(SCORECARD_URL);
    await page.click('[data-testid="documents-panel-toggle"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'malware.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('MZ'),
    });
    await expect(page.locator('[data-testid="upload-error"]')).toContainText('File type not allowed');
  });

  test('D-10: shows large file confirmation dialog for 300MB file', async ({ page }) => {
    await page.goto(SCORECARD_URL);
    await page.click('[data-testid="documents-panel-toggle"]');
    const buf = Buffer.alloc(300 * 1024 * 1024);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large-model.rvt',
      mimeType: 'application/octet-stream',
      buffer: buf,
    });
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toContainText('Large file');
    await expect(page.locator('[role="dialog"]')).toContainText('300.0 MB');
  });

  test('D-03: queues file while offline and uploads on reconnect', async ({ page }) => {
    await page.goto(SCORECARD_URL);
    await page.click('[data-testid="documents-panel-toggle"]');

    await page.context().setOffline(true);

    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'offline-doc.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(1024 * 100),
    });

    await expect(page.locator('[data-testid="upload-queue-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-queue-indicator"]')).toContainText('1 file queued');

    await page.context().setOffline(false);

    await expect(page.locator('[data-testid="upload-queue-indicator"]')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="document-list"]')).toContainText('offline-doc.pdf');
  });

  test('D-01: tombstone appears in staging folder after migration', async ({ page }) => {
    await page.goto('/migration/status/test-context-migrated');
    await expect(page.locator('[data-testid="doc-list-item"]')).toContainText('In project site');
    await expect(page.locator('[data-testid="tombstone-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="tombstone-link"]')).toHaveAttribute('href', /project-123/);
  });

  test('D-06: conflict resolution panel shows three resolution buttons', async ({ page }) => {
    await page.goto('/migration/conflicts/test-job-with-conflict');
    await expect(page.locator('[data-testid="conflict-panel"]')).toBeVisible();
    await expect(page.locator('button:has-text("Use staging version")')).toBeVisible();
    await expect(page.locator('button:has-text("Keep project site version")')).toBeVisible();
    await expect(page.locator('button:has-text("Keep both")')).toBeVisible();
  });

  test('D-06: conflict resolves and disappears from panel after PM action', async ({ page }) => {
    await page.goto('/migration/conflicts/test-job-with-conflict');
    await page.click('button:has-text("Keep project site version")');
    await expect(page.locator('[data-testid="conflict-panel"]')).toContainText('All conflicts resolved');
  });

  test('D-09: document panel is not in DOM on page load (lazy-loaded)', async ({ page }) => {
    await page.goto(SCORECARD_URL);
    const networkRequests: string[] = [];
    page.on('request', req => networkRequests.push(req.url()));
    expect(networkRequests.some(url => url.includes('hbc-sharepoint-docs'))).toBe(false);
    await page.click('[data-testid="documents-panel-toggle"]');
    await page.waitForSelector('[data-testid="drop-zone"]');
    expect(networkRequests.some(url => url.includes('hbc-sharepoint-docs'))).toBe(true);
  });

  test('D-04: BD Director can view but not upload to another user\'s BD lead folder', async ({ page }) => {
    await page.goto(`${SCORECARD_URL}?userRole=bd-director`);
    await page.click('[data-testid="documents-panel-toggle"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="drop-zone"]')).not.toBeVisible();
  });
});
