import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  Text,
  Card,
  CardHeader,
  WorkspacePageShell,
  HbcDataTable,
  HbcStatusBadge,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
} from '@hbc/ui-kit';
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

const useStyles = makeStyles({
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(11.25rem, 1fr))',
    gap: `${HBC_SPACE_MD}px`,
  },
  section: {
    marginTop: `${HBC_SPACE_LG}px`,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
  },
});

export function PipelinePage(): ReactNode {
  const styles = useStyles();
  const summaryCards = [
    { label: 'Pipeline Value', value: '$58.5M' },
    { label: 'Active Pursuits', value: '12' },
    { label: 'Win Rate', value: '34%' },
    { label: 'Weighted Value', value: '$21.2M' },
  ];

  return (
    <WorkspacePageShell layout="list" title="Pipeline">
      <div className={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <Card key={card.label} size="small">
            <CardHeader header={<Text weight="semibold">{card.label}</Text>} description={<Text size={700} weight="bold">{card.value}</Text>} />
          </Card>
        ))}
      </div>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Text size={500} weight="semibold">Lead Pipeline</Text>
          <HbcStatusBadge label="4 active" variant="info" />
        </div>
        <HbcDataTable<LeadItem> data={MOCK_LEADS} columns={columns} height="300px" />
      </div>
    </WorkspacePageShell>
  );
}
