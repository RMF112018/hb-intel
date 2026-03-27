/**
 * BuyoutPage — hybrid procurement / financial interpretation workspace.
 * Integrates domain services: risk classification, forecast implications, warnings.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { MultiColumnLayout, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { useBuyoutSurface } from '../hooks/useBuyoutSurface.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';
import { BuyoutPostureHeader } from './BuyoutPostureHeader.js';
import { BuyoutExposureBand } from './BuyoutExposureBand.js';
import { BuyoutLinesGrid } from './BuyoutLinesGrid.js';
import { BuyoutRiskPanel } from './BuyoutRiskPanel.js';
import { BuyoutWorkflowRail } from './BuyoutWorkflowRail.js';

const useStyles = makeStyles({
  warningBanner: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    backgroundColor: HBC_STATUS_COLORS.warning + '22',
    borderBottom: `2px solid ${HBC_STATUS_COLORS.warning}`,
  },
  warningText: { color: HBC_STATUS_COLORS.warning },
  implicationBanner: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    backgroundColor: 'var(--colorNeutralBackground3)',
    borderBottom: '1px solid var(--colorNeutralStroke1)',
  },
});

export interface BuyoutPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack: () => void;
}

export function BuyoutPage({ projectId, viewerRole, complexityTier, onBack }: BuyoutPageProps): ReactNode {
  const styles = useStyles();
  const data = useBuyoutSurface({ viewerRole, complexityTier });

  const criticalWarnings = data.warnings.filter(w => w.severity === 'critical' || w.severity === 'at-risk');

  return (
    <>
      <BuyoutPostureHeader surfaceState={data.surfaceState} percentComplete={data.percentComplete} canEdit={data.canEdit} onBack={onBack} />

      {criticalWarnings.length > 0 && (
        <div className={styles.warningBanner} data-testid="buyout-warning-banner">
          {criticalWarnings.map(w => (
            <Text key={w.metric} size={200} weight="semibold" className={styles.warningText}>
              {w.explanation} — {w.recommendation}
            </Text>
          ))}
        </div>
      )}

      {data.forecastImplications.length > 0 && (
        <div className={styles.implicationBanner} data-testid="buyout-implication-banner">
          {data.forecastImplications.map((imp, i) => (
            <Text key={i} size={200}>{imp.description} ({imp.module})</Text>
          ))}
        </div>
      )}

      <BuyoutExposureBand kpis={data.kpis} />
      <MultiColumnLayout
        testId="buyout-layout"
        config={{ right: { width: 360, hideOnTablet: true, hideOnMobile: true } }}
        centerSlot={<BuyoutLinesGrid lines={data.lines} selectedLineId={data.selectedLineId} onSelectLine={data.selectLine} />}
        rightSlot={
          <>
            <BuyoutRiskPanel detail={data.selectedLineDetail} />
            <BuyoutWorkflowRail undispositionedSavings={data.undispositionedSavings} totalExposure={data.totalExposure} />
          </>
        }
      />
    </>
  );
}
