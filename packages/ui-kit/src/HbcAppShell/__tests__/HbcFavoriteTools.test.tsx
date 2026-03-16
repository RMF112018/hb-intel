import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { HbcFavoriteTools } from '../HbcFavoriteTools.js';
import type { SidebarNavItem } from '../types.js';

const favoriteItems: SidebarNavItem[] = [
  { id: 't1', label: 'Inspections', icon: <span>I</span>, href: '/inspections', isFavorite: true },
  { id: 't2', label: 'Punch List', icon: <span>P</span>, href: '/punch', isFavorite: true },
  { id: 't3', label: 'Photos', icon: <span>Ph</span>, href: '/photos', isFavorite: false },
];

describe('HbcFavoriteTools', () => {
  it('renders nothing when no items are provided', () => {
    const { container } = render(<HbcFavoriteTools />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when no items are marked as favorite', () => {
    const items: SidebarNavItem[] = [
      { id: 'x', label: 'Unfavorited', icon: <span>U</span>, href: '/x', isFavorite: false },
    ];
    const { container } = render(<HbcFavoriteTools items={items} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders favorite items with role="toolbar"', () => {
    render(<HbcFavoriteTools items={favoriteItems} />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('displays only items marked as favorite', () => {
    render(<HbcFavoriteTools items={favoriteItems} />);
    // 2 of 3 items are favorites
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('each favorite button has an accessible label', () => {
    render(<HbcFavoriteTools items={favoriteItems} />);
    expect(screen.getByLabelText('Inspections')).toBeInTheDocument();
    expect(screen.getByLabelText('Punch List')).toBeInTheDocument();
  });
});
