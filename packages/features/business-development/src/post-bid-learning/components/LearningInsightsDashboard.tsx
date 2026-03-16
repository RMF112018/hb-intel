import React, { useMemo, useState } from 'react';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig } from '@hbc/smart-empty-state';
import {
  HbcBanner,
  HbcButton,
  HbcCard,
  HbcKpiCard,
  HbcLineChart,
  HbcPanel,
  HbcSelect,
  HbcStatusBadge,
  HbcTypography,
} from '@hbc/ui-kit';
import { getPostBidAutopsyApi } from '@hbc/post-bid-autopsy';

import { businessDevelopmentPostBidLearningProfile } from '../profiles/index.js';
import { mapPostBidAutopsyToBusinessDevelopmentView } from '../adapters/index.js';
import {
  type AutopsyComplexityTier,
  type AutopsyListPursuitMetadata,
  type BusinessDevelopmentAutopsyViewerRole,
  createBusinessDevelopmentInsightModel,
  createBusinessDevelopmentListRows,
} from './displayModel.js';

export interface LearningInsightsDashboardProps {
  readonly apiScope?: string;
  readonly viewerRole?: BusinessDevelopmentAutopsyViewerRole;
  readonly complexityTier?: AutopsyComplexityTier;
  readonly pursuitMetadata?: readonly AutopsyListPursuitMetadata[];
}

const styles = {
  shell: {
    display: 'grid',
    gap: '16px',
  },
  grid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  } satisfies React.CSSProperties,
  list: {
    display: 'grid',
    gap: '8px',
  } satisfies React.CSSProperties,
};

const INSIGHTS_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'No learning insights are available',
    description: 'Seed SF22 autopsy records before opening the insights dashboard.',
    coachingTip: 'Learning insights are derived from completed post-bid autopsy records.',
  }),
};

