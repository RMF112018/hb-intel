import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcAppShell } from '../HbcAppShell/HbcAppShell.js';
import { ListLayout } from './ListLayout.js';
import { hbcFieldTheme } from '../theme/theme.js';
import { RFI } from '../icons/index.js';
import type { SidebarNavGroup, ShellUser } from '../HbcAppShell/types.js';
import type { ListFilterDef, ListBulkAction, ListSavedViewEntry } from './types.js';

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

const primaryFilters: ListFilterDef[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'closed', label: 'Closed' },
      { value: 'overdue', label: 'Overdue' },
    ],
  },
  {
    key: 'assignee',
    label: 'Assignee',
    type: 'select',
    options: [
      { value: 'sarah', label: 'Sarah Johnson' },
      { value: 'mike', label: 'Mike Chen' },
      { value: 'emily', label: 'Emily Davis' },
    ],
  },
];

const advancedFilters: ListFilterDef[] = [
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
  {
    key: 'trade',
    label: 'Trade',
    type: 'select',
    options: [
      { value: 'electrical', label: 'Electrical' },
      { value: 'mechanical', label: 'Mechanical' },
      { value: 'structural', label: 'Structural' },
    ],
  },
];

const mockBulkActions: ListBulkAction[] = [
  { key: 'export', label: 'Export', onClick: () => {} },
  { key: 'assign', label: 'Reassign', onClick: () => {} },
  { key: 'delete', label: 'Delete', onClick: () => {}, isDestructive: true },
];

const mockSavedViews: ListSavedViewEntry[] = [
  { id: 'all', name: 'All Items', scope: 'organization' },
  { id: 'my-open', name: 'My Open Items', scope: 'personal' },
  { id: 'overdue', name: 'Overdue', scope: 'project' },
  { id: 'high-priority', name: 'High Priority', scope: 'personal' },
];

const MockTableContent: React.FC = () => (
  <div
    style={{
      border: '1px dashed #D1D5DB',
      borderRadius: '8px',
      padding: '24px',
      color: '#6B7280',
      fontSize: '0.875rem',
      minHeight: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    HbcDataTable or card grid content goes here
  </div>
);

const meta: Meta<typeof ListLayout> = {
  title: 'Layouts/ListLayout',
  component: ListLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ListLayout>;

export const Default: Story = {
  render: () => {
    const [search, setSearch] = React.useState('');
    const [filters, setFilters] = React.useState<Record<string, string | string[]>>({});
    const handleFilterChange = (key: string, value: string | string[] | undefined) => {
      setFilters((prev) => {
        const next = { ...prev };
        if (value === undefined) {
          delete next[key];
        } else {
          next[key] = value;
        }
        return next;
      });
    };
    return (
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
        <ListLayout
          primaryFilters={primaryFilters}
          advancedFilters={advancedFilters}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
          onClearAllFilters={() => setFilters({})}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search RFIs..."
          showingCount={42}
          totalCount={156}
          onViewModeChange={() => {}}
        >
          <MockTableContent />
        </ListLayout>
      </HbcAppShell>
    );
  },
};

export const PrimaryFiltersApplied: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <ListLayout
        primaryFilters={primaryFilters}
        activeFilters={{ status: 'open', assignee: 'sarah' }}
        onFilterChange={() => {}}
        onClearAllFilters={() => {}}
        searchValue="foundation"
        searchPlaceholder="Search RFIs..."
        showingCount={8}
        totalCount={156}
      >
        <MockTableContent />
      </ListLayout>
    </HbcAppShell>
  ),
};

export const AdvancedFilterPanelOpen: Story = {
  name: 'Advanced Filters Expanded',
  render: () => {
    const [search, setSearch] = React.useState('');
    const [filters, setFilters] = React.useState<Record<string, string | string[]>>({
      status: 'open',
    });
    const handleFilterChange = (key: string, value: string | string[] | undefined) => {
      setFilters((prev) => {
        const next = { ...prev };
        if (value === undefined) {
          delete next[key];
        } else {
          next[key] = value;
        }
        return next;
      });
    };
    return (
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
        <div>
          <p style={{ padding: '8px 16px', fontSize: '0.8125rem', color: '#6B7280' }}>
            Click &quot;More Filters +&quot; to expand the advanced filter panel.
          </p>
          <ListLayout
            primaryFilters={primaryFilters}
            advancedFilters={advancedFilters}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearAllFilters={() => setFilters({})}
            searchValue={search}
            onSearchChange={setSearch}
            showingCount={42}
            totalCount={156}
          >
            <MockTableContent />
          </ListLayout>
        </div>
      </HbcAppShell>
    );
  },
};

export const ZeroResults: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <ListLayout
        primaryFilters={primaryFilters}
        activeFilters={{ status: 'closed', assignee: 'emily' }}
        onFilterChange={() => {}}
        onClearAllFilters={() => {}}
        searchValue="nonexistent"
        searchPlaceholder="Search RFIs..."
        showingCount={0}
        totalCount={156}
      >
        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '0.875rem',
          }}
        >
          No items match your filters. Try adjusting your search or clearing filters.
        </div>
      </ListLayout>
    </HbcAppShell>
  ),
};

