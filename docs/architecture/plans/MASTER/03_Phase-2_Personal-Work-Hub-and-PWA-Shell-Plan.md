# Phase 2 — Personal Work Hub and PWA Shell Plan

**Document ID:** 03  
**Classification:** Phase Master Plan  
**Status:** Draft — enhanced planning baseline  
**Primary Role:** Make the PWA the true daily operating surface for HB Intel by establishing Personal Work Hub as the user-centered operating layer and completing the governing shell, routing, and work-aggregation model.

---

## 1. Purpose

Phase 2 defines how HB Intel turns the PWA from a broad application shell into the actual daily operating layer for users across the company. The phase is centered on **Personal Work Hub**: the place a user opens first, returns to repeatedly, and uses to understand what matters now, what changed, what they own, what is blocked, and what should happen next.

The goal is not to create a generic dashboard. The goal is to create a **task-first, calm, role-aware, context-preserving operating layer** that reduces module switching, lowers cognitive overhead, and makes the platform feel materially easier to use than incumbent construction-tech tools.

Phase 2 also completes the governing shell and routing model that makes this possible:
- the **PWA** becomes the primary day-to-day operating surface,
- **Personal Work Hub** becomes the user-centered operating layer,
- **Project Hub** remains the project-centered operating layer,
- and shared primitives/packages remain the default implementation path for work aggregation, notifications, personalization, and state behavior.

---

## 2. Phase Objectives

Phase 2 planning addresses the following objectives:

- Make **Personal Work Hub** the default post-login operating surface in the PWA.
- Establish a **task-first operating model** organized around responsibility lanes, time-horizon cues, ownership clarity, and next-move visibility.
- Complete the governing **PWA shell, root-routing, context-retention, and return-memory** rules that make the hub feel like the user’s real home.
- Define how **real work sources** from Wave 1 business-core modules attach to the hub in a dependency-aware way.
- Provide a governed model for **role-aware analytics expansion**, delegated/team visibility, and personalization without fragmenting the platform into separate mini-products.
- Define the **notification-to-work**, **hub-to-domain**, and **hub-to-Project Hub** contracts so movement across the platform feels connected rather than app-switched.
- Establish first-release **success measures** that evaluate adoption, action completion, reduced friction, trust, and role usefulness.

---

## 3. Delivered End State (Planning Level)

At planning completion of Phase 2:

- the operating doctrine for **Personal Work Hub** is fully defined and decision-locked,
- the PWA shell and root-routing model are specified at implementation-governing depth,
- the hub’s lane model, ranking model, analytics model, personalization controls, and role-context behavior are documented,
- the first-release **source scope** is defined and tied to real Wave 1 business-core work sources,
- the boundary rules between **Personal Work Hub**, **domain pages**, and **Project Hub** are specified,
- the phase includes measurable acceptance gates, dependency rules, carry-forward decisions, and readiness criteria,
- and downstream implementation teams can attach to the Phase 2 plan without inventing their own work-hub patterns.

At implementation completion of Phase 2:

- the PWA opens into a meaningful **Personal Work Hub**,
- users can see what they own, what needs attention, what changed, what is blocked, and what they should do next without first reconstructing their day from multiple modules,
- the hub is fed by the first meaningful set of real work sources,
- shell movement across desktop and tablet is calm, trustworthy, and context-preserving,
- and the PWA behaves like the main operating surface rather than a secondary launcher.

---

## 4. Phase 2 Scope Delivered

Phase 2 planning covers:

- Personal Work Hub operating doctrine and information architecture
- PWA shell completion and root-routing/landing behavior
- work-item ranking, lane structure, time-horizon cues, and explainability rules
- work-source aggregation model using shared primitives
- role-aware analytics expansion tied to `@hbc/auth` role definitions
- governed personalization using `@hbc/project-canvas`
- delegated/team lane visibility rules for elevated roles
- notification-to-hub signal mapping using `@hbc/notification-intelligence`
- hub state persistence, return/context memory, freshness/staleness trust, and degraded/offline behavior expectations
- handoff rules from Personal Work Hub to domain pages and Project Hub
- first-release success model and validation criteria

