import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkTile } from './index.js';

const meta: Meta<typeof HbcMyWorkTile> = {
  title: 'MyWorkFeed/HbcMyWorkTile',
  component: HbcMyWorkTile,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkTile>;

export const Default: Story = {
  args: {
    projectId: 'proj-001',
  },
};

export const MaxItems: Story = {
  args: {
    projectId: 'proj-001',
    maxItems: 2,
  },
};

export const Loading: Story = {
  parameters: {
    docs: { description: { story: 'Tile in loading state with spinner.' } },
  },
  args: {
    projectId: 'proj-001',
  },
};
