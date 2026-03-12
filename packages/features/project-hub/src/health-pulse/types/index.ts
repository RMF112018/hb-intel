/**
 * SF21-T02 public contracts for Project Health Pulse.
 * Contract-only surface: no runtime scoring or persistence logic is implemented here.
 */

export type HealthStatus = 'on-track' | 'watch' | 'at-risk' | 'critical' | 'data-pending';

export type PulseConfidenceTier = 'high' | 'moderate' | 'low' | 'unreliable';

export interface IManualOverrideMetadata {
  reason: string;
  enteredBy: string;
  enteredAt: string;
  requiresApproval?: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface IHealthMetric {
  key: string;
  label: string;
  value: number | null;
  isStale: boolean;
  isManualEntry: boolean;
  lastUpdatedAt: string | null;
  weight: 'leading' | 'lagging';
  manualOverride?: IManualOverrideMetadata | null;
}

export interface IPulseConfidence {
  tier: PulseConfidenceTier;
  score: number;
  reasons: string[];
}

export interface ICompoundRiskSignal {
  code: 'time-field-deterioration' | 'cost-time-correlation' | 'office-field-amplification' | 'custom';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  affectedDimensions: Array<'cost' | 'time' | 'field' | 'office'>;
  summary: string;
}

export interface IHealthExplainability {
  whyThisStatus: string[];
  whatChanged: string[];
  topContributors: string[];
  whatMattersMost: string;
}

export interface ITopRecommendedAction {
  actionText: string;
  actionLink: string | null;
  reasonCode: string;
  owner: string | null;
  urgency: number;
  impact: number;
  confidenceWeight: number;
}

export interface IHealthDimension {
  score: number;
  status: HealthStatus;
  label: 'Cost' | 'Time' | 'Field' | 'Office';
  leadingScore: number;
  laggingScore: number;
  metrics: IHealthMetric[];
  keyMetric: string;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  hasExcludedMetrics: boolean;
  confidence: IPulseConfidence;
}

export interface IPortfolioTriageProjection {
  bucket: 'attention-now' | 'trending-down' | 'data-quality-risk' | 'recovering';
  sortScore: number;
  triageReasons: string[];
}

export interface IProjectHealthPulse {
  projectId: string;
  computedAt: string;
  overallScore: number;
  overallStatus: HealthStatus;
  overallConfidence: IPulseConfidence;
  dimensions: {
    cost: IHealthDimension;
    time: IHealthDimension;
    field: IHealthDimension;
    office: IHealthDimension;
  };
  compoundRisks: ICompoundRiskSignal[];
  topRecommendedAction: ITopRecommendedAction | null;
  explainability: IHealthExplainability;
  triage: IPortfolioTriageProjection;
}

export interface IManualEntryGovernanceConfig {
  approvalRequiredMetricKeys: string[];
  maxManualInfluencePercent: number;
  maxOverrideAgeDays: number;
}

export interface IOfficeSuppressionPolicy {
  lowImpactSuppressionEnabled: boolean;
  duplicateClusterWindowHours: number;
  severityWeights: Record<'minor' | 'major' | 'critical', number>;
}

export interface IHealthPulseAdminConfig {
  weights: { field: number; time: number; cost: number; office: number };
  stalenessThresholdDays: number;
  metricStalenessOverrides: Record<string, number>;
  manualEntryGovernance: IManualEntryGovernanceConfig;
  officeHealthSuppression: IOfficeSuppressionPolicy;
  portfolioTriageDefaults: {
    defaultBucket: IPortfolioTriageProjection['bucket'];
    defaultSort: 'deterioration-velocity' | 'compound-risk-severity' | 'unresolved-action-backlog';
  };
}

export interface IProjectHealthTelemetry {
  interventionLeadTime: number | null;
  falseAlarmRate: number | null;
  preLagDetectionRate: number | null;
  actionAdoptionRate: number | null;
  portfolioReviewCycleTime: number | null;
  suppressionImpactRate: number | null;
}
