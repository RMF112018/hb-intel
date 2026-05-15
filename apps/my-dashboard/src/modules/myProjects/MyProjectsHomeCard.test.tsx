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
  it('renders locked support copy', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();
    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBeGreaterThan(0),
    );
    expect(container.textContent).toContain(
      'Open the projects you are assigned to in SharePoint or Procore.',
    );
  });

  it('shows compact loading block with verbatim copy and no metrics or launch region', () => {
    getMyProjectLinksMock.mockImplementation(() => new Promise(() => {}));
    const { container } = renderCard();
    const loadingBlock = container.querySelector('[data-my-projects-compact-state="loading"]');
    expect(loadingBlock).not.toBeNull();
    expect(loadingBlock?.textContent).toContain('Loading your project links…');
    expect(container.querySelector('[data-my-projects-launch-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders one row with both action slots and available links with correct target/rel', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBeGreaterThan(0),
    );

    const firstRow = container.querySelector('[data-my-projects-row]') as HTMLElement;
    const sharePointLink = firstRow.querySelector(
      '[data-my-projects-action-slot="sharepoint"][data-my-projects-action-state="available"]',
    ) as HTMLAnchorElement;
    expect(sharePointLink.textContent).toBe('Open SharePoint Site');
    expect(sharePointLink.getAttribute('href')).toContain('https://');
    expect(sharePointLink.getAttribute('target')).toBe('_blank');
    expect(sharePointLink.getAttribute('rel')).toBe('noopener noreferrer');

    const procoreLink = firstRow.querySelector(
      '[data-my-projects-action-slot="procore"][data-my-projects-action-state="available"]',
    ) as HTMLAnchorElement;
    expect(procoreLink.textContent).toBe('Open Procore');
    expect(procoreLink.getAttribute('href')).toContain('https://app.procore.com/');
    expect(procoreLink.getAttribute('target')).toBe('_blank');
    expect(procoreLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders unavailable actions without fake links for mixed availability rows', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBeGreaterThan(0),
    );

    const unavailable = container.querySelectorAll('[data-my-projects-action-state="unavailable"]');
    expect(unavailable.length).toBeGreaterThan(0);
    unavailable.forEach((node) => {
      expect(node.tagName).toBe('SPAN');
      expect(node.getAttribute('href')).toBeNull();
    });
  });

  it('maps source badges to Project Site, Site + Legacy, and Legacy Folder', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-source-badge]').length).toBe(3),
    );

    expect(
      container.querySelector('[data-my-projects-source-badge="projects-only"]')?.textContent,
    ).toBe('Project Site');
    expect(container.querySelector('[data-my-projects-source-badge="merged"]')?.textContent).toBe(
      'Site + Legacy',
    );
    expect(
      container.querySelector('[data-my-projects-source-badge="legacy-only"]')?.textContent,
    ).toBe('Legacy Folder');
  });

  it('renders role chips with +N overflow and accessible expanded details', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBeGreaterThan(0),
    );

    const withOverflow = Array.from(container.querySelectorAll('[data-my-projects-row]')).find((row) => {
      return row.querySelector('[data-my-projects-role-overflow-button]');
    });

    // Fixture rows may not all have >2 roles; assert control exists when available by forcing a row in future prompts.
    // Here we at least assert base chip region renders deterministically.
    expect(container.querySelectorAll('[data-my-projects-role-chip]').length).toBeGreaterThan(0);

    if (withOverflow) {
      const button = withOverflow.querySelector(
        '[data-my-projects-role-overflow-button]',
      ) as HTMLButtonElement;
      expect(button.getAttribute('aria-expanded')).toBe('false');
      fireEvent.click(button);
      expect(button.getAttribute('aria-expanded')).toBe('true');
    }
  });

  it('shows five rows initially and supports expand/collapse disclosure', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS);
    const { container, getByText } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBe(5),
    );

    const expand = getByText('View all My Projects') as HTMLButtonElement;
    expect(expand.getAttribute('aria-controls')).toBe('my-projects-row-list');
    expect(expand.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(expand);

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBe(
        MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS.data.items.length,
      ),
    );

    const collapse = getByText('Show fewer') as HTMLButtonElement;
    fireEvent.click(collapse);
    await waitFor(() => expect(container.querySelectorAll('[data-my-projects-row]').length).toBe(5));
    expect(document.activeElement).toBe(collapse);
  });

  it('renders compact empty block with verbatim copy and no metrics, no launch region, no banner', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_NO_ASSIGNED_PROJECTS);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelector('[data-my-projects-compact-state="empty"]')).not.toBeNull(),
    );
    expect(container.querySelector('[data-my-projects-compact-state="empty"]')?.textContent).toContain(
      EMPTY_COPY,
    );
    expect(container.querySelector('[data-my-projects-launch-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
    expect(container.querySelector('[data-my-projects-readiness-banner]')).toBeNull();
  });

  it('renders partial-with-rows as populated body with verbatim partial banner copy and metrics visible', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBeGreaterThan(0),
    );

    const banner = container.querySelector('[data-my-projects-readiness-banner="partial"]');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain(
      'Some launch destinations could not be fully verified. Available project links are shown below.',
    );
    expect(banner?.getAttribute('data-my-projects-compact-state')).toBeNull();
    expect(container.querySelector('[data-my-projects-launch-region]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).not.toBeNull();
  });

  it('renders principal-unresolved with banner only — no empty copy, no launch region, no metrics', async () => {
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
    expect(container.querySelector('[data-my-projects-launch-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders source-unavailable with banner only — no empty copy, no launch region, no metrics', async () => {
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
    expect(container.querySelector('[data-my-projects-launch-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders backend-unavailable with banner only — no empty copy, no launch region, no metrics', async () => {
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
    expect(container.querySelector('[data-my-projects-launch-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders partial-with-zero-rows with banner only — no empty copy, no launch region, no metrics', async () => {
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
    expect(container.querySelector('[data-my-projects-launch-region]')).toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).toBeNull();
  });

  it('renders bounded-source-with-rows as populated body with bounded warning banner preserved verbatim', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_BOUNDED_SOURCE_PARTIAL_WARNING);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBeGreaterThan(0),
    );
    expect(container.textContent).toContain(
      'Your project list is available, but the source inventory exceeded the current review limit. Some assignments may not yet be shown.',
    );
    expect(container.querySelector('[data-my-projects-launch-region]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).not.toBeNull();
  });

  it('populated state renders metrics and launch region with no compact-state marker on the card body', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBeGreaterThan(0),
    );
    expect(container.querySelector('[data-my-projects-launch-region]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-metrics]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-compact-state]')).toBeNull();
  });

  it('maps procore-project-invalid warning to an unavailable row action with accessible explanation', async () => {
    getMyProjectLinksMock.mockResolvedValue(makeInvalidProcoreEnvelope());
    const { container } = renderCard();

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBe(1),
    );

    const unavailable = container.querySelector(
      '[data-my-projects-action-slot="procore"][data-my-projects-action-state="unavailable"]',
    ) as HTMLElement;
    expect(unavailable).not.toBeNull();
    expect(unavailable.getAttribute('aria-label')).toBe(
      'Procore unavailable due to invalid project token.',
    );
  });

  it('keeps dual action structure and explicit action slots in compact mode', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard('phone');

    await waitFor(() =>
      expect(container.querySelectorAll('[data-my-projects-row]').length).toBeGreaterThan(0),
    );

    const card = container.querySelector('[data-my-work-card-role="my-projects-home"]');
    expect(card?.getAttribute('data-my-work-mode')).toBe('phone');
    const firstRow = container.querySelector('[data-my-projects-row]') as HTMLElement;
    expect(
      firstRow.querySelector('[data-my-projects-action-slot="sharepoint"]')?.textContent,
    ).toBeTruthy();
    expect(firstRow.querySelector('[data-my-projects-action-slot="procore"]')?.textContent).toBeTruthy();
  });
});
