# Admin SPFx IT Control Center — Phase 12 Summary Plan

## Purpose

Phase 12 exists to finish and productionize the **observability layer** for the Admin SPFx IT Control Center.

By the end of this phase, operators should have trustworthy visibility into:
- install and bootstrap behavior,
- provisioning runs and failures,
- SharePoint-control actions,
- Entra-control actions,
- backend health,
- probe status,
- alert state,
- error and audit evidence,
- and correlated recovery context.

This phase is not only about adding dashboards. It is about replacing today’s deferred or in-memory observability pieces with durable, queryable, operator-usable implementations that match the frontend/backend boundary defined by the end-state plan.

## Governing basis

### End-state-plan constraints that directly govern Phase 12
Phase 12 in the governing plan is defined as:

- **Purpose:** finish and productionize the observability layer
- **Major objectives:**
  - replace deferred/in-memory admin-intelligence elements with durable implementations
  - complete alerts, probes, error log, health views, unified admin observability
- **Expected deliverables:**
  - production-grade alerting/probe system
  - persistent observability data
  - full error/audit surfaces
- **Exit criteria:**
  - operators have trustworthy visibility across install, rollout, SharePoint control, Entra control, and failure states

### Repo-truth signals that shape Phase 12
Current repo truth already shows useful but incomplete foundations:

- `apps/admin` exists as a real SPFx admin app package with admin routing and current admin-facing pages.
- Current routing still sends `/error-log` and `/provisioning-failures` through `SystemSettingsPage`, which means the observability information architecture is still incomplete.
- `ProvisioningFailuresPage` already exists and includes retry / escalate behavior for failed provisioning runs.
- `ErrorLogPage` still exists as an explicit deferred / empty-state surface.
- `@hbc/features-admin` already exists as the reusable admin-intelligence layer for monitors, probes, hooks, APIs, and dashboard components.
- `@hbc/features-admin` README explicitly documents current limitations such as:
  - in-memory alert store
  - in-memory probe snapshot store
  - best-effort notification dispatch
  - deferred monitors / probes
  - deferred `ErrorLogPage`
- `backend/functions` already has real service-factory wiring, real-vs-mock adapter mode handling, provisioning persistence, telemetry, retry, compensation, and audit behavior in the provisioning saga.
- The backend already looks like the right home for durable observability execution and storage; the browser does not.

## Major objectives inside Phase 12

1. Establish the canonical Phase 12 observability baseline and persistence model.
2. Replace in-memory admin alert / probe state with durable backend-owned persistence.
3. Introduce production-ready contracts for:
   - alerts
   - probe snapshots
   - observability incidents
   - error events
   - operator acknowledgment / resolution
   - correlated timeline items
4. Build backend ingestion and query APIs for observability surfaces.
5. Harden probe execution and alert evaluation into a real runtime path.
6. Add correlation across provisioning and other current admin/backend actions.
7. Implement the real SPFx observability operator surfaces:
   - alerts
   - health
   - probe status
   - error log
   - correlated run / failure detail
8. Close documentation, testing, operational guidance, and release-readiness gaps.

## In-scope repo/doc/code areas

### Primary code areas
- `apps/admin/**`
- `packages/features/admin/**`
- `packages/models/**`
- `backend/functions/**`
- any existing admin/provisioning shared packages directly needed for observability adoption

### Primary documentation areas
- `docs/architecture/plans/MASTER/spfx/admin/**`
- `docs/architecture/blueprint/current-state-map.md` only if present-truth coverage becomes materially incomplete
- local package/app READMEs that materially describe admin observability behavior

## Expected Phase 12 deliverables

### Architecture and doctrine outputs
- Phase 12 observability gap map
- observability baseline
- storage / retention / access model
- adoption map for current admin domains
- validation and exit reconciliation report

### Shared-code outputs
- durable admin observability models and contracts
- backend persistence adapters
- query and action APIs
- correlation / event normalization helpers
- productionized monitor / probe execution path
- productionized notification / dispatch behavior where in scope

### Operator-surface outputs
- real error-log surface
- real alerts / health / probe views
- route and navigation corrections
- correlated detail and failure drilldown surfaces
- acknowledgment / resolution / refresh workflows

### Documentation / operational outputs
- README updates
- configuration guidance
- retention and query guidance
- operator usage notes
- residual-risk / next-phase notes

## Risks Phase 12 is addressing

- Operators relying on incomplete or misleading admin observability
- In-memory observability state disappearing across reloads or restarts
- Error / alert / probe data being fragmented across packages with no durable source
- Browser surfaces implying control without trustworthy evidence
- Provisioning and future admin domains lacking a unified incident trail
- Placeholder routes and deferred pages obscuring production readiness
- Notification and alert flows remaining best-effort and non-actionable
- Future production hardening proceeding without credible visibility foundations

## Why this phase matters before final production hardening

Phase 13 can only be credible if operators already have durable, trustworthy visibility. Without Phase 12:
- release readiness is hard to defend,
- support runbooks stay speculative,
- single-admin high-risk operation remains insufficiently observable,
- and future expansion rails are built on weak operational evidence.

Phase 12 turns observability from demo scaffolding into production-grade operating infrastructure.

## Recommended implementation sequence inside the phase

1. Audit current observability assets and create the gap map.
2. Lock the Phase 12 observability baseline and durable persistence model.
3. Introduce shared observability contracts and models.
4. Implement durable persistence adapters and storage plumbing.
5. Implement backend ingestion / query / action APIs.
6. Harden probe execution and alert evaluation.
7. Instrument current admin/control-plane domains with correlation and event emission.
8. Implement the SPFx unified observability surfaces and routing corrections.
9. Harden tests, docs, config guidance, and operator-facing runbook notes.
10. Reconcile, validate, and publish the Phase 12 exit report.

## Acceptance criteria for Phase 12 completion

Phase 12 is complete when all of the following are true:

- Alert and probe state is durable and no longer in-memory-only.
- Admin observability has a canonical backend-owned persistence and query model.
- `ErrorLogPage` is no longer a deferred empty shell.
- Operators can view alerts, health, errors, and probe state through real SPFx surfaces.
- Current admin/control-plane actions have correlated observability records where supported by repo reality.
- Documentation no longer claims placeholder behavior where real functionality now exists.
- Validation confirms the observability layer is trustworthy enough to support production hardening.

## Explicit non-goals

Do **not** let this phase drift into:
- broad new tenant-governance domains outside current scope,
- redesign of the entire admin information architecture beyond what observability requires,
- replacement of healthy backend foundations,
- or Phase 13 support/escalation program work except for minimal forward-compatible documentation.
