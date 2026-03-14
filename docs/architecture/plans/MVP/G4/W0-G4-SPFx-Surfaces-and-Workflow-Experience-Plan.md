# Wave 0 — Group 4: SPFx Surfaces and Workflow Experience Plan

> **Doc Classification:** Canonical Normative Plan — master umbrella plan for Wave 0 Group 4 (SPFx Surfaces and Workflow Experience). Governs `W0-G4-T01` through `W0-G4-T08`. Must be read before executing any Group 4 task plan.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — ready for implementation team review; requires G3 acceptance gate to be satisfied before implementation proceeds
**Governs:** `W0-G4-T01` through `W0-G4-T08`
**Read with:** `CLAUDE.md` v1.6 → `current-state-map.md` → `HB-Intel-Wave-0-Buildout-Plan.md` v1.1 → `W0-G1-Contracts-and-Configuration-Plan.md` v1.1 → `W0-G2-Backend-Hardening-and-Workflow-Data-Foundations-Plan.md` → `W0-G3-Shared-Platform-Wiring-and-Workflow-Experience-Plan.md` → this document → individual T01–T08 plans
**Wave 0 umbrella reference:** `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md`
**Validation basis:** `docs/architecture/plans/MVP/wave-0-validation-report.md`
**Phase 7 gate:** ADR-0090 must exist on disk before G4 implementation proceeds (CLAUDE.md §6.3)
**Next ADR available:** ADR-0114 (G1 plan context; G4 may consume ADR-0117 and beyond depending on G1–G3 ADR consumption)

---

## 1. Purpose

### 1.1 Why Group 4 Exists

Groups 1 through 3 answered foundational questions: what gets provisioned (G1 contracts, G2 data foundations), and how the shared platform primitives wire into the project setup lifecycle (G3). They answered: *what does the system build, and how does the underlying machinery behave?*

Group 4 exists to answer a different question: *how do users across every role actually encounter, navigate, act within, and trust the project setup workflow through the SPFx applications that HB Intel delivers?*

That is not a cosmetic question and not a UI-polish question. The SPFx surfaces are the primary interface through which requesters initiate projects, coordinators track and retry, controllers review and approve, admins oversee and recover, and the entire team receives confirmation that a project is ready. Without governed SPFx surface specifications, each app team will invent its own model for form composition, role exposure, status display, failure handling, and completion flow. The result is an inconsistent, ambiguous, and untrustworthy user experience — regardless of how well the backend and shared primitives underneath are built.

Group 4 exists to prevent that outcome. It defines:

- How the Estimating SPFx app delivers the requester's guided setup entry point and the full multi-step guided flow
- How the Estimating SPFx app surfaces visibility and safe bounded retry capability for the Estimating Coordinator role
- How the Accounting/controller-facing SPFx app delivers a queue-first review posture followed by a structured review surface
- How the Admin SPFx app owns provisioning oversight, escalation, and recovery — and what it explicitly does not duplicate from the other surfaces
- How the completion confirmation experience works and how the optional Project Hub handoff is presented without forced redirect
- How role- and context-based visibility rules using `@hbc/complexity` are applied consistently across all SPFx surfaces
- How responsive behavior, navigation composition, and degraded/failure-state handling govern the SPFx surfaces
- What rigorous testing and verification must be satisfied before any G4 surface is considered pilot-ready

### 1.2 Why Group 4 Is an SPFx Surfaces Group

Group 4 is explicitly **not** a backend hardening group. G2 owns the data model for workflow families. Group 4 must not modify backend services, provisioning saga steps, or SharePoint list schemas. Any backend gap discovered during G4 work must be surfaced as a G2 amendment, not silently patched in a G4 task.

Group 4 is explicitly **not** a shared-platform package redesign group. G3 owns the integration contracts for `@hbc/step-wizard`, `@hbc/bic-next-move`, `@hbc/workflow-handoff`, `@hbc/notification-intelligence`, `@hbc/session-state`, and `@hbc/complexity`. Group 4 consumes those contracts as its governing surface-layer rules. Group 4 must not redesign the contracts or introduce competing wiring logic.

Group 4 is explicitly **not** a placeholder My Work delivery group. `@hbc/my-work-feed` (SF-29) is a future feature. Group 4 must not build bespoke personal-inbox or "your work" surfaces as stopgaps. The `@hbc/bic-next-move` badge and detail components provide sufficient per-role action visibility until My Work ships.

Group 4 is explicitly **not** a PWA surfaces group. G5 (PWA) governs the equivalent PWA surfaces. Group 4 is strictly scoped to the SPFx webpart applications hosted in SharePoint.

What Group 4 does produce:

- Governed SPFx surface specifications for all four app contexts (Estimating, Accounting, Admin, Project Hub)
- Precise role/context visibility rules and their implementation paths using `@hbc/complexity`
- Responsive layout and failure-mode requirements for the SPFx surfaces
- A rigorous testing and verification plan specifically for the SPFx layer

---

## 2. Governing Document Relationships

### 2.1 Relationship to Wave 0 Umbrella Plan

