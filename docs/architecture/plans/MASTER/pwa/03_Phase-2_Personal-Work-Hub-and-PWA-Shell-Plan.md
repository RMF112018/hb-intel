# HB Intel — Enhanced Phase 2 Plan
## Personal Work Hub and PWA Shell

**Document purpose:** Enhanced implementation-guiding Phase 2 plan for the Personal Work Hub and PWA shell work, refined through repo-truth review, governing-architecture reconciliation, subject-matter review, and decision interview.

**Phase intent:** Turn HB Intel’s user entry experience into a real operating layer by making the PWA the primary personal work surface, while preserving a governed SPFx companion lane and explicit shared cross-lane contracts.

**Document type:** Execution-hardened phase plan  
**Status:** Enhanced planning baseline  
**Primary lane focus:** PWA-first, with governed SPFx coexistence  
**Primary audience:** Architecture, experience/shell, platform/core services, business-domain leads, and delivery planning owners

---

## 1. Objective

Phase 2 exists to make HB Intel feel like a real daily operating surface rather than a collection of modules and entry points.

This phase defines the Personal Work Hub and the shell behavior required to make that hub credible, calm, useful, and governable. It also clarifies how that operating layer coexists with HB Intel’s two application lanes:

- **PWA lane** — the full Personal Work Hub and primary day-to-day operating home
- **SPFx lane** — a richer companion surface that supports summary, visibility, and light actions, but does not become a second full operating home

Phase 2 is therefore not a generic dashboard phase. It is the phase that establishes:

- the user’s default home surface,
- the task-first operating model,
- the shell and routing behavior that preserves continuity,
- the work-publication and handoff rules that attach domain work into that home,
- the role-aware governance model,
- and the first-release rollout and validation rules.

---

## 2. Planning Basis and Repo-Truth Starting Point

This enhanced plan does **not** assume the Personal Work Hub or shell work begins from zero. Phase 2 must build from the current repo posture rather than re-planning foundations that already exist.

### 2.1 Required governing references

