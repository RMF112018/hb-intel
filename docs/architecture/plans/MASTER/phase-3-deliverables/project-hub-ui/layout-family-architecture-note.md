# Project Hub Layout Family Architecture Note

| Property | Value |
|----------|-------|
| **Created** | 2026-03-27 |
| **Scope** | Project Hub UI expansion — layout family infrastructure |
| **Governing Specs** | 02 (Canvas-First), 03 (Command Rail), 05 (Executive Cockpit), 07 (Field Tablet) |
| **Implementation** | `packages/features/project-hub/src/layout-family/` |

---

## Why Four Independent Layouts Were Rejected

The four wireframe specs (02, 03, 05, 07) each describe a distinct visual arrangement. A naive implementation would create four independent top-level page architectures with separate route trees, separate shell components, and separate slot contracts. This was rejected because:

1. **Route fragmentation.** Adding `/project-hub-executive`, `/project-hub-field`, etc. violates the canonical route contract where `/project-hub/$projectId` is the single project-scoped entry point (P3-B1).

2. **Shell duplication.** Four independent pages would each need their own header, project context, density integration, and responsive behavior — duplicating what WorkspacePageShell already provides.

3. **Feature-layer coupling.** Independent page trees would force each family to independently wire module posture, work queue, health metrics, and other summary adapters — creating four parallel integration surfaces instead of one shared contract.

4. **SPFx governance erosion.** The SPFx app's dashboard and module lanes are already governed. Adding parallel layouts would require either duplicating the lane governance or breaking the existing lane contract.

---

## Why 02 + 03 Are Merged Into `project-operating`

Wireframe specs 02 (Canvas-First Operating Layer) and 03 (Control Center + Command Rail) are merged into a single `project-operating` family because:

- **Same role set.** Both target PM, PE, and Superintendent.
- **Same canonical route.** Both live at `/project-hub/$projectId`.
- **Complementary emphasis.** Spec 02 foregrounds the canvas tile grid; spec 03 foregrounds the command rail with module posture. These are presentation modes of the same operating surface — the user may prefer canvas-forward or list-forward, but the underlying data, context, and slot contracts are identical.
- **Shared regions.** Both define header (project context), left (module nav/posture), center (canvas or summary), right (context/action rail), bottom (activity strip). The region contract is the same; only the center region's content emphasis varies.

Allowing canvas-forward vs. list-forward as a user preference within the family — not as separate families — keeps the architecture simple and the route tree intact.

---

## Why 05 Is a Separate Family (`executive`)

Wireframe spec 05 (Health/Risk Executive Cockpit) is a separate family because:

- **Different role set.** Targets Portfolio Executive and Leadership — roles that do not perform daily operational work.
- **Different interaction model.** Watchlist-driven intervention instead of module-driven work. The left region is a project/signal watchlist, not a module nav. The right region is an intervention rail (escalate/assign), not a context rail.
- **Different center content.** Multi-zone risk canvas with health posture, cost exposure, schedule risk, quality/safety signals — not a working surface or module preview.
- **Cannot merge with project-operating** without making the operating surface overly complex for PMs who don't need intervention controls, or overly simple for executives who need cross-project watchlist context.

---

## Why 07 Is a Separate Family (`field-tablet`)

Wireframe spec 07 (Field Tablet Split-Pane Hub) is a separate family because:

- **Location-first paradigm.** The primary axis is area/location, not module or watchlist. The left region is an area/sheet pane, not module nav.
- **Touch-density defaults.** Field tablet always defaults to touch density (48px+ targets, 7:1 contrast, 16px tap spacing). The density tier is not just a preference — it's a hard requirement for gloved-hands, sunlight, and vibration.
- **Always-visible quick-action bar.** The bottom region is a persistent action bar (Capture, Markup, Issue, Checklist), not a collapsible timeline. This is a fundamentally different UX commitment from the other families.
- **Cannot merge with project-operating** because the location-first axis would conflict with the module-first axis. A field worker navigating by area/zone and a PM navigating by module posture need different primary navigation.

---

## Architecture Summary

### Shared Shell Contract

All three families compose inside `WorkspacePageShell` (the existing mandatory page wrapper from `@hbc/ui-kit`). No new shell component is created. Each family provides content into five governed region slots:

| Region | project-operating | executive | field-tablet |
|--------|------------------|-----------|-------------|
| header | Project context | Project/portfolio context | Project + area context |
| left | Command rail (module posture) | Watchlist (projects/signals) | Area/sheet pane |
| center | Canvas tile grid / control center | Risk canvas (multi-zone) | Action stack (work cards) |
| right | Context rail (next moves, related) | Intervention rail (escalate/assign) | *(collapsed by default)* |
| bottom | Activity strip (timeline) | Trend zone (charts) | Quick-action bar (capture) |

### Resolution Logic

Layout family is resolved from `role + devicePosture + userOverride`:

1. Device posture can force a family (field-tablet device → field-tablet family for eligible roles).
2. User override is respected if the role governance allows the requested family.
3. Otherwise, the role's default family is used.

### Zero Route Fragmentation

Layout family selection happens inside the existing `/project-hub/$projectId` route. The route loader resolves the user's role and device posture, then the layout family resolver selects the appropriate family. No new top-level routes are added.

### Summary Adapter Contracts

All families consume the same summary adapter interfaces:

- `ProjectHubModulePostureSummary` — module health/posture for command rail and canvas tiles
- `ProjectHubWorkQueueSummary` — work items for action rails
- `ProjectHubNextMoveSummary` — next actions for context rails
- `ProjectHubRelatedItemsSummary` — linked records for context rails
- `ProjectHubActivitySummary` — timeline entries for activity strips and trend zones

These are interface contracts only — concrete adapters will be built in follow-on family-specific implementation prompts.

---

## Files

| File | Purpose |
|------|---------|
| `packages/features/project-hub/src/layout-family/types.ts` | Type system: families, regions, slots, resolution, summary adapters |
| `packages/features/project-hub/src/layout-family/definitions.ts` | Static family definitions with region contracts |
| `packages/features/project-hub/src/layout-family/resolver.ts` | Role + device + override → family resolution logic |
| `packages/features/project-hub/src/layout-family/index.ts` | Public API barrel export |
| `packages/features/project-hub/src/index.ts` | Updated to re-export layout-family module |
