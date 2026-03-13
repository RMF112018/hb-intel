import React from 'react';

import { createMockHealthPulseAdminConfig, mockProjectHealthStates } from '../../../testing/index.js';
import type { PortfolioHealthRow } from './displayModel.js';
import { ExplainabilityDrawer } from './ExplainabilityDrawer.js';
import { PortfolioHealthTable } from './PortfolioHealthTable.js';
import { ProjectHealthPulseCard } from './ProjectHealthPulseCard.js';
import { ProjectHealthPulseDetail } from './ProjectHealthPulseDetail.js';

const adminConfig = createMockHealthPulseAdminConfig();

const metricsByDimension = {
  cost: mockProjectHealthStates.watchModerateEarlyWarning.dimensions.cost.metrics,
  time: mockProjectHealthStates.watchModerateEarlyWarning.dimensions.time.metrics,
  field: mockProjectHealthStates.watchModerateEarlyWarning.dimensions.field.metrics,
  office: mockProjectHealthStates.watchModerateEarlyWarning.dimensions.office.metrics,
};

const toPortfolioRows = (): PortfolioHealthRow[] =>
  mockProjectHealthStates.portfolioMixedStatusTriageSet.map((pulse) => ({
    projectId: pulse.projectId,
    projectName: pulse.projectId,
    overallStatus: pulse.overallStatus,
    overallScore: pulse.overallScore,
    confidenceTier: pulse.overallConfidence.tier,
    confidenceScore: pulse.overallConfidence.score,
    dimensions: {
      cost: pulse.dimensions.cost.score,
      time: pulse.dimensions.time.score,
      field: pulse.dimensions.field.score,
      office: pulse.dimensions.office.score,
    },
    compoundRiskActive: pulse.compoundRisks.length > 0,
    compoundRiskSeverity: pulse.compoundRisks[0]?.severity ?? 'none',
    topActionSummary: pulse.topRecommendedAction?.actionText ?? 'No action',
    triageBucket: pulse.triage.bucket,
    triageReasons: pulse.triage.triageReasons,
    manualInfluenceHeavy: pulse.overallConfidence.reasons.join(' ').toLowerCase().includes('manual'),
    deteriorationVelocity: pulse.triage.sortScore,
    compoundRiskSeverityScore: pulse.compoundRisks.length > 0 ? 3 : 0,
    unresolvedActionBacklog: pulse.topRecommendedAction ? 1 : 0,
  }));

export const storybookMatrix = {
  statusByConfidenceByComplexity: [
    'on-track/high/essential',
    'watch/moderate/standard',
    'at-risk/low/expert',
    'critical/moderate/expert',
    'data-pending/unreliable/standard',
  ],
  explainabilityVariants: ['why', 'changed', 'contributors', 'matters-most'],
  compoundRiskVariants: ['none', 'moderate', 'critical'],
  governanceSuppressionVariants: ['manual-influence-heavy', 'office-suppression-active'],
  triageVariants: ['attention-now', 'trending-down', 'data-quality-risk', 'recovering'],
} as const;

export default {
  title: 'Features/ProjectHub/HealthPulse/Matrix',
};

export const CardWatchStandard = () => (
  <ProjectHealthPulseCard
    projectId="storybook-watch"
    metricsByDimension={metricsByDimension}
    adminConfig={adminConfig}
    complexityTier="standard"
  />
);

export const DetailCriticalEscalation = () => (
  <ProjectHealthPulseDetail
    open
    onClose={() => {}}
    initialTab="office"
    projectId="storybook-critical"
    metricsByDimension={{
      cost: mockProjectHealthStates.criticalCompoundRiskEscalation.dimensions.cost.metrics,
      time: mockProjectHealthStates.criticalCompoundRiskEscalation.dimensions.time.metrics,
      field: mockProjectHealthStates.criticalCompoundRiskEscalation.dimensions.field.metrics,
      office: mockProjectHealthStates.criticalCompoundRiskEscalation.dimensions.office.metrics,
    }}
    adminConfig={adminConfig}
    complexityTier="expert"
  />
);

export const ExplainabilityVariants = () => (
  <ExplainabilityDrawer
    open
    onClose={() => {}}
    explainability={mockProjectHealthStates.watchModerateEarlyWarning.explainability}
    confidenceTier={mockProjectHealthStates.watchModerateEarlyWarning.overallConfidence.tier}
    confidenceReasons={mockProjectHealthStates.watchModerateEarlyWarning.overallConfidence.reasons}
    initialSection="why"
  />
);

export const PortfolioTriageMatrix = () => (
  <PortfolioHealthTable rows={toPortfolioRows()} onOpenProject={() => {}} />
);
