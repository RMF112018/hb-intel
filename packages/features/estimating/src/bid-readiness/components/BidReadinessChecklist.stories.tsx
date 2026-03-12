/**
 * SF18-T08 Storybook states and interaction checks for BidReadinessChecklist.
 *
 * @design D-SF18-T08
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { mockBidReadinessStates } from '../../../testing/mockBidReadinessStates.js';
import { BidReadinessChecklist } from './BidReadinessChecklist.js';

const meta: Meta<typeof BidReadinessChecklist> = {
  title: 'Features/Estimating/BidReadinessChecklist',
  component: BidReadinessChecklist,
};

export default meta;
type Story = StoryObj<typeof BidReadinessChecklist>;

export const StandardWorkflow: Story = {
  args: {
    viewState: mockBidReadinessStates.attentionNeeded,
    complexity: 'Standard',
    dataState: 'success',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstCheckbox = canvas.getAllByRole('checkbox')[0];
    await userEvent.click(firstCheckbox);
    await expect(canvas.getByTestId('checklist-recompute-required')).toHaveTextContent('pending');
  },
};

export const ExpertDegraded: Story = {
  args: {
    viewState: mockBidReadinessStates.savedLocallyOptimistic,
    complexity: 'Expert',
    dataState: 'degraded',
  },
};
