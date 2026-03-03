/**
 * DemoDataGrid — HbcDataTable + HbcCommandBar with mock query hooks.
 * Foundation Plan Phase 3.
 */
import { useState } from 'react';
import { HbcDataTable, HbcCommandBar } from '@hbc/ui-kit';
import { useLeads } from '@hbc/query-hooks';
import type { ILead } from '@hbc/models';

const columns = [
  { accessorKey: 'id' as const, header: 'ID', size: 60 },
  { accessorKey: 'title' as const, header: 'Lead Name', size: 200 },
  { accessorKey: 'clientName' as const, header: 'Client', size: 160 },
  {
    accessorKey: 'estimatedValue' as const,
    header: 'Est. Value',
    size: 120,
    cell: (info: { getValue: () => unknown }) => {
      const val = info.getValue() as number;
      return `$${val.toLocaleString()}`;
    },
  },
  { accessorKey: 'stage' as const, header: 'Stage', size: 120 },
];

export function DemoDataGrid() {
  const [search, setSearch] = useState('');
  const { data: result, isLoading } = useLeads();

  const rows: ILead[] = result?.items ?? [];

  const filtered = search
    ? rows.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
    : rows;

  return (
    <div>
      <h3 className="harness-section-title">Data Grid — Leads</h3>
      <HbcCommandBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search leads..."
        actions={[
          { key: 'add', label: 'Add Lead', onClick: () => {}, primary: true },
          { key: 'export', label: 'Export', onClick: () => {} },
        ]}
      />
      <HbcDataTable
        data={filtered}
        columns={columns}
        enableSorting
        enablePagination
        pageSize={10}
        isLoading={isLoading}
        height="400px"
        onRowClick={(row) => console.log('Row clicked:', row)}
      />
    </div>
  );
}
