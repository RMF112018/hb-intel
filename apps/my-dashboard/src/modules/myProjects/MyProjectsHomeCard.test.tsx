import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import type { MyProjectLinksReadModel, MyWorkReadModelEnvelope } from '@hbc/models/myWork';
import {
  MY_PROJECT_LINKS_AVAILABLE,
  MY_PROJECT_LINKS_BACKEND_UNAVAILABLE,
  MY_PROJECT_LINKS_BOUNDED_SOURCE_PARTIAL_WARNING,
  MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS,
  MY_PROJECT_LINKS_NO_ASSIGNED_PROJECTS,
  MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS,
  MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED,
  MY_PROJECT_LINKS_SOURCE_UNAVAILABLE,
} from '@hbc/models/myWork/fixtures';
import type { IMyWorkReadModelClient } from '../../api/myWorkReadModelClient.js';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';
import { MyWorkReadModelClientProvider } from '../../runtime/MyWorkReadModelClientProvider.js';
import { MyProjectsHomeCard } from './MyProjectsHomeCard.js';

const getMyProjectLinksMock = vi.fn();

function makeStubClient(): IMyWorkReadModelClient {
  return {
    getMyWorkHome: vi.fn().mockRejectedValue(new Error('unused')),
    getAdobeSignActionQueue: vi.fn().mockRejectedValue(new Error('unused')),
    getMyProjectLinks: getMyProjectLinksMock,
    resolveAdobeSignActionLink: vi.fn().mockRejectedValue(new Error('unused')),
    startAdobeSignOAuth: vi.fn().mockRejectedValue(new Error('unused')),
  };
}

afterEach(() => {
  cleanup();
  getMyProjectLinksMock.mockReset();
});

function renderCard(mode: MyWorkResponsiveMode = 'desktop') {
  return render(
    <MyWorkReadModelClientProvider client={makeStubClient()}>
      <MyWorkBentoGrid mode={mode}>
        <MyProjectsHomeCard />
      </MyWorkBentoGrid>
    </MyWorkReadModelClientProvider>,
  );
}

function makeInvalidProcoreEnvelope(): MyWorkReadModelEnvelope<MyProjectLinksReadModel> {
  return {
    ...MY_PROJECT_LINKS_AVAILABLE,
    data: {
      ...MY_PROJECT_LINKS_AVAILABLE.data,
      items: [
        {
          ...MY_PROJECT_LINKS_AVAILABLE.data.items[0]!,
          recordKey: 'projects:invalid-procore',
          procoreAction: {
            state: 'unavailable',
            label: 'Procore unavailable',
          },
          warnings: [{ code: 'procore-project-invalid' }],
        },
      ],
      summary: {
        ...MY_PROJECT_LINKS_AVAILABLE.data.summary,
        assignedProjectCount: 1,
        dualLaunchReadyCount: 0,
        sharePointReadyCount: 1,
        procoreReadyCount: 0,
        noSharePointLaunchCount: 0,
        noProcoreLaunchCount: 1,
        projectsOnlyCount: 1,
        mergedCount: 0,
        legacyOnlyCount: 0,
      },
    },
  };
}

function makePartialZeroRowsEnvelope(): MyWorkReadModelEnvelope<MyProjectLinksReadModel> {
  return {
    ...MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS,
    data: {
      ...MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS.data,
      items: [],
      summary: {
        ...MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS.data.summary,
        assignedProjectCount: 0,
        dualLaunchReadyCount: 0,
        sharePointReadyCount: 0,
        procoreReadyCount: 0,
      },
    },
  };
}

function makeNoLaunchActionsEnvelope(): MyWorkReadModelEnvelope<MyProjectLinksReadModel> {
  return {
    ...MY_PROJECT_LINKS_AVAILABLE,
    data: {
      ...MY_PROJECT_LINKS_AVAILABLE.data,
      items: [
        {
          ...MY_PROJECT_LINKS_AVAILABLE.data.items[0]!,
          recordKey: 'projects:no-launch-actions',
          sharePointAction: {
            state: 'unavailable',
            kind: 'none',
            label: 'SharePoint unavailable',
          },
          procoreAction: {
            state: 'unavailable',
            label: 'Procore unavailable',
          },
          buildingConnectedAction: {
            state: 'unavailable',
            label: 'BuildingConnected unavailable',
          },
          documentCrunchAction: {
            state: 'unavailable',
            label: 'Document Crunch unavailable',
          },
          warnings: [],
        },
      ],
    },
  };
}

const EMPTY_COPY = 'No assigned projects were found for your current project-role assignments.';

