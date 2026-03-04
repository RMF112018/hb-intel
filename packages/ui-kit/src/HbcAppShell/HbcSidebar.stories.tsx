import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcSidebar } from './HbcSidebar.js';
import { Home, BudgetLine, DrawingSheet, Settings, RFI, Submittal } from '../icons/index.js';
import type { SidebarNavGroup } from './types.js';

const mockGroups: SidebarNavGroup[] = [
  {
    id: 'preconstruction',
    label: 'Preconstruction',
    items: [
      { id: 'estimating', label: 'Estimating', icon: <BudgetLine size="md" />, href: '/estimating' },
      { id: 'drawings', label: 'Drawings', icon: <DrawingSheet size="md" />, href: '/drawings' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'rfis', label: 'RFIs', icon: <RFI size="md" />, href: '/rfis' },
      { id: 'submittals', label: 'Submittals', icon: <Submittal size="md" />, href: '/submittals' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    requiredPermission: 'admin:*',
    items: [
      { id: 'settings', label: 'Settings', icon: <Settings size="md" />, href: '/settings' },
    ],
  },
];

const meta: Meta<typeof HbcSidebar> = {
  title: 'Shell/HbcSidebar',
  component: HbcSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ paddingTop: '58px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HbcSidebar>;

export const Expanded: Story = {
  args: {
    groups: mockGroups,
    activeItemId: 'estimating',
  },
};

export const Collapsed: Story = {
  args: {
    groups: mockGroups,
    activeItemId: 'rfis',
  },
};

export const RoleFiltered: Story = {
  args: {
    groups: mockGroups,
    activeItemId: 'estimating',
  },
};
