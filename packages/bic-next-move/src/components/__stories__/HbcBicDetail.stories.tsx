import type { Meta, StoryObj } from '@storybook/react';
import { HbcBicDetail } from '../HbcBicDetail';
import { createMockBicConfig, createMockBicOwner, mockBicStates } from '../../../testing';
import type { MockBicItem } from '../../../testing';
import type { IBicNextMoveState } from '../../types/IBicNextMove';

function makeMockItem(state: IBicNextMoveState): MockBicItem {
  return {
    id: 'story-001',
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

const meta: Meta<typeof HbcBicDetail> = {
  title: 'BIC / HbcBicDetail',
  component: HbcBicDetail,
  argTypes: {
    forceVariant: {
      control: { type: 'select' },
      options: ['essential', 'standard', 'expert'],
    },
    showChain: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof HbcBicDetail>;

export const Upcoming: Story = {
  args: {
    item: makeMockItem(mockBicStates.upcoming),
    config: createMockBicConfig(),
  },
};

export const Watch: Story = {
  args: {
    item: makeMockItem(mockBicStates.watch),
    config: createMockBicConfig(),
  },
};

export const Immediate: Story = {
  args: {
    item: makeMockItem(mockBicStates.immediate),
    config: createMockBicConfig(),
  },
};

export const Overdue: Story = {
  args: {
    item: makeMockItem(mockBicStates.overdue),
    config: createMockBicConfig(),
  },
};

export const Blocked: Story = {
  args: {
    item: makeMockItem(mockBicStates.blocked),
    config: createMockBicConfig(),
    blockedByItem: { label: 'Structural Review', href: '/structural/review/123' },
    onNavigate: (href: string) => console.log('Navigate to:', href),
  },
};

export const Unassigned: Story = {
  args: {
    item: makeMockItem(mockBicStates.unassigned),
    config: createMockBicConfig(),
  },
};

export const WithFullChain: Story = {
  args: {
    item: makeMockItem(mockBicStates.withFullChain),
    config: makeConfigWithHistory(),
    forceVariant: 'expert',
    showChain: true,
  },
};
