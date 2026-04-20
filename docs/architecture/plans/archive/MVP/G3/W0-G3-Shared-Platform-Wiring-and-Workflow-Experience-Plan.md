# Wave 0 — Group 3: Shared-Platform Wiring and Workflow Experience Plan

> **Doc Classification:** Canonical Normative Plan — master umbrella plan for Wave 0 Group 3 (Shared-Platform Wiring and Workflow Experience). Governs `W0-G3-T01` through `W0-G3-T08`. Must be read before executing any Group 3 task plan.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — ready for implementation team review
**Governs:** `W0-G3-T01` through `W0-G3-T08`
**Read with:** `CLAUDE.md` v1.6 → `current-state-map.md` → `HB-Intel-Wave-0-Buildout-Plan.md` → G1 package → G2 package → this document → individual T01–T08 plans
**Wave 0 umbrella reference:** `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md`
**Validation basis:** `docs/architecture/plans/MVP/wave-0-validation-report.md`
**Next ADR available:** ADR-0114 (see G1 plan; G3 may produce ADR-0115 and beyond)
**Phase 7 gate:** ADR-0091 must exist on disk before G3 implementation proceeds (CLAUDE.md §6.3)

---

## 1. Purpose

### 1.1 Why Group 3 Exists

Groups 1 and 2 establish what gets provisioned — the contracts, the configuration decisions, the SharePoint site structure, the data foundations, the backend hardening. They answer: *what does the system build for a project?*

Group 3 exists to answer a different question: *how does the experience of requesting, tracking, and handng off a project setup feel to the people inside it?*

That is not a cosmetic question. The project setup workflow crosses multiple parties (requester, controller, admin), multiple state transitions, multiple time spans, and multiple possible failure paths. Without governing contracts for how the shared platform primitives wire into that lifecycle, each app surface will invent its own model for ownership, action visibility, notification routing, progress state, and history display. The result is an inconsistent, untrustworthy, and unmaintainable experience — even if each individual surface looks fine in isolation.

Group 3 exists to prevent that outcome. It defines:

- How `@hbc/step-wizard` governs the requester's guided setup flow
- How `@hbc/bic-next-move` and `@hbc/workflow-handoff` jointly represent ownership, expected action, and lifecycle handoffs with one canonical contract
- How the clarification loop uses guided return-to-flow rather than loose comment threading
- How `@hbc/notification-intelligence` fires awareness and action-required notifications as a function of lifecycle state — and what that wiring must look like so future `@hbc/my-work-feed` can consume it without rework
- How `@hbc/session-state` provides auto-save, draft-saved feedback, and resume behavior throughout the flow, including for clarification returns
- How `@hbc/complexity` governs progressive detail — summary-first, expandable, role-aware — without bespoke per-role view logic
- How these six shared packages integrate without conflict, what their failure modes are, and what degraded behavior looks like

Group 3 is the connective tissue between the provisioned structures G2 creates and the user surfaces G4 (SPFx) and G5 (PWA) will deliver. Without G3, G4 and G5 surface teams have no governing contracts for the experience layer.

### 1.2 Why Group 3 Is a Shared-Platform Wiring Group

Group 3 is explicitly **not** a backend data-model group. G2 owns the data model for workflow families. G3 consumes those outputs as contracts but does not extend them.

Group 3 is explicitly **not** a UI-delivery group. G4 (SPFx) and G5 (PWA) deliver the rendered surfaces. G3 does not introduce new pages, routes, or visual components. It specifies the contracts, wiring, and integration rules that the surface groups must follow.

Group 3 is explicitly **not** a My Work feature delivery. `@hbc/my-work-feed` is a future feature (SF-29 research stage; not yet interview-locked). G3 defines the hook points and contracts that will make My Work integration non-breaking when that feature ships. G3 does not stand up My Work UI, route My Work aggregation, or pretend My Work is implemented.

What G3 does produce:

