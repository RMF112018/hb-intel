import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Keep in lockstep with packages/ui-kit/src/HbcHomepageLauncher/constants.ts
const EXPECTED_LAUNCHER_VERSION = '1.1.64.0';

interface HostedCase {
  readonly label: string;
  readonly viewport: { width: number; height: number };
  readonly expectedEntryState: string;
  readonly expectedLauncherDeviceClass: string;
  readonly expectedHandheldMode: 'standard' | 'single-entry-all-tools';
  readonly expectedCapGovernance: 'binding-visible-cap' | 'all-tools-drawer';
  readonly expectedOverflowMode: 'sheet' | 'more-tools';
  readonly expectedReason?: string;
}

function isHandheldViewport(label: string): boolean {
  return label.includes('phone-portrait') || label === 'short-height-constrained';
}

const HOSTED_CASES: readonly HostedCase[] = [
  {
    label: 'ultrawide-desktop-1920x1080',
    viewport: { width: 1920, height: 1080 },
    expectedEntryState: 'ultrawide-desktop',
    expectedLauncherDeviceClass: 'ultrawide',
    expectedHandheldMode: 'standard',
    expectedCapGovernance: 'binding-visible-cap',
    expectedOverflowMode: 'more-tools',
    expectedReason: 'width-match',
  },
  {
    label: 'standard-laptop-1512x982',
    viewport: { width: 1512, height: 982 },
    expectedEntryState: 'standard-laptop',
    expectedLauncherDeviceClass: 'desktop',
    expectedHandheldMode: 'standard',
    expectedCapGovernance: 'binding-visible-cap',
    expectedOverflowMode: 'more-tools',
    expectedReason: 'width-match',
  },
  {
    label: 'standard-laptop-1366x1024',
    viewport: { width: 1366, height: 1024 },
    expectedEntryState: 'standard-laptop',
    expectedLauncherDeviceClass: 'desktop',
    expectedHandheldMode: 'standard',
    expectedCapGovernance: 'binding-visible-cap',
    expectedOverflowMode: 'more-tools',
    expectedReason: 'width-match',
  },
  {
    label: 'tablet-landscape-1024x900',
    viewport: { width: 1024, height: 900 },
    expectedEntryState: 'tablet-landscape',
    expectedLauncherDeviceClass: 'tablet-landscape',
    expectedHandheldMode: 'standard',
    expectedCapGovernance: 'binding-visible-cap',
    expectedOverflowMode: 'more-tools',
    expectedReason: 'width-match',
  },
  {
    label: 'tablet-portrait-900x1024',
    viewport: { width: 900, height: 1024 },
    expectedEntryState: 'tablet-portrait-large',
    expectedLauncherDeviceClass: 'tablet-portrait',
    expectedHandheldMode: 'standard',
    expectedCapGovernance: 'binding-visible-cap',
    expectedOverflowMode: 'more-tools',
    expectedReason: 'width-match',
  },
  {
    label: 'phone-portrait-430x992',
    viewport: { width: 430, height: 992 },
    expectedEntryState: 'phone-portrait',
    expectedLauncherDeviceClass: 'phone',
    expectedHandheldMode: 'single-entry-all-tools',
    expectedCapGovernance: 'all-tools-drawer',
    expectedOverflowMode: 'sheet',
    expectedReason: 'width-match',
  },
  {
    label: 'phone-portrait-390x844',
    viewport: { width: 390, height: 844 },
    expectedEntryState: 'phone-portrait',
    expectedLauncherDeviceClass: 'phone',
    expectedHandheldMode: 'single-entry-all-tools',
    expectedCapGovernance: 'all-tools-drawer',
    expectedOverflowMode: 'sheet',
    expectedReason: 'width-match',
  },
  {
    label: 'short-height-constrained',
    viewport: { width: 1300, height: 420 },
    expectedEntryState: 'phone-landscape',
    expectedLauncherDeviceClass: 'phone',
    expectedHandheldMode: 'single-entry-all-tools',
    expectedCapGovernance: 'all-tools-drawer',
    expectedOverflowMode: 'sheet',
    expectedReason: 'short-height-override',
  },
] as const;

const CAPTURE_PHASE = process.env.HB_FINAL_PROOF_CAPTURE_PHASE ?? 'final';
const CAPTURE_ROOT = CAPTURE_PHASE
  ? path.resolve(
      process.cwd(),
      'docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-03/artifacts/prompt-03-final-hosted-proof-matrix',
      CAPTURE_PHASE,
    )
  : undefined;