---

## 5. Phase 2 Boundary Conditions

The following are explicitly outside Phase 2 scope:

- Full completion of all business domain modules
- Full completion of **Project Hub** as the project-centered operating layer (Phase 3)
- Broad search, connected-record, and document journey unification (Phase 5)
- Field-first workflow specialization and mobile/tablet field execution patterns beyond shared shell/tablet expectations (Phase 6)
- Broad intelligence, advanced recommendation logic, AI assistance expansion, and enterprise production hardening (Phase 7)
- Exact per-role card inventory for every individual auth role as a permanent final-state artifact (captured as follow-on governance work)
- Exact production KPI thresholds for first-release success (captured as follow-on implementation and validation work)

Phase 2 is therefore an **operating-layer phase**, not a full platform-completion phase.

---

## 6. Phase Workstreams

### 6.1 Workstream A — Personal Work Hub Operating Model

**Outcome:** Define Personal Work Hub as a real operating layer rather than a dashboard.

**What Phase 2 defines here:**
- Personal Work Hub remains **personal-first**, even when work volume is low.
- Low-work states stay on the hub and show a **smart empty-state plus governed analytics cards**, not a redirect away.
- The hub uses a **hybrid organization model**: responsibility lanes are primary, with time-horizon cues layered inside them.
- Work is ranked using a **weighted mix** of ownership, urgency, aging, project importance, blocking status, and role context.
- Users must be able to understand both:
  - what they are responsible for next,
  - and when it matters.
- The hub must provide explainability for why items surface where they do.

**Locked operating decisions included in this workstream:**
- Low-work default stays on Personal Work Hub
- Responsibility-first lanes with time-horizon layering
- Weighted ranking model
- Balanced first-release success scorecard

**Mandatory deliverables:**
- P2-A1 — Personal Work Hub Operating Model Register
- P2-A2 — Ranking, Lane, and Time-Horizon Policy
- P2-A3 — Work-Item Explainability and Visibility Rules

### 6.2 Workstream B — PWA Shell, Root Routing, and Return Memory

**Outcome:** Complete the governing shell and root-routing model that makes the hub feel like the primary operating surface.

**What Phase 2 defines here:**
- The **PWA** is the main operating surface.
- **Personal Work Hub** is the default post-login destination.
- Root routing must preserve deep-link intent, but the steady-state home is the work hub.
- Movement across domains should preserve user context and reduce heavy navigation hops.
- Return navigation should use **strong context memory**, restoring filters, scroll, expanded sections, and recent focus state where appropriate.
- Freshness should use a **hybrid trust model**: important items refresh quickly, while the page remains calm and visibly trustworthy rather than noisy.
- Shell behavior must remain strong across desktop and tablet.

**Locked operating decisions included in this workstream:**
- Strong return/context memory
- Hybrid freshness model
- Cross-device shell continuity

**Mandatory deliverables:**
- P2-B1 — Root Routing and Landing Precedence Spec
- P2-B2 — Hub State Persistence and Return-Memory Contract
- P2-B3 — Freshness, Refresh, and Staleness Trust Policy
- P2-B4 — Cross-Device Shell Behavior Note

### 6.3 Workstream C — Shared Work Source Integration and Handoff Rules

**Outcome:** Define how real work sources attach to the hub and how the hub routes users into the correct destination surface.

**What Phase 2 defines here:**
- Personal Work Hub must use the existing shared work-aggregation path rather than inventing a new one.
- Notifications are **signals**, but the hub is the main place to review and act on meaningful work.
- `@hbc/notification-intelligence` is the governing signal layer for notification-fed work surfacing.
- First-release scope includes **Wave 1 business-core work sources**:
  - Estimating
  - Business Development
  - Project Hub handoff signals
  - approvals
  - provisioning/admin exceptions
- The first release must distinguish:
  - required sources,
  - optional sources,
  - blocked sources,
  - deferred sources.
- Work items should open by **item-type rule**:
  - some deep-link directly,
  - some preview first,
  - some escalate into Project Hub when they are materially project-coordination-oriented.

