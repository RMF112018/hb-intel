# P2-C4: Personal Work Hub / Domain / Project Hub Handoff Criteria Matrix

| Field | Value |
|---|---|
| **Doc ID** | P2-C4 |
| **Phase** | Phase 2 |
| **Workstream** | C — Shared Work Sources, Signals, and Handoff Rules |
| **Document Type** | Specification |
| **Owner** | Product + Experience / Shell |
| **Update Authority** | Product lead; changes require review by Experience lead and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §9.4, §10.3, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-C3](P2-C3-Work-Item-Navigation-Matrix.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md); [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md); `@hbc/workflow-handoff`; `handoff-config.ts` |

---

## Specification Statement

Work items in the Personal Work Hub navigate to one of three surfaces: back to the hub (in-place action), out to a domain surface (domain-specific work), or up to Project Hub (project-coordination work). This specification defines the criteria that determine which surface receives each work item, the per-source handoff matrix, workflow-handoff primitive integration rules, project context binding, and return path contracts. The governing principle is the **project significance rule** — work that is materially project-coordination-oriented routes to Project Hub; everything else routes to the authoritative domain surface.

---

## Spec Scope

### This specification governs

- The three-surface handoff model (hub, domain, Project Hub)
- Project significance criteria and decision logic
- Per-source handoff routing with explicit conditions
- Workflow-handoff primitive integration (`@hbc/workflow-handoff`)
- Project context binding and grouping rules
- Return path contracts from each surface
- SPFx handoff behavior constraints

### This specification does NOT govern

- Navigation patterns and deep-link construction — see [P2-C3](P2-C3-Work-Item-Navigation-Matrix.md)
- Source tranche classification — see [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md)
- Notification-to-work signal mapping — see [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md)
- Ranking and scoring — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Project-anchor inference scoring — deferred to P2-E2

---

## Definitions

| Term | Meaning |
|---|---|
| **Handoff** | The transfer of user attention from one surface to another, with context preservation and a defined return path |
| **Project significance** | The degree to which a work item requires project-level context, cross-team coordination, or project-scoped decision-making to resolve |
| **Domain surface** | The authoritative workspace for a specific business domain (e.g., Estimating bid readiness view, BD score dashboard) |
| **Return path** | The navigation route and state restoration that brings a user back to the Personal Work Hub after acting on a work item at another surface |
| **Handoff package** | The structured payload (`IHandoffPackage`) used by `@hbc/workflow-handoff` for formal cross-module transfers |

---

## 1. Three-Surface Model

Phase 2 establishes a three-surface handoff model. Every work-item interaction ultimately resolves to one of these surfaces:

| Surface | Purpose | Examples |
|---|---|---|
| **Personal Work Hub** (`/my-work`) | In-place actions on feed items without navigation | Mark-read, defer, pin, waiting-on |
| **Domain Surface** | Authoritative workspace for domain-specific work | Accounting request detail, Estimating bid readiness, BD score dashboard |
| **Project Hub** (`/project-hub`) | Project-centered operating layer for cross-team coordination | Project health overview, project-scoped work grouping |

### 1.1 Surface Ownership

Per [P2-B0 Lane Model](P2-B0-Lane-Ownership-and-Coexistence-Rules.md):

| Concern | PWA Personal Work Hub | Domain Surface | Project Hub |
|---|---|---|---|
| Personal work feed | **Owns** | — | — |
| Domain-specific actions | Routes to | **Owns** | — |
| Project coordination | Routes to (via escalation) | May link to | **Owns** |
| Return continuity | **Owns** return path | Provides "Back to My Work" | Provides "Back to My Work" |

### 1.2 Surface Selection Invariants

- The hub NEVER performs domain mutations — domain work happens at the domain surface (per [interaction-contract §4](../../../reference/work-hub/interaction-contract.md)).
- Project Hub NEVER absorbs Personal Work Hub responsibilities — it receives only project-coordination-oriented items.
- Every navigation away from the hub MUST have a return path that preserves user context (per P2-B2 §6).

---

## 2. Project Significance Criteria

The project significance rule determines whether a work item routes to a domain surface or escalates to Project Hub.

### 2.1 Decision Logic

