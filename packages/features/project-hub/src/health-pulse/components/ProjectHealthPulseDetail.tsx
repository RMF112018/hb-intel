import { useEffect, useMemo, useState } from 'react';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig } from '@hbc/smart-empty-state';
import {
  HbcBanner,
  HbcButton,
  HbcLineChart,
  HbcPanel,
  HbcSpinner,
  HbcStatusBadge,
  HbcTabs,
  HbcTypography,
} from '@hbc/ui-kit';
import type { ComplexityTier } from '@hbc/complexity';

import { useProjectHealthPulse, type IUseProjectHealthPulseInput } from '../hooks/index.js';
import type { IHealthMetric } from '../types/index.js';
import {
  buildHistoryLabels,
  buildTrendSeries,
  getConfidenceLabel,
  getConfidenceVariant,
  getDimensionEntries,
  getStatusVariant,
  hasEscalatedCompoundRisk,
  isConfidenceCaution,
  type ExplainabilitySection,
  type HealthDimensionKey,
} from './displayModel.js';
import { ExplainabilityDrawer } from './ExplainabilityDrawer.js';

export interface ProjectHealthPulseDetailProps extends IUseProjectHealthPulseInput {
  open: boolean;
  onClose: () => void;
  initialTab?: HealthDimensionKey;
  complexityTier?: ComplexityTier;
}

const DIMENSION_TAB_LABELS: Record<HealthDimensionKey, string> = {
  cost: 'Cost',
  time: 'Time',
  field: 'Field',
  office: 'Office',
};

const formatMetricValue = (metric: IHealthMetric): string => {
  if (metric.value === null) return 'No data';
  return `${Math.round(metric.value)}`;
};

const DETAIL_PENDING_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'Health data pending',
    description: 'Project health pulse is not available yet.',
    coachingTip: 'Health pulse detail populates once the project health configuration is active.',
  }),
};

