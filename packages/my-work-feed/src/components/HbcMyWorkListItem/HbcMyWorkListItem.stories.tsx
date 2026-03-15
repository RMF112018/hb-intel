import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkListItem } from './index.js';
import { mockMyWorkScenarios } from '../../../testing/index.js';
import { createMockMyWorkItem } from '../../../testing/index.js';

const meta: Meta<typeof HbcMyWorkListItem> = {
  title: 'MyWorkFeed/HbcMyWorkListItem',
  component: HbcMyWorkListItem,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkListItem>;

export const Active: Story = {
  args: {
    item: createMockMyWorkItem({ state: 'active', title: 'Review Transfer Request' }),
  },
};

export const Blocked: Story = {
  args: {
    item: mockMyWorkScenarios.blockedWithDependency,
  },
};

export const Overdue: Story = {
  args: {
    item: mockMyWorkScenarios.overdueOwnedAction,
  },
};

export const Unread: Story = {
  args: {
    item: mockMyWorkScenarios.unacknowledgedHandoff,
  },
};

export const Deduped: Story = {
  args: {
    item: mockMyWorkScenarios.dedupedBicNotification,
  },
};

export const Superseded: Story = {
  args: {
    item: mockMyWorkScenarios.supersededWatchItem,
  },
};