`HB-Intel-Wave-0-Buildout-Plan.md` (v1.1) defines Group 4 as the SPFx surfaces tranche. The section **"GROUP 4 — SPFx Surfaces and Workflow Experience"** in that plan maps to the eight tasks defined here. This master plan refines and expands that mapping into implementation-guiding task plans.

This plan does not extend or override the Wave 0 umbrella. Conflicts between this plan and the umbrella must be surfaced as amendments — not silent overrides.

### 2.2 Relationship to Validation Report

`wave-0-validation-report.md` (2026-03-14) established the corrected repo posture used as the baseline for Group 4:

- `apps/estimating/src/pages/NewRequestPage.tsx` exists and implements a basic project setup form, but **does not use `@hbc/step-wizard`** and **lacks the `department` field** — T01 governs the upgrade to a guided multi-step surface
- `apps/estimating/src/pages/ProjectSetupPage.tsx` exists as a coordinator list view — T02 governs its expansion to full coordinator visibility and bounded retry
- `apps/estimating/src/pages/RequestDetailPage.tsx` exists with provisioning visibility and SignalR wiring — T01 and T02 govern its expansion
- `apps/admin/src/pages/ProvisioningFailuresPage.tsx` exists with retry/escalate actions — T04 governs its expansion and boundary definition
- `apps/accounting/src/` does not yet have a project setup queue or structured review surface — T03 governs its creation
- `apps/project-hub/src/` contains `DashboardPage.tsx` and project views but no completion handoff receiver — T05 governs the handoff entry point
- Backend auth uses `DefaultAzureCredential` (Managed Identity), not MSAL OBO — all G4 plans use Managed Identity language consistently

### 2.3 Relationship to Group 1 Package

Group 1 locked five contracts that directly constrain G4:

- G1-D1 (Site Template): the provisioned site structure that G4's completion surface points to via Project Hub
- G1-D2 (Project Access Model): the three-group Entra ID model informs what team assignment G4 surfaces expose to requesters
- G1-D3 (Notification Delivery): `@hbc/notification-intelligence` is mandatory — G4 must not introduce bespoke notification dispatch
- G1-D5 (Permission Model): `Sites.Selected` / Managed Identity determines the access context G4 SPFx surfaces operate within
- G1-D6 (Auth Boundary): `@hbc/auth` primitives are mandatory for all role/permission decisions in G4 — no parallel auth logic

### 2.4 Relationship to Group 2 Package

Group 2 establishes the SharePoint list infrastructure and provisioning saga hardening that G4 surfaces will read from and operate against. Specifically:

- The `pid` relational contract (G2-T01) establishes how G4 can query project-specific data from any list
- Provisioning saga Step 3/4 updates (G2-T07) determine what data structures are present when G4 renders completion state
- Validation and idempotency rules (G2-T08) inform how G4 handles retry scenarios without triggering duplicate provisioning

Group 4 must not implement G2-owned provisioning logic. If a G4 surface needs to show provisioning status, it reads from `@hbc/provisioning` store and the backend provisioning API — it does not re-implement saga logic.

### 2.5 Relationship to Group 3 Package

Group 3 is the direct upstream dependency for Group 4. G3 produces the governing contracts that G4 consumes to render the SPFx surfaces. No G4 surface may be implemented without the following G3 contracts being locked:

| G3 Output | G4 Consumer |
|-----------|-------------|
| `IStepWizardConfig<IProjectSetupRequest>` (T01) | T01 — Estimating requester guided setup |
| BIC config + canonical action contract (T02) | T01, T02, T03, T04 — ownership display across all surfaces |
| Clarification re-entry spec (T03) | T01 — requester clarification return flow |
| `INotificationRegistration` specs (T04) | T01, T02 — notification wiring in Estimating |
| Draft key registry (T05) | T01 — auto-save and resume in the setup form |
| Complexity gate spec table (T06) | T06 — all progressive-detail surfaces |
| Shared primitive integration checklist (T07) | T07 — G4 failure mode spec |
| G3 test plan (T08) | T08 — G4 testing builds on G3 test foundations |

G4 does not redesign, augment, or bypass G3 contracts. If G4 implementation reveals a gap in a G3 contract, it must be raised as a G3 amendment before G4 proceeds past the affected surface.

### 2.6 Relationship to MVP Project Setup Plan Set

The MVP Project Setup plan set (`docs/architecture/plans/MVP/project-setup/`) defines the detailed task-level implementation stream that Group 4 supplements and governs:

- MVP T03 (Controller Gate and Request Orchestration): G4-T03 governs the Accounting/controller-facing SPFx surface that implements the review gate
- MVP T04 (Estimating Requester Surfaces): G4-T01 and G4-T02 govern the Estimating SPFx surfaces that replace the current minimal form with the full guided experience
- MVP T07 (Admin Recovery, Notifications, and Audit): G4-T04 governs the Admin SPFx surface boundary
- MVP T08 (Completion and Getting Started): G4-T05 governs the SPFx completion confirmation and Project Hub handoff

