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
import { HbcQuickActionBar } from '../index.js';
import type { QuickAction } from '../../layouts/multi-column-types.js';

const ACTIONS: QuickAction[] = [
  { id: 'issue', label: 'Issue', available: true },
  { id: 'capture', label: 'Capture', available: false, unavailableLabel: 'Coming soon' },
  { id: 'review', label: 'Review', available: true },
];

function renderWithTheme(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('HbcQuickActionBar', () => {
  it('renders all actions', () => {
    renderWithTheme(<HbcQuickActionBar actions={ACTIONS} onAction={() => {}} />);
    expect(screen.getByText('Issue')).toBeInTheDocument();
    expect(screen.getByText('Capture')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('fires onAction for available actions', () => {
    const onAction = vi.fn();
    renderWithTheme(<HbcQuickActionBar actions={ACTIONS} onAction={onAction} />);
    fireEvent.click(screen.getByText('Issue'));
    expect(onAction).toHaveBeenCalledWith('issue');
  });

  it('shows unavailable label', () => {
    renderWithTheme(<HbcQuickActionBar actions={ACTIONS} onAction={() => {}} />);
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it('has toolbar role', () => {
    const { container } = renderWithTheme(<HbcQuickActionBar actions={ACTIONS} onAction={() => {}} />);
    expect(container.querySelector('[role="toolbar"]')).toBeInTheDocument();
  });
});