**Locked operating decisions included in this workstream:**
- Notifications feed the hub via `@hbc/notification-intelligence`
- First-release source scope = Wave 1 business-core scope
- Personal Work Hub → Project Hub handoff uses a **project significance rule**
- Work-item navigation varies by item type

**Mandatory deliverables:**
- P2-C1 — First-Release Source Tranche Register
- P2-C2 — Notification-to-Work Mapping Policy
- P2-C3 — Work-Item Navigation Matrix
- P2-C4 — Personal Work Hub / Domain / Project Hub Handoff Criteria Matrix

### 6.4 Workstream D — Role Governance, Analytics Expansion, and Personalization

**Outcome:** Provide a governed role-aware model without turning the platform into separate products or open-ended dashboards.

**What Phase 2 defines here:**
- The hub uses an **adaptive layout** backed by `@hbc/project-canvas`.
- The page is organized into governed zones:
  - **Primary zone:** prioritized work lanes and next moves
  - **Secondary zone:** analytics and exception/oversight cards
  - **Tertiary zone:** quick actions, pinned tools, recent context
- Analytics visibility expands with **role elevation**, but governance derives from the actual `@hbc/auth` role definitions rather than a parallel custom hierarchy.
- Personalization is **moderately governed**:
  - users may reorder, resize, and choose from approved cards within role-based limits,
  - but they may not break the task-first operating model.
- Elevated roles may receive **limited delegated/team lanes**, but the hub remains personal-first.
- For multi-role users, the hub uses a **primary active role context** model with controlled switching.

**Locked operating decisions included in this workstream:**
- Adaptive layout using `@hbc/project-canvas`
- Role-governed analytics expansion via `@hbc/auth`
- Moderately governed personalization
- Limited delegated/team lanes for elevated roles
- Multi-role context model with default active role + controlled switch

**Mandatory deliverables:**
- P2-D1 — Role-to-Hub Entitlement Matrix
- P2-D2 — Adaptive Layout and Zone Governance Spec
- P2-D3 — Analytics Card Governance Matrix
- P2-D4 — Delegated and Team Lane Governance Note
- P2-D5 — Personalization Policy and Saved-View Rules

### 6.5 Workstream E — Multi-Role Context, Adoption, and First-Release Validation

**Outcome:** Define how the hub behaves for real multi-role users and how first-release success is judged.

**What Phase 2 defines here:**
- When a user has multiple auth roles, the hub uses a **primary active role context**.
- The system chooses a sensible default, but the user may manually switch role context when needed.
- Default context uses a **hybrid precedence rule**:
  - preserve last manual choice when still relevant,
  - otherwise use a system-inferred best-fit context.
- Context relevance is **work-and-context aware**, not purely time-based.
- Changing role context should affect:
  - analytics,
  - layout preset,
  - lane emphasis,
  - delegated visibility,
  - while keeping the same overall product frame.
- The hub’s recent/current project anchor also uses a **hybrid rule**:
  - use a user-pinned project when present and relevant,
  - otherwise infer the best-fit project from work, activity, assignment, and project signals.
- First-release success uses a **balanced scorecard** rather than a single adoption or throughput metric.

**Locked operating decisions included in this workstream:**
- Multi-role active role context model
- Hybrid role-context switch/default rules
- Hybrid project anchor rule
- Balanced success scorecard

**Mandatory deliverables:**
- P2-E1 — Multi-Role Context Policy
- P2-E2 — Project Anchor and Context-Scope Policy
- P2-E3 — First-Release Success Scorecard and Validation Plan
- P2-E4 — Phase 2 Open Decisions and Deferred Items Register

---

## 7. Planning Milestones Achieved

### M2.1 — Personal Work Hub operating doctrine locked
The hub is defined as a task-first, personal-first operating layer with a clear lane model, ranking model, and low-work behavior.

### M2.2 — PWA landing and shell doctrine locked
The PWA shell, root-routing direction, return-memory behavior, and freshness/staleness trust model are specified.

