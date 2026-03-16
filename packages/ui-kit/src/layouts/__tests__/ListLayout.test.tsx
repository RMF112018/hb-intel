import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListLayout } from '../ListLayout.js';

describe('ListLayout', () => {
  it('renders without crashing with minimal props', () => {
    render(
      <ListLayout>
        <div>Table rows</div>
      </ListLayout>,
    );
    expect(screen.getByText('Table rows')).toBeInTheDocument();
  });

  it('has the data-hbc-layout attribute', () => {
    const { container } = render(
      <ListLayout>
        <div>Content</div>
      </ListLayout>,
    );
    expect(container.querySelector('[data-hbc-layout="list"]')).toBeInTheDocument();
  });

  it('renders the search bar', () => {
    render(
      <ListLayout searchPlaceholder="Search items...">
        <div>Rows</div>
      </ListLayout>,
    );
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <ListLayout>
        <table data-testid="list-table">
          <tbody>
            <tr><td>Item 1</td></tr>
          </tbody>
        </table>
      </ListLayout>,
    );
    expect(screen.getByTestId('list-table')).toBeInTheDocument();
  });

  it('renders filter pills when filters are active', () => {
    const filters = [
      { key: 'status', label: 'Status', type: 'select' as const, options: [{ value: 'open', label: 'Open' }] },
    ];
    render(
      <ListLayout
        primaryFilters={filters}
        activeFilters={{ status: 'open' }}
        onFilterChange={vi.fn()}
      >
        <div>Rows</div>
      </ListLayout>,
    );
    expect(screen.getByText(/Status.*open/i)).toBeInTheDocument();
  });
});
