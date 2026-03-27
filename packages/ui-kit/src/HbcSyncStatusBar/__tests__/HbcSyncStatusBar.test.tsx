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
import { HbcSyncStatusBar } from '../index.js';

function renderWithTheme(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('HbcSyncStatusBar', () => {
  it('renders synced state', () => {
    renderWithTheme(<HbcSyncStatusBar state="synced" pendingCount={0} failedCount={0} lastSyncLabel="Just now" />);
    expect(screen.getByText('Synced')).toBeInTheDocument();
    expect(screen.getByText('Last sync: Just now')).toBeInTheDocument();
  });

  it('renders failed state with counts', () => {
    renderWithTheme(<HbcSyncStatusBar state="failed" pendingCount={2} failedCount={3} lastSyncLabel="30 min ago" />);
    expect(screen.getByText('Sync failed')).toBeInTheDocument();
    expect(screen.getByText('2 pending')).toBeInTheDocument();
    expect(screen.getByText('3 failed')).toBeInTheDocument();
  });

  it('has the sync-status-bar testid', () => {
    const { container } = renderWithTheme(
      <HbcSyncStatusBar state="synced" pendingCount={0} failedCount={0} lastSyncLabel="Just now" />,
    );
    expect(container.querySelector('[data-testid="hbc-sync-status-bar"]')).toBeInTheDocument();
  });

  it('sets data-sync-state attribute', () => {
    const { container } = renderWithTheme(
      <HbcSyncStatusBar state="pending" pendingCount={5} failedCount={0} lastSyncLabel="10 min ago" />,
    );
    expect(container.querySelector('[data-sync-state="pending"]')).toBeInTheDocument();
  });
});
