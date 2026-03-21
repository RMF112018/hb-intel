import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { HbcCommandBar } from '../index.js';

function renderWithFluent(ui: React.ReactNode) {
  return render(<FluentProvider theme={webLightTheme}>{ui}</FluentProvider>);
}

describe('HbcCommandBar', () => {
  it('renders without crashing', () => {
    const { container } = renderWithFluent(<HbcCommandBar />);
    expect(container.querySelector('[data-hbc-ui="command-bar"]')).toBeInTheDocument();
  });

  it('renders search input when onSearchChange is provided', () => {
    renderWithFluent(
      <HbcCommandBar
        searchValue=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Search items..."
      />,
    );
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('renders action buttons with correct labels', () => {
    renderWithFluent(
      <HbcCommandBar
        actions={[
          { key: 'export', label: 'Export', onClick: vi.fn() },
          { key: 'add', label: 'Add New', onClick: vi.fn(), primary: true },
        ]}
      />,
    );
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });

  it('renders filter buttons with correct labels', () => {
    renderWithFluent(
      <HbcCommandBar
        filters={[
          { key: 'active', label: 'Active', active: true, onToggle: vi.fn() },
          { key: 'archived', label: 'Archived', active: false, onToggle: vi.fn() },
        ]}
      />,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('renders grouping buttons with correct labels and aria-pressed state', () => {
    renderWithFluent(
      <HbcCommandBar
        groupings={[
          { key: 'group-lane', label: 'Group by lane', active: true, onSelect: vi.fn() },
          { key: 'group-priority', label: 'Group by priority', active: false, onSelect: vi.fn() },
          { key: 'group-project', label: 'Group by project', active: false, onSelect: vi.fn() },
        ]}
      />,
    );
    const activeBtn = screen.getByRole('button', { name: 'Group by lane' });
    const inactiveBtn = screen.getByRole('button', { name: 'Group by priority' });
    expect(activeBtn).toBeInTheDocument();
    expect(activeBtn).toHaveAttribute('aria-pressed', 'true');
    expect(inactiveBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('radiogroup', { name: 'Group by' })).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = renderWithFluent(
      <HbcCommandBar className="custom-bar-class" />,
    );
    const bar = container.querySelector('[data-hbc-ui="command-bar"]');
    expect(bar?.className).toContain('custom-bar-class');
  });
});