- Governing contracts for how shared primitives are wired to the project setup lifecycle
- Integration rules that G4 and G5 must follow
- Notification registration specifications
- A My Work alignment contract (interface-level, not UI-level)
- A rigorous testing and verification plan for the shared-platform wiring

---

## 2. Governing Document Relationships

### Relationship to Wave 0 Umbrella Plan

`HB-Intel-Wave-0-Buildout-Plan.md` defines Group 3 as the shared-platform wiring tranche. Section **"GROUP 3 — Shared Platform Wiring and Workflow Experience"** maps to the eight tasks defined here. This plan refines and expands that mapping into implementation-guiding task plans.

This plan does not extend or override the Wave 0 umbrella. Conflicts between this plan and the umbrella must be surfaced as amendments — not silent overrides.

### Relationship to Validation Report

`wave-0-validation-report.md` established the corrected repo posture used as the baseline for Group 3 plans:

- Backend auth uses `DefaultAzureCredential` (Managed Identity), not MSAL OBO — all G3 plans use Managed Identity language consistently
- `@hbc/provisioning` package (frontend) contains the state machine with `NeedsClarification` as a confirmed lifecycle state — T03 is grounded in this real state
- The shared primitive packages (`@hbc/step-wizard`, `@hbc/bic-next-move`, `@hbc/notification-intelligence`, `@hbc/session-state`, `@hbc/workflow-handoff`, `@hbc/complexity`) are validated as implemented and built — G3 treats them as real contracts, not aspirational ones
- The project setup request form exists but is not yet wired to `@hbc/step-wizard` and lacks the `department` field — T01 governs this wiring

### Relationship to Group 1 Package

Group 1 locked the following decisions that Group 3 depends on:

- G1-D3 (Notification Delivery): `@hbc/notification-intelligence` is the mandatory platform seam — G3 must route all lifecycle notifications through it
- G1-D1 (Site Template Model): the provisioning flow the step-wizard governs is the one that produces the G1-specified site structure
- G1-D2 (Project Access Model): the three Entra ID groups (Leaders, Team, Viewers) define the ownership parties the BIC contract routes between
- G1-D6 (Auth Boundary): G3 must use `@hbc/auth` primitives for any authorization decision visible to the surface layer; G3 must not introduce parallel auth logic

### Relationship to MVP Project Setup Plan Set

The MVP Project Setup plan set (`docs/architecture/plans/MVP/project-setup/`) defines:

- T02: Data contracts and state model (`IProjectSetupRequest`, `IProvisioningStatus`, lifecycle states)
- T03: Controller gate and request orchestration (controller review surface, clarification request model, state transitions)
- T04: Estimating requester surfaces (intake form, progress UX, completion UX)
- T05: Provisioning orchestrator (idempotent saga, SignalR push, polling fallback, retry behavior)
- T08: Completion and getting-started experience

G3 is the wiring layer that makes those surfaces behave consistently. G3 does not replace or extend those task plans — it governs how the shared primitives integrate across them.

Specifically:

- T01 (G3) governs what T04 (project-setup) uses for guided setup UX
- T02 (G3) governs what T03 and T04 (project-setup) use for ownership and action display
- T03 (G3) governs how T03 (project-setup) handles the clarification loop in a guided way
- T04 (G3) governs how T03, T04, T07 (project-setup) fire and categorize notifications
- T05 (G3) governs how T04 (project-setup) persists and resumes form state
- T06 (G3) governs how T04 and T08 (project-setup) render summary and progressive detail

### Relationship to My Work Feature Decision

`docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md` defines `@hbc/my-work-feed` as a future platform feature (P2, research-stage). G3 must:

- Define the hook points that My Work will consume when it ships (event sources, BIC state aggregation, item model shape)
- Not stand up My Work UI or pretend that feature is active
- Not build bespoke one-off personal-inbox replacements that would conflict with the future My Work model
- Document the minimum interim hook points (what must be wired now to avoid rework when My Work ships)

---

