import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SmartSearchWayfinding } from '../../webparts/smartSearchWayfinding/SmartSearchWayfinding.js';

describe('Prompt-08 smart search and wayfinding webpart', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders categories and promoted destinations', () => {
    render(
      <SmartSearchWayfinding
        config={{
          categories: [{ id: 'systems', title: 'Systems', order: 1 }],
          resources: [
            {
              id: 'procore',
              title: 'Procore',
              href: '/procore',
              type: 'system',
              categoryId: 'systems',
              promoted: true,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Promoted Destinations')).not.toBeNull();
    expect(screen.getByText('Systems')).not.toBeNull();
    expect(screen.getAllByRole('link', { name: /Procore/ }).length).toBeGreaterThan(0);
  });

  it('filters results from query input and keeps semantic search control', () => {
    render(
      <SmartSearchWayfinding
        config={{
          categories: [{ id: 'forms', title: 'Forms', order: 1 }],
          resources: [
            { id: 'change-order', title: 'Change Order Form', href: '/change-order', type: 'form', categoryId: 'forms' },
            { id: 'safety-plan', title: 'Safety Plan Form', href: '/safety-plan', type: 'form', categoryId: 'forms' },
          ],
        }}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Search resources' });
    fireEvent.change(input, { target: { value: 'change' } });

    expect(screen.getByRole('link', { name: /Change Order Form/ })).not.toBeNull();
    expect(screen.queryByRole('link', { name: /Safety Plan Form/ })).toBeNull();
  });

  it('renders no-match fallback for query and empty-config fallback for malformed config', () => {
    const { rerender } = render(
      <SmartSearchWayfinding
        config={{
          resources: [{ id: 'resource', title: 'Operations Hub', href: '/ops', type: 'destination' }],
        }}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Search resources' });
    fireEvent.change(input, { target: { value: 'unmatched-query' } });
    expect(screen.getByText('No matching resources found')).not.toBeNull();

    rerender(<SmartSearchWayfinding config={{ resources: [{ id: '', title: '', href: '', type: 'tool' }] }} />);
    expect(screen.getByText('Discovery configuration is invalid')).not.toBeNull();
  });

  it('keeps discovery links focusable for keyboard traversal', () => {
    render(
      <SmartSearchWayfinding
        config={{
          quickPaths: [{ id: 'quick-path', title: 'Open Safety Center', href: '/safety', order: 1 }],
        }}
      />,
    );

    const link = screen.getByRole('link', { name: 'Open Safety Center' });
    link.focus();
    expect(document.activeElement).toBe(link);
  });
});
