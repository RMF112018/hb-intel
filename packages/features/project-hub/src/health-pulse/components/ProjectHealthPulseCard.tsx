import { useState } from 'react';
import {
  HbcBanner,
  HbcButton,
  HbcCard,
  HbcEmptyState,
  HbcSpinner,
  HbcStatusBadge,
  HbcTypography,
} from '@hbc/ui-kit';
import { useComplexity, type ComplexityTier } from '@hbc/complexity';

import { useProjectHealthPulse, type IUseProjectHealthPulseInput } from '../hooks/index.js';
import {
  getConfidenceLabel,
  getConfidenceVariant,
  getDimensionEntries,
  getStatusVariant,
  hasEscalatedCompoundRisk,
  isConfidenceCaution,
  resolveComplexityTier,
  type ExplainabilitySection,
  type HealthDimensionKey,
} from './displayModel.js';
import { ExplainabilityDrawer } from './ExplainabilityDrawer.js';
import { ProjectHealthPulseDetail } from './ProjectHealthPulseDetail.js';

export interface ProjectHealthPulseCardProps extends IUseProjectHealthPulseInput {
  complexityTier?: ComplexityTier;
  onOpenDetail?: (tab: HealthDimensionKey) => void;
  onOpenExplainability?: (section: ExplainabilitySection) => void;
}

const DIMENSION_GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
  marginTop: 12,
};

export const ProjectHealthPulseCard = ({
  complexityTier,
  onOpenDetail,
  onOpenExplainability,
  ...input
}: ProjectHealthPulseCardProps) => {
  const { tier } = useComplexity();
  const resolvedTier = resolveComplexityTier(complexityTier, tier);
  const pulseState = useProjectHealthPulse(input);
  const pulse = pulseState.pulse;

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<HealthDimensionKey>('cost');
  const [explainabilityOpen, setExplainabilityOpen] = useState(false);
  const [explainabilitySection, setExplainabilitySection] = useState<ExplainabilitySection>('why');

  const openDetail = (tab: HealthDimensionKey) => {
    setDetailTab(tab);
    setDetailOpen(true);
    onOpenDetail?.(tab);
  };

  const openExplainability = (section: ExplainabilitySection) => {
    setExplainabilitySection(section);
    setExplainabilityOpen(true);
    onOpenExplainability?.(section);
  };

  const isEssential = resolvedTier === 'essential';
  const showCompoundRisk = pulse ? hasEscalatedCompoundRisk(pulse.compoundRisks) : false;
  const hasExclusionsOrGovernance = pulse
    ? getDimensionEntries(pulse).some(([, dimension]) => dimension.hasExcludedMetrics) ||
      pulseState.derivation.governanceReasonCodes.length > 0
    : false;

  return (
    <>
      <HbcCard
        header={<HbcTypography intent="heading3">Project Health Pulse</HbcTypography>}
      >
        {pulseState.isLoading && <HbcSpinner size="lg" label="Loading project health pulse" />}

        {pulseState.error && (
          <HbcBanner variant="error">
            Unable to load pulse summary: {pulseState.error.message}
          </HbcBanner>
        )}

        {!pulseState.isLoading && !pulseState.error && !pulse && (
          <HbcEmptyState title="Health data pending" description="Project health data is not available yet." />
        )}

        {!pulseState.isLoading && !pulseState.error && pulse && (
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <HbcButton variant="ghost" size="sm" onClick={() => openDetail('cost')}>
                <HbcStatusBadge
                  variant={getStatusVariant(pulse.overallStatus)}
                  label={`Overall: ${pulse.overallStatus}`}
                />
              </HbcButton>
              <HbcButton
                variant="ghost"
                size="sm"
                onClick={() => openExplainability('confidence')}
              >
                {getConfidenceLabel(pulse.overallConfidence.tier)}
              </HbcButton>
            </div>

            {isConfidenceCaution(pulse.overallConfidence.tier) && (
              <HbcBanner variant="warning">
                Confidence caution: review reasons before acting.
              </HbcBanner>
            )}

            <div style={{ marginTop: 8 }}>
              <HbcTypography intent="body">
                {pulse.topRecommendedAction
                  ? `${pulse.topRecommendedAction.actionText}`
                  : 'No top recommendation is currently available.'}
              </HbcTypography>
              {pulse.topRecommendedAction && (
                <HbcTypography intent="bodySmall">
                  Reason code: {pulse.topRecommendedAction.reasonCode}
                  {pulse.topRecommendedAction.actionLink ? (
                    <>
                      {' | '}
                      <a href={pulse.topRecommendedAction.actionLink}>Open action link</a>
                    </>
                  ) : null}
                </HbcTypography>
              )}
            </div>

            {!isEssential && (
              <>
                <div style={DIMENSION_GRID_STYLE}>
                  {getDimensionEntries(pulse).map(([key, dimension]) => (
                    <HbcButton
                      key={key}
                      variant="secondary"
                      size="sm"
                      onClick={() => openDetail(key)}
                    >
                      {dimension.label}: {dimension.score} ({getConfidenceLabel(dimension.confidence.tier)})
                    </HbcButton>
                  ))}
                </div>

                {hasExclusionsOrGovernance && (
                  <HbcBanner variant="warning">
                    Excluded or governance-impacted metrics detected. Review detail tabs for context.
                  </HbcBanner>
                )}

                {showCompoundRisk && (
                  <HbcBanner variant="warning">
                    Compound risk active: {pulse.compoundRisks.map((risk) => risk.summary).join(' | ')}
                  </HbcBanner>
                )}
              </>
            )}
          </div>
        )}
      </HbcCard>

      <ProjectHealthPulseDetail
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        initialTab={detailTab}
        complexityTier={resolvedTier}
        {...input}
      />

      <ExplainabilityDrawer
        open={explainabilityOpen}
        onClose={() => setExplainabilityOpen(false)}
        explainability={pulse?.explainability ?? null}
        initialSection={explainabilitySection}
        confidenceTier={pulse?.overallConfidence.tier ?? null}
        confidenceReasons={pulse?.overallConfidence.reasons ?? []}
      />
    </>
  );
};
