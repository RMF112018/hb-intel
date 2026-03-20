# P2-B0: Phase 2 Lane Ownership and Coexistence Rules

| Field | Value |
|---|---|
| **Doc ID** | P2-B0 |
| **Phase** | Phase 2 |
| **Workstream** | B — PWA Shell, Landing Transition, and Lane Ownership |
| **Document Type** | Governance Policy |
| **Owner** | Architecture + Experience / Shell |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Platform lead |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §6–§9, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A1](./P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-A3](./P2-A3-Work-Item-Explainability-and-Visibility-Rules.md); [current-state-map](../../../blueprint/current-state-map.md); [package-relationship-map](../../../blueprint/package-relationship-map.md) |

---

## Policy Statement

HB Intel operates two application lanes — **PWA** and **SPFx** — that serve different purposes within a single governed platform. This policy establishes the mandatory ownership boundaries, coexistence rules, repo-truth reconciliation requirements, and anti-drift constraints that govern how those lanes divide responsibility during Phase 2 and its first release.

The **PWA** is the full operating home for the Personal Work Hub. **SPFx** is a bounded SharePoint-native companion lane that may expose summary, governed limited item lists, and light actions, but MUST NOT become a second full operating home.

This document is normative for Phase 2. Where current repo truth does not yet fully match this policy, the divergence MUST be explicitly documented as one of the following:

- **Controlled evolution** — target-state rule is intentionally ahead of implementation
- **Known current-state constraint** — repo truth limits the first-release scope
- **Superseded approach** — older documentation or implementation seam exists but is no longer governing

Violations require explicit Architecture-lead approval and must be documented as exceptions with a remediation timeline.

---

## Policy Scope

### This policy governs

- Which lane owns each category of user experience (home, feed, completion, personalization, handoff)
- What SPFx may and may not do relative to the PWA
- Which shared primitives and vocabulary must remain consistent across both lanes
- What constitutes prohibited lane drift
- How `@hbc/project-canvas` composition authority is constrained by lane for the **Personal Work Hub**
- How first-release work publication must flow through shared primitives
- How team / delegated visibility is split across lanes in first release
- The acceptance gate that validates lane-boundary compliance

### This policy does NOT govern

- Root routing, landing precedence, or redirect-memory specifics — see P2-B1
- Hub state persistence and return-memory contracts — see P2-B2
- Freshness, refresh, and staleness trust rules — see P2-B3
- Cross-device shell behavior — see P2-B4
- Adaptive layout zone governance and personalization rules — see P2-D2 and P2-D5
- Ranking, lane structure, and time-horizon cues — see P2-A2
- Explainability and visibility disclosure rules — see P2-A3
- First-release source tranche classification — see P2-C1
- Work-item navigation and handoff criteria — see P2-C3 and P2-C4

---

## Definitions

| Term | Meaning |
|---|---|
| **Lane** | An application host surface (PWA or SPFx) with its own deployment, shell, and runtime context, operating within a single governed platform |
| **Full home experience** | The complete Personal Work Hub operating layer: full feed, filtering, role-aware composition, context retention, deeper workflow continuation, and personalization |
| **Companion surface** | A bounded, curated view that provides summary, counts, approved limited item lists, and light actions — but does not replicate the full home experience |
| **Curated composition** | A fixed or role-defaulted arrangement of UI components without freeform user-driven layout control; contrast with adaptive composition via `@hbc/project-canvas` |
| **Light action** | An interaction that can be completed in a single step without requiring multi-step workflow context, extended state, or deep domain navigation |
| **Shared primitive** | A cross-lane package that provides canonical models, contracts, or behavior used identically by both lanes (for example `@hbc/my-work-feed`, `@hbc/notification-intelligence`, `@hbc/auth`) |
| **Work publication** | The process by which a business domain makes work items visible in the Personal Work Hub through shared aggregation contracts |
| **Lane-boundary gate** | The Phase 2 acceptance gate that validates PWA and SPFx responsibilities are explicit and no second full home has emerged in SPFx |
| **Governed limited item list** | A constrained item list approved for first-release companion use. In Phase 2 this may include `delegated-by-me` and `escalation-candidate` scopes, but not true direct-report `my-team` item visibility |

---

## Lane Model

The following matrix defines ownership for each concern across the two lanes and shared platform work.