## 3. Locked G3 Decisions

The following decisions were made during the business interview process and are locked inputs for all Group 3 task plans. They may not be reversed or materially altered during G3 planning without a superseding ADR.

### G3-D1 — Overall Workflow Experience

**Selection:** Both equally — a guided setup flow for the requester and a clearly owned work item after submission.

**Meaning:** The project setup experience has two phases with equal priority. Phase 1: the requester completes a multi-step guided intake form with clear progress, validation feedback, and resume capability (step wizard governs this). Phase 2: after submission, the request becomes a clearly owned, trackable work item with a visible current owner, expected action, and handoff chain (BIC + workflow handoff govern this). Neither phase may be treated as optional or secondary.

**Implications:** T01 governs Phase 1; T02 governs Phase 2. They must use the same underlying data — the work item that the BIC contract refers to is the same `IProjectSetupRequest` that the step wizard was used to create.

### G3-D2 — Clarification Loop

**Selection:** Hybrid model — visible work item in clarification state plus guided return into the setup flow for fixes.

**Meaning:** When the controller flags items needing clarification, the request does not become an opaque "back to you" message. The requester sees a clearly marked work item in `NeedsClarification` state (Phase 2 representation), and when they choose to act on it, they are guided back into the step wizard flow with the flagged sections marked (Phase 1 return). Previously-entered data is fully preserved. The clarification experience is not a separate form or a comment thread — it is a guided re-entry into the same flow.

**Implications:** T03 governs this. The clarification loop requires `@hbc/session-state` (preserved context), `@hbc/step-wizard` (guided return), and `@hbc/notification-intelligence` (action-required notification to requester). T03 must define exactly how flagged steps are identified, how the wizard reopens, and how resubmission works.

### G3-D3 — Action Visibility

**Selection:** One consistent action model across the request/workflow screen, `@hbc/notification-intelligence`, and future `@hbc/my-work-feed`.

**Meaning:** The "next action" that is shown to the current owner of the work item must be the same text, the same semantics, and the same deep-link whether the user sees it in the workflow detail view, in a notification, or in a My Work feed item. There must be one canonical action string per lifecycle state — not three separate ad hoc strings invented by each surface.

**Implications:** T02 must define the canonical action contract. T04 must show how notifications consume it. The My Work alignment section of T04 must explain how the contract stays consistent when My Work ships.

### G3-D4 — Save / Resume Behavior

**Selection:** Hybrid model — auto-save in background with visible draft-saved and resume behavior; same saved context reopened for clarification returns.

**Meaning:** As the requester fills out the setup form, their data is saved automatically without them having to think about it. However, the auto-save is not invisible — there is a visible draft-saved indicator. If the user leaves and returns, their previous state is resumed automatically. When the controller flags items for clarification, the requester returns to the same saved context — they do not start over.

**Implications:** T05 governs this. `@hbc/session-state` `useDraft` is the storage layer. The draft TTL must be appropriate for the multi-day workflow cycle (not a same-session assumption). T05 must distinguish transient navigation state from durable work state.

### G3-D5 — History Visibility

**Selection:** Simple summary by default, expandable full handoff/decision history.

**Meaning:** Every user — requester, controller, admin — sees a compact summary of the current request state without having to dig through logs. For those who need more, the full history of state transitions, handoff events, clarification exchanges, and decisions is available via an expandable panel. The summary must be complete enough to answer "where is this?" The expanded history must be complete enough to answer "how did it get here?" and "who did what?"

**Implications:** T06 governs this. The summary is universal; the expanded detail is gated by `@hbc/complexity` (Standard/Expert tier) and user action (explicit expand), not by role alone.

### G3-D6 — Role-Based Detail

**Selection:** Use `@hbc/complexity`; same core summary for everyone; deeper operational detail shown based on role/context/need; no bespoke hardcoded role-specific logic in each screen.

