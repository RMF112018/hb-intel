/**
 * CashFlowPage — actual-and-forecast financial timing workspace.
 * Integrates domain services: watch periods, warnings, variance, corrections, export.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { MultiColumnLayout, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { useCashFlowSurface } from '../hooks/useCashFlowSurface.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';
import { CashFlowHeader } from './CashFlowHeader.js';
import { CashFlowKpiBand } from './CashFlowKpiBand.js';
import { CashFlowMonthlyGrid } from './CashFlowMonthlyGrid.js';
import { CashFlowTrendPanel } from './CashFlowTrendPanel.js';
import { CashFlowEvidenceRail } from './CashFlowEvidenceRail.js';

const useStyles = makeStyles({
  watchBanner: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    backgroundColor: HBC_STATUS_COLORS.warning + '22',
    borderBottom: `2px solid ${HBC_STATUS_COLORS.warning}`,
  },
  watchBannerText: {
    color: HBC_STATUS_COLORS.warning,
  },
  warningBanner: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    backgroundColor: HBC_STATUS_COLORS.critical + '15',
    borderBottom: `2px solid ${HBC_STATUS_COLORS.critical}`,
  },
  warningBannerText: {
    color: HBC_STATUS_COLORS.critical,
  },
  exportBlockBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    backgroundColor: 'var(--colorNeutralBackground3)',
    borderBottom: '1px solid var(--colorNeutralStroke1)',
  },
  unsavedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    backgroundColor: 'var(--colorBrandBackground2)',
    borderBottom: '1px solid var(--colorBrandStroke1)',
  },
});

export interface CashFlowPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack: () => void;
}

export function CashFlowPage({ projectId, viewerRole, complexityTier, onBack }: CashFlowPageProps): ReactNode {
  const styles = useStyles();
  const data = useCashFlowSurface({ viewerRole, complexityTier });

  const criticalWatchPeriods = data.watchPeriods.filter((w) => w.severity === 'critical');
  const criticalWarnings = data.warnings.filter((w) => w.severity === 'critical' || w.severity === 'at-risk');

  return (
    <>
      <CashFlowHeader
        surfaceState={data.surfaceState}
        canEdit={data.canEditForecasts}
        hasUnsavedChanges={data.hasUnsavedChanges}
        exportReadiness={data.exportReadiness}
        onBack={onBack}
      />

      {/* Watch period banners */}
      {criticalWatchPeriods.length > 0 && (
        <div className={styles.watchBanner} data-testid="cash-flow-watch-banner">
          <Text size={200} weight="semibold" className={styles.watchBannerText}>
            {criticalWatchPeriods.length} watch period{criticalWatchPeriods.length > 1 ? 's' : ''}:
          </Text>
          {criticalWatchPeriods.map((wp) => (
            <Text key={`${wp.month}-${wp.reason}`} size={200} className={styles.watchBannerText}>
              {wp.month} — {wp.explanation}
            </Text>
          ))}
        </div>
      )}

      {/* Critical warning banners */}
      {criticalWarnings.length > 0 && (
        <div className={styles.warningBanner} data-testid="cash-flow-warning-banner">
          {criticalWarnings.map((w) => (
            <Text key={w.metric} size={200} weight="semibold" className={styles.warningBannerText}>
              {w.explanation} — {w.recommendation}
            </Text>
          ))}
        </div>
      )}

      {/* Export block banner */}
      {!data.exportReadiness.isExportable && data.exportReadiness.blockReasons.length > 0 && (
        <div className={styles.exportBlockBanner} data-testid="cash-flow-export-block">
          <Text size={200}>Export blocked: {data.exportReadiness.blockReasons.join('; ')}</Text>
        </div>
      )}

      {/* Unsaved changes */}
      {data.hasUnsavedChanges && (
        <div className={styles.unsavedBanner} data-testid="cash-flow-unsaved-banner">
          <Text size={200} weight="semibold">{data.dirtyMonths.size} unsaved forecast change{data.dirtyMonths.size > 1 ? 's' : ''}</Text>
        </div>
      )}

      <CashFlowKpiBand kpis={data.kpis} />

      <MultiColumnLayout
        testId="cash-flow-layout"
        config={{ right: { width: 320, hideOnTablet: true, hideOnMobile: true } }}
        centerSlot={
          <>
            <CashFlowMonthlyGrid months={data.months} selectedMonthId={data.selectedMonthId} onSelectMonth={data.selectMonth} />
            <CashFlowTrendPanel trendPoints={data.trendPoints} peakCashRequirement={data.peakCashRequirement} />
          </>
        }
        rightSlot={<CashFlowEvidenceRail arSummary={data.arSummary} manualCorrections={data.manualCorrections} />}
      />
    </>
  );
}
