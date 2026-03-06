/**
 * HomePage — Mobile dashboard for HB Site Control.
 * Foundation Plan Phase 6 — Blueprint §2i.
 * Summary cards + recent activity + navigation to sub-pages.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useRouter } from '@tanstack/react-router';
import { Text, Card, CardHeader, Button, HbcStatusBadge, WorkspacePageShell } from '@hbc/ui-kit';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  card: {
    cursor: 'pointer',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardCount: {
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: '1',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '16px',
    paddingRight: '16px',
    borderRadius: '8px',
    backgroundColor: 'var(--colorNeutralBackground1)',
    boxShadow: 'var(--shadow2)',
  },
  navButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
  },
});

interface RecentActivity {
  id: string;
  description: string;
  time: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const MOCK_ACTIVITY: RecentActivity[] = [
  { id: 'act-1', description: 'Fall hazard reported — Level 3', time: '12 min ago', severity: 'high' },
  { id: 'act-2', description: 'Daily inspection complete — Zone A', time: '45 min ago', severity: 'low' },
  { id: 'act-3', description: 'PPE non-compliance — Crew B', time: '1h ago', severity: 'medium' },
  { id: 'act-4', description: 'Electrical hazard flagged', time: '2h ago', severity: 'critical' },
  { id: 'act-5', description: 'Confined space permit renewed', time: '3h ago', severity: 'low' },
];

const SEVERITY_VARIANT = {
  critical: 'critical',
  high: 'error',
  medium: 'warning',
  low: 'info',
} as const;

export function HomePage(): ReactNode {
  const styles = useStyles();
  const router = useRouter();

  return (
    <WorkspacePageShell layout="dashboard" title="Site Control">
      <div className={styles.grid}>
        <Card
          className={styles.card}
          onClick={() => void router.navigate({ to: '/observations' })}
        >
          <CardHeader header={<Text weight="semibold" size={200}>Open Observations</Text>} />
          <div style={{ padding: '0 16px 16px' }}>
            <Text className={styles.cardCount} style={{ color: 'var(--colorPaletteRedForeground1)' }}>
              7
            </Text>
          </div>
        </Card>

        <Card
          className={styles.card}
          onClick={() => void router.navigate({ to: '/safety-monitoring' })}
        >
          <CardHeader header={<Text weight="semibold" size={200}>Safety Alerts</Text>} />
          <div style={{ padding: '0 16px 16px' }}>
            <Text className={styles.cardCount} style={{ color: 'var(--colorPaletteYellowForeground1)' }}>
              3
            </Text>
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader header={<Text weight="semibold" size={200}>Inspections Today</Text>} />
          <div style={{ padding: '0 16px 16px' }}>
            <Text className={styles.cardCount} style={{ color: 'var(--colorPaletteGreenForeground1)' }}>
              5
            </Text>
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader header={<Text weight="semibold" size={200}>Crew On-Site</Text>} />
          <div style={{ padding: '0 16px 16px' }}>
            <Text className={styles.cardCount}>
              24
            </Text>
          </div>
        </Card>
      </div>

      <Text as="h2" size={500} weight="semibold" style={{ marginTop: 24 }}>
        Recent Activity
      </Text>
      <div className={styles.activityList}>
        {MOCK_ACTIVITY.map((item) => (
          <div key={item.id} className={styles.activityItem}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Text size={300} weight="medium">{item.description}</Text>
              <Text size={200} style={{ color: 'var(--colorNeutralForeground3)' }}>{item.time}</Text>
            </div>
            <HbcStatusBadge
              variant={SEVERITY_VARIANT[item.severity]}
              label={item.severity}
              size="small"
            />
          </div>
        ))}
      </div>

      <div className={styles.navButtons}>
        <Button
          appearance="primary"
          size="large"
          onClick={() => void router.navigate({ to: '/observations' })}
          style={{ minHeight: 48 }}
        >
          View All Observations
        </Button>
        <Button
          appearance="outline"
          size="large"
          onClick={() => void router.navigate({ to: '/safety-monitoring' })}
          style={{ minHeight: 48 }}
        >
          Safety Monitoring
        </Button>
      </div>
    </WorkspacePageShell>
  );
}
