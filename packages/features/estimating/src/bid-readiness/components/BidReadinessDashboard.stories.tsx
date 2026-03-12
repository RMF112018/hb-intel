/**
 * SF18-T08 Storybook states and interaction checks for BidReadinessDashboard.
 *
 * @design D-SF18-T08
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { mockBidReadinessStates } from '../../../testing/mockBidReadinessStates.js';
import { BidReadinessDashboard } from './BidReadinessDashboard.js';

const meta: Meta<typeof BidReadinessDashboard> = {
  title: 'Features/Estimating/BidReadinessDashboard',
  component: BidReadinessDashboard,
};

export default meta;
type Story = StoryObj<typeof BidReadinessDashboard>;

export const ReadyStandard: Story = {
  args: {
    state: mockBidReadinessStates.ready,
    complexity: 'Standard',
    dataState: 'success',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('dashboard-submission-eligibility')).toBeInTheDocument();
    await expect(canvas.getByTestId('dashboard-completeness')).toBeInTheDocument();
  },
};

export const AttentionNeededWithBlockers: Story = {
  args: {
    state: mockBidReadinessStates.attentionNeeded,
    complexity: 'Standard',
    dataState: 'success',
  },
};

export const DueWithin48hWithBlockers: Story = {
  args: {
    state: mockBidReadinessStates.dueWithin48hWithBlockers,
    complexity: 'Expert',
    dataState: 'success',
  },
};

export const DegradedQueuedToSync: Story = {
  args: {
    state: mockBidReadinessStates.queuedToSyncReplayPending,
    complexity: 'Standard',
    dataState: 'degraded',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('dashboard-degraded-copy')).toBeInTheDocument();
  },
};
