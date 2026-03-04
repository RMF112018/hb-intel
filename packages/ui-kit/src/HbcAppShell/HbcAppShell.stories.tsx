import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcAppShell } from './HbcAppShell.js';
import { Home, BudgetLine, DrawingSheet, RFI, Submittal, Settings } from '../icons/index.js';
import type { SidebarNavGroup, ShellUser } from './types.js';

const mockUser: ShellUser = {
  id: '1',
  displayName: 'John Smith',
  email: 'john.smith@hbconstruction.com',
  initials: 'JS',
};

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

const meta: Meta<typeof HbcAppShell> = {
  title: 'Shell/HbcAppShell',
  component: HbcAppShell,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HbcAppShell>;

export const FullLight: Story = {
  args: {
    user: mockUser,
    sidebarGroups: mockGroups,
    mode: 'pwa',
  },
  render: (args) => (
    <HbcAppShell {...args}>
      <div style={{ padding: '24px' }}>
        <h1>Dashboard</h1>
        <p>Main content area. Resize the browser to test sidebar responsiveness.</p>
      </div>
    </HbcAppShell>
  ),
};

export const FullFieldMode: Story = {
  args: {
    user: mockUser,
    sidebarGroups: mockGroups,
    mode: 'pwa',
  },
  render: (args) => (
    <HbcAppShell {...args}>
      <div style={{ padding: '24px' }}>
        <h1>Field Mode Dashboard</h1>
        <p>Toggle Field Mode via the user menu avatar to see the theme switch.</p>
      </div>
    </HbcAppShell>
  ),
};