### M2.3 — Role governance and adaptive layout model locked
Role-driven analytics expansion, delegated visibility, personalization, and adaptive `@hbc/project-canvas` layout rules are defined.

### M2.4 — First-release work-source and handoff scope locked
The first-release source register and the routing/handoff boundaries between Personal Work Hub, domain pages, and Project Hub are defined.

### M2.5 — Multi-role behavior and first-release success criteria locked
The plan defines active role context behavior, project anchoring, and a balanced first-release success scorecard.

---

## 8. Mandatory Deliverables

Phase 2 must produce, at minimum, the following planning artifacts:

| Workstream | Deliverable |
|---|---|
| A | P2-A1 — Personal Work Hub Operating Model Register |
| A | P2-A2 — Ranking, Lane, and Time-Horizon Policy |
| A | P2-A3 — Work-Item Explainability and Visibility Rules |
| B | P2-B1 — Root Routing and Landing Precedence Spec |
| B | P2-B2 — Hub State Persistence and Return-Memory Contract |
| B | P2-B3 — Freshness, Refresh, and Staleness Trust Policy |
| B | P2-B4 — Cross-Device Shell Behavior Note |
| C | P2-C1 — First-Release Source Tranche Register |
| C | P2-C2 — Notification-to-Work Mapping Policy |
| C | P2-C3 — Work-Item Navigation Matrix |
| C | P2-C4 — Personal Work Hub / Domain / Project Hub Handoff Criteria Matrix |
| D | P2-D1 — Role-to-Hub Entitlement Matrix |
| D | P2-D2 — Adaptive Layout and Zone Governance Spec |
| D | P2-D3 — Analytics Card Governance Matrix |
| D | P2-D4 — Delegated and Team Lane Governance Note |
| D | P2-D5 — Personalization Policy and Saved-View Rules |
| E | P2-E1 — Multi-Role Context Policy |
| E | P2-E2 — Project Anchor and Context-Scope Policy |
| E | P2-E3 — First-Release Success Scorecard and Validation Plan |
| E | P2-E4 — Phase 2 Open Decisions and Deferred Items Register |

---

## 9. Dependencies

### Incoming dependencies

Phase 2 depends on the following existing foundations:

- Phase 0 control baseline complete
- Stable auth/session/shell foundations already present in the repo
- Shared platform primitives already present for work aggregation, notifications, and governed layout/personalization
- Phase 1 design layer complete enough to define data/contract expectations for downstream consumers

### Dependency posture relative to Phase 1

Phase 2 must explicitly distinguish between **planning-ready**, **implementation-ready**, and **blocked** work:

#### Planning-ready now
- Personal Work Hub operating doctrine
- PWA shell and landing behavior refinement
- ranking, lane, and explainability policy
- role-governance and adaptive layout policy
- multi-role context rules
- project anchor and handoff criteria
- validation scorecard design

#### Implementation-ready now (subject to current repo truth)
- Shell-level and routing-level refinements that rely on existing PWA/auth/shell foundations
- State persistence and return-memory implementation planning
- Adaptive layout composition planning using `@hbc/project-canvas`
- Notification-to-work contract design using `@hbc/notification-intelligence`

#### Implementation-ready after named prerequisite
- Real-source hub aggregation for Wave 1 business-core work items after the relevant Phase 1-backed routes/contracts are available
- First-release real work-item publication from domains that still depend on Phase 1 C1/C2/C3 readiness

#### Blocked on upstream or external dependency
- Broad real-domain integration beyond first-release tranche scope where backend/service contracts are not yet live
- Any feature that assumes broad staging-ready Phase 1 execution rather than narrow kickoff reality

### Outgoing dependencies

Phase 2 enables:
- Phase 3 **Project Hub** by establishing the user-centered to project-centered handoff rules
- Phase 4 business domains by giving them a governed work-surface contract to publish into
- Phase 5 search/document entry points by stabilizing the user operating layer and context transitions
- Phase 6 field-first work by establishing shared work, freshness, and degraded/offline expectations
- Phase 7 adoption, intelligence, and rollout planning by defining the first meaningful operating-layer success model

