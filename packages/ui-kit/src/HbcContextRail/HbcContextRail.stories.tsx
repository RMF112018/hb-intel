import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcContextRail } from './index.js';
import type { ContextRailSection } from '../layouts/multi-column-types.js';

const MOCK_SECTIONS: ContextRailSection[] = [
  {
    id: 'next-moves',
    title: 'Next Moves',
    items: [
      { id: 'nm-1', title: 'Resolve permit blocker', subtitle: 'PM · Critical' },
      { id: 'nm-2', title: 'Complete forecast checklist', subtitle: 'PM · High' },
      { id: 'nm-3', title: 'Review milestone drift', subtitle: 'PM · High' },
    ],
  },
  {
    id: 'blockers',
    title: 'Blockers',
    items: [
      { id: 'b-1', title: 'Electrical subcontract gate blocked', subtitle: 'Urgent · 5d overdue' },
    ],
  },
  {
    id: 'queue',
    title: 'Team Queue',
    items: [
      { id: 'q-1', title: 'Safety corrective action', subtitle: 'Safety Lead · Standard' },
      { id: 'q-2', title: 'Buyout savings undispositioned', subtitle: 'PM · Standard' },
    ],
    maxItems: 5,
  },
  {
    id: 'empty-section',
    title: 'Related Records',
    items: [],
    emptyMessage: 'No related records in this context',
  },
];

const meta: Meta<typeof HbcContextRail> = {
  title: 'Composition/HbcContextRail',
  component: HbcContextRail,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcContextRail>;

export const Default: Story = {
  render: () => (
    <div style={{ height: 500, width: 300 }}>
      <HbcContextRail sections={MOCK_SECTIONS} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ height: 300, width: 300 }}>
      <HbcContextRail sections={[]} />
    </div>
  ),
};
