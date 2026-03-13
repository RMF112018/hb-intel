import type { IProjectHealthPulse } from '../src/health-pulse/types/index.js';
import { createMockHealthDimension } from './createMockHealthDimension.js';
import { createMockHealthMetric } from './createMockHealthMetric.js';
import { createMockProjectHealthPulse } from './createMockProjectHealthPulse.js';

export interface IMockProjectHealthStates {
  onTrackHighConfidenceComplete: IProjectHealthPulse;
  watchModerateEarlyWarning: IProjectHealthPulse;
  atRiskLowConfidenceStaleExcluded: IProjectHealthPulse;
  criticalCompoundRiskEscalation: IProjectHealthPulse;
  dataPendingUnreliableConfidence: IProjectHealthPulse;
  portfolioMixedStatusTriageSet: IProjectHealthPulse[];
  manualInfluenceHeavyGovernanceRiskSet: IProjectHealthPulse;
  officeSuppressionActiveSet: IProjectHealthPulse;
}

const onTrackHighConfidenceComplete = createMockProjectHealthPulse({
  projectId: 'pulse-on-track',
  overallScore: 92,
  overallStatus: 'on-track',
  overallConfidence: {
    tier: 'high',
    score: 91,
    reasons: ['Complete data and stable integrations'],
  },
  triage: { bucket: 'recovering', sortScore: 20, triageReasons: ['Stable across all dimensions'] },
});

const watchModerateEarlyWarning = createMockProjectHealthPulse({
  projectId: 'pulse-watch',
  overallScore: 74,
  overallStatus: 'watch',
  overallConfidence: { tier: 'moderate', score: 70, reasons: ['Early warning variance'] },
  triage: { bucket: 'trending-down', sortScore: 48, triageReasons: ['Time volatility increasing'] },
});

const atRiskLowConfidenceStaleExcluded = createMockProjectHealthPulse({
  projectId: 'pulse-at-risk',
  overallScore: 58,
  overallStatus: 'at-risk',
  overallConfidence: { tier: 'low', score: 41, reasons: ['Stale and excluded metrics'] },
  dimensions: {
    cost: createMockHealthDimension({
      label: 'Cost',
      status: 'at-risk',
      score: 52,
      hasExcludedMetrics: true,
      metrics: [
        createMockHealthMetric({ key: 'forecast-confidence', value: 55, isStale: false }),
        createMockHealthMetric({
          key: 'pending-change-order-aging',
          value: null,
          isStale: true,
          weight: 'lagging',
        }),
      ],
      confidence: { tier: 'low', score: 40, reasons: ['Cost exclusions present'] },
    }),
  },
});

const criticalCompoundRiskEscalation = createMockProjectHealthPulse({
  projectId: 'pulse-critical',
  overallScore: 32,
  overallStatus: 'critical',
  overallConfidence: { tier: 'moderate', score: 66, reasons: ['Signals are complete but severe'] },
  compoundRisks: [
    {
      code: 'time-field-deterioration',
      severity: 'critical',
      affectedDimensions: ['time', 'field'],
      summary: 'Time and field are deteriorating together.',
    },
  ],
  topRecommendedAction: {
    actionText: 'Escalate critical path and field recovery plan.',
    actionLink: '/projects/pulse-critical/health',
    reasonCode: 'CRITICAL_COMPOUND_RISK',
    owner: 'Ops Director',
    urgency: 99,
    impact: 95,
    confidenceWeight: 0.78,
  },
  triage: { bucket: 'attention-now', sortScore: 99, triageReasons: ['Critical compound risk'] },
});

const dataPendingUnreliableConfidence = createMockProjectHealthPulse({
  projectId: 'pulse-data-pending',
  overallScore: 0,
  overallStatus: 'data-pending',
  overallConfidence: {
    tier: 'unreliable',
    score: 10,
    reasons: ['Insufficient fresh data and integration gaps'],
  },
  topRecommendedAction: null,
  triage: { bucket: 'data-quality-risk', sortScore: 88, triageReasons: ['Data quality risk'] },
});

const manualInfluenceHeavyGovernanceRiskSet = createMockProjectHealthPulse({
  projectId: 'pulse-manual-influence',
  overallScore: 61,
  overallStatus: 'watch',
  overallConfidence: { tier: 'low', score: 36, reasons: ['Manual override influence is high'] },
  dimensions: {
    office: createMockHealthDimension({
      label: 'Office',
      score: 58,
      status: 'at-risk',
      metrics: [
        createMockHealthMetric({
          key: 'severity-weighted-overdue-signals',
          value: 58,
          isManualEntry: true,
          manualOverride: {
            reason: 'Office feed outage fallback',
            enteredBy: 'governance-user',
            enteredAt: '2026-03-01T00:00:00.000Z',
            requiresApproval: true,
            approvedBy: null,
            approvedAt: null,
          },
        }),
      ],
    }),
  },
  triage: {
    bucket: 'data-quality-risk',
    sortScore: 77,
    triageReasons: ['Manual influence exceeds governance threshold'],
  },
});

const officeSuppressionActiveSet = createMockProjectHealthPulse({
  projectId: 'pulse-office-suppression',
  overallScore: 71,
  overallStatus: 'watch',
  dimensions: {
    office: createMockHealthDimension({
      label: 'Office',
      score: 69,
      confidence: {
        tier: 'moderate',
        score: 67,
        reasons: ['Suppression removed duplicate low-impact signals'],
      },
    }),
  },
  triage: {
    bucket: 'trending-down',
    sortScore: 64,
    triageReasons: ['Suppression active with remaining moderate backlog risk'],
  },
});

const portfolioMixedStatusTriageSet: IProjectHealthPulse[] = [
  onTrackHighConfidenceComplete,
  watchModerateEarlyWarning,
  atRiskLowConfidenceStaleExcluded,
  criticalCompoundRiskEscalation,
  dataPendingUnreliableConfidence,
];

export const mockProjectHealthStates: IMockProjectHealthStates = {
  onTrackHighConfidenceComplete,
  watchModerateEarlyWarning,
  atRiskLowConfidenceStaleExcluded,
  criticalCompoundRiskEscalation,
  dataPendingUnreliableConfidence,
  portfolioMixedStatusTriageSet,
  manualInfluenceHeavyGovernanceRiskSet,
  officeSuppressionActiveSet,
};