Where the MVP Project Setup plan set specifies a requirement and G4 specifies a surface implementation — G4 governs the surface. Where the MVP plan set specifies a backend or lifecycle contract that G4 surfaces consume — the MVP plan set governs. Conflicts must be surfaced as amendments.

---

## 3. Locked G4 Decisions

The following decisions were made during the business interview process and are locked inputs for all Group 4 task plans. They may not be reversed or materially altered without a superseding ADR.

### G4-D1 — Requester Setup Surface Location

**Selection:** Hybrid requester experience hosted in the **Estimating SPFx app**.

**Meaning:** The requester's project setup workflow begins from within the Estimating application. The entry point is a clearly labeled action in Estimating. From that entry point, the requester opens into the full guided multi-step setup experience — which is still hosted within the Estimating SPFx webpart context. The setup workflow is not relocated to Project Hub, Admin, or a standalone SPFx page. The Estimating app is the trusted anchor for the requester's project initiation experience.

**Implications for T01:** The guided setup experience must be composed entirely within `apps/estimating/`. The existing `NewRequestPage.tsx` is the starting point; T01 governs its upgrade to the `@hbc/step-wizard`-driven guided flow. Project Hub is the destination *after* completion — not the host of the setup workflow.

### G4-D2 — Review and Recovery Split

**Selection:** Accounting/controller-facing SPFx owns review/approval; Admin SPFx owns provisioning oversight/escalation/recovery; Estimating Coordinator retains visibility and limited retry inside Estimating.

**Meaning:** Three separate role surfaces exist with clearly non-overlapping primary ownership:
- The controller's job (reviewing requests, requesting clarification, approving) happens in the Accounting/controller-facing app.
- The admin's job (monitoring provisioning runs, escalating persistent failures, performing recovery actions outside safe coordinator bounds) happens in the Admin app.
- The coordinator's job (tracking submitted requests, performing safe bounded retry for clearly recoverable failures) happens in the Estimating app.

No surface should duplicate another surface's primary ownership area. Overlap is only acceptable for read-only summary data that all roles legitimately need to see.

**Implications:** T02 must not give Estimating coordinators admin-level recovery powers. T03 must not push review/approval work into Admin. T04 must not duplicate controller-level review surfaces inside Admin.

### G4-D3 — Estimating Coordinator Limited Retry

**Selection:** Retry is allowed for clearly safe and bounded failure cases only. Structural, permissions-level, repeated, or admin-class failures remain exclusively in Admin.

**Meaning:** The Estimating Coordinator has enough operational context to safely retry a provisioning step if the failure is transient, clearly recoverable, and within the coordinator's operational scope (e.g., a transient network timeout on step 2 that has no side effects). The coordinator does not have the authority to force-retry a failure that involves SharePoint permissions errors, Entra ID group creation failures, repeated failures on the same step, or any failure that the admin class has already escalated or flagged.

**Implications for T02:** T02 must define the retry boundary precisely using observable failure-class characteristics, not vague "minor vs. major" language. The retry button must be disabled or absent for out-of-bounds failures. The coordinator's retry surface must explicitly label retries as bounded.

### G4-D4 — Estimating Post-Submit Visibility Layering

**Selection:** Layered visibility using `@hbc/complexity` and `@hbc/step-wizard`.

**Meaning:** After a request is submitted from Estimating, the requester and the Estimating Coordinator both see the status of their submitted request in the Estimating app — but they see different layers. The requester sees a simpler status-and-context view: current state, expected resolution time, and a plain-language description of what is happening. The Estimating Coordinator sees the same core summary plus deeper operational detail: step-level progress, failure classification, retry eligibility, and BIC ownership. Both views use `@hbc/complexity` for progressive disclosure — not hardcoded role-branch logic.

**Implications for T01/T02:** The requester's detail view and the coordinator's detail view share a common base summary. The coordinator's additional detail is wrapped in `HbcComplexityGate` at `standard` or `expert` tier. Neither surface invents its own role-detection logic.

### G4-D5 — Controller Review Experience

**Selection:** Queue first, then structured review when opened.

**Meaning:** The controller does not land directly on a single request's detail. They land on a queue — a structured list of pending requests ordered by urgency, date, and state. When they choose to open a specific request, they enter a structured review surface with the full request detail, clarification tools, approval/hold/forward routing actions, ownership context, and history.

**Implications for T03:** T03 must define both the queue surface (its columns, sort order, action triggers) and the structured review surface (its fields, action affordances, and what it consumes from G3 contracts). The review surface must not be a wizard — the controller is reviewing an already-submitted structured request, not filling out a form step by step.

### G4-D6 — Completion Handoff

**Selection:** Hybrid confirmation experience plus optional navigation to Project Hub. No forced redirect.

**Meaning:** When provisioning completes, the requester (and coordinator) receive a clear, actionable completion confirmation in the Estimating surface. The confirmation shows what was provisioned, provides a summary of the resulting project site structure, and offers — but does not force — an "Open Project Hub" action. The user may close the confirmation and return to their Estimating workflow without having navigated to Project Hub. If they choose to open Project Hub, they are navigated to the project-specific SharePoint site.

