# PCC UI Wireframe and Flexible Layout Contract

## Desktop Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ HB / PCC Rail │ Project Intelligence Header                                  │
│               │ ┌──────────────────────────────────────────────────────────┐ │
│ Project Home  │ │ Belvedere Tower              Search / command / controls │ │
│ Team & Access │ │ Project Control Center                                    │ │
│ Documents     │ │ [Phase] [Health] [Actions]                               │ │
│ Readiness     │ │ Project Health / Readiness Trend                         │ │
│ Approvals     │ └──────────────────────────────────────────────────────────┘ │
│ External Sys  │                                                              │
│ Settings      │ Floating Summary Cards / Bento Grid                          │
│ Site Health   │ ┌─────────────┐ ┌─────────────┐ ┌────────────────────────┐  │
│               │ │ Priority    │ │ Site Health │ │ Document Control       │  │
│               │ │ Actions     │ │ Summary     │ │ Center                 │  │
│               │ └─────────────┘ └─────────────┘ │                        │  │
│               │ ┌─────────────┐ ┌─────────────┐ │                        │  │
│               │ │ Readiness   │ │ Approvals   │ └────────────────────────┘  │
│               │ └─────────────┘ └─────────────┘ ┌────────────────────────┐  │
│               │ ┌─────────────┐ ┌─────────────┐ │ Recent Activity        │  │
│               │ │ External    │ │ Team        │ │                        │  │
│               │ │ Systems     │ │ Snapshot    │ └────────────────────────┘  │
│               │ └─────────────┘ └─────────────┘                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Flexible Layout Contract

The PCC Project Home grid shall use a controlled bento / masonry-style layout.

### Required Behavior

- Cards may have unique widths and heights.
- Cards may declare preferred footprint and priority.
- The grid must avoid equal-height row waste.
- DOM order and keyboard order must remain predictable.
- Layout must adapt to container width, not just viewport width.
- Critical content must not require horizontal scrolling.
- Compact states must reduce content intentionally, not simply squeeze all content.

### Preferred Implementation Model

Use CSS Grid with measured row spans:

```css
.pccBentoGrid {
  display: grid;
  grid-template-columns: repeat(var(--pcc-grid-columns), minmax(0, 1fr));
  grid-auto-rows: var(--pcc-grid-row-unit, 8px);
  gap: var(--pcc-grid-gap, 16px);
}
```

Each card may compute a row span from measured height via `ResizeObserver`:

```ts
gridRowEnd = `span ${Math.ceil((height + gap) / (rowUnit + gap))}`;
```

### Widget Contract

```ts
type PccWidgetFootprint = 'hero' | 'wide' | 'standard' | 'compact' | 'tall' | 'full';

interface PccShellWidgetDefinition {
  id: string;
  surfaceId: PccMvpSurfaceId;
  title: string;
  footprint: PccWidgetFootprint;
  priority: number;
  minColumnSpan: number;
  preferredColumnSpan: number;
  maxColumnSpan: number;
}
```

### Initial Widget Set

| Widget                      | Surface                  | Footprint   | Notes                                                                                                                                                                              |
| --------------------------- | ------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Intelligence Header | Project Home             | full        | Dark header with trend chart and KPI pills.                                                                                                                                        |
| Priority Actions            | Project Home / Approvals | wide        | High operational priority.                                                                                                                                                         |
| Site Health Summary         | Site Health              | standard    | Read-model summary only.                                                                                                                                                           |
| Document Control Center     | Documents                | tall / wide | Two-lane preview: Microsoft Files Lane (disabled/preview-only file-management affordances) + External Document Systems Lane (launch/deep-link/missing-config/access-issue states). |
| Project Readiness           | Project Readiness        | standard    | Fixture-driven readiness rollup.                                                                                                                                                   |
| Approvals & Checkpoints     | Approvals                | standard    | Preview counts only.                                                                                                                                                               |
| External Systems            | External Systems         | compact     | Launch-link/missing-config state.                                                                                                                                                  |
| Team Snapshot               | Team & Access            | compact     | Summary only, no mutation.                                                                                                                                                         |
| Missing Configurations      | Settings / Site Health   | standard    | Preview items only.                                                                                                                                                                |
| Recent Activity             | Project Home             | tall        | Fixture-only activity feed.                                                                                                                                                        |

## Breakpoint Contract

### Wide Desktop

- Persistent left rail.
- Full dark header.
- 12-column or equivalent bento grid.
- Cards use varied spans and measured heights.

### Standard Desktop / Laptop

- Persistent left rail, slightly narrower.
- Header remains full-width within content area.
- 8- to 10-column equivalent grid.
- Tall cards may stack or reduce span.

### Tablet Landscape

- Rail may collapse to icon+tooltip or compact mode.
- Header compresses KPI pills.
- 6-column equivalent grid.
- Activity / documents cards may move lower.

### Tablet Portrait

- Rail becomes compact horizontal/tab navigation or collapsible drawer.
- Header trend chart may reduce vertical height.
- 2-column bento behavior.

### Phone / Narrow

- No persistent left rail.
- Surface selector becomes top dropdown, segmented control, or drawer.
- Cards stack in priority order.
- Header shows project name, phase, health, and action count only.

## Guardrails

- Do not use CSS columns as the primary layout model.
- Do not blindly use `grid-auto-flow: dense` for critical content because it can visually reorder content relative to DOM/focus order.
- Do not copy or import homepage paired-row layout modules.
- Do not force equal card heights across a row.
- Do not build drag/drop or user-resizable dashboards in Wave 2.
- Do not hide primary meaning behind hover-only interactions.
