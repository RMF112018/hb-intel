import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcSyncStatusBar } from './index.js';

const meta: Meta<typeof HbcSyncStatusBar> = {
  title: 'Composition/HbcSyncStatusBar',
  component: HbcSyncStatusBar,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcSyncStatusBar>;

export const Synced: Story = {
  args: { state: 'synced', pendingCount: 0, failedCount: 0, lastSyncLabel: 'Just now' },
};

export const Syncing: Story = {
  args: { state: 'syncing', pendingCount: 3, failedCount: 0, lastSyncLabel: '2 min ago' },
};

export const Pending: Story = {
  args: { state: 'pending', pendingCount: 5, failedCount: 0, lastSyncLabel: '10 min ago' },
};

export const Failed: Story = {
  args: { state: 'failed', pendingCount: 2, failedCount: 3, lastSyncLabel: '30 min ago' },
};
