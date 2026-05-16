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
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';
import { MyProjectsHomeCard } from './MyProjectsHomeCard.js';

const getMyProjectLinksMock = vi.fn();

vi.mock('../../api/myWorkReadModelClientFactory.js', () => ({
  createMyWorkReadModelClient: () => ({
    getMyProjectLinks: getMyProjectLinksMock,
  }),
}));

afterEach(() => {
  cleanup();
  getMyProjectLinksMock.mockReset();
});

function renderCard(mode: MyWorkResponsiveMode = 'desktop') {
  return render(
    <MyWorkBentoGrid mode={mode}>
      <MyProjectsHomeCard />
    </MyWorkBentoGrid>,
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

const EMPTY_COPY = 'No assigned projects were found for your current project-role assignments.';

describe('MyProjectsHomeCard', () => {
  it('renders locked support copy and eyebrow', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();
    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );
    expect(container.textContent).toContain('Open assigned projects in SharePoint or Procore.');
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

  it('opens a per-tile launch menu exposing available SharePoint and Procore destinations', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    // The fully-ready row (Harbor Office Renovation) has both destinations
    // available; find that tile so anchor assertions are deterministic.
    const tiles = Array.from(
      container.querySelectorAll<HTMLElement>('[data-my-projects-tile]'),
    );
    const harborTile = tiles.find(
      (tile) => tile.querySelector('[data-my-projects-project-number]')?.textContent === '24-100-01',
    );
    expect(harborTile).toBeTruthy();

    const trigger = harborTile!.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const menu = document.body.querySelector('[data-my-projects-launch-menu]') as HTMLElement;
    expect(menu).not.toBeNull();

    const sharePointLink = menu.querySelector(
      '[data-my-projects-launch-option="sharepoint"][data-my-projects-launch-option-state="available"]',
    ) as HTMLAnchorElement;
    expect(sharePointLink.tagName).toBe('A');
    expect(sharePointLink.textContent).toBe('Open SharePoint Site');
    expect(sharePointLink.getAttribute('href')).toContain('https://');
    expect(sharePointLink.getAttribute('target')).toBe('_blank');
    expect(sharePointLink.getAttribute('rel')).toBe('noopener noreferrer');

    const procoreLink = menu.querySelector(
      '[data-my-projects-launch-option="procore"][data-my-projects-launch-option-state="available"]',
    ) as HTMLAnchorElement;
    expect(procoreLink.tagName).toBe('A');
    expect(procoreLink.textContent).toBe('Open Procore');
    expect(procoreLink.getAttribute('href')).toContain('https://app.procore.com/');
    expect(procoreLink.getAttribute('target')).toBe('_blank');
    expect(procoreLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders unavailable launch options as non-anchor disabled menu items', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    const triggers = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[data-my-projects-launch-trigger]'),
    );

    // Concurrency rule: only one menu open at a time. Visit each tile's
    // menu and harvest unavailable options state-by-state.
    const observed: HTMLElement[] = [];
    for (const trigger of triggers) {
      fireEvent.click(trigger);
      const menu = document.body.querySelector('[data-my-projects-launch-menu]') as HTMLElement;
      expect(menu).not.toBeNull();
      menu
        .querySelectorAll<HTMLElement>('[data-my-projects-launch-option-state="unavailable"]')
        .forEach((node) => observed.push(node));
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    }

    expect(observed.length).toBeGreaterThan(0);
    observed.forEach((node) => {
      expect(node.tagName).toBe('BUTTON');
      expect(node.getAttribute('href')).toBeNull();
      expect(node.getAttribute('aria-disabled')).toBe('true');
    });
  });

  it('opens only one launch menu at a time across the tile grid', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    const triggers = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[data-my-projects-launch-trigger]'),
    );
    expect(triggers.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(triggers[0]!);
    expect(document.body.querySelectorAll('[data-my-projects-launch-menu]').length).toBe(1);

    fireEvent.click(triggers[1]!);
    expect(document.body.querySelectorAll('[data-my-projects-launch-menu]').length).toBe(1);
    expect(triggers[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1]!.getAttribute('aria-expanded')).toBe('true');
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

    const tiles = Array.from(
      container.querySelectorAll<HTMLElement>('[data-my-projects-tile]'),
    );
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
    expect(container.querySelector('[data-my-projects-compact-state="empty"]')?.textContent).toContain(
      EMPTY_COPY,
    );
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

  it('maps procore-project-invalid warning to an unavailable menu option with accessible explanation', async () => {
    getMyProjectLinksMock.mockResolvedValue(makeInvalidProcoreEnvelope());
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBe(1),
    );

    const trigger = container.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    fireEvent.click(trigger);

    const unavailable = document.body.querySelector(
      '[data-my-projects-launch-option="procore"][data-my-projects-launch-option-state="unavailable"]',
    ) as HTMLButtonElement;
    expect(unavailable).not.toBeNull();
    expect(unavailable.tagName).toBe('BUTTON');
    expect(unavailable.getAttribute('aria-disabled')).toBe('true');
    expect(unavailable.getAttribute('aria-label')).toBe(
      'Procore unavailable due to invalid project token.',
    );
  });

  it('opens the launch menu and exposes both options in compact (phone) mode', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard('phone');

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-tile]').length).toBeGreaterThan(0),
    );

    const card = container.querySelector('[data-my-work-card-role="my-projects-home"]');
    expect(card?.getAttribute('data-my-work-mode')).toBe('phone');

    const firstTile = container.querySelector('[data-my-projects-tile]') as HTMLElement;
    const trigger = firstTile.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    fireEvent.click(trigger);

    const menu = document.body.querySelector('[data-my-projects-launch-menu]') as HTMLElement;
    expect(menu).not.toBeNull();
    expect(
      menu.querySelector('[data-my-projects-launch-option="sharepoint"]')?.textContent,
    ).toBeTruthy();
    expect(
      menu.querySelector('[data-my-projects-launch-option="procore"]')?.textContent,
    ).toBeTruthy();
  });
});
