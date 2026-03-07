# Phase 6 Development Plan – Provisioning Modernization

**Version:** 2.0 (supersedes v1.0 — fully re-derived from the structured interview conducted 2026-03-07; all decisions locked and documented below)
**Purpose:** This document is the master plan for Phase 6: the first business-value delivery of HB Intel. It defines the complete provisioning modernization feature — from the Estimating Coordinator's Project Setup Request through the Controller's approval trigger, the 7-step SharePoint saga, real-time progress visibility across seven apps, and the overnight Step 5 fallback. It consolidates every architectural decision made during the structured interview and serves as the authoritative index for all 16 individual task files.
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.
**Implementation Objective:** Deliver a production-ready SharePoint site provisioning system where an Estimating Coordinator submits a Project Setup Request, a Controller approves and triggers provisioning, and all relevant stakeholders see real-time or start/finish progress across seven HB Intel apps — with full security, observability, testing, and rollback coverage.

---

## Refined Blueprint Section for Phase 6

**Phase 6: Provisioning Modernization (MVP Critical — First Business-Value Delivery)**
Modernize the entire SharePoint site provisioning workflow. Replace all mock service implementations with production-grade PnPjs/Graph code. Implement the full request lifecycle (Estimating → Accounting → Saga → Notifications). Deliver real-time progress visibility governed by role and submitter identity. Harden the existing class-based `SagaOrchestrator` with idempotency, correlation IDs, exponential backoff, and dual-store persistence. Integrate SignalR per-project groups, Managed Identity security, Application Insights observability, a three-layer testing strategy, and GitHub Actions CI/CD.

### Locked Architectural Outcome

Phase 6 produces a fully operational provisioning system that:

- Accepts Project Setup Requests from Estimating Coordinators (with team member selection).
- Routes requests through a 7-state lifecycle managed in the Accounting app inbox.
- Uses `projectId` (auto-generated, immutable) and `projectNumber` (Controller-entered, `##-###-##`) as the only project identifiers — `projectCode` is eliminated entirely.
- Executes a hardened, class-based `SagaOrchestrator` across 7 SharePoint provisioning steps with real PnPjs/Graph implementations, per-step idempotency guards, and compensation functions.
- Persists provisioning state to Azure Table Storage (primary) and SharePoint List (lifecycle events).
- Pushes real-time updates to per-project SignalR groups; shows full 7-step detail to Admins and the Request Submitter; shows start/finish notifications to all other role-eligible users.
- Secures all endpoints with Bearer token validation and uses Managed Identity for all SharePoint/Graph operations.
- Instruments every provisioning run with a correlation ID and custom Application Insights metrics.
- Is covered by Vitest unit tests, real SharePoint smoke tests, and Playwright E2E tests.

---

## All Locked Decisions from the Structured Interview (2026-03-07)

### Decision 1 — Saga Orchestration Engine
**Locked: Keep and harden the existing class-based `SagaOrchestrator`.** No migration to Azure Durable Functions. Add per-step idempotency guards, correlation IDs, exponential backoff retry (3 attempts with 2s/4s/8s delays), and duplicate-detection guards for all SharePoint operations. The manual Retry endpoint remains the recovery mechanism for terminal failures.

### Decision 2 — Provisioning State Persistence
**Locked: Dual store.** Azure Table Storage is the authoritative real-time record, written after every step completes or fails. A SharePoint List (`ProvisioningAuditLog`) receives summary records at three lifecycle events only: saga started, saga completed, saga failed. The SharePoint write is fire-and-forget and non-blocking — a failure to write the audit record does not fail the provisioning run.

### Decision 3 — API Security Model
**Locked: Bearer token validation in function code + Managed Identity for SharePoint/Graph.** All HTTP endpoints validate an Entra ID Bearer token (replacing `authLevel: 'anonymous'`). The validated token captures the caller's identity (`triggeredBy`, `submittedBy`) for audit. All actual SharePoint and Graph operations are performed by the Function App's system-assigned Managed Identity. The timer trigger uses Managed Identity only, with no user context.

### Decision 4 — SignalR Connection Strategy
**Locked: Per-project SignalR groups keyed by `projectId`.** Group name format: `provisioning-{projectId}`. The negotiate endpoint authenticates the user via Bearer token and adds their connection to the correct group. Step progress messages are sent to the group. Groups are closed and connections cleaned up when the saga reaches a terminal state (Completed or Failed). Admin users are added to an additional `provisioning-admin` group that receives all project events.

