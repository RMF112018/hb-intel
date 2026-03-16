import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { HbcBottomNav } from '../index.js';
import type { BottomNavItem } from '../types.js';

const items: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: <span>H</span>, href: '/' },
  { id: 'search', label: 'Search', icon: <span>S</span>, href: '/search' },
  { id: 'profile', label: 'Profile', icon: <span>P</span>, href: '/profile' },
];

describe('HbcBottomNav', () => {
  it('renders with data-hbc-ui="bottom-nav"', () => {
    render(<HbcBottomNav items={items} />);
    expect(document.querySelector('[data-hbc-ui="bottom-nav"]')).toBeInTheDocument();
  });

  it('renders nav items', () => {
    render(<HbcBottomNav items={items} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('active item highlighted with aria-current="page"', () => {
    render(<HbcBottomNav items={items} activeId="search" />);
    const searchButton = screen.getByText('Search').closest('button')!;
    expect(searchButton).toHaveAttribute('aria-current', 'page');
    // Non-active items should not have aria-current
    const homeButton = screen.getByText('Home').closest('button')!;
    expect(homeButton).not.toHaveAttribute('aria-current');
  });

  it('onClick fires onNavigate with correct href', async () => {
    const user = userEvent.setup();
    const handleNavigate = vi.fn();
    render(<HbcBottomNav items={items} onNavigate={handleNavigate} />);
    await user.click(screen.getByText('Search').closest('button')!);
    expect(handleNavigate).toHaveBeenCalledWith('/search');
  });

  it('role="navigation" present', () => {
    render(<HbcBottomNav items={items} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
