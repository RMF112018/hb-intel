import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcTabs } from '../index.js';
import type { LayoutTab } from '../types.js';

const tabs: LayoutTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'history', label: 'History' },
];

describe('HbcTabs', () => {
  it('renders with data-hbc-ui="tabs"', () => {
    const { container } = render(
      <HbcTabs tabs={tabs} activeTabId="overview" onTabChange={() => {}} />,
    );
    expect(container.querySelector('[data-hbc-ui="tabs"]')).toBeInTheDocument();
  });

  it('renders tab buttons', () => {
    render(<HbcTabs tabs={tabs} activeTabId="overview" onTabChange={() => {}} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('active tab has aria-selected="true"', () => {
    render(<HbcTabs tabs={tabs} activeTabId="details" onTabChange={() => {}} />);
    expect(screen.getByText('Details').closest('[role="tab"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Overview').closest('[role="tab"]')).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('role="tablist" on container', () => {
    const { container } = render(
      <HbcTabs tabs={tabs} activeTabId="overview" onTabChange={() => {}} />,
    );
    expect(container.querySelector('[role="tablist"]')).toBeInTheDocument();
  });

  it('onTabChange fires on click', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<HbcTabs tabs={tabs} activeTabId="overview" onTabChange={onTabChange} />);
    await user.click(screen.getByText('History'));
    expect(onTabChange).toHaveBeenCalledWith('history');
  });
});
