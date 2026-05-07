import { expect, test } from '@playwright/test';
import { checkPccLiveEnv, skipIfMissingPccLiveEnv } from './pcc-live.env';

const PCC_ROOT_MARKERS = [
  '[data-pcc-bento-grid]',
  '[data-pcc-card]',
  '[data-pcc-horizontal-tabs]',
  '[data-pcc-tab-id]',
  '[data-pcc-active-surface-panel]',
] as const;

test('PCC live environment is configured or self-skips clearly', () => {
  const check = checkPccLiveEnv();
  if (check.status !== 'ready') {
    test.skip(true, check.message);
  }

  expect(check.status).toBe('ready');
  expect(check.env).toBeDefined();
  expect(check.env?.expectedPackageVersion).not.toHaveLength(0);
});

test('PCC hosted page loads with Project Control Center root markers', async ({ page }) => {
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(env.pageUrl, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(new RegExp('^https://'));

  const markerCounts = await Promise.all(
    PCC_ROOT_MARKERS.map(async (selector) => ({
      selector,
      count: await page.locator(selector).count(),
    })),
  );

  const totalMarkers = markerCounts.reduce((sum, m) => sum + m.count, 0);

  expect(
    totalMarkers,
    [
      `No PCC data markers found on page: ${env.pageUrl}`,
      'Set PCC_LIVE_PAGE_URL to the exact SharePoint page hosting the PCC web part.',
      `Markers checked: ${PCC_ROOT_MARKERS.join(', ')}`,
      `Expected package version (operator-supplied): ${env.expectedPackageVersion}`,
      `Console errors observed: ${consoleErrors.length}`,
      `Page errors observed: ${pageErrors.length}`,
    ].join('\n'),
  ).toBeGreaterThan(0);
});

test('PCC navigation/tab markers are present when hosted web part is installed', async ({
  page,
}) => {
  const check = skipIfMissingPccLiveEnv(test);
  const env = check.env!;

  await page.goto(env.pageUrl, { waitUntil: 'domcontentloaded' });

  const tabs = page.locator('[data-pcc-tab-id]');
  const tabCount = await tabs.count();

  if (tabCount === 0) {
    test.skip(
      true,
      `No [data-pcc-tab-id] markers found at ${env.pageUrl}. PCC may not be installed on this page.`,
    );
  }

  const horizontalTablists = page.locator('[data-pcc-horizontal-tabs]');
  await expect(horizontalTablists.first()).toBeVisible();

  const firstTab = tabs.first();
  await expect(firstTab).toHaveAttribute('role', 'tab');

  const tabIds = await tabs.evaluateAll((nodes) =>
    nodes
      .map((node) => node.getAttribute('data-pcc-tab-id'))
      .filter((value): value is string => Boolean(value && value.length > 0)),
  );

  expect(tabIds.length).toBeGreaterThan(0);
});