### Decision 5 — Frontend Package Architecture
**Locked: `@hbc/provisioning` package owns headless logic only.** Exports: `provisioningApiClient` (all API call functions), `useProvisioningSignalR` hook, `useProvisioningStore` (Zustand slice), and all shared TypeScript types (`IProjectSetupRequest`, `IProvisioningStatus`, `IProvisioningProgressEvent`, `IProjectRecord`, request state enums). Visual UI components are built inside each consuming app, not in the package.

### Decision 6 — Accounting App UX
**Locked: Dedicated "Project Setup Requests" inbox page in the Accounting app.** The Controller's full workflow lives here. The inbox shows all requests with their current lifecycle state. The `projectNumber` field (validated as `##-###-##`) is only editable and required when the request is in the "Ready to Provision" state. The trigger action is labelled "Complete Project Setup."

### Decision 7 — Request Lifecycle States
**Locked: Seven states with out-of-band clarification.** States: `Submitted` → `UnderReview` → `NeedsСlarification` → `AwaitingExternalSetup` → `ReadyToProvision` → `Provisioning` → `Completed` | `Failed`. Clarification communication happens via email/Teams. State transitions trigger automated HB Intel notifications to the appropriate parties. The `projectNumber` field is only shown and required at `ReadyToProvision`.

### Decision 8 — Project Identifier Data Model
**Locked: `projectCode` eliminated everywhere.** Two identifiers only:
- `projectId`: UUID v4, auto-generated at record creation (BD stage or Estimating submission if no BD record exists), immutable, never displayed to users, used as the system key in Azure Table Storage, SignalR group names, and all backend references.
- `projectNumber`: 9-digit string matching regex `/^\d{2}-\d{3}-\d{2}$/` (format `##-###-##`), entered by the Controller at approval, used in SharePoint site URLs/titles, Sage Intacct, Procore, and all human-facing references.

### Decision 9 — Cross-App Provisioning Visibility
**Locked: Role-based detail across seven apps.** Provisioning progress is visible in: Accounting, Admin, Business Development, Estimating, Operational Excellence, Project Hub, and PWA.

Visibility rules:
- **Admin role** → Full 7-step real-time checklist for all projects (always, regardless of group).
- **Request Submitter** → Full 7-step real-time checklist for their submitted project only (identified by `submittedBy` matching current user).
- **All other roles** → Start and finish notifications only, gated to users who are members of that project's group.
- **Leadership** → No provisioning notifications of any kind.
- **Shared Services** (Accounting, Marketing, Safety, QC, Legal) → No provisioning notifications.

Notification copy (exact):
- Start: *"The SharePoint Project Site for {projectNumber} - {projectName} is being created! We will let you know the moment it is ready for use."*
- Finish: *"{projectNumber} - {projectName}'s SharePoint Site is up and running! Let's get to work!"*

### Decision 10 — Step 5 / Timer Bifurcation
**Locked: Attempt Step 5 immediately; fall back to 1:00 AM EST timer on failure or timeout.** Step 5 timeout threshold: 90 seconds. Retry count before deferral: 2 attempts. On deferral, the project enters `BaseSetupComplete_WebPartsPending` sub-state. The `timerFullSpec` trigger at 1:00 AM EST processes all deferred Step 5 jobs. A completion notification fires to the Request Submitter, Admin, and the project's group when the timer finishes Step 5.

### Decision 11 — Testing Strategy
**Locked: Three-layer strategy.**
- **Layer 1 (Vitest, every PR):** Unit tests for saga orchestrator, all 7 steps, idempotency guards, state machine transitions, notification logic, validation functions. Fully mocked. Must complete in under 30 seconds.
- **Layer 2 (Real SharePoint, nightly + pre-merge gate):** 5–8 smoke tests against a dedicated test site collection in a real SharePoint tenant. Proves PnPjs calls, MSAL/Managed Identity flow, and Azure Table writes actually work. Includes automatic site cleanup.
- **Layer 3 (Playwright E2E, pre-release):** Full user journey — Estimating Coordinator submits request → Controller approves → SignalR checklist updates → site confirmed. Runs against staging environment.

