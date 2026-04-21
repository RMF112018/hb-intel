import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const EXPECTED_LAUNCHER_VERSION = '1.1.64.0';
const ARTIFACT_ROOT = path.resolve(
  process.cwd(),
  'docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-01/artifacts/prompt-03-hosted-proof',
);

type ProofCase = {
  label: string;
  viewport: { width: number; height: number };
  forceShortHeight?: boolean;
};

const PROOF_CASES: readonly ProofCase[] = [
  { label: 'phone-portrait-390x844', viewport: { width: 390, height: 844 } },
  { label: 'phone-portrait-430x992', viewport: { width: 430, height: 992 } },
  {
    label: 'short-height-constrained-1300x420',
    viewport: { width: 1300, height: 420 },
    forceShortHeight: true,
  },
] as const;

test.describe('HB Homepage handheld closure proof', () => {
  for (const proofCase of PROOF_CASES) {
    test(proofCase.label, async ({ page }) => {
      await mkdir(ARTIFACT_ROOT, { recursive: true });
      await page.setViewportSize(proofCase.viewport);
      await page.goto('/?tab=hb-homepage');

      if (proofCase.forceShortHeight) {
        await page.addStyleTag({
          content: `
            [data-shell-post-hero="true"] {
              height: 420px !important;
              overflow: auto !important;
            }
          `,
        });
      }

      await expect(page.locator('[data-hb-homepage-entry-stack="root"]')).toBeVisible();

      const markerSnapshot = await page.evaluate(() => {
        const band = document.querySelector('[data-hb-homepage-launcher-band="root"]');
        const launcher = document.querySelector('[data-hbc-ui="homepage-launcher"]');
        return {
          pageUrl: window.location.href,
          observed: {
            launcherBandPresent: Boolean(band),
            launcherSurfacePresent: Boolean(launcher),
          },
          band: {
            shellState: band?.getAttribute('data-hbc-launcher-shell-state') ?? null,
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
      const trigger = page.getByRole('button', { name: /HB Toolbox/i });
      if (await trigger.count()) {
        await trigger.click();
        await expect(
          page.locator('[role="dialog"][data-hbc-homepage-launcher-sheet-content="all-tools"]'),
        ).toBeVisible();
        await page.keyboard.press('Escape');
      }

      const screenshotPath = path.join(ARTIFACT_ROOT, `${proofCase.label}.png`);
      const markerPath = path.join(ARTIFACT_ROOT, `${proofCase.label}.markers.json`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await writeFile(markerPath, JSON.stringify(markerSnapshot, null, 2), 'utf-8');

      expect(markerSnapshot.observed.launcherBandPresent).toBe(true);
      expect(markerSnapshot.observed.launcherSurfacePresent).toBe(true);
      expect(markerSnapshot.launcher.version).toBe(EXPECTED_LAUNCHER_VERSION);
    });
  }
});