**Meaning:** The project setup workflow is visible to requesters, controllers, and admins. All see the same core summary (project name, status, current owner, expected action, key timestamps). Operational detail (saga step results, internal error diagnostics, Entra ID group IDs, raw error payloads) is shown progressively as the user's complexity tier increases. No screen should contain `if (role === 'controller') { showThis() }` logic — that is `@hbc/complexity`'s job.

**Implications:** T06 governs this. `HbcComplexityGate` components wrap operational detail. The complexity tier model (Essential / Standard / Expert) maps directly to what is visible at each level.

### G3-D7 — My Work Alignment

**Selection:** Hybrid model — define the full future-ready contract now, include only the minimum justified interim hook points now, do not invent placeholder UI to simulate My Work.

**Meaning:** G3 must produce a My Work alignment document that defines what data My Work will consume from the project setup lifecycle (BIC state, notification payloads, action item shapes). That contract must be stable so My Work can consume it when it ships without requiring G3 rework. However, G3 must not build any My Work UI, and must not introduce bespoke "personal inbox" or "your work" surfaces as stopgaps. The `@hbc/bic-next-move` module registry hook is the minimum justified interim hook point.

**Implications:** T04 governs this. The interim hook point is `registerBicModule()` for the provisioning module, so that My Work can aggregate provisioning-owned work items when it ships.

### G3-D8 — Notification Categorization

**Selection:** Explicitly separate awareness/informational notifications from action-required notifications.

**Meaning:** Every notification in the project setup lifecycle must be classified as either action-required (`immediate` tier in `@hbc/notification-intelligence`) or awareness/informational (`watch` or `digest` tier). Action-required notifications (e.g., clarification requested, provisioning failed) must use `tierOverridable: false` so users cannot downgrade them to digest. Awareness notifications (e.g., provisioning completed, handoff acknowledged) are `watch` tier and user-overridable. This classification must be explicit in the notification registration specs, not left to individual surface implementations.

**Implications:** T04 must produce the full notification registration spec table with tier and `tierOverridable` for every project setup lifecycle event.

### G3-D9 — G3 Scope Boundary

**Selection:** G3 is a shared-platform integration group — not a backend data-model group, not a raw UI-polish group, not a replacement for future My Work feature delivery.

**Meaning:** G3 does not introduce new SharePoint lists (G2 scope). G3 does not introduce new API endpoints (G2/G4/G5 scope). G3 does not deliver finished SPFx webparts (G4 scope) or PWA pages (G5 scope). G3 produces implementation contracts, wiring specifications, integration rules, and testing governance that G4 and G5 consume.

---

## 4. Shared Primitive Map

The following six shared packages are the governing design seams for Group 3. Each has a defined responsibility boundary. No G3 task may reassign responsibilities between packages without an ADR.

### `@hbc/step-wizard`

**Governing source:** `packages/step-wizard/src/` — validated as implemented
**Layer:** Platform Primitive (Layer 5 in the 11-layer architecture)
**G3 responsibility:** Governs the multi-step guided setup form experience for the requester. Owns step ordering, step validation, step-level progress state, BIC assignee per step, and draft persistence via `@hbc/session-state`. Does **not** own the lifecycle state of the underlying `IProjectSetupRequest` — that is `@hbc/provisioning`'s concern.
**Key exports used:** `useStepWizard(config, item)`, `IStepWizardConfig<T>`, `IStep<T>`, `HbcStepWizard`, `HbcStepProgress`, `HbcStepSidebar`

### `@hbc/bic-next-move`

**Governing source:** `packages/bic-next-move/src/` — validated as implemented
**Layer:** Platform Primitive (Layer 5)
**G3 responsibility:** Governs ownership representation for the project setup work item. Answers: who has the ball right now? what must they do? when is it due? is it blocked? Provides the canonical `IBicNextMoveState` that all three surfaces (workflow screen, notification, My Work) use to render ownership.
**Key exports used:** `useBicNextMove(item, config)`, `IBicNextMoveConfig<T>`, `IBicNextMoveState`, `registerBicModule()`, `HbcBicBadge`, `HbcBicDetail`, `HbcBicBlockedBanner`

