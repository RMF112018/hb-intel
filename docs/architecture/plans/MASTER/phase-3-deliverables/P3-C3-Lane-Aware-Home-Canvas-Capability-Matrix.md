# P3-C3: Lane-Aware Home/Canvas Capability Matrix

| Field | Value |
|---|---|
| **Doc ID** | P3-C3 |
| **Phase** | Phase 3 |
| **Workstream** | C — Canvas-first Project Home |
| **Document Type** | Specification |
| **Owner** | Experience / Shell Team + Project Hub platform owner |
| **Update Authority** | Experience lead; changes require review by Architecture and Product/Design |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §9](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-C1](P3-C1-Project-Canvas-Governance-Note.md); [P3-C2](P3-C2-Mandatory-Core-Tile-Family-Definition.md); [P3-G1 §6](P3-G1-Lane-Capability-Matrix.md); [P3-A2](P3-A2-Membership-Role-Authority-Contract.md); [ADR-0102](../../../adr/ADR-0102-project-canvas-role-based-dashboard.md); [`@hbc/project-canvas` README](../../../../packages/project-canvas/README.md) |

---

## Specification Statement

This specification defines the **per-lane home/canvas capability expectations** for Phase 3 Project Hub — what each application lane (PWA and SPFx) supports for canvas composition, tile availability, personalization depth, persistence, shell behavior, and interaction patterns.

P3-C1 establishes the canvas governance model (mandatory locked, role-default, user-managed tiers). P3-C2 defines the mandatory operational core tile family. P3-G1 §6 establishes the system-level lane doctrine for canvas. This specification zooms in to define the **complete capability matrix** for home/canvas behavior across both lanes.

Phase 3 uses **governed adaptive composition** in both lanes (P3-G1 §6.1):

- Both lanes use `@hbc/project-canvas` as the canvas foundation.
- Both lanes apply the same governance model (P3-C1) and mandatory tile set (P3-C2).
- The PWA is the **richer lane** with deeper continuity, customization, admin capabilities, and recovery.
- SPFx is a **broad operational companion** with substantial direct canvas capability, differing only in persistence mechanism, navigation model, and admin depth.

This is distinct from Phase 2 Personal Work Hub lane doctrine, where P2-B0 restricts SPFx to curated composition. Phase 3 Project Hub defines its own lane doctrine where both lanes support governed adaptive composition (P3-G1 §6.2).

**Repo-truth audit — 2026-03-21.** `@hbc/project-canvas` (v0.0.1, SF13, ADR-0102 locked) is mature with `TileRegistry`, 12 reference tile definitions, 3 complexity tiers, `ROLE_DEFAULT_TILES` mapping, `useCanvasEditor`, `useCanvasMandatoryTiles`, `CanvasApi`, and Storybook coverage. The PWA `ProjectHubPage` is an MVP scaffold (portfolio dashboard with summary cards). SPFx project-hub has 1 of 11+ planned pages implemented (`DashboardPage`). Canvas governance (P3-C1), mandatory tiles (P3-C2), and system-level lane rules (P3-G1 §6) are locked. See §1 for full reconciliation.

---

## Specification Scope

### This specification governs

- Per-lane canvas composition capabilities (what each lane supports)
- Tile availability matrix (which tiles are available in each lane)
- Personalization depth per lane (what users can customize)
- Persistence and recovery model per lane
- Canvas shell behavior differences
- Interaction and navigation depth from canvas surfaces
- Cross-lane consistency rules for home/canvas

### This specification does NOT govern

- Canvas governance model (mandatory/locked/optional tiers) — see [P3-C1](P3-C1-Project-Canvas-Governance-Note.md)
- Mandatory core tile content and data-source definitions — see [P3-C2](P3-C2-Mandatory-Core-Tile-Family-Definition.md)
- System-level lane capability depth — see [P3-G1](P3-G1-Lane-Capability-Matrix.md)
- Module-internal page behavior within either lane
- Personal Work Hub composition — governed by P2-B0 and P2-D2

---

## Definitions

