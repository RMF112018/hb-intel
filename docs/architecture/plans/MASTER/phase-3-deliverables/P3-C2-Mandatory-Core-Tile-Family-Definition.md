# P3-C2: Mandatory Core Tile Family Definition

| Field | Value |
|---|---|
| **Doc ID** | P3-C2 |
| **Phase** | Phase 3 |
| **Workstream** | C — Canvas-first Project Home |
| **Document Type** | Specification |
| **Owner** | Experience / Shell Team + Project Hub platform owner |
| **Update Authority** | Experience lead; changes require review by Architecture and Product/Design |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §9.3](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-C1](P3-C1-Project-Canvas-Governance-Note.md); [P3-A2 §5](P3-A2-Membership-Role-Authority-Contract.md); [P3-A3](P3-A3-Shared-Spine-Publication-Contract-Set.md); [P3-G1 §3](P3-G1-Lane-Capability-Matrix.md); [`@hbc/project-canvas` reference tiles](../../../../packages/project-canvas/src/tiles/referenceTileDefinitions.ts); [`@hbc/features-project-hub` health-pulse](../../../../packages/features/project-hub/src/health-pulse/types/index.ts) |

---

## Specification Statement

Every Project Hub home canvas MUST include a set of **mandatory operational core tiles** that provide immediate visibility into project health, next actions, relationships, and recent activity (Phase 3 plan §9.3). This specification defines each mandatory core tile: its purpose, data source, spine binding, rendering expectations across complexity tiers, and governance classification.

The mandatory core tiles are the non-negotiable informational surface that makes every project home canvas a functional operating view rather than a blank or decorative starting point. Users cannot remove these tiles. Administrators may control their position via the locked-tile governance defined in P3-C1 §4.

**Repo-truth audit — 2026-03-21.** Three mandatory tiles exist in the current `TileRegistry` reference set: `bic-my-items`, `project-health-pulse`, and `pending-approvals`. Phase 3 plan §9.3 requires five mandatory operational core surfaces (identity header, Health, Work Queue, Related Items, Activity). This specification bridges the gap by defining the complete mandatory core tile family, identifying which tiles exist, which must be registered, and which must be upgraded from optional to mandatory.

---

## Specification Scope

### This specification governs

- The complete inventory of mandatory core tiles on every Project Hub home canvas
- Each tile's purpose, data source, spine binding, and rendering expectations
- Complexity-tier variant expectations for each mandatory tile
- Data-source badge assignment for each tile
- The relationship between mandatory core tiles and the project identity header

### This specification does NOT govern