| Concern | PWA lane | SPFx lane | Shared cross-lane platform work |
|---|---|---|---|
| Primary home experience | **Owns full Personal Work Hub** | Does not own the full home | Route semantics, auth state, entitlement vocabulary |
| Default landing | **Owns default steady-state landing** (`/my-work`) for approved rollout cohorts | No default-host takeover in this phase | Redirect memory, post-auth precedence rules |
| Personal work feed | **Owns full feed, filtering, role-aware composition, context retention** | May show governed companion summary/list | Canonical work-item model, dedupe, ranking inputs |
| Rich companion summary | May include within shell/home | **Owns richer companion view** for summary, governed limited item lists, and light actions | Shared publication model and telemetry |
| Item completion | **Owns deeper workflow continuation and full completion** | Limited to light actions only | Deep-link rules, action metadata, state vocabulary |
| Personalization | **Owns moderated layout controls** | Curated composition only in first release | Saved-view rules, entitlement rules |
| Team/delegated visibility | **Owns elevated-role hybrid landing and any future true direct-report item visibility** | May expose summary plus governed limited item lists for approved scopes only | Role, delegation, and entitlement vocabulary |
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
   - a governed limited item list,
   - and selected light actions.
4. For first release, SPFx governed limited item lists are restricted to approved scopes such as:
   - `delegated-by-me`
   - `escalation-candidate`
5. The SPFx companion surface MUST NOT provide:
   - deeper workflow context or multi-step interaction,
   - full work-item completion,
   - rich personalization or freeform layout controls,
   - a true direct-report `my-team` item list,
   - or the full operating-layer logic that defines the Personal Work Hub.
6. Any interaction that requires deeper workflow context, multi-step interaction, extended continuity, or full item-level team review MUST route to the **PWA**.
7. **Future completion note:** true direct-report item visibility remains deferred until **org-chart / entitlement plumbing** is completed and explicitly approved in a later phase.

---

## Cross-Lane Consistency Rules

The following MUST remain consistent across both lanes:

1. Auth and role resolution semantics
2. Work-item identity and canonical shape
3. Notification-to-work signal semantics
4. Action/deep-link vocabulary
5. Freshness, stale, syncing, degraded, and offline status meanings
6. Delegated/team visibility entitlement vocabulary and scope names
7. Telemetry event names for launch, open, action, handoff, and abandonment
8. Project/context handoff semantics where applicable
9. Repo-truth reconciliation labels where current implementation diverges from target-state policy

---

## Anti-Drift Rules

The following are **prohibited** during Phase 2. Violations require Architecture-lead exception approval.

1. **Separate work-item models.** Implementing distinct work-item models for PWA and SPFx is prohibited. Both lanes MUST consume the canonical model from shared primitives.
2. **Lane-specific ranking.** Creating separate ranking systems per lane is prohibited. Ranking inputs and logic MUST be shared.
3. **SPFx home escalation.** Allowing SPFx to silently grow into a second full home experience is prohibited. Any SPFx scope expansion beyond the companion surface boundary defined in this policy requires explicit Architecture-lead approval.
4. **Unrestricted dashboard composition.** Allowing unrestricted dashboard composition in either lane is prohibited. The PWA uses governed adaptive composition; SPFx uses curated composition only.
5. **Shared primitive bypass.** Bypassing `@hbc/my-work-feed` and `@hbc/notification-intelligence` for first-release publication patterns where those shared primitives already cover the need is prohibited.
6. **Shell-authority duplication.** Treating SPFx-specific shell convenience seams as a second canonical shell authority is prohibited. `@hbc/shell` remains canonical.
7. **Direct-report entitlement overstatement.** Shipping or documenting true direct-report item visibility before org-chart / entitlement plumbing is complete is prohibited.

---

## Home Model by Role

| User type | First-release landing behavior |
|---|---|
| Standard roles | Personal work first |
| Elevated roles | Hybrid landing: personal work first, then team / delegated / portfolio attention |
| Multi-role users | Personal work within the active role context, with controlled switching |
| Admin-only exception contexts | May still use admin-specific landing behavior where explicitly required |

**Interpretation note:** for first release, elevated-role companion visibility in SPFx may include summary plus governed limited item lists for approved scopes only. It does **not** imply that true direct-report `my-team` item visibility is complete.

---

## SPFx Composition Constraint

`@hbc/project-canvas` is approved as the governing adaptive-layout foundation for the **PWA Personal Work Hub** in Phase 2, with these constraints:

- First-release PWA use is focused on **secondary and tertiary zones**, plus governed supporting composition around the primary runway.
- The core task-first operating region remains protected and not fully user-removable.
- SPFx companion surfaces MUST use **curated composition**, not full freeform canvas behavior, until host suitability and supportability are proven.
- This rule applies to the **Personal Work Hub lane doctrine**. It does **not** declare package-wide PWA exclusivity for all existing or separately governed uses of `@hbc/project-canvas` outside this scope.