describe('MyProjectsHomeCard', () => {
  it('renders locked support copy and eyebrow', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();
    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );
    expect(container.textContent).toContain(
      'Open assigned projects across SharePoint, Procore, BuildingConnected, and Document Crunch.',
    );
    expect(container.textContent).not.toContain('Open assigned projects in SharePoint or Procore.');
    expect(container.textContent).toContain('My Portfolio');
  });

  it('shows compact loading block with verbatim copy and no metrics, no portfolio region, no tile grid', () => {
    getMyProjectLinksMock.mockImplementation(() => new Promise(() => {}));
    const { container } = renderCard();
    const loadingBlock = container.querySelector('[data-my-projects-compact-state="loading"]');
    expect(loadingBlock).not.toBeNull();
    expect(loadingBlock?.textContent).toContain('Loading your project links…');
    expect(container.querySelector('[data-my-projects-portfolio-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-grid]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders the available-only launch rail on the fully-ready tile in locked order with concise labels (desktop)', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    // The fully-ready row (Harbor Office Renovation) has every destination
    // available; locate that tile so anchor assertions are deterministic.
    const tiles = Array.from(container.querySelectorAll<HTMLElement>('[data-my-projects-tile]'));
    const harborTile = tiles.find(
      (tile) =>
        tile.querySelector('[data-my-projects-project-number]')?.textContent === '24-100-01',
    );
    expect(harborTile).toBeTruthy();

    expect(harborTile!.querySelector('[data-my-projects-launch-trigger]')).toBeNull();
    expect(document.body.querySelector('[data-my-projects-launch-drawer]')).toBeNull();
    const rail = harborTile!.querySelector('[data-my-projects-launch-shape="rail"]');
    expect(rail).not.toBeNull();
    expect(rail!.getAttribute('data-my-projects-primary-action-count')).toBe('2');
    expect(rail!.getAttribute('data-my-projects-overflow-action-count')).toBe('2');
    expect(harborTile!.getAttribute('data-my-projects-tile-layout')).toBe('content-rail');
    expect(harborTile!.querySelector('[data-my-projects-project-name-accent]')).not.toBeNull();
    expect(harborTile!.querySelector('[data-my-projects-project-number-stage-row]')).not.toBeNull();
    expect(harborTile!.querySelector('[data-my-projects-project-stage]')).not.toBeNull();
    expect(harborTile!.querySelector('[data-my-projects-role-row]')).not.toBeNull();

    const options = Array.from(
      harborTile!.querySelectorAll<HTMLElement>('[data-my-projects-launch-option]'),
    );
    expect(options.map((node) => node.getAttribute('data-my-projects-launch-option'))).toEqual([
      'sharepoint',
      'procore',
    ]);
    expect(options.every((node) => node.tagName === 'A')).toBe(true);
    expect(
      harborTile!.querySelector('[data-my-projects-more-resources-trigger]')?.textContent,
    ).toBe('More Resources · 2');
    expect(harborTile!.querySelector('[data-my-projects-more-resources-panel]')).toBeNull();
    expect(harborTile!.querySelector('[data-my-projects-more-resource-option="building-connected"]')).toBeNull();
    expect(harborTile!.querySelector('[data-my-projects-more-resource-option="document-crunch"]')).toBeNull();

    const sharePointLink = harborTile!.querySelector(
      '[data-my-projects-launch-option="sharepoint"]',
    ) as HTMLAnchorElement;
    expect(sharePointLink.textContent).toBe('SharePoint Site');
    expect(sharePointLink.getAttribute('target')).toBe('_blank');
    expect(sharePointLink.getAttribute('rel')).toBe('noopener noreferrer');

    const procoreLink = harborTile!.querySelector(
      '[data-my-projects-launch-option="procore"]',
    ) as HTMLAnchorElement;
    expect(procoreLink.textContent).toBe('Procore');
    expect(procoreLink.getAttribute('href')).toContain('https://app.procore.com/');

    expect(harborTile!.querySelector('[data-my-projects-launch-option="building-connected"]')).toBeNull();
    expect(harborTile!.querySelector('[data-my-projects-launch-option="document-crunch"]')).toBeNull();
  });

  it('keeps only one non-phone inline resources panel open at a time across tiles', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard('desktop');

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(1),
    );

    const triggers = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[data-my-projects-more-resources-trigger]'),
    );
    expect(triggers.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(triggers[0]!);
    expect(
      container.querySelectorAll('[data-my-projects-more-resources-panel][data-my-projects-more-resources-state="open"]').length,
    ).toBe(1);

    if (triggers[1]) {
      fireEvent.click(triggers[1]);
      expect(
        container.querySelectorAll('[data-my-projects-more-resources-panel][data-my-projects-more-resources-state="open"]').length,
      ).toBe(1);
    } else {
      fireEvent.click(triggers[0]!);
      expect(
        container.querySelectorAll('[data-my-projects-more-resources-panel][data-my-projects-more-resources-state="open"]').length,
      ).toBe(0);
    }
  });

  it('opens and closes panel lifecycle within owning tile', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard('desktop');

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    const harborTile = Array.from(container.querySelectorAll<HTMLElement>('[data-my-projects-tile]')).find(
      (tile) => tile.querySelector('[data-my-projects-project-number]')?.textContent === '24-100-01',
    );
    expect(harborTile).toBeTruthy();

    const trigger = harborTile!.querySelector(
      '[data-my-projects-more-resources-trigger]',
    ) as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    expect(harborTile!.querySelector('[data-my-projects-more-resources-panel]')).toBeNull();

    fireEvent.click(trigger);
    const openPanel = harborTile!.querySelector(
      '[data-my-projects-more-resources-panel][data-my-projects-more-resources-state="open"]',
    );
    expect(openPanel).not.toBeNull();
    expect(openPanel?.querySelector('[data-my-projects-more-resource-option="building-connected"]')).not.toBeNull();
    expect(openPanel?.querySelector('[data-my-projects-more-resource-option="document-crunch"]')).not.toBeNull();

    fireEvent.click(trigger);
    expect(harborTile!.querySelector('[data-my-projects-more-resources-panel]')).toBeNull();
  });

  it('omits unavailable launch destinations entirely from the DOM across all tiles', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    // No tile renders any unavailable-state launch control or disabled button.
    expect(
      container.querySelectorAll('[data-my-projects-launch-option-state="unavailable"]').length,
    ).toBe(0);
    expect(container.querySelector('button[disabled][data-my-projects-launch-option]')).toBeNull();

    // No tile carries a retired shape marker.
    expect(container.querySelector('[data-my-projects-launch-shape="grid"]')).toBeNull();

    // No unavailable-state aria-label leak.
    const text = container.textContent ?? '';
    expect(text).not.toContain('SharePoint unavailable');
    expect(text).not.toContain('Procore unavailable');
    expect(text).not.toContain('BuildingConnected unavailable');
    expect(text).not.toContain('Document Crunch unavailable');
  });

  it('does not render a launch trigger on tablet or desktop (inline mode only)', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard('desktop');

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    expect(container.querySelectorAll('[data-my-projects-launch-trigger]').length).toBe(0);
    expect(document.body.querySelectorAll('[data-my-projects-launch-drawer]').length).toBe(0);
  });

  it('does not render source/provenance pills on any tile', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    expect(container.querySelectorAll('[data-my-projects-source-badge]').length).toBe(0);
    const text = container.textContent ?? '';
    expect(text).not.toContain('Project Site');
    expect(text).not.toContain('Site + Legacy');
    expect(text).not.toContain('Legacy Folder');
  });

  it('renders a primary role chip on every tile and a +N overflow trigger when multiple roles exist', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    const tiles = Array.from(container.querySelectorAll<HTMLElement>('[data-my-projects-tile]'));
    tiles.forEach((tile) => {
      expect(tile.querySelector('[data-my-projects-primary-role]')).not.toBeNull();
    });

    // ITEM_PROJECTS_ONLY_READY has two assignment roles → one tile must
    // expose an overflow trigger; clicking it toggles aria-expanded.
    const overflowTile = tiles.find((tile) =>
      tile.querySelector('[data-my-projects-role-overflow]'),
    );
    expect(overflowTile).toBeTruthy();
    const overflowButton = overflowTile!.querySelector(
      '[data-my-projects-role-overflow]',
    ) as HTMLButtonElement;
    expect(overflowButton.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(overflowButton);
    expect(overflowButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows mode-aware visible count on desktop and opens the portfolio browser overflow', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS);
    const { container, getByText } = renderCard('desktop');

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBe(6),
    );

    const viewAll = getByText('View all projects') as HTMLButtonElement;
    expect(viewAll.getAttribute('data-my-projects-view-all')).toBe('');
    viewAll.focus();
    fireEvent.click(viewAll);

    const browser = document.body.querySelector(
      '[data-my-projects-portfolio-browser]',
    ) as HTMLElement;
    expect(browser).not.toBeNull();
    expect(browser.getAttribute('role')).toBe('dialog');

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(document.body.querySelector('[data-my-projects-portfolio-browser]')).toBeNull();
    expect(document.activeElement).toBe(viewAll);
    expect(container.querySelectorAll('[data-my-projects-tile]').length).toBe(6);
  });

  it('applies the locked phone visible count of 3', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS);
    const { container } = renderCard('phone');
    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBe(3),
    );
  });

  it('renders compact empty block with verbatim copy and no metrics, no portfolio region, no banner', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_NO_ASSIGNED_PROJECTS);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelector('[data-my-projects-compact-state="empty"]')).not.toBeNull(),
    );
    expect(
      container.querySelector('[data-my-projects-compact-state="empty"]')?.textContent,
    ).toContain(EMPTY_COPY);
    expect(container.querySelector('[data-my-projects-portfolio-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-grid]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
    expect(container.querySelector('[data-my-projects-readiness-banner]')).toBeNull();
  });

  it('renders partial-with-rows as populated body with verbatim partial banner copy and tile grid visible', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    const banner = container.querySelector('[data-my-projects-readiness-banner="partial"]');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain(
      'Some launch destinations could not be fully verified. Available project links are shown below.',
    );
    expect(banner?.getAttribute('data-my-projects-compact-state')).toBeNull();
    expect(container.querySelector('[data-my-projects-portfolio-region]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-grid]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders principal-unresolved with banner only — no empty copy, no portfolio region, no metrics', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED);
    const { container } = renderCard();

    await waitFor(() =>
      expect(
        container.querySelector('[data-my-projects-compact-state="banner-only"]'),
      ).not.toBeNull(),
    );
    const banner = container.querySelector('[data-my-projects-compact-state="banner-only"]');
    expect(banner?.getAttribute('data-my-projects-readiness-banner')).toBe('principal-unresolved');
    expect(banner?.textContent).toContain(
      'We could not confirm your project assignment identity for this view.',
    );
    expect(container.textContent).not.toContain(EMPTY_COPY);
    expect(container.querySelector('[data-my-projects-portfolio-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-grid]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders source-unavailable with banner only — no empty copy, no portfolio region, no metrics', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_SOURCE_UNAVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(
        container.querySelector('[data-my-projects-compact-state="banner-only"]'),
      ).not.toBeNull(),
    );
    const banner = container.querySelector('[data-my-projects-compact-state="banner-only"]');
    expect(banner?.getAttribute('data-my-projects-readiness-banner')).toBe('source-unavailable');
    expect(banner?.textContent).toContain(
      'Project launch sources are temporarily unavailable. Try again shortly.',
    );
    expect(container.textContent).not.toContain(EMPTY_COPY);
    expect(container.querySelector('[data-my-projects-portfolio-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-grid]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders backend-unavailable with banner only — no empty copy, no portfolio region, no metrics', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_BACKEND_UNAVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(
        container.querySelector('[data-my-projects-compact-state="banner-only"]'),
      ).not.toBeNull(),
    );
    const banner = container.querySelector('[data-my-projects-compact-state="banner-only"]');
    expect(banner?.getAttribute('data-my-projects-readiness-banner')).toBe('backend-unavailable');
    expect(banner?.textContent).toContain(
      'Project links are temporarily unavailable while the My Dashboard service is unreachable.',
    );
    expect(container.textContent).not.toContain(EMPTY_COPY);
    expect(container.querySelector('[data-my-projects-portfolio-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-grid]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders partial-with-zero-rows with banner only — no empty copy, no portfolio region, no metrics', async () => {
    getMyProjectLinksMock.mockResolvedValue(makePartialZeroRowsEnvelope());
    const { container } = renderCard();

    await waitFor(() =>
      expect(
        container.querySelector('[data-my-projects-compact-state="banner-only"]'),
      ).not.toBeNull(),
    );
    const banner = container.querySelector('[data-my-projects-compact-state="banner-only"]');
    expect(banner?.getAttribute('data-my-projects-readiness-banner')).toBe('partial');
    expect(banner?.textContent).toContain(
      'Some launch destinations could not be fully verified. Available project links are shown below.',
    );
    expect(container.textContent).not.toContain(EMPTY_COPY);
    expect(container.querySelector('[data-my-projects-portfolio-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-grid]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders bounded-source-with-rows as populated body with bounded warning banner preserved verbatim and no metrics strip or Launch List label', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_BOUNDED_SOURCE_PARTIAL_WARNING);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );
    expect(container.textContent).toContain(
      'Your project list is available, but the source inventory exceeded the current review limit. Some assignments may not yet be shown.',
    );
    expect(container.querySelector('[data-my-projects-portfolio-region]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-grid]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
    expect(container.textContent ?? '').not.toContain('Launch List');
  });

  it('populated state renders portfolio grid without metrics strip and without Launch List label', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );
    expect(container.querySelector('[data-my-projects-portfolio-region]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-grid]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
    expect(container.querySelector('[data-my-projects-compact-state]')).toBeNull();
    expect(container.textContent ?? '').not.toContain('Launch List');
  });

  it('omits the Procore launch option entirely when the row has the procore-project-invalid warning (unavailable)', async () => {
    getMyProjectLinksMock.mockResolvedValue(makeInvalidProcoreEnvelope());
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBe(1),
    );

    expect(container.querySelector('[data-my-projects-launch-option="procore"]')).toBeNull();
    expect(
      container.querySelector('[data-my-projects-launch-option-state="unavailable"]'),
    ).toBeNull();
    expect(container.textContent ?? '').not.toContain('Procore unavailable');

    // The remaining available destination (SharePoint) is still rendered in
    // the available-only rail.
    const rail = container.querySelector('[data-my-projects-launch-shape="rail"]');
    expect(rail).not.toBeNull();
    expect(rail!.querySelector('[data-my-projects-launch-option="sharepoint"]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-tile-layout="content-rail"]')).not.toBeNull();
  });

  it('uses content-only full-width tile posture when a non-phone tile has zero available launch actions', async () => {
    getMyProjectLinksMock.mockResolvedValue(makeNoLaunchActionsEnvelope());
    const { container } = renderCard('desktop');

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBe(1),
    );

    const tile = container.querySelector('[data-my-projects-tile]') as HTMLElement;
    expect(tile.getAttribute('data-my-projects-tile-layout')).toBe('content-only');
    expect(tile.querySelector('[data-my-projects-tile-actions]')).toBeNull();
    expect(tile.querySelector('[data-my-projects-launch-shape="rail"]')).toBeNull();
  });

  it('opens a bottom-sheet drawer with four launch options in phone mode', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard('phone');

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    // Scope to the fully-ready Harbor Office Renovation tile (24-100-01),
    // which has every destination available — so the drawer must surface
    // all four available options in locked order.
    const tiles = Array.from(container.querySelectorAll<HTMLElement>('[data-my-projects-tile]'));
    const harborTile = tiles.find(
      (tile) =>
        tile.querySelector('[data-my-projects-project-number]')?.textContent === '24-100-01',
    );
    expect(harborTile).toBeTruthy();
    expect(harborTile!.querySelector('[data-my-projects-launch-shape="rail"]')).toBeNull();
    const trigger = harborTile!.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');

    fireEvent.click(trigger);
    const drawer = document.body.querySelector('[data-my-projects-launch-drawer]') as HTMLElement;
    expect(drawer).not.toBeNull();
    expect(drawer.getAttribute('data-my-projects-launch-shape')).toBe('drawer');
    expect(drawer.getAttribute('data-my-projects-launch-count')).toBe('4');

    const options = Array.from(
      drawer.querySelectorAll<HTMLElement>('[data-my-projects-launch-option]'),
    );
    expect(options.map((node) => node.getAttribute('data-my-projects-launch-option'))).toEqual([
      'sharepoint',
      'procore',
      'building-connected',
      'document-crunch',
    ]);
    expect(options.every((node) => node.tagName === 'A')).toBe(true);
  });

  it('opens only one bottom-sheet drawer at a time across the tile grid in phone mode', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard('phone');

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    const triggers = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[data-my-projects-launch-trigger]'),
    );
    expect(triggers.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(triggers[0]!);
    expect(document.body.querySelectorAll('[data-my-projects-launch-drawer]').length).toBe(1);

    fireEvent.click(triggers[1]!);
    expect(document.body.querySelectorAll('[data-my-projects-launch-drawer]').length).toBe(1);
    expect(triggers[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1]!.getAttribute('aria-expanded')).toBe('true');
  });

  it('never renders the populated-state missing-destination hint, even when some items lack destinations', async () => {
    // Populated tile grid where at least one item lacks at least one
    // destination — the resting card must not surface a
    // missing-destination paragraph; banner state is the only allowed
    // source-readiness affordance.
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    expect(container.querySelector('[data-my-projects-missing-hint]')).toBeNull();
    const body = container.textContent ?? '';
    expect(body).not.toContain(
      'Some assigned projects do not currently have launch destinations for',
    );
  });
});