### Decision 12 — Observability
**Locked: Correlation IDs + Custom Metrics + Proactive Alerts.** Every provisioning run receives a `correlationId` (UUID v4) at trigger time that is logged in every Application Insights event, every Azure Table write, and every SignalR message for that run. Custom metrics: step duration histograms, provisioning success/failure rate by step, Step 5 deferral rate. Proactive alerts: stuck run (non-terminal state for > 30 minutes) and nightly Step 5 timer failure.

### Decision 13 — Permission Groups
**Locked: Six permission tiers.**

| Group / Role | SharePoint Site Access | Provisioning Notifications |
|---|---|---|
| Admin | Read-only all sites + can apply Admin write perms | Full 7-step checklist — all projects |
| Leadership | Read-only all sites | None |
| Shared Services (Accounting, Marketing, Safety, QC, Legal) | Read / limited write all sites | None |
| Operational Excellence | Full read/write all sites | Start + Finish |
| Pursuit Team | Full read/write designated site only | Start + Finish |
| Project Team | Full read/write designated site only | Start + Finish |

Group composition rules:
- Pursuit Team and Project Team are defined in the Estimating Project Setup Request.
- The BD user who created the original Project record is included in the group by default (if a BD record exists for that project).
- The OpEx Manager is always pre-selected in every Project Setup Request by default.
- Step 6 of the saga applies these permissions to the provisioned SharePoint site using the Managed Identity.

---

## Phase 6 File Map — Task Files

| Task File | Title | Key Deliverables |
|---|---|---|
| `PH6.1` | Foundation & Data Model Migration | `projectCode` removal, type definitions, ADRs, `@hbc/provisioning` package scaffold |
| `PH6.2` | Security & Managed Identity | App registration, Managed Identity, Bearer token middleware, `msal-obo-service.ts` |
| `PH6.3` | SagaOrchestrator Hardening | Correlation IDs, idempotency guards, exponential backoff, state logging |
| `PH6.4` | Steps 1–4 Real Implementations | PnPjs create site, document library, template files, data lists + compensation |
| `PH6.5` | Steps 5–7 Real Implementations | SPFx web parts, permissions (group-based), hub association + compensation |
| `PH6.6` | Dual Store Persistence | Real `table-storage-service.ts`, SharePoint audit list, schemas, write rules |
| `PH6.7` | SignalR Hub & Real-Time Push | Negotiate endpoint, group management, SPFx token, reconnection, cleanup |
| `PH6.8` | Request Lifecycle & State Engine | `IProjectSetupRequest`, 7-state machine, Projects list schema, notification triggers |
| `PH6.9` | `@hbc/provisioning` Package | API client, `useProvisioningSignalR`, Zustand slice, public exports |
| `PH6.10` | Estimating App — Request Form & Checklist | Project Setup Request form, team picker, full 7-step checklist component |
| `PH6.11` | Accounting App — Inbox & Trigger | Requests inbox page, lifecycle state UI, `projectNumber` validation, trigger |
| `PH6.12` | Cross-App Notifications & Admin Dashboard | Start/finish banner, role-based visibility, Admin failures dashboard |
| `PH6.13` | Timer Trigger & Step 5 Bifurcation | Timeout logic, deferral scheduling, overnight execution, completion notification |
| `PH6.14` | Observability & Application Insights | Correlation ID propagation, custom events, metrics, stuck-run + timer alerts |
| `PH6.15` | Testing — All Three Layers | Vitest unit tests, SharePoint smoke tests, Playwright E2E, GitHub Actions |
| `PH6.16` | CI/CD, Documentation & ADRs | GitHub Actions deployment, ADRs, how-to guides, reference docs, release sign-off |

---

## Recommended Implementation Sequence

Execute task files strictly in the following order. Each task file lists its own prerequisite checks.

```
PH6.1 → PH6.2 → PH6.3 → PH6.6 → PH6.4 → PH6.5 → PH6.7 → PH6.8 →
PH6.9 → PH6.10 → PH6.11 → PH6.12 → PH6.13 → PH6.14 → PH6.15 → PH6.16
```

Rationale: Foundation and security must precede all other work. The saga hardening (6.3) and persistence (6.6) must be in place before step implementations (6.4, 6.5). The backend must be complete before any frontend package (6.9) or app integration work (6.10–6.12) begins.

---

## Phase 6 Definition of Done