export const SavedViewsBar: Story = {
  render: () => {
    const [activeView, setActiveView] = React.useState('all');
    return (
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
        <ListLayout
          primaryFilters={primaryFilters}
          savedViewsEnabled
          savedViews={mockSavedViews}
          activeViewId={activeView}
          onViewSelect={setActiveView}
          onSaveView={() => {}}
          showingCount={42}
          totalCount={156}
        >
          <MockTableContent />
        </ListLayout>
      </HbcAppShell>
    );
  },
};

export const SingleRowSelected: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <ListLayout
        primaryFilters={primaryFilters}
        selectedCount={1}
        bulkActions={mockBulkActions}
        onClearSelection={() => {}}
        showingCount={42}
        totalCount={156}
      >
        <MockTableContent />
      </ListLayout>
    </HbcAppShell>
  ),
};

export const MultipleRowsSelected: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <ListLayout
        primaryFilters={primaryFilters}
        selectedCount={12}
        bulkActions={mockBulkActions}
        onClearSelection={() => {}}
        showingCount={42}
        totalCount={156}
      >
        <MockTableContent />
      </ListLayout>
    </HbcAppShell>
  ),
};

export const CardViewMode: Story = {
  render: () => {
    const [mode, setMode] = React.useState<'table' | 'card'>('card');
    return (
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
        <ListLayout
          primaryFilters={primaryFilters}
          viewMode={mode}
          onViewModeChange={setMode}
          showingCount={42}
          totalCount={156}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
              padding: '16px 0',
            }}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '0.875rem',
                  color: '#374151',
                }}
              >
                Card item {i + 1}
              </div>
            ))}
          </div>
        </ListLayout>
      </HbcAppShell>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Default (search + filters + count)</p>
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
            <ListLayout
              primaryFilters={primaryFilters}
              showingCount={42}
              totalCount={156}
            >
              <MockTableContent />
            </ListLayout>
          </HbcAppShell>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>With active filters + pills</p>
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
            <ListLayout
              primaryFilters={primaryFilters}
              activeFilters={{ status: 'open', assignee: 'sarah' }}
              onFilterChange={() => {}}
              onClearAllFilters={() => {}}
              showingCount={8}
              totalCount={156}
            >
              <MockTableContent />
            </ListLayout>
          </HbcAppShell>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Bulk action bar (3 selected)</p>
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
            <ListLayout
              primaryFilters={primaryFilters}
              selectedCount={3}
              bulkActions={mockBulkActions}
              onClearSelection={() => {}}
              showingCount={42}
              totalCount={156}
            >
              <MockTableContent />
            </ListLayout>
          </HbcAppShell>
        </div>
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ backgroundColor: '#0F1419', minHeight: '100vh' }}>
        <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
          <ListLayout
            primaryFilters={primaryFilters}
            showingCount={42}
            totalCount={156}
          >
            <MockTableContent />
          </ListLayout>
        </HbcAppShell>
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Filters + Bulk Bar)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Search has <code>aria-label</code>. Filter selects have labels via <code>aria-label</code>.
        Filter pills have dismiss buttons with <code>aria-label=&quot;Remove filter X&quot;</code>.
        View toggle uses <code>aria-pressed</code>. Bulk action bar uses <code>role=&quot;toolbar&quot;</code>.
        Saved views bar uses <code>role=&quot;tablist&quot;</code> with <code>aria-selected</code>.
      </p>
      <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
        <ListLayout
          primaryFilters={primaryFilters}
          advancedFilters={advancedFilters}
          activeFilters={{ status: 'open' }}
          onFilterChange={() => {}}
          onClearAllFilters={() => {}}
          savedViewsEnabled
          savedViews={mockSavedViews}
          activeViewId="all"
          selectedCount={3}
          bulkActions={mockBulkActions}
          onClearSelection={() => {}}
          onViewModeChange={() => {}}
          showingCount={42}
          totalCount={156}
        >
          <MockTableContent />
        </ListLayout>
      </HbcAppShell>
    </div>
  ),
};
