import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkPanel } from './index.js';

const meta: Meta<typeof HbcMyWorkPanel> = {
  title: 'MyWorkFeed/HbcMyWorkPanel',
  component: HbcMyWorkPanel,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkPanel>;

export const Open: Story = {
  args: {
    onOpenFeed: () => alert('View All clicked'),
  },
};

export const Loading: Story = {
  parameters: {
    docs: { description: { story: 'Panel in loading state with spinner.' } },
  },
};

export const Empty: Story = {
  parameters: {
    docs: { description: { story: 'Panel with no work items — shows empty state.' } },
  },
};

export const Grouped: Story = {
  parameters: {
    docs: { description: { story: 'Panel with grouped items by lane (standard/expert tiers).' } },
  },
};
