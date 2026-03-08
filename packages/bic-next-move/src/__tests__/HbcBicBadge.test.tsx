import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HbcBicBadge } from '../components/HbcBicBadge';
import { createMockBicConfig, mockBicStates } from '@hbc/bic-next-move/testing';
import type { MockBicItem } from '@hbc/bic-next-move/testing';
import type { IBicNextMoveState } from '../types/IBicNextMove';

// Mock useComplexity context
vi.mock('@hbc/ui-kit/app-shell', () => ({
  useComplexity: () => ({ variant: 'standard' }),
}));

function makeMockItem(state: IBicNextMoveState): MockBicItem {
  return {
    id: 'test-001',
    currentOwnerId: state.currentOwner?.userId ?? null,
    currentOwnerName: state.currentOwner?.displayName ?? null,
    currentOwnerRole: state.currentOwner?.role ?? '',
    previousOwnerId: null,
    previousOwnerName: null,
    nextOwnerId: null,
    nextOwnerName: null,
    escalationOwnerId: null,
    escalationOwnerName: null,
    expectedAction: state.expectedAction,
    dueDate: state.dueDate,
    isBlocked: state.isBlocked,
    blockedReason: state.blockedReason,
    transferHistory: [],
  };
}

describe('HbcBicBadge', () => {
  it('renders owner name in standard variant', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} />);
    expect(screen.getByText('Alice Chen')).toBeInTheDocument();
  });

  it('renders Unassigned state for null owner (D-04)', () => {
    const item = makeMockItem(mockBicStates.unassigned);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByLabelText(/unassigned/i)).toBeInTheDocument();
  });

  it('shows lock icon for blocked items in standard variant', () => {
    const item = makeMockItem(mockBicStates.blocked);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} />);
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('hides urgency dot in essential variant (D-05)', () => {
    const item = makeMockItem(mockBicStates.immediate);
    const { container } = render(
      <HbcBicBadge item={item} config={createMockBicConfig()} forceVariant="essential" />
    );
    expect(container.querySelector('.hbc-bic-badge__dot')).not.toBeInTheDocument();
  });

  it('shows action text in expert variant (D-05)', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} forceVariant="expert" />);
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
  });

  it('forceVariant overrides context variant (D-05)', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    // Context says 'standard' but force says 'expert'
    render(<HbcBicBadge item={item} config={createMockBicConfig()} forceVariant="expert" />);
    expect(screen.getByText(/complete/i)).toBeInTheDocument(); // Expert-only action text
  });

  it('renders avatar initial', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} />);
    expect(screen.getByText('A')).toBeInTheDocument(); // 'A' from Alice
  });

  it('applies custom className', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    const { container } = render(
      <HbcBicBadge item={item} config={createMockBicConfig()} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('includes due date in tooltip when dueDate present', () => {
    const item = makeMockItem(mockBicStates.watch);
    const { container } = render(
      <HbcBicBadge item={item} config={createMockBicConfig()} />
    );
    const badge = container.querySelector('.hbc-bic-badge');
    expect(badge?.getAttribute('title')).toContain('Due');
  });

  it('includes blocked reason in tooltip when blocked', () => {
    const item = makeMockItem(mockBicStates.blocked);
    const { container } = render(
      <HbcBicBadge item={item} config={createMockBicConfig()} />
    );
    const badge = container.querySelector('.hbc-bic-badge');
    expect(badge?.getAttribute('title')).toContain('Blocked');
  });

  it('builds correct aria-label for assigned owner', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} />);
    const badge = screen.getByRole('img');
    expect(badge.getAttribute('aria-label')).toContain('Ball in court: Alice Chen');
  });

  it('renders overdue state', () => {
    const item = makeMockItem(mockBicStates.overdue);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} />);
    expect(screen.getByText('Alice Chen')).toBeInTheDocument();
  });
});
