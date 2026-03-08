import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HbcBicDetail } from '../components/HbcBicDetail';
import { createMockBicConfig, mockBicStates } from '@hbc/bic-next-move/testing';
import type { MockBicItem } from '@hbc/bic-next-move/testing';
import type { IBicNextMoveState } from '../types/IBicNextMove';
import { createMockBicOwner } from '@hbc/bic-next-move/testing';

// Mock useComplexity context
vi.mock('@hbc/ui-kit', () => ({
  useComplexity: () => ({ variant: 'standard' }),
}));

function makeMockItem(state: IBicNextMoveState): MockBicItem {
  return {
    id: 'test-001',
    currentOwnerId: state.currentOwner?.userId ?? null,
    currentOwnerName: state.currentOwner?.displayName ?? null,
    currentOwnerRole: state.currentOwner?.role ?? '',
    previousOwnerId: state.previousOwner?.userId ?? null,
    previousOwnerName: state.previousOwner?.displayName ?? null,
    nextOwnerId: state.nextOwner?.userId ?? null,
    nextOwnerName: state.nextOwner?.displayName ?? null,
    escalationOwnerId: state.escalationOwner?.userId ?? null,
    escalationOwnerName: state.escalationOwner?.displayName ?? null,
    expectedAction: state.expectedAction,
    dueDate: state.dueDate,
    isBlocked: state.isBlocked,
    blockedReason: state.blockedReason,
    transferHistory: [],
  };
}

function makeConfigWithHistory() {
  return createMockBicConfig({
    resolveTransferHistory: () => mockBicStates.withFullChain.transferHistory,
    resolvePreviousOwner: (item) => {
      if (!item.previousOwnerId || !item.previousOwnerName) return null;
      return createMockBicOwner({ userId: item.previousOwnerId, displayName: item.previousOwnerName, role: 'Previous Role' });
    },
    resolveNextOwner: (item) => {
      if (!item.nextOwnerId || !item.nextOwnerName) return null;
      return createMockBicOwner({ userId: item.nextOwnerId, displayName: item.nextOwnerName, role: 'Next Role' });
    },
    resolveEscalationOwner: (item) => {
      if (!item.escalationOwnerId || !item.escalationOwnerName) return null;
      return createMockBicOwner({ userId: item.escalationOwnerId, displayName: item.escalationOwnerName, role: 'VP Operations' });
    },
  });
}

