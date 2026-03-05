import type { ReactNode } from 'react';
import { Text, Card, CardHeader } from '@fluentui/react-components';
import { useProjectStore } from '@hbc/shell';
import { WorkspacePageShell, HbcDataTable } from '@hbc/ui-kit';
import type { ColumnDef } from '@hbc/ui-kit';
import type { IActiveProject } from '@hbc/models';

const columns: ColumnDef<IActiveProject, unknown>[] = [
  { accessorKey: 'name', header: 'Project Name' },
  { accessorKey: 'number', header: 'Number' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'startDate', header: 'Start Date' },
  { accessorKey: 'endDate', header: 'End Date' },
];

export function DashboardPage(): ReactNode {
  const projects = useProjectStore((s) => s.availableProjects);
  const summaryCards = [
    { label: 'Total Projects', value: String(projects.length) },
    { label: 'Active', value: String(projects.filter((p) => p.status === 'Active').length) },
    { label: 'Planning', value: String(projects.filter((p) => p.status === 'Planning').length) },
  ];

  return (
    <WorkspacePageShell layout="dashboard" title="Project Hub">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {summaryCards.map((card) => (
          <Card key={card.label} size="small">
            <CardHeader
              header={<Text weight="semibold">{card.label}</Text>}
              description={<Text size={800} weight="bold">{card.value}</Text>}
            />
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <HbcDataTable<IActiveProject> data={projects} columns={columns} height="400px" />
      </div>
    </WorkspacePageShell>
  );
}