---

## 10. Acceptance Gates

Phase 2 is complete only when all of the following are true:

- **The PWA opens into Personal Work Hub by default** as the steady-state user operating surface.
- **The hub is task-first and responsibility-first**, not a generic dashboard.
- **Low-work states remain useful** through smart empty-state behavior and governed analytics fallback.
- **The lane model, ranking model, and time-horizon model are implemented consistently** and can be explained to users.
- **First-release real work sources are live** per the Phase 2 source tranche register.
- **Notifications act as signals into the hub**, not as a competing work system.
- **Role governance is working** using `@hbc/auth` role definitions.
- **Personalization is useful but governed**, and the core work operating model remains intact.
- **Delegated/team lanes are limited and role-appropriate**, not a second team dashboard.
- **Return/context memory is strong and trustworthy** when users move between hub and destination surfaces.
- **Freshness and staleness state are visible and trustworthy** without making the page jittery or unstable.
- **Project Hub handoff rules are working** for materially project-coordination-oriented work.
- **Desktop and tablet shell behavior is stable and coherent.**
- **First-release success can be measured** with a balanced scorecard covering adoption, action completion, friction reduction, trust, and role usefulness.

---

## 11. Team Ownership

### Primary custodian
Experience / Shell Team — owns the Personal Work Hub operating model, PWA shell, routing, adaptive layout behavior, and the user-centered operating-layer contract.

### Supporting custodians
- **Platform / Core Services** — shared work-source contracts, notification-to-work mapping, freshness/state behavior, and implementation dependencies on Phase 1 surfaces
- **Business Domains** — publication of meaningful work items from Wave 1 business-core sources
- **Project / Documents** — Project Hub handoff criteria and project anchor behavior
- **Support / Adoption** — first-release usefulness validation and behavioral success measurement

### Required reviewers for implementation
- Product/design lead
- Architecture lead
- Support/adoption representative
- Role/governance reviewer for `@hbc/auth`-based entitlement implications

---

## 12. Resolved Decisions

The following decisions were resolved during Phase 2 operating-model interviewing and are treated as locked planning doctrine for the enhanced phase plan:

| Decision | Locked Resolution |
|---|---|
| Low-work default | Stay on Personal Work Hub with smart empty-state + select analytics cards |
| Layout model | Adaptive layout using `@hbc/project-canvas` |
| Analytics scope | Expand by role elevation, governed by `@hbc/auth` role definitions |
| Personalization | Moderately governed |
| Work ranking | Weighted mix of ownership, urgency, aging, project importance, blocking status, and role context |
| Top-level organization | Responsibility lanes first, with time-horizon cues layered inside |
| Work-item navigation | Varies by item type |
| Delegated/team lanes | Limited and only for eligible elevated roles |
| Return behavior | Strong context memory |
| Inline action model | Moderate; role-based expansion for first release |
| Notification relationship | Notifications feed the hub via `@hbc/notification-intelligence`; hub remains the main work surface |
| Context scope | Cross-project by default with a prominent recent/current project anchor |
| Freshness model | Hybrid freshness/staleness trust model |
| First-release success | Balanced scorecard |
| Multi-role governance source | `@hbc/auth` role definitions |
| Multi-role default | Primary active role context |
| Role-context switching | Hybrid — sensible default plus manual switch |
| Default role-context selection | Preserve last relevant manual choice; otherwise infer best-fit context |
| Role-context change effects | Analytics + layout + lane emphasis adapt, without turning into a separate app |
| Role-context validity | Work-and-context aware preservation of last manual role |
| First-release source scope | Wave 1 business-core scope: Estimating, Business Development, Project Hub handoff signals, approvals, provisioning/admin exceptions |
| Project Hub handoff rule | Use a project significance rule |
| Project anchor rule | Hybrid — preserve a relevant pinned project; otherwise infer best-fit anchor |

---

## 13. Carry-Forward Architecture Questions

These items remain useful follow-on refinements, but do not block the enhanced Phase 2 plan itself:

