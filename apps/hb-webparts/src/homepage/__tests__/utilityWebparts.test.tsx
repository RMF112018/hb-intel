import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriorityActionsRail } from '../../webparts/priorityActionsRail/PriorityActionsRail.js';
import { ToolLauncherWorkHub } from '../../webparts/toolLauncherWorkHub/ToolLauncherWorkHub.js';

describe('Prompt-05 utility webparts', () => {
  it('renders action badges and deterministic focus/link order', () => {
    render(
      <PriorityActionsRail
        config={{
          groups: [{ id: 'today', title: 'Today', order: 1 }],
          actions: [
            { id: 'second', title: 'Second Action', href: '/second', group: 'today', order: 2 },
            { id: 'first', title: 'First Action', href: '/first', group: 'today', order: 1, badge: { label: 'Due', variant: 'warning' } },
          ],
        }}
      />,
    );

    const labels = screen.getAllByRole('link').map((node) => node.textContent?.trim());
    expect(labels).toEqual(['First Action', 'Second Action']);
    expect(screen.getByText('Due')).not.toBeNull();
  });

  it('renders empty and loading states gracefully', () => {
    const { rerender } = render(<PriorityActionsRail config={{ actions: [] }} />);
    expect(screen.getByText('No priority actions configured')).not.toBeNull();

    rerender(<ToolLauncherWorkHub isLoading />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('renders grouped launcher hubs with visibility filtering', () => {
    render(
      <ToolLauncherWorkHub
        activeAudience="field"
        config={{
          groups: [
            {
              id: 'field',
              title: 'Field Systems',
              order: 1,
              items: [
                { id: 'safety', title: 'Safety Center', href: '/safety', audiences: ['field'], iconKey: 'safety' },
                { id: 'admin', title: 'Admin Console', href: '/admin', audiences: ['admin'] },
              ],
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Field Systems')).not.toBeNull();
    expect(screen.getByRole('link', { name: /Safety Center/ })).not.toBeNull();
    expect(screen.queryByRole('link', { name: /Admin Console/ })).toBeNull();
  });
});