| Term | Meaning |
|---|---|
| **Governed adaptive composition** | Canvas composition model where users can add, remove, reorder, and resize tiles within governance constraints (mandatory locks, role defaults) |
| **Mandatory locked tile** | A tile that MUST appear on every canvas for the specified role and cannot be removed, moved, resized, or reordered (P3-C1) |
| **Role-default tile** | A tile included in the initial canvas arrangement for a role; adjustable by the user (P3-C1) |
| **User-managed tile** | A tile available in the catalog but not placed by default; users can add, remove, reorder, resize (P3-C1) |
| **Canvas persistence** | The mechanism by which a user's canvas layout is saved and restored across sessions |
| **Tile catalog** | The browsable list of available tiles presented during edit mode |
| **Canvas shell** | The `HbcProjectCanvas` component that renders the identity header, tile grid, edit-mode controls, and governance enforcement |
| **Data-source badge** | Visual indicator (`Live`, `Manual`, `Hybrid`) showing data freshness and origin on a tile (P3-C1) |
| **Complexity tier** | One of three rendering variants (`essential`, `standard`, `expert`) controlling tile detail level |
| **Launch-to-PWA** | SPFx navigation pattern that routes users to the PWA for deeper interaction via deep link |
| **Full** | Complete capability with no lane-imposed limitations (P3-G1) |
| **Broad** | Substantial direct working capability; may lack deepest power-user workflows (P3-G1) |

---

## 1. Current-State Reconciliation

| Artifact | Location | Status | Relevance |
|---|---|---|---|
| `@hbc/project-canvas` | `packages/project-canvas/` | **Live** — mature (v0.0.1, SF13, ADR-0102) | Canvas foundation: `TileRegistry`, `useCanvasEditor`, `useCanvasMandatoryTiles`, `CanvasApi`, 3 complexity tiers, 12 reference tiles |
| `TileRegistry` | `@hbc/project-canvas` | **Live** — mature | Singleton tile definition registry with validation, mandatory/lockable flags, complexity variants |
| `ROLE_DEFAULT_TILES` | `@hbc/project-canvas` | **Live** — mature | Role-to-tile-keys mapping for 6 project roles |
| `useCanvasEditor` | `@hbc/project-canvas` | **Live** — mature | Governance-enforced edit mode (prevents mandatory removal, locked tile moves) |
| `CanvasApi` | `@hbc/project-canvas` | **Live** — mature | Persistence, reset, first-visit generation, tile recommendations |
| P3-C1 Canvas Governance | Phase 3 deliverables | **Locked** (note) | 3-tier governance model (mandatory locked, role-default, user-managed) |
| P3-C2 Mandatory Tiles | Phase 3 deliverables | **Locked** (spec) | 5 mandatory operational core surfaces; role-based visibility matrix |
| P3-G1 §6 Lane Canvas Rules | Phase 3 deliverables | **Locked** (spec) | Both lanes use governed adaptive composition; same foundation, governance, mandatory core |
| PWA `ProjectHubPage` | `apps/pwa/src/pages/project-hub/` | **Live** — MVP scaffold | Portfolio dashboard with summary cards; not yet the canvas-first home |
| SPFx project-hub `DashboardPage` | `apps/spfx/src/apps/project-hub/` | **Live** — partial | 1 of 11+ planned pages implemented; 3 empty-state placeholders |
| `@hbc/features-project-hub` | `packages/features/project-hub/` | **Live** — partial | SF21 health-pulse fully implemented; consumed by both lanes |

**Classification:** Canvas infrastructure (`@hbc/project-canvas`) is mature. Both lane applications have MVP-level project hub pages that must be upgraded to canvas-first home surfaces. This is **controlled evolution** — the canvas package is ready, the lane applications must adopt it.

---

## 2. Shared-Canonical Canvas Baseline

The following MUST be identical across both the PWA and SPFx lanes:

| Aspect | Shared contract | Governing deliverable |
|---|---|---|
| Canvas foundation | `@hbc/project-canvas` package | P3-C1, ADR-0102 |
| Governance model | 3 tiers: mandatory locked, role-default, user-managed | P3-C1 §2 |
| Mandatory operational core | Identity header + Health + Work Queue + Related Items + Activity | P3-C2 §2 |
| Tile governance flags | `mandatory`, `lockable`, `defaultForRoles` per tile definition | P3-C1 §3 |
| Data-source badges | `Live`, `Manual`, `Hybrid` per tile | P3-C1 §6 |
| Complexity-tier rendering | `essential`, `standard`, `expert` variants per tile | P3-C1 §5 |
| Role-based tile visibility | Same visibility rules per role (P3-C2 §8) | P3-C2 §8, P3-A2 §4.1 |
| Count/badge semantics | Same count computation on tiles (spine-derived) | P3-D1–D4 |
| Tile registration | Same `TileRegistry` definitions | P3-C1 §3 |
| Edit-mode governance | Same constraints (mandatory cannot be removed, locked cannot be moved) | P3-C1 §7 |

---

## 3. Canvas Composition Capability Matrix

| Capability | PWA | SPFx | Consistency rule |
|---|---|---|---|
| **Canvas foundation** | `@hbc/project-canvas` — governed adaptive | `@hbc/project-canvas` — governed adaptive | Both use same package (P3-G1 §6.1) |
| **Mandatory operational core** | Identity header, Health, Work Queue, Activity, Related Items | Identity header, Health, Work Queue, Activity, Related Items | Identical (P3-C2) |
| **Tile governance model** | Mandatory locked + role-default + user-managed | Mandatory locked + role-default + user-managed | Identical (P3-C1) |
| **Tile catalog** | Full catalog available in edit mode | Full catalog available in edit mode | Same tile definitions |
| **Edit mode** | Full governed edit mode | Full governed edit mode | Same `useCanvasEditor` governance |
| **Tile add/remove** | Full — add from catalog, remove non-mandatory | Full — add from catalog, remove non-mandatory | Same governance enforcement |
| **Tile reorder** | Full — drag-drop reorder (non-locked tiles) | Full — drag-drop reorder (non-locked tiles) | Same governance enforcement |
| **Tile resize** | Supported — governed size constraints | Supported — governed size constraints | Same tile size rules |
| **Complexity-tier selection** | Per-user preference | Per-user preference | Same rendering model |
| **Data-source badges** | Displayed per tile | Displayed per tile | Same badge vocabulary |
| **Role-based visibility** | Per P3-C2 §8 | Per P3-C2 §8 | Identical rules |
| **Canvas persistence** | `CanvasApi` → IndexedDB (offline) + server sync (online) | `CanvasApi` → localStorage (offline) + SharePoint list (online) | Same API contract, different storage backend |
| **First-visit generation** | Auto-generates role-default layout | Auto-generates role-default layout | Same `CanvasApi` behavior |
| **Reset to role-default** | Supported — resets to role-default, preserves mandatory | Supported — resets to role-default, preserves mandatory | Same reset behavior |
| **Canvas recovery** | Session-state recovery via `@hbc/session-state` | Limited recovery via localStorage | PWA has richer recovery |

---

## 4. Tile Availability Matrix

All tiles registered in `TileRegistry` are available in both lanes. Tile availability is determined by tile definition governance, not by lane.

### 4.1 Mandatory core tiles

| Tile | Key | Spine | PWA | SPFx | Status |
|---|---|---|---|---|---|
| Identity header | (canvas shell) | Registry | **Available** | **Available** | Controlled evolution — not yet implemented as distinct shell surface |
| Health | `project-health-pulse` | Health | **Available** | **Available** | Implemented — all 3 complexity tiers |
| Work Queue | `project-work-queue` | Work Queue | **Available** | **Available** | Controlled evolution — not yet registered |
| Related Items | `related-items` | Related Items | **Available** | **Available** | Requires upgrade (optional → mandatory) |
| Activity | `project-activity` | Activity | **Available** | **Available** | Controlled evolution — not yet registered |

### 4.2 Existing registered tiles (non-core mandatory)

| Tile | Key | PWA | SPFx | Mandatory | Status |
|---|---|---|---|---|---|
| BIC My Items | `bic-my-items` | **Available** | **Available** | Yes (existing) | Implemented |
| Pending Approvals | `pending-approvals` | **Available** | **Available** | Yes (existing) | Implemented |

### 4.3 Reference and catalog tiles