export const LearningInsightsDashboard: React.FC<LearningInsightsDashboardProps> = ({
  apiScope,
  viewerRole = 'business-development',
  complexityTier = 'Standard',
  pursuitMetadata = [],
}) => {
  const [activeMetric, setActiveMetric] = useState('publish-ready');
  const [activeComparator, setActiveComparator] = useState<'corroboration-vs-reinsertion' | 'completion-vs-revalidation'>(
    'corroboration-vs-reinsertion'
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const records = useMemo(() => getPostBidAutopsyApi(apiScope).listRecords(), [apiScope]);
  const metadataByPursuit = useMemo(
    () => new Map(pursuitMetadata.map((item) => [item.pursuitId, item])),
    [pursuitMetadata]
  );
  const views = useMemo(
    () =>
      new Map(
        records.map((record) => [
          record.autopsy.autopsyId,
          mapPostBidAutopsyToBusinessDevelopmentView(record.autopsy, businessDevelopmentPostBidLearningProfile),
        ])
      ),
    [records]
  );
  const rows = useMemo(
    () => createBusinessDevelopmentListRows(records, views, metadataByPursuit, viewerRole),
    [metadataByPursuit, records, viewerRole, views]
  );
  const insightModel = useMemo(() => createBusinessDevelopmentInsightModel(rows), [rows]);

  if (rows.length === 0) {
    return (
      <HbcSmartEmptyState
        config={INSIGHTS_EMPTY_CONFIG}
        context={{
          module: 'business-development',
          view: 'learning-insights',
          hasActiveFilters: false,
          hasPermission: true,
          isFirstVisit: false,
          currentUserRole: 'user',
          isLoadError: false,
        }}
        variant="inline"
      />
    );
  }

  const comparatorCopy =
    activeComparator === 'corroboration-vs-reinsertion'
      ? 'Comparator focuses on corroboration progression versus reinsertion opportunity.'
      : 'Comparator focuses on completion latency versus revalidation backlog.';

  return (
    <div style={styles.shell} data-testid="bd-learning-insights-dashboard">
      <HbcCard header={<HbcTypography intent="heading3">LearningInsightsDashboard</HbcTypography>}>
        <div style={styles.grid}>
          {insightModel.kpis.map((metric) => (
            <HbcKpiCard
              key={metric.metricId}
              label={metric.label}
              value={metric.value}
              trend={{ direction: metric.trendDirection, label: metric.trendLabel }}
              isActive={activeMetric === metric.metricId}
              onClick={() => setActiveMetric(metric.metricId)}
            />
          ))}
        </div>
      </HbcCard>

      {insightModel.staleBacklog.length > 0 ? (
        <HbcBanner variant="warning">
          Stale and revalidation backlog remains visible for {insightModel.staleBacklog.length} autopsy record(s).
        </HbcBanner>
      ) : null}

      <HbcCard header={<HbcTypography intent="heading3">Trend view</HbcTypography>}>
        <HbcLineChart
          title="Learning loop trend"
          xAxisLabels={[...insightModel.trendLabels]}
          series={insightModel.trendSeries.map((series) => ({ name: series.name, data: [...series.data] }))}
          height="320px"
        />
      </HbcCard>

      <div style={styles.grid}>
        <HbcCard header={<HbcTypography intent="heading3">Repeat patterns</HbcTypography>}>
          <div style={styles.list}>
            {insightModel.repeatPatterns.map((pattern) => (
              <HbcTypography key={pattern.label} intent="body">
                {pattern.label}: {pattern.count}
              </HbcTypography>
            ))}
          </div>
        </HbcCard>

        <HbcCard header={<HbcTypography intent="heading3">Promotion and corroboration</HbcTypography>}>
          <div style={styles.list}>
            <HbcTypography intent="body">
              Publish-ready rows: {rows.filter((row) => row.queueMemberships.includes('ready-to-publish')).length}
            </HbcTypography>
            <HbcTypography intent="body">
              Needs corroboration: {rows.filter((row) => row.queueMemberships.includes('needs-corroboration')).length}
            </HbcTypography>
            <HbcTypography intent="body">
              Conflict review: {rows.filter((row) => row.queueMemberships.includes('conflict-review')).length}
            </HbcTypography>
          </div>
        </HbcCard>

        <HbcCard header={<HbcTypography intent="heading3">Reinsertion opportunities</HbcTypography>}>
          <div style={styles.list}>
            {insightModel.reinsertionOpportunities.slice(0, 3).map((row) => (
              <HbcTypography key={row.autopsyId} intent="body">
                {row.pursuitName}: {row.primaryFactor}
              </HbcTypography>
            ))}
          </div>
        </HbcCard>
      </div>

      {complexityTier === 'Expert' ? (
        <HbcCard header={<HbcTypography intent="heading3">Expert comparator</HbcTypography>}>
          <div style={styles.shell}>
            <HbcSelect
              label="Comparator"
              value={activeComparator}
              onChange={(value) =>
                setActiveComparator(value as 'corroboration-vs-reinsertion' | 'completion-vs-revalidation')
              }
              options={insightModel.comparatorOptions.map((item) => ({
                label: item.label,
                value: item.comparatorId,
              }))}
            />
            <HbcTypography intent="body">{comparatorCopy}</HbcTypography>
            <div>
              <HbcStatusBadge variant="info" label={`Active metric ${activeMetric}`} />
            </div>
            <HbcButton variant="secondary" onClick={() => setDetailOpen(true)}>
              Open backlog drill-in
            </HbcButton>
          </div>
        </HbcCard>
      ) : null}

      <HbcPanel
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Backlog and reinsertion drill-in"
      >
        <div style={styles.list}>
          {insightModel.staleBacklog.map((row) => (
            <HbcTypography key={row.autopsyId} intent="body">
              {row.pursuitName}: {row.queueMemberships.join(', ')}
            </HbcTypography>
          ))}
        </div>
      </HbcPanel>
    </div>
  );
};
