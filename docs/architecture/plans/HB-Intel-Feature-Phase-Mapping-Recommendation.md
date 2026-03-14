# HB-Intel Feature-Phase Mapping Recommendation

> **Doc Classification:** Superseded / Archived Reference — pre-Phase-6 feature placement recommendation; all Phase 6 content is now complete and all Phase 7 decisions are superseded by active PH7 domain master plans. Retained as historical reference only.
>
> **Status after consolidation:** SUPERSEDED (2026-03-14)
> **Superseded by:** Active PH7 domain master plans (`PH7-Estimating-Features.md`, `PH7-ProjectHub-Features-Plan.md`, `PH7-BD-Features.md`), MVP plans (`MVP/MVP-Project-Setup-Plan.md`), and `current-state-map.md` for present truth.
> **Progress notes preserved at:** `docs/architecture/blueprint/HB-Intel-Blueprint-Crosswalk.md` §9.1
> **Do NOT use this document for implementation decisions.** Phase 6 is complete; Phase 7 plans govern Phase 7 work.

**Document type:** Architecture recommendation
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Prepared:** 2026-03-07
**Prepared by:** HB Intel Implementation Agent
**Status:** FINAL — Awaiting product-owner confirmation before Phase 6 kickoff _(historical; Phase 6 is now complete)_

---

## Table of Contents

