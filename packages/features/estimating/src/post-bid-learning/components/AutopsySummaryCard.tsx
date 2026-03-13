import React from 'react';
import {
  HbcButton,
  HbcCard,
  HbcStatusBadge,
  HbcTypography,
} from '@hbc/ui-kit';

import { estimatingPostBidLearningProfile } from '../profiles/index.js';
import { useEstimatingPostBidLearning } from '../hooks/index.js';
import type { AutopsyDeepLink, AutopsyImpactPreview } from './displayModel.js';
import {
  formatOutcomeLabel,
  formatStatusLabel,
  getQueueLabel,
  toConfidenceVariant,
  toLifecycleVariant,
  toOutcomeVariant,
} from './displayModel.js';

export interface AutopsySummaryCardProps {
  readonly pursuitId: string;
  readonly relatedFindingLinks?: readonly AutopsyDeepLink[];
  readonly seededIntelligenceLinks?: readonly AutopsyDeepLink[];
  readonly impactPreview?: AutopsyImpactPreview | null;
}

const summaryStyles = {
  chips: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  } satisfies React.CSSProperties,
  linkList: {
    display: 'grid',
    gap: '8px',
  } satisfies React.CSSProperties,
};

export const AutopsySummaryCard: React.FC<AutopsySummaryCardProps> = ({
  pursuitId,
  relatedFindingLinks = [],
  seededIntelligenceLinks = [],
  impactPreview = null,
}) => {
  const adapter = useEstimatingPostBidLearning({
    pursuitId,
    profile: estimatingPostBidLearningProfile,
  });

  if (adapter.loading) {
    return (
      <HbcCard header={<HbcTypography intent="heading3">AutopsySummaryCard</HbcTypography>}>
        <HbcTypography intent="bodySmall">Loading post-bid autopsy summary...</HbcTypography>
      </HbcCard>
    );
  }

  if (adapter.error || !adapter.state.view) {
    return (
      <HbcCard header={<HbcTypography intent="heading3">AutopsySummaryCard</HbcTypography>}>
        <HbcTypography intent="bodySmall">
          {adapter.error ?? 'No autopsy summary is available for this pursuit.'}
        </HbcTypography>
      </HbcCard>
    );
  }

  const view = adapter.state.view;
  const topEvidence = view.evidenceReferences[0];

  return (
    <HbcCard
      header={
        <div style={summaryStyles.chips}>
          <HbcTypography intent="heading3">AutopsySummaryCard</HbcTypography>
          <HbcStatusBadge variant={toOutcomeVariant(view.row.outcome)} label={formatOutcomeLabel(view.row.outcome)} />
          <HbcStatusBadge variant={toConfidenceVariant(view.row.confidenceTier)} label={`Confidence ${view.row.confidenceTier}`} />
          <HbcStatusBadge variant={toLifecycleVariant(view.row.status)} label={formatStatusLabel(view.row.status)} />
        </div>
      }
      footer={
        <div style={summaryStyles.chips}>
          <HbcButton variant="secondary">
            Queue: {getQueueLabel(null)}
          </HbcButton>
          {impactPreview?.benchmarkHint && (
            <HbcStatusBadge variant="info" label={impactPreview.benchmarkHint} />
          )}
          {impactPreview?.intelligenceHint && (
            <HbcStatusBadge variant="info" label={impactPreview.intelligenceHint} />
          )}
        </div>
      }
    >
      <div style={summaryStyles.grid}>
        <div>
          <HbcTypography intent="label">Primary factor</HbcTypography>
          <HbcTypography intent="body">
            {view.benchmarkRecommendation.rootCauseCodes[0] ?? 'Primary factor pending'}
          </HbcTypography>
        </div>
        <div>
          <HbcTypography intent="label">Key retrospective finding</HbcTypography>
          <HbcTypography intent="body">
            {view.summary.disagreementCount > 0
              ? `${view.summary.disagreementCount} disagreement${view.summary.disagreementCount === 1 ? '' : 's'} require review.`
              : 'No disagreement deadlocks currently block reuse.'}
          </HbcTypography>
        </div>
        <div>
          <HbcTypography intent="label">Reusable finding</HbcTypography>
          <HbcTypography intent="body">
            {view.benchmarkRecommendation.rootCauseCodes[0] ?? 'No reusable finding coded'}
          </HbcTypography>
          <HbcTypography intent="bodySmall">
            {topEvidence
              ? `Evidence marker: ${view.evidenceReferences.length} source${view.evidenceReferences.length === 1 ? '' : 's'} / ${topEvidence.type}`
              : 'Evidence marker: no sources'}
          </HbcTypography>
        </div>
      </div>

      <div style={summaryStyles.linkList}>
        {relatedFindingLinks.map((link) => (
          <SummaryLink key={link.linkId} link={link} prefix="Related finding" />
        ))}
        {seededIntelligenceLinks.map((link) => (
          <SummaryLink key={link.linkId} link={link} prefix="Seeded intelligence" />
        ))}
      </div>
    </HbcCard>
  );
};

const SummaryLink: React.FC<{ link: AutopsyDeepLink; prefix: string }> = ({ link, prefix }) => {
  if (link.href) {
    return (
      <a href={link.href} aria-label={`${prefix}: ${link.label}`}>
        {prefix}: {link.label}
      </a>
    );
  }

  return (
    <button type="button" onClick={link.onClick} aria-label={`${prefix}: ${link.label}`}>
      {prefix}: {link.label}
    </button>
  );
};
