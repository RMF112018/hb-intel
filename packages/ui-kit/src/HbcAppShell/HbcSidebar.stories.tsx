import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcSidebar } from './HbcSidebar.js';
import { hbcFieldTheme } from '../theme/theme.js';
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

export const Default: Story = {
  args: {
    groups: mockGroups,
    activeItemId: 'estimating',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Expanded</p>
        <HbcSidebar groups={mockGroups} activeItemId="estimating" />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Collapsed</p>
        <HbcSidebar groups={mockGroups} activeItemId="rfis" />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Role-filtered</p>
        <HbcSidebar groups={mockGroups} activeItemId="estimating" />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '24px', backgroundColor: '#0F1419' }}>
        <HbcSidebar groups={mockGroups} activeItemId="estimating" />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Arrow Keys + Screen Reader)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Use arrow keys to navigate between sidebar items. Each group has a
        <code> role=&quot;group&quot;</code> with <code>aria-label</code>.
        Active item is announced via <code>aria-current=&quot;page&quot;</code>.
      </p>
      <HbcSidebar groups={mockGroups} activeItemId="estimating" />
    </div>
  ),
};
