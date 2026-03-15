import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkPlanningBar } from './index.js';

const meta: Meta<typeof HbcMyWorkPlanningBar> = {
  title: 'MyWorkFeed/HbcMyWorkPlanningBar',
  component: HbcMyWorkPlanningBar,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkPlanningBar>;

export const Default: Story = {};

export const WithCounts: Story = {
  args: {
    counts: {
      totalCount: 12,
      unreadCount: 5,
      nowCount: 4,
      blockedCount: 2,
      waitingCount: 3,
      deferredCount: 1,
    },
  },
};

export const EssentialHidden: Story = {
  parameters: {
    docs: { description: { story: 'Returns null at essential tier — no visible output.' } },
  },
};
