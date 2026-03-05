import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcAppShell } from '../HbcAppShell/HbcAppShell.js';
import { DetailLayout } from './DetailLayout.js';
import { hbcFieldTheme } from '../theme/theme.js';
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

export const WithTabs: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('details');
    return (
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
        <DetailLayout
          itemTitle="RFI-042: Foundation Rebar Specification"
          tabs={mockTabs}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          mainContent={
            <div style={{ padding: '16px' }}>
              <h3>Tab Content: {activeTab}</h3>
              <p style={{ color: '#6B7280' }}>Tab navigation with keyboard arrow keys.</p>
            </div>
          }
        />
      </HbcAppShell>
    );
  },
};

export const WithSidebar: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <DetailLayout
        itemTitle="RFI-042: Foundation Rebar Specification"
        mainContent={
          <div style={{ padding: '16px' }}>
            <h3>Main Content (8-col)</h3>
            <p style={{ color: '#6B7280' }}>Primary content area.</p>
          </div>
        }
        sidebarContent={
          <div style={{ padding: '16px', backgroundColor: '#FAFBFC', borderRadius: '8px' }}>
            <h4>Side Panel (4-col)</h4>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Metadata, related items.</p>
          </div>
        }
      />
    </HbcAppShell>
  ),
};

export const WithActions: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <DetailLayout
        itemTitle="RFI-042: Foundation Rebar Specification"
        statusBadge={<HbcStatusBadge variant="inProgress" label="In Progress" />}
        actions={mockActions}
        mainContent={
          <div style={{ padding: '16px' }}>
            <h3>Detail with header actions</h3>
            <p style={{ color: '#6B7280' }}>Edit and Export PDF buttons in the header.</p>
          </div>
        }
      />
    </HbcAppShell>
  ),
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

export const AllVariants: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('details');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>With tabs + sidebar</p>
          <div style={{ height: '350px', overflow: 'hidden' }}>
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
                mainContent={<div style={{ padding: '16px' }}><h3>Main — {activeTab}</h3></div>}
                sidebarContent={<div style={{ padding: '16px', backgroundColor: '#FAFBFC', borderRadius: '8px' }}><h4>Side Panel</h4></div>}
              />
            </HbcAppShell>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Without tabs (minimal)</p>
          <div style={{ height: '250px', overflow: 'hidden' }}>
            <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
              <DetailLayout
                itemTitle="Simple Detail View"
                mainContent={<div style={{ padding: '16px' }}><p>No tabs, no sidebar, no actions.</p></div>}
              />
            </HbcAppShell>
          </div>
        </div>
      </div>
    );
  },
};

export const FieldMode: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('details');
    return (
      <FluentProvider theme={hbcFieldTheme}>
        <div style={{ backgroundColor: '#0F1419', minHeight: '100vh' }}>
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
              mainContent={<div style={{ padding: '16px' }}><h3>Field Mode Content</h3></div>}
              sidebarContent={<div style={{ padding: '16px' }}><h4>Side Panel</h4></div>}
            />
          </HbcAppShell>
        </div>
      </FluentProvider>
    );
  },
};

export const A11yTest: Story = {
  name: 'A11y Test (Tabs + Breadcrumbs)',
  render: () => {
    const [activeTab, setActiveTab] = React.useState('details');
    return (
      <div>
        <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
          Use arrow keys to navigate tabs. Breadcrumbs are links with <code>aria-label=&quot;Breadcrumb&quot;</code>.
          Tab panel content updates via <code>aria-labelledby</code>. Verify landmark roles in DevTools.
        </p>
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
            mainContent={<div style={{ padding: '16px' }}><h3>Active Tab: {activeTab}</h3></div>}
          />
        </HbcAppShell>
      </div>
    );
  },
};