- Canvas governance model (tile registration, edit-mode, persistence) — see [P3-C1](P3-C1-Project-Canvas-Governance-Note.md)
- Lane-aware canvas behavior — see P3-C3 and [P3-G1](P3-G1-Lane-Capability-Matrix.md)
- Spine publication contracts (how data reaches the tiles) — see [P3-A3](P3-A3-Shared-Spine-Publication-Contract-Set.md)
- Individual spine implementation detail — see P3-D deliverables
- Role-based module visibility (who can see which tiles) — see [P3-A2 §4](P3-A2-Membership-Role-Authority-Contract.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Mandatory core tile** | A canvas tile that MUST appear on every project home canvas for all eligible roles and cannot be removed by the user |
| **Identity header** | The non-tile project identity surface rendered by the canvas shell above the tile grid; not a registered tile |
| **Spine binding** | The shared project spine (Health, Activity, Work Queue, Related Items) that provides canonical data to the tile |
| **Tile family** | The complete set of mandatory core tiles that together satisfy the Phase 3 §9.3 mandatory operational core requirement |
| **Operational core** | The minimum informational surface required for a project home canvas to function as a useful operating view |

---

## 1. Mandatory Core Tile Family

Phase 3 plan §9.3 requires every Project Hub home canvas to include:

1. **Project identity / context header**
2. **Project Health visibility**
3. **Next-action / Work Queue visibility**
4. **Related-items visibility**
5. **Recent project activity visibility**

The following table maps each requirement to its implementation:

| §9.3 Requirement | Implementation | Tile key | Registration status | Governance |
|---|---|---|---|---|
| Project identity / context header | Canvas shell surface (not a tile) | N/A | N/A — rendered by `HbcProjectCanvas` shell | Always present; not user-manageable |
| Project Health visibility | Mandatory tile | `project-health-pulse` | **Registered** (mandatory, lockable) | Mandatory locked |
| Next-action / Work Queue visibility | Mandatory tile | `project-work-queue` | **Not yet registered** — Phase 3 scope | Mandatory locked |
| Related-items visibility | Mandatory tile | `related-items` | **Registered** (mandatory, lockable) | Mandatory locked |
| Recent project activity visibility | Mandatory tile | `project-activity` | **Not yet registered** — Phase 3 scope | Mandatory locked |

---

## 2. Project Identity / Context Header

### 2.1 Purpose

The project identity header provides immediate context about which project the user is viewing. It is NOT a registered tile — it is rendered by the `HbcProjectCanvas` component shell above the tile grid.

### 2.2 Required fields

| Field | Source | Display |
|---|---|---|
| Project name | Registry record `projectName` | Primary heading |
| Project number | Registry record `projectNumber` | Secondary identifier |
| Lifecycle status | Registry record `lifecycleStatus` | Status badge (Active, Planning, OnHold, Completed, Closed) |
| Project Manager | Registry record `projectManagerName` | Team context |
| Department | Registry record `department` | Organizational context |
| Client name | Registry record `clientName` (optional) | When available |

### 2.3 Governance

- The identity header is always present on every project canvas. It is not a tile and cannot be removed, hidden, or repositioned.
- It reads from the canonical project registry record (P3-A1 §2.1).
- It is identical in both lanes.

---

## 3. Project Health Tile

### 3.1 Overview

| Property | Value |
|---|---|
| **Tile key** | `project-health-pulse` |
| **Purpose** | Show the project's overall health status, dimension scores, top recommended action, and triage classification |
| **Spine binding** | Health spine (P3-A3 §4) |
| **Data source** | `IProjectHealthPulse` from `@hbc/features-project-hub` health-pulse |
| **Data-source badge** | `Hybrid` — combines live metrics with manual overrides |
| **Registration status** | **Registered** — mandatory, lockable |
| **Default size** | 6 columns × 1 row |
| **Mandatory for** | All project roles (Project Administrator through Project Viewer) |

### 3.2 Complexity-tier variants

| Tier | Rendering |
|---|---|
| `essential` | Overall status badge (on-track/watch/at-risk/critical) + single-line top recommended action |
| `standard` | Overall status + 4 dimension scores (Cost, Time, Field, Office) + trend indicators + top recommended action |
| `expert` | Full health dashboard: all dimension scores with leading/lagging breakdown, compound risk signals, explainability details, confidence tier, triage bucket |

### 3.3 Data contract

The tile consumes `IProjectHealthPulse` which provides:
- `overallScore`, `overallStatus`, `overallConfidence`
- `dimensions.cost`, `dimensions.time`, `dimensions.field`, `dimensions.office` (each with score, status, trend, metrics)
- `compoundRisks[]` — cross-dimension risk signals
- `topRecommendedAction` — actionable next step with reason code
- `explainability` — why this status, what changed, what matters most
- `triage` — portfolio-level triage projection (attention-now, trending-down, etc.)

### 3.4 Existing implementation

This tile is fully implemented in the reference tile set with all three complexity variants. The health-pulse canvas adapter (`projectHealthPulseToCanvasTile()`) provides the deterministic projection. No implementation gap.

---

## 4. Project Work Queue Tile

### 4.1 Overview

| Property | Value |
|---|---|
| **Tile key** | `project-work-queue` |
| **Purpose** | Show the user's project-scoped work items: what needs attention now, what is blocked, and queue counts |
| **Spine binding** | Work Queue spine (P3-A3 §5) |
| **Data source** | `IMyWorkFeedResult` from `@hbc/my-work-feed` with `IMyWorkQuery.projectId` filter |
| **Data-source badge** | `Live` — aggregated from registered source adapters |
| **Registration status** | **Not yet registered** — Phase 3 must create and register this tile |
| **Default size** | 4 columns × 2 rows |
| **Mandatory for** | Project Administrator, Project Manager, Superintendent, Project Team Member |

### 4.2 Complexity-tier variants

| Tier | Rendering |
|---|---|
| `essential` | Count badges: `do-now` count, `blocked` count + top 3 items with title and due date |
| `standard` | Lane summary (do-now, waiting-blocked, watch, deferred) with counts + scrollable top-N item list with priority, title, due date, source module |
| `expert` | Full lane breakdown with items, ranking reason, lifecycle preview, available actions, overdue flags, and delegation indicators |

### 4.3 Data contract

The tile queries `@hbc/my-work-feed` with `IMyWorkQuery.projectId` set to the current project:
- `items[]` — project-filtered `IMyWorkItem` records
- `nowCount`, `blockedCount`, `waitingCount`, `deferredCount` — lane counts
- `unreadCount` — new items since last visit
- `isStale`, `lastRefreshedIso` — freshness indicators

### 4.4 Next-action semantics

Per Phase 3 plan §9.4, the mandatory work queue surface is **hybrid**: current-user project-filtered work first, plus project-team operational items and escalations. It is user-centered first, but not user-exclusive.

- Standard query: `teamMode: 'personal'` with `projectId` filter
- Elevated roles (Project Manager, Project Administrator) MAY see a supplementary team items count via `teamMode: 'delegated-by-me'`

---

## 5. Related-Items Tile

### 5.1 Overview

| Property | Value |
|---|---|
| **Tile key** | `related-items` |
| **Purpose** | Show cross-module record relationships for the current project: what connects to what across modules |
| **Spine binding** | Related-Items spine (P3-A3 §6) |
| **Data source** | `RelationshipRegistry` from `@hbc/related-items` with project-scoped source records |
| **Data-source badge** | `Hybrid` — relationships may include AI-suggested and manually-linked items |
| **Registration status** | **Registered** (mandatory, lockable) — upgrade complete |
| **Default size** | 4 columns × 1 row |
| **Mandatory for** | Project Administrator, Project Executive, Project Manager, Superintendent, Project Team Member |

### 5.2 Complexity-tier variants

| Tier | Rendering |
|---|---|
| `essential` | Count of related items by module + top 3 most-recent relationship changes |
| `standard` | Grouped relationship list by module (Financial → Schedule, Constraints → Schedule, etc.) with status chips and navigation links |
| `expert` | Full relationship graph with directionality, governance metadata, AI-suggested items with confidence scores, and version chips |

### 5.3 Data contract

The tile consumes relationships from `RelationshipRegistry`:
- `IRelatedItem[]` — resolved related items with `recordType`, `label`, `status`, `href`, `relationship`, `relationshipLabel`
- `IRelationshipDefinition[]` — registered definitions with `governanceMetadata.relationshipPriority` for ordering
- Governance events via `IGovernanceTimelineEvent` for audit trail

### 5.4 Registration status

The `related-items` tile is registered as `mandatory: true`, `lockable: true` with `defaultForRoles` populated for Project Administrator, Project Executive, Project Manager, Superintendent, and Project Team Member in `packages/project-canvas/src/tiles/referenceTileDefinitions.ts`. All three complexity variants use `createReferenceTileComponents()` scaffolding pending Phase 3 full implementation with live `@hbc/related-items` data binding.

---

## 6. Project Activity Tile

### 6.1 Overview

| Property | Value |
|---|---|
| **Tile key** | `project-activity` |
| **Purpose** | Show recent meaningful activity across all project modules: what changed, who changed it, and when |
| **Spine binding** | Activity spine (P3-A3 §3) |
| **Data source** | `IActivityFeedResult` from the Activity spine (new contract defined in P3-A3 §3) |
| **Data-source badge** | `Live` — events published by modules in real time |
| **Registration status** | **Not yet registered** — Phase 3 must create and register this tile |
| **Default size** | 4 columns × 2 rows |
| **Mandatory for** | All project roles (Project Administrator through Project Viewer) |

### 6.2 Complexity-tier variants

| Tier | Rendering |
|---|---|
| `essential` | Condensed timeline: top 5 recent events with summary, source module icon, and timestamp |
| `standard` | Timeline with category grouping, significance badges (routine/notable/critical), module attribution, and "view all" link |
| `expert` | Full activity feed with filtering by module, category, significance, and date range + event detail expansion + related event linking |

### 6.3 Data contract

The tile queries the Activity spine with `IActivityQuery.projectId` set to the current project:
- `events[]` — `IProjectActivityEvent` records (P3-A3 §3.1)
- `totalCount` — total events available
- `hasMore`, `nextCursor` — pagination
- `lastRefreshedIso` — freshness

### 6.4 Significance-based rendering

Events carry `significance` (routine, notable, critical). The tile SHOULD:
- Highlight `critical` events with visual emphasis
- Show `notable` events prominently
- Collapse or summarize `routine` events in essential/standard tiers
- Show all events in expert tier

---

## 7. Mandatory Core Tile Summary Matrix

| Tile | Key | Spine | Badge | Size | Mandatory | Lockable | Status |
|---|---|---|---|---|---|---|---|
| Identity header | N/A | Registry | N/A | Full width | Always | N/A | **Implemented** (canvas shell) |
| Health | `project-health-pulse` | Health | Hybrid | 6 × 1 | Yes | Yes | **Implemented** |
| Work Queue | `project-work-queue` | Work Queue | Live | 4 × 2 | Yes | Yes | **Not yet registered** |
| Related Items | `related-items` | Related Items | Hybrid | 4 × 1 | Yes | Yes | **Implemented** (mandatory, lockable) |
| Activity | `project-activity` | Activity | Live | 4 × 2 | Yes | Yes | **Not yet registered** |

---

## 8. Cross-Role Mandatory Tile Visibility

All mandatory core tiles are visible to all project roles, with the following exceptions:

| Tile | Project Viewer | External Contributor |
|---|---|---|
| Identity header | Visible | Visible |
| Health | **Read-only** | Grant-scoped (per P3-A2 §4.1) |
| Work Queue | **Hidden** (Viewers have no work queue) | **Hidden** |
| Related Items | **Read-only** | **Hidden** |
| Activity | **Read-only** | Grant-scoped |

When a mandatory tile is hidden for a role (e.g., Work Queue for Viewer), the canvas shell MUST NOT show an empty placeholder — it simply omits the tile for that role's canvas.

---

## 9. Repo-Truth Reconciliation Notes

1. **`project-health-pulse` tile — compliant**
   Fully implemented in the reference tile set with all three complexity variants, mandatory and lockable flags set, and health-pulse canvas adapter providing the data projection. Classified as **compliant**.

2. **`related-items` tile — compliant**
   Registered in `packages/project-canvas/src/tiles/referenceTileDefinitions.ts` with `mandatory: true`, `lockable: true`, and `defaultForRoles` populated for five project roles (Administrator, Executive, Manager, Superintendent, Team Member). All three complexity variants scaffold using `createReferenceTileComponents()`, pending Phase 3 live data binding to `@hbc/related-items`. Classified as **compliant — data binding deferred to Phase 3 implementation**.

3. **`project-work-queue` tile — not yet registered**
   No work-queue tile exists in the `TileRegistry`. Phase 3 must create the tile definition with all three complexity variants, register it as mandatory and lockable, and wire it to `@hbc/my-work-feed` with `projectId` filtering. Classified as **controlled evolution**.

4. **`project-activity` tile — not yet registered**
   No activity tile exists in the `TileRegistry`. Phase 3 must create the tile definition with all three complexity variants, register it as mandatory and lockable, and wire it to the Activity spine defined in P3-A3 §3. The Activity spine itself is also a Phase 3 gap (P3-A3 reconciliation note 4). Classified as **controlled evolution**.

5. **`bic-my-items` and `pending-approvals` — remain mandatory but are not "core operational" tiles**
   These tiles are currently mandatory and lockable in the reference set. They serve important functions (BIC items, approvals) but are not part of the §9.3 mandatory operational core defined in the Phase 3 plan. They remain mandatory per the existing tile governance; this specification neither removes nor modifies their mandatory status.

6. **Identity header not yet implemented as a distinct canvas shell surface — controlled evolution**
   The current `HbcProjectCanvas` component does not render a project identity header above the tile grid. Phase 3 must add this to the canvas shell, sourcing fields from the canonical project registry record (P3-A1 §2.1). Classified as **controlled evolution**.

---

## 10. Acceptance Gate Reference

**Gate:** Home/canvas gates (Phase 3 plan §18.3) — mandatory core component

| Field | Value |
|---|---|
| **Pass condition** | Mandatory operational core surfaces exist on every home canvas; all five §9.3 requirements are satisfied |
| **Evidence required** | P3-C2 (this document), all mandatory tiles registered and rendering in both lanes, identity header present, spine data flowing to tiles, complexity variants functional |
| **Primary owner** | Experience / Shell + Project Hub platform owner |

---

## 11. Policy Precedence

This specification establishes the **mandatory tile content and data-source requirements** that implementation must satisfy:

| Deliverable | Relationship to P3-C2 |
|---|---|
| **P3-C1** — Project Canvas Governance Note | Provides the governance model (mandatory/locked/optional tiers) that this specification applies to specific tiles |
| **P3-A2** — Membership / Role Authority Contract | Provides role-based visibility rules that determine which mandatory tiles appear per role (§8) |
| **P3-A3** — Shared Spine Publication Contract Set | Provides the spine contracts that mandatory tiles consume (Health, Work Queue, Related Items, Activity) |
| **P3-D1** — Project Activity Contract | Must implement the Activity spine contract that the Activity tile depends on |
| **P3-D2** — Project Health Contract | Must align with the Health spine data contract consumed by the Health tile |
| **P3-D3** — Project Work Queue Contract | Must align with the Work Queue data contract consumed by the Work Queue tile |
| **P3-D4** — Related-Items Registry / Presentation Contract | Must align with the Related-Items data contract consumed by the Related Items tile |
| **P3-G1** — Lane Capability Matrix | Confirms both lanes render the same mandatory core tiles (§3) |
| **P3-H1** — Acceptance Checklist | Must include mandatory core tile evidence |

If a downstream deliverable conflicts with this specification, this specification takes precedence unless the Experience lead approves a documented exception.

---

**Last Updated:** 2026-03-23 — Marked `related-items` tile upgrade complete (code confirmed: mandatory, lockable, defaultForRoles populated); updated §1 tile inventory, §5 registration status, §7 summary matrix, §9.2 reconciliation note
**Governing Authority:** [Phase 3 Plan §9.3](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
