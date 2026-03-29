/**
 * ForecastSummaryPage — working financial summary surface.
 *
 * Role-aware and state-aware. Composes 5 regions with surface-state-
 * driven behavior (editing/comparing/reviewing/read-only).
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { MultiColumnLayout, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';

import { useForecastSummary } from '../hooks/useForecastSummary.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';
import { ForecastVersionHeader } from './ForecastVersionHeader.js';
import { ForecastKpiBand } from './ForecastKpiBand.js';
import { ForecastSummaryForm } from './ForecastSummaryForm.js';
import { ForecastDeltaPanel } from './ForecastDeltaPanel.js';
import { ForecastCommentaryRail } from './ForecastCommentaryRail.js';

const useStyles = makeStyles({
  staleBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: HBC_STATUS_COLORS.warning + '22',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: HBC_STATUS_COLORS.warning,
  },
  staleBannerText: {
    color: HBC_STATUS_COLORS.warning,
  },
  unsavedBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: 'var(--colorBrandBackground2)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorBrandStroke1)',
  },
  compareBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: 'var(--colorNeutralBackground3)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke1)',
  },
});

export interface ForecastSummaryPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack: () => void;
}

export function ForecastSummaryPage({
  projectId,
  viewerRole,
  complexityTier,
  onBack,
}: ForecastSummaryPageProps): ReactNode {
  const styles = useStyles();
  const data = useForecastSummary({ viewerRole, complexityTier });

  return (
    <>
      {/* R1 — Version Header */}
      <ForecastVersionHeader
        version={data.version}
        onBack={onBack}
        onSave={data.hasUnsavedChanges ? data.saveChanges : undefined}
        onSubmitForReview={data.version.isEditable && !data.hasUnsavedChanges ? () => {} : undefined}
        onToggleCompare={data.toggleCompareMode}
        isCompareMode={data.isCompareMode}
        isSaving={data.isSaving}
      />

      {/* State banners */}
      {data.staleBanner.visible && (
        <div className={styles.staleBanner} data-testid="stale-banner">
          <Text size={200} weight="semibold" className={styles.staleBannerText}>
            Stale: {data.staleBanner.message}
          </Text>
          {data.staleBanner.sources.length > 0 && (
            <Text size={200}> — Sources: {data.staleBanner.sources.join(', ')}</Text>
          )}
        </div>
      )}

      {data.hasUnsavedChanges && (
        <div className={styles.unsavedBanner} data-testid="unsaved-banner">
          <Text size={200} weight="semibold">
            {data.dirtyFields.size} unsaved change{data.dirtyFields.size > 1 ? 's' : ''}
          </Text>
        </div>
      )}

      {data.isCompareMode && (
        <div className={styles.compareBanner} data-testid="compare-banner">
          <Text size={200}>
            Comparing to: {data.version.compareTarget ?? 'prior version'}
          </Text>
        </div>
      )}

      {/* R2 — KPI Band */}
      <ForecastKpiBand kpis={data.kpis} />

      {/* R3–R5 — Multi-column: form + delta/commentary */}
      <MultiColumnLayout
        testId="forecast-summary-layout"
        config={{
          right: { width: 340, hideOnTablet: true, hideOnMobile: true },
        }}
        centerSlot={
          <ForecastSummaryForm
            sections={data.sections}
            isEditable={data.version.isEditable}
            dirtyFields={data.dirtyFields}
            isCompareMode={data.isCompareMode}
            surfaceState={data.version.surfaceState}
            onEditField={data.editField}
          />
        }
        rightSlot={
          <>
            <ForecastDeltaPanel
              deltas={data.priorComparison}
              compareTarget={data.version.compareTarget}
            />
            <ForecastCommentaryRail
              commentary={data.commentary}
              exposureItems={data.exposureItems}
            />
          </>
        }
      />
    </>
  );
}