### `@hbc/workflow-handoff`

**Governing source:** `packages/workflow-handoff/src/` — validated as implemented
**Layer:** Platform Primitive (Layer 5)
**G3 responsibility:** Governs cross-module handoffs in the project setup lifecycle. The primary G3-scoped handoff is Estimating (setup request completed) → Project Hub (project workspace initialized). Owns the handoff package assembly, pre-flight validation, recipient confirmation, and status lifecycle (`draft → sent → received → acknowledged | rejected`). Does **not** own the lifecycle state before handoff is initiated.
**Key exports used:** `usePrepareHandoff()`, `useHandoffInbox()`, `IHandoffConfig<S,D>`, `IHandoffPackage<S,D>`, `HbcHandoffComposer`, `HbcHandoffReceiver`, `HbcHandoffStatusBadge`

### `@hbc/notification-intelligence`

**Governing source:** `packages/notification-intelligence/src/` — validated as implemented
**Layer:** Platform Primitive (Layer 5)
**G3 responsibility:** Governs all notification events in the project setup lifecycle. Owns the three-tier model (`immediate` / `watch` / `digest`), channel routing, and the `NotificationRegistry`. G3 must register all project setup notification event types via `NotificationRegistry.register()` and specify the full event payload for each. Does **not** own email delivery mechanism (backend Azure Function pipeline owns delivery).
**Key exports used:** `NotificationRegistry.register()`, `NotificationApi.send()`, `INotificationRegistration`, `NotificationSendPayload`, `useNotificationCenter()`

### `@hbc/session-state`

**Governing source:** `packages/session-state/src/` — validated as implemented
**Layer:** Platform Primitive (Layer 5)
**G3 responsibility:** Governs draft persistence, auto-save, resume behavior, and offline operation queuing for the setup form. Owns the IndexedDB storage layer, draft TTL management, and connectivity state. Does **not** own the form rendering or validation — that is the consuming surface's responsibility. Does **not** own the provisioning lifecycle state — that is `@hbc/provisioning`'s concern.
**Key exports used:** `useDraft<T>(key, ttlHours?)`, `useSessionState()`, `useConnectivity()`, `HbcConnectivityBar`, `HbcSyncStatusBadge`

### `@hbc/complexity`

**Governing source:** `packages/complexity/src/` — validated as implemented (P1 test package)
**Layer:** Platform Primitive (Layer 5)
**G3 responsibility:** Governs progressive detail disclosure across all workflow and summary views. Owns the tier model (`essential` / `standard` / `expert`), role-to-tier mapping, tier locking, and the `HbcComplexityGate` declarative wrapper. Does **not** own any domain-specific field definitions — the surface that uses `HbcComplexityGate` decides what content to wrap.
**Key exports used:** `useComplexity()`, `HbcComplexityGate`, `HbcComplexityDial`, `useComplexityGate()`

### Future `@hbc/my-work-feed`

**Status:** Research-stage feature (SF-29). Not yet interview-locked. Not yet implemented.
**G3 responsibility:** G3 must define the hook points and data contracts that `@hbc/my-work-feed` will consume from the project setup lifecycle. The minimum justified interim hook point is the `registerBicModule()` call in the provisioning module. All other My Work integration is contract-definition-only during G3. G3 must not stand up any My Work UI surface.
**G3 output:** My Work alignment contract document (`docs/reference/workflow-experience/my-work-alignment-contract.md`)

---

## 5. Dependency and Boundary Doctrine

The following boundaries are binding for all Group 3 work. Any proposed change that crosses a boundary requires an ADR before proceeding.

### `@hbc/provisioning` — Lifecycle Owner, Not G3's to Modify