Phase 6 is complete when HB Intel has a production-ready provisioning system that:

- Processes Project Setup Requests from Estimating Coordinators with full team member selection.
- Routes requests through a 7-state lifecycle in the Accounting app inbox, requiring a valid `projectNumber` before triggering.
- Executes all 7 provisioning steps using real PnPjs/Graph code under Managed Identity, with per-step idempotency guards and compensation.
- Persists state to Azure Table Storage (every step) and a SharePoint audit list (lifecycle events).
- Delivers real-time progress to per-project SignalR groups; shows full checklist to Admins and Request Submitters; shows start/finish banners to role-eligible users across all seven apps.
- Secures all HTTP endpoints with Bearer token validation; no `authLevel: 'anonymous'` endpoints exist in production.
- Instruments every run with a correlation ID; fires proactive alerts for stuck runs and timer failures.
- Is covered by passing Vitest unit tests, real SharePoint smoke tests, and Playwright E2E tests.
- Is deployed via GitHub Actions to dev, staging, and production environments.
- Has complete documentation in the correct `docs/` Diátaxis folders and all required ADRs.

---

## Phase 6 Master Success Criteria Checklist

- [x] 6.0.1 `projectCode` identifier eliminated from all backend functions, frontend apps, and packages.
- [x] 6.0.2 `@hbc/provisioning` package scaffold created and published within the monorepo. (2026-03-07 update: PH6.9 package implementation completed with API client, store, SignalR hook, visibility helper, and tests.)
- [ ] 6.0.3 Azure AD app registration and Managed Identity configured; all endpoints secured. (PH6.2 code complete; Azure tenant ops pending)
- [x] 6.0.4 `SagaOrchestrator` hardened: correlation IDs, idempotency, exponential backoff.
- [x] 6.0.5 All 7 steps use real PnPjs/Graph implementations (no mock service in production path). (2026-03-07 update: Steps 1-7 completed via PH6.4 + PH6.5)
- [x] 6.0.6 Azure Table Storage service is real and production-ready. (2026-03-07 update: PH6.6 `RealTableStorageService` delivered and wired in production mode)
- [ ] 6.0.7 SharePoint audit list (`ProvisioningAuditLog`) created and written to at lifecycle events. (2026-03-07 update: schema + setup script delivered in PH6.6; tenant-side one-time execution pending)
- [x] 6.0.8 SignalR negotiate endpoint is real; per-project groups functioning. (2026-03-07 update: PH6.7 completed with real negotiate endpoint, per-project/admin group routing, management API push service, and terminal cleanup.)
- [x] 6.0.9 Project Setup Request data model and 7-state machine implemented.
- [x] 6.0.10 Estimating app Project Setup Request form live with team member picker.
- [ ] 6.0.11 Accounting app Project Setup Requests inbox live with full lifecycle state management.
- [x] 6.0.12 Start/finish notification banner live in all seven apps with role-based visibility.
- [x] 6.0.13 Full 7-step checklist visible to Admin (all projects) and Request Submitter (own project).
- [x] 6.0.14 Admin failures dashboard live and showing failed/stalled runs.
- [ ] 6.0.15 Step 5 timeout/deferral logic functioning; timer trigger completing deferred jobs overnight.
- [ ] 6.0.16 Correlation IDs propagated through all events; custom App Insights metrics recording.
- [ ] 6.0.17 Stuck-run alert and timer failure alert configured and tested.
- [ ] 6.0.18 All Layer 1 Vitest unit tests passing in CI.
- [ ] 6.0.19 All Layer 2 SharePoint smoke tests passing in CI (nightly + pre-merge).
- [ ] 6.0.20 All Layer 3 Playwright E2E tests passing against staging.
- [ ] 6.0.21 GitHub Actions deployment pipeline functional for dev, staging, and production.
- [x] 6.0.22 All required ADRs created in `docs/architecture/adr/`.
- [ ] 6.0.23 Diátaxis documentation complete in correct `docs/` folders.
- [ ] 6.0.24 `pnpm turbo run build` passes with zero errors across the full monorepo.
- [ ] 6.0.25 Release sign-off checklist completed and signed by product owner.

---

## Release Gating

Phase 6 is blocked from production release until all of the following gates pass:

