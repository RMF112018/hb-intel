# SF17 - Admin Intelligence Layer (`@hbc/features-admin`)

**Plan Version:** 1.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-17-Module-Feature-Admin-Intelligence.md`
**Priority Tier:** 1 - Foundation (admin launch-critical)
**Estimated Effort:** 5-6 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0106-admin-intelligence-layer.md`

> **Doc Classification:** Canonical Normative Plan - SF17 implementation master plan for Admin Intelligence; governs SF17-T01 through SF17-T09.

---

## Purpose

Admin Intelligence provides three foundation capabilities for trustworthy operations:

1. proactive alerting before user-facing failures,
2. implementation-truth infrastructure visibility, and
3. admin-configurable approval authority policy used by approval workflows.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Package alignment | Implement as `@hbc/features-admin` capability set; no new standalone package |
| D-02 | Alert scope | Six monitored categories: provisioning failure, permission anomaly, stuck workflow, overdue provisioning task, upcoming expiration, stale draft |
| D-03 | Alert semantics | Acknowledge marks seen only; alerts resolve only when source condition clears |
| D-04 | Probe model | Implementation Truth Layer uses scheduled probes with default 15-minute cadence |
| D-05 | Approval authority storage | Approval rules stored as admin-managed policy records with user/group approvers and `any|all` mode |
| D-06 | Approval integration | Approval-capable packages resolve approvers via `ApprovalAuthorityApi.getApprovers(context)` |
| D-07 | Complexity behavior | Essential: badge only; Standard: alert dashboard; Expert: full truth-layer diagnostics + approval simulation |
| D-08 | Notification policy | Critical/high alert conditions route immediate admin notifications; medium/low join digest flow |
| D-09 | SPFx constraints | Use app-shell-safe components only; no unsupported modal primitives |
| D-10 | Testing sub-path | `@hbc/features-admin/testing` exports canonical admin-intelligence fixtures |

---

## Package Directory Structure

```text
packages/features/admin/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- types/
|  |  |- IAdminAlert.ts
|  |  |- IInfrastructureProbe.ts
|  |  |- IApprovalAuthorityRule.ts
|  |  |- index.ts
|  |- monitors/
|  |  |- monitorRegistry.ts
|  |  |- provisioningFailureMonitor.ts
|  |  |- permissionAnomalyMonitor.ts
|  |  |- stuckWorkflowMonitor.ts
|  |  |- overdueProvisioningMonitor.ts
|  |  |- upcomingExpirationMonitor.ts
|  |  |- staleRecordMonitor.ts
|  |  |- index.ts
|  |- probes/
|  |  |- probeScheduler.ts
|  |  |- sharePointProbe.ts
|  |  |- azureFunctionsProbe.ts
|  |  |- searchProbe.ts
|  |  |- notificationProbe.ts
|  |  |- moduleRecordHealthProbe.ts
|  |  |- index.ts
|  |- api/
|  |  |- ApprovalAuthorityApi.ts
|  |  |- AdminAlertsApi.ts
|  |  |- InfrastructureProbeApi.ts
|  |  |- index.ts
|  |- hooks/
|  |  |- useAdminAlerts.ts
|  |  |- useInfrastructureProbes.ts
|  |  |- useApprovalAuthority.ts
|  |  |- index.ts
|  |- components/
|  |  |- AdminAlertBadge.tsx
|  |  |- AdminAlertDashboard.tsx
|  |  |- ImplementationTruthDashboard.tsx
|  |  |- ApprovalAuthorityTable.tsx
|  |  |- ApprovalRuleEditor.tsx
|  |  |- index.ts
|  |- testing/
|  |  |- index.ts
|  |  |- createMockAdminAlert.ts
|  |  |- createMockProbeSnapshot.ts
|  |  |- createMockApprovalAuthorityRule.ts
|  |  |- mockAdminIntelligenceStates.ts
|  |- __tests__/
|     |- setup.ts
|     |- monitors.test.ts
|     |- probeScheduler.test.ts
|     |- approvalAuthority.test.ts
|     |- hooks.test.ts
|     |- components.test.tsx
```

---

## Definition of Done

- [ ] six alert monitor categories modeled with configurable thresholds and SLA windows
- [ ] badge and dashboard contracts documented for all severity flows
- [ ] truth-layer probe scheduler and probe result contracts documented
- [ ] approval authority rule model and API contracts documented
- [ ] integration contracts for acknowledgment and notification-intelligence documented
- [ ] testing fixture sub-path documented
- [ ] SF17-T09 includes SF11-grade documentation/deployment requirements
- [ ] `current-state-map.md` updated with SF17 + ADR-0106 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF17-T01-Package-Scaffold.md` | package scaffold + README requirement — **COMPLETE 2026-03-11** |
| `SF17-T02-TypeScript-Contracts.md` | admin intelligence contracts/constants — **COMPLETE 2026-03-11** |
| `SF17-T03-Alert-Monitors-and-Probe-Engine.md` | monitor registry + probe scheduler + persistence contracts — **COMPLETE 2026-03-11** |
| `SF17-T04-Hooks-and-State-Model.md` | useAdminAlerts/useInfrastructureProbes/useApprovalAuthority — **COMPLETE 2026-03-11** |
| `SF17-T05-AdminAlertBadge-and-Dashboard.md` | alert UX components — **COMPLETE 2026-03-11** |
| `SF17-T06-ImplementationTruth-and-ApprovalAuthority.md` | truth layer and approval authority UX — **COMPLETE 2026-03-11** |
| `SF17-T07-Reference-Integrations.md` | bic/notification/acknowledgment/versioned-record/complexity integrations — **COMPLETE 2026-03-11** |
| `SF17-T08-Testing-Strategy.md` | test fixtures and coverage matrix — **COMPLETE 2026-03-12** |
| `SF17-T09-Testing-and-Deployment.md` | checklist, ADR/docs/index/state-map updates |
