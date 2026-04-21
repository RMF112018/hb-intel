import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type CaptureCase = {
  label: string;
  viewport: { width: number; height: number };
};

const CAPTURE_CASES: readonly CaptureCase[] = [
  { label: 'standard-laptop-1512x982', viewport: { width: 1512, height: 982 } },
  { label: 'tablet-landscape-1024x900', viewport: { width: 1024, height: 900 } },
  { label: 'ultrawide-desktop-1920x1080', viewport: { width: 1920, height: 1080 } },
] as const;

const PHASE = process.env.HB_PRODUCTIZATION_CAPTURE_PHASE ?? 'before';
const ARTIFACT_ROOT = path.resolve(
  process.cwd(),
  'docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-02/artifacts/prompt-02-desktop-tablet-productization',
  PHASE,
);

test.describe('HB Homepage launcher productization capture', () => {
  for (const captureCase of CAPTURE_CASES) {
    test(captureCase.label, async ({ page }) => {
      await mkdir(ARTIFACT_ROOT, { recursive: true });
      await page.setViewportSize(captureCase.viewport);
      await page.goto('/?tab=hb-homepage');

      const launcherRoot = page.locator('[data-hb-homepage-launcher-band="root"]');
      const launcherPresent = (await launcherRoot.count()) > 0;
      if (launcherPresent) {
        await expect(launcherRoot).toBeVisible();
      }

      const markers = await page.evaluate(() => {
        const band = document.querySelector('[data-hb-homepage-launcher-band="root"]');
        const shell = document.querySelector('[data-hb-homepage-launcher-band-shell="root"]');
        const launcher = document.querySelector('[data-hbc-ui="homepage-launcher"]');
        const shellStyle = shell ? window.getComputedStyle(shell) : null;
        return {
          launcherPresent: Boolean(launcher),
          bandDeviceClass: band?.getAttribute('data-hbc-launcher-device-class') ?? null,
          bandHandheldMode: band?.getAttribute('data-hbc-launcher-handheld-mode') ?? null,
          bandCapGovernance: band?.getAttribute('data-hbc-launcher-cap-governance') ?? null,
          launcherDeviceClass:
            launcher?.getAttribute('data-hbc-homepage-launcher-device-class') ?? null,
          launcherVersion: launcher?.getAttribute('data-hbc-homepage-launcher-version') ?? null,
          shellComputed: shellStyle
            ? {
                paddingTop: shellStyle.paddingTop,
                paddingInlineStart: shellStyle.paddingInlineStart,
                borderRadius: shellStyle.borderRadius,
                boxShadow: shellStyle.boxShadow,
                backgroundImage: shellStyle.backgroundImage,
              }
            : null,
        };
      });

      const closedPath = path.join(ARTIFACT_ROOT, `${captureCase.label}.png`);
      await page.screenshot({ path: closedPath, fullPage: true });

      const moreToolsTrigger = page.getByRole('button', { name: /More tools/i });
      if (await moreToolsTrigger.count()) {
        await moreToolsTrigger.first().click();
        await expect(
          page.locator('[data-hbc-homepage-launcher-sheet-content="all-tools"]'),
        ).toBeVisible();
        const openPath = path.join(ARTIFACT_ROOT, `${captureCase.label}.opened-drawer.png`);
        await page.screenshot({ path: openPath, fullPage: true });
      }

      const markersPath = path.join(ARTIFACT_ROOT, `${captureCase.label}.markers.json`);
      await writeFile(markersPath, JSON.stringify(markers, null, 2), 'utf-8');
    });
  }
});
