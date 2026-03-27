# Project Operating Family — Implementation Note

| Property | Value |
|----------|-------|
| **Created** | 2026-03-27 |
| **Scope** | Wireframe specs 02 + 03 merged into `project-operating` layout family |
| **Package** | `@hbc/features-project-hub` v0.2.24 |

---

## How 02 and 03 Were Merged

Wireframe spec 02 (Canvas-First Operating Layer) and spec 03 (Control Center + Command Rail) were implemented as one governed family (`project-operating`) because:

1. **Same role set**: Both target PM, PE, and Superintendent.
2. **Same canonical route**: Both live at `/project-hub/$projectId`.
3. **Complementary emphasis**: Spec 02 foregrounds the canvas tile grid while spec 03 foregrounds the command rail with module posture. These are presentation modes of the same operating surface — the command rail selects modules, the center shows either the canvas (no selection) or a module preview (module selected).

The merged family uses a three-column CSS grid (left command rail, center canvas, right context rail) composed inside the existing `WorkspacePageShell layout="dashboard"` children slot. No new shell component was created.

## Architecture Decisions

- **No ui-kit changes**: The three-column layout is a feature-specific composition inside `WorkspacePageShell`, not a generic ui-kit layout variant. The `DashboardLayout` data zone has `flexGrow: 1`, so the CSS grid fills it.
- **Mock data hooks**: All summary adapters (`useModulePostureSummaries`, `useWorkQueueSummary`, `useNextMoveSummary`, `useActivitySummary`) return deterministic mock data. Real data wiring is a follow-on.
- **Selection is local state**: Clicking a module in the command rail updates `useState` — it does NOT change the URL. The route stays at `/project-hub/$projectId`.
- **SPFx canvas preserved**: `HbcProjectCanvas` moves from a standalone card into the center slot of `ProjectOperatingSurface`. Persistence adapter, role resolution, and complexity tier are unchanged.
- **PWA reports section preserved**: When `section === 'reports'`, the operating surface is not rendered — the existing reports baseline content renders instead.

## Remaining Gaps for Executive and Field-Tablet Families

1. **No `ProjectHubLayoutShell` in ui-kit**: A reusable three-column layout shell with collapsible rails would benefit all three families. Currently built inline in `ProjectOperatingSurface`. If the executive and field-tablet families need the same grid pattern, extract to `@hbc/ui-kit`.
2. **No real posture data**: The `useModulePostureSummaries` hook returns mock data. Real integration requires health-pulse computation per module.
3. **No real work queue integration**: Mock data only. Real integration requires `@hbc/my-work-feed` consumption.
4. **Activity strip is placeholder**: Horizontal scrolling timeline entries with mock data. Real integration requires activity-spine aggregation.
5. **Viewport detection is naive**: Uses `window.innerWidth` check, not a resize observer. Follow-on should use `matchMedia` listener for responsive updates.
