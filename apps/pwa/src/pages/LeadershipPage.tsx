/**
 * LeadershipPage — MVP workspace (Blueprint §2c).
 * Executive dashboard with KPI cards and chart.
 */
import type { ReactNode } from 'react';
import { Text, Card, CardHeader, HbcChart, WorkspacePageShell } from '@hbc/ui-kit';

export function LeadershipPage(): ReactNode {
  const kpis = [
    { label: 'Active Projects', value: '14', trend: '+2 this quarter' },
    { label: 'Total Contract Value', value: '$42.5M', trend: '+8.3% YoY' },
    { label: 'Avg Schedule Performance', value: '94%', trend: 'On track' },
    { label: 'Safety Incident Rate', value: '0.8', trend: '-0.3 vs last year' },
  ];

  return (
    <WorkspacePageShell layout="dashboard" title="Leadership">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {kpis.map((kpi) => (
          <Card key={kpi.label} size="small">
            <CardHeader
              header={<Text weight="semibold">{kpi.label}</Text>}
              description={
                <div>
                  <Text size={800} weight="bold">{kpi.value}</Text>
                  <Text size={200} style={{ display: 'block', color: 'var(--colorNeutralForeground3)', marginTop: 4 }}>
                    {kpi.trend}
                  </Text>
                </div>
              }
            />
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Text size={500} weight="semibold" style={{ marginBottom: 12, display: 'block' }}>
          Project Performance Overview
        </Text>
        <HbcChart
          option={{
            tooltip: { trigger: 'axis' },
            legend: { data: ['Budget Performance', 'Schedule Performance'] },
            xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
            yAxis: { type: 'value', min: 80, max: 100 },
            series: [
              { name: 'Budget Performance', type: 'bar', data: [92, 95, 91, 94] },
              { name: 'Schedule Performance', type: 'bar', data: [88, 93, 96, 94] },
            ],
          }}
          height="350px"
        />
      </div>
    </WorkspacePageShell>
  );
}
