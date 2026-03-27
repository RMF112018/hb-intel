import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  Card,
  CardHeader,
  HBC_DENSITY_TOKENS,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HbcButton,
  Text,
  useDensity,
  HBC_STATUS_COLORS,
  HBC_SURFACE_LIGHT,
} from '@hbc/ui-kit';

import type { RiskExposureSummary } from '../hooks/useRiskExposureSummary.js';

const STATUS_COLORS: Record<string, string> = {
  healthy: HBC_STATUS_COLORS.success,
  watch: HBC_STATUS_COLORS.warning,
  'at-risk': HBC_STATUS_COLORS.atRisk,
  critical: HBC_STATUS_COLORS.critical,
};

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    padding: `${HBC_SPACE_MD}px`,
    overflow: 'auto',
    flex: 1,
  },
  rootComfortable: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
    padding: `${HBC_DENSITY_TOKENS.comfortable.tapSpacingMin}px`,
  },
  rootTouch: {
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    padding: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
  },
  zoneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: `${HBC_SPACE_MD}px`,
  },
  healthBand: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px`,
    borderRadius: '4px',
  },
  statusDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  metricLabel: {
    fontSize: '12px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  driverList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: `${HBC_SPACE_SM}px`,
  },
  correlationBox: {
    padding: `${HBC_SPACE_SM}px`,
    backgroundColor: HBC_STATUS_COLORS.warning + '33',
    borderRadius: '4px',
    borderLeft: `3px solid ${HBC_STATUS_COLORS.warning}`,
  },
  actionsRow: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
    marginTop: `${HBC_SPACE_SM}px`,
  },
});

export interface RiskExposureCanvasProps {
  readonly data: RiskExposureSummary;
  readonly onOpenModule: (slug: string) => void;
}

export function RiskExposureCanvas({
  data,
  onOpenModule,
}: RiskExposureCanvasProps): ReactNode {
  const styles = useStyles();
  const { tier: densityTier } = useDensity();

  const { healthPosture, costExposure, scheduleRisk, qualitySafety, crossDriver } = data;

  return (
    <div
      data-testid="risk-exposure-canvas"
      className={mergeClasses(
        styles.root,
        densityTier === 'comfortable' && styles.rootComfortable,
        densityTier === 'touch' && styles.rootTouch,
      )}
    >
      {/* Z1 — Overall Health Posture */}
      <Card size="small">
        <CardHeader
          header={
            <div className={styles.healthBand}>
              <span
                className={styles.statusDot}
                style={{ backgroundColor: STATUS_COLORS[healthPosture.overallStatus] }}
              />
              <Text weight="semibold" size={400} style={{ textTransform: 'capitalize' }}>
                {healthPosture.overallStatus.replace('-', ' ')}
              </Text>
              <Text size={200} style={{ color: HBC_SURFACE_LIGHT['text-muted'] }}>
                {healthPosture.trend} · {healthPosture.freshnessLabel}
              </Text>
            </div>
          }
        />
        <div style={{ padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px` }}>
          <Text size={200} weight="semibold">Top drivers:</Text>
          <div className={styles.driverList}>
            {healthPosture.topDrivers.map((driver, i) => (
              <Text key={i} size={200}>• {driver}</Text>
            ))}
          </div>
        </div>
      </Card>

      {/* Z2–Z4 — Exposure zones grid */}
      <div className={styles.zoneGrid} data-testid="risk-exposure-zones">
        {/* Z2 — Cost / Forecast */}
        <Card size="small">
          <CardHeader header={<Text weight="semibold" size={200}>Cost / Forecast Exposure</Text>} />
          <div style={{ padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px`, display: 'grid', gap: `${HBC_SPACE_SM}px` }}>
            <div>
              <div className={styles.metricValue}>${(costExposure.forecastDrift / 1000).toFixed(0)}k</div>
              <div className={styles.metricLabel}>Forecast drift</div>
            </div>
            <div>
              <div className={styles.metricValue}>${(costExposure.unresolvedExposure / 1000).toFixed(0)}k</div>
              <div className={styles.metricLabel}>Unresolved exposure</div>
            </div>
            <Text size={200}>
              {costExposure.pendingConfirmations} pending confirmations · Report {costExposure.reportPosture}
            </Text>
            <div className={styles.actionsRow}>
              <HbcButton variant="secondary" onClick={() => onOpenModule('financial')}>
                Open Financial
              </HbcButton>
            </div>
          </div>
        </Card>

        {/* Z3 — Schedule / Milestone */}
        <Card size="small">
          <CardHeader header={<Text weight="semibold" size={200}>Schedule / Milestone Risk</Text>} />
          <div style={{ padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px`, display: 'grid', gap: `${HBC_SPACE_SM}px` }}>
            <div>
              <div className={styles.metricValue}>{scheduleRisk.milestoneDriftCount}</div>
              <div className={styles.metricLabel}>Milestones drifting</div>
            </div>
            <Text size={200}>
              {scheduleRisk.nearTermRiskCount} near-term risk · {scheduleRisk.downstreamImpacts} downstream impacts
            </Text>
            {scheduleRisk.staleUpdateWarning && (
              <Text size={200} style={{ color: HBC_STATUS_COLORS.atRisk }}>Stale update warning</Text>
            )}
            <div className={styles.actionsRow}>
              <HbcButton variant="secondary" onClick={() => onOpenModule('schedule')}>
                Open Schedule
              </HbcButton>
              <HbcButton variant="secondary" onClick={() => onOpenModule('constraints')}>
                Review Constraints
              </HbcButton>
            </div>
          </div>
        </Card>

        {/* Z4 — Quality / Safety / Closeout */}
        <Card size="small">
          <CardHeader header={<Text weight="semibold" size={200}>Quality / Safety / Closeout</Text>} />
          <div style={{ padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px`, display: 'grid', gap: `${HBC_SPACE_SM}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className={styles.statusDot}
                style={{ backgroundColor: STATUS_COLORS[qualitySafety.safetyHealthBand], width: '10px', height: '10px' }}
              />
              <Text size={200} style={{ textTransform: 'capitalize' }}>
                Safety: {qualitySafety.safetyHealthBand.replace('-', ' ')}
              </Text>
            </div>
            <Text size={200}>
              {qualitySafety.blockedGates} blocked gates · {qualitySafety.unresolvedCorrectiveActions} unresolved corrective actions
            </Text>
            {qualitySafety.closeoutConcerns > 0 && (
              <Text size={200}>{qualitySafety.closeoutConcerns} closeout concerns</Text>
            )}
            <div className={styles.actionsRow}>
              <HbcButton variant="secondary" onClick={() => onOpenModule('safety')}>
                Open Safety
              </HbcButton>
              <HbcButton variant="secondary" onClick={() => onOpenModule('closeout')}>
                Open Closeout
              </HbcButton>
            </div>
          </div>
        </Card>
      </div>

      {/* Z5 — Cross-Driver Correlation */}
      <div className={styles.correlationBox} data-testid="cross-driver-correlation">
        <Text weight="semibold" size={200}>Cross-Driver Correlation</Text>
        <Text size={200} style={{ display: 'block', marginTop: '4px' }}>
          {crossDriver.correlationSummary}
        </Text>
        <Text size={100} style={{ color: HBC_SURFACE_LIGHT['text-muted'], display: 'block', marginTop: '4px' }}>
          {crossDriver.linkedRecordCount} linked records
        </Text>
      </div>
    </div>
  );
}