| Tile | Key | PWA | SPFx | Category | Status |
|---|---|---|---|---|---|
| Financial Summary | `financial-summary` | **Available** | **Available** | Role-default | Reference definition |
| Schedule Overview | `schedule-overview` | **Available** | **Available** | Role-default | Reference definition |
| Constraints Summary | `constraints-summary` | **Available** | **Available** | Catalog | Reference definition |
| Permits Status | `permits-status` | **Available** | **Available** | Catalog | Reference definition |
| Safety Dashboard | `safety-dashboard` | **Available** | **Available** | Catalog | Reference definition |
| Reports Summary | `reports-summary` | **Available** | **Available** | Catalog | Reference definition |

### 4.4 Availability rule

All tiles registered in `TileRegistry` are available in both lanes. No tile is lane-exclusive. Lane differences are in **depth of interaction** (§8), not in tile availability.

---

## 5. Personalization Depth Matrix

| Capability | PWA | SPFx | Notes |
|---|---|---|---|
| **Layout arrangement** | Full drag-drop | Full drag-drop | Same `useCanvasEditor` behavior |
| **Tile size adjustment** | Supported (governed constraints) | Supported (governed constraints) | Same tile size limits from definitions |
| **Tile add from catalog** | Full catalog browsing + add | Full catalog browsing + add | Same tile catalog |
| **Tile remove** | Non-mandatory tiles only | Non-mandatory tiles only | Same governance enforcement |
| **Complexity tier selection** | Per-user, persisted | Per-user, persisted | Same rendering model |
| **Cross-device sync** | Via server persistence | Via SharePoint list | Different backend, same semantic |
| **Canvas reset** | Reset to role-default | Reset to role-default | Same `CanvasApi.resetCanvas()` |
| **Canvas export/import** | Future scope | Future scope | Not in Phase 3 |
| **User-specific tile notes** | Future scope | Future scope | Not in Phase 3 |

---

## 6. Persistence and Recovery

### 6.1 PWA persistence model

| Aspect | Implementation |
|---|---|
| **Offline storage** | `CanvasApi` → IndexedDB via `@hbc/session-state` |
| **Online sync** | `CanvasApi` → server-side persistence |
| **First visit** | Auto-generates role-default layout from `ROLE_DEFAULT_TILES` |
| **Reset** | `CanvasApi.resetCanvas()` → restores role-default; mandatory tiles always preserved |
| **Session recovery** | Full session-state recovery (P3-B1 §3); canvas layout restored from IndexedDB on reconnect |
| **Cross-device** | Server-synced — layout available on any device after sync |

### 6.2 SPFx persistence model

| Aspect | Implementation |
|---|---|
| **Offline storage** | `CanvasApi` → localStorage |
| **Online sync** | `CanvasApi` → SharePoint list on the project site |
| **First visit** | Auto-generates role-default layout from `ROLE_DEFAULT_TILES` |
| **Reset** | `CanvasApi.resetCanvas()` → restores role-default; mandatory tiles always preserved |
| **Session recovery** | Limited recovery from localStorage; no deep session-state recovery |
| **Cross-device** | SharePoint-list-synced — layout available within the SharePoint environment |

### 6.3 Cross-lane persistence rules

- Canvas layouts are **lane-independent** — each lane maintains its own persistence instance.
- A user's PWA canvas layout and SPFx canvas layout are separate and may differ.
- Both lanes auto-generate the same role-default layout on first visit.
- Mandatory tiles are always preserved regardless of persistence state.
- If persistence data is corrupted or missing, the canvas falls back to role-default generation.

---

## 7. Canvas Shell Behavior

The canvas shell (`HbcProjectCanvas`) renders identically in both lanes with the following behavior:

### 7.1 Shared shell behavior (identical in both lanes)

| Behavior | Description |
|---|---|
| **Identity header** | Project identity surface rendered above the tile grid, sourcing from the canonical project registry record (P3-A1 §2.1) |
| **Tile grid** | Responsive grid layout rendering placed tiles at their designated positions and sizes |
| **Edit-mode controls** | Toggle edit mode, showing add/remove/reorder/resize controls per governance rules |
| **Mandatory tile enforcement** | Mandatory tiles always present; `useCanvasMandatoryTiles` ensures they cannot be removed |
| **Locked tile enforcement** | Locked tiles cannot be moved, resized, or reordered; `useCanvasEditor` enforces this |
| **Loading state** | Skeleton tiles while canvas layout and tile data load |
| **Empty-state handling** | Mandatory tiles always present; optional tile slots show catalog CTA when empty |
| **Error state** | Degraded banner with cached layout fallback; mandatory tiles still render if spine data fails |
| **Complexity-tier rendering** | Tiles render per the user's complexity preference (essential/standard/expert) |
| **Data-source badges** | Each tile shows its data-source badge (`Live`, `Manual`, `Hybrid`) |

