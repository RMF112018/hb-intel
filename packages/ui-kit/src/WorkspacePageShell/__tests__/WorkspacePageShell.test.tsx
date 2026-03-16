import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@hbc/shell', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeProject: null, availableProjects: [] }),
  useNavStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeItemId: null, activeWorkspace: null }),
}));
vi.mock('@hbc/auth', () => ({
  usePermission: () => true,
}));

import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { WorkspacePageShell } from '../index.js';

function renderShell(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('WorkspacePageShell', () => {
  it('renders without crashing with minimal props', () => {
    renderShell(
      <WorkspacePageShell title="Test Page" layout="form">
        <p>Page content</p>
      </WorkspacePageShell>,
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('renders the title text', () => {
    renderShell(
      <WorkspacePageShell title="My Dashboard" layout="dashboard">
        <div>Content</div>
      </WorkspacePageShell>,
    );
    expect(screen.getByRole('heading', { name: 'My Dashboard' })).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderShell(
      <WorkspacePageShell title="Page" layout="form">
        <span data-testid="child">Hello</span>
      </WorkspacePageShell>,
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('has the data-hbc-ui attribute', () => {
    const { container } = renderShell(
      <WorkspacePageShell title="Shell" layout="landing">
        <div>Body</div>
      </WorkspacePageShell>,
    );
    expect(container.querySelector('[data-hbc-ui="workspace-page-shell"]')).toBeInTheDocument();
  });

  it('sets the data-layout attribute from the layout prop', () => {
    const { container } = renderShell(
      <WorkspacePageShell title="Detail" layout="detail">
        <div>Detail content</div>
      </WorkspacePageShell>,
    );
    expect(container.querySelector('[data-layout="detail"]')).toBeInTheDocument();
  });
});