`@hbc/provisioning` owns the canonical `IProjectSetupRequest` lifecycle state machine. The provisioning package defines the states (`Draft`, `Submitted`, `UnderReview`, `NeedsClarification`, `AwaitingExternalSetup`, `ReadyToProvision`, `Provisioning`, `Completed`, `Failed`), the allowed transitions, and the ownership derivation function `deriveCurrentOwner()`.

G3 must not modify `@hbc/provisioning` source to satisfy G3 requirements. G3 specifies integration contracts that are applied in G4/G5 consuming surfaces. If G3 reveals a gap in the provisioning package's state model, surface it as an amendment proposal with an ADR requirement — do not silently patch.

G3 **may** specify:
- Which provisioning lifecycle states map to which BIC ownership configurations (owned by a G3 configuration, applied in a consuming surface)
- Which state transitions fire which notification events (specified in T04, registered in a consuming surface)
- How the step wizard `IStepWizardConfig` maps to the provisioning request model (T01)

### `@hbc/auth` — Auth Seam, Not G3's to Redesign

All authorization decisions visible to the surface layer must use `@hbc/auth` primitives (`RoleGate`, `FeatureGate`, `usePermissionStore`, `useAuthStore`). G3 must not introduce parallel role-check logic or custom `if (role === 'x')` guards in any integration contract.

Where G3 integration contracts require knowing the current user's role context (e.g., what detail level to show the current user), `@hbc/complexity` is the governing seam — not raw role inspection. Role-to-complexity-tier mapping is defined in the complexity package's config (`src/config/roleComplexityMap.ts`).

### `@hbc/notification-intelligence` — Mandatory Notification Seam

Per G1-D3, all provisioning lifecycle notifications must flow through `@hbc/notification-intelligence`. G3 must not propose any bespoke email dispatch, out-of-band notification pipeline, or notification logic that bypasses the `NotificationRegistry.register()` / `NotificationApi.send()` contract. Gaps in the notification package's capabilities (e.g., missing event types) must be resolved by registering new event types — not by building parallel delivery logic.

### `@hbc/complexity` — Role-Context Progressive Detail Seam

G3 must not introduce bespoke hardcoded role-specific rendering logic. All decisions about what operational detail to show at what level of user experience must be expressed through `HbcComplexityGate` components with explicit `minTier` / `maxTier` props. This applies to:
- Summary vs. detail views (T06)
- Notification preferences depth (T04)
- BIC detail vs. compact badge (T02)
- History expansion (T06)
- Diagnostic information (T07)

### Future `@hbc/my-work-feed` — Contract Now, Implementation Later

G3 must produce the My Work alignment contract without building My Work UI. Any surface that acts as a stopgap "personal queue" or "my items" list for the project setup workflow violates the scope boundary. The correct interim behavior is: the `@hbc/bic-next-move` badge and detail components show the user what they own and need to act on. That is sufficient until My Work ships.

---

## 6. Task Sequencing Rationale

The eight Group 3 tasks are ordered to build contracts before their consumers, primitives before their integrations, and individual concerns before their failure-mode analysis.

| Task | Name | Produces | Unlocks |
|------|------|----------|---------|
| T01 | Guided Flow and Step-Wizard Integration | Step-wizard config contract for setup form | T03 (clarification re-entry), T05 (draft keys), T07 (wizard failure modes) |
| T02 | Ownership, Next Action, and Handoff Contract | BIC config contract; canonical action contract; handoff route spec | T03 (clarification ownership), T04 (action model for notifications), T06 (summary ownership display), T07 (ownership failure modes) |
| T03 | Clarification Loop and Return-to-Flow Behavior | Clarification state integration spec; re-entry rules | T04 (clarification notification spec), T07 (clarification failure modes) |
| T04 | Notification Intelligence and My Work Alignment | NotificationRegistration specs table; My Work alignment contract | T07 (notification failure modes), T08 (notification tests) |
| T05 | Session State, Draft, Save, and Resume Contract | Draft key registry; auto-save spec; resume contract | T07 (session-state failure modes), T08 (draft/resume tests) |
| T06 | Summary View, Expandable History, and Complexity Rules | Complexity gate spec table; summary field registry | T07 (complexity integration rules), T08 (complexity tests) |
| T07 | Shared Primitive Integration Rules, Failure Modes, and Validation | Complete integration validation checklist; failure mode catalog | T08 (failure-mode tests), G4 and G5 entry conditions |
| T08 | Testing and Verification | Full test plan for shared-platform wiring | G4/G5 pilot readiness |

