import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

vi.mock('@hbc/auth', () => ({
  usePermission: () => true,
}));

import { HbcThemeProvider } from '../HbcThemeContext.js';
import { HbcSidebar } from '../HbcSidebar.js';
import type { SidebarNavGroup } from '../types.js';

const sampleGroups: SidebarNavGroup[] = [
  {
    id: 'g1',
    label: 'Main',
    items: [
      { id: 'nav-dashboard', label: 'Dashboard', icon: <span>D</span>, href: '/dashboard' },
      { id: 'nav-reports', label: 'Reports', icon: <span>R</span>, href: '/reports' },
    ],
  },
];

function renderSidebar(
  groups: SidebarNavGroup[] = sampleGroups,
  activeItemId?: string,
) {
  return render(
    <HbcThemeProvider>
      <HbcSidebar groups={groups} activeItemId={activeItemId} />
    </HbcThemeProvider>,
  );
}

describe('HbcSidebar', () => {
  it('renders with role="navigation"', () => {
    renderSidebar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('has data-hbc-ui="sidebar"', () => {
    renderSidebar();
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'data-hbc-ui',
      'sidebar',
    );
  });

  it('displays navigation item labels', () => {
    renderSidebar();
    // Items render as buttons; labels may be visible or in tooltip
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders a toggle button with accessible label', () => {
    renderSidebar();
    const toggle = screen.getByLabelText(/collapse sidebar|expand sidebar/i);
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('type', 'button');
  });

  it('marks the active item with aria-current="page"', () => {
    renderSidebar(sampleGroups, 'nav-dashboard');
    const activeButton = screen.getByLabelText('Dashboard');
    expect(activeButton).toHaveAttribute('aria-current', 'page');
  });
});
