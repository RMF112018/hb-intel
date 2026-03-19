# P2-B0: Phase 2 Lane Ownership and Coexistence Rules

| Field | Value |
|---|---|
| **Doc ID** | P2-B0 |
| **Phase** | Phase 2 |
| **Workstream** | B — PWA Shell, Landing Transition, and Lane Ownership |
| **Document Type** | Governance Policy |
| **Owner** | Architecture + Experience / Shell |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Platform lead |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | [Phase 2 Plan §6–§9, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P0-B1](../phase-0-deliverables/P0-B1-Production-Readiness-Matrix.md); [package-relationship-map](../../../blueprint/package-relationship-map.md) |

---

## Policy Statement

HB Intel operates two application lanes — PWA and SPFx — that serve different purposes within a single governed platform. This policy establishes the mandatory ownership boundaries, coexistence rules, and anti-drift constraints that govern how those lanes divide responsibility during Phase 2 and its first release. All downstream design, implementation, and review work within Phase 2 must conform to these rules. Violations require explicit Architecture-lead approval and must be documented as exceptions with a remediation timeline.

---

## Policy Scope

### This policy governs

- Which lane owns each category of user experience (home, feed, completion, personalization, handoff)
- What SPFx may and may not do relative to the PWA
- Which shared primitives and vocabulary must remain consistent across both lanes
- What constitutes prohibited lane drift
- How `@hbc/project-canvas` composition authority is constrained by lane
- How first-release work publication must flow through shared primitives
- The acceptance gate that validates lane-boundary compliance

### This policy does NOT govern

- Root routing, landing precedence, or redirect-memory specifics — see P2-B1
- Hub state persistence and return-memory contracts — see P2-B2
- Freshness, refresh, and staleness trust rules — see P2-B3
- Cross-device shell behavior — see P2-B4
- Adaptive layout zone governance and personalization rules — see P2-D2 and P2-D5
- Ranking, lane structure, and time-horizon cues — see P2-A2
- First-release source tranche classification — see P2-C1
- Work-item navigation and handoff criteria — see P2-C3 and P2-C4

---

## Definitions

| Term | Meaning |
|---|---|
| **Lane** | An application host surface (PWA or SPFx) with its own deployment, shell, and runtime context, operating within a single governed platform |
| **Full home experience** | The complete Personal Work Hub operating layer: full feed, filtering, role-aware composition, context retention, deeper workflow continuation, and personalization |
| **Companion surface** | A bounded, curated view that provides summary, counts, limited item lists, and light actions — but does not replicate the full home experience |
| **Curated composition** | A fixed or role-defaulted arrangement of UI components without freeform user-driven layout control; contrast with adaptive composition via `@hbc/project-canvas` |
| **Light action** | An interaction that can be completed in a single step without requiring multi-step workflow context, extended state, or deep domain navigation |
| **Shared primitive** | A cross-lane package that provides canonical models, contracts, or behavior used identically by both lanes (e.g., `@hbc/my-work-feed`, `@hbc/notification-intelligence`, `@hbc/auth`) |
| **Work publication** | The process by which a business domain makes work items visible in the Personal Work Hub through shared aggregation contracts |
| **Lane-boundary gate** | The Phase 2 acceptance gate (§14) that validates PWA and SPFx responsibilities are explicit and no second full home has emerged in SPFx |

---

## Lane Model

The following matrix defines ownership for each concern across the two lanes and shared platform work.

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

---

## First-Release Lane Doctrine

The following rules are locked for the Phase 2 first release:

1. The **PWA** MUST be the full operating home for the Personal Work Hub.
2. The **SPFx** MUST operate as a richer companion lane. It MUST NOT become a competing or parallel full home.
3. The SPFx companion surface MAY expose:
   - counts,
   - summary cards,
   - a limited item list,
   - and selected light actions.
4. The SPFx companion surface MUST NOT provide:
   - deeper workflow context or multi-step interaction,
   - full work-item completion,
   - rich personalization or freeform layout controls,
   - or the full operating-layer logic that defines the Personal Work Hub.
5. Any interaction that requires deeper workflow context, multi-step interaction, or extended continuity MUST route to the **PWA**.

---

## Cross-Lane Consistency Rules

The following MUST remain consistent across both lanes:

1. Auth and role resolution semantics
2. Work-item identity and canonical shape
3. Notification-to-work signal semantics
4. Action/deep-link vocabulary
5. Freshness, stale, syncing, degraded, and offline status meanings
6. Delegated/team visibility entitlement rules
7. Telemetry event names for launch, open, action, handoff, and abandonment
8. Project/context handoff semantics where applicable

---

## Anti-Drift Rules

The following are **prohibited** during Phase 2. Violations require Architecture-lead exception approval.