**Implications for T05:** The completion surface must be explicitly designed to avoid: automatic redirect timers, redirect-on-close behavior, disappearing confirmations, or any other mechanism that removes user agency over when they navigate to Project Hub.

### G4-D7 — Project Hub Destination

**Selection:** Project Hub is the post-completion destination. It is hosted within the project SharePoint site — not a centralized global HB Intel app instance.

**Meaning:** Each provisioned project gets its own SharePoint site, and the Project Hub webpart is deployed to that site. When the user navigates to "Open Project Hub," they are navigating to the project-specific SharePoint site — a different URL from the Estimating or Accounting SharePoint site. This means the handoff is a cross-site navigation, not an in-app route change.

**Implications for T05:** The "Open Project Hub" link must open the project site URL — not `/project-hub` in the current app. The link must be constructed from the provisioned site URL stored in `IProjectSetupRequest` / `IProvisioningStatus`. T05 must specify how the project site URL is extracted and validated before the link is rendered.

### G4-D8 — Responsive Posture

**Selection:** Desktop-first, tablet-safe for key workflows.

**Meaning:** The SPFx surfaces are designed and tested for desktop-class viewports (1024px+) as the primary rendering target. Key workflows — specifically the guided setup form (T01), the coordinator retry surface (T02), and the controller review surface (T03) — must also function correctly on tablet-class viewports (768px+). Mobile is not a Wave 0 SPFx delivery target. Tablet-safe means: no horizontal overflow, touch-target compliance for primary actions, readable type hierarchy, and functional form fields on a 768px-wide viewport.

**Implications for T07:** T07 must define the specific responsive breakpoints, the workflows that must meet tablet-safe requirements, and what "tablet-safe" means in testable terms.

### G4-D9 — Role Visibility Boundaries

**Selection:** Layered visibility by role and context; same core summary across all roles; deeper role-appropriate operational detail where justified; no bespoke per-role view logic in surface code.

**Meaning:** All users who have visibility into a project setup request — requester, coordinator, controller, admin — see the same core summary: project name, current state, current owner, expected action, and key timestamps. What varies by role is the depth of operational detail beneath that summary. Controllers see clarification reasons and approval action history. Coordinators see step-level status and retry eligibility. Admins see saga internals, error payloads, and escalation history. All of this progressive depth is governed by `@hbc/complexity` — not hardcoded `if (role === 'X')` branches.

**Implications for T06:** T06 must produce a complete complexity gate spec table that maps every field shown in any G4 surface to its minimum visibility tier and the roles/contexts that access each tier.

### G4-D10 — G4 Scope Boundary

**Selection:** G4 is an SPFx surfaces group — not a backend hardening group, not a shared-package redesign group, not a placeholder My Work delivery group.

**Meaning:** The scope boundary of G4 is exactly the SPFx app surfaces and their composition rules. G4 does not extend backend function apps (G2 scope), redesign shared platform primitives (G3 scope), deliver PWA surfaces (G5 scope), or implement My Work aggregation (future SF-29 scope). G4 discovers gaps in G2 or G3 and surfaces them as amendments — it does not absorb them as scope.

---

## 4. Surface Map

The four application contexts in Group 4 divide the project setup experience by role, stage, and lifecycle responsibility.

### 4.1 Estimating SPFx (`apps/estimating/`)

**Primary role context:** Project Setup Requesters and Estimating Coordinators

**Repo location:** `apps/estimating/src/` — existing SPFx webpart (`EstimatingWebPart.tsx`) with TanStack Router; current pages: `BidsPage`, `TemplatesPage`, `ProjectSetupPage`, `NewRequestPage`, `RequestDetailPage`

**Wave 0 scope in G4:**

The Estimating SPFx app owns two distinct but adjacent experiences:

1. **Requester guided setup** (T01): The `NewRequestPage` path is upgraded from the current basic form to a multi-step guided flow using `@hbc/step-wizard`. This includes draft persistence via `@hbc/session-state`, clarification-return behavior per G3-T03's re-entry spec, and post-submit status display in `RequestDetailPage`.

2. **Estimating Coordinator visibility and limited retry** (T02): The `ProjectSetupPage` and `RequestDetailPage` are expanded to surface coordinator-appropriate operational detail and safe bounded retry capability. The coordinator sees step-level progress, failure classification, BIC ownership detail, and retry actions where permitted.

**What Estimating does not own:** Controller review/approval (Accounting owns it), admin recovery (Admin owns it), provisioning saga implementation (G2 and backend own it).

### 4.2 Accounting/Controller-Facing SPFx (`apps/accounting/`)

**Primary role context:** Controllers reviewing and approving project setup requests

**Repo location:** `apps/accounting/src/` — existing SPFx webpart (`AccountingWebPart.tsx`) with TanStack Router; current pages: `BudgetsPage`, `InvoicesPage`, `OverviewPage` — **no project setup queue or review surface currently exists**

**Wave 0 scope in G4:**

A new project setup review section must be created in the Accounting app. This section contains:

1. **Queue surface** (T03): A structured list of pending review requests, ordered by urgency/date, with status badges, requester identity, and queue action affordances (open, hold, forward).

2. **Structured review surface** (T03): A detail view opened from the queue that presents the full `IProjectSetupRequest` fields, BIC ownership and next-action context, clarification request tools, approval/reject/hold/forward routing actions, and expandable history.

**What Accounting does not own:** Provisioning saga step details (Admin owns the full saga view), requester-facing setup form (Estimating owns it), retry/recovery actions outside the review scope.

### 4.3 Admin SPFx (`apps/admin/`)

**Primary role context:** Admin users managing provisioning oversight, escalation, and recovery

**Repo location:** `apps/admin/src/` — existing SPFx webpart (`AdminWebPart.tsx` implied from webparts directory) with TanStack Router; current pages: `ErrorLogPage`, `ProvisioningFailuresPage`, `SystemSettingsPage`

**Wave 0 scope in G4:**

The Admin SPFx app already has a `ProvisioningFailuresPage.tsx` (validated in the wave-0 report as existing and fixed post-validation). T04 governs:

1. **Provisioning oversight surface**: What the failures page shows and how it presents saga-level step detail that is out of scope for the coordinator retry surface.

2. **Escalation and recovery boundaries**: What retry and recovery actions are available exclusively to admin (vs. the bounded coordinator retry in Estimating), how structural/permission failures are presented, and how repeated failure escalation paths are visualized.

3. **Admin surface exclusions**: What the admin surface must explicitly not duplicate from Estimating or Accounting to prevent cross-surface confusion about authority.

**What Admin does not own:** Requester-facing guided setup (Estimating), controller review/approval (Accounting), provisioning saga implementation (backend/G2).

### 4.4 Project Hub (`apps/project-hub/`)

**Primary role context:** All project team members post-provisioning

**Repo location:** `apps/project-hub/src/` — existing pages: `DashboardPage`, `DocumentsPage`, `PreconstructionPage`, `TeamPage`

**Wave 0 scope in G4:**

Project Hub is the *destination* of the completion handoff, not an active participant in the setup workflow itself. G4's scope in Project Hub is narrow and specific:

1. **Completion handoff entry point** (T05): A landing or onboarding experience on the Project Hub dashboard (or a dedicated welcome route) that acknowledges the project was just provisioned, confirms the site structure is available, and orients the user to what the hub contains.

2. **No setup workflow duplication**: Project Hub must not contain a copy of the setup wizard, a review queue, or any administrative recovery surface. Those belong to their respective apps.

**What Project Hub does not own in Wave 0:** Project setup initiation, controller review, admin recovery, coordinator retry. Those functions remain in their respective apps.

---

## 5. Dependency and Boundary Doctrine

Group 4 consumes the following packages as governing design seams. Each boundary listed here is binding. Any proposed change that crosses a boundary requires an ADR.

### `@hbc/ui-kit` — Required Source of All Shared UI Primitives

**Governing source:** `packages/ui-kit/src/` — validated as implemented; P1 test package

`@hbc/ui-kit` is the **required and exclusive source** of shared UI components, layout primitives, and reusable presentation patterns for all Group 4 surfaces. This is not a preference — it is an architectural rule (CLAUDE.md §1.6 — UI Ownership Rule).

What this means for G4:

- All form fields, buttons, status badges, data tables, panels, modals, cards, banners, and navigation primitives used in G4 surfaces **must** be imported from `@hbc/ui-kit`.
- Current exports relevant to G4 include: `HbcButton`, `HbcDataTable`, `HbcStatusBadge`, `HbcPanel`, `HbcCard`, `HbcForm`, `HbcFormField`, `HbcInput`, `HbcConfirmDialog`, `HbcModal`, `HbcBanner`, `HbcStatusTimeline`, `HbcAuditTrailPanel`, `HbcEmptyState`, `HbcErrorBoundary`, `HbcTabs`, `HbcToast`, `WorkspacePageShell`, and layout/shell exports from `@hbc/ui-kit/app-shell`.
- If a G4 surface requires a UI primitive that does not yet exist in `@hbc/ui-kit` (e.g., a queue row component with retry affordance, a guided completion card, a coordinator retry banner), **the primitive must be created in `@hbc/ui-kit` first** — not authored as an app-local reusable component.
- App-local code in `apps/estimating/`, `apps/accounting/`, `apps/admin/`, and `apps/project-hub/` may compose `@hbc/ui-kit` components into page-specific arrangements. That is the correct usage. The composition is app-local. The primitives are not.

**SPFx-specific constraint:** SPFx webpart contexts require import from `@hbc/ui-kit/app-shell` (not the full `@hbc/ui-kit` entry point) for shell-only surfaces to preserve bundle budget. SPFx app pages and forms may use full `@hbc/ui-kit` imports where the bundle budget is not constrained by webpart shell-only requirements. Each task plan must specify which entry point is appropriate for its surface.

### `@hbc/step-wizard` — Guided Setup Flow Seam

**Governing source:** `packages/step-wizard/src/` — validated as implemented