### Why This Order

T01 and T02 must come first because every subsequent task depends on knowing what the step-wizard governs (T01) and what the ownership contract is (T02). T03 depends on both because clarification is a re-entry into the wizard (T01) with an ownership transition (T02). T04 depends on T02 for the canonical action string that notifications carry. T05 is largely independent but benefits from knowing the draft keys T01 introduces. T06 depends on T02 for the ownership summary fields. T07 must come after all individual integration tasks are specified, because its job is to validate that all six integrations work without conflict. T08 comes last because it can only write rigorous tests after all contracts are defined.

### Group 4/5 Entry Condition

G4 (SPFx surfaces) and G5 (PWA surfaces) may not begin implementation of project setup UX until all of the following G3 conditions are satisfied:

1. T01 is locked: `IStepWizardConfig` for the setup form is defined and stable
2. T02 is locked: BIC config and canonical action contract are defined and stable
3. T03 is locked: clarification re-entry rules are defined
4. T04 is locked: `INotificationRegistration` specs are complete and approved
5. T05 is locked: draft key registry and resume contract are defined
6. T06 is locked: complexity gate spec table is defined
7. T07 is locked: shared primitive integration rules and failure mode catalog are defined
8. T08 exists: test plan is written (tests do not need to pass yet — that happens during G4/G5)

---

## 7. Required Supporting Artifacts

Group 3 produces **governing contracts** and **reference documents**. The expected outputs are:

| Artifact | Location | Produced by | Consumed by |
|----------|----------|-------------|-------------|
| Step-wizard config contract for project setup | `docs/reference/workflow-experience/setup-wizard-contract.md` | T01 | G4 Estimating app, G5 PWA |
| BIC config + canonical action contract | `docs/reference/workflow-experience/bic-action-contract.md` | T02 | G4/G5 all surfaces showing ownership |
| Handoff route specification | `docs/reference/workflow-experience/setup-handoff-routes.md` | T02 | G4/G5 Project Hub handoff receiver |
| Clarification re-entry integration spec | `docs/reference/workflow-experience/clarification-reentry-spec.md` | T03 | G4 Estimating app (requester path) |
| Notification registration table | `docs/reference/workflow-experience/setup-notification-registrations.md` | T04 | G4/G5 notification wiring, backend pipeline |
| My Work alignment contract | `docs/reference/workflow-experience/my-work-alignment-contract.md` | T04 | Future `@hbc/my-work-feed` integration |
| Draft key registry and resume contract | `docs/reference/workflow-experience/draft-key-registry.md` | T05 | G4 Estimating app, G5 PWA |
| Complexity gate spec table | `docs/reference/workflow-experience/complexity-gate-spec.md` | T06 | G4/G5 all progressive-detail surfaces |
| Shared primitive integration validation checklist | `docs/reference/workflow-experience/primitive-integration-checklist.md` | T07 | G4/G5 implementation gate |

All nine reference documents must be added to `current-state-map.md §2` upon creation using document class "Reference."

### ADR Inputs

G3 may produce inputs for the following ADRs (to be drafted as decisions are locked):

- **ADR-0115**: My Work alignment hook points (documents the minimum interim hook decision from T04)
- **ADR-0116** (conditional): If T07 reveals a conflict between shared primitive contracts that cannot be resolved by wiring rules alone, the conflict resolution requires an ADR before G4/G5 implementation proceeds

---

## 8. Acceptance Gate

Group 3 is complete when all of the following conditions are satisfied:

