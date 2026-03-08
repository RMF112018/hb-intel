import type { Meta, StoryObj } from '@storybook/react';
import { HbcBicBadge } from '../HbcBicBadge';
import { createMockBicConfig, mockBicStates } from '../../../testing';
import type { MockBicItem } from '../../../testing';
import type { IBicNextMoveState } from '../../types/IBicNextMove';

function makeMockItem(state: IBicNextMoveState): MockBicItem {
  return {
    id: 'story-001',
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

const meta: Meta<typeof HbcBicBadge> = {
  title: 'BIC / HbcBicBadge',
  component: HbcBicBadge,
  argTypes: {
    forceVariant: {
      control: { type: 'select' },
      options: ['essential', 'standard', 'expert'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof HbcBicBadge>;

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
    config: createMockBicConfig(),
    forceVariant: 'expert',
  },
};
