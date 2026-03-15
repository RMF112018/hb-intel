# Wave 0 — Group 6: Admin, Support, and Observability

Plan package for the admin, support, and observability surfaces in Wave 0.

## Files in This Directory

| File | Purpose |
|---|---|
| `W0-G6-Admin-Support-and-Observability-Plan.md` | Master plan: purpose, locked decisions, repo inspection summary, admin surface map, dependency/boundary doctrine, shared feature no-go summary, task sequencing, acceptance gate |
| `W0-G6-T01-Admin-Failures-Inbox-and-Action-Boundaries.md` | Admin failures inbox refinement, state-gated action boundaries, retry count visibility, audience split |
| `W0-G6-T02-Audience-Permissions-and-Bounded-Retry-Rules.md` | Permission contract (business-ops vs technical admin), bounded retry rules, `ApprovalAuthorityTable` surface |
| `W0-G6-T03-Operational-Dashboards-Queue-Visibility-and-Bottleneck-Rules.md` | Queue overview by state, bottleneck indicators, `AdminAlertDashboard` and `ImplementationTruthDashboard` wiring, business-ops summary view |
| `W0-G6-T04-Alert-Routing-Severity-Model-and-Escalation-Targets.md` | Monitor implementation (`provisioningFailureMonitor`, `stuckWorkflowMonitor`), `AdminAlertsApi` persistence, routing to Teams/email, severity model |
| `W0-G6-T05-Embedded-Guidance-Runbooks-and-Support-Content-Ownership.md` | Contextual guidance placements, runbook link registry, support content ownership model |
| `W0-G6-T06-Observability-Telemetry-Alerting-and-Timer-Support.md` | Live probe implementation (`azureFunctionsProbe`, `sharePointProbe`), KQL query verification, Alert Rule 1, timer diagnostic documentation |
| `W0-G6-T07-Admin-Surface-Integration-Failure-Modes-and-Configuration-Rules.md` | Integration point rules, admin failure mode registry (AFM-01–AFM-09), configuration constants enforcement, scope boundary rules |
| `W0-G6-T08-Testing-and-Verification-for-Admin-Support-and-Observability.md` | Full verification checklist (Sections 1–11), pilot readiness definition (10 conditions), known limitations tracking |

## Governing Sources

- `CLAUDE.md` — authority hierarchy, working rules
- `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` — Wave 0 G6 sketch (G6.1–G6.4)
- `docs/architecture/blueprint/current-state-map.md` — present-state truth
- `docs/architecture/blueprint/package-relationship-map.md` — package dependency authority
- `docs/maintenance/provisioning-runbook.md` — operational procedures
- `docs/maintenance/provisioning-observability-runbook.md` — KQL queries and alert rules

## Key Packages

`@hbc/features-admin` · `@hbc/provisioning` · `@hbc/auth` · `@hbc/ui-kit` · `@hbc/complexity`

## Task Sequence

T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08

T01 and T02 may run in parallel. T03 depends on both. T04 is the critical path for real alert data.

## Critical No-Go Gates

All 6 alert monitors and `AdminAlertsApi` are stubs at the start of G6. T04 must implement at minimum `provisioningFailureMonitor` and `stuckWorkflowMonitor`. All probes are stubs. T06 must implement at minimum `azureFunctionsProbe` and `sharePointProbe`.