1. **Build gate:** `pnpm turbo run build` exits 0 across all packages and apps.
2. **Lint gate:** `pnpm turbo run lint` exits 0 with zero errors.
3. **Type gate:** `pnpm turbo run check-types` exits 0.
4. **Unit test gate:** All Layer 1 Vitest tests pass; minimum 80% coverage on `backend/functions/src/` and `packages/provisioning/src/`.
5. **Smoke test gate:** All Layer 2 SharePoint smoke tests pass against the test tenant.
6. **E2E gate:** All Layer 3 Playwright tests pass against the staging environment.
7. **Security gate:** No `authLevel: 'anonymous'` on any HTTP endpoint; Managed Identity confirmed active in Azure Portal.
8. **Observability gate:** Correlation IDs confirmed in Application Insights for at least one full test run; both alert rules confirmed active.
9. **Documentation gate:** All ADRs complete; how-to guides present in `docs/how-to/`; reference docs present in `docs/reference/`.
10. **Sign-off gate:** Product owner (Bobby Fetting) has reviewed staging and confirmed the full Estimating → Accounting → Provisioning → Notification flow.

---

## Deferred Scope Roadmap (Explicitly Out of Phase 6)

The following items are intentionally deferred and must not be built in Phase 6. They are documented here so future phases can extend the platform without re-architecting the foundation.

| Deferred Item | Rationale | Target Phase |
|---|---|---|
| Business Development app → Projects list lead creation (Step 1 of full workflow) | BD app integration depends on Phase 6 Projects list schema being stable first | Phase 7 |
| In-app comment thread for request clarification | Out-of-band clarification (email/Teams) is sufficient for Phase 6 volume | Phase 7 |
| Azure Monitor Workbook for provisioning health dashboard | Admin failures dashboard in HB Intel covers Phase 6 needs; workbook is supplementary | Phase 8 |
| Power Automate integration against SharePoint audit list | Requires audit list to be stable and populated with real data | Phase 7 |
| Sage Intacct / Procore API integration | External systems remain manual during Phase 6; API integration is a separate initiative | Phase 8+ |
| Pursuit Team → Project Team lifecycle transition (project stage change) | Requires Projects list stage management feature not in Phase 6 scope | Phase 7 |
| SharePoint site archival / deprovisioning | Site lifecycle management is a separate feature | Phase 8+ |
| Notification delivery via Microsoft Teams adaptive cards | Email/Teams message link is Phase 6; full Teams bot integration is later | Phase 7 |

---

## Progress Notes Template

```
<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 6 started: YYYY-MM-DD
Phase 6 completed: YYYY-MM-DD

Task completions:
- PH6.1 completed: 2026-03-07 — docs: docs/architecture/adr/ADR-0076-project-identifier-model.md, docs/architecture/adr/ADR-0077-provisioning-package-boundary.md
- PH6.2 completed: 2026-03-07 (code + docs); Azure tenant ops pending — docs: docs/architecture/adr/ADR-0078-security-managed-identity.md
- PH6.3 completed: 2026-03-07 — docs: docs/architecture/plans/PH6.3-SagaOrchestrator-Hardening.md
- PH6.4 completed: 2026-03-07 — real PnPjs implementations for Steps 1-4 delivered (`SharePointService`, idempotency checks, compensation hooks, list definitions).
- PH6.5 completed: 2026-03-07 — real implementations delivered for Step 5 (SPFx timeout/deferral), Step 6 (group permissions), and Step 7 (hub association + compensation).
- PH6.6 completed: 2026-03-07 — real Azure Table dual-store service implemented, production wiring enabled, and audit-list setup assets documented.
- PH6.7 completed: 2026-03-07 — docs: docs/architecture/adr/0063-signalr-per-project-groups.md, docs/how-to/developer/spfx-signalr-auth.md
- PH6.8 completed: 2026-03-07 — docs: docs/reference/provisioning/request-lifecycle.md, docs/how-to/administrator/create-projects-list.md
- PH6.9 completed: 2026-03-07 — docs: docs/architecture/plans/PH6.9-Provisioning-Package.md
- PH6.10 completed: 2026-03-07
- PH6.11 completed: YYYY-MM-DD
- PH6.12 completed: 2026-03-07
- PH6.13 completed: YYYY-MM-DD
- PH6.14 completed: YYYY-MM-DD — docs: docs/maintenance/provisioning-observability-runbook.md
- PH6.15 completed: YYYY-MM-DD
- PH6.16 completed: YYYY-MM-DD — docs: full documentation suite

Release: vX.X.X — YYYY-MM-DD
Sign-off: Bobby Fetting — YYYY-MM-DD
-->
```

