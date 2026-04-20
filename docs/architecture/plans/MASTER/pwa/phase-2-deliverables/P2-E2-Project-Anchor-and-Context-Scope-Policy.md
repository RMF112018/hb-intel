# P2-E2: Project Anchor and Context-Scope Policy

| Field | Value |
|---|---|
| **Doc ID** | P2-E2 |
| **Phase** | Phase 2 |
| **Workstream** | E — Multi-Role Context, Rollout, and Validation |
| **Document Type** | Governance Policy |
| **Owner** | Product + Experience / Shell |
| **Update Authority** | Product lead; changes require review by Experience lead and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §9.4, §10.5, §16, §17](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-C3 §5](P2-C3-Work-Item-Navigation-Matrix.md); [P2-C4 §5](P2-C4-Handoff-Criteria-Matrix.md); [P2-A2 §1.1](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md); [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md); [runway-definition §4](../../../reference/work-hub/runway-definition.md) |

---

## Policy Statement

Project context in the Personal Work Hub is an overlay — it enriches items with project identity and enables filtering and grouping, but does not replace the responsibility-lane model or create separate project-specific views. The project anchor (the user's "most relevant project") is determined by a hybrid rule: preserve the user's pinned project when it is still relevant, otherwise infer the best fit. This policy defines the project context model, anchor resolution, scoped filtering, and the boundary between project-contextualized hub work and Project Hub escalation.

---

## Policy Scope

### This policy governs

- How `context.projectId` binds work items to projects
- The project anchor concept and hybrid resolution rule
- Project-scoped filtering and grouping
- How project context interacts with lane assignment and ranking
- The boundary between project-context in the hub and Project Hub escalation
- Anchor persistence and validation

### This policy does NOT govern

- Project Hub handoff criteria — see [P2-C4](P2-C4-Handoff-Criteria-Matrix.md)
- Navigation patterns per item type — see [P2-C3](P2-C3-Work-Item-Navigation-Matrix.md)
- Ranking coefficients beyond the project-context factor — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Multi-role context switching — see [P2-E1](P2-E1-Multi-Role-Context-Policy.md)
- Final project-anchor inference scoring logic — deferred (Phase 2 §17)

---

## Definitions

| Term | Meaning |
|---|---|
| **Project context** | The `context.projectId` field on an `IMyWorkItem` that links a work item to a specific project |
| **Project anchor** | The user's "most relevant project" — used to provide project-aware filtering and context when the user has work across multiple projects |
| **Pinned project** | A project explicitly selected by the user as their current focus context |
| **Inferred anchor** | A project determined by the system based on the user's work-item distribution and recency |
| **Project-scoped filter** | An `IMyWorkQuery.projectId` filter that shows only items linked to a specific project |
| **Project grouping** | A presentation of items grouped by `context.projectId` before drilling into individual items |

---

## 1. Project Context Model

### 1.1 The `context.projectId` Field

Every `IMyWorkItem` carries an `IMyWorkContext` that may include project binding:

| Field | Type | Meaning |
|---|---|---|
| `context.projectId` | `string \| undefined` | The project this item is linked to |
| `context.projectCode` | `string \| undefined` | Human-readable project code |
| `context.projectName` | `string \| undefined` | Human-readable project name |

### 1.2 How Adapters Set Project Context

| Adapter | Project Context Behavior |
|---|---|
| **BIC adapter** | Sets `projectId` from the source record's project association (if the domain item belongs to a project) |
| **Handoff adapter** | Sets `projectId` from the handoff package's project binding |
| **Notification adapter** | Sets `projectId` from the notification event's source record (if project-linked) |

### 1.3 Not All Items Are Project-Linked

| Scenario | `context.projectId` |
|---|---|
| Provisioning request for a specific project | Present — linked to the project being provisioned |
| Estimating bid readiness for a pursuit | Present — linked to the pursuit's project |
| Admin escalation (system failure) | Absent — not tied to a specific project |
| Notification signal with no project context | Absent |

Items without `context.projectId` are valid hub items. Project context enriches but does not gatekeep.

---

## 2. Project Anchor Concept

The project anchor represents the user's "most relevant project" — a convenience context that affects filtering and grouping but does not change the hub's operating model.

### 2.1 What the Anchor Does

| Capability | Behavior |
|---|---|
| **Default filter** | When set, the hub can pre-filter to show project-linked items first |
| **Project grouping** | Items can be grouped by project, with the anchored project highlighted |
| **Context continuity** | After navigating to a project's domain surface and returning, the anchor preserves project context |
| **Navigation hint** | The anchor influences which project deep-links are most prominent |

### 2.2 What the Anchor Does NOT Do

| Prohibition | Rule |
|---|---|
| **Does not hide items** | Non-anchored items remain visible — the anchor is a lens, not a filter lock |
| **Does not change lanes** | Lane assignment is determined by priority and state, not by project anchor |
| **Does not change ranking** | Items from the anchored project do not get bonus ranking (beyond the standard +100 project-context factor) |
| **Does not create a project dashboard** | The hub remains personal-first; the anchor is context, not a project surface |

---

## 3. Anchor Resolution: Hybrid Rule

Per Phase 2 §16 locked decision: **"Hybrid — preserve relevant pinned project; otherwise infer best-fit anchor."**

### 3.1 Resolution Logic

```
Has the user pinned a project?
├── YES — Is the pinned project still relevant?
│   ├── YES (user has items for this project) → Use pinned project as anchor
│   └── NO (no items, project archived) → Clear pin; fall through to inference
│
└── NO — Infer best-fit anchor
    ├── User has items for exactly 1 project → That project is the inferred anchor
    ├── User has items for multiple projects → Most-recent/highest-activity project (inference logic)
    └── User has no project-linked items → No anchor (null)
```

### 3.2 Hybrid Rules

| Rule | Specification |
|---|---|
| **Pin takes priority** | If the user has explicitly pinned a project, use it as long as it's relevant |
| **Relevance check** | A pinned project is relevant if the user has at least one active work item linked to it |
| **Inference is passive** | The system infers an anchor when no pin exists, but does not force the user to accept it |
| **Anchor is optional** | Users may have no anchor (no pinned project, no project-linked items) — this is a valid state |
| **Pin/unpin is explicit** | Pinning requires user action; inference happens automatically |

### 3.3 Inference Scoring (Carry-Forward)

Per Phase 2 §17: "final project-anchor inference scoring logic" is a carry-forward item.

For first release, the inference uses a simple heuristic:
- Count items per `context.projectId`
- Weight by recency (`updatedAtIso`)
- The project with the highest weighted count becomes the inferred anchor

Detailed scoring (factoring in project importance, blocking status, urgency distribution) is deferred beyond first release.

---

## 4. Project-Scoped Filtering

### 4.1 Filter Mechanism

Project-scoped filtering uses `IMyWorkQuery.projectId`:

| Behavior | Specification |
|---|---|
| **Filter applied** | Feed shows only items where `context.projectId === query.projectId` |
| **Filter cleared** | Feed shows all items regardless of project binding |
| **Anchor pre-filter** | When a project anchor is active, the filter MAY be pre-applied (but user can clear it) |

### 4.2 Project Grouping

Per [runway-definition §4](../../../reference/work-hub/runway-definition.md) and [P2-C4 §5](P2-C4-Handoff-Criteria-Matrix.md):

| Rule | Specification |
|---|---|
| **Grouping is a query projection** | Items grouped by `context.projectId` — not a separate data path |
| **Grouping does not change lane assignment** | Items remain in their responsibility lane within each project group |
| **Grouping does not change ranking** | Items within a group are ranked by the same scoring model |
| **Drill-down** | Grouped view → select project → see all items for that project → drill into specific workspace |

### 4.3 Filtering Invariants

- Project filtering is an overlay on the feed, not a replacement of the lane model.
- Filtering by project does not hide unread items or urgent items — it shows all items for the project across all lanes.
- Users can always clear the project filter to return to the full feed.

---

## 5. Project Context and Lane Assignment

Project context does NOT affect lane assignment:

| Aspect | Rule |
|---|---|
| **Lane determination** | Governed by priority, state, and blocked status (P2-A2 §3) — not by `projectId` |
| **Same lanes for all projects** | Items from different projects use the same 4-lane model (`do-now`, `watch`, `waiting-blocked`, `deferred`) |
| **No project-specific lanes** | Users cannot create project-specific responsibility lanes |
| **Project filter + lanes** | When filtering by project, items still appear in their assigned lanes |

---

## 6. Project Context and Ranking

Per [P2-A2 §1.1](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md) (Scoring Factor 7):

| Factor | Condition | Score Contribution |
|---|---|---|
| **Project context** | `context.projectId` is present | +100 |

### Ranking Rules

- All project-linked items receive the same +100 bonus — the anchored project does not get additional weight.
- Ranking within a project-scoped filter uses the same scoring model as the unfiltered feed.
- No "project importance" scoring factor exists in first release — this is a carry-forward item (§17).

---

## 7. Project-to-Hub vs Project-to-Project-Hub

Per [P2-C4 §2](P2-C4-Handoff-Criteria-Matrix.md) (Project Significance Criteria):

| Work Character | Destination | Anchor Effect |
|---|---|---|
| **Personal-action-oriented** (most items) | Stays in Personal Work Hub | Anchor provides project context for filtering/grouping |
| **Project-coordination-oriented** (health pulse) | Routes to Project Hub | Anchor may align with the navigated project |

### Boundary Rules

- Having `context.projectId` does NOT automatically trigger Project Hub escalation — the work must be materially project-coordination-oriented (P2-C4 §2.3).
- The project anchor influences which items are prominent in the hub, but does not change routing decisions.
- Project Hub routing is determined by the project significance rule, not by the anchor.

---

## 8. Anchor Persistence

### 8.1 Storage

| Aspect | Specification |
|---|---|
| **Existing infrastructure** | `projectStore` in `@hbc/shell` uses Zustand + persist middleware to localStorage |
| **Stored value** | `activeProject: IActiveProject` (projectId, projectName, projectCode) |
| **This is the anchor** | The shell's `activeProject` serves as the project anchor for the hub |

### 8.2 Persistence Rules

| Rule | Specification |
|---|---|
| **Pin persistence** | Pinned project persists across sessions via localStorage |
| **Inference persistence** | Inferred anchor is session-scoped — cleared on logout, re-inferred on next session |
| **Validation on restore** | On return, verify the pinned project still has active items; clear if stale |
| **Cleanup on logout** | Inferred anchor cleared; pinned project MAY persist across sessions (user preference) |

---

## 9. Carry-Forward: Inference Scoring

Per Phase 2 §17: the following are deferred beyond first release:

| Deferred Item | Rationale |
|---|---|
| **Project-anchor inference scoring logic** | Requires usage data to tune; simple heuristic sufficient for pilot |
| **Project importance as a ranking factor** | Requires project-level metadata not yet available in feed |
| **Multi-project dashboard view** | Requires `@hbc/project-canvas` readiness for project-grouped composition |
| **Cross-project attention signals** | Requires cross-project aggregation beyond single-project filtering |

### First-Release Inference

For pilot launch, inference uses item count × recency. This is sufficient because:
- Most users work on 1–3 active projects
- The pinned-project mechanism covers explicit context selection
- Detailed inference improves with usage data collected during pilot

---

## 10. Acceptance Gate Reference

P2-E2 contributes context to multiple gates:

| Gate | P2-E2 Contribution |
|---|---|
| **Handoff gate** | Project context determines when items route to Project Hub vs remain in hub |
| **Continuity gate** | Project anchor persistence ensures project context survives navigation |
| **Work-surface gate** | Project context enriches without creating a project dashboard |

---

## 11. Locked Decisions

| Decision | Locked Resolution | P2-E2 Consequence |
|---|---|---|
| Project anchor rule | **Hybrid — preserve relevant pinned project; otherwise infer best-fit anchor** | Pin-first resolution with inference fallback |
| Project Hub handoff rule | **Use a project significance rule** | `context.projectId` alone does not trigger Project Hub routing |
| Top-level organization | **Responsibility lanes first, with time-horizon cues layered inside** | Project context is an overlay, not a lane-replacement |

---

## 12. Policy Precedence

| Deliverable | Relationship to P2-E2 |
|---|---|
| **P2-C3** — Navigation Matrix | P2-C3 §5 defines project context binding for deep links; P2-E2 defines the anchor policy |
| **P2-C4** — Handoff Criteria | P2-C4 §2 defines project significance for routing; P2-E2 defines when `projectId` enriches vs escalates |
| **P2-A2** — Ranking Policy | P2-A2 §1.1 defines the +100 project-context scoring factor; P2-E2 confirms no anchor-specific bonus |
| **P2-B2** — State Persistence | Anchor persistence uses existing `projectStore` (Zustand + localStorage) |
| **P2-E1** — Multi-Role Context | P2-E2 project context interacts with role context — an Executive's project anchor affects their team-mode view |

If a downstream deliverable introduces project-scoping behavior that replaces the lane model or creates project-specific dashboards, this policy takes precedence.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §10.5, §16, §17](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
