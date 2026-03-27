/**
 * FinancialControlCenterCore — R3 region.
 *
 * Default: narrative + readiness panel + change summary + blockers.
 * Selected tool: preview card with headline, metric, contextual actions, "Open Surface" CTA.
 * Theme-aware: uses Fluent CSS custom properties and HBC_STATUS_COLORS.
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
  HBC_SPACE_XS,
  HBC_STATUS_COLORS,
} from '@hbc/ui-kit';

import type {
  FinancialNarrative,
  FinancialToolPreview,
  FinancialToolPosture,
} from '../hooks/useFinancialControlCenter.js';

const POSTURE_COLORS: Record<string, string> = {
  healthy: HBC_STATUS_COLORS.success,
  watch: HBC_STATUS_COLORS.warning,
  'at-risk': HBC_STATUS_COLORS.atRisk,
  critical: HBC_STATUS_COLORS.critical,
  'no-data': HBC_STATUS_COLORS.neutral,
  blocked: HBC_STATUS_COLORS.critical,
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_MD}px`,
    padding: `${HBC_SPACE_MD}px`,
    overflow: 'auto',
    flex: 1,
  },
  narrativeCard: {
    borderLeft: '3px solid var(--colorBrandStroke1)',
  },
  readinessGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: `${HBC_SPACE_SM}px`,
    padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px`,
  },
  readinessItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    padding: `${HBC_SPACE_SM}px`,
    borderRadius: '4px',
    backgroundColor: 'var(--colorNeutralBackground2)',
    border: '1px solid var(--colorNeutralStroke2)',
  },
  readinessRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  readinessLabel: {
    fontSize: '11px',
    color: 'var(--colorNeutralForeground3)',
  },
  readinessDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  driverList: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
  },
  blockerCard: {
    borderLeft: `3px solid ${HBC_STATUS_COLORS.critical}`,
  },
  previewCard: {
    borderLeft: '3px solid var(--colorBrandStroke1)',
  },
  previewBody: {
    padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px`,
  },
  previewMetric: {
    display: 'flex',
    alignItems: 'baseline',
    gap: `${HBC_SPACE_SM}px`,
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1.2,
    color: 'var(--colorNeutralForeground1)',
  },
  metricLabel: {
    fontSize: '12px',
    color: 'var(--colorNeutralForeground3)',
  },
  topIssue: {
    color: HBC_STATUS_COLORS.warning,
    display: 'block',
    marginTop: `${HBC_SPACE_SM}px`,
  },
  contextualActionsBlock: {
    marginTop: `${HBC_SPACE_SM}px`,
  },
  contextualActionsLabel: {
    color: 'var(--colorNeutralForeground3)',
  },
  contextualActionItem: {
    display: 'block',
    marginTop: `${HBC_SPACE_XS}px`,
  },
  actionsRow: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_SM}px`,
  },
});

export interface FinancialControlCenterCoreProps {
  readonly narrative: FinancialNarrative;
  readonly tools: readonly FinancialToolPosture[];
  readonly selectedToolPreview: FinancialToolPreview | null;
  readonly onOpenSurface?: (toolId: string) => void;
}

export function FinancialControlCenterCore({
  narrative,
  tools,
  selectedToolPreview,
  onOpenSurface,
}: FinancialControlCenterCoreProps): ReactNode {
  const styles = useStyles();

  // Selected tool preview mode
  if (selectedToolPreview) {
    return (
      <div data-testid="financial-center-preview" data-tool={selectedToolPreview.toolId} className={styles.root}>
        <Card size="small" className={styles.previewCard}>
          <CardHeader
            header={<Text weight="semibold" size={400}>{selectedToolPreview.label}</Text>}
            description={<Text size={200}>{selectedToolPreview.headline}</Text>}
          />
          <div className={styles.previewBody}>
            <div className={styles.previewMetric}>
              <span className={styles.metricValue}>{selectedToolPreview.metricValue}</span>
              <span className={styles.metricLabel}>{selectedToolPreview.metricLabel}</span>
            </div>
            {selectedToolPreview.topIssue && (
              <Text size={200} className={styles.topIssue}>
                {selectedToolPreview.topIssue}
              </Text>
            )}
            {selectedToolPreview.contextualActions.length > 0 && (
              <div className={styles.contextualActionsBlock}>
                <Text size={200} weight="semibold" className={styles.contextualActionsLabel}>
                  Actions for this surface:
                </Text>
                {selectedToolPreview.contextualActions.map((action) => (
                  <Text key={action.id} size={200} className={styles.contextualActionItem}>
                    • {action.label} — {action.description}
                  </Text>
                ))}
              </div>
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

  // Default: narrative + readiness + drivers + blockers + changes + milestone
  return (
    <div data-testid="financial-center-narrative" className={styles.root}>
      <Card size="small" className={styles.narrativeCard}>
        <CardHeader
          header={<Text weight="semibold" size={300}>Financial Narrative</Text>}
          description={<Text size={300}>{narrative.overallPosture}</Text>}
        />
      </Card>

      <Card size="small">
        <CardHeader header={<Text weight="semibold" size={200}>Period Readiness</Text>} />
        <div className={styles.readinessGrid}>
          {tools.filter((t) => t.id !== 'history').map((tool) => (
            <div key={tool.id} className={styles.readinessItem}>
              <div className={styles.readinessRow}>
                <span
                  className={styles.readinessDot}
                  style={{ backgroundColor: POSTURE_COLORS[tool.posture] ?? HBC_STATUS_COLORS.neutral }}
                />
                <Text size={200} weight="semibold">{tool.label}</Text>
              </div>
              <span className={styles.readinessLabel}>
                {tool.blocked
                  ? tool.blockReason ?? 'Blocked'
                  : tool.issueCount > 0
                    ? `${tool.issueCount} issue${tool.issueCount > 1 ? 's' : ''}`
                    : tool.posture === 'healthy'
                      ? 'On track'
                      : tool.posture}
              </span>
            </div>
          ))}
        </div>
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
        <Card size="small" className={styles.blockerCard}>
          <CardHeader header={<Text weight="semibold" size={200}>Blockers</Text>} />
          <div className={styles.driverList}>
            {narrative.blockers.map((blocker, i) => (
              <Text key={i} size={200}>• {blocker}</Text>
            ))}
          </div>
        </Card>
      )}

      {narrative.changeSincePrior.length > 0 && (
        <Card size="small">
          <CardHeader header={<Text weight="semibold" size={200}>Changed Since Prior Version</Text>} />
          <div className={styles.driverList}>
            {narrative.changeSincePrior.map((change, i) => (
              <Text key={i} size={200}>• {change}</Text>
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