- Exact ranking-factor coefficients and tie-break implementation detail
- Exact per-role card inventory by every `@hbc/auth` role definition
- Exact first-release KPI thresholds and red/green target bands
- Exact action-by-domain inline entitlement table for all workflows
- Exact project-anchor inference scoring logic
- Final visual component inventory and Storybook composition set for hub surfaces

These should be captured as controlled follow-on artifacts or implementation subtasks, not as open blockers to the phase plan.

---

## 14. Risks Being Mitigated

Phase 2 explicitly mitigates the following risks:

- **PWA remains only a shell:** Users still reconstruct their day from multiple tools because the home layer never becomes operational.
- **Dashboard drift:** The work hub becomes an analytics-heavy summary page instead of a task-first operating layer.
- **Cross-package drift:** Teams attach domains into the hub inconsistently, bypassing shared primitives and creating fragmented work publication patterns.
- **Project scope bleed:** Personal Work Hub absorbs too much Project Hub scope and loses the personal-first operating model.
- **Incumbent-pattern regression:** The hub inherits the density, navigation burden, and cognitive noise of incumbent construction-tech shells.
- **Multi-role confusion:** Users with multiple auth roles receive noisy or incoherent home experiences.
- **Trust failure:** Freshness, offline/degraded behavior, or notification mapping make the hub feel unstable or misleading.
- **False Phase 1 assumptions:** The phase assumes broad real data availability before Phase 1 implementation is actually ready to support it.

---

## 15. Phase 2 Execution Priorities

When implementation begins, the recommended sequencing is:

1. Lock the **Personal Work Hub operating doctrine** and produce the operating model, lane policy, and ranking policy.
2. Define the **PWA root-routing and return-memory model** so the shell/home experience is authoritative.
3. Define the **adaptive zone layout and role-governance matrices** using `@hbc/project-canvas` and `@hbc/auth` as the governing implementation foundations.
4. Define the **first-release source tranche register** and the **notification-to-work mapping contract**.
5. Define the **hub-to-domain** and **hub-to-Project Hub** routing/handoff rules.
6. Finalize the **multi-role context**, **project anchor**, and **freshness** contracts.
7. Produce the **first-release success scorecard** and implementation validation plan.

---

## 16. Delivered Capability Summary (Planning Level)

| Capability | Coverage | Key Deliverables |
|---|---|---|
| Personal operating-layer doctrine | Task-first, responsibility-first, calm user operating model | P2-A1, P2-A2, P2-A3 |
| PWA shell and landing completion | Root routing, landing precedence, return memory, freshness | P2-B1, P2-B2, P2-B3, P2-B4 |
| Shared work aggregation and signal mapping | First-release sources, notification-to-work, routing/handoff rules | P2-C1, P2-C2, P2-C3, P2-C4 |
| Role governance and adaptive layout | Auth-driven entitlement, adaptive canvas rules, personalization controls | P2-D1, P2-D2, P2-D3, P2-D4, P2-D5 |
| Multi-role and context behavior | Role switching, project anchoring, success model | P2-E1, P2-E2, P2-E3, P2-E4 |

---

## 17. How to Use This Plan Now

| Goal | Start Here |
|---|---|
| Understand the purpose and objective of Phase 2 | Sections 1–3 |
| See what is and is not in scope | Sections 4–5 |
| Understand the workstreams and required artifacts | Section 6 + Section 8 |
| Understand the planning milestones and gates | Sections 7 and 10 |
| Check incoming/outgoing dependencies | Section 9 |
| See the locked operating decisions | Section 12 |
| Understand remaining refinement items | Section 13 |
| Plan implementation sequencing | Section 15 |

---

## 18. Related Documents

- `00_HB-Intel_Master-Development-Summary-Plan.md`
- `01_Phase-0_Program-Control-and-Repo-Truth-Plan.md`
- `02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md`
- `phase-0-deliverables/README.md`
- `phase-1-deliverables/README.md`
- `@hbc/my-work-feed` package documentation
- `@hbc/notification-intelligence` package documentation
- `@hbc/project-canvas` package documentation
- `@hbc/auth` package documentation

