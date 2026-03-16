import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// HbcAppShell composes many sub-components with heavy context requirements.
// Mock the external stores and auth so the orchestrator can mount in jsdom.
vi.mock('@hbc/shell', () => ({
  useProjectStore: () => ({ activeProject: null, availableProjects: [] }),
  useNavStore: (selector: (s: { activeItemId: string | null }) => unknown) =>
    selector({ activeItemId: null }),
}));
vi.mock('@hbc/auth', () => ({
  usePermission: () => true,
}));

// Provide HbcThemeProvider so useHbcTheme does not throw.
import { HbcThemeProvider } from '../HbcThemeContext.js';
import { HbcAppShell } from '../HbcAppShell.js';

function renderShell(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('HbcAppShell', () => {
  it('renders without crashing with minimal required props', () => {
    renderShell(<HbcAppShell sidebarGroups={[]}>Content</HbcAppShell>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders children inside a <main> element', () => {
    renderShell(<HbcAppShell sidebarGroups={[]}>Main area</HbcAppShell>);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent('Main area');
  });

  it('has the data-hbc-shell attribute', () => {
    const { container } = renderShell(
      <HbcAppShell sidebarGroups={[]}>Shell</HbcAppShell>,
    );
    const shell = container.querySelector('[data-hbc-shell="app-shell"]');
    expect(shell).toBeInTheDocument();
  });

  it('defaults mode to pwa', () => {
    const { container } = renderShell(
      <HbcAppShell sidebarGroups={[]}>Shell</HbcAppShell>,
    );
    const shell = container.querySelector('[data-mode="pwa"]');
    expect(shell).toBeInTheDocument();
  });
});
