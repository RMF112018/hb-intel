import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcDataTable } from '../index.js';

function renderWithTheme(ui: React.ReactNode) {
  return render(<HbcThemeProvider>{ui}</HbcThemeProvider>);
}

describe('HbcDataTable', () => {
  it('renders without crashing with minimal props', () => {
    const { container } = renderWithTheme(
      <HbcDataTable data={[]} columns={[]} />,
    );
    expect(container.querySelector('[data-hbc-ui="data-table"]')).toBeInTheDocument();
  });

  it('renders empty state when data is empty and emptyStateConfig is provided', () => {
    renderWithTheme(
      <HbcDataTable
        data={[]}
        columns={[]}
        emptyStateConfig={{
          title: 'No results found',
          description: 'Try adjusting your filters.',
        }}
      />,
    );
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument();
  });

  it('shows loading shimmer overlay when isLoading=true', () => {
    renderWithTheme(
      <HbcDataTable data={[]} columns={[]} isLoading />,
    );
    // The shimmer overlay has aria-label="Loading" and aria-busy="true"
    const overlay = screen.getByLabelText('Loading');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute('aria-busy', 'true');
  });

  it('renders column headers from column definitions', () => {
    const columns = [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'status', header: 'Status' },
    ];
    renderWithTheme(
      <HbcDataTable data={[]} columns={columns} />,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