**T01 Complete:**
- [ ] `IStepWizardConfig<IProjectSetupRequest>` specification is defined with all step definitions, validation functions, order mode, and draft key
- [ ] Clarification re-entry behavior at the step level is specified (which steps are flagged, how the wizard reopens)
- [ ] Boundaries between wizard behavior and provisioning lifecycle state are explicitly stated
- [ ] Reference document exists at `docs/reference/workflow-experience/setup-wizard-contract.md`

**T02 Complete:**
- [ ] `IBicNextMoveConfig<IProjectSetupRequest>` is specified with all 8 resolver functions for every lifecycle state
- [ ] Canonical action string table is complete (one action string per lifecycle state, for both `expectedAction` and notification body)
- [ ] `IHandoffConfig<IProjectSetupRequest, IProjectRecord>` is specified for the Estimating → Project Hub handoff route
- [ ] Reference documents exist at `docs/reference/workflow-experience/bic-action-contract.md` and `docs/reference/workflow-experience/setup-handoff-routes.md`

**T03 Complete:**
- [ ] Clarification state representation is defined (how `NeedsClarification` is visually distinct from other states)
- [ ] Return-to-flow re-entry rules are specified (which step the wizard reopens to, how flagged sections are marked)
- [ ] Data preservation contract is defined (what draft state is preserved, what must be cleared)
- [ ] Resubmission flow is specified (what the controller sees after requester resubmits)
- [ ] Reference document exists at `docs/reference/workflow-experience/clarification-reentry-spec.md`

**T04 Complete:**
- [ ] `INotificationRegistration` spec is complete for every project setup lifecycle event
- [ ] Tier classification (immediate/watch/digest) and `tierOverridable` flag are assigned to every event
- [ ] Action-required vs. awareness categories are explicitly distinguished in the registration table
- [ ] My Work alignment contract is complete (hook points, item model shape, source enumeration)
- [ ] `registerBicModule()` call spec for the provisioning module is defined
- [ ] Reference documents exist at `docs/reference/workflow-experience/setup-notification-registrations.md` and `docs/reference/workflow-experience/my-work-alignment-contract.md`

**T05 Complete:**
- [ ] Draft key registry is complete (one key per saveable surface, with TTL and content scope)
- [ ] Auto-save implementation spec is defined (trigger conditions, debounce, feedback)
- [ ] Resume behavior is specified (what is restored, what is re-derived, what is cleared)
- [ ] Clarification-return same-context behavior is specified
- [ ] Transient vs. durable state distinction is documented
- [ ] Reference document exists at `docs/reference/workflow-experience/draft-key-registry.md`

**T06 Complete:**
- [ ] Core summary fields (always visible) are enumerated
- [ ] Expandable history levels are defined (what each expansion level shows)
- [ ] Complexity gate spec table is complete (field-by-field, tier-by-tier)
- [ ] Reference document exists at `docs/reference/workflow-experience/complexity-gate-spec.md`

**T07 Complete:**
- [ ] Shared primitive integration rules are defined (no overlap between packages, no conflict)
- [ ] Failure mode catalog is complete (one entry per identified failure mode with degraded-behavior spec)
- [ ] Package boundary drift risks are enumerated and mitigated
- [ ] Reference document exists at `docs/reference/workflow-experience/primitive-integration-checklist.md`

**T08 Complete:**
- [ ] Test plan exists with test IDs for every major contract assertion
- [ ] Pilot readiness gate is defined (what must pass before G4/G5 surfaces are considered ready for pilot)
- [ ] Test environment requirements are specified

**Group 3 Overall:**
- [ ] All nine reference documents are added to `current-state-map.md §2`
- [ ] G4 and G5 implementation entry conditions are satisfied (all eight T01–T08 conditions above)
- [ ] No G4 or G5 implementation tasks are started without G3 contracts in place

---

*End of W0-G3 — Shared-Platform Wiring and Workflow Experience Plan v1.0*