1. **Separate work-item models.** Implementing distinct work-item models for PWA and SPFx is prohibited. Both lanes MUST consume the canonical model from shared primitives.
2. **Lane-specific ranking.** Creating separate ranking systems per lane is prohibited. Ranking inputs and logic MUST be shared.
3. **SPFx home escalation.** Allowing SPFx to silently grow into a second full home experience is prohibited. Any SPFx scope expansion beyond the companion surface boundary defined in this policy requires explicit Architecture-lead approval.
4. **Unrestricted dashboard composition.** Allowing unrestricted dashboard composition in either lane is prohibited. The PWA uses governed adaptive composition; SPFx uses curated composition only.
5. **Shared primitive bypass.** Bypassing `@hbc/my-work-feed` and `@hbc/notification-intelligence` for first-release publication patterns where those shared primitives already cover the need is prohibited.

---

## Home Model by Role

| User type | First-release landing behavior |
|---|---|
| Standard roles | Personal work first |
| Elevated roles | Hybrid landing: personal work first, then team / delegated / portfolio attention |
| Multi-role users | Personal work within the active role context, with controlled switching |
| Admin-only exception contexts | May still use admin-specific landing behavior where explicitly required |

---

## SPFx Composition Constraint

`@hbc/project-canvas` is approved as the governing adaptive-layout foundation for the **PWA Personal Work Hub** only, with these constraints:

- First-release PWA use is focused on **secondary and tertiary zones**, plus governed supporting composition around the primary runway.
- The core task-first operating region remains protected and not fully user-removable.
- SPFx companion surfaces MUST use **curated composition**, not full freeform canvas behavior, until host suitability and supportability are proven.

This constraint prevents the SPFx lane from acquiring layout flexibility that would enable it to evolve into a competing full home experience.

---

## Shared Primitive Binding

Phase 2 first-release work publication MUST use the existing shared primitives rather than creating parallel operating models:

| Primitive | Role | Lane binding |
|---|---|---|
| `@hbc/my-work-feed` | Primary aggregation primitive for cross-module personal work | Both lanes consume; PWA owns full feed experience, SPFx consumes for companion summary |
| `@hbc/notification-intelligence` | Governing signal layer for notification-fed surfacing | Both lanes consume; notifications feed the hub, hub remains the main work surface |
| `@hbc/auth` | Role resolution and entitlement source | Both lanes consume identically |
| `@hbc/session-state` | Offline-safe session persistence | PWA owns primary trust model; SPFx exposes consistent status cues |
| `@hbc/shell` | Global navigation and layout | PWA shell; SPFx uses `@hbc/app-shell` aggregator |

Domain teams MUST publish work into the hub through these shared contracts. Direct feature-to-hub coupling that bypasses the shared publication model is prohibited per Anti-Drift Rule 5.

---

## Acceptance Gate Reference

**Gate:** Lane-boundary gate

| Field | Value |
|---|---|
| **Pass condition** | PWA and SPFx responsibilities are explicit and no second full home emerges in SPFx |
| **Evidence required** | P2-B0 (this document), design review signoff, scope map |
| **Primary owner** | Architecture + Experience |

This document is the primary evidence artifact for the lane-boundary gate. Design review signoff and scope map are companion evidence produced during implementation.

---

## Locked Decisions Relevant to Lane Ownership

The following decisions from Phase 2 §16 are locked and directly govern lane ownership:

| Decision | Locked resolution |
|---|---|
| Full Personal Work Hub ownership | **PWA first** |
| SPFx posture | **Richer companion lane**, not the full home |
| SPFx action model | **Light actions only**; deeper work and full completion stay in PWA |
| Elevated-role landing | **Hybrid** — personal work first, then team / delegated / portfolio attention |
| Personalization | **Moderately governed** |
| Low-work default | Stay on Personal Work Hub with smart empty-state + governed fallback content |
| Layout model | Adaptive layout using `@hbc/project-canvas`, constrained by zone governance |
| Delegated/team lanes | Limited and only for eligible elevated roles |
| Notification relationship | Notifications feed the hub via `@hbc/notification-intelligence`; hub remains the main work surface |
| Multi-role default | Primary active role context |

---

## Policy Precedence

This policy establishes the **lane-ownership foundation** that downstream Phase 2 deliverables must conform to:

| Deliverable | Relationship to P2-B0 |
|---|---|
| **P2-B1** — Root Routing and Landing Precedence | Must implement landing behavior consistent with the lane model and home-model-by-role defined here |
| **P2-B2** — Hub State Persistence and Return-Memory | Must respect PWA ownership of full handoff and return continuity |
| **P2-B3** — Freshness, Refresh, and Staleness Trust | Must respect PWA ownership of the primary trust model and cross-lane consistency rule 5 |
| **P2-B4** — Cross-Device Shell Behavior | Must operate within the lane boundaries defined here |
| **P2-D2** — Adaptive Layout and Zone Governance | Must enforce the SPFx composition constraint (curated only) defined here |
| **P2-D5** — Personalization Policy and Saved-View Rules | Must enforce PWA-only moderated layout controls per the lane model |
| **P2-C1–C5** — Work Sources, Signals, Handoff | Must use the shared primitive binding defined here |

If a downstream deliverable conflicts with this policy, this policy takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-19
**Governing Authority:** [Phase 2 Plan §6](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
