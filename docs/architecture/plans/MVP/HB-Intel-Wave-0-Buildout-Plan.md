# HB Intel — Wave 0 Build-Out Plan

> **Doc Classification:** Canonical Normative Plan — Wave 0 execution planning document. Defines the Wave 0 (Foundation / Project Setup) delivery scope, current-state assessment, gap analysis, recommended implementation order, and readiness gates. This document is **proposed** and must be reviewed by the product owner and architecture owner before execution begins.
>
> **Not present-state truth.** For current implementation status, see `docs/architecture/blueprint/current-state-map.md`.
>
> **Read with:** `CLAUDE.md` → `current-state-map.md` → `HB-Intel-Dev-Roadmap.md` → this document → detailed MVP branch plans.
> **Detailed task plans (Wave 0 Project Setup stream):** `docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-Plan.md` and task plans T01–T08 in the same folder. These plans govern implementation-level task sequencing, acceptance criteria, and guarded commit configurations for the Project Setup stream.

**Version:** 1.1 (Proposed — Validated 2026-03-14)
**Date:** 2026-03-14
**Status:** Proposed — awaiting product owner and architecture owner review
**Basis:** HB-Intel-Dev-Roadmap.md §8, current-state-map.md (Tier 1), ADRs 0083–0113, codebase inspection, external research (construction-tech + Azure/SharePoint platform best practices)
**Next ADR Available:** ADR-0114
**Primary Audience:** Product owner, architecture/code agents, implementation planning, leadership reviewers
**v1.1 Validation Note (2026-03-14):** Validated against live codebase and MVP Project Setup plan set (T01–T08). Corrections applied: (1) Phase 7 gate ADR number: v1.1 incorrectly set to ADR-0090; corrected to ADR-0091 per P0-A2 D-004 errata (2026-03-16); (2) backend auth model corrected to Managed Identity (DefaultAzureCredential), not MSAL OBO; (3) W0-M1, W0-M2, W0-M4 reclassified from Missing to Partial/Miswired based on confirmed codebase evidence; (4) admin router bug fixed (ProvisioningFailuresPage now reachable); (5) CLAUDE.md version references updated to v1.6; (6) MVP Project Setup plan set reference added. See `docs/architecture/plans/MVP/wave-0-validation-report.md` for full validation details.

---

## Wave 0 Executive Conclusion

Wave 0 is the **Foundation / Project Setup stream** defined in `HB-Intel-Dev-Roadmap.md §8`. It is both a platform-foundation readiness wave and the first visible user-facing proof of value in the HB Intel platform.

**What Wave 0 is:**
SharePoint site provisioning, site management and maintenance rules, project setup workflow, setup governance and controller gate, standardized project structure, provisioning visibility and recovery, and setup-related permissions and handoff rules. It is the trust-establishing, standardization-proving, failure-recoverable first act of the HB Intel platform.

**What the repo is ready for:**
The backend provisioning saga is architecturally mature — 7-step orchestration with idempotency, compensation, exponential retry, SignalR real-time broadcast, AppInsights telemetry, and admin-gated failure endpoints. The frontend provisioning package (headless) is complete: type-safe API client, Zustand store, SignalR hook, state machine, visibility rules, and notification templates. Shared platform primitives — `@hbc/step-wizard`, `@hbc/bic-next-move`, `@hbc/notification-intelligence`, `@hbc/session-state`, `@hbc/workflow-handoff` — exist and are ready to be wired into Wave 0 workflows. The core platform (auth, shell, UI kit, models, data-access, query-hooks) is sufficiently mature.

**What must still be done:**
Three categories of work remain:

1. **Precondition:** Phase 7 stabilization must close (ADR-0091 must be created, all P1 gate tests must pass) before Wave 0 feature expansion is permitted under governance rules.

2. **Backend hardening:** The provisioning saga's SharePoint service integration must be validated for production (Managed Identity / DefaultAzureCredential token acquisition, Retry-After throttle handling, Steps 3/4 compensation, timer integration for Step 5 deferral).

3. **User-facing surfaces (the biggest remaining gap):** No project setup request form, no provisioning status tracker, no controller gate review UI, no admin failures inbox, no PWA setup visibility, and no post-setup project workspace surface currently exist. These are the surfaces that make Wave 0 tangible to users.

The repo has strong platform bones. Wave 0 can succeed without major architectural rework, but it cannot succeed without building its user-facing surfaces and hardening the backend integration layer. The recommended implementation order to manage risk and enforce correct boundaries is laid out in this document.

---

## Governing Constraints

The following constraints govern all Wave 0 work. Any action that would contradict these constraints requires a superseding ADR before proceeding.

**CLAUDE.md v1.6 — Zero-Deviation Rule:**
No deviations from the blueprint, foundation plan, current-state map, or active ADRs without an explicit superseding ADR. This applies to all Wave 0 work.

**CLAUDE.md v1.6 — Phase 7 Gate:**
Feature-expansion phases cannot begin until PH7.12 acceptance criteria are fully satisfied and ADR-0091 exist on disk. Wave 0 user-facing surfaces are feature expansion. Phase 7 must close first.

**CLAUDE.md v1.6 — UI Ownership Rule:**
All reusable visual UI components must be owned by `@hbc/ui-kit`. No package outside `@hbc/ui-kit` may introduce new standalone presentational components. Wave 0 UX components must either consume existing `@hbc/ui-kit` primitives or contribute new reusable components to `@hbc/ui-kit` first.

**CLAUDE.md v1.6 — Document Classification Mandatory:**
Every new document created during Wave 0 must declare one of the six permitted document classes (Tier 1 banner or matrix row in `current-state-map.md §2`). Unclassified documents are a Zero-Deviation Rule violation.

**CLAUDE.md v1.6 — Guarded Commit Workflow Mandatory:**
All commits must use `pnpm guarded:commit --config <task-config>`. Direct `git commit` is prohibited. All quality gates (build, lint, typecheck, P1 tests) must pass before any commit is allowed.

**ADR-0083 — Release-Readiness Taxonomy:**
All Wave 0 delivery must be tracked across the three release-readiness levels: Code-Ready, Environment-Ready, Operations-Ready. A capability is not Production-Ready until all three gates are satisfied.

**ADR-0084 — Source-of-Truth Hierarchy:**
`current-state-map.md` governs present-state truth. Any structural change made during Wave 0 must be reflected in `current-state-map.md §2` before the work is considered complete.

**ADR-0085 — Test Governance:**
P1 packages (`@hbc/auth`, `@hbc/shell`, `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity`) must maintain `branches: 95` coverage throughout Wave 0. Any Wave 0 change touching P1 packages must maintain or improve coverage.

**ADR-0090 — SignalR Per-Project Groups:**
Provisioning real-time updates must use the per-project group subscription model. No other SignalR topology is permitted.

**Roadmap §3.1 — Dual-Stream Rollout:**
Wave 0 must produce both SPFx-hosted and PWA-hosted experiences. SPFx goes first for rollout; PWA must maintain balanced progress — it cannot be left as a complete stub.

**Roadmap §3.3 — App-Level MVP Completion:**
Wave 0 is not complete until its core workflow is trusted in both SPFx and PWA contexts. SPFx-only delivery does not satisfy Wave 0 exit criteria.

**Roadmap §3.4 — Value-Proof Before PWA Hosting Cost:**
The PWA must prove real unified value at limited scope before leadership is asked to approve hosted-PWA infrastructure cost. Wave 0 provides that proof.

**Roadmap §4.1 — Priority #1:**
SharePoint site provisioning, management, and maintenance is the top roadmap priority. It is not a background concern; it is the primary Wave 0 deliverable.

**UI Kit Entry Points (§6.1):**
SPFx contexts must import from `@hbc/ui-kit/app-shell` (not full `@hbc/ui-kit`) where the constrained context is relevant to maintain bundle budgets.

---

## Wave 0 Definition

Wave 0 is defined in `HB-Intel-Dev-Roadmap.md §8` as the **Foundation / Project Setup stream**, with both a platform role and a product role.

### Role in the Roadmap

Wave 0 is simultaneously:

- A **platform-foundation stream** — because all later app waves depend on site structure, project identity, standardized permissions, and setup governance already being in place and trustworthy.
- The **first visible MVP proof** — because it is the clearest early demonstration that HB Intel brings real, trustworthy value to the company before larger infrastructure investments are approved.

### Concrete Capability Buckets

Translating the roadmap scope (`docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md §8.2`) into concrete delivery buckets:

**Bucket W0-A: SharePoint Site Provisioning**
Automated creation of a standardized SharePoint project site when a new project is initiated. Includes: site creation (Step 1), document library setup (Step 2), template file deployment (Step 3), SharePoint list provisioning (Step 4), web-part pre-installation (Step 5), security/permissions configuration (Step 6), and hub association (Step 7). Must be reliable, idempotent, and retry-safe.