`@hbc/step-wizard` governs the multi-step guided setup form for the requester. Key exports: `useStepWizard(config, item)`, `IStepWizardConfig<T>`, `IStep<T>`, `HbcStepWizard`, `HbcStepProgress`, `HbcStepSidebar`.

G4 must not implement its own step-progression logic, step-validation pattern, or guided flow state management outside `@hbc/step-wizard`. If `@hbc/step-wizard` lacks a capability required by G4 (e.g., a specific step flagging mechanism for clarification re-entry), the fix must be made in `@hbc/step-wizard` with an ADR — not with app-local workarounds.

The `IStepWizardConfig<IProjectSetupRequest>` produced by G3-T01 is the consuming contract G4-T01 must follow.

### `@hbc/complexity` — Progressive Detail Seam

**Governing source:** `packages/complexity/src/` — validated as implemented; P1 test package

`@hbc/complexity` governs all role-based and context-based progressive disclosure. Key exports: `useComplexity()`, `HbcComplexityGate`, `HbcComplexityDial`, `useComplexityGate()`.

G4 must not implement `if (role === 'x')` guards or custom tier logic in any surface. All decisions about what field, section, or action to show at what level of detail must be expressed through `HbcComplexityGate` with explicit `minTier` / `maxTier` props. The complexity gate spec table produced by G3-T06 maps every G4 visible field to its tier. G4-T06 applies and validates that table across all SPFx surfaces.

### `@hbc/provisioning` — Lifecycle State Machine Seam

**Governing source:** `packages/provisioning/src/` — validated as implemented; exports `useProvisioningStore`, `createProvisioningApiClient`, `getProvisioningVisibility`, `useProvisioningSignalR`, `STATE_TRANSITIONS`, `STATE_NOTIFICATION_TARGETS`, `isValidTransition`

G4 reads provisioning state from `useProvisioningStore()` and the provisioning API client. G4 does not modify `@hbc/provisioning` source, implement its own lifecycle state machine, or duplicate the `getProvisioningVisibility()` logic in app-local code. The existing `getProvisioningVisibility()` function (returns `'full' | 'notification' | 'none'`) is the governing role-to-visibility resolver for provisioning detail — G4 surfaces invoke it, they do not replace it.

### `@hbc/auth` — Authorization Seam

**Governing source:** `packages/auth/src/` — validated as implemented; P1 test package

All authorization decisions in G4 surfaces must use `@hbc/auth` primitives: `RoleGate`, `FeatureGate`, `usePermissionStore`, `useAuthStore`, `useCurrentSession`, `resolveEffectivePermissions`. G4 must not introduce parallel role-check logic.

SPFx-specific: `@hbc/auth` must be initialized before `@hbc/ui-kit` consumers mount. The provider order in all SPFx webpart bootstrap files must be: `auth provider → complexity provider → ui-kit consumers` (CLAUDE.md §1.7 / package-relationship-map §Provider Order).

### `@hbc/bic-next-move` — Ownership and Next-Action Display Seam

**Governing source:** `packages/bic-next-move/src/` — validated as implemented

Key exports used in G4: `useBicNextMove(item, config)`, `IBicNextMoveState`, `HbcBicBadge`, `HbcBicDetail`, `HbcBicBlockedBanner`.

G4 uses BIC components for ownership and next-action display across all four surfaces. The `IBicNextMoveConfig<IProjectSetupRequest>` produced by G3-T02 is the consuming contract. G4 does not author its own ownership-display logic or invent custom "who has the ball" representations.

### `@hbc/workflow-handoff` — Handoff Assembly and Status Seam

**Governing source:** `packages/workflow-handoff/src/` — validated as implemented

Key exports used in G4 (specifically T05): `usePrepareHandoff()`, `IHandoffConfig<S,D>`, `HbcHandoffComposer`, `HbcHandoffStatusBadge`.

The handoff from Estimating to Project Hub is the primary G4 handoff. T05 must compose the handoff package using `@hbc/workflow-handoff` — not a bespoke "redirect on completion" mechanism.

### `@hbc/notification-intelligence` — Notification Seam

**Governing source:** `packages/notification-intelligence/src/` — validated as implemented

Per G1-D3, all provisioning lifecycle notifications must flow through `@hbc/notification-intelligence`. G4 SPFx surfaces do not dispatch notifications directly — they read notification state via `useNotificationCenter()` and trigger notification-producing actions through the provisioning API, which triggers registered notification events.

### `@hbc/session-state` — Draft and Resume Seam

**Governing source:** `packages/session-state/src/` — validated as implemented

Key exports used in G4-T01: `useDraft<T>(key, ttlHours?)`, `useSessionState()`, `HbcConnectivityBar`, `HbcSyncStatusBadge`.

The draft key registry produced by G3-T05 specifies the keys and TTLs for all saveable G4 surfaces. G4-T01 follows that registry — it does not define new draft key logic.

### What G4 May Not Redesign

