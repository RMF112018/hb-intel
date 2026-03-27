import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcActivityStrip } from './index.js';
import type { ActivityStripEntry } from '../layouts/multi-column-types.js';

const MOCK_ENTRIES: ActivityStripEntry[] = [
  { id: '1', timestamp: '2026-03-27T14:30:00Z', type: 'decision', title: 'Budget confirmed', source: 'Financial', actor: 'PM' },
  { id: '2', timestamp: '2026-03-27T11:00:00Z', type: 'milestone', title: 'Foundation milestone approaching', source: 'Schedule', actor: null },
  { id: '3', timestamp: '2026-03-26T16:45:00Z', type: 'escalation', title: 'Permit escalated', source: 'Constraints', actor: 'PM' },
  { id: '4', timestamp: '2026-03-26T09:15:00Z', type: 'blocker', title: 'New critical blocker', source: 'Readiness', actor: null },
  { id: '5', timestamp: '2026-03-25T15:20:00Z', type: 'publication', title: 'Report published', source: 'Reports', actor: 'PM' },
];

const meta: Meta<typeof HbcActivityStrip> = {
  title: 'Composition/HbcActivityStrip',
  component: HbcActivityStrip,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcActivityStrip>;

export const Default: Story = {
  args: {
    entries: MOCK_ENTRIES,
    defaultCollapsed: true,
  },
};

export const Expanded: Story = {
  args: {
    entries: MOCK_ENTRIES,
    defaultCollapsed: false,
  },
};

export const Empty: Story = {
  args: {
    entries: [],
    defaultCollapsed: false,
  },
};