<!-- PROGRESS: 2026-03-07 PH6.4 completed. Installed PnPjs dependencies in backend/functions; replaced SharePoint service with managed-identity-backed implementation for steps 1-4; updated saga steps and list schema; scoped build/lint/check-types/test commands passed for @hbc/functions. -->
<!-- PROGRESS: 2026-03-07 PH6.5 completed. Implemented real Step 5 timeout/deferral behavior, Step 6 OpEx-deduplicated permission assignment, and Step 7 hub idempotency/compensation with service-factory mock/real SharePoint selection and verification evidence recorded. -->
<!-- PROGRESS: 2026-03-07 PH6.6 completed. Implemented D-PH6-06 dual-store persistence (`RealTableStorageService`), switched production factory wiring to real table adapter, added `scripts/create-audit-list.ts` + admin how-to documentation, and captured verification evidence including external Azurite/tenant constraints. -->
<!-- PROGRESS: 2026-03-07 PH6.7 completed. Implemented D-PH6-07 SignalR production path: host extension config, authenticated negotiate endpoint with per-project/admin group assignment, real SignalR management API push/group lifecycle service, terminal-state saga group cleanup, developer how-to for SPFx AadHttpClient negotiate/reconnect pattern, ADR-0063, and scoped verification commands passed (`pnpm turbo run build/lint/check-types/test --filter=@hbc/functions`). -->
<!-- PROGRESS: 2026-03-07 PH6.8 completed. Implemented D-PH6-08 request lifecycle/state engine with `STATE_TRANSITIONS`, `isValidTransition`, `STATE_NOTIFICATION_TARGETS`, notification templates, new request APIs (`submitProjectSetupRequest`, `listProjectSetupRequests`, `advanceRequestState`) with Bearer + transition + `projectNumber` enforcement, Projects-list setup script/docs, backend README updates, and scoped verification commands passed (`pnpm turbo run build --filter=@hbc/functions`, `pnpm turbo run lint --filter=@hbc/functions --filter=@hbc/provisioning`, `pnpm turbo run check-types --filter=@hbc/functions --filter=@hbc/provisioning`, `pnpm turbo run test --filter=@hbc/provisioning`). -->
<!-- PROGRESS: 2026-03-07 PH6.9 completed. Implemented D-PH6-09 `@hbc/provisioning` package (`createProvisioningApiClient`, Zustand+immer store with `handleProgressEvent`, `useProvisioningSignalR`, visibility helper, notification templates, and complete public exports), added unit tests for visibility/store alongside state-machine tests, and verified `pnpm turbo run build/lint/check-types/test --filter=@hbc/provisioning` passed with zero errors. -->
<!-- PROGRESS: 2026-03-07 PH6.10 completed. Implemented D-PH6-10 estimating app Project Setup Request UX (`/project-setup`, `/project-setup/new`, `/project-setup/$requestId`) with submission form, OpEx-deduplicated members, detail page provisioning visibility + provisioning-only SignalR connection, and 7-step checklist rendering including DeferredToTimer and site links. Added minimal support updates (`HbcPeoplePicker` in ui-kit, estimating env typing + provisioning alias/deps) and verified `pnpm turbo run build --filter=@hbc/spfx-estimating --only`, `pnpm turbo run lint --filter=@hbc/spfx-estimating --only`, `pnpm --filter @hbc/spfx-estimating exec tsc --noEmit`, and `pnpm turbo run build-storybook --filter=@hbc/ui-kit --only`. -->
<!-- PROGRESS: 2026-03-07 PH6.12 completed. Implemented D-PH6-12 cross-app notification and admin failures foundations: added `ProvisioningNotificationBanner` to `@hbc/ui-kit` export surface, added `listFailedRuns` to `@hbc/provisioning` API client and backend `provisioning-failures` admin-only endpoint, implemented table-storage failed-run retrieval, replaced Admin failures page with `HbcDataTable` retry/escalate inbox with live row action state, and verified `pnpm turbo run build`, `pnpm turbo run lint`, `pnpm turbo run check-types`, and `pnpm turbo run build-storybook --filter=@hbc/ui-kit`. -->