### 7.2 Shell rendering rule

When a mandatory tile is hidden for a role (e.g., Work Queue for Viewer per P3-C2 §8), the canvas shell MUST NOT show an empty placeholder — it simply omits the tile for that role's canvas.

---

## 8. Interaction and Navigation Depth

This is the primary area where lanes diverge. Canvas tile content is identical, but the **depth of interaction available from tiles** differs:

| Interaction | PWA | SPFx | Rule |
|---|---|---|---|
| **Tile drill-down to module page** | In-app routing to module page within the PWA shell | SPFx routes for implemented module pages; launch-to-PWA for unimplemented pages | SPFx routes where available; escalates to PWA otherwise |
| **Panel overlays** | Full slide-out panels (Related Items panel, Work Queue panel, etc.) | Full slide-out panels | Same panel components from shared packages |
| **Health explainability** | Full ExplainabilityDrawer within PWA | Full ExplainabilityDrawer (shared component from `@hbc/features-project-hub`) | Same component, same behavior |
| **Work Queue feed** | Full feed page with filtering, search, team feed, reason drawer | Tile and panel; launch-to-PWA for full feed | SPFx provides tile + panel; full feed is PWA-depth |
| **Activity timeline** | Full activity page with filtering and export | Tile with recent activity; launch-to-PWA for full timeline | SPFx provides tile; full timeline is PWA-depth |
| **Canvas admin** | Full admin panel access (tile governance, role defaults, advanced config) | Reduced admin — launch-to-PWA for advanced canvas configuration | SPFx supports basic edit mode; advanced admin escalates |
| **Cross-project navigation** | In-app project switching (P3-B1 §2) | Launch-to-PWA with project selector deep link | SPFx context is per-project-site |
| **Report launch from tile** | In-app report workspace navigation | Launch-to-PWA with report deep link or SPFx report view | Governed by P3-F1 and P3-G1 §4.7 |

### 8.1 Launch-to-PWA mechanism

SPFx surfaces that need deeper interaction construct a PWA deep link with:
- `projectId` in the URL path or query parameter
- Optional `returnTo` parameter for return navigation (P3-G1 §5.3)
- Module-specific path segments for targeted landing

---

## 9. Cross-Lane Consistency Rules

### 9.1 MUST be identical

| Aspect | Rule |
|---|---|
| Canvas foundation package | Both use `@hbc/project-canvas` |
| Governance model | Same 3-tier model (P3-C1) |
| Mandatory operational core | Same 5 mandatory surfaces (P3-C2) |
| Tile governance flags | Same `mandatory`, `lockable`, `defaultForRoles` per tile |
| Tile catalog | Same `TileRegistry` definitions |
| Data-source badges | Same badge vocabulary (`Live`, `Manual`, `Hybrid`) |
| Complexity-tier variants | Same 3 tiers per tile |
| Role-based tile visibility | Same visibility matrix (P3-C2 §8) |
| Count/badge semantics | Same spine-derived counts on tiles |
| First-visit layout | Same role-default generation |
| Edit-mode governance | Same constraints on mandatory and locked tiles |

### 9.2 MAY differ (lane-specific)

| Aspect | PWA | SPFx | Reason |
|---|---|---|---|
| Persistence backend | IndexedDB + server | localStorage + SharePoint list | Host platform differences |
| Session recovery depth | Full via `@hbc/session-state` | Limited via localStorage | Host platform capabilities |
| Navigation from tiles | In-app routing | SPFx routes or launch-to-PWA | Host navigation model |
| Admin depth | Full canvas admin | Basic edit mode; advanced admin launches to PWA | Complexity/scope trade-off |
| Full feed/timeline views | In-app pages | Tile + panel; full views launch to PWA | SPFx companion scope |
| Cross-device sync | Server-synced | SharePoint-list-synced | Host persistence model |

