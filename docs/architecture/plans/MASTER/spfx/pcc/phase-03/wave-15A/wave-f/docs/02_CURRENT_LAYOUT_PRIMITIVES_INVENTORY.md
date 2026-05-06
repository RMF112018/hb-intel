# 02 — Current Layout Primitives Inventory

## Objective

Inventory existing PCC layout/card primitives and define the remediation questions each primitive must answer.

## Current Primitives

| Primitive | Path | Current role | Wave D action |
| --- | --- | --- | --- |
| `PccShell` | `apps/project-control-center/src/shell/PccShell.tsx` | Wraps navigation, header, canvas, and `PccBentoGrid` | Verify host-fit, canvas padding, and interaction with constrained SharePoint width. |
| `PccShell.module.css` | `apps/project-control-center/src/shell/PccShell.module.css` | Shell/canvas layout and responsive padding | Verify no dead canvas or cramped content caused by padding/flex settings. |
| `PccBentoGrid` | `apps/project-control-center/src/layout/PccBentoGrid.tsx` | Container breakpoint provider and CSS grid root | Preserve; add/verify region/tier support if needed. |
| `PccBentoGrid.module.css` | `apps/project-control-center/src/layout/PccBentoGrid.module.css` | CSS grid columns, row unit, gap, container-type | Verify safe min-column behavior under SharePoint constraints. |
| `PccDashboardCard` | `apps/project-control-center/src/layout/PccDashboardCard.tsx` | Shared card shell, footprint, hierarchy, density, row/column span | Extend from generic hierarchy to explicit tier contract if necessary. |
| `PccDashboardCard.module.css` | `apps/project-control-center/src/layout/PccDashboardCard.module.css` | Card visuals, header/content layout, hierarchy styles | Strengthen tier-specific visual weight and compact/reference styling. |
| `footprints.ts` | `apps/project-control-center/src/layout/footprints.ts` | Responsive modes, columns, spans, protected min spans | Verify modes and spans are sufficient for all surfaces and host widths. |
| `useContainerBreakpoint` | `apps/project-control-center/src/layout/useContainerBreakpoint.ts` | Container-size measurement | Verify SSR/test fallback and ResizeObserver behavior. |
| `useBentoRowSpan` | `apps/project-control-center/src/layout/useBentoRowSpan.ts` | Dynamic row-span calculation | Preserve collapse-resistant scrollHeight logic; test real card cases. |
| `PccSurfaceContextHeader` | `apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx` | Shared surface/project context header | Preserve and ensure it lives in Tier 1 command cards. |
| `PccPreviewState` | `apps/project-control-center/src/ui/PccPreviewState.tsx` | State display | Preserve Prompt 05 copy/state model; ensure state cards use layout tiers correctly. |
| `PccDisabledAffordance` | `apps/project-control-center/src/ui/PccDisabledAffordance.tsx` | Disabled/inert control helper | Preserve and use in operational cards as needed. |

## Existing Primitive Strengths

- Container-based breakpoints exist.
- Protected min spans exist.
- Row-span collapse resistance is tested.
- Cards carry diagnostic data markers.
- Shared hierarchy/density props exist.
- Surface context header exists.

## Primitive Gaps

1. `hierarchy` is generic (`primary`, `standard`, `supporting`) and not mapped to Tier 1 / Tier 2 / Tier 3 product semantics.
2. `footprint` and `hierarchy` can drift independently; nothing prevents a visually important card from rendering as `standard` or a reference card from looking too heavy.
3. `PccDashboardCard` hardcodes `h3` for titles, which may not satisfy route-level heading hierarchy.
4. Region semantics are not primitive-owned. Command/operational/reference regions are inferred by card title and location.
5. There is no shared surface layout wrapper/pattern primitive. Surfaces return fragments of direct cards; this preserves the bento invariant but makes layout pattern adoption inconsistent.
6. Screenshot evidence is not produced by primitives and must be captured at route/surface level.

## Required Local Primitive Decisions

The local agent must choose one of these implementation strategies and document the choice:

### Preferred Strategy A — Extend Existing Primitives

- Add `tier?: 'tier1' | 'tier2' | 'tier3'` to `PccDashboardCard` while preserving existing `hierarchy` compatibility.
- Map tiers to existing hierarchy values internally or deprecate generic hierarchy after adapters are updated.
- Add optional `region?: 'command' | 'operational' | 'reference'` marker.
- Add optional `headingLevel?: 2 | 3 | 4` or semantic heading primitive.
- Keep `footprint` as layout span but make tier the source of visual weight.

### Acceptable Strategy B — Create Thin Surface Section Primitive

- Add `PccSurfaceSection` or `PccCardRegion` that renders no extra DOM or renders an approved bento-compatible wrapper.
- It must not break direct-child card layout.
- It can provide region metadata and enforce allowed card tiers.

### Avoided Strategy C — One-Off Surface CSS

- Do not hardcode per-surface grid patches unless unavoidable and documented.
- Do not solve Team & Access alone while leaving the primitive system ambiguous.

## Tests Already Present and To Preserve

- `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx`
- `apps/project-control-center/src/layout/useBentoRowSpan.test.tsx`

## Tests to Add or Expand

- `PccDashboardCard.tiers.test.tsx` or equivalent.
- Surface route tests verifying one Tier 1 card per route and presence of Tier 2/Tier 3 cards where applicable.
- Team & Access responsive/footprint tests under `forceMode` variants.
- Heading-level/aria marker assertions.