describe('HbcBicDetail', () => {
  it('renders current owner and expected action', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    render(<HbcBicDetail item={item} config={createMockBicConfig()} />);
    expect(screen.getByText('Alice Chen')).toBeInTheDocument();
    expect(screen.getByText(mockBicStates.upcoming.expectedAction)).toBeInTheDocument();
  });

  it('renders due date in standard variant', () => {
    const item = makeMockItem(mockBicStates.watch);
    render(<HbcBicDetail item={item} config={createMockBicConfig()} />);
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('renders unassigned callout for null owner (D-04)', () => {
    const item = makeMockItem(mockBicStates.unassigned);
    render(<HbcBicDetail item={item} config={createMockBicConfig()} />);
    expect(screen.getByText(/no current owner/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders blocked banner when blocked in standard variant (D-05)', () => {
    const item = makeMockItem(mockBicStates.blocked);
    render(<HbcBicDetail item={item} config={createMockBicConfig()} />);
    expect(screen.getByText(mockBicStates.blocked.blockedReason!)).toBeInTheDocument();
  });

  it('hides due date and blocked banner in essential variant (D-05)', () => {
    const item = makeMockItem(mockBicStates.blocked);
    render(<HbcBicDetail item={item} config={createMockBicConfig()} forceVariant="essential" />);
    expect(screen.queryByLabelText(/due date/i)).not.toBeInTheDocument();
    expect(screen.queryByText(mockBicStates.blocked.blockedReason!)).not.toBeInTheDocument();
  });

  it('shows ownership chain in expert variant (D-08)', () => {
    const item = makeMockItem(mockBicStates.withFullChain);
    render(<HbcBicDetail item={item} config={makeConfigWithHistory()} forceVariant="expert" />);
    expect(screen.getByLabelText('Ownership chain')).toBeInTheDocument();
  });

  it('shows transfer history toggle in expert variant (D-08)', () => {
    const item = makeMockItem(mockBicStates.withFullChain);
    render(<HbcBicDetail item={item} config={makeConfigWithHistory()} forceVariant="expert" />);
    const toggle = screen.getByText(/full ownership history/i);
    expect(toggle).toBeInTheDocument();
  });

  it('expands transfer history on toggle click (D-08)', () => {
    const item = makeMockItem(mockBicStates.withFullChain);
    render(<HbcBicDetail item={item} config={makeConfigWithHistory()} forceVariant="expert" />);
    const toggle = screen.getByText(/show full ownership history/i);
    fireEvent.click(toggle);
    expect(screen.getByLabelText('Transfer history')).toBeInTheDocument();
  });

  it('shows escalation owner in expert variant', () => {
    const item = makeMockItem(mockBicStates.withFullChain);
    render(<HbcBicDetail item={item} config={makeConfigWithHistory()} forceVariant="expert" />);
    expect(screen.getByText(/escalates to/i)).toBeInTheDocument();
    expect(screen.getByText('David Park')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    const { container } = render(
      <HbcBicDetail item={item} config={createMockBicConfig()} className="my-detail" />
    );
    expect(container.querySelector('.my-detail')).toBeInTheDocument();
  });

  it('renders groupContext when present on owner', () => {
    const stateWithGroup = {
      ...mockBicStates.upcoming,
      currentOwner: { ...mockBicStates.upcoming.currentOwner!, groupContext: 'Estimating Department' },
    };
    const item = makeMockItem(stateWithGroup);
    const config = createMockBicConfig({
      resolveCurrentOwner: () => ({
        userId: 'u-alice',
        displayName: 'Alice Chen',
        role: 'BD Manager',
        groupContext: 'Estimating Department',
      }),
    });
    render(<HbcBicDetail item={item} config={config} />);
    expect(screen.getByText('Estimating Department')).toBeInTheDocument();
  });

  it('shows chain when showChain prop is true even in standard variant', () => {
    const item = makeMockItem(mockBicStates.withFullChain);
    render(<HbcBicDetail item={item} config={makeConfigWithHistory()} showChain={true} />);
    expect(screen.getByLabelText('Ownership chain')).toBeInTheDocument();
  });

  it('renders overdue CSS class when overdue', () => {
    const item = makeMockItem(mockBicStates.overdue);
    const { container } = render(<HbcBicDetail item={item} config={createMockBicConfig()} />);
    expect(container.querySelector('.hbc-bic-detail__due--overdue')).toBeInTheDocument();
  });

  it('renders transfer row with null fromOwner as "Assigned to"', () => {
    const config = createMockBicConfig({
      resolveTransferHistory: () => [
        {
          fromOwner: null,
          toOwner: { userId: 'u-carol', displayName: 'Carol Kim', role: 'EC' },
          transferredAt: new Date().toISOString(),
          action: 'Initial assignment',
        },
      ],
    });
    const item = makeMockItem(mockBicStates.upcoming);
    render(<HbcBicDetail item={item} config={config} forceVariant="expert" />);
    const toggle = screen.getByText(/full ownership history/i);
    fireEvent.click(toggle);
    expect(screen.getByText(/assigned to carol kim/i)).toBeInTheDocument();
  });

  it('renders transfer row with fromOwner showing arrow notation', () => {
    const config = createMockBicConfig({
      resolveTransferHistory: () => [
        {
          fromOwner: { userId: 'u-alice', displayName: 'Alice Chen', role: 'PM' },
          toOwner: { userId: 'u-bob', displayName: 'Bob Torres', role: 'Director' },
          transferredAt: new Date().toISOString(),
          action: 'Submitted for review',
        },
      ],
    });
    const item = makeMockItem(mockBicStates.upcoming);
    render(<HbcBicDetail item={item} config={config} forceVariant="expert" />);
    const toggle = screen.getByText(/full ownership history/i);
    fireEvent.click(toggle);
    expect(screen.getByText(/alice chen → bob torres/i)).toBeInTheDocument();
  });

  it('does not show escalation when dueDate is null', () => {
    const stateNoDue = { ...mockBicStates.upcoming, dueDate: null };
    const item = makeMockItem(stateNoDue);
    render(<HbcBicDetail item={item} config={createMockBicConfig()} forceVariant="expert" />);
    expect(screen.queryByText(/escalates to/i)).not.toBeInTheDocument();
  });
});
