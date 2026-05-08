import { expect, type Page } from '@playwright/test';
import type { PccLiveSurfaceDefinition, PccLiveSurfaceId } from './pcc-live.surfaces';

const ROOT_MARKERS = {
  tabs: '[data-pcc-horizontal-tabs]',
  tab: '[data-pcc-tab-id]',
  panel: '[data-pcc-active-surface-panel]',
  grid: '[data-pcc-bento-grid]',
  card: '[data-pcc-card]',
} as const;

const HERO_MARKERS = {
  band: '[data-pcc-project-hero-band]',
  secondaryTitle: '[data-pcc-hero-secondary-title]',
  summaryZone: '[data-pcc-hero-surface-summary]',
  summaryItem: '[data-pcc-hero-summary-item]',
  cueZone: '[data-pcc-hero-surface-cues]',
  cue: '[data-pcc-hero-surface-cue]',
  readOnlyCue: '[data-pcc-hero-read-only-cue]',
  commandSearch: '[data-pcc-hero-command-search]',
  commandSearchPreviewState: '[data-pcc-command-search-state="preview"]',
} as const;

export interface PccLiveCommandSearchInteractiveCounts {
  readonly input: number;
  readonly button: number;
  readonly anchor: number;
  readonly select: number;
  readonly textarea: number;
  readonly tabindex0: number;
  readonly roleButton: number;
}

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
  /**
   * Wave 15A wave-b7 Prompt 05 — total elements matching the broad
   * `expectedActivePanelSelector`. Carried as evidence; not part of
   * the `passed` calculation beyond the existing `> 0` check.
   */
  activePanelCount: number;
  /**
   * Tag name of the first broad active-panel element, or `null` if
   * none. Used as evidence to distinguish shell `<main>` ownership
   * (Phase 2) from card-level compatibility ownership.
   */
  activePanelOwnerTagName: string | null;
  /** ARIA role on the first broad active-panel element. */
  activePanelRole: string | null;
  /** DOM `id` attribute on the first broad active-panel element. */
  activePanelId: string | null;
  /**
   * `true` iff the first broad active-panel element is shell `<main
   * role="tabpanel" id="pcc-active-surface-panel">`. Soft signal —
   * not a hard pass/fail gate while tenant deployments may lag local
   * source.
   */
  activePanelIsShellMain: boolean;
  /** `true` iff at least one element matches the shell selector. */
  shellActivePanelFound: boolean;
  /** Total elements matching the shell selector. */
  shellActivePanelCount: number;
  gridCount: number;
  cardCount: number;
  tabActive: boolean;
  /**
   * Wave 15A wave-b8 Prompt 05A — Phase 03 conditional command-header
   * markers captured per active surface. Evidence only — does not gate
   * `passed`. Live spec asserts presence and per-surface cue-id
   * contracts separately so a tenant package lagging the local
   * 1.0.0.19 source still produces diagnostic evidence rather than
   * hiding behind a generic surface-failed warning.
   */
  heroBandFound: boolean;
  heroSummaryZoneCount: number;
  heroSummaryItemIds: readonly string[];
  heroCueZoneCount: number;
  heroCueIds: readonly string[];
  heroReadOnlyCueCount: number;
  heroReadOnlyCueText: string | null;
  heroSecondaryTitleText: string | null;
  heroCommandSearchCount: number;
  heroCommandSearchPreviewStateFound: boolean;
  heroCommandSearchInteractiveCounts: PccLiveCommandSearchInteractiveCounts;
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
  private expectedOrigin?: string;
  private expectedHostname?: string;

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
    const expected = new URL(pageUrl);
    this.expectedOrigin = expected.origin;
    this.expectedHostname = expected.hostname;
    await this.page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    await this.assertCurrentUrlWithinExpectedOrigin();
  }

  async assertCurrentUrlWithinExpectedOrigin(): Promise<void> {
    const currentUrl = this.page.url();
    expect(currentUrl, `Current URL must remain HTTPS: ${currentUrl}`).toMatch(/^https:\/\//);

    if (!this.expectedOrigin || !this.expectedHostname) return;

    const current = new URL(currentUrl);
    expect(
      current.origin,
      `Current URL origin drifted. expected=${this.expectedOrigin} actual=${current.origin}`,
    ).toBe(this.expectedOrigin);
    expect(
      current.hostname,
      `Current URL host drifted. expected=${this.expectedHostname} actual=${current.hostname}`,
    ).toBe(this.expectedHostname);
  }

  async waitForPccRoot(): Promise<void> {
    await this.waitForAnyPccRootMarker(60000);
    await expect(this.page.locator(ROOT_MARKERS.tabs).first()).toBeVisible({ timeout: 60000 });
    await expect(this.page.locator(ROOT_MARKERS.tab).first()).toBeVisible({ timeout: 60000 });
  }

  async waitForAnyPccRootMarker(timeoutMs = 60000): Promise<void> {
    const markerSelectors = [
      ROOT_MARKERS.grid,
      ROOT_MARKERS.card,
      ROOT_MARKERS.tabs,
      ROOT_MARKERS.tab,
      ROOT_MARKERS.panel,
    ];

    await expect
      .poll(
        async () => {
          const counts = await Promise.all(
            markerSelectors.map(async (selector) => this.page.locator(selector).count()),
          );
          return counts.some((count) => count > 0);
        },
        {
          timeout: timeoutMs,
          message: `No PCC root marker detected within ${timeoutMs}ms. Markers checked: ${markerSelectors.join(', ')}`,
        },
      )
      .toBe(true);
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

  private async inspectActivePanelOwner(surface: PccLiveSurfaceDefinition): Promise<{
    readonly activePanelCount: number;
    readonly activePanelOwnerTagName: string | null;
    readonly activePanelRole: string | null;
    readonly activePanelId: string | null;
    readonly activePanelIsShellMain: boolean;
    readonly shellActivePanelCount: number;
  }> {
    const broadPanels = this.page.locator(surface.expectedActivePanelSelector);
    const shellPanels = this.page.locator(surface.expectedShellActivePanelSelector);
    const activePanelCount = await broadPanels.count();
    const shellActivePanelCount = await shellPanels.count();

    if (activePanelCount === 0) {
      return {
        activePanelCount,
        shellActivePanelCount,
        activePanelOwnerTagName: null,
        activePanelRole: null,
        activePanelId: null,
        activePanelIsShellMain: false,
      };
    }

    const owner = await broadPanels.first().evaluate((node) => ({
      tagName: node instanceof HTMLElement ? node.tagName : node.nodeName,
      role: node instanceof HTMLElement ? node.getAttribute('role') : null,
      id: node instanceof HTMLElement ? node.getAttribute('id') : null,
    }));

    const activePanelIsShellMain =
      owner.tagName.toUpperCase() === 'MAIN' &&
      owner.role === 'tabpanel' &&
      owner.id === 'pcc-active-surface-panel';

    return {
      activePanelCount,
      shellActivePanelCount,
      activePanelOwnerTagName: owner.tagName,
      activePanelRole: owner.role,
      activePanelId: owner.id,
      activePanelIsShellMain,
    };
  }

  private async inspectHeroBandMetadata(): Promise<{
    readonly heroBandFound: boolean;
    readonly heroSummaryZoneCount: number;
    readonly heroSummaryItemIds: readonly string[];
    readonly heroCueZoneCount: number;
    readonly heroCueIds: readonly string[];
    readonly heroReadOnlyCueCount: number;
    readonly heroReadOnlyCueText: string | null;
    readonly heroSecondaryTitleText: string | null;
    readonly heroCommandSearchCount: number;
    readonly heroCommandSearchPreviewStateFound: boolean;
    readonly heroCommandSearchInteractiveCounts: PccLiveCommandSearchInteractiveCounts;
  }> {
    const heroBandCount = await this.page.locator(HERO_MARKERS.band).count();
    const heroSummaryZoneCount = await this.page.locator(HERO_MARKERS.summaryZone).count();
    const heroCueZoneCount = await this.page.locator(HERO_MARKERS.cueZone).count();
    const heroReadOnlyCueCount = await this.page.locator(HERO_MARKERS.readOnlyCue).count();
    const heroCommandSearchCount = await this.page.locator(HERO_MARKERS.commandSearch).count();
    const heroCommandSearchPreviewStateCount = await this.page
      .locator(HERO_MARKERS.commandSearchPreviewState)
      .count();

    const heroSummaryItemIdsRaw = await this.page
      .locator(HERO_MARKERS.summaryItem)
      .evaluateAll((nodes) =>
        nodes.map((node) =>
          node instanceof HTMLElement
            ? (node.getAttribute('data-pcc-hero-summary-item') ?? '')
            : '',
        ),
      );
    const heroCueIdsRaw = await this.page
      .locator(HERO_MARKERS.cue)
      .evaluateAll((nodes) =>
        nodes.map((node) =>
          node instanceof HTMLElement ? (node.getAttribute('data-pcc-hero-surface-cue') ?? '') : '',
        ),
      );

    let heroReadOnlyCueText: string | null = null;
    if (heroReadOnlyCueCount > 0) {
      const text = await this.page.locator(HERO_MARKERS.readOnlyCue).first().textContent();
      heroReadOnlyCueText = text ? redact(text.trim()) : null;
    }

    let heroSecondaryTitleText: string | null = null;
    const heroSecondaryTitleCount = await this.page.locator(HERO_MARKERS.secondaryTitle).count();
    if (heroSecondaryTitleCount > 0) {
      const text = await this.page.locator(HERO_MARKERS.secondaryTitle).first().textContent();
      heroSecondaryTitleText = text ? redact(text.trim()) : null;
    }

    let heroCommandSearchInteractiveCounts: PccLiveCommandSearchInteractiveCounts = {
      input: 0,
      button: 0,
      anchor: 0,
      select: 0,
      textarea: 0,
      tabindex0: 0,
      roleButton: 0,
    };
    if (heroCommandSearchCount > 0) {
      const slot = this.page.locator(HERO_MARKERS.commandSearch).first();
      heroCommandSearchInteractiveCounts = {
        input: await slot.locator('input').count(),
        button: await slot.locator('button').count(),
        anchor: await slot.locator('a').count(),
        select: await slot.locator('select').count(),
        textarea: await slot.locator('textarea').count(),
        tabindex0: await slot.locator('[tabindex="0"]').count(),
        roleButton: await slot.locator('[role="button"]').count(),
      };
    }

    return {
      heroBandFound: heroBandCount > 0,
      heroSummaryZoneCount,
      heroSummaryItemIds: heroSummaryItemIdsRaw
        .map((id) => redact(id))
        .filter((id) => id.length > 0),
      heroCueZoneCount,
      heroCueIds: heroCueIdsRaw.map((id) => redact(id)).filter((id) => id.length > 0),
      heroReadOnlyCueCount,
      heroReadOnlyCueText,
      heroSecondaryTitleText,
      heroCommandSearchCount,
      heroCommandSearchPreviewStateFound: heroCommandSearchPreviewStateCount > 0,
      heroCommandSearchInteractiveCounts,
    };
  }

  async assertSurfaceActive(surface: PccLiveSurfaceDefinition): Promise<PccLiveSurfaceSmokeResult> {
    try {
      await this.navigateToSurface(surface);

      const tab = this.page.locator(surface.expectedTabSelector).first();
      const ariaSelected = (await tab.getAttribute('aria-selected')) === 'true';
      const dataActive = (await tab.getAttribute('data-pcc-tab-active')) === 'true';
      const tabActive = ariaSelected || dataActive;

      const {
        activePanelCount,
        shellActivePanelCount,
        activePanelOwnerTagName,
        activePanelRole,
        activePanelId,
        activePanelIsShellMain,
      } = await this.inspectActivePanelOwner(surface);
      const gridCount = await this.page.locator(ROOT_MARKERS.grid).count();
      const cardCount = await this.page.locator(ROOT_MARKERS.card).count();
      const hero = await this.inspectHeroBandMetadata();

      await this.assertCurrentUrlWithinExpectedOrigin();

      // Wave 15A wave-b7 Prompt 05 — `passed` stays compatibility-based.
      // Shell-main ownership (`activePanelIsShellMain`) and shell panel
      // count are EVIDENCE only and never gate live tenant smoke. The
      // hosted package may legitimately lag local source until the next
      // .sppkg deploy.
      const passed = tabActive && activePanelCount > 0 && gridCount > 0 && cardCount > 0;

      let warning: string | undefined;
      if (!passed) {
        warning = `Surface ${surface.id} failed checks: tabActive=${tabActive} panel=${activePanelCount} shellPanel=${shellActivePanelCount} grid=${gridCount} card=${cardCount}`;
      } else if (!activePanelIsShellMain || shellActivePanelCount !== 1) {
        const ownerTag = activePanelOwnerTagName ?? 'none';
        const ownerRole = activePanelRole ?? 'none';
        const ownerId = activePanelId ?? 'none';
        const notes: string[] = [];
        if (!activePanelIsShellMain) {
          notes.push(
            `active panel owner is ${ownerTag}/${ownerRole}/${ownerId}; shell main ownership not observed`,
          );
        }
        if (shellActivePanelCount !== 1) {
          notes.push(
            `shell active-panel count is ${shellActivePanelCount}; expected 1 for Phase 2 shell ownership`,
          );
        }
        warning = `Surface ${surface.id} passed compatibility smoke but ${notes.join('; ')}. Tenant package may lag Phase 2.`;
      }

      return {
        surfaceId: surface.id,
        label: surface.label,
        passed,
        activePanelFound: activePanelCount > 0,
        activePanelCount,
        activePanelOwnerTagName,
        activePanelRole,
        activePanelId,
        activePanelIsShellMain,
        shellActivePanelFound: shellActivePanelCount > 0,
        shellActivePanelCount,
        gridCount,
        cardCount,
        tabActive,
        ...hero,
        warning,
      };
    } catch (error) {
      return {
        surfaceId: surface.id,
        label: surface.label,
        passed: false,
        activePanelFound: false,
        activePanelCount: 0,
        activePanelOwnerTagName: null,
        activePanelRole: null,
        activePanelId: null,
        activePanelIsShellMain: false,
        shellActivePanelFound: false,
        shellActivePanelCount: 0,
        gridCount: 0,
        cardCount: 0,
        tabActive: false,
        heroBandFound: false,
        heroSummaryZoneCount: 0,
        heroSummaryItemIds: [],
        heroCueZoneCount: 0,
        heroCueIds: [],
        heroReadOnlyCueCount: 0,
        heroReadOnlyCueText: null,
        heroSecondaryTitleText: null,
        heroCommandSearchCount: 0,
        heroCommandSearchPreviewStateFound: false,
        heroCommandSearchInteractiveCounts: {
          input: 0,
          button: 0,
          anchor: 0,
          select: 0,
          textarea: 0,
          tabindex0: 0,
          roleButton: 0,
        },
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
