/**
 * HbcDataTable — Storybook stories
 * PH4.7 §7.1–7.3 | Blueprint §1d
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { createColumnHelper } from '@tanstack/react-table';
import { HbcDataTable } from './index.js';

interface SampleRow {
  id: string;
  name: string;
  status: string;
  amount: number;
  assignee: string;
  dueDate: string;
  category: string;
}

const columnHelper = createColumnHelper<SampleRow>();

const sampleColumns = [
  columnHelper.accessor('id', { header: 'ID', size: 80 }),
  columnHelper.accessor('name', { header: 'Name', size: 200 }),
  columnHelper.accessor('status', { header: 'Status', size: 120 }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    size: 120,
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('assignee', { header: 'Assignee', size: 150 }),
  columnHelper.accessor('dueDate', { header: 'Due Date', size: 120 }),
  columnHelper.accessor('category', { header: 'Category', size: 130 }),
];

const CURRENT_USER = 'user-1';

const sampleData: SampleRow[] = Array.from({ length: 50 }, (_, i) => ({
  id: `RFI-${String(i + 1).padStart(3, '0')}`,
  name: `Request for Information ${i + 1}`,
  status: ['Open', 'In Progress', 'Closed', 'Draft'][i % 4],
  amount: Math.round(Math.random() * 50000) + 1000,
  assignee: i % 3 === 0 ? CURRENT_USER : `user-${(i % 5) + 2}`,
  dueDate: new Date(2026, 2, (i % 28) + 1).toLocaleDateString(),
  category: ['Structural', 'MEP', 'Civil', 'Architectural'][i % 4],
}));

const meta: Meta<typeof HbcDataTable<SampleRow>> = {
  title: 'Components/HbcDataTable',
  component: HbcDataTable,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcDataTable<SampleRow>>;

export const Default: Story = {
  args: {
    data: sampleData.slice(0, 20),
    columns: sampleColumns,
    enableSorting: true,
    height: '500px',
  },
};

export const AdaptiveDensity: Story = {
  render: () => {
    const [densityLabel, setDensityLabel] = React.useState('');
    return (
      <div>
        <p style={{ marginBottom: 8, fontWeight: 600 }}>
          Current density: <code>{densityLabel || 'detecting...'}</code>
          <br />
          <small>Resize browser to see tier change (compact &ge;1440, standard 640–1439, touch coarse+&lt;1024)</small>
        </p>
        <HbcDataTable
          data={sampleData.slice(0, 15)}
          columns={sampleColumns}
          enableSorting
          toolId="story-density"
          onDensityChange={(tier) => setDensityLabel(tier)}
          height="400px"
        />
      </div>
    );
  },
};

export const ResponsibilityHeatMap: Story = {
  args: {
    data: sampleData.slice(0, 20),
    columns: sampleColumns,
    enableSorting: true,
    responsibilityField: 'assignee',
    currentUserId: CURRENT_USER,
    height: '500px',
  },
};

export const CardStackMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    data: sampleData.slice(0, 10),
    columns: sampleColumns,
    mobileCardFields: ['id', 'name', 'status', 'amount'],
    responsibilityField: 'assignee',
    currentUserId: CURRENT_USER,
    height: '600px',
  },
};

export const InlineEditing: Story = {
  render: () => {
    const [tableData, setTableData] = React.useState(sampleData.slice(0, 10));
    return (
      <div>
        <p style={{ marginBottom: 8 }}>
          <small>Double-click name or amount cells to edit. Tab moves to next editable cell.</small>
        </p>
        <HbcDataTable
          data={tableData}
          columns={sampleColumns}
          editableColumns={['name', 'amount']}
          onCellEdit={(rowId, columnId, newValue) => {
            setTableData((prev) =>
              prev.map((row, i) =>
                String(i) === rowId ? { ...row, [columnId]: newValue } : row,
              ),
            );
          }}
          height="400px"
        />
      </div>
    );
  },
};

export const ColumnConfig: Story = {
  render: () => {
    const [visibility, setVisibility] = React.useState<Record<string, boolean>>({
      category: false,
    });
    const [order, setOrder] = React.useState<string[]>([]);
    return (
      <div>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['id', 'name', 'status', 'amount', 'assignee', 'dueDate', 'category'].map(
            (col) => (
              <label key={col} style={{ fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={visibility[col] !== false}
                  onChange={() =>
                    setVisibility((prev) => ({
                      ...prev,
                      [col]: prev[col] === false ? true : false,
                    }))
                  }
                />{' '}
                {col}
              </label>
            ),
          )}
        </div>
        <HbcDataTable
          data={sampleData.slice(0, 15)}
          columns={sampleColumns}
          enableSorting
          enableColumnConfig
          columnVisibility={visibility}
          onColumnVisibilityChange={setVisibility}
          columnOrder={order}
          onColumnOrderChange={setOrder}
          height="400px"
        />
      </div>
    );
  },
};

export const ShimmerLoading: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(true);
    return (
      <div>
        <button
          type="button"
          onClick={() => setLoading((p) => !p)}
          style={{ marginBottom: 8 }}
        >
          Toggle Loading ({loading ? 'ON' : 'OFF'})
        </button>
        <HbcDataTable
          data={loading ? [] : sampleData.slice(0, 15)}
          columns={sampleColumns}
          isLoading={loading}
          height="400px"
        />
      </div>
    );
  },
};

export const DataFreshness: Story = {
  render: () => {
    const [stale, setStale] = React.useState(true);
    return (
      <div>
        <button
          type="button"
          onClick={() => setStale((p) => !p)}
          style={{ marginBottom: 8 }}
        >
          Toggle Stale ({stale ? 'STALE' : 'FRESH'})
        </button>
        <HbcDataTable
          data={sampleData.slice(0, 15)}
          columns={sampleColumns}
          isStale={stale}
          emptyStateConfig={{
            title: 'No data found',
            description: 'Try adjusting your filters.',
          }}
          height="400px"
        />
      </div>
    );
  },
};

export const FieldMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  args: {
    data: sampleData.slice(0, 20),
    columns: sampleColumns,
    enableSorting: true,
    responsibilityField: 'assignee',
    currentUserId: CURRENT_USER,
    densityTier: 'touch',
    height: '500px',
  },
};
