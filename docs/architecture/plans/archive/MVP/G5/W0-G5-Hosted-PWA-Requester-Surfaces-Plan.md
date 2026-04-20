# Wave 0 — Group 5: Hosted PWA Requester Surfaces Plan

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 5 execution planning document. Governs the hosted PWA requester-facing surfaces for Wave 0. This plan refines and expands the high-level G5 sketch in `HB-Intel-Wave-0-Buildout-Plan.md` into a full implementation-governing plan package.
>
> **Governing sources:** `CLAUDE.md` → `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` → this document → task plans T01–T08 in `docs/architecture/plans/MVP/G5/`.
>
> **Not present-state truth.** For current implementation status see `docs/architecture/blueprint/current-state-map.md`.

**Version:** 1.0
**Date:** 2026-03-15
**Status:** Proposed — requires product owner and architecture owner review before execution
**Stream:** Wave 0 / Group 5
**Scope:** Hosted PWA requester-facing surfaces (requester parity, guided setup, save/resume, status, clarification return, completion handoff)

---

## 1. Purpose

### Why Group 5 Exists

Group 5 delivers the hosted PWA requester-facing surfaces for Wave 0. The Wave 0 program establishes the foundation for HB Intel's multi-surface platform: an SPFx surface embedded in SharePoint (Groups 1–4) and a standalone hosted PWA running in the browser (Groups 5–6). Group 5 is the part of Wave 0 that makes the requester workflow available to users who access HB Intel outside of SharePoint.

The hosted PWA serves requesters who need to:
- Initiate a project setup request without being in SharePoint
- Complete guided request entry on a tablet, laptop, or phone browser
- Save draft progress and resume later without losing work
- Monitor the status of their submitted request
- Return to a clarification prompt and provide the information the workflow needs to continue

Without Group 5, the Wave 0 platform is SharePoint-only. A significant portion of the target user population — project managers and requesters who work primarily in a browser, on a tablet at a job site, or who do not navigate through SharePoint regularly — cannot access the requester workflow. Group 5 closes that gap.

### Why It Must Remain a Bounded Requester Surface

Group 5 is deliberately scoped to the requester experience only. It is not a parallel operating platform. It does not replicate controller/admin surfaces, provisioning management dashboards, or coordinator review flows. The SPFx surface and Project Hub remain the authoritative destinations for controller, admin, and post-completion workflow activity.

Making Group 5 a second full operating platform in Wave 0 would:
- Duplicate implementation investment that belongs in later groups
- Create competing "source of truth" experiences before the platform is stable
- Blur the architectural boundary between the hosted PWA and Project Hub
- Require parity maintenance across three surfaces simultaneously (SPFx + PWA + Project Hub) with no clear governance

The Wave 0 posture for Group 5 is: **real hosted value, bounded requester scope**. Requesters can do everything they need to do. Controllers, admins, and coordinators continue to use SPFx and Project Hub.

---

## 2. Relationship to Governing Sources

### CLAUDE.md

This plan operates under the authority hierarchy and working rules defined in `CLAUDE.md`. Specifically:
- The package boundary doctrine in `.claude/rules/03-package-boundaries.md` governs which shared packages Group 5 may consume and how.
- The implementation quality standard in `.claude/rules/05-implementation-quality.md` governs the code quality bar for all Group 5 implementation work.
- The documentation standard in `.claude/rules/04-documentation-standards.md` governs documentation obligations during and after task execution.
- The authority hierarchy in `CLAUDE.md §Authority hierarchy` resolves any conflict between this plan and other governing sources.

### Wave 0 Buildout Plan

`docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` defines Group 5 at the sketch level as **"PWA Parallel Surfaces"** (§GROUP 5, lines G5.1–G5.4). This plan package is the complementary detailed plan for that stream, as directed in the Wave 0 plan: *"For Wave 0 streams not covered by T01–T08, a complementary branch plan should be created."*

This plan expands the Wave 0 sketch with a requester-surfaces framing, fuller task decomposition, shared feature gate checks, and implementation guidance. Where this plan provides greater specificity than the Wave 0 sketch, this plan governs. Where this plan is silent, the Wave 0 plan governs. Neither document supersedes `current-state-map.md` as present-state truth.

The Wave 0 sketch items map to this plan as follows:

