# 01 — Updated PCC Shell Remediation Plan

## Objective

Remediate the PCC shell more deeply than the prior compact context-band plan by replacing the vertical rail shell with a thin, premium, SharePoint-host-safe shell composed of:

1. compact Project Hero Band,
2. premium horizontal tab navigation,
3. 8-mode PCC breakpoint policy,
4. preserved bento/cockpit content layout,
5. standard-laptop optimization for 14-inch laptop class screens.

## Supersession

This plan supersedes any Prompt 02 implementation that would add a separate `PccProjectContextBand` under the existing `PccProjectIntelligenceHeader`.

The target is not:

```text
Header + Context Band + Vertical Rail
```

The target is:

```text
Project Hero Band + Horizontal Tabs + Canvas/Bento
```

## Current Repo Truth to Treat as Baseline

At Prompt 01 closeout baseline:

- `PccShell.tsx` imports and mounts `PccNavigationRail`.
- `PccShell.tsx` imports and mounts `PccProjectIntelligenceHeader`.
- `footprints.ts` defines 5 modes: `phone`, `tabletPortrait`, `tabletLandscape`, `standardDesktop`, `wideDesktop`.
- `useContainerBreakpoint.ts` resolves modes through `resolveResponsiveMode`.
- `PccProjectIntelligenceHeader` owns identity, active surface context, pills, date scope, and command search.
- `PccCommandSearch` is display-only / read-only.
- `PccDashboardCard` already supports `hierarchy="primary" | "standard" | "supporting"`.
- Project Home returns a fragment of direct `PccDashboardCard` children and must retain the bento direct-child invariant.

## Corrected Plan Decisions

| Decision | Final |
|---|---|
| Navigation style | Premium horizontal tabs. |
| Vertical rail | Remove after horizontal tabs are implemented and tests are migrated. Do not delete first. |
| Hero/header | Replace `PccProjectIntelligenceHeader` with `PccProjectHeroBand`. Do not add a second persistent band. |
| Breakpoints | Expand PCC-local `footprints.ts` to 8 modes. Do not modify homepage breakpoint policy for PCC. |
| Standard laptop | Treat 1181–1440 px as primary design range. |
| HbcTabs | Use or compose `HbcTabs` only if it satisfies the public API and required behavior. PCC-local wrapper may implement missing behavior. |
| Bento | Preserve `PccBentoGrid`, `PccDashboardCard`, and row-span logic. |
| Final score | Target score ≥3 in shell-related categories. Do not claim Wave 15A 56/56 from shell work alone. |

## Implementation Batches

1. Rebaseline and supersede prior Prompt 02 scope.
2. Expand breakpoint contract.
3. Add horizontal tab primitive.
4. Add Project Hero Band.
5. Recompose shell and remove rail.
6. Harden nav accessibility and smoke all surfaces.
7. Tune Project Home bento priority for standard-laptop range.
8. Update README and evidence index.
9. Final closeout and handoff.

## Non-Scope

- Surface redesign.
- Backend/API changes.
- Live read-model integration.
- Graph/PnP/SharePoint REST.
- Procore integration polish.
- SPFx package/manifest bump unless packaging files actually change and user approval is obtained.
- Phase 4 right-side contextual panel.
