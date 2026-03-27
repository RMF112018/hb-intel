/**
 * FinancialControlCenterCore — R3 region.
 *
 * Default: narrative with posture, drivers, blockers, milestone.
 * Selected tool: preview card with headline, top issue, metric, "Open Surface" CTA.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  Card,
  CardHeader,
  Text,
  HbcButton,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HBC_STATUS_COLORS,
} from '@hbc/ui-kit';

import type {
  FinancialNarrative,
  FinancialToolPreview,
} from '../hooks/useFinancialControlCenter.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_MD}px`,
    padding: `${HBC_SPACE_MD}px`,
    overflow: 'auto',
    flex: 1,
  },
  driverList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: `${HBC_SPACE_SM}px`,
  },
  blockerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: `${HBC_SPACE_SM}px`,
  },
  previewMetric: {
    display: 'flex',
    alignItems: 'baseline',
    gap: `${HBC_SPACE_SM}px`,
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: 1.2,
    color: 'var(--colorNeutralForeground1)',
  },
  metricLabel: {
    fontSize: '12px',
    color: 'var(--colorNeutralForeground3)',
  },
  actionsRow: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_SM}px`,
  },
});

export interface FinancialControlCenterCoreProps {
  readonly narrative: FinancialNarrative;
  readonly selectedToolPreview: FinancialToolPreview | null;
  readonly onOpenSurface?: (toolId: string) => void;
}

export function FinancialControlCenterCore({
  narrative,
  selectedToolPreview,
  onOpenSurface,
}: FinancialControlCenterCoreProps): ReactNode {
  const styles = useStyles();

  if (selectedToolPreview) {
    return (
      <div data-testid="financial-center-preview" data-tool={selectedToolPreview.toolId} className={styles.root}>
        <Card size="small">
          <CardHeader
            header={<Text weight="semibold" size={400}>{selectedToolPreview.label}</Text>}
            description={<Text size={200}>{selectedToolPreview.headline}</Text>}
          />
          <div style={{ padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px` }}>
            <div className={styles.previewMetric}>
              <span className={styles.metricValue}>{selectedToolPreview.metricValue}</span>
              <span className={styles.metricLabel}>{selectedToolPreview.metricLabel}</span>
            </div>
            {selectedToolPreview.topIssue && (
              <Text size={200} style={{ color: HBC_STATUS_COLORS.warning, display: 'block', marginTop: `${HBC_SPACE_SM}px` }}>
                {selectedToolPreview.topIssue}
              </Text>
            )}
            <div className={styles.actionsRow}>
              <HbcButton variant="primary" onClick={() => onOpenSurface?.(selectedToolPreview.toolId)}>
                Open {selectedToolPreview.label}
              </HbcButton>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div data-testid="financial-center-narrative" className={styles.root}>
      <Card size="small">
        <CardHeader
          header={<Text weight="semibold" size={300}>Financial Narrative</Text>}
          description={<Text size={300}>{narrative.overallPosture}</Text>}
        />
      </Card>

      <Card size="small">
        <CardHeader header={<Text weight="semibold" size={200}>Top Drivers</Text>} />
        <div className={styles.driverList}>
          {narrative.topDrivers.map((driver, i) => (
            <Text key={i} size={200}>• {driver}</Text>
          ))}
        </div>
      </Card>

      {narrative.blockers.length > 0 && (
        <Card size="small">
          <CardHeader header={<Text weight="semibold" size={200} style={{ color: HBC_STATUS_COLORS.critical }}>Blockers</Text>} />
          <div className={styles.blockerList}>
            {narrative.blockers.map((blocker, i) => (
              <Text key={i} size={200}>• {blocker}</Text>
            ))}
          </div>
        </Card>
      )}

      <Card size="small">
        <CardHeader
          header={<Text weight="semibold" size={200}>Next Milestone</Text>}
          description={<Text size={200}>{narrative.nextMilestone}</Text>}
        />
      </Card>
    </div>
  );
}
