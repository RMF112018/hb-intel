import type { ReactNode } from 'react';
import { useProjectStore } from '@hbc/shell';
import { Text, Card, CardHeader, WorkspacePageShell, HbcDataTable } from '@hbc/ui-kit';
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
      {/* W0-G4-T05: Welcome card for recently provisioned projects.
          Deferred — IActiveProject has no provisionedAt field (spec R3).
          When IActiveProject gains provisionedAt, implement:
          - Detect recently provisioned projects (provisionedAt within last 24h)
          - Show welcome card with project name, dismiss button
          - Session-only dismissal via useState */}

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