| Wave 0 Sketch | This Plan |
|---|---|
| G5.1: PWA `/project-setup` route (Step Wizard flow) | T01 + T02: Guided setup surface + parity contract |
| G5.2: PWA `/projects` provisioning status page | T01 (status visibility) + T05 (completion handoff) |
| G5.3: PWA RBAC app visibility | T07: Integration rules and boundaries |
| G5.4: PWA offline handling (session-state cache) | T03 (draft/resume) + T04 (interruption/reconnecting) |

### Local G5 Plan Set

The task plans T01–T08 in this directory are the detailed execution documents. This master plan governs all of them. Task plans must not contradict this master plan; if a task plan provides more specific guidance on a point this plan addresses at the principle level, the task plan governs that detail.

---

## 3. Locked G5 Decisions

The following decisions are locked inputs for all Group 5 implementation. They may only be changed by an explicit product owner or architecture owner directive that supersedes this plan.

**LD-01 — Wave 0 PWA scope is core requester parity only.**
The hosted PWA must support: starting a new request, basic guided request entry via Step Wizard, save/resume, status visibility for the requester's own requests, and clarification return for requester-side fixes. The hosted PWA does not need controller or admin parity in Wave 0.

**LD-02 — Same underlying workflow contract as SPFx requester experience.**
The hosted PWA must deliver the same workflow contract: same lifecycle states, same required requester actions, same step sequence meaning, same clarification-return contract. Presentation may be lighter where appropriate for a hosted/web context. Workflow semantics are not negotiable.

**LD-03 — Hybrid resilience model: primarily online, interruption-safe drafts.**
The hosted PWA is primarily online. Draft progress must be protected from common interruptions (tab close, refresh, brief connectivity loss) using `@hbc/session-state`. Offline/reconnecting state must be clearly surfaced. The hosted PWA does not promise full offline workflow completion in Wave 0. Requesters can always see their draft when they return; they cannot necessarily submit or retrieve live status without connectivity.

**LD-04 — Completion summary in PWA, optional Project Hub handoff in new tab.**
After a request is submitted and moves to a terminal state, the hosted PWA shows a completion summary. The summary includes an optional link to open Project Hub in a new tab for requesters who want to follow up. There is no forced redirect. There is no competing project-home concept in the hosted PWA in Wave 0.

**LD-05 — Project Hub is the canonical destination after completion.**
The hosted PWA does not attempt to replace Project Hub as the place where requesters monitor long-term project activity. The PWA's post-completion posture is: confirm the outcome, surface the optional handoff link, and step aside.

**LD-06 — Tablet-safe and phone-friendly for key requester actions.**
The hosted PWA requester surfaces must work on a tablet without horizontal scrolling or broken layouts. Key requester actions (start request, complete a step, save draft, submit, return a clarification response) must be comfortably usable on a phone browser. Full mobile feature parity with desktop is not required in Wave 0.

**LD-07 — Install-ready but not install-dependent.**
The hosted PWA must be installable as a Progressive Web App (PWA manifest, service worker). However, the browser remains the primary supported path. Users must never be required to install the PWA to access requester functionality. Install prompts must not block the workflow.

**LD-08 — Layered interruption visibility.**
Important trust signals (online/offline/degraded status, draft-saved confirmation, pending operation count) must always be visible at a glance. Deeper technical detail (operation queue contents, retry counts, specific error messages) must be accessible but not displayed by default.

**LD-09 — Coordinator visibility in the hosted PWA is future-ready only.**
No coordinator-specific Wave 0 behavior in the hosted PWA. The architecture must not prevent coordinator surfaces from being added in a later group, but no coordinator UI, coordinator routing, or coordinator data fetch is implemented in Wave 0.

**LD-10 — G5 scope boundary: hosted requester surfaces only.**
Group 5 is not a controller/admin parity group. It is not a second full operating surface competing with SPFx or Project Hub in Wave 0. Any scope that pushes beyond the requester workflow belongs to a later group or a different stream.

---

## 4. Hosted Surface Map