async function assertNoHorizontalOverflow(
  page: import('@playwright/test').Page,
  selector: string,
): Promise<void> {
  const metrics = await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) {
      return {
        found: false,
        scrollWidth: 0,
        clientWidth: 0,
        overflows: false,
      };
    }
    return {
      found: true,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      overflows: el.scrollWidth > el.clientWidth,
    };
  }, selector);

  expect(metrics.found, `Expected ${selector} to exist`).toBe(true);
  expect(
    metrics.overflows,
    `${selector} overflows (scrollWidth=${metrics.scrollWidth}, clientWidth=${metrics.clientWidth})`,
  ).toBe(false);
}

test.describe('HB Homepage hosted fit proof', () => {
  for (const viewportCase of HOSTED_CASES) {
    test(viewportCase.label, async ({ page }, testInfo) => {
      await page.setViewportSize(viewportCase.viewport);
      await page.goto('/?tab=hb-homepage');

      const wrapperRoot = page.locator('[data-hb-homepage-entry-stack="root"]');
      const shellRoot = page.locator('[data-shell-post-hero="true"]');
      await expect(wrapperRoot).toBeVisible();
      await expect(shellRoot).toBeVisible();

      if (viewportCase.label === 'short-height-constrained') {
        await page.addStyleTag({
          content: `
            [data-shell-post-hero="true"] {
              height: 420px !important;
              overflow: auto !important;
            }
          `,
        });
        await expect(shellRoot).toHaveAttribute(
          'data-shell-entry-state-reason',
          'short-height-override',
        );
      }

      // Core containment + ownership diagnostics (Prompts 01–04)
      await expect(wrapperRoot).toHaveAttribute(
        'data-hb-homepage-outer-envelope-owner',
        'hb-homepage-wrapper',
      );
      await expect(wrapperRoot).toHaveAttribute(
        'data-hb-homepage-outer-envelope-contract',
        'hb-homepage-wrapper-outer-envelope-v1',
      );

      const actionsRegion = page.locator(
        '[data-hb-homepage-entry-stack-region="priority-actions"]',
      );
      const shellRegion = page.locator('[data-hb-homepage-entry-stack-region="shell"]');
      const heroRegion = page.locator('[data-hb-homepage-entry-stack-region="hero"]');
      const heroRoot = page.locator('[data-hbc-premium="signature-hero"]');
      const launcherRoot = page.locator('[data-hb-homepage-launcher-band="root"]');
      const launcherShell = page.locator('[data-hb-homepage-launcher-band-shell="root"]');
      const launcherSurface = page.locator('[data-hbc-ui="homepage-launcher"]');
      const heroRegionCount = await heroRegion.count();
      const heroRootCount = await heroRoot.count();
      await expect(launcherRoot).toBeVisible();
      await expect(launcherShell).toBeVisible();
      await expect(launcherSurface).toHaveAttribute('data-hbc-homepage-launcher-row-primitive', 'tile-family');
      await expect(launcherSurface).toHaveAttribute(
        'data-hbc-homepage-launcher-surface-grammar',
        'flagship-utility-v1',
      );
      await expect(launcherRoot).toHaveAttribute('data-hbc-launcher-handheld-mode');
      await expect(launcherRoot).toHaveAttribute('data-hbc-launcher-drawer-source');
      await expect(launcherRoot).toHaveAttribute(
        'data-hbc-launcher-cap-governance',
        viewportCase.expectedCapGovernance,
      );
      await expect(launcherRoot).toHaveAttribute('data-hbc-launcher-overflow-strategy');
      await expect(launcherRoot).toHaveAttribute(
        'data-hbc-launcher-device-class',
        viewportCase.expectedLauncherDeviceClass,
      );
      await expect(launcherSurface).toHaveAttribute(
        'data-hbc-homepage-launcher-device-class',
        viewportCase.expectedLauncherDeviceClass,
      );
      await expect(launcherSurface).toHaveAttribute(
        'data-hbc-homepage-launcher-overflow-mode',
        viewportCase.expectedOverflowMode,
      );
      await expect(launcherSurface).toHaveAttribute(
        'data-hbc-homepage-launcher-handheld-mode',
        viewportCase.expectedHandheldMode,
      );
      await expect(launcherSurface).toHaveAttribute(
        'data-hbc-homepage-launcher-cap-governance',
        viewportCase.expectedCapGovernance,
      );
      await expect(launcherSurface).toHaveAttribute(
        'data-hbc-homepage-launcher-version',
        EXPECTED_LAUNCHER_VERSION,
      );
      const launcherShellStyle = await launcherShell.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          paddingTop: style.paddingTop,
          paddingInlineStart: style.paddingInlineStart,
          boxShadow: style.boxShadow,
          borderRadius: style.borderRadius,
          backgroundImage: style.backgroundImage,
        };
      });
      if (isHandheldViewport(viewportCase.label)) {
        await expect(launcherRoot).toHaveAttribute('data-hbc-launcher-handheld-mode', 'single-entry-all-tools');
        await expect(launcherRoot).toHaveAttribute('data-hbc-launcher-drawer-source', 'all-tools');
        expect(launcherShellStyle.paddingTop).toBe('0px');
        expect(launcherShellStyle.paddingInlineStart).toBe('0px');
        expect(launcherShellStyle.boxShadow).toBe('none');
        expect(launcherShellStyle.borderRadius).toBe('0px');
        expect(launcherShellStyle.backgroundImage).toBe('none');
      } else {
        await expect(launcherRoot).toHaveAttribute('data-hbc-launcher-handheld-mode', 'standard');
        await expect(launcherRoot).toHaveAttribute('data-hbc-launcher-drawer-source', 'all-tools');
        expect(launcherShellStyle.paddingTop).not.toBe('0px');
        expect(launcherShellStyle.paddingInlineStart).not.toBe('0px');
        expect(launcherShellStyle.boxShadow).not.toBe('none');
      }
      await expect(
        launcherRoot,
        'overflow strategy should align with entry-state policy posture',
      ).toHaveAttribute('data-hbc-launcher-overflow-strategy', viewportCase.expectedOverflowMode);
      const visibleCountProof = await launcherRoot.evaluate((el) => ({
        bandPrimaryCount: Number(el.getAttribute('data-hbc-launcher-primary-count') ?? '-1'),
        surfaceVisibleCount: Number(
          document
            .querySelector('[data-hbc-ui="homepage-launcher"]')
            ?.getAttribute('data-hbc-homepage-launcher-visible-count') ?? '-1',
        ),
      }));
      expect(visibleCountProof.bandPrimaryCount).toBeGreaterThanOrEqual(0);
      expect(visibleCountProof.surfaceVisibleCount).toBe(visibleCountProof.bandPrimaryCount);
      await expect(actionsRegion).toHaveAttribute(
        'data-hb-homepage-region-contained-by',
        'hb-homepage-wrapper-outer-envelope-v1',
      );
      await expect(shellRegion).toHaveAttribute(
        'data-hb-homepage-region-contained-by',
        'hb-homepage-wrapper-outer-envelope-v1',
      );

      // Width truth + measurement diagnostics (Prompts 03–06)
      await expect(shellRoot).toHaveAttribute(
        'data-shell-width-source',
        'entry-stack-outer-envelope',
      );
      await expect(shellRoot).toHaveAttribute(
        'data-shell-width-accounting',
        'authoritative-minus-shell-inline-inset',
      );
      await expect(shellRoot).toHaveAttribute('data-shell-entry-state');
      await expect(shellRoot).toHaveAttribute('data-shell-entry-state-reason');
      await expect(shellRoot).toHaveAttribute('data-shell-fit-path');

      const entryState = await shellRoot.getAttribute('data-shell-entry-state');
      expect(entryState).toBe(viewportCase.expectedEntryState);

      if (viewportCase.expectedReason) {
        await expect(shellRoot).toHaveAttribute(
          'data-shell-entry-state-reason',
          viewportCase.expectedReason,
        );
      }

      const widthMetrics = await shellRoot.evaluate((el) => ({
        usable: Number(el.getAttribute('data-shell-width')),
        authoritative: Number(el.getAttribute('data-shell-width-authoritative')),
        insetTotal: Number(el.getAttribute('data-shell-width-inline-inset-total')),
      }));
      expect(widthMetrics.usable).toBeGreaterThan(0);
      expect(widthMetrics.authoritative).toBeGreaterThanOrEqual(widthMetrics.usable);
      expect(widthMetrics.insetTotal).toBeGreaterThanOrEqual(0);

      const alignmentProof = await page.evaluate(() => {
        const wrapper = document.querySelector('[data-hb-homepage-entry-stack="root"]');
        const hero = document.querySelector('[data-hbc-premium="signature-hero"]');
        const launcher = document.querySelector('[data-hb-homepage-launcher-band="root"]');
        const shell = document.querySelector('[data-shell-post-hero="true"]');
        return {
          wrapperState: wrapper?.getAttribute('data-hb-homepage-entry-state'),
          wrapperReason: wrapper?.getAttribute('data-hb-homepage-entry-state-reason'),
          heroState: hero?.getAttribute('data-hbc-hero-entry-state'),
          heroReason: hero?.getAttribute('data-hbc-hero-entry-reason'),
          launcherState: launcher?.getAttribute('data-hbc-launcher-shell-state'),
          launcherReason: launcher?.getAttribute('data-hbc-launcher-entry-reason'),
          shellState: shell?.getAttribute('data-shell-entry-state'),
          shellReason: shell?.getAttribute('data-shell-entry-state-reason'),
        };
      });
      if (alignmentProof.wrapperState) {
        expect(alignmentProof.wrapperState).toBe(alignmentProof.shellState);
      }
      if (alignmentProof.launcherState) {
        expect(alignmentProof.launcherState).toBe(alignmentProof.shellState);
      }
      if (alignmentProof.wrapperReason) {
        expect(alignmentProof.wrapperReason).toBe(alignmentProof.shellReason);
      }
      if (alignmentProof.launcherReason) {
        expect(alignmentProof.launcherReason).toBe(alignmentProof.shellReason);
      }
      if (alignmentProof.heroState) {
        expect(alignmentProof.heroState).toBe(alignmentProof.shellState);
      }
      if (alignmentProof.heroReason) {
        expect(alignmentProof.heroReason).toBe(alignmentProof.shellReason);
      }

      const regionOrder = await page
        .locator('[data-hb-homepage-entry-stack-region]')
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            region: node.getAttribute('data-hb-homepage-entry-stack-region'),
            order: node.getAttribute('data-hb-homepage-entry-stack-order'),
          })),
        );
      if (regionOrder.some((r) => r.region === 'hero')) {
        expect(regionOrder).toEqual([
          { region: 'hero', order: '1' },
          { region: 'priority-actions', order: '2' },
          { region: 'shell', order: '3' },
        ]);
      } else {
        expect(regionOrder).toEqual([
          { region: 'priority-actions', order: '1' },
          { region: 'shell', order: '2' },
        ]);
      }

      const oneHeroProof = await page.evaluate(() => ({
        heroCount: document.querySelectorAll('[data-hbc-premium="signature-hero"]').length,
        wrapperHeroCount: document.querySelectorAll(
          '[data-hb-homepage-entry-stack-region="hero"][data-hb-homepage-entry-stack-hero-authority="shared-entry-state"]',
        ).length,
        duplicateGuardCount: document.querySelectorAll(
          '[data-hb-signature-hero-duplicate-guard="suppressed-standalone-homepage"]',
        ).length,
      }));
      expect(oneHeroProof.heroCount).toBeLessThanOrEqual(1);
      expect(oneHeroProof.wrapperHeroCount).toBeLessThanOrEqual(1);
      expect(oneHeroProof.duplicateGuardCount).toBe(0);

      await assertNoHorizontalOverflow(page, '[data-hb-homepage-entry-stack="root"]');
      if (heroRegionCount > 0) {
        await assertNoHorizontalOverflow(page, '[data-hb-homepage-entry-stack-region="hero"]');
      }
      await assertNoHorizontalOverflow(
        page,
        '[data-hb-homepage-entry-stack-region="priority-actions"]',
      );
      await assertNoHorizontalOverflow(page, '[data-shell-post-hero="true"]');
      await assertNoHorizontalOverflow(page, '[data-hbc-ui="homepage-launcher"]');
      await assertNoHorizontalOverflow(page, '.harness-content');
      await assertNoHorizontalOverflow(page, '#root');

      const handheldTrigger = page.getByRole('button', { name: /HB Toolbox/i });
      const moreToolsTrigger = page.getByRole('button', { name: /More tools/i });
      const overflowTrigger = isHandheldViewport(viewportCase.label)
        ? handheldTrigger
        : moreToolsTrigger;
      if (await overflowTrigger.count()) {
        const trigger = overflowTrigger.first();
        if (isHandheldViewport(viewportCase.label)) {
          await expect(trigger).toHaveAttribute('data-hbc-homepage-launcher-overflow-shape', 'linear-handheld');
        }
        await expect(trigger).toHaveAttribute(
          'data-hbc-homepage-launcher-overflow-variant',
          'secondary-overflow-entry',
        );
        await trigger.click();
        const drawer = page.locator(
          '[role="dialog"][data-hbc-homepage-launcher-sheet-content="all-tools"]',
        );
        await expect(drawer).toBeVisible();
        const groupedSections = page.locator('[data-hbc-ui="homepage-launcher-overflow-section"]');
        await expect(groupedSections.first()).toBeVisible();
        const sectionCount = await groupedSections.count();
        expect(sectionCount).toBeGreaterThan(0);
        const firstSectionRail = groupedSections
          .first()
          .locator('[data-hbc-ui="homepage-launcher-drawer-rail"]');
        await expect(firstSectionRail).toHaveAttribute('role', 'list');
        await expect(firstSectionRail.locator('a[data-hbc-ui="homepage-launcher-tile"]').first()).toBeVisible();
        const openedDrawer = await page.screenshot({ fullPage: true });
        await testInfo.attach(`hb-homepage-${viewportCase.label}-opened-drawer`, {
          body: openedDrawer,
          contentType: 'image/png',
        });
        await page.keyboard.press('Escape');
      }

      const launcherMarkerProof = await page.evaluate(() => {
        const launcherBand = document.querySelector('[data-hb-homepage-launcher-band="root"]');
        const launcherSurfaceNode = document.querySelector('[data-hbc-ui="homepage-launcher"]');
        return {
          launcherVersion: launcherSurfaceNode?.getAttribute('data-hbc-homepage-launcher-version') ?? null,
          launcherDrawerSource: launcherBand?.getAttribute('data-hbc-launcher-drawer-source') ?? null,
          launcherDeviceClass:
            launcherSurfaceNode?.getAttribute('data-hbc-homepage-launcher-device-class') ??
            launcherBand?.getAttribute('data-hbc-launcher-device-class') ??
            null,
          launcherOverflowMode:
            launcherSurfaceNode?.getAttribute('data-hbc-homepage-launcher-overflow-mode') ??
            launcherBand?.getAttribute('data-hbc-launcher-overflow-strategy') ??
            null,
          launcherHandheldMode:
            launcherSurfaceNode?.getAttribute('data-hbc-homepage-launcher-handheld-mode') ??
            launcherBand?.getAttribute('data-hbc-launcher-handheld-mode') ??
            null,
          launcherVisibleCount:
            launcherSurfaceNode?.getAttribute('data-hbc-homepage-launcher-visible-count') ??
            launcherBand?.getAttribute('data-hbc-launcher-visible-budget') ??
            null,
          launcherCapGovernance:
            launcherSurfaceNode?.getAttribute('data-hbc-homepage-launcher-cap-governance') ??
            launcherBand?.getAttribute('data-hbc-launcher-cap-governance') ??
            null,
          launcherBandPrimaryCount: launcherBand?.getAttribute('data-hbc-launcher-primary-count') ?? null,
          launcherBandOverflowCount: launcherBand?.getAttribute('data-hbc-launcher-overflow-count') ?? null,
          launcherRowPrimitive:
            launcherSurfaceNode?.getAttribute('data-hbc-homepage-launcher-row-primitive') ?? null,
        };
      });
      await testInfo.attach(`hb-homepage-${viewportCase.label}-launcher-markers`, {
        body: Buffer.from(JSON.stringify(launcherMarkerProof, null, 2), 'utf-8'),
        contentType: 'application/json',
      });

      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach(`hb-homepage-${viewportCase.label}`, {
        body: screenshot,
        contentType: 'image/png',
      });
      if (CAPTURE_ROOT) {
        await mkdir(CAPTURE_ROOT, { recursive: true });
        await writeFile(path.join(CAPTURE_ROOT, `${viewportCase.label}.png`), screenshot);
        await writeFile(
          path.join(CAPTURE_ROOT, `${viewportCase.label}.launcher-markers.json`),
          JSON.stringify(launcherMarkerProof, null, 2),
          'utf-8',
        );
      }
    });
  }
});
