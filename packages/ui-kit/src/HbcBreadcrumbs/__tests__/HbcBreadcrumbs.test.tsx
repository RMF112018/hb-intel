import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcBreadcrumbs } from '../index.js';
import type { BreadcrumbItem } from '../types.js';

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Alpha' },
];

describe('HbcBreadcrumbs', () => {
  it('renders with data-hbc-ui="breadcrumbs"', () => {
    const { container } = render(<HbcBreadcrumbs items={items} />);
    expect(container.querySelector('[data-hbc-ui="breadcrumbs"]')).toBeInTheDocument();
  });

  it('renders breadcrumb items', () => {
    render(<HbcBreadcrumbs items={items} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('last item has aria-current="page"', () => {
    render(<HbcBreadcrumbs items={items} />);
    expect(screen.getByText('Alpha')).toHaveAttribute('aria-current', 'page');
  });

  it('truncates to max 3 items', () => {
    const longItems: BreadcrumbItem[] = [
      { label: 'Root', href: '/root' },
      { label: 'L1', href: '/l1' },
      { label: 'L2', href: '/l2' },
      { label: 'L3', href: '/l3' },
      { label: 'Current' },
    ];
    render(<HbcBreadcrumbs items={longItems} />);
    // Only last 3 visible + ellipsis
    expect(screen.queryByText('Root')).not.toBeInTheDocument();
    expect(screen.queryByText('L1')).not.toBeInTheDocument();
    expect(screen.getByText('L2')).toBeInTheDocument();
    expect(screen.getByText('L3')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('onNavigate fires on click', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<HbcBreadcrumbs items={items} onNavigate={onNavigate} />);
    await user.click(screen.getByText('Home'));
    expect(onNavigate).toHaveBeenCalledWith('/');
  });
});
