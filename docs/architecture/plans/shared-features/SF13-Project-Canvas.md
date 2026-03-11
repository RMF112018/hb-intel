# SF13 — `@hbc/project-canvas`: Role-Based Configurable Project Dashboard

**Plan Version:** 1.0
**Date:** 2026-03-10
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-13-Shared-Feature-Project-Canvas.md`
**Priority Tier:** 2 — Application Layer (Project Hub and cross-module dashboard prerequisite)
**Estimated Effort:** 6–8 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md`

> **Doc Classification:** Canonical Normative Plan — SF13 implementation master plan for `@hbc/project-canvas`; governs SF13-T01 through SF13-T09.

---

## Purpose

`@hbc/project-canvas` provides role-based, configurable project command centers so each role starts from relevant tiles while retaining user customization, while also supporting dynamic recommendations, PH Pulse-aware smart defaults, mandatory governance controls, data-source transparency, intelligent notification routing, and future AI tile extensibility.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Tile registry pattern | Central `TileRegistry` holds `ICanvasTileDefinition` entries; tiles lazy-load |
| D-02 | Role defaults | Six role-default tile sets are canonical baseline for first render; first-load defaults are smart-adjusted using Project Health Pulse while preserving role core |
| D-03 | Persistence model | User layout persisted per `{userId, projectId}` in `HbcCanvasConfigs` |
| D-04 | Edit model | Add/remove/rearrange/resize in editor mode with unsaved-change tracking |
| D-05 | Locking model | Admin-lockable and mandatory tile tiers are supported; mandatory tiles are non-removable and role-governed |
| D-06 | Complexity behavior | Every tile registers Essential/Standard/Expert lazy variants and auto-renders by user tier |
| D-07 | Platform constraints | SPFx-compatible rendering, app-shell-safe components, API via backend |
| D-08 | DnD + data transparency | `@dnd-kit/core` is the drag/rearrange primitive; tile headers expose standardized data-source badges (`Live`/`Manual`/`Hybrid`) |
| D-09 | Integration baseline | BIC, acknowledgment, docs, handoff, related-items, notification hub, PH Pulse recommendation integrations, and AIInsightTile-ready registration pathways required |
| D-10 | Testing sub-path | `@hbc/project-canvas/testing` exports canonical tile/config fixtures |

---

## Package Directory Structure

```text
packages/project-canvas/
├── package.json
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IProjectCanvas.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── canvasDefaults.ts
│   │   └── index.ts
│   ├── registry/
│   │   ├── TileRegistry.ts
│   │   └── index.ts
│   ├── api/
│   │   ├── CanvasApi.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useProjectCanvas.ts
│   │   ├── useCanvasEditor.ts
│   │   ├── useRoleDefaultCanvas.ts
│   │   ├── useCanvasRecommendations.ts
│   │   └── index.ts
│   └── components/
│       ├── HbcProjectCanvas.tsx
│       ├── HbcCanvasEditor.tsx
│       ├── HbcTileCatalog.tsx
│       ├── AIInsightTile.tsx
│       ├── tiles/
│       │   ├── BicMyItemsTile.tsx
│       │   ├── PendingApprovalsTile.tsx
│       │   ├── DocumentActivityTile.tsx
│       │   ├── WorkflowHandoffInboxTile.tsx
│       │   ├── NotificationSummaryTile.tsx
│       │   └── ...
│       └── index.ts
├── testing/
│   ├── index.ts
│   ├── createMockTileDefinition.ts
│   ├── createMockCanvasConfig.ts
│   ├── createMockTilePlacement.ts
│   └── mockRoleDefaultCanvases.ts
└── src/__tests__/
    ├── setup.ts
    ├── TileRegistry.test.ts
    ├── CanvasApi.test.ts
    ├── useRoleDefaultCanvas.test.ts
    ├── useProjectCanvas.test.ts
    ├── useCanvasEditor.test.ts
    ├── HbcProjectCanvas.test.tsx
    ├── HbcCanvasEditor.test.tsx
    └── HbcTileCatalog.test.tsx
```

---

## Integration Points

| Package | Integration Detail |
|---|---|
| `@hbc/bic-next-move` | `bic-my-items` tile |
| `@hbc/acknowledgment` | `pending-approvals` tile |
| `@hbc/workflow-handoff` | `workflow-handoff-inbox` tile |
| `@hbc/sharepoint-docs` | `document-activity` tile |
| `@hbc/related-items` | `related-items` tile |
| `@hbc/notification-intelligence` | `notification-summary` tile is the single intelligent hub for real-time Immediate/Watch items with one-click routing |
| `@hbc/complexity` | Essential/Standard/Expert tile variants auto-selected per user tier |
| PH7-SF-21 Project Health Pulse | drives smart default adjustments and dynamic recommendations |
| Future AI modules | register through reusable `AIInsightTile` container |

---

## Definition of Done

- [ ] Tile definitions/registry implemented and type-safe (including three complexity variants + optional AI container contract)
- [ ] Role default canvas resolver complete for all target roles
- [ ] First-load smart default adjustments implemented from Project Health Pulse signals with immediate user override
- [ ] Canvas editor supports add/remove/rearrange/resize with lock enforcement
- [ ] Mandatory governance tier implemented; mandatory tiles non-removable with role-wide apply support
- [ ] Canvas configuration persistence implemented via API
- [ ] 12 confirmed Phase 7 tiles documented and wired
- [ ] Tile header data-source badges and tooltips implemented (`Live`/`Manual`/`Hybrid`)
- [ ] `notification-summary` tile implemented as intelligent notification hub behavior
- [ ] Testing sub-path fixtures exported
- [ ] T09 includes SF11-grade documentation/deployment requirements
- [ ] `current-state-map.md` updated with SF13 + ADR-0102 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF13-T01-Package-Scaffold.md` | package scaffold + README requirement — **COMPLETE 2026-03-11** |
| `SF13-T02-TypeScript-Contracts.md` | canvas contracts + constants — **COMPLETE 2026-03-11** |
| `SF13-T03-Registry-and-API.md` | tile registry + CanvasApi — **COMPLETE 2026-03-11** |
| `SF13-T04-Hooks.md` | canvas/editor/default hooks — **COMPLETE 2026-03-11** |
| `SF13-T05-HbcProjectCanvas.md` | grid renderer + lazy tile loading — **COMPLETE 2026-03-11** |
| `SF13-T06-HbcCanvasEditor-and-TileCatalog.md` | editor mode + catalog + DnD behavior — **COMPLETE 2026-03-11** |
| `SF13-T07-Reference-Integrations.md` | cross-package tile references and defaults — **COMPLETE 2026-03-11** |
| `SF13-T08-Testing-Strategy.md` | testing sub-path + test matrix — **COMPLETE 2026-03-11** |
| `SF13-T09-Testing-and-Deployment.md` | checklist, ADR/docs/index/state-map updates — **COMPLETE 2026-03-11** |

<!-- IMPLEMENTATION PROGRESS & NOTES
SF13 completed: 2026-03-11
T01–T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md
Documentation added:
  - docs/how-to/developer/project-canvas-adoption-guide.md
  - docs/reference/project-canvas/api.md
  - packages/project-canvas/README.md
docs/README.md ADR index updated: ADR-0102 row appended.
current-state-map.md §2 updated with SF13 and ADR-0102 rows.
-->
