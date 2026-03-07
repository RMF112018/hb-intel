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

/**
 * PH4C.4 (D-PH4C-09): Config-only saved-views integration.
 * Consumers provide identifiers/callbacks while table state remains internal.
 */
export const WithSavedViews: Story = {
  render: () => {
    const [visibility, setVisibility] = React.useState<Record<string, boolean>>({
      category: false,
    });
    const [order, setOrder] = React.useState<string[]>([]);
    const [message, setMessage] = React.useState<string | null>(null);

    return (
      <div>
        <p style={{ marginBottom: 8 }}>
          <small>Saved views are managed internally by HbcDataTable via config-only integration.</small>
        </p>
        <HbcDataTable
          data={sampleData.slice(0, 20)}
          columns={sampleColumns}
          enableSorting
          enableColumnConfig
          columnVisibility={visibility}
          onColumnVisibilityChange={setVisibility}
          columnOrder={order}
          onColumnOrderChange={setOrder}
          savedViewsConfig={{
            tableId: 'storybook-hbc-datatable',
            userId: 'storybook-user',
            onViewSaved: (view) => setMessage(`Saved view: ${view.name}`),
            onViewDeleted: () => setMessage('Deleted saved view'),
            onViewApplied: (_viewId, view) => setMessage(`Applied view: ${view.name}`),
          }}
          height="450px"
        />
        {message ? (
          <div style={{ marginTop: 8, fontSize: 12, color: '#0f6cbd' }}>{message}</div>
        ) : null}
      </div>
    );
  },
};

/**
 * PH4C.4: Backward-compatibility baseline with saved views omitted.
 */
export const WithoutSavedViews: Story = {
  args: {
    data: sampleData.slice(0, 20),
    columns: sampleColumns,
    enableSorting: true,
    enableColumnConfig: true,
    height: '450px',
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

export const FrozenColumns: Story = {
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <p style={{ marginBottom: 8 }}>
        <small>Scroll horizontally — ID and Name columns stay fixed.</small>
      </p>
      <HbcDataTable
        data={sampleData.slice(0, 20)}
        columns={sampleColumns}
        enableSorting
        frozenColumns={['id', 'name']}
        height="400px"
      />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Basic with sorting</p>
        <HbcDataTable
          data={sampleData.slice(0, 10)}
          columns={sampleColumns}
          enableSorting
          height="300px"
        />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>With responsibility heat map</p>
        <HbcDataTable
          data={sampleData.slice(0, 10)}
          columns={sampleColumns}
          responsibilityField="assignee"
          currentUserId={CURRENT_USER}
          height="300px"
        />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Loading (shimmer)</p>
        <HbcDataTable
          data={[]}
          columns={sampleColumns}
          isLoading
          height="200px"
        />
      </div>
    </div>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '12px' }}>
        Table uses proper ARIA roles. Column headers are sortable via keyboard.
        Inline editing cells are tab-navigable. Responsibility rows use aria-label.
      </p>
      <HbcDataTable
        data={sampleData.slice(0, 10)}
        columns={sampleColumns}
        enableSorting
        responsibilityField="assignee"
        currentUserId={CURRENT_USER}
        height="400px"
      />
    </div>
  ),
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
