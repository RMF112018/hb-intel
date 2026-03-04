import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcAppShell } from '../HbcAppShell/HbcAppShell.js';
import { ToolLandingLayout } from './ToolLandingLayout.js';
import { BudgetLine, DrawingSheet, RFI } from '../icons/index.js';
import type { SidebarNavGroup, ShellUser } from '../HbcAppShell/types.js';
import type { KpiCardData, LayoutAction, StatusBarData } from './types.js';

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
    ],
  },
];

const mockKpiCards: KpiCardData[] = [
  { id: 'open', label: 'Open Items', value: 42, trend: 'up', trendValue: '+5 this week' },
  { id: 'overdue', label: 'Overdue', value: 7, trend: 'down', trendValue: '-2 this week' },
  { id: 'closed', label: 'Closed (30d)', value: 128, trend: 'up', trendValue: '+18%' },
  { id: 'avg', label: 'Avg Response', value: '3.2d', trend: 'flat', trendValue: 'No change' },
];

const mockPrimaryAction: LayoutAction = {
  key: 'create',
  label: 'New RFI',
  onClick: () => {},
  primary: true,
};

const mockSecondaryActions: LayoutAction[] = [
  { key: 'export', label: 'Export', onClick: () => {} },
  { key: 'import', label: 'Import', onClick: () => {} },
];

const mockStatusBar: StatusBarData = {
  showing: 42,
  total: 156,
  lastSynced: '2 minutes ago',
};

const meta: Meta<typeof ToolLandingLayout> = {
  title: 'Layouts/ToolLandingLayout',
  component: ToolLandingLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ToolLandingLayout>;

export const Default: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <ToolLandingLayout
        toolName="RFIs"
        primaryAction={mockPrimaryAction}
        secondaryActions={mockSecondaryActions}
        statusBar={mockStatusBar}
      >
        <div style={{ padding: '16px', color: '#6B7280' }}>
          <p>Data table or list content goes here.</p>
        </div>
      </ToolLandingLayout>
    </HbcAppShell>
  ),
};

export const WithKpiCards: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <ToolLandingLayout
        toolName="RFIs"
        primaryAction={mockPrimaryAction}
        secondaryActions={mockSecondaryActions}
        kpiCards={mockKpiCards}
        statusBar={mockStatusBar}
        commandBar={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.875rem', color: '#6B7280' }}>
            <span>Filter: All</span>
            <span>|</span>
            <span>Sort: Date</span>
          </div>
        }
      >
        <div style={{ padding: '16px', color: '#6B7280' }}>
          <p>Content area with KPI cards above and command bar.</p>
        </div>
      </ToolLandingLayout>
    </HbcAppShell>
  ),
};

export const NoActions: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <ToolLandingLayout toolName="Dashboard">
        <div style={{ padding: '16px', color: '#6B7280' }}>
          <p>A simple tool landing with no actions or status bar.</p>
        </div>
      </ToolLandingLayout>
    </HbcAppShell>
  ),
};

export const MobileView: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <ToolLandingLayout
        toolName="RFIs"
        primaryAction={mockPrimaryAction}
        kpiCards={mockKpiCards}
        statusBar={mockStatusBar}
      >
        <div style={{ padding: '16px', color: '#6B7280' }}>
          <p>Mobile layout — KPI cards stack to single column.</p>
        </div>
      </ToolLandingLayout>
    </HbcAppShell>
  ),
};