**Bucket W0-B: Project Setup Request Workflow**
A governed intake workflow for requesting project setup. Includes: request submission by a project initiator, state transitions through the lifecycle (`Submitted → UnderReview → NeedsClarification | AwaitingExternalSetup → ReadyToProvision → Provisioning → Completed | Failed`), controller review and approval gate, and notification routing to correct recipients at each state transition.

**Bucket W0-C: Standardized Project Structure**
Each provisioned site must follow a standardized structure: a consistent set of document libraries, SharePoint lists (RFIs, submittals, change orders, daily reports), navigation structure, and pre-applied site template. This structure must be consistent enough across projects to support later Wave 1 app surfaces (Project Hub SPFx webpart, etc.).

**Bucket W0-D: Provisioning Visibility and Real-Time Progress**
Users and administrators must be able to see the current state of any project's provisioning. Includes: real-time step-by-step progress during active provisioning (via SignalR), post-completion status, failure notification, and a history of all requests with their states.

**Bucket W0-E: Failure Recovery and Controller Gate**
When provisioning fails, the system must: surface the failure visibly, provide a path to retry, provide an escalation path, and give administrators tools to diagnose and recover. The controller gate (a human approval step between `UnderReview` and `ReadyToProvision`) must be surfaced as a usable UI so approvals do not require direct API calls.

**Bucket W0-F: Setup-Related Permissions and Access Bootstrap**
Each provisioned project site must have correct permissions for the project team, using least-privilege patterns. This includes: Entra ID group lifecycle (create project-scoped groups, assign members, assign roles), service principal access (Sites.Selected scope), and role-based visibility in the provisioning UI (Admin/HBIntelAdmin vs. standard user views).

**Bucket W0-G: Admin, Support, and Observability**
A lean operating layer for administrators must exist before pilot. Includes: an admin failures inbox (view all failed provisioning runs, retry, escalate), basic operational telemetry dashboard (provisioning queue depth, success/failure rates, timing), and runbook documentation for common failure scenarios.

**Bucket W0-H: PWA Parallel Readiness**
The PWA must provide enough setup visibility, RBAC, and navigation capability to establish itself as a trustworthy entry point. At minimum: authenticated sign-in, RBAC-governed project list, project setup request submission, and provisioning status view. This does not need to be feature-equivalent to SPFx at Wave 0 close, but it must exist meaningfully.

### What Wave 0 Is Not

Wave 0 is **not** Project Hub full feature delivery. Project Hub (the SPFx webpart that surfaces project-level dashboards, budget tracking, schedule, RFIs, etc.) belongs to Wave 1. Wave 0 only provisions the site structure and confirms the setup is complete and trustworthy. The project workspace being ready to receive Wave 1 work is a Wave 0 output, not a Wave 0 feature.

Wave 0 is **not** the full Estimating → Project handoff automation. That data-flow automation (estimate data ingestion into project workspace) is a Wave 1 concern, even though the infrastructure (provisioned site) must be Wave 0.

Wave 0 is **not** field-crew usage. The field-crew experience (HB Site Control, offline RFIs, daily reports) is a future production stage concern.

---

## Current-State Assessment

*Evidence source: codebase inspection via agent 2026-03-14. All claims are verified against actual files, not plans.*

### Implemented and Hardened

**Backend Provisioning Saga** (`backend/functions/src/functions/provisioningSaga/`)
The 7-step provisioning orchestrator is architecturally complete. It includes: fire-and-forget 202 response, idempotency checks (skip already-Completed steps), exponential retry wrapper (`withRetry` at `maxAttempts:3, baseDelayMs:2000`), compensation logic (reverse steps 7→2→1 on failure), SignalR progress pushes after each step (best-effort), AppInsights telemetry events per step, and audit record writes (non-blocking). Step 5 deferral pattern (overnight timer) is designed and partially implemented. Five HTTP endpoints exist for the full request lifecycle: provision, status, failures, retry, escalate.

**@hbc/provisioning Package** (`packages/provisioning/`)
Headless provisioning frontend package is complete. Exports: `ProjectSetupRequestState` type + valid `STATE_TRANSITIONS`, `STATE_NOTIFICATION_TARGETS` routing table, type-safe `IProvisioningApiClient` factory, `IProvisioningStore` (Zustand + immer), `useProvisioningSignalR` hook with exponential reconnect, RBAC visibility logic, and notification templates. No React components — headless only, per the D-PH6-09 architectural decision.

**@hbc/auth** (`packages/auth/`)
Dual-mode authentication (MsalAdapter, SpfxAdapter, MockAdapter) is implemented and P1-tested. Exports RBAC stores (`useAuthStore`, `usePermissionStore`), role/feature gates (`RoleGate`, `FeatureGate`), and an Admin Access Control Panel. Both MSAL and SPFx contexts are supported cleanly.

**@hbc/shell** (`packages/shell/`)
Global navigation, project picker, contextual sidebar, `ShellLayout`, `BackToProjectHub`, `AppLauncher`, and `HeaderBar` are all implemented and P1-tested.

**@hbc/ui-kit** (v2.1.0, `packages/ui-kit/`)
Design system is mature: Griffel + FluentUI, four entry points (`/`, `/app-shell`, `/theme`, `/icons`), Storybook 8.6.0. Sufficient for all Wave 0 component consumption.

**@hbc/data-access** (`packages/data-access/`)
Ports/adapters pattern with 11 repository ports, mock adapters, and factory (`createXRepository`). Ready for use.

**@hbc/query-hooks** (`packages/query-hooks/`)
70+ domain query hooks + TanStack Query integration + Zustand UI/filter stores. Ready for provisioning hook consumption.

**@hbc/step-wizard** (`packages/step-wizard/`)
Multi-step guided workflow primitive: types, `stepStateMachine`, hooks, components. Designed for exactly the kind of project setup intake workflow Wave 0 requires. Implemented but not yet consumed by a provisioning workflow.

**@hbc/bic-next-move** (`packages/bic-next-move/`)
Universal work ownership and urgency primitive: types, urgency thresholds, registry, hooks, transfer, components. P1-tested. Designed to surface "who owns this step" — directly applicable to provisioning request ownership.

**@hbc/notification-intelligence** (`packages/notification-intelligence/`)
Priority-tiered notification system: registry, API, hooks, components. Can support provisioning state-change notifications. Implemented but not yet wired to provisioning state machine.

**@hbc/session-state** (`packages/session-state/`)
Offline persistence and sync: IndexedDB schema, SyncEngine, `useDraft`, `useConnectivity`, components. Directly supports Wave 0's requirement that users on intermittent connectivity can still see provisioning state.

**@hbc/workflow-handoff** (`packages/workflow-handoff/`)
Handoff state orchestration: types, API, hooks, components. Applicable to the controller gate review step.

**@hbc/smart-empty-state** (`packages/smart-empty-state/`)
First-visit coaching and empty states: classification logic, hooks, components. Needed for zero-project state (no projects provisioned yet) — ready to use.

**@hbc/project-canvas** (`packages/project-canvas/`)
Role-based dashboard canvas: registry, CanvasApi, `useProjectCanvas`, `useCanvasEditor`, components, reference tiles. Infrastructure for the eventual project workspace homepage. Implemented but not yet bound to real provisioning/project data.

**@hbc/complexity** (`packages/complexity/`)
Complexity tier management: `ComplexityProvider`, `useComplexity` hook. P1-tested. Used by all SPFx webparts.

**AppInsights + Retry Utilities** (`backend/functions/src/utils/`)
`logger.ts` (AppInsights events and metrics) and `retry.ts` (`withRetry` utility) are implemented and used throughout the saga.

**SPFx Webpart App Shells** (all 11 apps)
All 11 SPFx webpart apps are scaffolded with `App.tsx`, routing, provider hierarchy (ThemeProvider, QueryClientProvider, ComplexityProvider, ErrorBoundary, RouterProvider). Wave 0 can surface provisioning UX inside the `admin/` and `project-hub/` app shells without new app creation.

**PWA** (`apps/pwa/`)
Vite + TanStack Router + MSAL auth + provider hierarchy. Routing structure exists. Wave 0 can add project setup routes without major restructuring.

**Dev Harness** (`apps/dev-harness/`)
Tabbed sandbox with live-reload. Ready for Wave 0 component development.

### Partial / Scaffolded

**@hbc/versioned-record** (scaffold v0.0.1)
Diff engine, version API, hooks, and components are stubbed but not fully implemented. Not needed for Wave 0's critical path but relevant for audit/history trail in later waves.

**Backend Step 5 Timer Integration**
The timer handler (`backend/functions/src/functions/timerFullSpec/handler.ts`) exists and the deferral design (D-PH6-13) is implemented in the saga orchestrator. However, the production integration path (how the timer discovers `WebPartsPending` projects, the retry count limit, and escalation on repeated timer failures) needs validation and possibly hardening before production use.

