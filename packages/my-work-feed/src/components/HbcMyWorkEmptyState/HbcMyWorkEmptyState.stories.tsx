import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkEmptyState } from './index.js';

const meta: Meta<typeof HbcMyWorkEmptyState> = {
  title: 'MyWorkFeed/HbcMyWorkEmptyState',
  component: HbcMyWorkEmptyState,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkEmptyState>;

export const PanelVariant: Story = {
  args: {
    variant: 'panel',
  },
};

export const FeedVariant: Story = {
  args: {
    variant: 'feed',
  },
};
