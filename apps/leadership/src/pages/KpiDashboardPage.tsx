import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  Text,
  Card,
  CardHeader,
  WorkspacePageShell,
  HbcChart,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_SPACE_XXL,
  HBC_SURFACE_LIGHT,
} from '@hbc/ui-kit';

const useStyles = makeStyles({
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${HBC_SPACE_XXL * 4 + HBC_SPACE_MD * 2}px, 1fr))`,
    gap: `${HBC_SPACE_MD}px`,
  },
  trendText: {
    display: 'block',
    color: HBC_SURFACE_LIGHT['text-secondary'],
    marginTop: `${HBC_SPACE_XS}px`,
  },
  chartSection: {
    marginTop: `${HBC_SPACE_LG}px`,
  },
  chartHeading: {
    marginBottom: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    display: 'block',
  },
});

export function KpiDashboardPage(): ReactNode {
  const styles = useStyles();
  const kpis = [
    { label: 'Active Projects', value: '14', trend: '+2 this quarter' },
    { label: 'Total Contract Value', value: '$42.5M', trend: '+8.3% YoY' },
    { label: 'Avg Schedule Performance', value: '94%', trend: 'On track' },
    { label: 'Safety Incident Rate', value: '0.8', trend: '-0.3 vs last year' },
  ];

  return (
    <WorkspacePageShell layout="dashboard" title="KPI Dashboard">
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <Card key={kpi.label} size="small">
            <CardHeader
              header={<Text weight="semibold">{kpi.label}</Text>}
              description={
                <div>
                  <Text size={800} weight="bold">{kpi.value}</Text>
                  <Text size={200} className={styles.trendText}>
                    {kpi.trend}
                  </Text>
                </div>
              }
            />
          </Card>
        ))}
      </div>
      <div className={styles.chartSection}>
        <Text size={500} weight="semibold" className={styles.chartHeading}>
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