```
Is the work item materially project-coordination-oriented?
├── YES → Route to Project Hub
│   Criteria:
│   ├── Item represents project-level status or health (not individual task)
│   ├── Item requires cross-team visibility to resolve
│   ├── Item's resolution affects project timeline or coordination
│   └── Item's context.projectId links to an active project with multi-stakeholder involvement
│
└── NO → Route to Domain Surface
    Criteria:
    ├── Item is owned by a specific user for personal action
    ├── Item can be resolved by the owner without project-level coordination
    ├── Item is domain-specific (estimating, BD, provisioning) rather than project-scoped
    └── Even if item has context.projectId, the work is personal-action-oriented
```

### 2.2 Project Significance Indicators

| Indicator | Weight | Meaning |
|---|---|---|
| Item source is `project-hub-health-pulse` | Strong | Health pulse is inherently project-coordination-oriented |
| Item has `context.projectId` AND involves cross-team coordination | Moderate | Project-linked but requires multi-stakeholder attention |
| Item uses `@hbc/workflow-handoff` for cross-module transfer | Moderate | Handoff implies cross-boundary coordination |
| Item has `context.projectId` but is personal-action | Weak | Project context exists but work is individually owned |
| Item has no `context.projectId` | None | No project binding — domain surface only |

### 2.3 Significance Invariants

- Project significance determines navigation **destination**, not feed **ranking** (P2-C3 §6.3).
- Having `context.projectId` alone does NOT automatically trigger Project Hub escalation — the work must be materially project-coordination-oriented.
- The majority of first-release items are personal-action-oriented and route to domain surfaces.
- Detailed project-anchor inference scoring logic is deferred to P2-E2 (Phase 2 §17 carry-forward).

---

## 3. Per-Source Handoff Matrix

| Source | Default Destination | Escalation to Project Hub? | Conditions for Escalation | Workflow-Handoff Used? |
|---|---|---|---|---|
| **Provisioning** | Domain surface (Accounting/Estimating request detail) | On completion only | Completed provisioning request hands off to Project Hub via workflow-handoff | Yes — completion handoff |
| **Estimating Bid Readiness** | Domain surface (Estimating bid readiness view) | No | Personal-action: user reviews bid readiness for a specific pursuit | No |
| **BD Score Benchmark** | Domain surface (BD score dashboard) | No | Personal-action: user reviews scoring for a specific pursuit | No |
| **BD Strategic Intelligence** | Domain surface (BD intelligence entry view) | No | Personal-action: user reviews intelligence for a specific entry | No |
| **Project Hub Health Pulse** | Project Hub (health overview) | Yes — default | Health pulse is inherently project-coordination-oriented | No |
| **Admin Escalations** | Domain surface (Admin provisioning oversight) | No | Personal-action: admin acts on specific failed provisioning | No |

### 3.1 Provisioning Handoff Detail

Provisioning is the only first-release source that uses the formal workflow-handoff primitive:

| Phase | Surface | Action |
|---|---|---|
| Request lifecycle (draft → approval → provisioning) | Domain surface | Personal-action: user manages their request |
| Completion handoff (provisioning complete → Project Hub) | Workflow-handoff | Formal handoff: provisioning creates Project Hub seed data |
| Post-handoff project work | Project Hub | Project-coordination: project lead manages the new project |

**Handoff readiness validation** (from `packages/provisioning/src/handoff-config.ts`):
- Request state must be `'Completed'`
- `siteUrl` must be available
- `projectLeadId` must be assigned

### 3.2 Project Hub Health Pulse Detail

Health pulse items route directly to Project Hub because they represent project-level health status:

| Item Urgency | Destination | Deep-Link |
|---|---|---|
| `critical` (immediate) | Project Hub health view | `/project-hub/health/{projectId}` |
| `at-risk` (watch) | Project Hub health view | `/project-hub/health/{projectId}` |
| `watch` (upcoming) | Project Hub health view | `/project-hub/health/{projectId}` |

No workflow-handoff is involved — health pulse items navigate directly to Project Hub via `context.href`.

---

## 4. Workflow-Handoff Integration

### 4.1 When Workflow-Handoff Is Used

The `@hbc/workflow-handoff` primitive is used for **formal cross-module transfers** — not for simple navigation. In the first release, only Provisioning uses it.

