# SF21-T02 - TypeScript Contracts: Project Health Pulse

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`
**Decisions Applied:** D-02 through D-07, D-10
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF21-T02 contracts task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Lock all public contracts for health metrics, dimensions, pulse aggregate, and admin configuration settings.

---

## Types to Define

```ts
export type HealthStatus =
  | 'on-track'
  | 'watch'
  | 'at-risk'
  | 'critical'
  | 'data-pending';

export interface IHealthMetric {
  key: string;
  label: string;
  value: number | null;
  isStale: boolean;
  isManualEntry: boolean;
  lastUpdatedAt: string | null;
  weight: 'leading' | 'lagging';
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
}

export interface IProjectHealthWeights {
  field: number;
  time: number;
  cost: number;
  office: number;
}

export interface IProjectHealthPulse {
  projectId: string;
  computedAt: string;
  weights: IProjectHealthWeights;
  overallScore: number;
  overallStatus: HealthStatus;
  dimensions: {
    cost: IHealthDimension;
    time: IHealthDimension;
    field: IHealthDimension;
    office: IHealthDimension;
  };
  topRecommendedAction: string | null;
  topRecommendedActionLink: string | null;
}

export interface IHealthPulseAdminConfig {
  weights: IProjectHealthWeights;
  stalenessThresholdDays: number;
  metricStalenessOverrides: Record<string, number>;
}
```

---

## Hook Return Contracts

- `useProjectHealthPulse` returns pulse state, loading/error, refresh.
- `useHealthPulseAdminConfig` returns config state, save/reset, validation status.

---

## Constants to Lock

- `HEALTH_STALENESS_THRESHOLD_DAYS_DEFAULT = 14`
- `HEALTH_DIMENSION_LEADING_WEIGHT = 0.7`
- `HEALTH_DIMENSION_LAGGING_WEIGHT = 0.3`
- `HEALTH_PULSE_ADMIN_CONFIG_LIST_TITLE = 'HBC_HealthPulseAdminConfig'`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub check-types
pnpm --filter @hbc/features-project-hub test -- contracts
```