export const ProjectHealthPulseDetail = ({
  open,
  onClose,
  initialTab = 'cost',
  ...input
}: ProjectHealthPulseDetailProps) => {
  const [activeTab, setActiveTab] = useState<HealthDimensionKey>(initialTab);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [explainabilityOpen, setExplainabilityOpen] = useState(false);
  const [explainabilitySection, setExplainabilitySection] = useState<ExplainabilitySection>('why');

  const pulseState = useProjectHealthPulse(input);
  const pulse = pulseState.pulse;
  const hasCompoundEscalation = pulse ? hasEscalatedCompoundRisk(pulse.compoundRisks) : false;

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [initialTab, open]);

  const tabs = useMemo(
    () =>
      (Object.keys(DIMENSION_TAB_LABELS) as HealthDimensionKey[]).map((key) => ({
        id: key,
        label: DIMENSION_TAB_LABELS[key],
      })),
    []
  );

  const panels = useMemo(() => {
    if (!pulse) return [];

    return getDimensionEntries(pulse).map(([key, dimension]) => {
      const trendSeries = buildTrendSeries(dimension.score, dimension.trend);
      const xAxis = buildHistoryLabels(trendSeries.length);
      const excludedMetrics = dimension.metrics.filter((metric) => metric.value === null || metric.isStale);

      return {
        tabId: key,
        content: (
          <div>
            <div style={{ marginBottom: 12 }}>
              <HbcTypography intent="heading4">{dimension.label} Trend</HbcTypography>
              <HbcLineChart
                series={[{ name: `${dimension.label} score`, data: trendSeries }]}
                xAxisLabels={xAxis}
                height="220px"
              />
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <div>
                <HbcTypography intent="label">Leading</HbcTypography>
                <HbcTypography intent="body">{dimension.leadingScore}</HbcTypography>
              </div>
              <div>
                <HbcTypography intent="label">Lagging</HbcTypography>
                <HbcTypography intent="body">{dimension.laggingScore}</HbcTypography>
              </div>
            </div>

            {dimension.hasExcludedMetrics && (
              <HbcBanner variant="warning">
                Excluded metrics are present for this dimension.
                <div style={{ marginTop: 8 }}>
                  <HbcButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const anchor = document.getElementById(`excluded-metrics-${key}`);
                      anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    Jump to excluded metrics
                  </HbcButton>
                </div>
              </HbcBanner>
            )}

            {isConfidenceCaution(dimension.confidence.tier) && (
              <HbcBanner variant="warning">
                Confidence caution: {dimension.confidence.reasons.join(' ')}
              </HbcBanner>
            )}

            <div style={{ marginTop: 12 }}>
              <HbcTypography intent="heading4">Metrics</HbcTypography>
              <ul>
                {dimension.metrics.map((metric) => (
                  <li key={metric.key} id={metric.value === null || metric.isStale ? `excluded-metrics-${key}` : undefined}>
                    <HbcTypography intent="label">{metric.label}</HbcTypography>
                    <HbcTypography intent="body">
                      Value: {formatMetricValue(metric)} | Last updated: {metric.lastUpdatedAt ?? 'unknown'}
                    </HbcTypography>
                    <HbcTypography intent="bodySmall">
                      {metric.isStale ? 'Stale metric' : 'Fresh metric'} | {metric.isManualEntry ? 'Manual entry' : 'Automated entry'}
                    </HbcTypography>
                  </li>
                ))}
              </ul>
              {excludedMetrics.length > 0 && (
                <HbcTypography intent="bodySmall">
                  Excluded metrics: {excludedMetrics.map((metric) => metric.label).join(', ')}.
                </HbcTypography>
              )}
            </div>
          </div>
        ),
      };
    });
  }, [pulse]);

  return (
    <>
      <HbcPanel open={open} onClose={onClose} title="Project Health Pulse Detail" size="lg">
        {pulseState.isLoading && <HbcSpinner size="lg" label="Loading project health pulse detail" />}

        {pulseState.error && (
          <HbcBanner variant="error">
            Unable to render detail view: {pulseState.error.message}
          </HbcBanner>
        )}

        {!pulseState.isLoading && !pulseState.error && !pulse && (
          <HbcSmartEmptyState
            config={DETAIL_PENDING_CONFIG}
            context={{
              module: 'project-hub',
              view: 'health-pulse-detail',
              hasActiveFilters: false,
              hasPermission: true,
              isFirstVisit: false,
              currentUserRole: 'user',
              isLoadError: false,
            }}
            variant="inline"
          />
        )}

        {!pulseState.isLoading && !pulseState.error && pulse && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <HbcTypography intent="heading2">Overall Health</HbcTypography>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <HbcStatusBadge
                  variant={getStatusVariant(pulse.overallStatus)}
                  label={`Overall: ${pulse.overallStatus}`}
                />
                <HbcStatusBadge
                  variant={getConfidenceVariant(pulse.overallConfidence.tier)}
                  label={getConfidenceLabel(pulse.overallConfidence.tier)}
                />
                <HbcButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setExplainabilitySection('confidence');
                    setExplainabilityOpen(true);
                  }}
                >
                  View confidence context
                </HbcButton>
              </div>
            </div>

            {isConfidenceCaution(pulse.overallConfidence.tier) && (
              <HbcBanner variant="warning">
                Caution: pulse confidence is {pulse.overallConfidence.tier}. Review the confidence reasons before acting.
              </HbcBanner>
            )}

            {hasCompoundEscalation && (
              <HbcBanner variant="warning">
                Compound-risk escalation detected: {pulse.compoundRisks.map((risk) => risk.summary).join(' | ')}
              </HbcBanner>
            )}

            <div style={{ marginBottom: 12 }}>
              <HbcTypography intent="heading3">Top Recommended Action</HbcTypography>
              {pulse.topRecommendedAction ? (
                <div>
                  <HbcTypography intent="body">{pulse.topRecommendedAction.actionText}</HbcTypography>
                  <HbcTypography intent="bodySmall">
                    Reason code: {pulse.topRecommendedAction.reasonCode} | Owner: {pulse.topRecommendedAction.owner ?? 'Unassigned'} | Urgency: {pulse.topRecommendedAction.urgency}
                  </HbcTypography>
                </div>
              ) : (
                <HbcTypography intent="body">No top action recommendation is currently available.</HbcTypography>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <HbcButton variant="secondary" size="sm" onClick={() => setHistoryExpanded((value) => !value)}>
                {historyExpanded ? 'Hide 90-day history' : 'Show 90-day history'}
              </HbcButton>
              {historyExpanded && (
                <div style={{ marginTop: 8 }}>
                  <HbcLineChart
                    series={[
                      {
                        name: 'Overall pulse',
                        data: buildTrendSeries(pulse.overallScore, 'stable'),
                      },
                    ]}
                    xAxisLabels={buildHistoryLabels(13)}
                    height="260px"
                  />
                </div>
              )}
            </div>

            <HbcTabs
              tabs={tabs}
              activeTabId={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as HealthDimensionKey)}
              panels={panels}
            />
          </div>
        )}
      </HbcPanel>

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
