import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createComplexityWrapper } from '@hbc/complexity/testing';
import { HbcStatusTimeline } from '../index.js';
import type { IStatusEntry } from '../types.js';

const entries: IStatusEntry[] = [
  { status: 'draft', timestamp: '2026-03-01T08:00:00Z', actor: 'Alice' },
  { status: 'approved', timestamp: '2026-03-02T10:00:00Z' },
];

describe('HbcStatusTimeline', () => {
  it('renders with data-hbc-ui="HbcStatusTimeline" at standard tier', () => {
    const { container } = render(
      <HbcStatusTimeline statuses={entries} />,
      { wrapper: createComplexityWrapper('standard') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcStatusTimeline"]'),
    ).toBeInTheDocument();
  });

  it('has role="list" with aria-label="Status timeline"', () => {
    render(
      <HbcStatusTimeline statuses={entries} />,
      { wrapper: createComplexityWrapper('standard') },
    );
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label', 'Status timeline');
  });

  it('renders one role="listitem" per status entry', () => {
    render(
      <HbcStatusTimeline statuses={entries} />,
      { wrapper: createComplexityWrapper('standard') },
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('displays status text, timestamp, and actor', () => {
    render(
      <HbcStatusTimeline statuses={entries} />,
      { wrapper: createComplexityWrapper('standard') },
    );
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText(/2026-03-01/)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  it('omits actor text when not provided', () => {
    render(
      <HbcStatusTimeline statuses={[{ status: 'pending', timestamp: '2026-03-03' }]} />,
      { wrapper: createComplexityWrapper('standard') },
    );
    // Only status and timestamp, no dash-actor
    const listitem = screen.getByRole('listitem');
    expect(listitem).toHaveTextContent('pending');
    expect(listitem).toHaveTextContent('2026-03-03');
    expect(listitem).not.toHaveTextContent('—');
  });

  it('returns null at essential tier (standard-gated)', () => {
    const { container } = render(
      <HbcStatusTimeline statuses={entries} />,
      { wrapper: createComplexityWrapper('essential') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcStatusTimeline"]'),
    ).not.toBeInTheDocument();
  });

  it('preserves data-show-future attribute', () => {
    const { container } = render(
      <HbcStatusTimeline statuses={entries} showFuture />,
      { wrapper: createComplexityWrapper('standard') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcStatusTimeline"]'),
    ).toHaveAttribute('data-show-future', 'true');
  });
});
