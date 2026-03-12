/**
 * SF18-T08 Storybook states and interaction checks for BidReadinessSignal.
 *
 * @design D-SF18-T08
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { mockBidReadinessStates } from '../../../testing/mockBidReadinessStates.js';
import { BidReadinessSignal } from './BidReadinessSignal.js';

const meta: Meta<typeof BidReadinessSignal> = {
  title: 'Features/Estimating/BidReadinessSignal',
  component: BidReadinessSignal,
  args: {
    onOpenDashboard: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof BidReadinessSignal>;

export const ReadyEssential: Story = {
  args: {
    state: mockBidReadinessStates.ready,
    complexity: 'Essential',
    dataState: 'success',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('signal-submission-eligibility')).toBeInTheDocument();
    await expect(canvas.getByTestId('signal-bid-readiness-score')).toBeInTheDocument();
  },
};

export const AttentionNeededStandard: Story = {
  args: {
    state: mockBidReadinessStates.attentionNeeded,
    complexity: 'Standard',
    dataState: 'success',
  },
};

export const NotReadyExpert: Story = {
  args: {
    state: mockBidReadinessStates.notReady,
    complexity: 'Expert',
    dataState: 'success',
  },
};

export const SavedLocally: Story = {
  args: {
    state: mockBidReadinessStates.savedLocallyOptimistic,
    complexity: 'Standard',
    dataState: 'degraded',
  },
};

export const QueuedToSync: Story = {
  args: {
    state: mockBidReadinessStates.queuedToSyncReplayPending,
    complexity: 'Standard',
    dataState: 'degraded',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('signal-open-dashboard'));
    await expect(canvas.getByText(/Why this score\?/i)).toBeInTheDocument();
  },
};