| Criterion | Use Workflow-Handoff | Use Direct Navigation |
|---|---|---|
| Work transfers ownership to a different module | ✅ | — |
| Work requires seed data creation at destination | ✅ | — |
| Work requires recipient acknowledgment | ✅ | — |
| User simply navigates to view an item | — | ✅ |
| User navigates to Project Hub for status review | — | ✅ |

### 4.2 Handoff Lifecycle

Per `@hbc/workflow-handoff` (ADR-0097), the 5-state machine:

```
draft → sent → received → acknowledged | rejected
```

| State | Meaning | My Work Feed Impact |
|---|---|---|
| `draft` | Sender composing handoff package | No feed item created |
| `sent` | Package dispatched to recipient | Handoff adapter creates feed item for recipient (`do-now` lane) |
| `received` | Recipient opened the package | Feed item remains in recipient's feed |
| `acknowledged` | Recipient accepted the work | Feed item marked complete; source item updated |
| `rejected` | Recipient declined the work | Feed item returns to sender; escalation may trigger |

### 4.3 Reference Implementation

`packages/provisioning/src/handoff-config.ts` defines the canonical handoff route:
- **Source module:** `provisioning`
- **Destination module:** `project-hub`
- **Seed data:** projectName, projectNumber, department, siteUrl, projectLeadId, groupMembers
- **Recipient resolution:** Project Lead (from `projectLeadId`)
- **Readiness validation:** State `'Completed'`, siteUrl available, projectLeadId assigned

All future sources that use workflow-handoff MUST follow this configuration pattern.

### 4.4 Handoff UI Components

| Component | Purpose | Used By |
|---|---|---|
| `HbcHandoffComposer` | Sender-side composition (4-step flow) | Provisioning completion |
| `HbcHandoffReceiver` | Recipient-side review/acknowledge/reject | Project Hub intake |
| `HbcHandoffStatusBadge` | Inline status indicator | Feed item display |

---

## 5. Project Context Binding

### 5.1 `context.projectId` Role

The `context.projectId` field on `IMyWorkItem` links a work item to a specific project. Its presence affects:

| Behavior | With `projectId` | Without `projectId` |
|---|---|---|
| Project-linked grouping | Item can be filtered/grouped by project | Item appears only in lane-based view |
| Project Hub eligibility | Eligible for Project Hub routing if project-significant | Not eligible for Project Hub routing |
| Project-anchor inference | Item contributes to "most relevant project" calculation | No project-anchor contribution |

### 5.2 Project Grouping Rules

Items with `context.projectId` can be grouped for a project-level view before drilling into specific workspace surfaces (per [runway-definition §4](../../../reference/work-hub/runway-definition.md)):

| Rule | Specification |
|---|---|
| Grouping is a query projection | Items are grouped by `context.projectId` using `IMyWorkQuery.projectId` filter |
| Grouping does not change lane assignment | Items remain in their responsibility lane; grouping is a filter overlay |
| Grouping does not change ranking | Items within a project group are ranked by the same scoring model |
| Project drill-down | Grouped view → select project → see all items for that project → drill into specific workspace |

### 5.3 Context Binding Invariants

