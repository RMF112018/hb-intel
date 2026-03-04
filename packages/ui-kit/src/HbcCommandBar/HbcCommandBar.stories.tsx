/**
 * HbcCommandBar stories — PH4.6 §Step 10
 * Saved views, density control, FieldMode
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcCommandBar } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';
import { Filter, Settings } from '../icons/index.js';
import type { SavedView, DensityTier } from './types.js';

const meta: Meta<typeof HbcCommandBar> = {
  title: 'Components/HbcCommandBar',
  component: HbcCommandBar,
};

export default meta;
type Story = StoryObj<typeof HbcCommandBar>;

export const Default: Story = {
  render: () => {
    const [search, setSearch] = React.useState('');
    return (
      <HbcCommandBar
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          { key: 'active', label: 'Active', active: true, onToggle: () => {} },
          { key: 'closed', label: 'Closed', active: false, onToggle: () => {} },
        ]}
        actions={[
          { key: 'filter', label: 'Filter', icon: <Filter size="sm" />, onClick: () => {} },
          { key: 'new', label: 'New Item', onClick: () => {}, primary: true },
        ]}
      />
    );
  },
};

const SAMPLE_VIEWS: SavedView[] = [
  { id: 'v1', name: 'My Active Items', scope: 'personal', isActive: true },
  { id: 'v2', name: 'All Open RFIs', scope: 'project' },
  { id: 'v3', name: 'Company Dashboard', scope: 'organization' },
];

export const WithSavedViews: Story = {
  render: () => {
    const [search, setSearch] = React.useState('');
    const [views, setViews] = React.useState(SAMPLE_VIEWS);

    const handleViewChange = (viewId: string) => {
      setViews((prev) =>
        prev.map((v) => ({ ...v, isActive: v.id === viewId })),
      );
    };

    return (
      <HbcCommandBar
        searchValue={search}
        onSearchChange={setSearch}
        savedViews={views}
        onViewChange={handleViewChange}
        onViewSave={() => alert('Save view clicked')}
        filters={[
          { key: 'open', label: 'Open', active: true, onToggle: () => {} },
        ]}
        actions={[
          { key: 'new', label: 'New', onClick: () => {}, primary: true },
        ]}
      />
    );
  },
};

export const DensityControl: Story = {
  render: () => {
    const [density, setDensity] = React.useState<DensityTier>('standard');
    return (
      <div>
        <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '12px' }}>
          Density auto-detected: coarse pointer → touch, wide desktop → compact, else standard.
          Manual override via dropdown.
        </p>
        <HbcCommandBar
          searchValue=""
          onSearchChange={() => {}}
          densityTier={density}
          onDensityChange={setDensity}
          columnConfigTrigger={
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                border: '1px solid #D1D5DB',
                borderRadius: '3px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
            >
              <Settings size="sm" /> Columns
            </button>
          }
          actions={[
            { key: 'export', label: 'Export', onClick: () => {} },
          ]}
        />
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>With filters + actions</p>
        <HbcCommandBar
          searchValue=""
          onSearchChange={() => {}}
          filters={[
            { key: 'active', label: 'Active', active: true, onToggle: () => {} },
            { key: 'closed', label: 'Closed', active: false, onToggle: () => {} },
          ]}
          actions={[
            { key: 'filter', label: 'Filter', icon: <Filter size="sm" />, onClick: () => {} },
            { key: 'new', label: 'New Item', onClick: () => {}, primary: true },
          ]}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>With saved views</p>
        <HbcCommandBar
          searchValue=""
          onSearchChange={() => {}}
          savedViews={SAMPLE_VIEWS}
          onViewChange={() => {}}
          onViewSave={() => {}}
          actions={[
            { key: 'new', label: 'New', onClick: () => {}, primary: true },
          ]}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>With density control</p>
        <HbcCommandBar
          searchValue=""
          onSearchChange={() => {}}
          densityTier="standard"
          onDensityChange={() => {}}
          actions={[
            { key: 'export', label: 'Export', onClick: () => {} },
          ]}
        />
      </div>
    </div>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '12px' }}>
        Tab through search, filter chips, and action buttons. Verify keyboard navigation and focus indicators.
      </p>
      <HbcCommandBar
        searchValue=""
        onSearchChange={() => {}}
        filters={[
          { key: 'active', label: 'Active', active: true, onToggle: () => {} },
        ]}
        actions={[
          { key: 'new', label: 'New', onClick: () => {}, primary: true },
        ]}
      />
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '24px', backgroundColor: '#0F1419' }}>
        <HbcCommandBar
          searchValue=""
          onSearchChange={() => {}}
          savedViews={SAMPLE_VIEWS}
          onViewChange={() => {}}
          actions={[
            { key: 'new', label: 'New', onClick: () => {}, primary: true },
          ]}
        />
      </div>
    </FluentProvider>
  ),
};
