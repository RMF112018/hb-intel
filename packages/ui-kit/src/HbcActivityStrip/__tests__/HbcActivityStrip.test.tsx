import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@hbc/shell', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeProject: null, availableProjects: [] }),
  useNavStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ activeItemId: null, activeWorkspace: null }),
}));
vi.mock('@hbc/auth', () => ({ usePermission: () => true }));

import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcActivityStrip } from '../index.js';
import type { ActivityStripEntry } from '../../layouts/multi-column-types.js';

const ENTRIES: ActivityStripEntry[] = [
  { id: '1', timestamp: '2026-03-27T14:00:00Z', type: 'decision', title: 'Budget confirmed', source: 'Financial', actor: 'PM' },
  { id: '2', timestamp: '2026-03-26T10:00:00Z', type: 'milestone', title: 'Foundation Complete', source: 'Schedule', actor: null },
];

function renderWithTheme(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('HbcActivityStrip', () => {
  it('renders collapsed by default', () => {
    renderWithTheme(<HbcActivityStrip entries={ENTRIES} />);
    expect(screen.getByText('2 recent events')).toBeInTheDocument();
    expect(screen.queryByText('Budget confirmed')).not.toBeInTheDocument();
  });

  it('expands when header clicked', () => {
    renderWithTheme(<HbcActivityStrip entries={ENTRIES} />);
    fireEvent.click(screen.getByText('Activity'));
    expect(screen.getByText('Budget confirmed')).toBeInTheDocument();
    expect(screen.getByText('Foundation Complete')).toBeInTheDocument();
  });

  it('renders expanded when defaultCollapsed=false', () => {
    renderWithTheme(<HbcActivityStrip entries={ENTRIES} defaultCollapsed={false} />);
    expect(screen.getByText('Budget confirmed')).toBeInTheDocument();
  });

  it('has the activity-strip testid', () => {
    const { container } = renderWithTheme(<HbcActivityStrip entries={ENTRIES} />);
    expect(container.querySelector('[data-testid="hbc-activity-strip"]')).toBeInTheDocument();
  });

  it('renders empty state gracefully', () => {
    renderWithTheme(<HbcActivityStrip entries={[]} />);
    expect(screen.getByText('0 recent events')).toBeInTheDocument();
  });
});
