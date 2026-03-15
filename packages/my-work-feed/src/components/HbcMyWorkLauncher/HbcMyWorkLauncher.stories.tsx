import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkLauncher } from './index.js';

const meta: Meta<typeof HbcMyWorkLauncher> = {
  title: 'MyWorkFeed/HbcMyWorkLauncher',
  component: HbcMyWorkLauncher,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkLauncher>;

export const Essential: Story = {
  parameters: {
    docs: { description: { story: 'Essential tier: icon with inline count only.' } },
  },
};

export const Standard: Story = {
  parameters: {
    docs: { description: { story: 'Standard tier: HbcMyWorkBadge with panel toggle.' } },
  },
};

export const Expert: Story = {
  parameters: {
    docs: { description: { story: 'Expert tier: popover with count breakdown (now/blocked/waiting).' } },
  },
};