This constraint prevents the SPFx lane from acquiring layout flexibility that would enable it to evolve into a competing full home experience, while preserving the long-term shared-core architecture direction for host-appropriate reuse.

---

## Shared Primitive Binding

Phase 2 first-release work publication MUST use the existing shared primitives rather than creating parallel operating models:

| Primitive | Role | Lane binding |
|---|---|---|
| `@hbc/my-work-feed` | Primary aggregation primitive for cross-module personal work | Both lanes consume; PWA owns full feed experience, SPFx consumes for companion summary and governed limited item lists |
| `@hbc/notification-intelligence` | Governing signal layer for notification-fed surfacing | Both lanes consume; notifications feed the hub, hub remains the main work surface |
| `@hbc/auth` | Role resolution and entitlement source | Both lanes consume identically |
| `@hbc/session-state` | Offline-safe session persistence | PWA owns primary trust model; SPFx exposes consistent status cues |
| `@hbc/shell` | Canonical global shell authority | PWA and SPFx both align to this canonical shell model |
| `@hbc/app-shell` | Optional SPFx / Project Hub convenience aggregator | May be used where helpful in SPFx contexts; not a mandatory permanent architectural seam |

Domain teams MUST publish work into the hub through these shared contracts. Direct feature-to-hub coupling that bypasses the shared publication model is prohibited per Anti-Drift Rule 5.

---

## Repo-Truth Reconciliation Notes

The following reconciliations are locked for Phase 2 and MUST be honored in downstream design and implementation reviews:

1. **`@hbc/project-canvas` scope reconciliation**  
   Current repo truth already supports SPFx-safe use of `@hbc/project-canvas` in governed contexts outside the Personal Work Hub. This policy does **not** invalidate those uses. For Phase 2 lane doctrine, it only locks adaptive-layout authority for the **PWA Personal Work Hub**.

2. **`@hbc/app-shell` posture reconciliation**  
   Current repo truth treats `@hbc/app-shell` as a convenience/facade layer rather than a mandatory permanent architectural boundary. This policy preserves that posture. `@hbc/shell` remains canonical.

3. **Team/direct-report visibility reconciliation**  
   Current shared feed seams expose delegation-oriented team scopes, but true direct-report item visibility is not yet considered complete. Phase 2 first release may use summary plus governed limited item lists for approved scopes, while full direct-report item visibility remains deferred pending org-chart / entitlement plumbing.

4. **Current-state-map reconciliation requirement**  
   Any implementation or design artifact claiming lane-boundary compliance MUST explicitly annotate where current implementation is:
   - compliant,
   - controlled evolution,
   - known constrained current state,
   - or superseded.

---

## Acceptance Gate Reference

**Gate:** Lane-boundary gate

| Field | Value |
|---|---|
| **Pass condition** | PWA and SPFx responsibilities are explicit, no second full home emerges in SPFx, and known repo-truth divergences are explicitly reconciled |
| **Evidence required** | P2-B0 (this document), design review signoff, scope map, repo-truth reconciliation note / exception register |
| **Primary owner** | Architecture + Experience |

This document is the primary evidence artifact for the lane-boundary gate. Design review signoff, scope map, and repo-truth reconciliation notes are companion evidence produced during implementation.

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
| `@hbc/project-canvas` lane scope | **PWA Personal Work Hub authority in Phase 2**, not package-wide PWA exclusivity |
| `@hbc/app-shell` posture | **Optional SPFx convenience layer**; `@hbc/shell` remains canonical |
| SPFx team/delegated visibility | Summary plus governed limited item lists for approved scopes only |
| Direct-report item visibility | **Deferred** until org-chart / entitlement plumbing is completed |
| Notification relationship | Notifications feed the hub via `@hbc/notification-intelligence`; hub remains the main work surface |
| Multi-role default | Primary active role context |

---

## Long-Term Target Architecture Note

The long-term target remains a **shared capability core with host-specific experience envelopes**:

- **PWA** = full operating shell and primary work-home runtime
- **SPFx** = constrained SharePoint-native companion
- shared primitives may be reused across both hosts where appropriate
- SPFx does **not** become a second full operating shell

This note is directional and does not weaken the first-release lane boundaries defined above.

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
| **Any implementation readiness / review artifact** | Must include repo-truth reconciliation notes where current-state and target-state differ |

If a downstream deliverable conflicts with this policy, this policy takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-20  
**Governing Authority:** [Phase 2 Plan §6](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