This plan is written to align with the following governing architecture references:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md`

### 2.2 Repo-truth foundations already present

Phase 2 planning must explicitly acknowledge the following current-state foundations (verified 2026-03-20 against current-state-map §2 and live packages):

- A real **PWA application shell** already exists, including router, auth integration, workspace routing, and shell composition.
- Root-route behavior already includes **redirect memory capture/restore** and **role-based post-auth landing precedence**.
- The current PWA still lands at **`/project-hub`** by default, so Phase 2 is a controlled transition from a project-hub-first posture to a personal-work-first posture.
- A real shared **`@hbc/my-work-feed`** package already exists and is **mature** (SF29, ADR-0115 locked 2026-03-15); it must remain the governing aggregation primitive for Personal Work Hub work publication.
- Supporting shared packages already exist and are **mature/partial** for core hub behavior:
  - `@hbc/auth` (auth foundation, role definitions stable)
  - `@hbc/shell` (app shell layer)
  - `@hbc/ui-kit` (design system)
  - `@hbc/session-state` (SF12, ADR-0101 locked; offline model ready)
  - `@hbc/notification-intelligence` (SF10, ADR-0099 locked; signal layer ready)
  - `@hbc/project-canvas` (SF13, ADR-0102 locked; adaptive layout ready with Phase 2 zone constraints)
  - `@hbc/smart-empty-state` (SF11, ADR-0100 locked; empty-state classification ready)
- Work Hub reference material already exists in the repo (SF29 and related ADRs) and should be treated as starting-point truth rather than ignored background.
- The PWA already has a real PWA/installability baseline; Phase 2 is not inventing a PWA from scratch.

### 2.3 Planning consequence

Because these foundations already exist, Phase 2 must focus on:

- **binding** existing primitives into one coherent operating-layer model,
- **tightening** lane ownership and interaction rules,
- **reconciling** current repo truth with the desired target behavior,
- and **sequencing** first-release implementation and rollout in a credible way.

Phase 2 must **not** waste effort re-describing already-established shell and feed foundations as if they were still hypothetical.

---

## 3. Strategic Outcome of Phase 2

At the end of Phase 2, HB Intel should have a defined and implementation-ready operating-layer contract in which:

- the **PWA** is the user’s primary personal home,
- the home surface is **task-first and personal-first**,
- elevated users also see governed **team / delegated / portfolio attention**,
- the **SPFx lane** provides a useful but bounded companion experience,
- users can move from summary to action without losing context,
- work is published into the hub through shared cross-domain primitives rather than one-off domain logic,
- and first-release usefulness can be validated with evidence rather than opinion.

The target user impression of the completed phase is:

> “When I open HB Intel, I immediately see what I need to do, what is waiting, what changed, and what matters next — without having to reconstruct my day from multiple tools.”

---

## 4. Phase 2 Scope Delivered

Phase 2 planning covers the following:

- Personal Work Hub operating doctrine and information architecture
- PWA shell completion and root-routing/landing transition to Personal Work Hub
- explicit **PWA/SPFx lane ownership** and coexistence rules
- work-item ranking, lane structure, time-horizon cues, and explainability rules
- first-release work publication and handoff rules using existing shared primitives
- role-aware visibility and analytics expansion tied to `@hbc/auth` role definitions
- governed personalization and adaptive composition rules
- delegated/team visibility rules for elevated roles
- notification-to-hub signal mapping using `@hbc/notification-intelligence`
- state persistence, context/return memory, freshness/staleness trust, and degraded/offline behavior expectations
- handoff rules from Personal Work Hub to domain pages and Project Hub
- first-release pilot rollout, phased adoption posture, and validation criteria

---

## 5. Boundary Conditions and Non-Goals

The following are **outside** Phase 2 scope and must not be backfilled into this plan as hidden requirements:

- Full completion of all business-domain modules
- Full completion of **Project Hub** as the project-centered operating layer
- Broad connected-record, search, and document-journey unification beyond the work-surface rules needed here
- Broad field-specialized/mobile-first workflow design beyond shared shell, continuity, and degraded-state expectations
- Enterprise-wide rollout as a day-one assumption
- Final KPI bands and production support thresholds for all roles and domains
- Final per-role permanent card inventory for every auth role
- Full dual-host parity between PWA and SPFx home experiences
- Open-ended dashboard freedom that would weaken the task-first operating model

Phase 2 is therefore an **operating-layer and shell-governance phase**, not a general platform-completion phase and not a “duplicate the same home in both hosts” phase.

---

## 6. Phase 2 Lane Ownership and Coexistence Rules

This section is mandatory doctrine for all downstream design and implementation work.

### 6.1 Lane model

| Concern | PWA lane | SPFx lane | Shared cross-lane platform work |
|---|---|---|---|
| Primary home experience | **Owns full Personal Work Hub** | Does not own the full home | Route semantics, auth state, entitlement vocabulary |
| Default landing | **Owns default steady-state landing** (`/my-work`) for approved rollout cohorts | No default-host takeover in this phase | Redirect memory, post-auth precedence rules |
| Personal work feed | **Owns full feed, filtering, role-aware composition, context retention** | May show governed companion summary/list | Canonical work-item model, dedupe, ranking inputs |
| Rich companion summary | May include within shell/home | **Owns richer companion view** for summary, limited item list, and light actions | Shared publication model and telemetry |
| Item completion | **Owns deeper workflow continuation and full completion** | Limited to light actions only | Deep-link rules, action metadata, state vocabulary |
| Personalization | **Owns moderated layout controls** | Curated composition only in first release | Saved-view rules, entitlement rules |
| Team/delegated visibility | **Owns elevated-role hybrid landing** | May expose summarized team visibility | Role and delegated-visibility contracts |
| Offline/degraded behavior | **Owns primary trust model** | Must expose consistent status cues where applicable | Freshness/staleness vocabulary, session-state semantics |
| Project/Domain handoff | **Owns full handoff and return continuity** | Can launch into destination or PWA | Context handoff, project-anchor semantics |

### 6.2 First-release lane doctrine

Phase 2 first release is governed by the following locked posture:

- **PWA** is the full operating home.
- **SPFx** is a richer companion lane, not a competing home.
- SPFx may expose:
  - counts,
  - summary cards,
  - a limited item list,
  - and selected light actions.
- SPFx must **not** become the place where users complete deeper work, manage rich personalization, or experience the full operating-layer logic.
- Anything that requires deeper workflow context, multi-step interaction, or extended continuity must route to the **PWA**.

### 6.3 Cross-lane consistency rules

The following must remain consistent across both lanes:

- auth and role resolution semantics
- work-item identity and canonical shape
- notification-to-work signal semantics
- action/deep-link vocabulary
- freshness, stale, syncing, degraded, and offline status meanings
- delegated/team visibility entitlement rules
- telemetry event names for launch, open, action, handoff, and abandonment
- project/context handoff semantics where applicable

### 6.4 Explicit anti-drift rules

The following are prohibited during Phase 2:

- implementing separate work-item models for PWA and SPFx
- creating lane-specific ranking systems
- allowing SPFx to silently become a second full home experience
- allowing unrestricted dashboard composition in either lane
- bypassing `@hbc/my-work-feed` and `@hbc/notification-intelligence` for first-release publication patterns where those shared primitives already cover the need

---

## 7. First-Release Experience Model

### 7.1 Default release posture

Phase 2 is planned for a **targeted pilot / phased rollout first**, not a company-wide mandatory switch on day one.

The pilot cohort should prioritize:

- users whose workflows are tied to the first-release source tranche,
- users who will benefit most from a credible daily work surface,
- and elevated roles who need the hybrid personal + team/portfolio experience.

The exact roster is an implementation-governance decision, not a blocker to this phase plan.

### 7.2 Home model by role

| User type | First-release landing behavior |
|---|---|
| Standard roles | Personal work first |
| Elevated roles | Hybrid landing: personal work first, then team / delegated / portfolio attention |
| Multi-role users | Personal work within the active role context, with controlled switching |
| Admin-only exception contexts | May still use admin-specific landing behavior where explicitly required |

### 7.3 Low-work behavior

Low-work states do **not** redirect the user away from Personal Work Hub.

Instead, the PWA home remains stable and shows:

- smart empty-state guidance,
- governed secondary cards,
- recent signals where useful,
- and quick paths back into meaningful tools or context.

This keeps the operating layer intact even when the active task queue is light.

### 7.4 Operating doctrine

The Personal Work Hub is **not** a generic summary dashboard.

The top of the page must always answer, in a calm and trustworthy way:

- What needs my attention now?
- What is waiting on others?
- What changed that matters?
- What project or context is most relevant right now?

---

## 8. Layout, Personalization, and Surface Governance

### 8.1 Page zones

The Personal Work Hub uses governed zones:

- **Primary zone** — prioritized personal work, next moves, waiting/blocked, and critical signals
- **Secondary zone** — analytics, exceptions, oversight, and role-aware visibility expansions
- **Tertiary zone** — quick actions, recent context, pinned tools, and lightweight utility components

### 8.2 Personalization doctrine

Personalization is **moderately governed**.

Users may:

- reorder approved secondary/tertiary cards,
- resize approved cards within governed limits,
- choose from approved role-allowed cards,
- save limited view preferences where permitted.

Users may **not**:

- remove or displace the core personal-work runway,
- break the responsibility-first operating model,
- surface cards outside their entitlement rules,
- or turn the home into a freeform analytics board.

### 8.3 `@hbc/project-canvas` usage rule

`@hbc/project-canvas` is approved as the governing adaptive-layout foundation for the **PWA Personal Work Hub**, but with explicit constraints:

- first-release use is focused on **secondary and tertiary zones**, plus governed supporting composition around the primary runway,
- the core task-first operating region remains protected and not fully user-removable,
- SPFx companion surfaces use **curated composition**, not full freeform canvas behavior, until host suitability and supportability are proven.

This preserves reuse without allowing the Personal Work Hub to drift into an unconstrained dashboard experience.

---

## 9. Work Publication, Signals, and Handoff Doctrine

### 9.1 Governing publication model

Phase 2 must use existing shared work-publication primitives rather than creating a parallel operating model.

The governing posture is:

- `@hbc/my-work-feed` remains the primary aggregation primitive,
- `@hbc/notification-intelligence` remains the governing signal layer for notification-fed surfacing,
- domain teams publish work into the hub through shared contracts,
- and Personal Work Hub remains the main place for meaningful review and action prioritization.

### 9.2 First-release source posture

The first-release source scope remains:

- Estimating
- Business Development
- Project Hub handoff signals
- approvals
- provisioning/admin exceptions

But Phase 2 must explicitly classify each first-release source as:

- **required for pilot launch**,
- **optional but beneficial**,
- **blocked on named prerequisite**,
- or **deferred beyond first release**.

### 9.3 Navigation doctrine by item type

Work items do not all open the same way.

Allowed destination patterns include:

- direct deep-link into the authoritative domain surface,
- preview/summary first, then domain open,
- escalation into Project Hub for materially project-coordination-oriented work,
- or light in-place action when explicitly approved for the SPFx companion or PWA hub surface.

### 9.4 Project Hub handoff doctrine

Project Hub remains the project-centered operating layer and must not be absorbed by Personal Work Hub.

Phase 2 handoff logic uses a **project significance rule**:

- work that is materially project-coordination-oriented should route toward Project Hub,
- work that is materially personal-action-oriented should remain governed by Personal Work Hub,
- and the return path must preserve user context and continuity.

---

## 10. Workstreams

### 10.1 Workstream A — Personal Work Hub Operating Model

**Outcome:** Define the Personal Work Hub as a personal-first operating layer with a stable responsibility-first structure.

**What this workstream must now clarify beyond the prior version:**

- distinguish invariant operating rules from configurable page behavior,
- define the responsibility-lane model clearly enough for real surface design,
- document why the hub remains stable in both high-work and low-work states,
- and convert ranking/lane concepts into implementation-governing policy rather than descriptive prose.

**Mandatory deliverables:**
- P2-A1 — Personal Work Hub Operating Model Register
- P2-A2 — Ranking, Lane, and Time-Horizon Policy
- P2-A3 — Work-Item Explainability and Visibility Rules

### 10.2 Workstream B — PWA Shell, Landing Transition, and Lane Ownership

**Outcome:** Make the PWA the credible default home for the approved first-release cohort while preserving deep-link continuity and cross-lane coexistence.

**What this workstream must now clarify beyond the prior version:**

- current repo-truth landing behavior vs target landing behavior,
- the transition from `/project-hub` default to `/my-work` default,
- redirect memory and return behavior that already exists vs what Phase 2 adds,
- lane-specific shell responsibilities,
- and the explicit rules preventing SPFx from becoming a second full home.

**Mandatory deliverables:**
- P2-B0 — Phase 2 Lane Ownership and Coexistence Rules
- P2-B1 — Root Routing and Landing Precedence Spec
- P2-B2 — Hub State Persistence and Return-Memory Contract
- P2-B3 — Freshness, Refresh, and Staleness Trust Policy
- P2-B4 — Cross-Device Shell Behavior Note

### 10.3 Workstream C — Shared Work Sources, Signals, and Handoff Rules

**Outcome:** Define how first-release domains publish meaningful work into the hub and how those items move users into the right next surface.

**What this workstream must now clarify beyond the prior version:**

- the actual first-release source tranche as a governed register,
- required vs optional vs blocked vs deferred source status,
- signal-to-work mapping rules,
- PWA vs SPFx action boundaries,
- and item-type-based navigation/handoff rules.

**Mandatory deliverables:**
- P2-C1 — First-Release Source Tranche Register
- P2-C2 — Notification-to-Work Mapping Policy
- P2-C3 — Work-Item Navigation Matrix
- P2-C4 — Personal Work Hub / Domain / Project Hub Handoff Criteria Matrix
- P2-C5 — First-Release Pilot Publication and Rollout Readiness Register

### 10.4 Workstream D — Role Governance, Analytics Expansion, and Personalization

**Outcome:** Give the Personal Work Hub governed role-aware depth without turning it into separate products or unconstrained dashboards.

**What this workstream must now clarify beyond the prior version:**

- which zones are invariant vs configurable,
- how elevated-role hybrid landing works,
- how delegated/team visibility is constrained,
- what SPFx companion visibility may include,
- and what personalization rules are allowed per lane.

**Mandatory deliverables:**
- P2-D1 — Role-to-Hub Entitlement Matrix
- P2-D2 — Adaptive Layout and Zone Governance Spec
- P2-D3 — Analytics Card Governance Matrix
- P2-D4 — Delegated and Team Lane Governance Note
- P2-D5 — Personalization Policy and Saved-View Rules

### 10.5 Workstream E — Multi-Role Context, Rollout, and Validation

**Outcome:** Define how the hub behaves for real multi-role users and how first-release success is evaluated during phased rollout.

**What this workstream must now clarify beyond the prior version:**

- active role context behavior,
- hybrid role and project anchor rules,
- pilot-cohort rollout posture,
- evidence-based first-release acceptance,
- and what remains open vs intentionally deferred.

**Mandatory deliverables:**
- P2-E1 — Multi-Role Context Policy
- P2-E2 — Project Anchor and Context-Scope Policy
- P2-E3 — First-Release Success Scorecard and Validation Plan
- P2-E4 — Phase 2 Open Decisions and Deferred Items Register
- P2-E5 — Pilot Cohort Rollout and Adoption Sequencing Note

---

## 11. Planning Milestones

### M2.1 — Operating doctrine locked
The Personal Work Hub is defined as a task-first, personal-first operating layer with stable low-work behavior and responsibility-first organization.

### M2.2 — Lane model locked
The PWA/SPFx coexistence model is explicit, bounded, and implementation-guiding.

### M2.3 — Landing and continuity doctrine locked
Root routing, landing precedence, redirect memory, return memory, freshness/staleness trust, and shell continuity rules are specified.

### M2.4 — Role governance and layout doctrine locked
Adaptive layout, personalization, hybrid elevated-role visibility, and entitlement rules are specified.

### M2.5 — Source tranche and handoff doctrine locked
The first-release publication set, signal mapping, navigation, and Project Hub handoff boundaries are specified.

### M2.6 — Pilot rollout and validation doctrine locked
The first-release rollout posture, cohort logic, and balanced success scorecard are defined.

---

## 12. Mandatory Deliverables

| Workstream | Deliverable |
|---|---|
| B | P2-B0 — Phase 2 Lane Ownership and Coexistence Rules |
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
| C | P2-C5 — First-Release Pilot Publication and Rollout Readiness Register |
| D | P2-D1 — Role-to-Hub Entitlement Matrix |
| D | P2-D2 — Adaptive Layout and Zone Governance Spec |
| D | P2-D3 — Analytics Card Governance Matrix |
| D | P2-D4 — Delegated and Team Lane Governance Note |
| D | P2-D5 — Personalization Policy and Saved-View Rules |
| E | P2-E1 — Multi-Role Context Policy |
| E | P2-E2 — Project Anchor and Context-Scope Policy |
| E | P2-E3 — First-Release Success Scorecard and Validation Plan |
| E | P2-E4 — Phase 2 Open Decisions and Deferred Items Register |
| E | P2-E5 — Pilot Cohort Rollout and Adoption Sequencing Note |

---

## 13. Dependency Posture

### 13.1 Incoming dependencies

Phase 2 depends on the following current-state foundations:

- Phase 0 control baseline and repo-truth discipline
- stable auth/session/shell foundations already present in the repo
- shared aggregation, signal, state, and layout primitives already present for work publication and shell continuity
- sufficient Phase 1 data/contract posture to define downstream work-publication expectations

### 13.2 Planning-ready now

The following are planning-ready now:

- Personal Work Hub operating doctrine
- lane ownership and coexistence rules
- landing and shell transition model
- ranking, explainability, and visibility policy
- adaptive layout and personalization governance
- role-aware hybrid landing rules
- multi-role context rules
- project anchor and handoff criteria
- pilot rollout posture and validation design

### 13.3 Implementation-ready now (subject to repo truth)

The following are implementation-ready now, subject to live repo foundations remaining stable:

- root routing and landing refinement in the PWA shell
- redirect-memory and return-memory extension where needed
- freshness/trust-state implementation planning using existing shell/session-state posture
- adaptive composition planning using `@hbc/project-canvas` under Phase 2 constraints
- notification-to-work mapping design using `@hbc/notification-intelligence`
- PWA companion/launch entry rules from SPFx surfaces

### 13.4 Implementation-ready after named prerequisite

The following become implementation-ready only after named prerequisites are confirmed:

- real-source publication for first-release domains whose contracts or domain routes still depend on Phase 1-backed readiness
- richer delegated/team and portfolio signals where upstream domain projection logic is incomplete
- any SPFx light actions that require specific API/contract readiness not yet proven in the repo

### 13.5 Blocked / deferred by design

The following are intentionally not first-release blockers for Phase 2:

- full enterprise-wide real-domain integration across all business modules
- host-parity freeform personalization across both PWA and SPFx
- full final-state analytics catalog for every role
- broad AI/recommendation expansion beyond the operating-layer baseline

### 13.6 Outgoing dependencies enabled by Phase 2

Phase 2 enables:

- Phase 3 Project Hub by locking the personal-to-project handoff contract
- later domain buildout by giving domains a governed publication target
- later search/document unification by stabilizing user entry and context continuity
- later field-specific work by stabilizing freshness, degraded-state, and handoff expectations
- later adoption/intelligence planning by providing a measurable first-release operating-layer baseline

---

## 14. Acceptance Gates

Phase 2 is not complete when the prose sounds good. It is complete only when the following gates have clear pass evidence.

| Gate | Pass condition | Evidence required | Primary owner |
|---|---|---|---|
| Default home gate | Approved first-release cohorts land in **PWA Personal Work Hub** by steady-state default | Route/landing spec, implemented route behavior, test coverage | Experience / Shell |
| Lane-boundary gate | PWA and SPFx responsibilities are explicit and no second full home emerges in SPFx | P2-B0, design review signoff, scope map | Architecture + Experience |
| Work-surface gate | Hub remains task-first and responsibility-first, not a generic dashboard | Operating model register, zone governance spec, UX review | Product/Design + Experience |
| Low-work gate | Low-work states remain useful without redirecting users away from the hub | Empty-state rules, UX proof, acceptance review | Product/Design |
| Publication gate | First-release required sources are classified and launch-critical sources publish correctly | Source tranche register, publication readiness register, integration validation | Platform + Domain owners |
| Signal gate | Notifications act as signals into the hub rather than a competing work system | Mapping policy, interaction review, launch checks | Platform/Core Services |
| Role-governance gate | Role behavior is enforced from `@hbc/auth` rules and not parallel custom logic | Entitlement matrix, role validation, review signoff | Auth / Architecture |
| Personalization gate | Personalization is useful but bounded; primary work runway remains protected | Personalization policy, layout governance proof, UX review | Experience / Shell |
| Delegated-visibility gate | Elevated-role hybrid landing works without turning into a second team dashboard | Delegated/team governance note, role walkthroughs | Product + Experience |
| Continuity gate | Redirect memory, return memory, and context restoration are trustworthy | Persistence contract, navigation test scenarios | Experience / Shell |
| Trust-state gate | Freshness, stale, syncing, degraded, and offline states are visible and coherent | Freshness policy, state UX review, scenario tests | Platform + Experience |
| Handoff gate | Project-significant work routes correctly to Project Hub and returns cleanly | Handoff matrix, navigation review, scenario tests | Product + Project surfaces |
| Cross-device gate | Desktop and tablet shell behavior remains stable and credible | Cross-device behavior note, test evidence | Experience / QA |
| Pilot-readiness gate | The pilot cohort has a defined rollout path and measurable success scorecard | Pilot rollout note, scorecard plan, launch checklist | Adoption / Product |

---

## 15. Team Ownership

### Primary custodian
Experience / Shell Team — owns the Personal Work Hub operating model, PWA shell, landing transition, layout composition rules, and continuity behavior.

### Supporting custodians
- **Platform / Core Services** — shared publication contracts, notification-to-work mapping, state/freshness semantics, and integration dependencies
- **Business Domains** — publication of meaningful first-release work items from the approved source tranche
- **Project / Project Hub owners** — project-significance handoff rules and project-anchor implications
- **Support / Adoption** — pilot rollout, user usefulness validation, and scorecard measurement
- **Architecture** — lane-boundary enforcement, shared primitive usage, and anti-drift review

### Required reviewers
- Product/design lead
- Architecture lead
- Experience/shell lead
- Platform/core services lead
- Support/adoption representative
- Role/governance reviewer for `@hbc/auth` implications

---

## 16. Resolved Decisions

The following decisions are locked for the enhanced Phase 2 plan:

| Decision | Locked resolution |
|---|---|
| Full Personal Work Hub ownership | **PWA first** |
| SPFx posture | **Richer companion lane**, not the full home |
| SPFx action model | **Light actions only**; deeper work and full completion stay in PWA |
| Elevated-role landing | **Hybrid** — personal work first, then team / delegated / portfolio attention |
| Personalization | **Moderately governed** |
| Low-work default | Stay on Personal Work Hub with smart empty-state + governed fallback content |
| Layout model | Adaptive layout using `@hbc/project-canvas`, constrained by zone governance |
| Analytics scope | Expand by role elevation, governed by `@hbc/auth` role definitions |
| Work ranking | Weighted mix of ownership, urgency, aging, project importance, blocking status, and role context |
| Top-level organization | Responsibility lanes first, with time-horizon cues layered inside |
| Work-item navigation | Varies by item type |
| Delegated/team lanes | Limited and only for eligible elevated roles |
| Return behavior | Strong context memory |
| Notification relationship | Notifications feed the hub via `@hbc/notification-intelligence`; hub remains the main work surface |
| Freshness model | Hybrid freshness/staleness trust model |
| First-release success model | Balanced scorecard |
| Multi-role governance source | `@hbc/auth` role definitions |
| Multi-role default | Primary active role context |
| Role-context switching | Hybrid — preserve sensible/relevant last context, otherwise infer best fit |
| Project anchor rule | Hybrid — preserve relevant pinned project; otherwise infer best-fit anchor |
| First-release source scope | Wave 1 business-core scope: Estimating, Business Development, Project Hub handoff signals, approvals, provisioning/admin exceptions |
| Project Hub handoff rule | Use a project significance rule |
| Rollout posture | **Targeted pilot / phased rollout first** |

---

## 17. Carry-Forward and Deferred Items

The following remain useful follow-on items, but do not block the enhanced Phase 2 plan:

- exact ranking-factor coefficients and tie-break implementation details
- final per-role card inventory by every auth role
- exact launch KPIs and red/green thresholds
- exact inline action entitlement tables by domain and host
- final project-anchor inference scoring logic
- host-proven expansion of curated SPFx companion actions
- final visual component inventory and Storybook composition catalog for all hub surfaces

These should be captured as controlled follow-on artifacts or implementation subtasks, not kept as hidden blockers inside the plan.

---

## 18. Risks Being Mitigated

Phase 2 explicitly mitigates the following risks:

- **PWA remains only a shell** — users still reconstruct their workday from multiple tools because the home layer never becomes operational.
- **Second-home drift in SPFx** — the companion lane silently becomes a competing full home.
- **Dashboard drift** — the Personal Work Hub becomes an analytics-heavy summary page rather than a work-first operating layer.
- **Cross-package drift** — domains publish work inconsistently by bypassing shared primitives.
- **Project-scope bleed** — Personal Work Hub absorbs too much Project Hub behavior and loses the personal-first model.
- **Multi-role confusion** — users with multiple auth roles receive noisy or inconsistent home experiences.
- **Trust failure** — stale, syncing, degraded, or notification behaviors make the hub feel misleading or unstable.
- **Premature broad rollout** — the org is forced into a new default home before the first-release source set is useful enough.

---

## 19. Phase 2 Execution Priorities

Recommended implementation-sequencing posture:

1. Lock the **lane ownership** and **Personal Work Hub operating doctrine**.
2. Finalize the **PWA landing transition** and **return/continuity model**.
3. Lock the **zone governance**, **personalization rules**, and **hybrid elevated-role behavior**.
4. Finalize the **first-release source tranche**, **signal mapping**, and **navigation/handoff rules**.
5. Define the **multi-role**, **project-anchor**, and **freshness/trust-state** contracts.
6. Produce the **pilot rollout**, **publication-readiness**, and **validation scorecard** artifacts.
7. Use those artifacts to drive bounded implementation and launch readiness.

---

## 20. Delivered Capability Summary (Planning Level)

| Capability | Coverage | Key deliverables |
|---|---|---|
| Personal operating-layer doctrine | Task-first, personal-first operating model with low-work stability | P2-A1, P2-A2, P2-A3 |
| Lane ownership and coexistence | Explicit PWA vs SPFx rules and anti-drift posture | P2-B0 |
| PWA shell and landing completion | Root routing, landing precedence, return memory, freshness/trust | P2-B1, P2-B2, P2-B3, P2-B4 |
| Shared work publication and signals | First-release sources, notification mapping, routing/handoff rules | P2-C1, P2-C2, P2-C3, P2-C4, P2-C5 |
| Role governance and adaptive layout | Auth-driven entitlement, adaptive zone rules, personalization controls | P2-D1, P2-D2, P2-D3, P2-D4, P2-D5 |
| Multi-role behavior and rollout validation | Role switching, project anchoring, pilot sequencing, scorecard | P2-E1, P2-E2, P2-E3, P2-E4, P2-E5 |

---

## 21. How to Use This Plan Now

| Goal | Start here |
|---|---|
| Understand the purpose and strategic target of Phase 2 | Sections 1–3 |
| See what is in and out of scope | Sections 4–5 |
| Understand lane ownership and coexistence | Section 6 |
| Understand the first-release home experience | Sections 7–9 |
| Review required workstreams and deliverables | Sections 10–12 |
| Review dependency posture and acceptance gates | Sections 13–14 |
| See locked decisions and remaining carry-forward items | Sections 16–17 |
| Plan implementation sequencing | Section 19 |

---

## 22. Related Documents

- `00_HB-Intel_Master-Development-Summary-Plan.md`
- `01_Phase-0_Program-Control-and-Repo-Truth-Plan.md`
- `02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md`
- `phase-0-deliverables/README.md`
- `phase-1-deliverables/README.md`
- `@hbc/my-work-feed` package documentation
- `@hbc/notification-intelligence` package documentation
- `@hbc/project-canvas` package documentation
- `@hbc/auth` package documentation
- work-hub reference documents already present in the repo