1. [Requirements Extraction Summary](#1-requirements-extraction-summary)
2. [Current Readiness Assessment](#2-current-readiness-assessment)
3. [Feature Phase Mapping — Quick Reference](#3-feature-phase-mapping--quick-reference)
4. [Detailed Per-Feature Recommendations](#4-detailed-per-feature-recommendations)
   - 4.1 [Estimating Project Setup Request Form](#41-estimating-project-setup-request-form)
   - 4.2 [Estimating Tracking Table](#42-estimating-tracking-table)
   - 4.3 [Accounting Project Setup Form (Controller Inbox)](#43-accounting-project-setup-form-controller-inbox)
   - 4.4 [Go/No-Go Scorecard](#44-gono-go-scorecard)
   - 4.5 [Cross-App Provisioning Notifications](#45-cross-app-provisioning-notifications)
   - 4.6 [Admin Provisioning Failures Dashboard](#46-admin-provisioning-failures-dashboard)
   - 4.7 [My Work Feed (Dynamic Aggregation)](#47-my-work-feed-dynamic-aggregation)
   - 4.8 [BD App → Projects List Integration](#48-bd-app--projects-list-integration)
   - 4.9 [In-App Clarification Thread](#49-in-app-clarification-thread)
   - 4.10 [Sage Intacct / Procore API Integration](#410-sage-intacct--procore-api-integration)
5. [Updated Phase Roadmap](#5-updated-phase-roadmap)
6. [Recommended Adjustments to Existing Plans](#6-recommended-adjustments-to-existing-plans)
7. [Risk Register](#7-risk-register)

---

## 1. Requirements Extraction Summary

### 1.1 Phase Sequence (Forward-Looking — Post Phase 5C)

All phases from the original foundation plan (Phases 0–9) and all Phase 4/5/5C sub-phases are **fully complete** as of 2026-03-07. The live development sequence going forward is:

| Phase | Plan File | Status | Summary |
|---|---|---|---|
| **Phase 5C** | `PH5C-Auth-Shell-Plan.md` | ✅ COMPLETE (2026-03-07) | Auth/shell hardening, DevToolbar, PersonaRegistry, 100% audit coverage |
| **Phase 6** | `PH6-Provisioning-Plan.md` | 🟡 NOT STARTED — ready to begin | Provisioning modernization; 16 sequential sub-tasks (PH6.1–PH6.16) |
| **Phase 7** | `PH7-Breakout-Webparts-Plan.md` | ⬜ PENDING Phase 6 | 11 independent SPFx webpart rewrites; sequenced by business value |
| **Phase 8+** | Referenced in PH6 Deferred Scope | ⬜ PENDING Phase 7 | Sage Intacct/Procore APIs, Azure Monitor Workbooks, site archival |
| **PH9b UX Enhancements** | `PH9b-UX-Enhancement-Plan.md` | ⬜ PENDING Phase 7 | My Work Feed, Coaching System, Draft Persistence, UX Instrumentation |

### 1.2 Foundation Packages Completed and Available

All packages built during Phases 0–5C are production-ready and available to all feature implementations:

- `@hbc/models` — All domain interfaces including `IEstimatingTracker`, `IScorecard`, `IProjectSetupRequest`, all project/provisioning types
- `@hbc/data-access` — Adapter interfaces; SharePoint, proxy, and mock adapters operational
- `@hbc/query-hooks` — Query and mutation hooks for all 11 domains including `estimating` and `scorecard`
- `@hbc/auth` — Full auth lifecycle, `useAuthSession`, `useHasPermission`, `AuthGuard`, DevAuthBypassAdapter, PersonaRegistry (11 personas)
- `@hbc/shell` — `ShellCore`, `WorkspacePageShell`, dual-mode auth wiring, DevToolbar
- `@hbc/ui-kit` — Complete HB Intel Design System including `HbcDataTable`, `HbcTextField`, `HbcSelect`, `HbcPeoplePicker`, `HbcStatusBadge`, `HbcFormSection`, `ToolLandingLayout`, `DetailLayout`, `CreateUpdateLayout`, module-specific UI patterns for Scorecards and all 8 construction modules
- `@hbc/provisioning` — **Not yet built** (PH6.9 deliverable)

### 1.3 Key Locked Decisions Governing Feature Placement

The following locked decisions from the plan files directly constrain feature placement:

| Decision | Source | Constraint |
|---|---|---|
| **PH6 sequence**: PH6.1→6.2→6.3→6.6→6.4→6.5→6.7→6.8→6.9→6.10→6.11 | PH6-Provisioning-Plan.md §Recommended Implementation Sequence | The Estimating form (6.10) and Accounting inbox (6.11) cannot start until 6.9 (`@hbc/provisioning` package) is complete |
| **`projectCode` elimination** | PH6 Decision 8 | All features referencing project identifiers must use `projectId` (UUID) + `projectNumber` (##-###-##) exclusively — no `projectCode` anywhere |
| **Frontend package architecture** | PH6 Decision 5 | `@hbc/provisioning` owns headless logic only; visual UI lives in each consuming app |
| **Sequential SPFx migration** | PH7 Decision: Sequential Prioritization by Business Value (Option A) | Phase 7 proceeds Accounting → Estimating → Project Hub → Leadership → BD; no webpart can skip ahead |
| **MVP rollout priority** | CLAUDE.md §2 | Accounting → Estimating → Project Hub → Leadership → Business Development |
| **Go/No-Go and Estimating Tracker excluded from Phase 6** | PH6-Provisioning-Plan.md (Phase 6 scope is provisioning only) | These features are not in Phase 6 scope |
| **BD → Projects list deferred** | PH6-Provisioning-Plan.md §Deferred Scope, target Phase 7 | BD integration waits for Projects list schema to stabilize in Phase 6 |

---

## 2. Current Readiness Assessment

**Overall readiness: HIGH for Phase 6 immediate start.**

Phase 5C was fully signed off by all 7 roles (Implementation Lead, Code Reviewer, Test Lead, Documentation Lead, Architecture Lead, Security Lead, QA Lead, Product Owner) on 2026-03-07. All 12 verification gates passed at 100% audit coverage. The system is in the optimal state to begin Phase 6.

The foundation for all user-facing business features is complete:

- ✅ Auth/session management (production + dev bypass)
- ✅ Data models for all domains
- ✅ Query/mutation hooks for all domains
- ✅ UI kit with module-specific patterns (including Scorecard, Estimating layouts)
- ✅ Shell framework (full + simplified for SPFx)
- ✅ Dev harness for iterative development

**Phase 6 is the gate.** The four primary user-facing features in question cannot all be delivered simultaneously. Two of them (Estimating Project Setup Request, Accounting Project Setup Form) are explicitly scoped to Phase 6. Two others (Estimating Tracking Table, Go/No-Go Scorecard) are scheduled for Phase 7, though they technically have all infrastructure prerequisites met.

---

## 3. Feature Phase Mapping — Quick Reference

| Feature | Recommended Phase | Phase Sub-Task | Prerequisite Gate |
|---|---|---|---|
| **Estimating Project Setup Request form** | **Phase 6** | PH6.10 | PH6.1–PH6.9 complete |
| **Accounting Project Setup form (Controller inbox)** | **Phase 6** | PH6.11 | PH6.1–PH6.10 complete |
| **Cross-App Provisioning Notifications** | **Phase 6** | PH6.12 | PH6.1–PH6.11 complete |
| **Admin Provisioning Failures Dashboard** | **Phase 6** | PH6.12 | PH6.1–PH6.11 complete |
| **Estimating Tracking Table** | **Phase 7** (Estimating webpart) | PH7.2 — Estimating breakout | Phase 6 complete; Estimating SPFx webpart |
| **Go/No-Go Scorecard** | **Phase 7** (Estimating or BD webpart) | PH7.2 — Estimating/BD breakout | Phase 6 complete; Estimating SPFx webpart |
| **My Work Feed** | **Post-Phase 7 / PH9b** | PH9b §A | Phase 7 features must exist as data sources |
| **BD → Projects list integration** | **Phase 7** | PH7 Deferred from Phase 6 | Phase 6 Projects list schema stable |
| **In-App Clarification Thread** | **Phase 7** | PH7 extension | Phase 6 complete; request lifecycle stable |
| **Sage Intacct / Procore API** | **Phase 8+** | — | Phase 7 complete |

---

## 4. Detailed Per-Feature Recommendations

### 4.1 Estimating Project Setup Request Form

**Recommended Starting Phase:** Phase 6, Task 6.10 (PH6.10)

**Rationale:**

This feature is explicitly planned, scoped, and fully specified in `PH6.10-Estimating-App.md` (Version 2.0). The plan provides complete production-ready code for all three routes (`/project-setup`, `/project-setup/new`, `/project-setup/:requestId`), the `NewRequestPage` submission form, the `RequestDetailPage` real-time checklist, the `ProvisioningChecklist` component, and the OpEx Manager auto-inclusion logic. Per the locked Phase 6 implementation sequence (PH6-Provisioning-Plan.md §Recommended Implementation Sequence), PH6.10 is the tenth task and must execute after PH6.1–PH6.9.

**Dependencies / Prerequisites:**

- PH6.1 — `projectCode` elimination and data model types (`IProjectSetupRequest`)
- PH6.2 — Bearer token validation middleware and Managed Identity configured
- PH6.3 — SagaOrchestrator hardened with correlation IDs
- PH6.6 — Azure Table Storage and SharePoint audit list operational
- PH6.7 — SignalR negotiate endpoint live; per-project groups functional
- PH6.8 — 7-state request lifecycle state machine and API endpoints implemented
- PH6.9 — `@hbc/provisioning` package built and exported (`createProvisioningApiClient`, `useProvisioningSignalR`, `useProvisioningStore`, `getProvisioningVisibility`)
- Azure environment vars: `VITE_FUNCTION_APP_URL`, `VITE_AZURE_TENANT_ID`, `VITE_OPEX_MANAGER_UPN`

**Feature Scope (per PH6.10):**

The submission form collects: project name, location, project type (GC/CM/Design-Build/Other), project stage (Pursuit/Active), and team members (via `HbcPeoplePicker` against Graph API). The OpEx Manager UPN is pre-populated and deduplicated. After submission, the user is routed to a detail page showing their request status and — when provisioning begins — a full 7-step real-time checklist via SignalR. This visibility is governed by `getProvisioningVisibility` from `@hbc/provisioning` (full checklist only for Admins and the Request Submitter; no checklist for other roles).

**Risks:**

- SignalR connectivity in SPFx iframe context (Step 7 of saga must work cross-frame) — mitigated in PH6.7 by SPFx token handling
- `VITE_OPEX_MANAGER_UPN` must be set in environment before PH6.10 can be tested end-to-end
- The `@microsoft/signalr` package must be installed in `apps/estimating` before this task starts

---

### 4.2 Estimating Tracking Table

**Recommended Starting Phase:** Phase 7 — Estimating SPFx Webpart Breakout (PH7.2, second priority after Accounting)

**Earliest Possible Phase Without Architecture Violations:** Phase 6 (as a `apps/estimating` PWA extension, post-PH6.10)

**Rationale:**

The Estimating Tracking Table (`IEstimatingTracker` — a list of active bids/proposals with bid number, status, due date, and project associations) is a core Estimating module feature unrelated to provisioning. Its technical prerequisites are entirely satisfied:

- `IEstimatingTracker` interface is defined and exported from `@hbc/models` (Phase 2.1 complete)
- `useEstimatingTrackers`, `useCreateEstimatingTracker`, `useUpdateEstimatingTracker` hooks exist in `@hbc/query-hooks/estimating` (Phase 3 complete)
- `ToolLandingLayout`, `HbcDataTable`, `HbcStatusBadge` UI components are available in `@hbc/ui-kit` (Phase 4 complete)
- Auth/RBAC (Phase 5C complete)

However, `PH7-Breakout-Webparts-Plan.md §7.2` explicitly assigns the Estimating Tracking Table to the Phase 7 Estimating webpart rewrite: *"Repeat sequentially for Estimating (reference: `Estimating.tsx`, `EstimatingTracker.tsx`), rewriting with query hooks/ui-kit."* The Phase 7 plan mandates a **full rewrite** using current patterns (TanStack Query, Zustand, ui-kit) rather than wrapping legacy code — making Phase 7 the locked destination.

**Why NOT in Phase 6:**

Phase 6 scope is precisely bounded to provisioning modernization. PH6-Provisioning-Plan.md defines exactly what is in scope and makes no mention of the Estimating Tracking Table. Adding it to Phase 6 would expand scope, potentially delaying the Phase 6 Definition of Done (25-item success checklist) and slipping the Accounting → Estimating provisioning flow sign-off.

**Exception (Recommended Optional Action):**

If the product owner determines that the Estimating Tracking Table is needed before Phase 7 begins, it can be added to `apps/estimating` immediately after PH6.10 is complete (within Phase 6 as PH6.10-extension or a new PH6.10a task). This does NOT require any Phase 6 backend work — the tracking table reads existing SharePoint data via the `@hbc/data-access` SharePoint adapter. The team should formally scope this addition and add a PH6.10a sub-task rather than treating it as informal scope creep.

**Dependencies:**

- Phase 5C (complete) — auth/shell
- `@hbc/models` `IEstimatingTracker` (complete)
- `@hbc/query-hooks/estimating` hooks (complete)
- `@hbc/ui-kit` `ToolLandingLayout` + `HbcDataTable` (complete)
- For SPFx delivery (Phase 7): Phase 6 complete; SPFx template scaffold from PH7.1

**Risks:**

- If deferred to Phase 7, the Estimating team lacks a tracking table view during the entire Phase 6 period — evaluate with product owner whether this is acceptable
- Legacy `EstimatingTracker.tsx` in the old monolithic SPFx webpart uses different data access patterns and must be fully rewritten (not wrapped) per PH7 locked decision Option C

---

### 4.3 Accounting Project Setup Form (Controller Inbox)

**Recommended Starting Phase:** Phase 6, Task 6.11 (PH6.11)

**Rationale:**

This feature is fully specified in `PH6.11-Accounting-App.md` (Version 2.0) and is the Controller-side complement to the Estimating form in PH6.10. It is the **second of the two core Phase 6 user-facing features**. The plan provides complete production-ready code for two routes (`/project-setup-requests`, `/project-setup-requests/:requestId`), the `ProjectSetupRequestsPage` inbox, the `RequestReviewPage` with all 7 state transition actions, the `projectNumber` field with `##-###-##` regex validation, and the `ProvisioningStatusBadge` live component.

The Controller's workflow covers: viewing all requests with state badges, advancing states (Submitted → UnderReview → NeedsClarification / AwaitingExternalSetup → ReadyToProvision → Provisioning), entering and validating the `projectNumber`, triggering provisioning via "Complete Project Setup," and watching a compact live status badge during the saga.

Per Phase 6 locked Decision 6: *"Dedicated 'Project Setup Requests' inbox page in the Accounting app. The Controller's full workflow lives here. The `projectNumber` field (validated as `##-###-##`) is only editable and required when the request is in the 'Ready to Provision' state. The trigger action is labelled 'Complete Project Setup.'"*

**Dependencies / Prerequisites:**

- All PH6.1–PH6.10 complete (PH6.11 prerequisite is the longest chain in Phase 6)
- `@hbc/provisioning` package fully exported (PH6.9)
- `@microsoft/signalr` installed in `apps/accounting`
- `PROJECT_NUMBER_REGEX = /^\d{2}-\d{3}-\d{2}$/` validated against real Controller workflow

**Feature Scope (per PH6.11):**

The inbox lists all requests in a sortable/filterable table. The detail page exposes all seven lifecycle state transitions, a clarification note textarea (required for `NeedsClarification` transition), the `projectNumber` field (shown from `AwaitingExternalSetup` onward, required for `ReadyToProvision`), and a compact `ProvisioningStatusBadge` driven by Zustand store updates from SignalR. The "Complete Project Setup" button is disabled until `projectNumber` passes regex validation.

**Risks:**

- The seven-state lifecycle must match exactly between backend (PH6.8) and frontend (PH6.11) — any state name mismatch will cause 400 errors
- The `projectNumber` regex must match identically between `PH6.8.3` (API validation) and `PH6.11.3` (frontend validation)
- `ProvisioningStatusBadge` polls from Zustand store — requires SignalR to be connected, which requires PH6.7 to be complete and tested

---

### 4.4 Go/No-Go Scorecard

**Recommended Starting Phase:** Phase 7 — Estimating SPFx Webpart Breakout (second priority in PH7.2 sequence, under Estimating)

**Earliest Possible Phase Without Architecture Violations:** Phase 6 (as a `apps/estimating` or `apps/pwa` PWA extension — all technical prerequisites are met)

**Rationale:**

The Go/No-Go Scorecard has unusually strong infrastructure support already in place:

- `IScorecard` and related types are in `@hbc/models` (Phase 2.1 complete)
- `useScorecard`, `useUpdateScorecard`, `useDeleteScorecard` hooks exist in `@hbc/query-hooks/scorecard` (Phase 3 complete)
- Full UI pattern specification in `PH4.13-UI-Design-Plan.md §13.1` is complete:
  - Landing view (`ToolLandingLayout`) with KPI cards, responsibility heat map (`ballInCourt`), sortable table
  - Detail view (`DetailLayout`) with Scorecard / Approval Chain / Change History tabs, horizontal score bar (red/amber/green thresholds), vertical approval chain stepper with avatar
  - Create/Edit view (`CreateUpdateLayout`) with Focus Mode auto-activate, dynamic weighted criteria rows, `HbcRichTextEditor` with voice input, attachments
- `HbcApprovalStepper` component exists in ui-kit (Phase 4 complete; ADR-0026 confirms it)
- Auth/RBAC guards complete (Phase 5C)
- E2E Playwright spec `e2e/scorecard.spec.ts` was implemented in Phase 4B (referenced in PH4B-UI-Design-Plan.md and ADR-0046)
- PH9b §A identifies Go/No-Go Scorecards as a My Work Feed data source, requiring the scorecard pages and routes to exist first

Per `PH4.4-UI-Design-Plan.md`, Go/No-Go Scorecards belong to the **Preconstruction** role group alongside Estimating and Bid Management. In the MVP rollout (Accounting → Estimating → Project Hub → Leadership → BD), Estimating is second priority — making the Estimating webpart the natural home for Go/No-Go Scorecards in Phase 7.

**Why NOT in Phase 6:**

Phase 6 scope is bounded entirely to provisioning modernization. No scorecard work appears in any PH6 sub-task. Implementing scorecards during Phase 6 would be out-of-sequence work that expands scope and risks delaying the Phase 6 Definition of Done.

**Exception (Recommended Optional Action):**

As with the Estimating Tracking Table, if the product owner needs Go/No-Go Scorecard functionality before Phase 7, it can be added to `apps/estimating` (PWA) immediately after Phase 6 is complete, or even in parallel with late Phase 6 tasks (PH6.13–PH6.16), since scorecard implementation has zero dependency on provisioning. This would require a new PH6.x sub-task or a standalone PWA-only plan document.

**Dependencies:**

- Phase 5C (complete) — auth/shell, permission guards
- `@hbc/models` `IScorecard` types (complete)
- `@hbc/query-hooks/scorecard` hooks (complete)
- `@hbc/ui-kit` `ToolLandingLayout`, `DetailLayout`, `CreateUpdateLayout`, `HbcApprovalStepper` (complete)
- `HbcRichTextEditor` voice input must be confirmed available in ui-kit
- For SPFx delivery (Phase 7): Phase 6 complete; SPFx template from PH7.1

**Risks:**

- Scorecard approval chain (multi-role signature workflow) requires careful RBAC rule definition — the `ballInCourt` responsibility heat map needs correct role-to-approver mapping configured
- Phase 7's full-rewrite requirement (Option C) means no legacy code can be wrapped — the scorecard page must be a clean TanStack Query + Zustand + ui-kit implementation
- The `aggregateScorecardItems` function in PH9b depends on scorecard records having a discoverable `currentReviewerRole` or similar field — this must be confirmed in the data model before Phase 7

---

### 4.5 Cross-App Provisioning Notifications

**Recommended Starting Phase:** Phase 6, Task 6.12 (PH6.12)

**Rationale:**

`PH6.12-CrossApp-Notifications.md` delivers the start/finish notification banner visible across all 7 apps (Accounting, Admin, Business Development, Estimating, Operational Excellence, Project Hub, PWA) and the Admin failures dashboard. Per Phase 6 locked Decision 9, visibility is role-gated:

- Admin → Full 7-step checklist (all projects)
- Request Submitter → Full 7-step checklist (own project only)
- All other role-eligible users → Start and finish banners only
- Leadership and Shared Services → No provisioning notifications

**Dependencies:** PH6.1–PH6.11 complete; SignalR groups functional (PH6.7); cross-app provisioning package (PH6.9)

---

### 4.6 Admin Provisioning Failures Dashboard

**Recommended Starting Phase:** Phase 6, Task 6.12 (PH6.12)

**Rationale:**

Delivered in the same task as cross-app notifications. Provides Admins with visibility into failed/stalled provisioning runs, including correlation ID lookup and retry triggers. This satisfies Phase 6 success criterion 6.0.14: *"Admin failures dashboard live and showing failed/stalled runs."*

**Dependencies:** PH6.1–PH6.12 complete

---

### 4.7 My Work Feed (Dynamic Aggregation)

**Recommended Starting Phase:** Post-Phase 7 (PH9b §A) — or incrementally with each Phase 7 webpart that provides a data source

**Rationale:**

The My Work Feed (`useMyWork` hook + `HbcMyWorkFeed` component, fully specified in `PH9b-UX-Enhancement-Plan.md §A`) aggregates work items from 7 data sources:

1. Go/No-Go Scorecards (requires scorecard pages — Phase 7)
2. Turnover Meeting Agendas (requires Turnover module — Phase 7)
3. Project Management Plans (Phase 7)
4. Monthly Project Reviews (Phase 7)
5. Project Startup Checklists (Phase 7)
6. Estimating Kickoffs (requires Estimating module — Phase 7)
7. Post-Bid Autopsies (requires BD/Estimating module — Phase 7)

The feed cannot be meaningfully populated until at least 2–3 of these data sources are live in Phase 7. The `aggregateScorecardItems` function in PH9b already has its signature defined and is ready to implement once scorecard records exist at runtime.

**Recommended approach:** Implement the My Work Feed infrastructure (the `useMyWork` hook, data model, `IMyWorkItem` type, and the empty-state UI) early in Phase 7, then wire in each aggregator as its respective module becomes available. The PWA home screen integration should be the last wiring step.

**Dependencies:** Phase 7 must be substantially complete (at minimum: Estimating and Accounting webparts)

---

### 4.8 BD App → Projects List Integration

**Recommended Starting Phase:** Phase 7 — Business Development webpart (fifth priority in Phase 7 sequence)

**Rationale:**

Explicitly deferred from Phase 6 per `PH6-Provisioning-Plan.md §Deferred Scope`: *"BD app integration depends on Phase 6 Projects list schema being stable first."* Phase 6 creates and stabilizes the Projects SharePoint list schema (PH6.1, PH6.8.1). Once that schema is locked and deployed, the BD app can be extended in Phase 7 to create project lead records that flow into the Estimating → provisioning pipeline.

---

### 4.9 In-App Clarification Thread

**Recommended Starting Phase:** Phase 7 — as an extension to the Estimating and Accounting webparts

**Rationale:**

Explicitly deferred from Phase 6 per `PH6-Provisioning-Plan.md §Deferred Scope`: *"Out-of-band clarification (email/Teams) is sufficient for Phase 6 volume."* Phase 6 implements the `NeedsClarification` state with an out-of-band note, which satisfies MVP needs. An in-app comment thread (threaded `HbcRichTextEditor` messages tied to `requestId`) can be added in Phase 7 once the request lifecycle is stable and volume warrants it.

---

### 4.10 Sage Intacct / Procore API Integration

**Recommended Starting Phase:** Phase 8+

**Rationale:**

Explicitly deferred to Phase 8+ per `PH6-Provisioning-Plan.md §Deferred Scope`: *"External systems remain manual during Phase 6; API integration is a separate initiative."* The `AwaitingExternalSetup` state in Phase 6 represents manual Sage/Procore work performed off-platform. A future Phase 8 plan document should define the Sage Intacct and Procore API clients, authentication model, and sync strategy.

---

## 5. Updated Phase Roadmap

The following roadmap incorporates the four requested features and all related items into the locked forward-sequence.

```
COMPLETED (2026-03-07)
══════════════════════
Phase 0–5C  All foundation, packages, auth/shell, UI kit, dev harness


PHASE 6 — Provisioning Modernization
═════════════════════════════════════
PH6.1   Foundation & Data Model Migration       → projectCode removed; IProjectSetupRequest typed
PH6.2   Security & Managed Identity             → Bearer token middleware; Managed Identity live
PH6.3   SagaOrchestrator Hardening             → Correlation IDs; idempotency; backoff
PH6.6   Dual Store Persistence                  → Azure Table Storage; SharePoint audit list
PH6.4   Steps 1–4 Real Implementations         → PnPjs site/library/templates/lists
PH6.5   Steps 5–7 Real Implementations         → SPFx web parts; permissions; hub association
PH6.7   SignalR Hub & Real-Time Push            → Negotiate endpoint; per-project groups
PH6.8   Request Lifecycle & State Engine        → 7-state machine; API endpoints
PH6.9   @hbc/provisioning Package               → API client; hooks; Zustand slice

      ┌─────────────────────────────────────────────┐
      │  FEATURE 1: Estimating Project Setup Form   │   ← PH6.10
      │  (Estimating Coordinator submits request)   │
      └─────────────────────────────────────────────┘

      ┌─────────────────────────────────────────────┐
      │  FEATURE 3: Accounting Project Setup Form   │   ← PH6.11
      │  (Controller inbox, state mgmt, trigger)    │
      └─────────────────────────────────────────────┘

      ┌─────────────────────────────────────────────┐
      │  FEATURE 5: Cross-App Notifications         │   ← PH6.12
      │  FEATURE 6: Admin Failures Dashboard        │
      └─────────────────────────────────────────────┘

PH6.13  Timer Trigger & Step 5 Bifurcation
PH6.14  Observability & Application Insights
PH6.15  Testing — All Three Layers
PH6.16  CI/CD, Documentation & ADRs
═════════════════════════════════════════════════════
Phase 6 Definition of Done sign-off (Bobby Fetting)


PHASE 7 — Breakout SPFx Webparts (sequential by business value)
════════════════════════════════════════════════════════════════
PH7.1   Tools & Template Setup                  → spfx-template; generate-webpart script
PH7.2   Accounting webpart                      → Full rewrite; provisioning integration
PH7.2   Estimating webpart
          ┌────────────────────────────────────────────┐
          │  FEATURE 2: Estimating Tracking Table      │   ← Phase 7, Estimating webpart
          │  (IEstimatingTracker CRUD + table view)    │
          └────────────────────────────────────────────┘
          ┌────────────────────────────────────────────┐
          │  FEATURE 4: Go/No-Go Scorecard             │   ← Phase 7, Estimating webpart
          │  (Landing / Detail / Create-Edit views)    │
          └────────────────────────────────────────────┘
PH7.2   Project Hub webpart
PH7.2   Leadership webpart
PH7.2   Business Development webpart            → BD → Projects list integration (FEATURE 8)
PH7.2   Admin, OpEx, Safety, QC, HR, Risk webparts
PH7.3   Testing & Performance (95% coverage)
PH7.4   CI/CD & Deployment
PH7.5   Documentation


PHASE 9b — UX Enhancements (post-Phase 7)
══════════════════════════════════════════
PH9b §A  My Work Feed                           ← FEATURE 7 (requires Phase 7 data sources)
PH9b §B  Role-Aware Progressive Coaching System
PH9b §C  Auto-Save Draft Persistence
PH9b §D  UX Instrumentation


PHASE 8+ — External Integrations (future)
══════════════════════════════════════════
          Sage Intacct / Procore API Integration  ← FEATURE 10
          Azure Monitor Workbooks
          SharePoint site archival
          Teams bot integration
```

---

## 6. Recommended Adjustments to Existing Plans

### 6.1 Add PH6.10a — Estimating Tracking Table (Optional Fast-Track)

**If the product owner wants the Estimating Tracking Table before Phase 7:** Create a new plan file `PH6.10a-Estimating-Tracking-Table.md` to be executed after PH6.10 completes. This task is self-contained (no backend work required) and can be built using:

- `useEstimatingTrackers()` from `@hbc/query-hooks/estimating`
- `ToolLandingLayout` + `HbcDataTable` from `@hbc/ui-kit`
- `PermissionGate` with `estimating:read` from `@hbc/auth`
- TanStack Router route `/estimating` in `apps/estimating`

Estimated effort: 1–2 days. This does not affect the Phase 6 Definition of Done checklist.

### 6.2 Add PH6.10b — Go/No-Go Scorecard PWA (Optional Fast-Track)

**If the product owner wants Go/No-Go Scorecards before Phase 7:** Create `PH6.10b-GoNoGo-Scorecard-PWA.md` to deliver the three Scorecard views (landing, detail, create/edit) in `apps/estimating` or a new `apps/preconstruction` PWA app. All UI patterns are specified in `PH4.13-UI-Design-Plan.md §13.1`. Estimated effort: 3–4 days. Can run in parallel with PH6.12–PH6.16.

### 6.3 Confirm `currentReviewerRole` Field in `IScorecard`

Before Phase 7 Estimating webpart begins, confirm that `IScorecard` includes a `currentReviewerRole` or `ballInCourt` field that `aggregateScorecardItems` (PH9b §A) can use to filter My Work items. If missing, this field should be added in a Phase 3 models update before Phase 7 begins.

### 6.4 Add `IEstimatingKickoff` to My Work Feed Aggregators

PH9b §A lists "Estimating Kickoffs" as a My Work Feed data source with a filter of "authenticated user is the meeting coordinator and kickoff is within 7 days." The `IEstimatingKickoff` model and `kickoffDate`/`attendees` fields are defined in `@hbc/models`. An `estimatingKickoffAggregator.ts` should be added to `packages/query-hooks/src/mywork/aggregators/` in Phase 9b alongside the existing `scorecardAggregator.ts`.

---

## 7. Risk Register

| Risk | Severity | Phase | Mitigation |
|---|---|---|---|
| Phase 6 scope creep from adding Tracking Table or Scorecard in parallel | Medium | Phase 6 | Gate with explicit product owner approval; create separate sub-task files |
| `projectCode` field exists in legacy data/components — not fully removed before PH6.10 | High | PH6.1 | PH6.1 must complete a full codebase scan and elimination before any frontend work begins |
| `@hbc/provisioning` package (PH6.9) has compilation errors blocking PH6.10 and PH6.11 | High | PH6.9–6.10 | PH6.9 has its own build verification step; PH6.10 prerequisites check must be explicit |
| SignalR in SPFx iframe fails (cross-domain negotiation issues) | Medium | PH6.10, PH6.11 | PH6.7 must include SPFx iframe test coverage; use `@microsoft/signalr` with explicit negotiate URL |
| Phase 7 Estimating Tracking Table is blocked while Phase 6 runs (user-facing gap) | Low-Medium | Phase 6 | Mitigate with PH6.10a fast-track option if product owner deems it necessary |
| Go/No-Go Scorecard `ballInCourt` data is insufficient for My Work Feed aggregation | Medium | Phase 7/9b | Confirm model fields before Phase 7 start; add fields in pre-Phase-7 models update if needed |
| `##-###-##` `projectNumber` regex mismatch between PH6.8 backend and PH6.11 frontend | Low | PH6.11 | Both must use identical `^/d{2}-\d{3}-\d{2}$/` pattern; add a shared regex export to `@hbc/provisioning` |
| Phase 7 full-rewrite requirement (Option C) introduces regression risk for legacy users | Medium | Phase 7 | Feature flags for rollout; rollback via git branches; side-by-side legacy diff per PH7 plan |

---

*End of HB-Intel Feature-Phase Mapping Recommendation*

<!-- ADR reference: This document supports the Phase 6 kickoff decision.
     Recommend creating ADR-0074-phase-6-feature-kickoff-sequence.md upon product-owner confirmation.
-->
