import type { ReactNode } from 'react';
// eslint-disable-next-line @hbc/hbc/no-direct-fluent-import -- TODO: migrate to @hbc/ui-kit (Phase 4b.11)
import { Text, Card, CardHeader } from '@fluentui/react-components';
import { WorkspacePageShell, HbcDataTable, HbcStatusBadge } from '@hbc/ui-kit';
import type { ColumnDef } from '@hbc/ui-kit';

interface BidItem { name: string; bidder: string; amount: string; dueDate: string; status: string; }

const columns: ColumnDef<BidItem, unknown>[] = [
  { accessorKey: 'name', header: 'Package' },
  { accessorKey: 'bidder', header: 'Bidder' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'dueDate', header: 'Due Date' },
  { accessorKey: 'status', header: 'Status' },
];

const MOCK_BIDS: BidItem[] = [
  { name: 'Structural Steel Package', bidder: 'Acme Steel Co.', amount: '$425,000', dueDate: '2025-04-15', status: 'Pending' },
  { name: 'HVAC Systems', bidder: 'CoolAir Inc.', amount: '$310,000', dueDate: '2025-04-20', status: 'Under Review' },
  { name: 'Electrical Rough-In', bidder: 'Volt Electric', amount: '$275,000', dueDate: '2025-04-10', status: 'Awarded' },
  { name: 'Plumbing Package', bidder: 'FlowRight LLC', amount: '$195,000', dueDate: '2025-04-25', status: 'Pending' },
];

export function BidsPage(): ReactNode {
  const summaryCards = [
    { label: 'Open Bids', value: '12' },
    { label: 'Under Review', value: '4' },
    { label: 'Awarded', value: '8' },
    { label: 'Total Bid Value', value: '$3.2M' },
  ];

  return (
    <WorkspacePageShell layout="list" title="Estimating — Bids">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {summaryCards.map((card) => (
          <Card key={card.label} size="small">
            <CardHeader header={<Text weight="semibold">{card.label}</Text>} description={<Text size={700} weight="bold">{card.value}</Text>} />
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Text size={500} weight="semibold">Active Bids</Text>
          <HbcStatusBadge label="4 pending" variant="warning" />
        </div>
        <HbcDataTable<BidItem> data={MOCK_BIDS} columns={columns} height="300px" />
      </div>
    </WorkspacePageShell>
  );
}
