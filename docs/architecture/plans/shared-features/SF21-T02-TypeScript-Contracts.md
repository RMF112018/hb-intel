# SF21-T02 - TypeScript Contracts: Project Health Pulse

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)  
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`  
**Decisions Applied:** D-02 through D-14  
**Estimated Effort:** 0.9 sprint-weeks  
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF21-T02 contracts task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Lock all public contracts for pulse computation, confidence, compound risk, explainability, recommendation prioritization, manual governance, triage projection, and telemetry.

---

## Types to Define

```ts
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
  weights: { field: number; time: number; cost: number; office: number; };
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
```

---

## Hook Return Contracts

- `useProjectHealthPulse` returns pulse state, loading/error/refresh, and confidence/governance derivation metadata.
- `useHealthPulseAdminConfig` returns config state, save/reset, validation status, and policy validation issues.

---

## Constants to Lock

- `HEALTH_STALENESS_THRESHOLD_DAYS_DEFAULT = 14`
- `HEALTH_DIMENSION_LEADING_WEIGHT = 0.7`
- `HEALTH_DIMENSION_LAGGING_WEIGHT = 0.3`
- `HEALTH_PULSE_ADMIN_CONFIG_LIST_TITLE = 'HBC_HealthPulseAdminConfig'`
- `HEALTH_PULSE_TRIAGE_BUCKETS` and `HEALTH_PULSE_CONFIDENCE_TIERS`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub check-types
pnpm --filter @hbc/features-project-hub test -- contracts
```
