/**
 * FieldMode stories — Demonstrates HbcAppShell in Light and Field Mode themes
 * PH4.14.4 — Field Mode (Dark Theme) Implementation
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { hbcLightTheme, hbcFieldTheme } from '../theme/theme.js';
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

const DemoContent: React.FC<{ themeName: string }> = ({ themeName }) => (
  <div style={{ padding: '24px' }}>
    <h1 style={{ margin: '0 0 8px' }}>{themeName} Dashboard</h1>
    <p style={{ margin: '0 0 16px', opacity: 0.7 }}>
      Toggle Field Mode via the user menu avatar (top-right) to switch themes at runtime.
    </p>
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {['Budget Summary', 'Schedule', 'RFI Queue', 'Submittals'].map((card) => (
        <div
          key={card}
          style={{
            padding: '16px 24px',
            borderRadius: '8px',
            border: '1px solid currentColor',
            opacity: 0.3,
            minWidth: '160px',
          }}
        >
          {card}
        </div>
      ))}
    </div>
  </div>
);

const meta: Meta<typeof HbcAppShell> = {
  title: 'Shell/FieldMode',
  component: HbcAppShell,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HbcAppShell>;

export const LightMode: Story = {
  args: {
    user: mockUser,
    sidebarGroups: mockGroups,
    mode: 'pwa',
  },
  render: (args) => (
    <FluentProvider theme={hbcLightTheme}>
      <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
        <HbcAppShell {...args}>
          <DemoContent themeName="Light Mode" />
        </HbcAppShell>
      </div>
    </FluentProvider>
  ),
};

export const FieldMode: Story = {
  args: {
    user: mockUser,
    sidebarGroups: mockGroups,
    mode: 'pwa',
  },
  render: (args) => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ background: '#0F1419', minHeight: '100vh', color: '#E8EAED' }}>
        <HbcAppShell {...args}>
          <DemoContent themeName="Field Mode" />
        </HbcAppShell>
      </div>
    </FluentProvider>
  ),
};