**Backend Steps 3–4 Compensation**
Steps 1, 2, and 7 have compensation logic (rollback delete operations). Steps 3 (template files) and 4 (SharePoint lists) compensation behavior is less clear from the saga orchestrator. If Step 4 or 5 fails after Step 3, partial list structures may remain in the site. This needs explicit hardening.

**SharePoint Service PnPjs Integration** (`backend/functions/src/services/sharepoint-service.ts`)
The service exists and uses PnPjs. The auth model uses Managed Identity (`DefaultAzureCredential`) — not MSAL OBO — via `ManagedIdentityOboService`. Production readiness (Managed Identity token acquisition for SharePoint calls, SharePoint throttling/Retry-After handling, site-existence idempotency check before create) needs validation. This is the highest-risk production surface.

**Admin Webpart App Shell** (`apps/admin/`)
The SPFx admin app shell exists. The `AdminAccessControlPage` from `@hbc/auth` is available. `ProvisioningFailuresPage.tsx` is fully implemented (173 lines: `HbcDataTable`, per-row retry/escalate actions, real-time row-level action state) but was unreachable due to a router misconfiguration — the `/provisioning-failures` route was wired to `SystemSettingsPage` instead of `ProvisioningFailuresPage` (bug fixed 2026-03-14; `@hbc/provisioning` dependency declaration also added to `package.json` 2026-03-14). Controller gate review UI has not yet been built.

### Partial / Miswired (Exist but Incomplete or Unreachable)

The following were previously classified as entirely absent. Codebase validation (2026-03-14) confirmed partial or miswired implementations exist and must be extended or repaired rather than built from scratch.

**W0-M1: Project Setup Request Form UI — Partial**
A project setup request form is implemented in `apps/estimating/src/pages/NewRequestPage.tsx`. It captures project metadata fields and submits via the provisioning store. It is **not** yet built on `@hbc/step-wizard` (uses a plain form), is **missing** the `department` field required by the provisioning contract, and does not exist in the admin or PWA contexts. Required work: add `department` field, migrate to `@hbc/step-wizard` consumption pattern, extend to PWA.

**W0-M2: Provisioning Status Tracker / Progress View — Partial**
Provisioning status views exist in two places: (1) `apps/estimating/src/pages/RequestDetailPage.tsx` + `apps/estimating/src/components/ProvisioningChecklist.tsx` (step-level status checklist), and (2) `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx` (minimal scaffold). Neither is connected to `useProvisioningSignalR` for real-time updates. Required work: wire SignalR hook and Zustand store to the existing components; extend PWA view; surface in Project Hub SPFx context.

**W0-M3: Controller Gate Review UI — Absent**
A UI surface for the controller/admin to review a pending request, advance it to `ReadyToProvision`, send it back with `NeedsClarification`, or mark it as `AwaitingExternalSetup`. No component exists.

**W0-M4: Admin Failures Inbox UI — Implemented (Router Bug Fixed 2026-03-14)**
`apps/admin/src/pages/ProvisioningFailuresPage.tsx` is fully implemented (173 lines: `HbcDataTable`, per-row retry/escalate actions, real-time row-level action state via `createProvisioningApiClient`). The page was **unreachable** because the `/provisioning-failures` route in `apps/admin/src/router/routes.ts` was wired to `SystemSettingsPage` instead. This router bug has been fixed (2026-03-14). The `@hbc/provisioning` workspace dependency has also been added to `apps/admin/package.json` (2026-03-14). This item moves from Missing to Ready for validation.

**W0-M5: Post-Setup Project Workspace Card**
A UI component shown on the project hub after provisioning completes, confirming the project site is ready and linking to it. No component exists.

**W0-M6: PWA Project Setup Page**
The PWA has no route or page for project setup request submission or status tracking. Route structure exists but this content does not.

**W0-M7: Site Template Definition**
What SharePoint lists, document libraries, pages, and navigation the provisioning saga creates in each project site is not yet fully defined as a concrete site template. The saga steps have stubs but the actual template specification (list names, column schemas, document library structures, page layouts) needs definition.

**W0-M8: Entra ID Group Lifecycle Automation**
No implementation exists for automatically creating project-scoped Entra ID groups (e.g., `HB-Project-{projectNumber}-Team`, `HB-Project-{projectNumber}-Members`, `HB-Project-{projectNumber}-Viewers`) during provisioning, assigning them to the new site, and populating initial members.

**W0-M9: Notification Delivery Mechanism**
`notification-templates.ts` in the provisioning package defines what notifications should go to whom at each state transition. However, the actual delivery channel (email via Microsoft Graph, Teams adaptive card, SharePoint notification) is not implemented.

**W0-M10: Production Environment Configuration**
No validated production configuration exists for: Azure Table Storage connection string, Azure SignalR connection string, Managed Identity configuration (function app system-assigned identity, SharePoint `Sites.Selected` and Graph API permissions granted to that identity), PnPjs SharePoint tenant configuration, or Redis connection (if used for dedup). Local dev `.env` patterns exist but production config management (Azure App Configuration or Key Vault reference) is not confirmed.

**W0-M11: Wave 0 Operational Documentation**
No user-facing tutorials, administrator how-to guides, or runbook documentation exists for Wave 0 workflows. This is a governance requirement (documentation must be produced as a core deliverable of every phase).

---

## External Research Findings

*Research performed 2026-03-14. Sources cited below.*

### Construction-Domain Research

**Project Setup Best Practices (Procore, ACC, Industry)**

Modern construction tech platforms converge on several patterns that should inform Wave 0:

- **Template-driven project creation** is industry standard. Procore and Autodesk Construction Cloud both use company-level project templates that standardize document structures, permission sets, and workflow configurations. Teams that use templates consistently report faster time-to-value and less administrative overhead. Wave 0 should establish HB-specific project templates that are applied every time a site is provisioned.

- **Sequenced setup order matters.** ACC's onboarding guidance recommends: establish admin authority → create project structure → define document governance → enable collaboration → add workflows. This mirrors the 7-step provisioning saga design and should be reflected in the Wave 0 setup wizard UX.

- **Permission templates, not ad-hoc grants.** Both Procore and SharePoint enterprise guidance emphasize group-based permission management using pre-defined role templates. Individual user permission grants create drift and make auditing difficult. Wave 0 should use Entra ID group templates (Team/Members/Viewers) applied consistently.

- **The estimating-to-project handoff gap is a major industry pain point.** Multiple sources confirm that estimate data locked in spreadsheets does not flow automatically into project execution tools. Field crews re-enter data, miss scope details, and lose context. This is a Wave 1 concern, but Wave 0 must provision the site structure that will eventually receive estimate data.

- **Trust and transparency over raw automation.** The most successful construction PM tools prioritize making status, ownership, and next steps visible. Users who can see what's happening trust the system. This directly validates the SignalR progress visibility approach in Wave 0.

