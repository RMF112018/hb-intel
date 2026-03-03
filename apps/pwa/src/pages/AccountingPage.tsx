/**
 * AccountingPage — MVP workspace (Blueprint §2c).
 * Financial overview with data grid placeholder.
 */
import type { ReactNode } from 'react';
import { Text, Card, CardHeader } from '@fluentui/react-components';
import { WorkspacePageShell } from '../components/WorkspacePageShell.js';
import { HbcDataTable } from '@hbc/ui-kit';
import type { ColumnDef } from '@hbc/ui-kit';

interface BudgetItem {
  category: string;
  budget: string;
  actual: string;
  variance: string;
  percent: string;
}

const columns: ColumnDef<BudgetItem, unknown>[] = [
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'budget', header: 'Budget' },
  { accessorKey: 'actual', header: 'Actual' },
  { accessorKey: 'variance', header: 'Variance' },
  { accessorKey: 'percent', header: '% Used' },
];

const MOCK_BUDGET_ITEMS: BudgetItem[] = [
  { category: 'Labor', budget: '$1,250,000', actual: '$1,180,000', variance: '$70,000', percent: '94.4%' },
  { category: 'Materials', budget: '$850,000', actual: '$790,000', variance: '$60,000', percent: '92.9%' },
  { category: 'Subcontracts', budget: '$2,100,000', actual: '$2,050,000', variance: '$50,000', percent: '97.6%' },
  { category: 'Equipment', budget: '$320,000', actual: '$310,000', variance: '$10,000', percent: '96.9%' },
];

export function AccountingPage(): ReactNode {
  const summaryCards = [
    { label: 'Total Budget', value: '$4,520,000' },
    { label: 'Spent to Date', value: '$4,330,000' },
    { label: 'Remaining', value: '$190,000' },
    { label: 'Percent Complete', value: '95.8%' },
  ];

  return (
    <WorkspacePageShell title="Accounting" description="Financial management and cost tracking">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {summaryCards.map((card) => (
          <Card key={card.label} size="small">
            <CardHeader
              header={<Text weight="semibold">{card.label}</Text>}
              description={<Text size={700} weight="bold">{card.value}</Text>}
            />
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Text size={500} weight="semibold" style={{ marginBottom: 12, display: 'block' }}>
          Budget Summary
        </Text>
        <HbcDataTable<BudgetItem>
          data={MOCK_BUDGET_ITEMS}
          columns={columns}
          height="300px"
        />
      </div>
    </WorkspacePageShell>
  );
}
