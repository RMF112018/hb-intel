import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcQuickActionBar } from './index.js';
import type { QuickAction } from '../layouts/multi-column-types.js';

const MOCK_ACTIONS: QuickAction[] = [
  { id: 'capture', label: 'Capture', available: false, unavailableLabel: 'Coming soon' },
  { id: 'markup', label: 'Markup', available: false, unavailableLabel: 'Coming soon' },
  { id: 'issue', label: 'Issue', available: true },
  { id: 'checklist', label: 'Checklist', available: true },
  { id: 'review', label: 'Review', available: true },
  { id: 'full', label: 'Full Surface', available: true },
];

const meta: Meta<typeof HbcQuickActionBar> = {
  title: 'Composition/HbcQuickActionBar',
  component: HbcQuickActionBar,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcQuickActionBar>;

export const Default: Story = {
  args: {
    actions: MOCK_ACTIONS,
    onAction: (id: string) => console.log('Action:', id),
  },
};

export const AllAvailable: Story = {
  args: {
    actions: MOCK_ACTIONS.map((a) => ({ ...a, available: true })),
    onAction: (id: string) => console.log('Action:', id),
  },
};
