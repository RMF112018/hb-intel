import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkBadge } from './index.js';

const meta: Meta<typeof HbcMyWorkBadge> = {
  title: 'MyWorkFeed/HbcMyWorkBadge',
  component: HbcMyWorkBadge,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkBadge>;

export const Default: Story = {};

export const WithOnClick: Story = {
  args: {
    onClick: () => alert('Badge clicked'),
  },
};

export const EssentialTier: Story = {
  parameters: {
    docs: { description: { story: 'Returns null at essential tier — no visible output.' } },
  },
};
