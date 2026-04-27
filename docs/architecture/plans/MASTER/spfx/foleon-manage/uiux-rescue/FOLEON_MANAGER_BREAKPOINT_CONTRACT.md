# Foleon Manager Breakpoint Contract

## Purpose

The Foleon Manager is a SharePoint-hosted admin workspace. It must adapt to practical usable space, not raw device resolution alone. Multi-column layout is allowed only when it remains premium, readable, and interaction-safe.

## Layout Regions

- Header: page title, plain-language purpose, status chips, and primary actions.
- Left lane navigation: Project Spotlight, Company Pulse, Leadership Message, each with status, live/staged cue, and next action.
- Central selected-lane workspace: current live edition, staged/draft content, validation, display window, placement context, and editor controls.
- Right readiness/action rail: publish readiness, placement status, API/write/sync availability, and next actions.
- Content library: subordinate search/table/list surface below the main workspace or as a compact secondary section.
- Config tab: admin console with diagnostics collapsed by default.

## Modes

| Mode | Practical trigger | Layout behavior | Actions | Workspace behavior | Library/overflow behavior |
|---|---|---|---|---|---|
| Wide desktop | Approx. 1440px+ usable viewport or wide SharePoint section | Three-zone workspace: left lane nav, central selected-lane workspace, right readiness/action rail. Content library sits below as subordinate support. | Sync Docs, Sync Projects, Open Foleon, View Diagnostics visible in header. | Central workspace gets the strongest width and hierarchy. Placement manager is integrated with selected lane. | Library table uses polished horizontal/vertical overflow only for secondary content. |
| Standard desktop/laptop | Approx. 1024-1439px usable width | Prefer three zones if actual container width supports it; otherwise left nav + central workspace with rail compacted under/right of workspace. | Primary actions remain visible, wrapping only when needed. Disabled actions keep explanations. | Selected lane remains primary; readiness rail may compress into a band. | Library remains secondary and may reduce metadata density. |
| Tablet landscape | Approx. 900-1023px usable width or constrained SharePoint section | Lane nav becomes a compact rail or horizontal status list. Workspace and readiness stack into two authored bands. | Sync actions may wrap together; View Diagnostics remains reachable. | Live/staged and readiness stay above editor details. | Library uses ScrollArea and lower density; no primary horizontal scroll. |
| Tablet portrait | Approx. 600-899px usable width | Single-column premium mode. Lane nav appears before workspace as horizontal/scrollable cards or compact list. Readiness rail becomes a section below selected-lane summary. | Header actions wrap into grouped rows; all actions remain visible or explicitly moved into a compact action group. | Workspace shows selected lane summary, readiness, then editable/details sections. | Library moves below as compact records with controlled overflow. |
| Phone portrait | Under approx. 600px usable width | Single-column minimal mode. Lane navigation remains first-class and touch-safe. Rail content becomes readiness/action panels below the selected lane. | Critical actions remain reachable; blocked actions show concise explanations. | Metadata is selective; long technical text is collapsed. | Library becomes a compact secondary list or scroll area. |
| Short-height / phone landscape | Height under approx. 640px | Vertical chrome compresses. Header copy and status chips reduce density. Workspace starts quickly after tabs. | Primary actions stay reachable without relying on hover. | Selected lane summary and next action appear before lower-detail panels. | Secondary content uses scroll areas; no two-dimensional scrolling for primary work. |
| Narrowest stable nested mode | Under approx. 360px or heavily constrained SharePoint slot | Single-column stable mode. No forced columns. Noncritical metadata collapses or moves behind disclosure. | Actions stack; every disabled action has nearby plain-language reason. | Lane nav, selected summary, readiness, and next action remain readable and tappable. | Library is subordinate and may be collapsed/summary-first. |

## Container-Aware Rules

- Do not choose a multi-column layout only because `window.innerWidth` is large. The Manager must honor actual hosted slot width where measurable.
- If container width cannot support lane nav + workspace + rail, collapse the rail first, then convert lane nav into a compact/horizontal list, then use single-column mode.
- Single-column fallback is a successful premium mode, not a degraded afterthought.
- Primary content must never require horizontal scrolling. Horizontal overflow is allowed only for secondary table content inside a polished scroll area.
- Short-height behavior must reduce chrome and keep primary actions, selected lane, readiness, and next action reachable.

## Implementation Markers

The rendered Manager should expose stable layout markers for tests and hosted proof:
- `data-breakpoint-width`
- `data-breakpoint-short-height`
- `data-breakpoint-narrow-stable`
- `data-breakpoint-row-sharing`
- A workspace-level mode marker such as `data-manager-layout`

## Acceptance Criteria

- Desktop screenshots show a full admin workspace with left navigation, central lane workspace, right readiness/action rail, and subordinate content library.
- Tablet/narrow screenshots show intentional collapse, not accidental compression.
- Phone/narrowest mode remains readable, touch-safe, and free of primary horizontal scroll.
- Short-height mode keeps primary action and selected lane context visible.
- Limited mode follows the same layout contract and does not collapse into empty cards.