---

## 10. Repo-Truth Reconciliation Notes

1. **`@hbc/project-canvas` — compliant**
   Mature canvas package (v0.0.1, SF13, ADR-0102 locked) with `TileRegistry`, `useCanvasEditor`, `useCanvasMandatoryTiles`, `CanvasApi`, 12 reference tiles, 3 complexity tiers, `ROLE_DEFAULT_TILES`, and Storybook coverage. Package is ready for both-lane consumption. Classified as **compliant**.

2. **PWA `ProjectHubPage` — controlled evolution**
   Current MVP scaffold (portfolio dashboard with summary cards) must be upgraded to the canvas-first home using `@hbc/project-canvas`. The canvas package is ready; the page must adopt it. Classified as **controlled evolution**.

3. **SPFx project-hub `DashboardPage` — controlled evolution**
   Only 1 of 11+ planned pages implemented. Must be upgraded to a canvas-first project home using `@hbc/project-canvas` with governed adaptive composition. Classified as **controlled evolution**.

4. **Mandatory tile registrations — per P3-C2 reconciliation**
   Health tile: compliant. Work Queue tile: not yet registered. Related Items tile: requires upgrade (optional → mandatory). Activity tile: not yet registered. Identity header: not yet implemented as distinct shell surface. Classified per P3-C2 §9.

5. **SPFx persistence backend — controlled evolution**
   `CanvasApi` persistence to SharePoint list requires SPFx-specific storage adapter. The canvas API contract exists; the SPFx adapter implementation is Phase 3 scope. Classified as **controlled evolution**.

6. **Cross-lane persistence separation — by design**
   PWA and SPFx maintain separate canvas layout instances. This is intentional — each lane has its own persistence backend and the user's canvas may differ between lanes. No reconciliation gap; this is the designed behavior.

---

## 11. Acceptance Gate Reference

**Gate:** Home/canvas gates — lane capability component (Phase 3 plan §18.3)

| Field | Value |
|---|---|
| **Pass condition** | Both PWA and SPFx render canvas-first project home with governed adaptive composition; mandatory operational core is present in both lanes; personalization, persistence, and edit mode work per this matrix |
| **Evidence required** | P3-C3 (this document), canvas rendering in both lanes, mandatory tile presence, edit-mode governance enforcement, persistence/recovery working per §6, complexity-tier rendering, role-based visibility working per P3-C2 §8 |
| **Primary owner** | Experience / Shell Team + Project Hub platform owner |

---

## 12. Policy Precedence

This specification establishes the **lane-aware canvas capability expectations** that implementation must satisfy:

| Deliverable | Relationship to P3-C3 |
|---|---|
| **P3-C1** — Project Canvas Governance Note | Provides the governance model (3 tiers) that this specification applies per lane |
| **P3-C2** — Mandatory Core Tile Family Definition | Provides the mandatory tile set and role-based visibility rules that both lanes must satisfy |
| **P3-G1 §6** — Lane Capability Matrix (canvas rules) | Provides the system-level canvas lane doctrine that this specification expands with detailed per-capability rows |
| **P3-A2** — Membership / Role Authority Contract | Provides role-based visibility rules controlling which tiles appear per role |
| **P3-D1** — Project Activity Contract | Activity spine consumed by the mandatory Activity tile |
| **P3-D2** — Project Health Contract | Health spine consumed by the mandatory Health tile |
| **P3-D3** — Project Work Queue Contract | Work Queue spine consumed by the mandatory Work Queue tile |
| **P3-D4** — Related-Items Contract | Related-Items spine consumed by the mandatory Related Items tile |
| **P3-B1** — Project Context Continuity | Governs session recovery and context continuity that affects canvas persistence |
| **P3-E1** — Module Classification Matrix | Module classifications affect which role-default and catalog tiles are available |
| **P3-G2** — Cross-Lane Navigation and Handoff Map | Governs launch-to-PWA mechanics used when SPFx canvas tiles escalate |

If a downstream deliverable conflicts with this specification, this specification takes precedence for home/canvas behavior unless the Experience lead approves a documented exception.

---

**Last Updated:** 2026-03-21
**Governing Authority:** [Phase 3 Plan §9](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
