import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import {
  MY_PROJECT_LINKS_AVAILABLE,
  MY_PROJECT_LINKS_BACKEND_UNAVAILABLE,
  MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS,
  MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED,
} from '@hbc/models/myWork/fixtures';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
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

function renderCard() {
  return render(
    <MyWorkBentoGrid mode="desktop">
      <MyProjectsHomeCard />
    </MyWorkBentoGrid>,
  );
}

describe('MyProjectsHomeCard', () => {
  it('shows loading launch-shell text before the read model resolves', () => {
    getMyProjectLinksMock.mockImplementation(() => new Promise(() => {}));
    const { container } = renderCard();
    expect(container.textContent).toContain('Loading project launches…');
  });

  it('renders metrics from the available fixture envelope', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_AVAILABLE);
    const { container } = renderCard();
    await waitFor(() => expect(container.textContent).toContain('Assigned Projects'));
    expect(container.textContent).toContain('Dual Launch Ready');
    expect(container.textContent).toContain('SharePoint Ready');
    expect(container.textContent).toContain('Procore Ready');
    expect(container.textContent).toContain('3');
    expect(container.textContent).toContain('project link records are loaded');
  });

  it('renders degraded banner text for backend-unavailable', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_BACKEND_UNAVAILABLE);
    const { container } = renderCard();
    await waitFor(() =>
      expect(container.querySelector('[data-my-projects-readiness-banner="backend-unavailable"]'))
        .not.toBeNull(),
    );
  });

  it('renders principal-unresolved banner text', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED);
    const { container } = renderCard();
    await waitFor(() =>
      expect(container.querySelector('[data-my-projects-readiness-banner="principal-unresolved"]'))
        .not.toBeNull(),
    );
  });

  it('renders degraded banner text for partial source readiness', async () => {
    getMyProjectLinksMock.mockResolvedValue(MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS);
    const { container } = renderCard();
    await waitFor(() =>
      expect(container.querySelector('[data-my-projects-readiness-banner="partial"]')).not.toBeNull(),
    );
  });
});
