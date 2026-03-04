/**
 * HbcApprovalStepper — Storybook stories
 * PH4.13 §13.3 | Blueprint §1d
 */
import type { Meta, StoryObj } from '@storybook/react';
import { HbcApprovalStepper } from './index.js';
import type { ApprovalStep } from './types.js';

const sampleSteps: ApprovalStep[] = [
  {
    id: '1',
    userName: 'Sarah Chen',
    userRole: 'Project Manager',
    decision: 'approved',
    timestamp: '2026-02-28T14:30:00Z',
    comment: 'Looks good, approved.',
  },
  {
    id: '2',
    userName: 'Mike Torres',
    userRole: 'Safety Director',
    decision: 'approved',
    timestamp: '2026-03-01T09:15:00Z',
  },
  {
    id: '3',
    userName: 'Jessica Park',
    userRole: 'VP Operations',
    decision: 'pending',
  },
];

const meta: Meta<typeof HbcApprovalStepper> = {
  title: 'Components/HbcApprovalStepper',
  component: HbcApprovalStepper,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcApprovalStepper>;

export const Default: Story = {
  args: {
    steps: sampleSteps,
  },
};

export const AllDecisions: Story = {
  args: {
    steps: [
      { id: '1', userName: 'Alice Wong', userRole: 'Manager', decision: 'approved', timestamp: '2026-03-01T10:00:00Z' },
      { id: '2', userName: 'Bob Smith', userRole: 'Director', decision: 'rejected', timestamp: '2026-03-01T11:00:00Z', comment: 'Needs revision on section 3.' },
      { id: '3', userName: 'Carol Davis', userRole: 'VP', decision: 'pending' },
      { id: '4', userName: 'Dan Lee', userRole: 'Executive', decision: 'skipped' },
    ],
  },
};

export const Horizontal: Story = {
  args: {
    steps: sampleSteps,
    orientation: 'horizontal',
  },
};
