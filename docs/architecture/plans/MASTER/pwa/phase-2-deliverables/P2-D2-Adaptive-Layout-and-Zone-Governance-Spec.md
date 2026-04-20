# P2-D2: Adaptive Layout and Zone Governance Spec

| Field | Value |
|---|---|
| **Doc ID** | P2-D2 |
| **Phase** | Phase 2 |
| **Workstream** | D — Role Governance, Analytics Expansion, and Personalization |
| **Document Type** | Specification |
| **Owner** | Experience / Shell |
| **Update Authority** | Experience lead; changes require review by Architecture and Product |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §8, §10.4, §13, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A1 §0.3, §1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-D1 §5–§6](P2-D1-Role-to-Hub-Entitlement-Matrix.md); [P2-D3](P2-D3-Analytics-Card-Governance-Matrix.md); [P2-D5](P2-D5-Personalization-Policy-and-Saved-View-Rules.md); [P2-B0 §6.3](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [ADR-0102](../../../architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md); [@hbc/project-canvas README](../../../../packages/project-canvas/README.md); [@hbc/project-canvas/src/index.ts](../../../../packages/project-canvas/src/index.ts) |

---

## Spec Statement

This specification defines how `@hbc/project-canvas` is applied as the adaptive layout and composition foundation for the Personal Work Hub's secondary and tertiary zones, and how the primary zone is protected from canvas governance. It establishes the tile registry contract, zone-bounded EditMode rules, role-default canvas layouts, mandatory tile enforcement, complexity-tier integration, and the curated-composition posture for the SPFx companion. No layout composition decision for the hub may deviate from these rules without an Experience-lead–approved update to this document.

---

## Spec Scope

### This spec governs

- Zone model mechanics and zone-canvas boundary rules
- `@hbc/project-canvas` package usage contract for the Personal Work Hub
- Tile registry binding: how P2-D3 analytics cards map to registered canvas tiles
- Primary zone protection: which components own primary zone rendering and why canvas does not
- Secondary zone tile composition, role defaults, and EditMode rules
- Tertiary zone tile composition, role defaults, and EditMode rules
- Mandatory tile governance using `@hbc/project-canvas` mandatory tier
- Role-default canvas layouts for each canonical role
- Complexity-tier tile variant contract
- SPFx companion layout (curated composition; no canvas)
- First-release implementation scope and deferred layout capabilities
- Implementation gates that must be passed before canvas EditMode is deployed to users

### This spec does NOT govern

- Zone access entitlement by role — see [P2-D1 §5](P2-D1-Role-to-Hub-Entitlement-Matrix.md)
- Card type catalog, role eligibility, and per-card governance — see [P2-D3](P2-D3-Analytics-Card-Governance-Matrix.md)
- Personalization actions allowed/prohibited and saved-view persistence — see [P2-D5](P2-D5-Personalization-Policy-and-Saved-View-Rules.md)
- Primary zone content: ranking, lane model, and item display — see [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md) and [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Team-mode feed projection — see [P2-D4](P2-D4-Delegated-and-Team-Lane-Governance-Note.md)
- Session-state and draft persistence infrastructure — see [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Zone** | A governed page region in the Personal Work Hub: primary (task runway), secondary (analytics/oversight), or tertiary (utility/quick actions) |
| **Canvas zone** | A project-canvas–governed region; applies only to secondary and tertiary zones — the primary zone is explicitly excluded from canvas governance |
| **Tile** | A unit of composition within a canvas zone; corresponds to one analytics card from the P2-D3 catalog |
| **Tile registration** | A call to `TileRegistry.register()` that binds a hub card ID to a canvas tile definition, including complexity-tier variants, default size, zone assignment, and mandatory status |
| **ICanvasUserConfig** | The project-canvas configuration type storing the user's tile placements across both canvas zones; persisted via `@hbc/session-state` per P2-D5 §4 |
| **ICanvasTilePlacement** | A single tile placement record within an ICanvasUserConfig: tile ID, position (column, row), size (colSpan, rowSpan), and visibility |
| **EditMode** | The canvas state in which `HbcCanvasEditor` is active and the user can add, remove, reorder, and resize tiles; EditMode is zone-bounded and prohibited for the primary zone |
| **Mandatory tile** | A canvas tile registered with mandatory status via the project-canvas governance tier; mandatory tiles cannot be hidden or removed by the user regardless of personalization |
| **Role-default layout** | The initial `ICanvasUserConfig` applied to a user on first visit, or when no saved arrangement exists; derived from the canonical `ROLE_DEFAULT_TILES` pattern per role |
| **Zone boundary** | The rule preventing tile movement across zone lines during EditMode; secondary tiles remain in secondary, tertiary tiles remain in tertiary |
| **Curated composition** | A fixed, non-configurable tile arrangement applied to the SPFx companion; no `HbcCanvasEditor` or `HbcTileCatalog` is used on SPFx |

---

## 1. Zone Model Reference

The Personal Work Hub uses three governed zones. This spec defines the layout mechanics for all three, but only secondary and tertiary are canvas zones.

| Zone | Canvas Governed? | Component Owner | Content Type | EditMode Allowed? |
|---|---|---|---|---|
| **Primary** | ❌ No | `HubPrimaryRunway` | Task runway — prioritized work items, responsibility lanes, freshness/trust cues | ❌ Never |
| **Secondary** | ✅ Yes | `@hbc/project-canvas` (HbcProjectCanvas) | Analytics, oversight, and role-aware summary cards | ✅ Yes (governed) |
| **Tertiary** | ✅ Yes | `@hbc/project-canvas` (HbcProjectCanvas) | Utility components — quick actions, recent context, pinned tools | ✅ Yes (limited) |

### Zone Order Invariant

The vertical render order of zones on the Personal Work Hub page is fixed:

```
[Primary Zone   — full-width, invariant, always first]
[Secondary Zone — canvas-governed, below primary]
[Tertiary Zone  — canvas-governed, below secondary]
```

Zone order cannot be altered by user personalization or EditMode. Secondary must always appear below primary; tertiary must always appear below secondary.

---

## 2. `@hbc/project-canvas` Usage Contract

### 2.1 Applicable Package Exports

The following exports from `@hbc/project-canvas` are used by the Personal Work Hub:

| Export | Usage |
|---|---|
| `register` / `registerMany` | Register hub tiles into the tile registry at hub boot |
| `HbcProjectCanvas` | Render the secondary and tertiary canvas zones |
| `HbcCanvasEditor` | Provide EditMode controls for secondary/tertiary zones |
| `HbcTileCatalog` | Present the role-eligible tile catalog during EditMode |
| `useProjectCanvas` | Manage canvas state, tile placement, and EditMode lifecycle |
| `useCanvasConfig` | Load and persist `ICanvasUserConfig` per user/zone |
| `useCanvasEditor` | Control EditMode entry/exit and tile mutation operations |
| `useRoleDefaultCanvas` | Produce role-default `ICanvasUserConfig` for first-visit layout |
| `useCanvasMandatoryTiles` | Enforce mandatory tile visibility regardless of personalization |
| `CANVAS_GRID_COLUMNS` | 12 — column count governing tile sizing |
| `MIN_COL_SPAN` / `MAX_COL_SPAN` | Bounds for resize operations |
| `ROLE_DEFAULT_TILES` | Base pattern for role-default layout derivation |

### 2.2 Package Version Constraint

`@hbc/project-canvas` is used at its SF13-locked maturity level (locked 2026-03-11, ADR-0102). No modifications to the package are required for first-release P2-D2 implementation. The zone governance constraints in this spec are enforced by the hub implementation layer, not by the package internals.

### 2.3 Architectural Constraint

`@hbc/project-canvas` was designed as a project-dashboard primitive (role-aware drag-and-drop tile canvas for project surfaces). Its application to the Personal Work Hub is a **governed reuse** — the package is used as-is, but the hub applies additional zone-boundary rules and EditMode gating that the package does not enforce internally. The hub implementation layer is responsible for:

- prohibiting EditMode on the primary zone,
- prohibiting tile movement across zone boundaries,
- restricting the tile catalog to the role-eligible set from P2-D3,
- and enforcing mandatory tile visibility from `useCanvasMandatoryTiles`.

### 2.4 SPFx Compatibility

`@hbc/project-canvas` uses inline styles and has no external CSS imports (ADR-0102 D-07 constraint). The PWA hub may render `HbcProjectCanvas` safely in the secondary and tertiary zones. The SPFx companion does **not** use `HbcProjectCanvas` — see §12.

---

## 3. Primary Zone Composition

### 3.1 Ownership

The primary zone is owned entirely by `HubPrimaryRunway`, a dedicated hub component that composes:

- the personal work feed via `@hbc/my-work-feed` hooks (`useMyWorkFeed`, `useMyWorkPersonalFeed`, and team-mode equivalents),
- responsibility lanes rendered in fixed order (`do-now`, `watch`, `waiting-blocked`, `deferred`),
- lane counts and overflow indicators,
- item-level ranking cues (time-horizon labels, complexity-tier–appropriate explainability),
- trust and freshness indicators via `@hbc/session-state` sync state,
- and smart empty-state handling via `@hbc/smart-empty-state` for low-work states.

### 3.2 Canvas Exclusion Rule

The primary zone MUST NOT be wrapped in, composed by, or rendered inside `HbcProjectCanvas`. It is not a canvas tile and cannot become one.

This rule is non-negotiable. If a future implementation passes a primary-zone component through the tile registry or renders it as an `ICanvasTilePlacement`, that implementation violates this spec and must be corrected before pilot launch.

### 3.3 EditMode Exclusion

The EditMode entry affordance (edit/configure button, drag handles, tile catalog trigger) MUST NOT be rendered within or adjacent to the primary zone in a way that could be confused with primary zone editing. EditMode controls are rendered only within the secondary and tertiary canvas zone areas.

### 3.4 Size and Dominance

The primary zone must remain the **dominant visual element** on the hub page at all times. Secondary and tertiary zones must not be sized, positioned, or styled in a way that makes them appear more prominent than the primary zone. This is a layout governance rule enforced at the hub shell level, not by the canvas package.

---

## 4. Secondary Zone Composition

### 4.1 Zone Role

The secondary zone is the analytics, oversight, and role-aware summary region. It contains the analytics and team portfolio cards from the P2-D3 catalog.

### 4.2 Grid Layout

The secondary zone uses a 12-column CSS Grid (`CANVAS_GRID_COLUMNS = 12`). Card width conventions:

| Width Label | Column Span | Percentage | Use Case |
|---|---|---|---|
| Narrow | 4 columns | 33% | Compact count cards, small indicators |
| Standard | 6 columns | 50% | Most analytics cards — default width |
| Wide | 12 columns | 100% | Full-width cards (lane summary, team workload) |

Row span defaults to 1 per card unless the card's tile registration specifies a larger default.

### 4.3 EditMode Rules

| Rule | Specification |
|---|---|
| **EditMode entry** | User-triggered via an edit/configure affordance in the secondary zone header |
| **EditMode scope** | Secondary zone only — tertiary zone uses a separate `useCanvasEditor` instance (see §8.3) |
| **Drag-and-drop reorder** | Allowed within secondary zone boundaries |
| **Tile addition** | User may add tiles from the role-eligible P2-D3 card set via `HbcTileCatalog` |
| **Tile removal** | User may remove configurable tiles; mandatory tiles cannot be removed — enforced via `isMandatory` callback passed to `useCanvasEditor` |
| **Resize** | Deferred to post-pilot — `HbcCanvasEditor` resize gestures are disabled in first release (see §13.2) |
| **Zone-crossing drag** | Not possible by design — secondary editor instance receives only secondary zone tiles (see §8.3) |
| **Tile catalog scope** | Only tiles from the role-eligible P2-D3 card set are shown in the catalog |

### 4.4 Role-Default Secondary Layout

On first visit (or when no saved arrangement exists), `useRoleDefaultCanvas` produces the following secondary zone defaults:

| Role | Default Secondary Tiles (in order) | Note |
|---|---|---|
| `Member` | `hub:lane-summary` (wide), `hub:source-breakdown` (standard), `hub:quick-actions` (standard) | Analytics baseline; lane summary locked |
| `Executive` | `hub:team-workload` (wide), `hub:lane-summary` (wide), `hub:source-breakdown` (standard), `hub:escalation-candidates` (standard) | Team portfolio first; two mandatory tiles |
| `Administrator` | `hub:lane-summary` (wide), `hub:source-breakdown` (standard), `hub:provisioning-health` (standard) | Admin oversight card included |

Multi-role users receive the union of their eligible tiles, ordered by the highest-precedence role's default sequence (per P2-D1 §10 additive entitlements).

---

## 5. Tertiary Zone Composition

### 5.1 Zone Role

The tertiary zone contains utility components — quick actions, recent context, and other lightweight navigation and tool shortcuts. It appears below the secondary zone.

### 5.2 Grid Layout

The tertiary zone uses the same 12-column grid as the secondary zone. Default widths:

| Card | Default Width | Rationale |
|---|---|---|
| `hub:quick-actions` | Wide (12 columns) | Always-visible, full-width utility strip |
| `hub:recent-context` | Standard (6 columns) | Navigational aid; partial width sufficient |

### 5.3 EditMode Rules

| Rule | Specification |
|---|---|
| **EditMode entry** | User-triggered via a separate configure affordance in the tertiary zone |
| **EditMode scope** | Tertiary zone only — independent of secondary EditMode |
| **Drag-and-drop reorder** | Allowed within tertiary zone boundaries |
| **Tile addition** | User may add from role-eligible utility tiles |
| **Tile removal** | Only configurable tiles; `hub:quick-actions` is mandatory and cannot be removed |
| **Resize** | Not applicable in first release — tertiary tiles use fixed width |
| **Zone-crossing drag** | Prohibited — tertiary tiles cannot be dragged to the secondary zone |

### 5.4 Role-Default Tertiary Layout

All roles receive the same tertiary default:

| Role | Default Tertiary Tiles (in order) |
|---|---|
| All | `hub:quick-actions` (wide), `hub:recent-context` (standard) |

---

## 6. Tile Registry Binding

Each analytics card from the P2-D3 catalog is registered as a canvas tile via `register()` or `registerMany()` at hub initialization. The tile registry is populated once at app boot and is not modified at runtime.

### 6.1 Tile ID Convention

Hub tile IDs use the `hub:` namespace prefix to avoid conflicts with project-canvas tiles:

| P2-D3 Card ID | Canvas Tile ID | Zone | Mandatory? |
|---|---|---|---|
| `pa-lane-summary` | `hub:lane-summary` | Secondary | ✅ Yes |
| `pa-source-breakdown` | `hub:source-breakdown` | Secondary | No |
| `pa-aging-indicator` | `hub:aging-indicator` | Secondary | No |
| `pa-recent-activity` | `hub:recent-activity` | Secondary | No |
| `tp-team-workload` | `hub:team-workload` | Secondary | ✅ Yes (in `my-team` mode) |
| `tp-aging-items` | `hub:aging-items` | Secondary | No |
| `tp-blocked-items` | `hub:blocked-items` | Secondary | No |
| `tp-escalation-candidates` | `hub:escalation-candidates` | Secondary | No |
| `ao-provisioning-health` | `hub:provisioning-health` | Secondary | No |
| `ut-quick-actions` | `hub:quick-actions` | Tertiary | ✅ Yes |
| `ut-recent-context` | `hub:recent-context` | Tertiary | No |

### 6.2 Tile Registration Contract

Each tile registration must conform to the `ICanvasTileDefinition` shape with the following hub-specific fields:

```typescript
ICanvasTileDefinition {
  id: string;                      // hub: prefixed tile ID (§6.1)
  label: string;                   // Display name from P2-D3 card catalog
  zone: 'secondary' | 'tertiary';  // Hub-specific zone assignment
  defaultColSpan: number;          // From §4.2 / §5.2 width conventions
  defaultRowSpan: number;          // 1 for most cards
  minColSpan: number;              // MIN_COL_SPAN from package constants
  maxColSpan: number;              // MAX_COL_SPAN from package constants
  mandatory?: boolean;             // True for locked cards from P2-D3 §2
  roleEligibility: string[];       // Canonical role names from @hbc/auth
  complexityVariants: {            // Required: all three tiers
    Essential: React.ComponentType<ICanvasTileProps>;
    Standard:  React.ComponentType<ICanvasTileProps>;
    Expert:    React.ComponentType<ICanvasTileProps>;
  };
}
```

### 6.3 Registration Timing

All hub tiles must be registered before the hub renders. Registration is performed in the hub feature package's boot sequence, before `HbcProjectCanvas` mounts. The registry is global and stateless — re-registration of an existing tile ID is a no-op.

---

## 7. Role-Default Canvas Layouts

The full `ICanvasUserConfig` for each canonical role's first-visit state is derived by `useRoleDefaultCanvas`. The config covers both canvas zones.

### 7.1 Member Default

```
Secondary zone (in order):
  hub:lane-summary       — wide (12 col), mandatory, visible
  hub:source-breakdown   — standard (6 col), configurable, visible

Tertiary zone (in order):
  hub:quick-actions      — wide (12 col), mandatory, visible
  hub:recent-context     — standard (6 col), configurable, visible
```

### 7.2 Executive Default

```
Secondary zone (in order):
  hub:team-workload        — wide (12 col), mandatory (when my-team mode), visible
  hub:lane-summary         — wide (12 col), mandatory, visible
  hub:source-breakdown     — standard (6 col), configurable, visible
  hub:escalation-candidates — standard (6 col), configurable, visible

Tertiary zone (in order):
  hub:quick-actions        — wide (12 col), mandatory, visible
  hub:recent-context       — standard (6 col), configurable, visible
```

### 7.3 Administrator Default

```
Secondary zone (in order):
  hub:lane-summary        — wide (12 col), mandatory, visible
  hub:source-breakdown    — standard (6 col), configurable, visible
  hub:provisioning-health — standard (6 col), configurable, visible

Tertiary zone (in order):
  hub:quick-actions       — wide (12 col), mandatory, visible
  hub:recent-context      — standard (6 col), configurable, visible
```

### 7.4 Multi-Role Default

When a user holds multiple roles, the default layout is derived from the highest-precedence role (Administrator > Executive > Member), and the tile sets of lower-precedence roles are appended after the primary role's tiles, deduplicating any shared tile IDs. The mandatory tile set is the union of all applicable mandatory tiles.

---

## 8. EditMode Gating Rules

### 8.1 Primary Zone — EditMode Permanently Prohibited

The primary zone MUST NOT enter EditMode under any circumstances.

| Rule | Enforcement Mechanism |
|---|---|
| No edit affordance near the primary zone | The EditMode toggle is rendered only in secondary/tertiary zone headers |
| No tile wrapping of primary zone content | `HubPrimaryRunway` is rendered outside any `HbcProjectCanvas` instance |
| Canvas `editMode` prop for primary zone | Not applicable — primary zone has no canvas instance |

This is the **primary zone protection invariant** from P2-A1 §1.2. A design review gate must verify this before pilot deployment (see §14).

### 8.2 Secondary Zone — Governed EditMode

| Condition | EditMode Allowed? |
|---|---|
| User has landed on `/my-work` | ✅ Yes |
| User is in any team mode (`personal`, `my-team`, `delegated-by-me`) | ✅ Yes — team mode does not affect EditMode availability |
| User's role has at least one configurable secondary tile in their eligible set | ✅ Yes |
| No configurable secondary tiles eligible for user | ❌ No — EditMode toggle hidden (nothing to configure) |

### 8.3 Zone Isolation Strategy — Two `useCanvasEditor` Instances

`useCanvasEditor` operates on a **flat `ICanvasTilePlacement[]` array** with no zone concept built into the hook. `reorderTiles(fromIndex, toIndex)` and `moveTile(tileKey, colStart, rowStart)` are purely positional — the hook will not reject a placement that crosses a zone boundary if both zone's tiles share a single array.

The hub therefore enforces zone boundaries by **isolation, not validation**: two separate `useCanvasEditor` instances are used, one per canvas zone:

- **Secondary zone editor** — receives only secondary zone tile placements; has no visibility of tertiary tiles
- **Tertiary zone editor** — receives only tertiary zone tile placements; has no visibility of secondary tiles

Because the editors operate on disjoint arrays, cross-zone movement is structurally impossible — no drag can produce an index that reaches the other zone's array. This is the correct and sufficient implementation of Gate 3.

### 8.4 Tertiary Zone — Limited EditMode

EditMode for the tertiary zone is available to all roles but limited in scope:

- Reorder of configurable tiles: ✅ allowed
- Show/hide of configurable tiles: ✅ allowed (`hub:recent-context` and others)
- Resize: ❌ not applicable in first release
- `hub:quick-actions` always remains visible regardless of EditMode actions

### 8.4 EditMode Session Behavior

EditMode is a transient UI state. It is not persisted between page navigations. The saved arrangement (persisted by P2-D5 via `@hbc/session-state`) is updated when the user exits EditMode or when `useAutoSaveDraft` fires (500ms debounce).

---

## 9. Mandatory Tile Governance

The project-canvas mandatory governance tier is used to enforce locked cards from the P2-D3 catalog.

### 9.1 Mandatory Tile Rule

A tile registered with `mandatory: true` in the tile registry:

- is always visible in the canvas zone, regardless of `ICanvasTilePlacement.visible` value,
- cannot be removed via `HbcCanvasEditor` (remove action is disabled or hidden),
- cannot be hidden via the `HbcTileCatalog` toggle,
- is visually distinguished in EditMode (locked icon per `MANDATORY_TILE_LOCK_ICON`),
- and is enforced by `useCanvasMandatoryTiles` on every canvas render.

### 9.2 Mandatory Status by Tile

Per P2-D3 §2 locked-card definitions:

| Tile ID | Mandatory Condition |
|---|---|
| `hub:lane-summary` | Always mandatory for all roles |
| `hub:team-workload` | Mandatory when user is in `my-team` mode (Executive); configurable in `personal` mode |
| `hub:quick-actions` | Always mandatory for all roles |

All other tiles are configurable — users may show, hide, or reorder them within their zone.

### 9.3 Dynamic Mandatory State

`hub:team-workload` mandatory status is dynamic: it switches between mandatory and configurable based on the active team mode. When `teamMode` changes from `my-team` to `personal`, `hub:team-workload` becomes a configurable tile and the user may choose to hide it.

This dynamic mandatory logic is implemented in the hub feature package (not in `@hbc/project-canvas` directly) by passing the computed `mandatory` value at render time via the tile registration override mechanism.

---

## 10. Complexity Tier Integration

### 10.1 Tier Vocabulary

Complexity tiers are defined in `@hbc/complexity` and referenced in `@hbc/project-canvas` via `ComplexityTier`:

| Tier | Display Label | Effect on Hub Tiles |
|---|---|---|
| `Essential` | Simplified | Counts only, short lists (3 items), minimal visuals |
| `Standard` | Standard | Charts, medium lists (5 items), indicators |
| `Expert` | Expert | Full breakdowns, long lists (8–10 items), ranking reasons, per-source detail |

### 10.2 Tile Variant Contract

Every registered hub tile MUST provide all three complexity variants. A tile registration that provides only `Expert` or only `Standard` variants is rejected.

Per P2-D3 §5: complexity tiers affect card display density, not card availability. The same tile is rendered at different detail levels based on the user's active tier preference.

### 10.3 Tier Preference Source

The active complexity tier is loaded from user preferences stored via `@hbc/session-state` (per P2-D5 §2, `hbc-my-work-complexity-tier` draft, 30-day TTL). It is passed to `HbcProjectCanvas` as a prop and propagated to all rendered tile variant components.

### 10.4 Essential Variant as Baseline

The `Essential` variant of each tile must be the design baseline — it must be visually coherent and useful on its own, without requiring `Standard` or `Expert` mode. This ensures that new users and users on lower-bandwidth sessions see a functional hub.

---

## 11. Personalization Mechanical Interface

This section defines how P2-D5 personalization rules map to project-canvas mechanics. P2-D5 governs what users may do; this spec governs how those actions are mechanically implemented.

### 11.1 Personalization Action Mapping

| P2-D5 Allowed Action | Canvas Mechanic | API |
|---|---|---|
| Reorder cards (secondary) | Drag-and-drop in EditMode | Secondary zone `useCanvasEditor` instance — `reorderTiles(fromIndex, toIndex)` |
| Reorder cards (tertiary) | Drag-and-drop in EditMode | Tertiary zone `useCanvasEditor` instance — `reorderTiles(fromIndex, toIndex)` |
| Show/hide configurable cards | Tile removal in EditMode | `useCanvasEditor.removeTile(tileKey)` — respects `isMandatory` callback |
| Choose from role-eligible card set | `HbcTileCatalog` with role-filtered tile list | `useCanvasEditor.addTile(tileKey)` |
| Resize cards (deferred) | `HbcCanvasEditor` resize gesture — disabled in first release | Post-pilot |

### 11.2 Prohibited Action Enforcement

| P2-D5 Prohibited Action | Enforcement in Canvas |
|---|---|
| Remove or displace primary zone | Primary zone is outside canvas — no mechanism exists |
| Move cards between zones | Structurally impossible — secondary and tertiary zones use separate `useCanvasEditor` instances with disjoint tile arrays (§8.3) |
| Add cards outside role eligibility | `HbcTileCatalog` filters tile list to `roleEligibility` matching `resolvedRoles` |
| Remove mandatory tiles | `useCanvasMandatoryTiles` forces mandatory tiles visible; remove action hidden |
| Create freeform dashboard | Card set is governed — catalog shows only registered, role-eligible tiles |
| Override ranking order | Ranking belongs to primary zone (`HubPrimaryRunway`) — canvas has no access to it |

### 11.3 Config Persistence Contract

When the user exits EditMode or a debounced auto-save fires, the current `ICanvasUserConfig` is written to `@hbc/session-state` IndexedDB storage using the draft key `hbc-my-work-card-arrangement` (per P2-D5 §4.1, 30-day TTL). The `useCanvasConfig` hook is responsible for this persistence handoff.

On return to `/my-work`, `useCanvasConfig` reads the stored config, validates tile IDs against the current role-eligible tile set, and produces a resolved layout that removes ineligible tiles and appends newly-eligible tiles to their zone defaults.

---

## 12. SPFx Companion Layout

### 12.1 No Canvas on SPFx

The SPFx companion does **not** use `@hbc/project-canvas`, `HbcProjectCanvas`, `HbcCanvasEditor`, or any adaptive canvas behavior. Per P2-B0 first-release lane doctrine, the SPFx companion uses **curated composition only**.

### 12.2 Curated SPFx Layout

The SPFx companion renders a fixed set of components in a fixed order, determined by the user's role and team mode. No `ICanvasUserConfig` is read or written for the SPFx surface.

| Role / Mode | SPFx Component Order |
|---|---|
| `Member` | Lane counts summary, source breakdown (simplified), "Open in HB Intel" |
| `Executive` (`personal` mode) | Lane counts, source breakdown (simplified), "Open in HB Intel" |
| `Executive` (`my-team` mode) | Team workload count, lane counts, "Open in HB Intel" |
| `Administrator` | Lane counts, provisioning health count, "Open in HB Intel" |

### 12.3 SPFx Layout Invariants

- Card order is fixed — not user-configurable.
- All SPFx cards are Essential-tier equivalent — counts and minimal display only.
- SPFx cards are read-only — no edit affordance, no drag handles.
- "Open in HB Intel" is always the last element and always visible.
- SPFx never shows more information than the PWA equivalent role would see.

Per P2-D5 §9: SPFx has zero user personalization in first release.

---

## 13. First-Release Implementation Scope

### 13.1 In Scope for Pilot Launch

| Capability | Status |
|---|---|
| Primary zone protected from canvas | ✅ Required — EditMode gate design review gate (§14) |
| Secondary zone tile arrangement via `HbcProjectCanvas` | ✅ Required |
| Tertiary zone tile arrangement via `HbcProjectCanvas` | ✅ Required |
| Role-default canvas layouts (Member, Executive, Administrator) | ✅ Required |
| Tile registry binding for all P2-D3 first-release cards | ✅ Required |
| Mandatory tile enforcement via `useCanvasMandatoryTiles` | ✅ Required |
| Drag-and-drop reorder in secondary/tertiary (EditMode) | ✅ Required |
| Show/hide configurable tiles (EditMode) | ✅ Required |
| Tile catalog filtered by role eligibility | ✅ Required |
| Complexity-tier variants (E/S/X) for all registered tiles | ✅ Required |
| Config persistence via `@hbc/session-state` (P2-D5 §4) | ✅ Required |
| Config restore with role validation on return to `/my-work` | ✅ Required |
| SPFx curated composition (no canvas) | ✅ Required |
| Zone-boundary enforcement (no cross-zone drag) | ✅ Required |

### 13.2 Deferred Beyond First Release

| Capability | Deferred Reason | Tracking |
|---|---|---|
| **Card resize (width control)** | Requires `@hbc/project-canvas` governance tier validation before allowing user-controlled resize in production | D-D3-1 (P2-E4) |
| **SPFx canvas behavior** | Requires curated-to-adaptive migration proof; host suitability not yet proven | D-D5-2 (P2-E4) |
| **Multi-project grouped composition** | Requires project-grouped canvas layout not yet in scope | D-E2-3 (P2-E4) |
| **Custom card pinning** | Requires governance rules for pinned-vs-ranked ordering in primary zone | D-D5-4 (P2-E4) |
| **Cross-device preference sync** | Requires server-side preference storage beyond `@hbc/session-state` browser-local storage | D-D5-1 (P2-E4) |

---

## 14. Implementation Gates

Per P2-A1 §0.3, the following gates must pass before canvas capabilities are deployed to pilot users.

### Gate 1 — Primary Zone Isolation (Pre-Pilot — Blocking)

**Description:** The primary zone (`HubPrimaryRunway`) is rendered outside any `HbcProjectCanvas` instance. No edit affordance exists adjacent to the primary zone. EditMode entry is only possible from the secondary or tertiary zone headers.

**Evidence required:**
- Design review confirms primary zone is not wrapped in or adjacent to canvas EditMode controls
- Code review confirms `HubPrimaryRunway` is not an `ICanvasTilePlacement` entry
- QA scenario: entering EditMode on secondary zone does not affect primary zone rendering or interaction

**Owner:** Experience / Shell — design review + Architecture sign-off

**Blocks:** Pilot deployment

---

### Gate 2 — Mandatory Tile Enforcement (Pre-Pilot — Blocking)

**Description:** `hub:lane-summary`, `hub:team-workload` (when in `my-team` mode), and `hub:quick-actions` remain visible regardless of user EditMode actions and saved arrangement. `useCanvasEditor.removeTile()` already enforces this via its `EditorOptions.isMandatory(tileKey)` callback — it returns early without mutation when the tile is mandatory. The hub's responsibility is to pass a correct `isMandatory` implementation that reflects the mandatory status of each tile and the current team mode.

**Evidence required:**
- Code review confirms the hub's `isMandatory` callback correctly returns `true` for `hub:lane-summary` and `hub:quick-actions` at all times, and for `hub:team-workload` when `teamMode === 'my-team'`
- Test coverage: `removeTile('hub:lane-summary')` is a no-op; `removeTile('hub:source-breakdown')` succeeds
- QA scenario: user removes all configurable tiles — mandatory tiles remain
- QA scenario: Executive switches from `my-team` to `personal` — `hub:team-workload` becomes removable

**Owner:** Experience / Shell — code review + QA

**Blocks:** Pilot deployment

---

### Gate 3 — Zone Boundary Enforcement (Pre-Pilot — Blocking)

**Description:** Zone boundary enforcement is achieved by structural isolation: the hub uses two separate `useCanvasEditor` instances — one initialized with secondary zone tiles only, one initialized with tertiary zone tiles only. Because each editor operates on a disjoint tile array, cross-zone movement is structurally impossible (not a validated rejection, but an impossibility by design). `useCanvasEditor` has no zone concept internally; the separation happens at the hub composition layer.

**Evidence required:**
- Code review confirms two separate `useCanvasEditor` calls — one for secondary, one for tertiary — each receiving a filtered tile array for its zone only
- Test coverage: `reorderTiles` on the secondary editor cannot produce a tile index that references a tertiary tile key, and vice versa
- QA scenario: drag `hub:source-breakdown` (secondary) confirms it cannot be dropped into the tertiary zone's rendered area

**Owner:** Experience / Shell — code review + QA

**Blocks:** Pilot deployment

---

### Gate 4 — Role Eligibility Filtering (Pre-Pilot — Blocking)

**Description:** The `HbcTileCatalog` shown during EditMode contains only tiles from the user's P2-D3 role-eligible card set.

**Evidence required:**
- Test coverage: `Member` user in EditMode does not see `hub:team-workload` in catalog
- Test coverage: `Executive` user sees `hub:team-workload` in catalog
- QA scenario: walk through EditMode catalog for each canonical role

**Owner:** Experience / Shell — QA

**Blocks:** Pilot deployment

---

### Gate 5 — Config Restore and Validation (Pre-Pilot — Recommended)

**Description:** On return to `/my-work`, the saved `ICanvasUserConfig` is validated against the current role-eligible tile set. Ineligible tiles are removed silently; newly eligible tiles are appended with default visibility.

**Evidence required:**
- Test coverage: `useCanvasConfig` restore path removes ineligible tiles after role change
- Test coverage: restore correctly falls back to role-default layout when draft is absent or expired

**Owner:** Experience / Shell — unit tests

**Blocks:** Pilot deployment

---

## 15. Acceptance Gate Reference

P2-D2 contributes evidence for two Phase 2 acceptance gates:

### Personalization Gate

| Field | Value |
|---|---|
| **Gate** | Personalization gate |
| **Pass condition** | Personalization is useful but bounded; primary work runway remains protected |
| **P2-D2 evidence** | Zone model (§1) confirms primary zone excluded from canvas; EditMode gating (§8) confirms primary zone EditMode prohibition; mandatory tile governance (§9) confirms locked cards cannot be removed |
| **Primary owner** | Experience / Shell |

### Work-Surface Gate

| Field | Value |
|---|---|
| **Gate** | Work-surface gate |
| **Pass condition** | Hub remains task-first and responsibility-first, not a generic dashboard |
| **P2-D2 evidence** | Primary zone protection (§3) confirms task runway is invariant; zone order invariant (§1) confirms primary zone always renders first and dominant; no freeform tile addition outside governed card set |
| **Primary owner** | Product / Design + Experience |

---

## 16. Locked Decisions

| Decision | Locked Resolution | P2-D2 Consequence |
|---|---|---|
| Layout model | **Adaptive layout using `@hbc/project-canvas`, constrained by zone governance** | `@hbc/project-canvas` governs secondary and tertiary zones; primary zone is explicitly excluded |
| Personalization | **Moderately governed** | EditMode available for secondary/tertiary zones only; governed by mandatory tile enforcement and zone-boundary rules |
| Primary zone protection | **Protected runway; users cannot remove or displace it** | Primary zone is outside the canvas instance; no EditMode affordance near primary zone |
| SPFx posture | **Richer companion lane, not the full home** | SPFx uses curated composition with no canvas, no editor, no personalization in first release |
| Analytics scope | **Expand by role elevation, governed by `@hbc/auth` role definitions** | Tile catalog is filtered by `resolvedRoles`; role-default layouts differ by canonical role |
| Low-work default | **Stay on Personal Work Hub** | Canvas zone layout is unaffected by work-item count — low-work state is handled by `HubPrimaryRunway` via `@hbc/smart-empty-state`, not by canvas zone changes |

---

## 17. Spec Precedence

| Deliverable | Relationship to P2-D2 |
|---|---|
| **P2-A1** — Operating Model Register | P2-D2 implements the zone governance model from P2-A1 §1 and the canvas usage constraints from P2-A1 §0.3 |
| **P2-D1** — Role-to-Hub Entitlement Matrix | P2-D2 applies zone access entitlements from P2-D1 §5; role-default layouts and tile catalog filtering respect P2-D1 §6 card set eligibility |
| **P2-D3** — Analytics Card Governance Matrix | P2-D3 defines the card catalog and governance rules; P2-D2 defines the mechanical implementation that populates zones with those cards |
| **P2-D5** — Personalization Policy | P2-D5 defines allowed and prohibited personalization; P2-D2 defines the canvas mechanics that implement those constraints |
| **P2-B0** — Lane Ownership | P2-D2 SPFx curated composition (§12) conforms to P2-B0 curated-composition constraint |
| **P2-D4** — Delegated/Team Governance | Team mode changes affect which tiles are mandatory (§9.3) but do not change zone structure or EditMode availability |

If a downstream deliverable or implementation introduces canvas behavior that conflicts with this spec, this spec takes precedence. Deviations require Experience-lead approval and a documented update to this file.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §8, §10.4](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
