import { expect, type Page } from '@playwright/test';
import type { PccLiveSurfaceDefinition, PccLiveSurfaceId } from './pcc-live.surfaces';

const ROOT_MARKERS = {
  tabs: '[data-pcc-horizontal-tabs]',
  tab: '[data-pcc-tab-id]',
  panel: '[data-pcc-active-surface-panel]',
  grid: '[data-pcc-bento-grid]',
  card: '[data-pcc-card]',
} as const;

export interface PccLiveRuntimeErrorItem {
  type: 'console' | 'pageerror';
  message: string;
  messageHash: string;
  count: number;
  surfaceId?: PccLiveSurfaceId;
}

export interface PccLiveRuntimeErrorSummary {
  consoleErrorCount: number;
  pageErrorCount: number;
  items: PccLiveRuntimeErrorItem[];
}

export interface PccLiveSurfaceSmokeResult {
  surfaceId: PccLiveSurfaceId;
  label: string;
  passed: boolean;
  activePanelFound: boolean;
  gridCount: number;
  cardCount: number;
  tabActive: boolean;
  warning?: string;
}

function redact(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noToken = noEmail.replace(/[A-Za-z0-9+/=_-]{24,}/g, '[redacted-token]');
  return noToken.slice(0, 240);
}

function hashMessage(message: string): string {
  let h = 0;
  for (let i = 0; i < message.length; i += 1) {
    h = (h << 5) - h + message.charCodeAt(i);
    h |= 0;
  }
  return `h${Math.abs(h)}`;
}

export class PccLivePageObject {
  private readonly rawConsoleErrors: string[] = [];

  private readonly rawPageErrors: string[] = [];

  private listenersAttached = false;

  constructor(private readonly page: Page) {}

  private ensureListeners(): void {
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.rawConsoleErrors.push(msg.text());
      }
    });

    this.page.on('pageerror', (err) => {
      this.rawPageErrors.push(err.message);
    });
  }

  async goto(pageUrl: string): Promise<void> {
    this.ensureListeners();
    await this.page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  }

  async waitForPccRoot(): Promise<void> {
    await expect(this.page.locator(ROOT_MARKERS.tabs).first()).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(ROOT_MARKERS.tab).first()).toBeVisible({ timeout: 15000 });
  }

  async getRootMarkerCounts(): Promise<Record<string, number>> {
    return {
      tabs: await this.page.locator(ROOT_MARKERS.tabs).count(),
      tab: await this.page.locator(ROOT_MARKERS.tab).count(),
      panel: await this.page.locator(ROOT_MARKERS.panel).count(),
      grid: await this.page.locator(ROOT_MARKERS.grid).count(),
      card: await this.page.locator(ROOT_MARKERS.card).count(),
    };
  }

  async getConsoleAndPageErrorSummary(): Promise<PccLiveRuntimeErrorSummary> {
    const bucket = new Map<string, PccLiveRuntimeErrorItem>();

    const add = (type: 'console' | 'pageerror', raw: string) => {
      const message = redact(raw);
      const key = `${type}:${message}`;
      const item = bucket.get(key);
      if (item) {
        item.count += 1;
      } else {
        bucket.set(key, {
          type,
          message,
          messageHash: hashMessage(message),
          count: 1,
        });
      }
    };

    for (const raw of this.rawConsoleErrors) add('console', raw);
    for (const raw of this.rawPageErrors) add('pageerror', raw);

    return {
      consoleErrorCount: this.rawConsoleErrors.length,
      pageErrorCount: this.rawPageErrors.length,
      items: [...bucket.values()],
    };
  }

  async navigateToSurface(surface: PccLiveSurfaceDefinition): Promise<void> {
    const tab = this.page.locator(surface.expectedTabSelector).first();
    await expect(
      tab,
      `Missing tab for surface ${surface.id}: ${surface.expectedTabSelector}`,
    ).toBeVisible({
      timeout: 10000,
    });
    await expect(tab).toHaveAttribute('role', 'tab');
    await expect(tab).toHaveAttribute('type', 'button');

    await tab.click();
  }

  async assertSurfaceActive(surface: PccLiveSurfaceDefinition): Promise<PccLiveSurfaceSmokeResult> {
    try {
      await this.navigateToSurface(surface);

      const tab = this.page.locator(surface.expectedTabSelector).first();
      const ariaSelected = (await tab.getAttribute('aria-selected')) === 'true';
      const dataActive = (await tab.getAttribute('data-pcc-tab-active')) === 'true';
      const tabActive = ariaSelected || dataActive;

      const panelCount = await this.page.locator(surface.expectedActivePanelSelector).count();
      const gridCount = await this.page.locator(ROOT_MARKERS.grid).count();
      const cardCount = await this.page.locator(ROOT_MARKERS.card).count();

      await expect(this.page).toHaveURL(/^https:\/\//);

      const passed = tabActive && panelCount > 0 && gridCount > 0 && cardCount > 0;

      return {
        surfaceId: surface.id,
        label: surface.label,
        passed,
        activePanelFound: panelCount > 0,
        gridCount,
        cardCount,
        tabActive,
        warning: passed
          ? undefined
          : `Surface ${surface.id} failed checks: tabActive=${tabActive} panel=${panelCount} grid=${gridCount} card=${cardCount}`,
      };
    } catch (error) {
      return {
        surfaceId: surface.id,
        label: surface.label,
        passed: false,
        activePanelFound: false,
        gridCount: 0,
        cardCount: 0,
        tabActive: false,
        warning: `Surface ${surface.id} threw during navigation/assertion: ${redact(String(error))}`,
      };
    }
  }

  async inspectAllSurfaces(
    surfaces: readonly PccLiveSurfaceDefinition[],
  ): Promise<PccLiveSurfaceSmokeResult[]> {
    const results: PccLiveSurfaceSmokeResult[] = [];
    for (const surface of surfaces) {
      results.push(await this.assertSurfaceActive(surface));
    }
    return results;
  }
}
