import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@hbc/shell', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeProject: null, availableProjects: [] }),
  useNavStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeItemId: null, activeWorkspace: null }),
}));
vi.mock('@hbc/auth', () => ({ usePermission: () => true }));

import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcContextRail } from '../index.js';
import type { ContextRailSection } from '../../layouts/multi-column-types.js';

const SECTIONS: ContextRailSection[] = [
  {
    id: 'moves',
    title: 'Next Moves',
    items: [
      { id: 'm1', title: 'Resolve blocker', subtitle: 'PM · Critical' },
      { id: 'm2', title: 'Complete checklist', subtitle: 'PM · High' },
    ],
  },
  {
    id: 'empty',
    title: 'Related Records',
    items: [],
    emptyMessage: 'No related records',
  },
];

function renderWithTheme(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('HbcContextRail', () => {
  it('renders all sections', () => {
    renderWithTheme(<HbcContextRail sections={SECTIONS} />);
    expect(screen.getByText('Next Moves')).toBeInTheDocument();
    expect(screen.getByText('Related Records')).toBeInTheDocument();
  });

  it('renders section items', () => {
    renderWithTheme(<HbcContextRail sections={SECTIONS} />);
    expect(screen.getByText('Resolve blocker')).toBeInTheDocument();
    expect(screen.getByText('Complete checklist')).toBeInTheDocument();
  });

  it('renders empty message for empty sections', () => {
    renderWithTheme(<HbcContextRail sections={SECTIONS} />);
    expect(screen.getByText('No related records')).toBeInTheDocument();
  });

  it('renders count badges', () => {
    renderWithTheme(<HbcContextRail sections={SECTIONS} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('has the context-rail testid', () => {
    const { container } = renderWithTheme(<HbcContextRail sections={SECTIONS} />);
    expect(container.querySelector('[data-testid="hbc-context-rail"]')).toBeInTheDocument();
  });

  it('respects maxItems', () => {
    const sections: ContextRailSection[] = [
      {
        id: 'limited',
        title: 'Limited',
        items: [
          { id: 'l1', title: 'Item 1' },
          { id: 'l2', title: 'Item 2' },
          { id: 'l3', title: 'Item 3' },
        ],
        maxItems: 2,
      },
    ];
    renderWithTheme(<HbcContextRail sections={sections} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
    // Count badge still shows total (3), not visible (2)
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
