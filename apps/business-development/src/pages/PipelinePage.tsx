import type { ReactNode } from 'react';
import { Text, Card, CardHeader } from '@fluentui/react-components';
import { WorkspacePageShell, HbcDataTable, HbcStatusBadge } from '@hbc/ui-kit';
import type { ColumnDef } from '@hbc/ui-kit';

interface LeadItem { name: string; client: string; value: string; stage: string; probability: string; }

const columns: ColumnDef<LeadItem, unknown>[] = [
  { accessorKey: 'name', header: 'Opportunity' },
  { accessorKey: 'client', header: 'Client' },
  { accessorKey: 'value', header: 'Value' },
  { accessorKey: 'stage', header: 'Stage' },
  { accessorKey: 'probability', header: 'Win %' },
];

const MOCK_LEADS: LeadItem[] = [
  { name: 'Metro Hospital Expansion', client: 'Metro Health System', value: '$8.5M', stage: 'Proposal', probability: '75%' },
  { name: 'Westside Office Park', client: 'Westside Developers', value: '$12.2M', stage: 'Qualification', probability: '40%' },
  { name: 'Airport Terminal B Reno', client: 'City Aviation Authority', value: '$22.0M', stage: 'Negotiation', probability: '85%' },
  { name: 'University Science Center', client: 'State University', value: '$15.8M', stage: 'Pursuit', probability: '55%' },
];

export function PipelinePage(): ReactNode {
  const summaryCards = [
    { label: 'Pipeline Value', value: '$58.5M' },
    { label: 'Active Pursuits', value: '12' },
    { label: 'Win Rate', value: '34%' },
    { label: 'Weighted Value', value: '$21.2M' },
  ];

  return (
    <WorkspacePageShell title="Pipeline" description="Lead pipeline and opportunity tracking">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {summaryCards.map((card) => (
          <Card key={card.label} size="small">
            <CardHeader header={<Text weight="semibold">{card.label}</Text>} description={<Text size={700} weight="bold">{card.value}</Text>} />
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Text size={500} weight="semibold">Lead Pipeline</Text>
          <HbcStatusBadge label="4 active" variant="info" />
        </div>
        <HbcDataTable<LeadItem> data={MOCK_LEADS} columns={columns} height="300px" />
      </div>
    </WorkspacePageShell>
  );
}
