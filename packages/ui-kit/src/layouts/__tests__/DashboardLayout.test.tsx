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
import { DashboardLayout } from '../DashboardLayout.js';

function renderWithTheme(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('DashboardLayout', () => {
  it('renders without crashing with minimal props', () => {
    renderWithTheme(
      <DashboardLayout>
        <p>Data zone</p>
      </DashboardLayout>,
    );
    expect(screen.getByText('Data zone')).toBeInTheDocument();
  });

  it('has the data-hbc-layout attribute', () => {
    const { container } = renderWithTheme(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    expect(container.querySelector('[data-hbc-layout="dashboard"]')).toBeInTheDocument();
  });

  it('renders KPI cards when provided', () => {
    renderWithTheme(
      <DashboardLayout
        kpiCards={[
          { id: 'k1', label: 'Open RFIs', value: '12' },
          { id: 'k2', label: 'Overdue', value: '3' },
        ]}
      >
        <div>Table</div>
      </DashboardLayout>,
    );
    expect(screen.getByText('Open RFIs')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('renders chart content when provided', () => {
    renderWithTheme(
      <DashboardLayout chartContent={<div data-testid="chart">Chart here</div>}>
        <div>Data</div>
      </DashboardLayout>,
    );
    expect(screen.getByTestId('chart')).toHaveTextContent('Chart here');
  });

  it('renders children in the data zone', () => {
    renderWithTheme(
      <DashboardLayout>
        <table data-testid="data-table">
          <tbody>
            <tr><td>Row 1</td></tr>
          </tbody>
        </table>
      </DashboardLayout>,
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });
});
