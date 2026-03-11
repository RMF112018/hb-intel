# SF17-T02 - TypeScript Contracts: Admin Intelligence

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-17-Module-Feature-Admin-Intelligence.md`
**Decisions Applied:** D-02 through D-07, D-10
**Estimated Effort:** 0.65 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF17-T02 contract task; sub-plan of `SF17-Admin-Intelligence.md`.

---

## Objective

Lock all public contracts for alerts, probes, approval authority, hook returns, and testing fixtures.

---

## Types to Define

```ts
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AlertCategory =
  | 'provisioning-failure'
  | 'permission-anomaly'
  | 'stuck-workflow'
  | 'overdue-provisioning-task'
  | 'upcoming-expiration'
  | 'stale-record';

export interface IAdminAlert {
  alertId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  affectedEntityType: 'record' | 'user' | 'site' | 'job' | 'system';
  affectedEntityId: string;
  occurredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface IAdminAlertBadge {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalCount: number;
}

export type ProbeHealthStatus = 'healthy' | 'degraded' | 'error' | 'unknown';

export interface IInfrastructureProbeResult {
  probeId: string;
  probeKey:
    | 'sharepoint-infrastructure'
    | 'azure-functions'
    | 'azure-search'
    | 'notification-system'
    | 'module-record-health';
  status: ProbeHealthStatus;
  summary: string;
  observedAt: string;
  metrics: Record<string, number | string | boolean>;
  anomalies: string[];
}

export interface IProbeSnapshot {
  snapshotId: string;
  capturedAt: string;
  results: IInfrastructureProbeResult[];
}

export type ApprovalContext =
  | 'bd-scorecard-director-review'
  | 'living-strategic-intelligence-contribution'
  | 'provisioning-task-completion'
  | 'handoff-package-acknowledgment';

export interface IApprovalAuthorityRule {
  ruleId: string;
  approvalContext: ApprovalContext;
  approverUserIds: string[];
  approverGroupIds: string[];
  approvalMode: 'any' | 'all';
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export interface IApprovalEligibilityResult {
  approvalContext: ApprovalContext;
  userId: string;
  eligible: boolean;
  matchedBy: 'direct-user' | 'group-membership' | 'none';
}
```

---

## Hook Return Contracts

- `useAdminAlerts` returns active alerts, filtered subsets, badge rollup, acknowledge action, refresh action, loading/error state.
- `useInfrastructureProbes` returns latest snapshot, per-probe status map, refresh action, last-run metadata, loading/error state.
- `useApprovalAuthority` returns rules, rule-by-context accessors, upsert/delete/test-eligibility mutations, loading/error state.

---

## Constants to Lock

- `ADMIN_ALERTS_POLL_MS = 30_000`
- `PROBE_SCHEDULER_DEFAULT_MS = 900_000` (15 minutes)
- `PROBE_MAX_RETRY = 3`
- `APPROVAL_RULE_LIST_TITLE = 'HBC_ApprovalAuthorityRules'`
- `ADMIN_ALERT_LIST_TITLE = 'HBC_AdminAlerts'`
- `INFRA_PROBE_LIST_TITLE = 'HBC_InfrastructureProbeSnapshots'`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-admin check-types
pnpm --filter @hbc/features-admin test -- contracts
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF17-T02 completed: 2026-03-11
- New type files: AlertSeverity, AlertCategory, IAdminAlertBadge, ProbeHealthStatus, IInfrastructureProbeResult, IProbeSnapshot, ApprovalContext, IApprovalEligibilityResult, UseAdminAlertsResult, UseInfrastructureProbesResult, UseApprovalAuthorityResult
- Replaced T01 stubs: IAdminAlert (full contract with alertId/category/severity/timestamps/cta), IApprovalAuthorityRule (ruleId/approvalContext/approverIds/approvalMode), IInfrastructureProbe (re-exports IInfrastructureProbeResult)
- Constants barrel: src/constants/index.ts (6 constants locked)
- Hook return types: all three hooks now typed with T02 contracts (placeholder implementations retained for T04)
- Testing fixtures: updated to match new contracts; added createMockProbeResult factory; mockAdminIntelligenceStates uses snapshots model
- Barrel exports: src/types/index.ts and src/index.ts expanded with all new types + constants
- Verification: check-types ✓, build ✓, test ✓ (passWithNoTests)
Next: SF17-T03 (Alert Monitors and Probe Engine)
-->