Sources: [Procore Project Setup](https://support.procore.com/getting-started-with-procore/set-up-a-project-in-procore), [ACC Tutorials](https://www.autodesk.com/learn/ondemand/tutorial/create-a-project-in-autodesk-construction-cloud), [Procore Kickoff Meeting](https://www.procore.com/library/construction-kickoff-meeting)

**Admin Recovery Expectations**

Enterprise internal tools that lack admin self-service recovery become high-touch support burdens:

- Admins need granular recovery options: restore deleted list/library, reset permissions, recover a project workspace state without full re-provisioning.
- Remote administration capability is expected (no need for desktop access to diagnose issues).
- Audit logging for project creation, permission changes, and document access is a baseline enterprise expectation.

Wave 0 must include admin recovery and observability as first-class features, not post-launch additions.

Sources: [ManageEngine Recovery Manager](https://www.manageengine.com/ad-recovery-manager/), [Microsoft Support Assistant](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365/admin/miscellaneous/sara-command-line-version)

### Platform / Architecture Research

**SharePoint Provisioning: PnP Core SDK vs. Graph API**

- Microsoft Graph API cannot create Communication Sites and lacks depth for advanced SharePoint customization and granular permission management at scale.
- PnP PowerShell/Core SDK (750+ cmdlets) is the recommended approach for automated provisioning. For Azure Functions (Node.js), the `@pnp/sp` library provides the same capability surface.
- For the HB Intel Node.js backend, `@pnp/sp` is the correct approach for SharePoint write operations. **Actual implementation uses Managed Identity (`DefaultAzureCredential`) for token acquisition** — not MSAL OBO. The `ManagedIdentityOboService` class acquires SharePoint-scoped tokens via the Azure Identity SDK.
- Idempotency: PnPjs operations should check for existing resources before creating. The provisioning saga's existing idempotency design (check `step.status === 'Completed'` before executing) is correct.

Sources: [Practical365: PnP PowerShell vs. Graph API](https://practical365.com/manage-your-sharepoint-online-environment-with-pnp-powershell/), [PnP.js Documentation](https://pnp.github.io/pnpjs/)

**Azure Functions Saga and Retry Patterns**

- Orchestrator functions must be deterministic and side-effect-free (no `Date.now()` in orchestration logic, no direct I/O).
- Activity functions should be idempotent. The provisioning saga's per-step idempotency check is architecturally correct.
- Exponential backoff with Retry-After header respect is the correct approach for SharePoint throttling (HTTP 429/503). The existing `withRetry` utility implements exponential backoff but needs enhancement to respect `Retry-After` headers from SharePoint responses.
- Compensation in reverse order (Step 7→2→1) is the correct saga compensation pattern for distributed rollback.
- Task hub naming must be unique per environment. If staging and production share a storage account, they must have different task hub names.

Sources: [Azure Durable Functions Best Practices](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-best-practice-reference), [Azure Saga Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga)

**SharePoint Throttling and Retry-After**

- SharePoint Online returns HTTP 429 or 503 with a `Retry-After` header indicating how long to wait. The header value must be respected; ignoring it and retrying immediately makes throttling worse and can cause the calling service to be blocked.
- The existing `withRetry` utility uses a fixed `baseDelayMs: 2000` and exponential multiplier but does not parse `Retry-After` headers. This must be fixed before production use.
- The `RateLimit-Remaining` response header provides early warning before throttling occurs and should be monitored.

Sources: [Microsoft: Avoid SharePoint Throttling](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/how-to-avoid-getting-throttled-or-blocked-in-sharepoint-online), [RateLimit Headers](https://devblogs.microsoft.com/microsoft365dev/prevent-throttling-in-your-application-by-using-ratelimit-headers-in-sharepoint-online/)

**SignalR Progress Patterns**

- Group membership in Azure SignalR Service is per-connection only; for persistent groups across reconnects, group membership must be restored on reconnect (not assumed to persist).
- The existing `useProvisioningSignalR` hook's reconnect strategy correctly attempts to re-subscribe to the project group after reconnecting.
- SignalR Serverless mode is required when using Azure Functions as the hub. This is the configured mode in the existing backend.

Sources: [Azure SignalR with Functions](https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-concept-azure-functions), [SignalR Groups](https://learn.microsoft.com/en-us/aspnet/core/signalr/groups)

**SPFx Best Practices (2024–2025)**

- SPFx 1.18+ supports Adaptive Card Extensions (ACEs) as lightweight, M365-integrated surfaces — ideal for project status summaries on hub pages.
- Bundle optimization: lazy-load non-mainline scenarios with dynamic `import()`; use only Fluent UI components included with SPFx (avoid duplicating React/Fluent dependencies).
- Performance target: webpart bundle <200KB including dependencies.
- ACEs are excellent for provisioning status display on SharePoint home/hub pages.

Sources: [SPFx Compatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility), [Web Part Optimization](https://learn.microsoft.com/en-us/microsoft-365/enterprise/modern-web-part-optimization)

**PWA Best Practices for Enterprise Tools**

- Service Worker + Web App Manifest + HTTPS + responsive design are the core requirements.
- Offline capability: IndexedDB for structured data, Background Sync API for deferred writes.
- Custom offline page cached during install — never show browser's default offline screen.
- For Wave 0's PWA role (RBAC app launcher + provisioning visibility), full offline capability is not required, but the PWA must handle connectivity disruptions gracefully (no crashes, clear "you're offline" state).

Sources: [MDN: PWA Best Practices](https://developer.mozilla.org/en-us/docs/web/progressive_web_apps/guides/best_practices), [Edge: PWA Best Practices](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/best-practices)

**RBAC / Least-Privilege Permissions**

- Group-based permission assignment is essential (not individual user grants) for consistency and auditability.
- `Sites.Selected` app permission scope is preferred over `Sites.FullControl.All` for the provisioning service principal — grants access only to the sites it needs.
- Project-scoped Entra ID dynamic groups simplify lifecycle management: when a user's role changes, group membership changes automatically.
- Three-tier model (Owners/Members/Viewers) covers most project workspace scenarios.

Sources: [AdminDroid: M365 Least Privilege](https://blog.admindroid.com/empower-your-microsoft-365-security-with-least-privilege-access/), [Varonis: SharePoint Permissions](https://www.varonis.com/blog/best-practices-for-sharepoint-permissioning)

**AppInsights Observability**

- Azure Functions have built-in AppInsights integration — just add connection string.
- Custom operations (`StartOperation`/`StopOperation`) track long-running workflows end-to-end in AppInsights.
- Structured logging to AppInsights with KQL queries is more effective than raw log scanning.
- Sampling is enabled by default; verify important events are not being sampled out.

Sources: [App Insights Best Practices](https://learn.microsoft.com/en-us/azure/well-architected/service-guides/application-insights), [Monitor Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/configure-monitoring)

**Enterprise Pilot Rollout Patterns**

- Pilot with 5–10% of target user base (2–3 representative projects for Wave 0).
- Define SMART success metrics upfront (adoption %, support ticket volume, provisioning success rate).
- Give support teams access during pilot, not after; they learn the product and reduce escalations.
- Phased cohort rollout: pilot → early adopters → broad rollout.

Sources: [Userpilot: Software Rollout](https://userpilot.com/blog/software-rollout/), [SharePoint Deployment Guidance](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/portal-rollout)

---

## Best-Practice Implications for Wave 0

The research above, combined with the architecture constraints in the repo, produces the following practical implications for how Wave 0 should be built.

**1. Template-first provisioning.** The site structure provisioned by the saga must be defined as an explicit, version-controlled template. This means: concrete list schemas, document library names, page layouts, and navigation structure must exist as configuration (not scattered in saga step code). This template is what HB Intel standardizes. The saga steps should read from the template configuration, not hardcode structure inline.

**2. Retry-After compliance is not optional.** The SharePoint service's `withRetry` wrapper must be enhanced to parse and respect `Retry-After` headers before any production provisioning is attempted. Ignoring `Retry-After` will cause SharePoint to apply longer throttle windows, which will cascade into more provisioning failures and a broken pilot experience.

**3. RBAC must be group-based from day one.** Entra ID group creation for each project (Team/Members/Viewers) must happen during provisioning (Step 6), not as a manual post-provisioning step. Individual user permission grants create drift and support burden. This must be automated in Wave 0.

**4. Sites.Selected scope is the right service principal design.** The provisioning service principal should be configured with `Sites.Selected` (not `Sites.FullControl.All`) to follow least-privilege patterns. This requires explicit site permission grants during provisioning and must be part of the Wave 0 security model.

**5. Real-time progress UI is trust-critical.** Construction teams care deeply about visibility and control. Showing a deterministic progress indicator (which step, whether it's running/done/failed) during provisioning is directly analogous to the transparency expected from tools like Procore. The `useProvisioningSignalR` hook is already built for this; a consuming component must be wired up.

**6. Admin recovery tooling prevents high-touch support.** Based on construction-tech and enterprise internal tool research, Wave 0 without admin recovery UI will create a high support burden for developers. The failures inbox and retry/escalate UI must be in scope before pilot.

**7. Observability must be built in, not added later.** The AppInsights telemetry utilities and provisioning events already exist in the backend. Before pilot, KQL query templates for common diagnostic scenarios (why did provisioning fail for project X, what is the current queue depth, how long does provisioning typically take) must exist and be documented.

**8. PWA must achieve minimal but real parity.** The PWA does not need feature parity with SPFx at Wave 0 close, but it must be usable for the basic setup workflow (submit request, see status). This is the "value-proof before hosting-cost escalation" gate from the roadmap. Without a working PWA for setup visibility, the case for broader PWA investment cannot be made.

**9. Step wizard is the correct primitive for setup intake.** The `@hbc/step-wizard` package was designed for exactly this use case: a multi-step guided intake form with state machine backing. Using it for project setup requests aligns with the shared-platform adoption rule (roadmap §3.6) and avoids creating bespoke form logic in the app.

**10. Pilot should be 2–3 projects, not a broad rollout.** Wave 0 should be piloted with a small, engaged set of project teams. Support personnel should shadow usage during the pilot to build the troubleshooting knowledge base. Metrics (provisioning success rate, time to provision, support ticket count) should be defined before pilot and tracked throughout.

---

## Wave 0 Gaps

### Product / UX Gaps

- Project setup request form is **partial** — exists in `apps/estimating` (`NewRequestPage.tsx`) but missing `department` field; not yet using `@hbc/step-wizard`; absent from admin and PWA contexts
- Provisioning status tracker is **partial** — step checklist exists in `apps/estimating` (`RequestDetailPage.tsx` + `ProvisioningChecklist.tsx`); minimal scaffold in `apps/pwa`; SignalR real-time connection not yet wired to either
- No real-time progress UI consuming the SignalR hook end-to-end (SignalR hook exists in `@hbc/provisioning`; no consumer connects it)
- No controller gate review UI (approve/clarify/block)
- Admin failures inbox UI **implemented and now accessible** — `ProvisioningFailuresPage.tsx` (router bug fixed 2026-03-14)
- No post-setup confirmation / project workspace launch card
- No empty-state coaching for users with no projects yet
- PWA provisioning route scaffold exists (`ProvisioningProgressView.tsx`) but is not a complete setup workflow

### Architecture Gaps

- Site template specification not defined (what lists, libraries, pages, navigation each provisioned site contains)
- Entra ID group lifecycle automation not implemented
- Notification delivery channel not implemented
- Production environment configuration management pattern not confirmed
- `Sites.Selected` service principal scope not validated for production
- Step 5 timer retry count limit and escalation-on-repeated-failure behavior unclear

### Package Maturity Gaps

- `@hbc/step-wizard`: implemented but not yet wired to provisioning setup request workflow
- `@hbc/bic-next-move`: implemented but not yet wired to provisioning request ownership
- `@hbc/notification-intelligence`: implemented but not yet wired to provisioning state transitions
- `@hbc/project-canvas`: implemented but not bound to real project data
- `@hbc/versioned-record`: scaffold only (not on Wave 0 critical path but noted)

### Backend / Integration Gaps

- `withRetry` utility does not respect `Retry-After` headers from SharePoint throttle responses
- Steps 3–4 compensation behavior unclear/incomplete
- PnPjs SharePoint service integration production readiness not validated
- Managed Identity (`DefaultAzureCredential`) configuration for SharePoint token acquisition not confirmed in production tenant
- Timer trigger saga handoff (Step 5 `WebPartsPending` → overnight retry loop) integration needs validation
- No integration tests for the full provisioning saga end-to-end

### Security / Access Gaps

- `Sites.Selected` service principal permission not validated for production tenant
- Entra ID group creation automation during provisioning not implemented
- Role assignment lifecycle (project open → project closed) not defined

### Observability / Support Gaps

- No operational dashboard for provisioning health metrics
- No KQL query templates for AppInsights diagnostic scenarios
- No admin runbook for common failure scenarios
- No SLA definition for provisioning duration (what is "too slow"?)

### Testing / Readiness Gaps

- No integration tests for full end-to-end provisioning saga
- No UAT checklist for Wave 0 pilot
- No load/stress tests for concurrent provisioning scenarios
- No user-facing tutorials or onboarding documentation
- No administrator how-to guides
- Wave 0 not yet covered by ADR (no ADR for Wave 0 scope/delivery decisions)

---

## Recommended Implementation Order

The following sequencing is derived from: architectural dependency order, risk-first hardening, shared-platform adoption doctrine (roadmap §3.6), and the principle of eliminating blockers before building consumer surfaces.

### Why This Order

**Preconditions must close first.** Phase 7 gates are a hard governance blocker. No Wave 0 feature expansion can proceed until ADR-0091 (Phase 7 Final Verification & Sign-Off) exists on disk and all P1 gates pass. This is non-negotiable per CLAUDE.md §6.3.

**Backend hardening before UI.** Building UX over a provisioning saga that cannot handle SharePoint throttling, has incomplete compensation logic, and has an unvalidated OBO flow is inviting a broken pilot. The backend must be production-ready first.

**Contracts before consumers.** Site template specification, Entra ID group naming convention, and notification delivery channel must be decided before the UX can be built against them. Building UI before contracts are locked produces throwaway work.

**Shared platforms wire in before feature surfaces.** `@hbc/step-wizard`, `@hbc/bic-next-move`, and `@hbc/notification-intelligence` should be wired to provisioning workflows before the SPFx/PWA surfaces are built. This ensures the surfaces consume the right primitives and do not create bespoke implementations.

**SPFx before PWA** for visible user value, per roadmap §3.4 doctrine. But PWA must proceed during the same group, not after, per roadmap §3.2 balanced progress rule.

**Admin/observability before pilot.** An unsupported pilot creates developer fire-fighting and damages trust. Admin recovery tooling, monitoring, and runbooks must exist before any real users see the system.

### Implementation Groups

**GROUP 0 — Phase 7 Closure (Precondition)**

This group must complete before any Wave 0 feature work begins.

- G0.1: Validate all P1 package tests pass at `branches: 95` (`@hbc/auth`, `@hbc/shell`, `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity`)
- G0.2: Verify `pnpm turbo run build`, `pnpm turbo run lint`, `pnpm turbo run check-types` all pass with zero errors
- G0.3: Confirm ADR-0091 (Phase 7 Final Verification & Sign-Off) is on disk; if absent, create it before proceeding
- G0.4: Update `current-state-map.md` to reflect Phase 7 closure status

**GROUP 1 — Contracts and Configuration Decisions**

Lock these decisions before any implementation proceeds. Each decision must be captured in an ADR (starting at ADR-0114).

- G1.1: Define site template specification — what SharePoint lists, document libraries, pages, and navigation each provisioned project site must contain. Capture in an ADR (ADR-0114) and a reference document in `docs/reference/provisioning/site-template.md`.
- G1.2: Define Entra ID group naming convention and lifecycle rules — group names, role assignments, member provisioning, project-close cleanup. Capture in ADR-0115.
- G1.3: Define notification delivery channel — email (Microsoft Graph), Teams adaptive card, SharePoint notification, or combination. Capture in ADR-0116.
- G1.4: Confirm production environment configuration management — Azure App Configuration, Key Vault references, or per-function app settings. Confirm and document.
- G1.5: Validate `Sites.Selected` permission scope — confirm service principal can be granted per-site access during provisioning. Test in dev/staging tenant.

**GROUP 2 — Backend Hardening**

Production-readiness hardening for the provisioning saga backend.

- G2.1: Enhance `withRetry` utility to parse and respect `Retry-After` headers from HTTP 429/503 responses. Add test coverage. *(Highest-risk production gap.)*
- G2.2: Validate PnPjs SharePoint service integration with Managed Identity (`DefaultAzureCredential`) token acquisition in staging environment. Confirm site creation, list creation, permission assignment, and hub association work end-to-end.
- G2.3: Harden Steps 3 and 4 compensation logic — define explicit compensation actions for partial list/library creation on rollback. Update saga orchestrator.
- G2.4: Validate Step 5 timer integration — confirm the saga correctly sets `WebPartsPending` status, the timer function discovers these projects, and the retry loop has a defined max retry count with escalation on repeated failure.
- G2.5: Implement Entra ID group creation in Step 6 — provisioning saga must create Entra ID security groups and assign them to the site during the permissions step (per G1.2 decision).
- G2.6: Implement production environment config validation at function startup — fail fast with clear error if required environment variables are missing.
- G2.7: Write integration tests for the full provisioning saga — happy path, throttle retry, step failure + compensation, and Step 5 deferral scenarios.

**GROUP 3 — Shared Platform Wiring**

Connect shared primitives to provisioning workflows before building consumer surfaces.

- G3.1: Wire `@hbc/bic-next-move` to provisioning request ownership — each setup request should surface in the BIC/Next Move system with the correct owner (submitter for `NeedsClarification`, controller for `ReadyToProvision`).
- G3.2: Wire `@hbc/notification-intelligence` to provisioning state transitions — connect `STATE_NOTIFICATION_TARGETS` from the provisioning package to the notification delivery channel decided in G1.3.
- G3.3: Validate `@hbc/step-wizard` consumption pattern — confirm the step wizard's state machine interface can drive the project setup request form without modification. Resolve any integration issues in dev harness before building the SPFx/PWA surfaces.
- G3.4: Validate `@hbc/session-state` for provisioning status caching — confirm that provisioning status can be persisted in IndexedDB for offline visibility. Resolve any integration issues.

**GROUP 4 — SPFx User Surfaces**

Build the SPFx-hosted user-facing surfaces. These surface inside the Admin and Project Hub SPFx webpart shells.

- G4.1: Project Setup Request Form — a `@hbc/step-wizard`-driven form inside the Project Hub SPFx app for submitting a new project setup request. Steps: project metadata → team assignment → confirmation + submission. Wired to `IProvisioningApiClient.submitRequest()`.
- G4.2: Provisioning Status View — a per-project real-time progress view using `useProvisioningSignalR` and the Zustand provisioning store. Shows step-by-step progress during active provisioning and final status on completion. Surfaced in Project Hub SPFx context.
- G4.3: Post-Setup Project Workspace Card — shown after `Completed` status. Confirms the site is ready, provides direct link to the provisioned SharePoint site, and shows the project team members. Surfaced in Project Hub SPFx.
- G4.4: Controller Gate Review UI — inside the Admin SPFx app, a view listing requests in `UnderReview` state with actions: Approve to `ReadyToProvision`, Return with `NeedsClarification` (with notes), or Mark `AwaitingExternalSetup`. Wired to `IProvisioningApiClient.advanceState()`.
- G4.5: Admin Failures Inbox UI — inside the Admin SPFx app, a list of all failed provisioning runs (from `listFailedRuns()`) with per-project retry (`retryProvisioning()`) and escalate (`escalateProvisioning()`) actions. Should display step-level failure details.

**GROUP 5 — PWA Parallel Surfaces**

Build PWA-hosted equivalents to maintain balanced progress. These are lighter than SPFx surfaces but must be real and usable.

- G5.1: PWA Project Setup Route — add a `/project-setup` route to the PWA's TanStack Router configuration. This page surfaces the project setup request form (same Step Wizard flow as G4.1, shared component from `@hbc/step-wizard`).
- G5.2: PWA Provisioning Status Page — add a `/projects` route showing a list of all accessible projects with their provisioning state. Active provisioning shows real-time progress via SignalR. Completed projects link to their SharePoint site. Failed projects link to the admin retry flow.
- G5.3: PWA RBAC App Visibility — confirm that the PWA's project list only shows projects the authenticated user has access to (using `@hbc/auth` permission store and provisioning store visibility rules).
- G5.4: PWA Offline Handling — confirm graceful degradation when the PWA loses connectivity during provisioning status viewing. `@hbc/session-state` should cache last-known provisioning state for offline display.

**GROUP 6 — Admin, Support, and Observability**

Operational readiness before pilot.

- G6.1: AppInsights KQL Query Templates — write and document the diagnostic queries needed for Wave 0 operations: provisioning failure rate by hour, top failure reasons, average provisioning duration, throttling event frequency. Add to `docs/maintenance/provisioning-runbook.md`.
- G6.2: Admin Runbook — create `docs/maintenance/provisioning-runbook.md` covering: how to diagnose a failed provisioning run, how to retry safely, how to escalate to developer support, how to recover from a partial provisioning state, and how to manually clean up an incomplete site.
- G6.3: Production Monitoring Alert Rules — define AppInsights alert rules: provisioning failure rate >5%, throttling events >10/hr, provisioning duration >30 minutes. Document threshold rationale.
- G6.4: Dev/Staging Manual Timer Trigger — confirm the `POST /api/admin/trigger-timer` endpoint works in dev/staging for on-demand Step 5 retry testing without waiting for the overnight cron.

**GROUP 7 — Testing, Documentation, and Pilot Readiness**

Final readiness validation before pilot deployment.

- G7.1: Wave 0 User Documentation — create onboarding materials in `docs/tutorials/` (getting started with project setup) and `docs/how-to/` (how to submit a setup request, how to track provisioning status, how to use the admin failures inbox). Follow Diátaxis framework.
- G7.2: UAT Checklist — create a formal UAT checklist covering all Wave 0 workflows: request submission, controller review, provisioning progress visibility, completion confirmation, failure handling, admin retry, and PWA setup visibility.
- G7.3: Pilot Rollout Plan — document the pilot cohort (2–3 projects), onboarding plan, feedback collection mechanism, and success metrics (provisioning success rate ≥95%, average time to provision, support ticket volume, user NPS score). Add to `docs/how-to/administrator/wave-0-pilot-guide.md`.
- G7.4: Wave 0 ADR — create ADR-0114 (or next available number) capturing the Wave 0 scope decisions, site template specification, and Entra ID group design.
- G7.5: Update `current-state-map.md` — add all new Wave 0 documents to the document classification matrix (§2). Update workspace inventory (§1) to reflect new packages/components added during Wave 0.
- G7.6: Update ADR-0090 cross-references — ensure the provisioning ADR cross-references to the new Wave 0 build-out plan and site template ADR.

---

## Wave 0 Build-Out Plan

### Overview

This build-out plan provides the detailed capability structure, sequencing rationale, dependency map, code ownership guidance, risk controls, MVP/deferral boundaries, and validation expectations for Wave 0.

### Capability Group W0-A: SharePoint Site Provisioning (Backend)

**Sequencing:** Group 2 (backend hardening)
**Dependencies:** G1.1 (site template spec), G1.5 (Sites.Selected validation), G1.4 (prod config)
**Code Ownership:**
- Orchestrator and steps: `backend/functions/src/functions/provisioningSaga/`
- SharePoint service: `backend/functions/src/services/sharepoint-service.ts`
- Retry utility: `backend/functions/src/utils/retry.ts` (must be enhanced)
- AppInsights telemetry: `backend/functions/src/utils/logger.ts`

**Required Work:**
- Enhance `withRetry` to parse `Retry-After` response headers
- Validate PnPjs + Managed Identity (`DefaultAzureCredential`) end-to-end in staging
- Define and implement site template structure (Step 3: template files, Step 4: lists)
- Harden Steps 3–4 compensation
- Implement Entra ID group creation in Step 6
- Validate Step 5 timer loop with max retry + escalation
- Integration tests: happy path, retry path, compensation path, deferral path

**Risk Controls:**
- Retry-After compliance is the highest single risk. Test throttle behavior explicitly in staging before pilot.
- Step 5 deferral should be validated with a controlled overnight run in staging before pilot.
- Managed Identity token acquisition refresh: confirm `DefaultAzureCredential` handles token refresh across long provisioning runs (tokens typically valid 60–75 minutes; saga must re-acquire for long-running steps).

**MVP Boundary:** Full 7-step saga must succeed reliably in staging before pilot. Step 5 deferral is in scope but can be treated as P1.5 if pilot is limited to projects that don't trigger the deferral path. Escalation-on-repeated-timer-failure is MVP-required to prevent silent infinite loops.

**Validation Expectations:**
- Integration test suite passing for all paths
- Staging provisioning run with real SharePoint tenant: end-to-end success
- Throttle injection test: saga completes correctly when step receives 429 response

---

### Capability Group W0-B: Project Setup Request Workflow

**Sequencing:** Groups 3 and 4 (shared platform wiring + SPFx surfaces)
**Dependencies:** W0-A (backend endpoints), G1.2 (group convention), G1.3 (notification channel), G3.3 (step wizard validation)
**Code Ownership:**
- State machine: `packages/provisioning/src/state-machine.ts` (read-only consumer in UI)
- API client: `packages/provisioning/src/api-client.ts`
- Store: `packages/provisioning/src/store.ts`
- Setup request form component: SPFx Project Hub (`apps/project-hub/src/features/setup/`) — no reusable visual primitives may be created outside `@hbc/ui-kit`
- Step wizard: `packages/step-wizard/` (consume, do not fork)
- BIC ownership: `packages/bic-next-move/` (consume)
- Notifications: `packages/notification-intelligence/` (consume)

**Required Work:**
- Design step wizard schema for project setup request (step 1: project metadata, step 2: team assignment, step 3: review + submit)
- Implement setup request form in SPFx Project Hub consuming `@hbc/step-wizard`
- Wire `@hbc/bic-next-move` to provisioning ownership (submitter owns until controller takes it)
- Wire `@hbc/notification-intelligence` to state transitions per `STATE_NOTIFICATION_TARGETS`
- Implement notification delivery (email or Teams, per G1.3 decision)
- Controller gate review UI in SPFx Admin (approve, clarify, block)

**Risk Controls:**
- Step wizard state machine must not be reimplemented in the SPFx app — consume the primitive only
- Notification delivery reliability: use non-blocking delivery (D-PH6-06 pattern) so notification failures do not block state transitions

**MVP Boundary:** Full request lifecycle (submit → review → provision → complete) is in Wave 0. Post-completion notifications are in Wave 0. Detailed audit history/diff view (`@hbc/versioned-record`) is deferred to Wave 1.

---

### Capability Group W0-C: Standardized Project Structure

**Sequencing:** Group 1 (contract decisions) → Group 2 (backend implementation)
**Dependencies:** G1.1 (site template spec ADR)
**Code Ownership:**
- Template specification: `docs/reference/provisioning/site-template.md` (reference document, Diátaxis)
- Template configuration data: consumed by saga steps (configuration approach TBD in G1.1)
- SharePoint lists/libraries schema: defined in G1.1 and implemented in Steps 3–4

**Required Work:**
- Define the concrete site template: list names, column schemas, document library names, page layouts, navigation structure
- Version-control the template as configuration (not hardcoded in step functions)
- Implement template in provisioning saga Steps 3 and 4
- Define the template update strategy (when the template changes, how are existing sites updated)

**Risk Controls:**
- Template scope creep: Wave 0 template should be minimal and proven. Lists that are "nice to have" but not required for Wave 1 SPFx apps should be deferred.
- Template versioning: the saga should record which template version was applied to each site (for future update management)

**MVP Boundary:** Wave 0 template must include at minimum: document library (drawings, specifications, submittals), RFI list, daily report list, project team list, and basic navigation. Full SharePoint pages, webpart pre-installation, and site scripts are in scope but can be phased.

---

### Capability Group W0-D: Provisioning Visibility and Real-Time Progress

**Sequencing:** Group 4 SPFx + Group 5 PWA (after backend Group 2 is complete)
**Dependencies:** W0-A (SignalR events firing), `@hbc/provisioning` SignalR hook
**Code Ownership:**
- SignalR hook: `packages/provisioning/src/hooks/useProvisioningSignalR.ts` (consume, do not fork)
- Zustand store: `packages/provisioning/src/store.ts` (consume)
- Progress display component: SPFx Project Hub + PWA (thin presentation layer consuming the store)
- All visual primitives must come from `@hbc/ui-kit`

**Required Work:**
- Build provisioning status display component (step-by-step status list with state indicators)
- Build real-time progress indicator (animated, shows active step)
- Build post-completion confirmation card (site link, team members, next steps)
- Wire into SPFx Project Hub (G4.2, G4.3)
- Wire into PWA project list page (G5.2)

**Risk Controls:**
- SignalR group membership is per-connection — if user refreshes or reconnects, the hook must re-subscribe. Test reconnect behavior explicitly.
- Long provisioning runs (>5 minutes) must not leave the UI in an indefinite "waiting" state. Add a timeout fallback that polls status if SignalR is silent for >2 minutes.

**MVP Boundary:** Real-time progress for active provisioning is in scope. Historical provisioning runs are in scope (stored in Zustand store from API). Full audit trail with diff engine is Wave 1.

---

### Capability Group W0-E: Failure Recovery and Controller Gate

**Sequencing:** Group 4 SPFx Admin (G4.4, G4.5)
**Dependencies:** W0-A (retry/escalate endpoints), `@hbc/provisioning` API client
**Code Ownership:**
- Backend endpoints: `backend/functions/src/functions/provisioningSaga/index.ts`
- Admin UI: `apps/admin/src/features/provisioning/` (thin presentation, no reusable primitives)
- `@hbc/ui-kit` for all visual components

**Required Work:**
- Admin failures inbox UI — **implemented and now accessible** (`apps/admin/src/pages/ProvisioningFailuresPage.tsx`; router bug fixed 2026-03-14). Requires: validation testing, per-request step-level failure detail view, and confirmation modal for retry/escalate actions.
- Controller gate review UI (approve, clarify, hold) — not yet built
- Per-request detail view showing step-level failure information
- Confirmation modal for retry/escalate actions (irreversible or high-impact actions)

**Risk Controls:**
- Retry idempotency: retrying a failed provisioning run must be safe (existing saga idempotency handles this, but confirm in testing)
- Controller gate access: only users with Admin/HBIntelAdmin role should see controller UI (use `RoleGate` from `@hbc/auth`)

**MVP Boundary:** Retry and escalate actions are Wave 0. Detailed root-cause analysis tooling (step execution log replay) is a future production stage concern.

---

### Capability Group W0-F: Permissions and Access Bootstrap

**Sequencing:** Groups 1–2 (contract + backend)
**Dependencies:** G1.2 (Entra ID group convention), G1.5 (Sites.Selected validation)
**Code Ownership:**
- Entra ID group creation: Step 6 in provisioning saga (`backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts`)
- Role gate: `packages/auth/` (`RoleGate`, `FeatureGate`)
- Visibility rules: `packages/provisioning/src/visibility.ts`

**Required Work:**
- Implement `Sites.Selected` service principal permission model in staging tenant
- Implement Entra ID group creation and member provisioning in Step 6
- Define role-to-group mapping (Admin/HBIntelAdmin = controller; project team = members group; requestor = specific member)
- Validate visibility rules with real RBAC roles in staging

**Risk Controls:**
- `Sites.Selected` requires explicit per-site permission grants from a tenant admin. This requires IT/admin coordination and should be validated very early (G1.5).
- Entra ID group creation requires Graph API `Group.ReadWrite.All` scope. This permission must be requested and approved before backend work proceeds.

**MVP Boundary:** Per-project Entra ID groups are Wave 0. Dynamic group membership (auto-update based on HR system) is a future production stage. Project closure group cleanup is Wave 0 (deactivate groups, don't delete for audit history).

---

### Capability Group W0-G: Admin, Support, and Observability

**Sequencing:** Group 6 (before pilot)
**Dependencies:** W0-A (telemetry events firing correctly)
**Code Ownership:**
- Runbook: `docs/maintenance/provisioning-runbook.md`
- KQL templates: `docs/maintenance/appinsights-queries.md`
- Alert rules: documented in runbook (configured in Azure portal)

**Required Work:**
- Write provisioning runbook with common failure scenarios and resolution steps
- Write AppInsights KQL query library for provisioning diagnostics
- Configure alert rules for provisioning failure rate, throttling frequency, and duration outliers
- Document manual timer trigger usage for dev/staging

**Risk Controls:**
- Without a runbook, first-line support will escalate everything to developers. The runbook is the primary mechanism to prevent developer fire-fighting during pilot.
- Alert thresholds should be conservative for pilot (lower failure rate threshold = earlier warning during initial rollout).

**MVP Boundary:** All items in this group are Wave 0 hard requirements before pilot. Advanced analytics dashboards are a future production stage.

---

### Capability Group W0-H: PWA Parallel Readiness

**Sequencing:** Group 5 (during, not after, SPFx Group 4)
**Dependencies:** W0-B (request workflow), W0-D (status visibility), `@hbc/auth` MSAL
**Code Ownership:**
- PWA routes: `apps/pwa/src/router/`
- PWA page components: `apps/pwa/src/pages/` (thin composition)
- Shared components: consume from `@hbc/step-wizard`, `@hbc/ui-kit`, `@hbc/provisioning`

**Required Work:**
- Add `/project-setup` and `/projects` routes to PWA TanStack Router
- Build project list page with provisioning state indicators
- Build project setup page consuming same Step Wizard flow as SPFx
- Confirm RBAC-governed project visibility
- Confirm graceful offline handling via `@hbc/session-state`

**Risk Controls:**
- PWA must not lag behind SPFx by more than one group. Start Group 5 concurrently with Group 4, not after.
- MSAL auth must work cleanly before any PWA provisioning UI can be tested. Validate MSAL config for the production tenant early.

**MVP Boundary:** PWA setup form and project status list are Wave 0. PWA offline full data caching is Wave 1. PWA Adaptive Card notifications are Wave 2.

---

## Wave 0 Readiness Gates

The following conditions must all be true before Wave 0 is considered ready for pilot deployment. This uses the ADR-0083 three-level taxonomy.

### Code-Ready Gate (implemented and passing quality checks)

- [ ] Phase 7 ADR-0091 (Final Verification & Sign-Off) confirmed on disk and Phase 7 verification gates confirmed
- [ ] All P1 packages passing at `branches: 95` (`@hbc/auth`, `@hbc/shell`, `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity`)
- [ ] `pnpm turbo run build` passing with zero errors
- [ ] `pnpm turbo run lint` passing with zero errors and boundary rules enforced
- [ ] `pnpm turbo run check-types` passing with zero TypeScript errors
- [ ] Integration tests passing for full provisioning saga (happy path, retry, compensation, Step 5 deferral)
- [ ] `withRetry` utility enhanced with `Retry-After` header handling, with test coverage
- [ ] SPFx project setup form functional in dev harness
- [ ] SPFx provisioning status view functional with SignalR in dev harness
- [ ] SPFx admin failures inbox functional in dev harness
- [ ] PWA project setup route and status page functional in dev harness
- [ ] Entra ID group creation implemented in Step 6 and tested in staging tenant
- [ ] All new Wave 0 documents classified and added to `current-state-map.md §2`

### Environment-Ready Gate (infrastructure and configuration validated)

- [ ] Production/staging Azure Function app configuration validated (all required env vars present)
- [ ] Azure SignalR Service configured in serverless mode and validated end-to-end
- [ ] Azure Table Storage connection validated for provisioning state persistence
- [ ] Azure Function app system-assigned Managed Identity configured with correct permissions (`Sites.Selected`, `Group.ReadWrite.All` for Entra ID group creation)
- [ ] `Sites.Selected` per-site permission grant tested in staging SharePoint tenant
- [ ] AppInsights workspace connected and receiving telemetry events from provisioning saga
- [ ] Alert rules configured for failure rate, throttling frequency, and duration outliers
- [ ] SPFx webparts deployed to staging App Catalog and validated in a real SharePoint site
- [ ] PWA deployed to staging/preview environment and validated with real MSAL auth

### Operations-Ready Gate (support tooling and documentation in place)

- [ ] Admin provisioning runbook exists at `docs/maintenance/provisioning-runbook.md` (Diátaxis compliant)
- [ ] AppInsights KQL query library documented at `docs/maintenance/appinsights-queries.md`
- [ ] User onboarding tutorial exists at `docs/tutorials/getting-started-project-setup.md`
- [ ] Admin how-to guide exists at `docs/how-to/administrator/wave-0-admin-guide.md`
- [ ] Pilot rollout plan documented with cohort definition, success metrics, and feedback process
- [ ] Support team has received hands-on orientation on Wave 0 admin tools
- [ ] Wave 0 ADR created (ADR-0114 or next available) capturing site template and group design decisions

### Production-Ready (composite)

Wave 0 is Production-Ready for pilot deployment when all three gates above are satisfied and:
- [ ] Staging provisioning success rate ≥95% across at least 5 test runs
- [ ] Provisioning duration ≤15 minutes for a standard project (excluding Step 5 deferral path)
- [ ] Zero unhandled exceptions in AppInsights across 5 staging test runs
- [ ] Pilot cohort of 2–3 projects identified and PM confirmation obtained

---

## Top Risks

The following risks are the most important to manage. If Wave 0 is attempted without addressing these risks, pilot failure or developer fire-fighting is likely.

**Risk W0-R1: SharePoint throttling causes provisioning failures in production**
If the `withRetry` utility does not respect `Retry-After` headers, aggressive retries will make throttling worse and trigger SharePoint service blocks. A provisioning saga that reliably fails in production destroys user trust immediately. This is the single highest-priority technical risk.
*Mitigation:* Enhance `withRetry` with `Retry-After` header parsing (G2.1) before any production provisioning is attempted. Test with throttle injection in staging.

**Risk W0-R2: No admin recovery tooling leads to permanent developer dependency for support**
Without an admin failures inbox and runbook, every provisioning failure becomes a developer incident. In a pilot with 2–3 projects, this is manageable. At 10+ projects, it becomes unsustainable.
*Mitigation:* Admin failures inbox (G4.5) and runbook (G6.2) are non-deferrable before pilot.

**Risk W0-R3: Sites.Selected permission approval not obtained in time**
The `Sites.Selected` service principal permission model requires explicit tenant admin approval and per-site grants. If IT/security cannot approve this before pilot, the entire backend provisioning saga is blocked.
*Mitigation:* Validate `Sites.Selected` in staging early (G1.5) and engage IT/security immediately. If approval is delayed, provisioning via a tenant-scoped service account may be needed as a fallback (requires security review and separate ADR).

**Risk W0-R4: PWA lags too far behind SPFx, weakening the value-proof for hosted investment**
If the PWA has no setup visibility or project list at Wave 0 close, leadership cannot see a unified experience. The case for hosted-PWA investment cannot be made. The roadmap's value-proof gate (§3.4) fails.
*Mitigation:* Start Group 5 (PWA surfaces) concurrently with Group 4 (SPFx surfaces), not after.

**Risk W0-R5: Site template scope is either too large or too small**
A template that provisions too little leaves Wave 1 apps with insufficient structure. A template that provisions too much creates confusing, cluttered sites and makes provisioning slower and more failure-prone.
*Mitigation:* Define the template explicitly in G1.1 with product owner input. Wave 0 template should include exactly what Wave 1 apps need and nothing more.

**Risk W0-R6: Step wizard not wired correctly causes bespoke form logic in apps**
If the step wizard integration pattern is not validated before building SPFx/PWA forms, developers may create bespoke multi-step form logic in the app layer — violating the shared-platform adoption rule and creating future fragmentation.
*Mitigation:* Validate `@hbc/step-wizard` consumption pattern in dev harness (G3.3) before building any app-layer forms.

**Risk W0-R7: Notification delivery channel decision blocked delays the full request lifecycle**
If the notification delivery mechanism (email/Teams/SharePoint) is not decided before G3.2, the state machine transitions will not send notifications, and the controller gate will not know when to act — silently breaking the approval flow.
*Mitigation:* Treat G1.3 (notification channel decision) as a hard prerequisite for any request lifecycle work.

**Risk W0-R8: Phase 7 closure is delayed, blocking Wave 0 start**
If Phase 7 verification gates or ADR-0091 (Phase 7 Final Verification & Sign-Off) creation is delayed, Wave 0 feature work cannot legally begin under governance rules.
*Mitigation:* Prioritize Phase 7 closure as an immediate action. Do not defer P1 test coverage issues or build/lint/typecheck failures. Wave 0 planning can proceed concurrently with Phase 7 closure, but implementation cannot start until the gate is satisfied.

---

## Follow-On Planning Recommendations

After this Wave 0 build-out plan is approved, the following actions should be taken before implementation begins.

**1. Prioritize Phase 7 Gate Closure Immediately**
Begin the Phase 7 final verification sequence now. Do not wait for Wave 0 planning to be fully complete before addressing Phase 7. Running them in parallel is encouraged — Wave 0 planning can proceed concurrently with Phase 7 closure.

**2. Make G1 Contract Decisions as a Team**
The five Group 1 contract decisions (site template, Entra ID groups, notification channel, production config, Sites.Selected validation) require product owner and IT/security input, not just engineering decisions. Schedule a focused session to lock these decisions. Without them, implementation cannot meaningfully proceed.

**3. Use (and Complete) the MVP Project Setup Plan Set as the Wave 0 Detailed Branch Plans**
The MVP Project Setup plan set (`docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-Plan.md` and task plans T01–T08 in the same folder) already provides task-level breakdown, acceptance criteria, and guarded commit task configurations for the Project Setup stream within Wave 0. These plans are the authoritative detailed branch plans for that stream and must be consulted before any implementation begins. For Wave 0 streams not covered by T01–T08 (platform hardening groups G1–G3, PWA group G5, admin/observability group G6), a complementary branch plan should be created in `docs/architecture/plans/MVP/wave-0/`.

**4. Create ADR-0114 for Wave 0 Scope Decisions**
When the Group 1 contract decisions are locked, capture them in ADR-0114. This ADR should cover: Wave 0 site template specification, Entra ID group design, notification delivery channel choice, and service principal permission scope. This ADR becomes a binding reference for all Wave 0 implementation.

**5. Engage IT/Security on Sites.Selected Immediately**
The `Sites.Selected` permission scope requires tenant admin action. This is an outside dependency (roadmap §16.1) that can block all backend provisioning work if not addressed early. Submit the permission request to IT/security as soon as the plan is approved.

**6. Identify and Engage the Pilot Cohort**
Identify 2–3 project managers willing to participate in the Wave 0 pilot before implementation begins. Their input on the site template scope (G1.1) is valuable. Early engagement builds adoption momentum and ensures the template reflects real project needs.

**7. Establish a Wave 0 Delivery Review Cadence**
Given the number of inter-group dependencies, schedule brief weekly reviews of Wave 0 progress during implementation. Check that: Group 0 is closed, G1 decisions are locked, backend hardening is not blocked, and SPFx/PWA surface work is progressing in parallel.

**8. Plan Wave 1 Dependency Review Alongside Wave 0 Execution**
Wave 0 provisions the site structure that Wave 1 apps will consume. As the site template is finalized in G1.1, review Wave 1 requirements (Project Hub dashboard, Estimating integration, BD pipeline) to confirm the template has the right structure. This prevents Wave 0 completion from immediately requiring a template revision.

---

## Optional Supporting Artifacts

The following documents should be created as Wave 0 implementation proceeds. They are referenced in the readiness gates above and required by the governance rules in CLAUDE.md §4.

- `docs/architecture/plans/MVP/wave-0/wave-0-task-plan.md` — detailed task-level breakdown (Canonical Normative Plan)
- `docs/architecture/adr/0114-wave-0-site-template-and-permissions.md` — Wave 0 site template specification, Entra ID group design, service principal scope (Permanent Decision Rationale)
- `docs/reference/provisioning/site-template.md` — human-readable site template specification (Reference)
- `docs/reference/provisioning/state-machine.md` — provisioning request lifecycle states, transitions, and notification routing (Reference)
- `docs/tutorials/getting-started-project-setup.md` — user onboarding tutorial for project setup (Tutorial)
- `docs/how-to/administrator/wave-0-admin-guide.md` — admin how-to guide (How-To)
- `docs/maintenance/provisioning-runbook.md` — operational runbook for provisioning failures (Maintenance)
- `docs/maintenance/appinsights-queries.md` — KQL query library for provisioning diagnostics (Maintenance)
- `docs/how-to/administrator/wave-0-pilot-guide.md` — pilot rollout plan and success metrics (How-To)

All documents must be added to `current-state-map.md §2` upon creation.

---

*End of HB Intel Wave 0 Build-Out Plan v1.1 (Proposed — Validated 2026-03-14)*

*This document must be reviewed by the product owner and architecture owner before any Wave 0 implementation work begins. Upon approval, it should be updated to remove the "Proposed" status marker and added to `current-state-map.md §2` with classification Canonical Normative Plan.*

*v1.1 validation applied corrections to: Phase 7 gate ADR number (ADR-0091), backend auth model (Managed Identity / DefaultAzureCredential, not MSAL OBO), Missing section reclassifications (W0-M1/M2/M4 to Partial/Miswired), CLAUDE.md version references (v1.6), MVP Project Setup T01–T08 plan set reference, and G0.3 gate check wording. See `docs/architecture/plans/MVP/wave-0-validation-report.md`.*
