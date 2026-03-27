import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@hbc/shell', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeProject: null, availableProjects: [] }),
  useNavStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeItemId: null, activeWorkspace: null }),
}));
vi.mock('@hbc/auth', () => ({ usePermission: () => true }));

import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcNavRail } from '../index.js';
import type { NavRailItem } from '../../layouts/multi-column-types.js';

const ITEMS: NavRailItem[] = [
  { id: 'a', label: 'Alpha', status: 'healthy', issueCount: 0, actionCount: 1 },
  { id: 'b', label: 'Beta', status: 'critical', issueCount: 3, actionCount: 2 },
  { id: 'c', label: 'Gamma', status: 'no-data', issueCount: 0, actionCount: 0 },
];

function renderWithTheme(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('HbcNavRail', () => {
  it('renders all items', () => {
    renderWithTheme(
      <HbcNavRail items={ITEMS} selectedItemId={null} onSelectItem={() => {}} collapsed={false} onToggleCollapse={() => {}} />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('has the nav-rail testid', () => {
    const { container } = renderWithTheme(
      <HbcNavRail items={ITEMS} selectedItemId={null} onSelectItem={() => {}} collapsed={false} onToggleCollapse={() => {}} />,
    );
    expect(container.querySelector('[data-testid="hbc-nav-rail"]')).toBeInTheDocument();
  });

  it('fires onSelectItem when item clicked', () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <HbcNavRail items={ITEMS} selectedItemId={null} onSelectItem={onSelect} collapsed={false} onToggleCollapse={() => {}} />,
    );
    fireEvent.click(screen.getByTestId('nav-rail-item-b'));
    expect(onSelect).toHaveBeenCalledWith('b');
  });

  it('deselects when clicking selected item', () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <HbcNavRail items={ITEMS} selectedItemId="b" onSelectItem={onSelect} collapsed={false} onToggleCollapse={() => {}} />,
    );
    fireEvent.click(screen.getByTestId('nav-rail-item-b'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('shows count badge for items with issues or actions', () => {
    renderWithTheme(
      <HbcNavRail items={ITEMS} selectedItemId={null} onSelectItem={() => {}} collapsed={false} onToggleCollapse={() => {}} />,
    );
    // Beta has 3+2=5 total
    expect(screen.getByText('5')).toBeInTheDocument();
    // Alpha has 0+1=1
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('hides labels when collapsed', () => {
    renderWithTheme(
      <HbcNavRail items={ITEMS} selectedItemId={null} onSelectItem={() => {}} collapsed={true} onToggleCollapse={() => {}} />,
    );
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('fires onToggleCollapse', () => {
    const onToggle = vi.fn();
    renderWithTheme(
      <HbcNavRail items={ITEMS} selectedItemId={null} onSelectItem={() => {}} collapsed={false} onToggleCollapse={onToggle} />,
    );
    fireEvent.click(screen.getByLabelText('Collapse Navigation'));
    expect(onToggle).toHaveBeenCalled();
  });
});