### Surface Roles in Wave 0

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPFx (SharePoint-embedded)                   │
│  Requester parity reference surface                             │
│  G4: Full project setup wizard, Step Wizard, clarification UX   │
│  Canonical for workflow contract definition                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ same workflow contract
                          │ lighter presentation allowed
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Hosted PWA (browser-first)                      │
│  G5: Requester-facing surfaces                                  │
│  - Guided setup surface (start request, enter details)          │
│  - Draft / save / resume                                        │
│  - Status visibility (own requests)                             │
│  - Clarification return                                         │
│  - Completion summary + optional Project Hub link               │
│  - Tablet-safe / phone-friendly                                 │
│  - Install-ready but not install-dependent                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ optional post-completion link
                          │ new tab, no forced redirect
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Project Hub                                │
│  Canonical post-completion destination                          │
│  Full project activity, records, documents, collaboration       │
│  G5 defers to Project Hub — does not compete with it            │
└─────────────────────────────────────────────────────────────────┘
```

### What the Hosted PWA Is

The hosted PWA is the browser-accessible, installable entry point for requesters who access HB Intel outside SharePoint. In Wave 0, it delivers the guided project setup request workflow end-to-end: from first entry through clarification handling through completion handoff. It uses the same shared packages as the SPFx surface and preserves the same workflow semantics.

### What the Hosted PWA Is Not (Wave 0)

- Not a controller surface. Controllers use SPFx.
- Not an admin surface. Admins use SPFx.
- Not a coordinator surface. Coordinator UI is future-ready-only in Wave 0.
- Not a replacement for Project Hub. Project Hub is the canonical post-completion home.
- Not a full offline-capable platform. Drafts are protected offline; full workflow is online-dependent.

---

## 5. Dependency and Boundary Doctrine

### Shared Feature Packages Required by Group 5

The following packages in `packages/` are directly relevant to Group 5 implementation. Each is evaluated for readiness in Section 6.

| Package | Path | G5 Role |
|---|---|---|
| `@hbc/step-wizard` | `packages/step-wizard/` | Powers the guided request entry workflow (T01, T02) |
| `@hbc/session-state` | `packages/session-state/` | Draft persistence, connectivity status, offline queue (T03, T04) |
| `@hbc/provisioning` | `packages/provisioning/` | Provisioning API client, BIC config, failure modes (T01, T05, T07) |
| `@hbc/auth` | `packages/auth/` | Authentication, permission enforcement, RBAC visibility (T01, T07) |
| `@hbc/workflow-handoff` | `packages/workflow-handoff/` | Cross-module handoff contract at completion (T05) |
| `@hbc/ui-kit` | `packages/ui-kit/` | All reusable visual primitives — Group 5 must not create competing components |

### Additional Relevant Packages

| Package | Path | G5 Relevance |
|---|---|---|
| `@hbc/notification-intelligence` | `packages/notification-intelligence/` | Clarification-return notifications surfaced to requester (T03) |
| `@hbc/smart-empty-state` | `packages/smart-empty-state/` | Empty state handling when requester has no requests (T01) |
| `@hbc/models` | `packages/models/` | Shared domain types for project requests, provisioning records |
| `@hbc/query-hooks` | `packages/query-hooks/` | Data-fetching patterns for PWA requester views |
| `@hbc/app-shell` | `packages/app-shell/` | PWA app shell, navigation, connectivity banner mounting point |

### Not a Dependency — But a Forward-Compatibility Constraint: `@hbc/my-work-feed`

`@hbc/my-work-feed` (described in `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`) does **not exist** as a package and is **not a Wave 0 G5 dependency**. It is a Priority Tier 2 Application Layer feature that is not yet interview-locked.

However, it is a **forward-compatibility constraint** on the design of the G5 status list and clarification-return affordances. The feature doc's explicit P1 warning applies: *"should be implemented before personal-work UX diverges across modules."*

`@hbc/my-work-feed` is the platform's planned canonical personal work orchestration surface: it aggregates BIC items, handoffs, acknowledgments, and provisioning-state signals into a ranked, explainable, cross-module feed. If G5 builds a bespoke requester inbox with its own prioritization logic, badge aggregation, and action-row components, that creates exactly the module-level divergence the package is designed to prevent — and retrofitting My Work Feed into that inbox later would require structural rework.

**The G5 design constraint:** the requester status list and clarification-action affordances must be thin, composable views over `@hbc/provisioning` data. Do not embed prioritization logic, badge aggregation, or multi-source action ranking in the G5 status list. Keep the list a filtered provisioning data view, structured so a future My Work Feed surface can feed or supplement it without reworking the G5 implementation.

### What Group 5 May Change

- `apps/pwa/src/pages/` — add requester-specific page components
- `apps/pwa/src/features/` — add requester feature modules
- `apps/pwa/src/router/` — add `/project-setup` and `/projects` routes
- `apps/pwa/src/routes/` — route definitions
- Consume (but not modify) shared packages listed above

### What Group 5 Must Not Redesign

- The `@hbc/step-wizard` component behavior — consume it as-is
- The `@hbc/session-state` persistence protocol — consume its hooks; do not build parallel draft storage
- The `@hbc/provisioning` API client contract — do not create a competing API layer
- Any component already in `@hbc/ui-kit` — do not duplicate visual primitives in the PWA
- The workflow lifecycle states defined in the provisioning package — the PWA must respect them, not reinterpret them
- Project Hub's routing namespace or data ownership

---

## 6. Shared Feature No-Go Summary

This section summarizes the readiness of each required shared feature package. Task plans must not proceed past their gate check if a required package is absent or insufficiently mature.

### Package Readiness Assessment

| Package | Status | Assessment | Tasks Gated |
|---|---|---|---|
| `@hbc/step-wizard` | **Implemented — assess maturity before T01** | Package exists with types, state machine, hooks, and components. Source structure indicates substantive implementation. README was not found; maturity requires verification against T01 acceptance criteria during T01 gate check. | T01, T02 |
| `@hbc/session-state` | **Implemented — ready for consumption** | Package exists with full structure (db, context, hooks, sync), a clear README showing provider/hooks pattern, and documented interface contracts. Assessed as ready for draft persistence, connectivity status, and queue operations. | T03, T04 |
| `@hbc/provisioning` | **Implemented — assess maturity before T01** | Package exists with API client, BIC config, failure modes, and complexity gate helpers. Maturity relative to T01 route requirements requires verification during T01 gate check. | T01, T05, T07 |
| `@hbc/auth` | **Implemented — assess maturity before T01** | Package exists with full source structure. RBAC visibility and permission store readiness require verification against T07 integration requirements during gate check. | T01, T07 |
| `@hbc/workflow-handoff` | **Implemented — assess maturity before T05** | Package exists with examples and e2e tests suggesting reasonable maturity. Handoff contract readiness for post-completion PWA use case requires T05 gate check. | T05 |
| `@hbc/ui-kit` | **Present — boundary rule only** | Visual primitives belong here. G5 consumes it; does not extend it except via proper ui-kit contribution process. | All tasks (boundary rule) |
| `@hbc/notification-intelligence` | **Present — assess before T03** | Package exists. Clarification notification routing to PWA requires T03 gate check. | T03 |
| `@hbc/my-work-feed` | **Not implemented — forward-compatibility constraint only** | Package does not exist (Tier 2, not yet interview-locked). Not a G5 dependency. G5 status list must be designed as a thin provisioning data view so a future My Work Feed surface can feed or supplement it without structural rework. See Section 5. | No tasks gated — design constraint only |

### Tasks Requiring Active Gate Checks

- **T01** gates on `@hbc/step-wizard` and `@hbc/provisioning` and `@hbc/auth` maturity
- **T02** gates on `@hbc/step-wizard` maturity (parity contract depends on Step Wizard behavior being stable)
- **T03** gates on `@hbc/session-state` (assessed ready) and `@hbc/notification-intelligence` (requires check)
- **T04** gates on `@hbc/session-state` (assessed ready)
- **T05** gates on `@hbc/workflow-handoff` and `@hbc/provisioning` maturity
- **T06** gates on PWA manifest and service worker infrastructure (assess `apps/pwa/` configuration)
- **T07** gates on `@hbc/auth` RBAC and `@hbc/provisioning` failure mode coverage
- **T08** gates on all upstream tasks (testing cannot complete before implementation does)

---

## 7. Task Sequencing

### Sequence Rationale

```
T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08
```

**T01 first** because all other tasks depend on the hosted requester entry surface existing. If requesters cannot get into the guided workflow, nothing else in G5 has a surface to build on.

**T02 before T03** because the parity contract must be locked before draft/save/resume behavior is specified. The draft payload shape depends on the step structure, which T02 defines as part of the parity contract.

**T03 before T04** because clarification-return behavior (T03) is part of the durable workflow state that interruption handling (T04) must protect.

**T04 before T05** because trust-state visibility (T04) must be resolved before the completion summary (T05) can be specified. The completion surface must be consistent with the trust/connectivity model established in T04.

**T05 before T06** because the mobile posture (T06) applies across all surfaces defined in T01–T05. T06 can only be properly verified once those surfaces exist.

**T06 before T07** because integration rules (T07) include failure modes for the install posture and mobile access paths that T06 defines.

**T08 last** because testing verifies all prior tasks. T08 cannot be meaningfully specified or executed until T01–T07 define what must be tested.

### Later-Group Entry Conditions

Group 5 must be substantially complete before any of the following can proceed:
- Coordinator view in the hosted PWA (later group — no Wave 0 work)
- Admin surfaces in the hosted PWA (out of G5 scope entirely)
- Any G5 surface used as a foundation for cross-module requester workflows beyond project setup

---

## 8. Required Supporting Artifacts

The following artifacts should result from Group 5 execution:

1. **Requester parity contract document** — a locked table of workflow states, required actions, and lifecycle meanings that are identical between SPFx and PWA. Created during T02; used by T01–T07 and by future groups building on the PWA surface.

2. **Draft payload type definition** — a typed schema for the request draft structure that `@hbc/session-state` persists. Created during T03; must be in a shared-accessible location.

3. **Clarification-return routing spec** — a description of how the hosted PWA routes an incoming clarification notification to the correct step in the active request flow. Created during T03.

4. **Trust-state visibility inventory** — a list of trust signals and their display rules (always-visible vs. on-demand). Created during T04.

5. **Completion handoff test plan** — a targeted verification checklist for the Project Hub new-tab handoff, covering the no-forced-redirect rule. Created during T05.

6. **Mobile breakpoint and action inventory** — a list of key requester actions with their verified mobile behavior. Created during T06.

---

## 9. Documentation Progress and Closure Expectations

### Progress Documentation Requirements

During active Group 5 implementation, the following documentation must stay current:

- **Task plan status** — each task file's status header must reflect current state (proposed / in-progress / complete / blocked)
- **Gate check outcomes** — each task file's Shared Feature Gate Check section must be updated when the gate check is performed, even if the outcome is "proceed"
- **Package README updates** — if Group 5 work reveals that a shared package's README is incomplete or incorrect, a README update must accompany the implementation work that revealed the gap
- **`current-state-map.md` alignment** — do not update `current-state-map.md` during task progress; update it only when a task is closed and the new state is verified

### Closure Documentation Requirements

Before Group 5 can be considered closed:

- All eight task plans must have a verified status of "complete" or "superseded"
- `docs/architecture/blueprint/current-state-map.md` must be updated to reflect Group 5 surfaces as implemented
- `apps/pwa/README.md` must describe the requester routes added by Group 5
- The requester parity contract document (Supporting Artifact #1) must exist as a committed file
- The PWA app shell's connectivity and trust-state behavior must be documented in either the app README or a how-to doc
- Any new shared package capability consumed for the first time in Group 5 must have its package README updated to reflect the PWA consumer pattern

---

## 10. Acceptance Gate

Group 5 is complete at the planning level when:

1. All eight task plan files exist in `docs/architecture/plans/MVP/G5/` and each includes an objective, scope, exclusions, governing constraints, repo/package dependencies, acceptance criteria, validation criteria, shared feature gate check, progress documentation requirements, and closure documentation requirements.

2. The shared feature no-go summary in this master plan has been reviewed against the actual package state and the readiness assessments have been validated by inspection of the relevant package source.

3. The task sequence is documented with rationale and later-group entry conditions.

4. The locked G5 decisions (LD-01 through LD-10) are explicitly operationalized in at least one task plan each.

Group 5 is complete at the implementation level when:

1. All eight task plans have been executed to their respective acceptance criteria.
2. All shared feature gate checks have passed.
3. All closure documentation requirements have been met.
4. A requester can access the hosted PWA, start a project setup request, save a draft, resume it, submit it, and see the completion summary with the optional Project Hub link — verified end-to-end in a real browser, including on a tablet viewport.
5. The hosted PWA correctly surfaces connectivity status and protects draft state across a simulated interruption and resume.
6. `current-state-map.md` reflects all Group 5 surfaces as implemented.
