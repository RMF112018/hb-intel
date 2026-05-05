# 02 — Current Shell / Host / Navigation Inventory

## Objective

Inventory the current shared PCC frame and identify source ownership before remediation.

## Inventory

| System Item | Files | Current Behavior | Inputs | Styling Source | Test Coverage to Confirm Locally | Doctrine Risk | Affects All Surfaces | Blocks Wave B? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Product shell | `src/shell/PccShell.tsx`, `PccShell.module.css` | Flex shell, rail + work area, header + canvas, `data-pcc-shell="wave-2"`. | project props, active surface, force mode, children. | `PccShell.module.css`, theme vars. | Search `PccApp.test.tsx`, shell/router tests. | Preview shell lineage; host-fit risk. | Yes | Yes |
| Top header | `PccProjectIntelligenceHeader.tsx/css` | Dark header with title, subtitle, active surface, search, pills, date. | placeholder context, active surface metadata. | CSS module; header token vars. | Header rendering tests if present. | Visual dominance, project context weakness. | Yes | Yes |
| Left nav / selector | `PccNavigationRail.tsx/css` | Flat eight-surface list, icons, workflow labels, active marker. | `PCC_MVP_SURFACE_IDS`, active id, mode. | CSS module. | Keyboard/nav tests. | No operational grouping; focus style gap. | Yes | Yes |
| Active surface route mapping | `PccSurfaceRouter.tsx` | Switches eight surface ids to surface components. | `activeSurfaceId`, optional read model client. | N/A | Router/surface tests. | All-surface shell validation required. | Yes | Yes |
| Preview status indicators | `PccPreviewState`, header pills, placeholder project context | Preview state used in cards/regions; shell `previewMode` hardcoded true. | fixtures/read-model status. | preview state CSS. | State tests. | Diagnostic language prominence. | Broad | Partially |
| Project identity | `projectPlaceholder.ts`, `PccApp.tsx`, header | Generic placeholder, not project number/name/status/phase. | local placeholder. | header CSS. | App/header tests. | Weak operational anchor. | Yes | Yes |
| Command/search input | `PccCommandSearch.tsx`, header CSS | Desktop read-only input; smaller disabled icon. | static placeholder. | header CSS. | Accessibility tests needed. | Misleading primary control. | Yes | Yes |
| Content wrapper | `PccShell.module.css`, `PccBentoGrid` | Canvas pads content and uses bento grid. | children/surface output. | shell + grid CSS. | footprint tests. | Host-height/scroll unknown. | Yes | Yes |
| Scroll/height behavior | `PccShell.module.css` | `min-height: 100vh`; no inspected host chrome variable. | viewport. | shell CSS. | visual only unless tests added. | Double-scroll/clipping risk. | Yes | Yes |
| Breakpoint behavior | `useContainerBreakpoint`, `PccBentoGrid`, rail CSS | Container mode controls rail variants/grid columns. | observed element width. | CSS + hook. | breakpoint tests. | Hamburger mode hides nav list. | Yes | Yes |
| Diagnostics/debug indicators | preview mode, data markers, placeholder pills | Useful for tests, possibly over-visible in UI. | shell state/read-model. | mixed. | tests should preserve stable markers. | Executive polish risk. | Yes | Partially |

## Required Local Follow-Up

The local agent must inspect:

- all shell/nav/header tests currently present;
- all SPFx package/manifest files under `apps/project-control-center` if present;
- current visual evidence folders if present;
- current Wave 15A Prompt 01–05 closeouts in blueprint path to avoid conflicting with committed work.
