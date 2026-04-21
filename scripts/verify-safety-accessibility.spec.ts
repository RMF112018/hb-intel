import { expect, test } from '@playwright/test';

function storyUrl(storyId: string): string {
  return `/iframe.html?id=${storyId}&viewMode=story`;
}

const STANDARD_STORY = 'homepage-surfaces-hbcsafetyhomepagesurface--standard';
const COMPACT_STORY = 'homepage-surfaces-hbcsafetyhomepagesurface--compact';
const MINIMAL_STORY = 'homepage-surfaces-hbcsafetyhomepagesurface--minimal';

test('Safety standard keyboard order reaches primary interactions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(storyUrl(STANDARD_STORY));
  await page.waitForLoadState('networkidle');

  const focusOrder: string[] = [];
  for (let i = 0; i < 3; i += 1) {
    await page.keyboard.press('Tab');
    const focusedName = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      return active?.textContent?.trim() ?? '';
    });
    focusOrder.push(focusedName);
  }

  expect(focusOrder[0]).toContain('View safety operations hub');
  expect(focusOrder[1]).toContain('Open corrective action log');
  expect(focusOrder[2]).toContain('Toolbox talk completion below target');
});

test('Safety focus-visible styling appears on keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(storyUrl(STANDARD_STORY));
  await page.waitForLoadState('networkidle');

  const signalLink = page.getByRole('link', { name: /Toolbox talk completion below target/i });
  await signalLink.focus();

  const focusStyles = await signalLink.evaluate((node) => {
    const styles = window.getComputedStyle(node);
    return {
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
    };
  });

  expect(focusStyles.outlineStyle).not.toBe('none');
  expect(focusStyles.outlineWidth).not.toBe('0px');
});

test('Safety compact and minimal keep touch-safe target heights', async ({ page }) => {
  for (const storyId of [COMPACT_STORY, MINIMAL_STORY]) {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto(storyUrl(storyId));
    await page.waitForLoadState('networkidle');

    const targetHeights = await page.evaluate(() => {
      const root = document.querySelector('[data-hbc-premium="safety-homepage-surface"]');
      if (!root) return [];
      const interactive = Array.from(root.querySelectorAll<HTMLElement>('a[href], button'));
      return interactive.map((node) => Math.round(node.getBoundingClientRect().height));
    });

    expect(targetHeights.length).toBeGreaterThan(0);
    for (const height of targetHeights) {
      expect(height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('Safety primary meaning is visible without hover-only disclosure', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(storyUrl(STANDARD_STORY));
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: /Site 47 scaffold corrective plan in flight/i })).toBeVisible();
  await expect(page.getByText('Toolbox talk completion below target')).toBeVisible();
});

test('Safety interaction motion respects prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(storyUrl(STANDARD_STORY));
  await page.waitForLoadState('networkidle');

  const signalLink = page.getByRole('link', { name: /Toolbox talk completion below target/i });
  const primaryCta = page.getByRole('link', { name: /Open corrective action log/i });

  const initialTransforms = {
    signal: await signalLink.evaluate((node) => getComputedStyle(node).transform),
    cta: await primaryCta.evaluate((node) => getComputedStyle(node).transform),
  };

  await signalLink.hover();
  await primaryCta.hover();

  const hoverTransforms = {
    signal: await signalLink.evaluate((node) => getComputedStyle(node).transform),
    cta: await primaryCta.evaluate((node) => getComputedStyle(node).transform),
  };

  expect(hoverTransforms.signal).toBe(initialTransforms.signal);
  expect(hoverTransforms.cta).toBe(initialTransforms.cta);
});
