import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkSourceHealth } from './index.js';

const meta: Meta<typeof HbcMyWorkSourceHealth> = {
  title: 'MyWorkFeed/HbcMyWorkSourceHealth',
  component: HbcMyWorkSourceHealth,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkSourceHealth>;

export const Live: Story = {
  args: {
    healthState: { freshness: 'live' },
  },
};

export const Cached: Story = {
  args: {
    healthState: { freshness: 'cached' },
  },
};

export const Partial: Story = {
  args: {
    healthState: {
      freshness: 'partial',
      degradedSourceCount: 1,
      warningMessage: 'BIC source returned partial data',
    },
  },
};

export const Degraded: Story = {
  args: {
    healthState: {
      freshness: 'partial',
      degradedSourceCount: 3,
      warningMessage: 'Multiple sources degraded',
      hiddenSupersededCount: 2,
    },
  },
};
