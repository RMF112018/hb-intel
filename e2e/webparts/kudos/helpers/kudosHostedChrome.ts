/**
 * Hosted-chrome overlay harness for phase-16 H-axis specs.
 *
 * Injects a SharePoint-style suite + command bar above the harness
 * content so the Kudos surfaces are rendered under the same chrome
 * constraints they see in production hosting. The overlay is a pure
 * DOM injection — no product-code touches — and is scoped to the
 * current page via a data attribute so assertions can target it.
 */
import type { Page } from '@playwright/test';

export interface HostedChromeOptions {
  /** Suite-bar + command-bar total height in px. Defaults to 92px. */
  chromeHeightPx?: number;
}

export async function applyHostedChrome(
  page: Page,
  options: HostedChromeOptions = {},
): Promise<void> {
  const height = options.chromeHeightPx ?? 92;
  await page.evaluate((h) => {
    if (document.querySelector('[data-hbc-testid="sp-hosted-chrome"]')) return;
    const chrome = document.createElement('div');
    chrome.setAttribute('data-hbc-testid', 'sp-hosted-chrome');
    chrome.style.cssText = [
      'position:fixed',
      'inset:0 0 auto 0',
      `height:${h}px`,
      'background:linear-gradient(180deg,#1b1b1b 48px,#f3f2f1 48px)',
      'z-index:2147483000',
      'pointer-events:auto',
      'box-shadow:0 1px 0 rgba(0,0,0,0.08)',
    ].join(';');
    document.body.appendChild(chrome);
    document.body.style.paddingTop = `${h}px`;
  }, height);
}

export async function removeHostedChrome(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelector('[data-hbc-testid="sp-hosted-chrome"]')?.remove();
    document.body.style.paddingTop = '';
  });
}
