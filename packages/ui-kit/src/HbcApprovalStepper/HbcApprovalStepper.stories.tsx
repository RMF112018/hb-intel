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

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Vertical (default)</p>
        <HbcApprovalStepper
          steps={[
            { id: '1', userName: 'Alice Wong', userRole: 'Manager', decision: 'approved', timestamp: '2026-03-01T10:00:00Z' },
            { id: '2', userName: 'Bob Smith', userRole: 'Director', decision: 'rejected', timestamp: '2026-03-01T11:00:00Z', comment: 'Needs revision.' },
            { id: '3', userName: 'Carol Davis', userRole: 'VP', decision: 'pending' },
            { id: '4', userName: 'Dan Lee', userRole: 'Executive', decision: 'skipped' },
          ]}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Horizontal</p>
        <HbcApprovalStepper steps={sampleSteps} orientation="horizontal" />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
      <HbcApprovalStepper steps={sampleSteps} />
    </div>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
        Stepper uses ordered list semantics. Decision status conveyed via icon shape and aria-label.
        Comments are read by screen readers as part of each step.
      </p>
      <HbcApprovalStepper steps={sampleSteps} />
    </div>
  ),
};

export const Horizontal: Story = {
  args: {
    steps: sampleSteps,
    orientation: 'horizontal',
  },
};
