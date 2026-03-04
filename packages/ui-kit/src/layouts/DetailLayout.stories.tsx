import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcAppShell } from '../HbcAppShell/HbcAppShell.js';
import { DetailLayout } from './DetailLayout.js';
import { RFI } from '../icons/index.js';
import { HbcStatusBadge } from '../HbcStatusBadge/index.js';
import type { SidebarNavGroup, ShellUser } from '../HbcAppShell/types.js';
import type { BreadcrumbItem, LayoutAction, LayoutTab } from './types.js';

const mockUser: ShellUser = {
  id: '1',
  displayName: 'John Smith',
  email: 'john.smith@hbconstruction.com',
  initials: 'JS',
};

const mockGroups: SidebarNavGroup[] = [
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'rfis', label: 'RFIs', icon: <RFI size="md" />, href: '/rfis' },
    ],
  },
];

const mockBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Operations', href: '/operations' },
  { label: 'RFIs', href: '/rfis' },
  { label: 'RFI-042' },
];

const mockActions: LayoutAction[] = [
  { key: 'edit', label: 'Edit', onClick: () => {} },
  { key: 'export', label: 'Export PDF', onClick: () => {} },
];

const mockTabs: LayoutTab[] = [
  { id: 'details', label: 'Details' },
  { id: 'responses', label: 'Responses' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'history', label: 'History' },
];

const meta: Meta<typeof DetailLayout> = {
  title: 'Layouts/DetailLayout',
  component: DetailLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof DetailLayout>;

export const Default: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('details');
    return (
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
        <DetailLayout
          breadcrumbs={mockBreadcrumbs}
          backLink="/rfis"
          backLabel="Back to RFIs"
          itemTitle="RFI-042: Foundation Rebar Specification"
          statusBadge={<HbcStatusBadge variant="inProgress" label="In Progress" />}
          actions={mockActions}
          tabs={mockTabs}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          onNavigate={(href) => console.log('Navigate:', href)}
          mainContent={
            <div style={{ padding: '16px' }}>
              <h3>Main Content — {activeTab}</h3>
              <p style={{ color: '#6B7280' }}>
                Primary content area (8 columns on desktop). Tab panel content renders here.
              </p>
            </div>
          }
          sidebarContent={
            <div style={{ padding: '16px', backgroundColor: '#FAFBFC', borderRadius: '8px' }}>
              <h4>Side Panel</h4>
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Sidebar content (4 columns on desktop). Metadata, related items, etc.
              </p>
            </div>
          }
        />
      </HbcAppShell>
    );
  },
};

export const TabletStacked: Story = {
  parameters: {
    viewport: { defaultViewport: 'tablet' },
  },
  render: () => {
    const [activeTab, setActiveTab] = React.useState('details');
    return (
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
        <DetailLayout
          breadcrumbs={mockBreadcrumbs}
          backLink="/rfis"
          backLabel="Back to RFIs"
          itemTitle="RFI-042: Foundation Rebar Specification"
          statusBadge={<HbcStatusBadge variant="inProgress" label="In Progress" />}
          tabs={mockTabs}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          mainContent={
            <div style={{ padding: '16px' }}>
              <h3>Main Content — stacked on tablet</h3>
              <p style={{ color: '#6B7280' }}>Columns stack to single column below 1024px.</p>
            </div>
          }
          sidebarContent={
            <div style={{ padding: '16px', backgroundColor: '#FAFBFC', borderRadius: '8px' }}>
              <h4>Side Panel (stacked below)</h4>
            </div>
          }
        />
      </HbcAppShell>
    );
  },
};

export const WithManyTabs: Story = {
  render: () => {
    const manyTabs: LayoutTab[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'financials', label: 'Financials' },
      { id: 'workflow', label: 'Workflow' },
      { id: 'compliance', label: 'Compliance' },
      { id: 'allowances', label: 'Allowances' },
      { id: 'milestones', label: 'Milestones' },
      { id: 'team', label: 'Team' },
      { id: 'history', label: 'History', disabled: true },
    ];
    const [activeTab, setActiveTab] = React.useState('overview');
    return (
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
        <DetailLayout
          itemTitle="Contract #2024-0847"
          tabs={manyTabs}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          mainContent={
            <div style={{ padding: '16px' }}>
              <h3>Active: {activeTab}</h3>
              <p style={{ color: '#6B7280' }}>Many tabs with keyboard navigation. Use arrow keys.</p>
            </div>
          }
        />
      </HbcAppShell>
    );
  },
};
