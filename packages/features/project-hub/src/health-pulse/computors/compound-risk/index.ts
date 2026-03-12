import type {
  ICompoundRiskSignal,
  IHealthDimension,
  IPortfolioTriageProjection,
  ITopRecommendedAction,
} from '../../types/index.js';

export interface ICompoundRiskEvaluationResult {
  signals: ICompoundRiskSignal[];
  triageSortDelta: number;
  recommendationUrgencyDelta: number;
}

const isDeteriorating = (dimension: IHealthDimension): boolean =>
  dimension.trend === 'declining' || dimension.status === 'at-risk' || dimension.status === 'critical';

const severityToDelta = (severity: ICompoundRiskSignal['severity']): number => {
  if (severity === 'critical') return 30;
  if (severity === 'high') return 20;
  if (severity === 'moderate') return 10;
  return 5;
};

export const evaluateCompoundRiskSignals = (dimensions: {
  cost: IHealthDimension;
  time: IHealthDimension;
  field: IHealthDimension;
  office: IHealthDimension;
}): ICompoundRiskEvaluationResult => {
  const signals: ICompoundRiskSignal[] = [];

  if (isDeteriorating(dimensions.time) && isDeteriorating(dimensions.field)) {
    signals.push({
      code: 'time-field-deterioration',
      severity: dimensions.time.status === 'critical' || dimensions.field.status === 'critical' ? 'critical' : 'high',
      affectedDimensions: ['time', 'field'],
      summary: 'Time and field performance are deteriorating together.',
    });
  }

  if (isDeteriorating(dimensions.cost) && isDeteriorating(dimensions.time)) {
    signals.push({
      code: 'cost-time-correlation',
      severity: dimensions.cost.score < 50 && dimensions.time.score < 50 ? 'high' : 'moderate',
      affectedDimensions: ['cost', 'time'],
      summary: 'Cost and schedule signals show escalation correlation.',
    });
  }

  if (
    dimensions.office.status !== 'on-track' &&
    (dimensions.field.status === 'at-risk' || dimensions.field.status === 'critical')
  ) {
    signals.push({
      code: 'office-field-amplification',
      severity: dimensions.office.score < 40 ? 'high' : 'moderate',
      affectedDimensions: ['office', 'field'],
      summary: 'Office backlog is amplifying field delivery risk.',
    });
  }

  const triageSortDelta = signals.reduce((sum, signal) => sum + severityToDelta(signal.severity), 0);
  const recommendationUrgencyDelta = Math.round(triageSortDelta / 2);

  return {
    signals,
    triageSortDelta,
    recommendationUrgencyDelta,
  };
};

export const applyCompoundRiskToTriage = (
  triage: IPortfolioTriageProjection,
  result: ICompoundRiskEvaluationResult
): IPortfolioTriageProjection => ({
  ...triage,
  sortScore: triage.sortScore + result.triageSortDelta,
  triageReasons: [...triage.triageReasons, ...result.signals.map((signal) => signal.summary)],
});

export const applyCompoundRiskToRecommendation = (
  recommendation: ITopRecommendedAction | null,
  result: ICompoundRiskEvaluationResult
): ITopRecommendedAction | null => {
  if (!recommendation) {
    return null;
  }

  return {
    ...recommendation,
    urgency: recommendation.urgency + result.recommendationUrgencyDelta,
  };
};

export const HEALTH_PULSE_COMPOUND_RISK_SCOPE = 'health-pulse/compound-risk';