- `context.projectId` is set by source adapters during item mapping — the hub does not infer project binding.
- Multiple items from different sources may share the same `context.projectId`.
- Items without `context.projectId` are valid — not all work is project-linked.
- Project-anchor inference (determining the user's "most relevant project") is deferred to P2-E2.

---

## 6. Return Path Contracts

### 6.1 Per-Destination Return Behavior

| Destination | Return Mechanism | State Restoration | Feed Behavior |
|---|---|---|---|
| **Domain Surface** | Shell nav "My Work", browser back, "Back to My Work" link | Team mode, filters, scroll position restored from P2-B2 drafts | Feed refreshes to reflect domain mutations |
| **Project Hub** | Shell nav "My Work", browser back | Team mode, filters, scroll position restored from P2-B2 drafts | Feed refreshes; project-linked items may have updated state |
| **In-place (hub)** | No navigation needed | State unchanged | Optimistic update applied immediately |

### 6.2 Return Path Requirements

| Requirement | Rule |
|---|---|
| **Context preservation** | Return to hub restores team mode, filter context, and scroll position per P2-B2 §6 |
| **Feed refresh** | Feed re-fetches from source adapters on return to reflect any domain/project mutations |
| **No redirect** | Return MUST land on `/my-work` regardless of task queue depth (P2-A1 §1.2) |
| **Handoff completion** | When a workflow-handoff is acknowledged, the sender's feed item reflects completion on next refresh |
| **Browser history** | Standard browser history works correctly — no custom return-stack management |

### 6.3 Return Path Invariant

Every navigation away from `/my-work` MUST have a viable return path. If the destination surface is unavailable (404, permission denied), the user is returned to `/my-work` with an appropriate error state — never stranded on a broken page.

---

## 7. SPFx Handoff Behavior

Per [P2-B0 First-Release Lane Doctrine](P2-B0-Lane-Ownership-and-Coexistence-Rules.md):

| Capability | SPFx Permitted? | Rule |
|---|---|---|
| View item summary with project context | ✅ | Companion summary shows `context.projectId` and project name |
| Launch item to PWA domain surface | ✅ | "Open in HB Intel" navigates to PWA with `context.href` |
| Launch item to PWA Project Hub | ✅ | "Open in HB Intel" navigates to PWA Project Hub route |
| Execute workflow-handoff flow | ❌ | Handoff composition requires multi-step UI — PWA only |
| Perform domain mutations | ❌ | Domain mutations happen at source surfaces — PWA only |
| Show handoff status badge | ✅ | `HbcHandoffStatusBadge` is display-only |

### 7.1 SPFx Invariant

SPFx companion MUST NOT execute handoff flows or domain mutations. Its role is limited to:
1. Displaying project-linked items with context
2. Launching the PWA for deeper interaction
3. Showing status badges for handoff state

---

## 8. Acceptance Gate Reference

P2-C4 is primary evidence (alongside P2-C3) for the Handoff gate:

| Field | Value |
|---|---|
| **Gate** | Handoff gate |
| **Pass condition** | Project-significant work routes correctly to Project Hub and returns cleanly |
| **Evidence required** | Handoff criteria matrix (this document), navigation matrix (P2-C3), navigation review, scenario tests |
| **Primary owner** | Product + Project surfaces |

### Scenario Tests Required

| # | Scenario | Expected Behavior |
|---|---|---|
| 1 | Provisioning request item → "Open" | Navigates to domain surface (accounting request detail) |
| 2 | Provisioning completed → workflow handoff | Handoff package sent to Project Lead; Project Hub seed data created |
| 3 | Health pulse critical item → "Open" | Navigates to Project Hub health view |
| 4 | Estimating item with `projectId` → "Open" | Navigates to Estimating domain surface (personal-action, not Project Hub) |
| 5 | Return from domain surface → hub | Hub restores state; feed refreshes with domain mutations |
| 6 | Return from Project Hub → hub | Hub restores state; feed refreshes |
| 7 | Handoff acknowledged → sender's feed | Sender's item reflects completion on refresh |

---

## 9. Locked Decisions

| Decision | Locked Resolution | P2-C4 Consequence |
|---|---|---|
| Project Hub handoff rule | **Use a project significance rule** | Project-coordination-oriented work routes to Project Hub; personal-action-oriented stays in domain |
| Work-item navigation | **Varies by item type** | Per-source handoff matrix with explicit conditions |
| SPFx action model | **Light actions only** | SPFx cannot execute handoff flows |

---

## 10. Spec Precedence

| Deliverable | Relationship to P2-C4 |
|---|---|
| **P2-C3** — Navigation Matrix | P2-C3 defines the 4 destination patterns; P2-C4 provides the criteria for choosing Pattern 3 (Project Hub escalation) vs Pattern 1 (domain deep-link) |
| **P2-B0** — Lane Ownership | P2-C4 implements the lane model's "Project/Domain handoff" row with specific criteria |
| **P2-B2** — State Persistence | P2-C4 return path contracts reference P2-B2 state capture/restore mechanism |
| **P2-C1** — Source Tranche | P2-C4 maps each P2-C1 source to its handoff destination |
| **P2-C5** — Pilot Readiness | P2-C5 validates that handoff scenarios from P2-C4 work end-to-end |
| **P2-E2** — Project Anchor Policy | P2-E2 defines project-anchor inference logic that P2-C4's project context binding prepares for |

If a downstream deliverable introduces handoff behavior that conflicts with this specification, this specification takes precedence for significance criteria and routing decisions.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §9.4, §10.3](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
