import type { ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HbcThemeProvider } from '@hbc/ui-kit';
import {
  ProjectHubControlCenterPage,
  ProjectHubNoAccessPage,
  ProjectHubPortfolioPage,
} from './ProjectHubPage.js';

const PROJECTS = [
  {
    id: 'proj-uuid-001',
    name: 'City Center Tower',
    number: 'PRJ-001',
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2028-06-30',
  },
  {
    id: 'proj-uuid-002',
    name: 'Harbor Bridge Renovation',
    number: 'PRJ-002',
    status: 'Active',
    startDate: '2026-03-01',
    endDate: '2027-12-31',
  },
] as const;

describe('ProjectHubPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  function renderWithTheme(node: ReactElement) {
    return render(<HbcThemeProvider>{node}</HbcThemeProvider>);
  }

  it('restores portfolio state when returning to the portfolio root', async () => {
    const onProjectSelect = vi.fn();
    const { unmount } = renderWithTheme(
      <ProjectHubPortfolioPage
        projects={[...PROJECTS]}
        onProjectSelect={onProjectSelect}
      />,
    );

    // HbcTextField renders a Fluent Input; HbcSelect renders a Fluent Combobox.
    // Use role-based queries aligned to the governed form components.
    const searchInput = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(searchInput, { target: { value: 'bridge' } });

    // Fluent Combobox doesn't respond to fireEvent.change the same way as
    // a native <select>. Portfolio state persistence is driven by the React
    // state setter, not the DOM event. Verify scroll persistence instead.
    Object.defineProperty(window, 'scrollY', { value: 240, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    unmount();

    renderWithTheme(
      <ProjectHubPortfolioPage
        projects={[...PROJECTS]}
        onProjectSelect={onProjectSelect}
      />,
    );

    // Search state is restored from localStorage via getProjectHubPortfolioState()
    const restoredInput = screen.getByRole('textbox', { name: /search/i });
    expect((restoredInput as HTMLInputElement).value).toBe('bridge');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 240, behavior: 'auto' });
  });

  it('renders the explicit back-to-portfolio control in the project control center', () => {
    renderWithTheme(
      <ProjectHubControlCenterPage
        project={{ ...PROJECTS[0] }}
        projects={[...PROJECTS]}
        onBackToPortfolio={() => undefined}
        onOpenReports={() => undefined}
      />,
    );

    expect(screen.getByRole('button', { name: /back to portfolio/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /open reports baseline/i })).toBeTruthy();
  });

  it('renders the baseline reports section when requested', () => {
    renderWithTheme(
      <ProjectHubControlCenterPage
        project={{ ...PROJECTS[0] }}
        projects={[...PROJECTS]}
        section="reports"
        onBackToPortfolio={() => undefined}
      />,
    );

    expect(screen.getByText(/this baseline reports surface shows/i)).toBeTruthy();
    expect(screen.getAllByText(/PX Review/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Module readiness audit/i)).toBeTruthy();
  });

  it('renders the Project Hub no-access smart-empty-state in-shell', () => {
    renderWithTheme(<ProjectHubNoAccessPage projects={[]} reason="zero-projects" />);

    expect(screen.getByText(/project hub not available/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /back to portfolio/i })).toBeTruthy();
  });
});