G4 may not:
- Modify `@hbc/provisioning` lifecycle state machine
- Modify `@hbc/auth` role model or permission resolution
- Modify `@hbc/notification-intelligence` notification registration or delivery
- Redesign `@hbc/step-wizard` configuration API
- Redesign `@hbc/bic-next-move` ownership contract
- Modify `@hbc/workflow-handoff` handoff lifecycle
- Implement backend SharePoint provisioning logic
- Create competing reusable UI component systems inside app-local folders

---

## 6. Task Sequencing Rationale

The eight Group 4 tasks are ordered to build requester surfaces before coordinator surfaces, to define primary role surfaces before cross-role rules, and to address failure modes and testing after all primary surfaces are specified.

| Task | Name | Produces | Unlocks |
|------|------|----------|---------|
| T01 | Estimating Requester Guided Setup Surface | Guided setup surface spec; step-wizard composition rules; post-submit status display spec | T02 (coordinator detail layer on same surface), T05 (completion entry point in Estimating), T07 (wizard failure modes) |
| T02 | Estimating Coordinator Visibility and Limited Retry | Coordinator detail spec; retry boundary rules; bounded retry surface definition | T07 (retry failure modes), T08 (retry boundary tests) |
| T03 | Accounting/Controller Queue and Structured Review Surface | Queue surface spec; review surface spec; action affordances definition | T07 (review surface failure modes), T08 (controller surface tests) |
| T04 | Admin Oversight, Escalation, and Recovery Surface Boundaries | Admin surface scope definition; boundary with coordinator retry; escalation and recovery surface spec | T07 (admin failure modes), T08 (admin boundary tests) |
| T05 | Completion Confirmation and Optional Project Hub Handoff | Completion confirmation spec; optional handoff composition; Project Hub link construction | T07 (handoff failure modes), T08 (completion handoff tests) |
| T06 | Role/Context Visibility and Complexity Rules | Cross-surface complexity gate application; universal summary definition; role-tier mapping | T07 (complexity integration rules), T08 (visibility tests) |
| T07 | Responsive Behavior, Navigation, Composition, and Failure Modes | Responsive rules; navigation composition; degraded-state catalog | T08 (failure mode tests) |
| T08 | Testing and Verification for SPFx Surfaces | Complete G4 test plan with pilot readiness gate | G5 and pilot readiness |

### Why This Order

T01 must come first because it defines the primary user-facing surface and the step-wizard composition rules that T02 builds on top of. T02 must follow T01 because the coordinator's detail layer extends the same `RequestDetailPage` surface. T03 and T04 are largely independent of T01/T02 (different apps, different roles) and can proceed in parallel with T02 once T01 is defined. T05 depends on T01 (the completion event in Estimating) and T03 (what the controller approved). T06 must come after T01–T05 because it validates and specifies the cross-surface complexity rules that all five task surfaces must implement. T07 must come after all primary surfaces are defined because failure modes cannot be specified without knowing what the surfaces do. T08 comes last because it can only produce rigorous test definitions after all surface specifications are locked.

### Group 4 Entry Condition

G4 implementation may not begin until all G3 acceptance gate conditions are satisfied (see G3 master plan §8), specifically:

1. G3-T01 locked: `IStepWizardConfig<IProjectSetupRequest>` is defined and stable
2. G3-T02 locked: BIC config and canonical action contract are defined
3. G3-T03 locked: clarification re-entry rules are defined
4. G3-T04 locked: `INotificationRegistration` specs are complete
5. G3-T05 locked: draft key registry is defined
6. G3-T06 locked: complexity gate spec table is defined
7. G3-T07 locked: shared primitive integration rules and failure mode catalog are defined
8. ADR-0090 exists on disk (Phase 7 closure gate per CLAUDE.md §6.3)

### Later-Group Entry Condition

G5 (PWA surfaces) may not begin implementation of project setup UX until G4-T01 through G4-T07 are locked. The G4 surface specifications inform G5 by demonstrating how the same contracts are applied to an SPFx context — G5 applies the same contracts to a PWA context and may adapt (not redesign) where SPFx and PWA differ.

Pilot readiness (G6/G7) may not begin until G4-T08 acceptance criteria are satisfied.

---

## 7. Required Supporting Artifacts

Group 4 produces **surface specification documents** and **route/composition maps** that feed downstream implementation and future testing. The expected outputs are:

| Artifact | Location | Produced by | Consumed by |
|----------|----------|-------------|-------------|
| Estimating requester surface spec + route map | `docs/reference/spfx-surfaces/estimating-requester-surface.md` | T01 | G5 (PWA equivalent), pilot testing |
| Coordinator visibility and retry boundary spec | `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` | T02 | G5 (PWA equivalent), pilot testing |
| Controller queue and review surface spec | `docs/reference/spfx-surfaces/controller-review-surface.md` | T03 | G5 (PWA equivalent), pilot testing |
| Admin oversight and recovery boundary spec | `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | T04 | G5 (PWA equivalent), pilot testing |
| Completion confirmation and handoff spec | `docs/reference/spfx-surfaces/completion-handoff-spec.md` | T05 | G5 (PWA equivalent), pilot testing |
| Cross-surface complexity gate application map | `docs/reference/spfx-surfaces/complexity-application-map.md` | T06 | G5, pilot testing, future roles |
| Responsive rules and failure mode catalog | `docs/reference/spfx-surfaces/responsive-failure-catalog.md` | T07 | G5, T08, pilot testing |

All reference documents must be added to `current-state-map.md §2` upon creation using document class "Reference."

### ADR Inputs

G4 may produce inputs for the following ADRs:

- **ADR-0117** (conditional): If T01 requires a change to `@hbc/step-wizard` to support the guided setup flow (e.g., step-flagging for clarification re-entry), that change requires an ADR specifying the package modification before it proceeds.
- **ADR-0118** (conditional): If T02 retry boundary determination reveals a gap in the `@hbc/provisioning` visibility or state model that requires a package change, that change requires an ADR.
- **ADR-0119** (conditional): If T05 handoff composition requires a new `@hbc/workflow-handoff` capability not present in the current implementation, that requires an ADR.
- **ADR-0120** (conditional): If T06 complexity gate application reveals that `@hbc/complexity`'s existing tier model cannot represent a required G4 visibility rule without modification, that requires an ADR.

---

## 8. Acceptance Gate

Group 4 is complete at the planning level when all of the following conditions are satisfied.

**T01 Complete:**
- [ ] Guided setup entry point in Estimating is specified (route, trigger, component composition)
- [ ] Step-wizard composition for `NewRequestPage` path is defined (steps, validation, draft key, clarification-return integration)
- [ ] Post-submit status display in `RequestDetailPage` is specified for requester context
- [ ] `@hbc/ui-kit` component assignments are explicit for every shared UI element
- [ ] Reference document exists at `docs/reference/spfx-surfaces/estimating-requester-surface.md`

**T02 Complete:**
- [ ] Coordinator visibility layer spec is defined (what fields coordinator sees beyond requester)
- [ ] Retry boundary is defined with observable failure-class criteria (not vague language)
- [ ] Retry surface composition is specified (which UI components, what state drives visibility)
- [ ] Out-of-bounds failure routing to Admin is specified
- [ ] Reference document exists at `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`

**T03 Complete:**
- [ ] Controller queue surface spec is defined (columns, sort, filter, row actions)
- [ ] Structured review surface spec is defined (fields, action affordances, history section)
- [ ] All action outcomes (approve, clarify, hold, forward) are specified with state transitions
- [ ] Queue-to-review navigation flow is specified
- [ ] Reference document exists at `docs/reference/spfx-surfaces/controller-review-surface.md`

**T04 Complete:**
- [ ] Admin oversight surface scope is defined relative to coordinator and controller surfaces
- [ ] Admin-exclusive actions (escalation, force-retry, failure archival) are enumerated
- [ ] Boundary with coordinator bounded retry is explicitly stated
- [ ] Admin surface exclusions (no duplication of requester or controller flows) are documented
- [ ] Reference document exists at `docs/reference/spfx-surfaces/admin-recovery-boundary.md`

**T05 Complete:**
- [ ] Completion confirmation surface is specified (what is shown, when it appears, how it persists)
- [ ] "Open Project Hub" optional action is specified (link construction from provisioned site URL, no forced redirect)
- [ ] Post-completion states and next steps visible to requester/coordinator are defined
- [ ] `@hbc/workflow-handoff` composition for the handoff package is specified
- [ ] Reference document exists at `docs/reference/spfx-surfaces/completion-handoff-spec.md`

**T06 Complete:**
- [ ] Universal core summary fields (always visible to all roles) are enumerated
- [ ] Complexity tier assignments for every progressive-detail field are specified
- [ ] Cross-surface consistency rules are defined (same core, same tier meaning, across all four apps)
- [ ] `HbcComplexityGate` application patterns for each surface are documented
- [ ] Reference document exists at `docs/reference/spfx-surfaces/complexity-application-map.md`

**T07 Complete:**
- [ ] Desktop-first responsive spec is defined
- [ ] Tablet-safe requirements are defined per workflow
- [ ] Navigation composition rules between Estimating / Accounting / Admin / Project Hub are specified
- [ ] Failure mode catalog for all G4 surfaces is complete with degraded-behavior specs
- [ ] Reference document exists at `docs/reference/spfx-surfaces/responsive-failure-catalog.md`

**T08 Complete:**
- [ ] Test plan covers every surface defined in T01–T05
- [ ] Role/visibility verification strategy is defined for T06 rules
- [ ] Failure mode verification is defined for T07 catalog
- [ ] Pilot readiness gate is explicitly defined
- [ ] Test environment requirements are specified

**Group 4 Overall:**
- [ ] All seven reference documents are added to `current-state-map.md §2`
- [ ] G4 acceptance gate conditions do not require G3 contract gaps to be patched inside G4 — any gaps raised are captured as G3 amendments
- [ ] No G4 implementation task has begun without the G3 entry condition being satisfied
- [ ] ADR-0090 exists on disk before any G4 implementation begins

---

*End of W0-G4 — SPFx Surfaces and Workflow Experience Plan v1.0*
