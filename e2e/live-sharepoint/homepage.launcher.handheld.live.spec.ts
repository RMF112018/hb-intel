import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = process.env.HB_HOMEPAGE_LIVE_SITE_URL ?? 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
const REQUIRE_AUTH = process.env.HB_HOMEPAGE_LIVE_REQUIRE_AUTH !== 'false';
const EXPECTED_LAUNCHER_VERSION = '1.1.75.0';
const ARTIFACT_ROOT = path.resolve(
  process.cwd(),
  'docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-03/artifacts/prompt-04-live-sharepoint-handheld-proof',
);

type HostedCase = {
  label: string;
  viewport: { width: number; height: number };
  expectedDeviceClass: 'phone';
  expectedHandheldMode: 'single-entry-all-tools';
  expectedCapGovernance: 'all-tools-drawer';
};

const HOSTED_CASES: readonly HostedCase[] = [
  {
    label: 'phone-portrait-390x844',
    viewport: { width: 390, height: 844 },
    expectedDeviceClass: 'phone',
    expectedHandheldMode: 'single-entry-all-tools',
    expectedCapGovernance: 'all-tools-drawer',
  },
  {
    label: 'phone-portrait-430x992',
    viewport: { width: 430, height: 992 },
    expectedDeviceClass: 'phone',
    expectedHandheldMode: 'single-entry-all-tools',
    expectedCapGovernance: 'all-tools-drawer',
  },
  {
    label: 'short-height-constrained-1300x420',
    viewport: { width: 1300, height: 420 },
    expectedDeviceClass: 'phone',
    expectedHandheldMode: 'single-entry-all-tools',
    expectedCapGovernance: 'all-tools-drawer',
  },
] as const;

test.describe('Homepage launcher handheld proof — live SharePoint', () => {
  for (const viewportCase of HOSTED_CASES) {
    test(viewportCase.label, async ({ page }) => {
      await mkdir(ARTIFACT_ROOT, { recursive: true });
      await page.setViewportSize(viewportCase.viewport);
      await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      const launcherBand = page.locator('[data-hb-homepage-launcher-band="root"]');
      const launcherRoot = page.locator('[data-hbc-ui="homepage-launcher"]');

      if (REQUIRE_AUTH) {
        await expect(launcherBand).toBeVisible({ timeout: 60000 });
        await expect(launcherRoot).toBeVisible({ timeout: 60000 });
      } else {
        const present = await launcherBand.count();
        test.skip(present === 0, 'launcher band did not render on hosted page');
      }

      const markerSnapshot = await page.evaluate(() => {
        const band = document.querySelector('[data-hb-homepage-launcher-band="root"]');
        const launcher = document.querySelector('[data-hbc-ui="homepage-launcher"]');
        return {
          pageUrl: window.location.href,
          band: {
            deviceClass: band?.getAttribute('data-hbc-launcher-device-class') ?? null,
            handheldMode: band?.getAttribute('data-hbc-launcher-handheld-mode') ?? null,
            capGovernance: band?.getAttribute('data-hbc-launcher-cap-governance') ?? null,
          },
          launcher: {
            version: launcher?.getAttribute('data-hbc-homepage-launcher-version') ?? null,
            deviceClass: launcher?.getAttribute('data-hbc-homepage-launcher-device-class') ?? null,
            handheldMode: launcher?.getAttribute('data-hbc-homepage-launcher-handheld-mode') ?? null,
            capGovernance: launcher?.getAttribute('data-hbc-homepage-launcher-cap-governance') ?? null,
          },
        };
      });

      expect(markerSnapshot.launcher.version).toBe(EXPECTED_LAUNCHER_VERSION);
      expect(markerSnapshot.band.deviceClass).toBe(viewportCase.expectedDeviceClass);
      expect(markerSnapshot.launcher.deviceClass).toBe(viewportCase.expectedDeviceClass);
      expect(markerSnapshot.band.handheldMode).toBe(viewportCase.expectedHandheldMode);
      expect(markerSnapshot.launcher.handheldMode).toBe(viewportCase.expectedHandheldMode);
      expect(markerSnapshot.band.capGovernance).toBe(viewportCase.expectedCapGovernance);
      expect(markerSnapshot.launcher.capGovernance).toBe(viewportCase.expectedCapGovernance);

      const trigger = page.getByRole('button', { name: /HB Toolbox/i });
      if (await trigger.count()) {
        await trigger.click();
        const drawer = page.locator('[role="dialog"][data-hbc-homepage-launcher-sheet-content="all-tools"]');
        await expect(drawer).toBeVisible({ timeout: 60000 });
        await expect(
          drawer.locator('[data-hbc-ui="homepage-launcher-drawer-rail"]').first(),
        ).toHaveAttribute('data-hbc-launcher-drawer-layout', 'single-row-tray');
        await page.keyboard.press('Escape');
      }

      const screenshotPath = path.join(ARTIFACT_ROOT, `${viewportCase.label}.png`);
      const markersPath = path.join(ARTIFACT_ROOT, `${viewportCase.label}.markers.json`);

      await page.screenshot({ path: screenshotPath, fullPage: true });
      await writeFile(markersPath, JSON.stringify(markerSnapshot, null, 2), 'utf-8');
    });
  }
});
