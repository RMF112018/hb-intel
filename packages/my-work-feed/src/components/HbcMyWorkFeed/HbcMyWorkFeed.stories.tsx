import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkFeed } from './index.js';

const meta: Meta<typeof HbcMyWorkFeed> = {
  title: 'MyWorkFeed/HbcMyWorkFeed',
  component: HbcMyWorkFeed,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkFeed>;

export const Default: Story = {
  args: {
    onItemSelect: (item) => alert(`Selected: ${item.workItemId}`),
  },
};

export const WithQuery: Story = {
  args: {
    query: { projectId: 'proj-001', limit: 10 },
  },
};

export const Empty: Story = {
  parameters: {
    docs: { description: { story: 'Feed with no matching items — shows empty state.' } },
  },
};

export const TeamMode: Story = {
  args: {
    query: { teamMode: 'delegated-by-me' },
  },
};
