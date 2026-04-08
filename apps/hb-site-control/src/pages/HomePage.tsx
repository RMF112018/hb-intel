/**
 * HomePage — Mobile dashboard for HB Site Control.
 * Foundation Plan Phase 6 — Blueprint §2i.
 * Summary cards + recent activity + navigation to sub-pages.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useRouter } from '@tanstack/react-router';
import { HbcStatusBadge, WorkspacePageShell, HBC_SPACE_XS, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG, HBC_SPACE_XL } from '@hbc/ui-kit';
import { Text, Card, CardHeader, Button, tokens } from '@hbc/ui-kit/fluent';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
  },
  card: {
    cursor: 'pointer',
    minHeight: '7.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardBody: {
    paddingTop: 0,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
  },
  cardCount: {
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: '1',
  },
  criticalCount: {
    color: tokens.colorPaletteRedForeground1,
  },
  warningCount: {
    color: tokens.colorPaletteYellowForeground1,
  },
  successCount: {
    color: tokens.colorPaletteGreenForeground1,
  },
  sectionHeading: {
    marginTop: `${HBC_SPACE_LG}px`,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_SM}px`,
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderRadius: `${HBC_SPACE_SM}px`,
    backgroundColor: 'var(--colorNeutralBackground1)',
    boxShadow: 'var(--shadow2)',
  },
  activityContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
  },
  activityTime: {
    color: 'var(--colorNeutralForeground3)',
  },
  navButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
  navButton: {
    minHeight: `${HBC_SPACE_XL + HBC_SPACE_MD}px`,
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
          <div className={styles.cardBody}>
            <Text className={`${styles.cardCount} ${styles.criticalCount}`}>
              7
            </Text>
          </div>
        </Card>

        <Card
          className={styles.card}
          onClick={() => void router.navigate({ to: '/safety-monitoring' })}
        >
          <CardHeader header={<Text weight="semibold" size={200}>Safety Alerts</Text>} />
          <div className={styles.cardBody}>
            <Text className={`${styles.cardCount} ${styles.warningCount}`}>
              3
            </Text>
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader header={<Text weight="semibold" size={200}>Inspections Today</Text>} />
          <div className={styles.cardBody}>
            <Text className={`${styles.cardCount} ${styles.successCount}`}>
              5
            </Text>
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader header={<Text weight="semibold" size={200}>Crew On-Site</Text>} />
          <div className={styles.cardBody}>
            <Text className={styles.cardCount}>
              24
            </Text>
          </div>
        </Card>
      </div>

      <Text as="h2" size={500} weight="semibold" className={styles.sectionHeading}>
        Recent Activity
      </Text>
      <div className={styles.activityList}>
        {MOCK_ACTIVITY.map((item) => (
          <div key={item.id} className={styles.activityItem}>
            <div className={styles.activityContent}>
              <Text size={300} weight="medium">{item.description}</Text>
              <Text size={200} className={styles.activityTime}>{item.time}</Text>
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
          className={styles.navButton}
          appearance="primary"
          size="large"
          onClick={() => void router.navigate({ to: '/observations' })}
        >
          View All Observations
        </Button>
        <Button
          className={styles.navButton}
          appearance="outline"
          size="large"
          onClick={() => void router.navigate({ to: '/safety-monitoring' })}
        >
          Safety Monitoring
        </Button>
      </div>
    </WorkspacePageShell>
  );
}
