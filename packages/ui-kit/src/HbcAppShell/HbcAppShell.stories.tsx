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

export const Default: Story = {
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

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>PWA mode</p>
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <HbcAppShell user={mockUser} sidebarGroups={mockGroups} mode="pwa">
            <div style={{ padding: '24px' }}>
              <h2>PWA Mode</h2>
              <p>Full app shell with sidebar, header, connectivity bar.</p>
            </div>
          </HbcAppShell>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>SPFx mode</p>
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <HbcAppShell user={mockUser} sidebarGroups={mockGroups} mode="spfx">
            <div style={{ padding: '24px' }}>
              <h2>SPFx Mode</h2>
              <p>Embedded in SharePoint — no sidebar, streamlined header.</p>
            </div>
          </HbcAppShell>
        </div>
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
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

/** @deprecated Use FieldMode instead */
export const FullFieldMode: Story = FieldMode;

export const A11yTest: Story = {
  name: 'A11y Test (Landmarks + Keyboard)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Verify landmark roles: <code>banner</code> (header), <code>navigation</code> (sidebar),
        <code> main</code> (content area). Tab through shell to verify focus order:
        header → sidebar → main content. Skip-to-content link should appear on first Tab.
      </p>
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups} mode="pwa">
        <div style={{ padding: '24px' }}>
          <h1>A11y Test Content</h1>
          <p>Focus should reach this content area after navigating through shell controls.</p>
        </div>
      </HbcAppShell>
    </div>
  ),
};
