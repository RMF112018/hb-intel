# Project Sites Breakpoint Contract and Compact Modes — Closure

## Contract
Project Sites now uses a container-aware breakpoint contract resolved from measured container width and height (not viewport width alone).

| Mode | Rule | Behavior |
|---|---|---|
| `wide` | `width >= 1180` and not short-height | Full control bar with segmented scope control, search, sort, filters, reset |
| `medium` | `820 <= width < 1180` and not short-height | Task-first two-lane control arrangement (search first, scope/sort/actions second) |
| `compact` | `width < 820` OR short-height override | Single-column controls, compact scope select replaces segmented pills |
| short-height override | `height < 560` | Forces compact mode even at wider widths |

Implementation source: `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`.

## Implemented Behavior
- `ProjectSitesRoot` now resolves and exposes container state via `ResizeObserver` and applies mode-specific control-bar layout.
- Compact mode uses a native scope `<select>` (`aria-label="Scope (compact)"`) to avoid segmented-control clutter in constrained states.
- Root surface exposes diagnostics hooks:
  - `data-project-sites-layout-mode`
  - `data-project-sites-short-height`
  - `data-project-sites-control-layout`
- `ProjectSiteCard` accepts optional `layoutMode` and applies compact footer treatment; cards expose `data-project-sites-card-layout`.

## Interaction Reachability Proof
- Search, scope, sort, and filter entry points remain present in compact mode.
- Primary launch action remains present in compact card mode.
- No primary interaction relies on horizontal scrolling in compact mode.

## Validation Evidence
- Added resolver tests: `projectSitesLayoutMode.test.ts` (width/height matrix + short-height override).
- Updated root tests: compact selector rendering, segmented-control suppression in compact mode, and short-height data hook behavior.
- Updated card tests: compact layout mode contract and launch-action visibility.
