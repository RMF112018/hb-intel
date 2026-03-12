import type { IHealthMetric, IOfficeSuppressionPolicy } from '../../types/index.js';

/**
 * Deterministic Office suppression model used by SF21-T03 computors.
 */
export interface IOfficeSuppressionSummary {
  originalCount: number;
  retainedCount: number;
  suppressedCount: number;
  suppressedMetricKeys: string[];
  severityWeightedOverdueScore: number;
}

const parseSeverityWeight = (
  metric: IHealthMetric,
  severityWeights: IOfficeSuppressionPolicy['severityWeights']
): number => {
  const lowerKey = metric.key.toLowerCase();

  if (lowerKey.includes('critical')) return severityWeights.critical;
  if (lowerKey.includes('major')) return severityWeights.major;
  return severityWeights.minor;
};

const clusterKey = (metric: IHealthMetric): string => {
  const lowerKey = metric.key.toLowerCase();
  const tokens = lowerKey.split(/[-_:]/g);
  return tokens.slice(0, 2).join(':');
};

export const applyOfficeSuppressionPolicy = (
  metrics: IHealthMetric[],
  policy: IOfficeSuppressionPolicy
): { retainedMetrics: IHealthMetric[]; summary: IOfficeSuppressionSummary } => {
  const suppressedMetricKeys: string[] = [];

  const lowImpactFiltered = metrics.filter((metric) => {
    if (!policy.lowImpactSuppressionEnabled) {
      return true;
    }

    const lowerKey = metric.key.toLowerCase();
    const isLowImpact = lowerKey.includes('low-impact') || lowerKey.includes('minor-reminder');
    if (isLowImpact) {
      suppressedMetricKeys.push(metric.key);
      return false;
    }

    return true;
  });

  const retainedByCluster = new Map<string, IHealthMetric>();

  for (const metric of lowImpactFiltered) {
    const key = clusterKey(metric);
    const existing = retainedByCluster.get(key);
    if (!existing) {
      retainedByCluster.set(key, metric);
      continue;
    }

    const existingUpdatedAt = existing.lastUpdatedAt ? Date.parse(existing.lastUpdatedAt) : 0;
    const candidateUpdatedAt = metric.lastUpdatedAt ? Date.parse(metric.lastUpdatedAt) : 0;

    if (candidateUpdatedAt > existingUpdatedAt) {
      suppressedMetricKeys.push(existing.key);
      retainedByCluster.set(key, metric);
    } else {
      suppressedMetricKeys.push(metric.key);
    }
  }

  const retainedMetrics = Array.from(retainedByCluster.values());

  const severityWeightedOverdueScore = retainedMetrics.reduce((total, metric) => {
    const lowerLabel = metric.label.toLowerCase();
    const isOverdueSignal = lowerLabel.includes('overdue') || metric.key.toLowerCase().includes('overdue');
    if (!isOverdueSignal || metric.value === null) {
      return total;
    }

    return total + metric.value * parseSeverityWeight(metric, policy.severityWeights);
  }, 0);

  return {
    retainedMetrics,
    summary: {
      originalCount: metrics.length,
      retainedCount: retainedMetrics.length,
      suppressedCount: suppressedMetricKeys.length,
      suppressedMetricKeys,
      severityWeightedOverdueScore,
    },
  };
};

export const HEALTH_PULSE_OFFICE_SUPPRESSION_SCOPE = 'health-pulse/office-suppression';
