# Prompt 02 — Read Seams, Normalization, and Breakpoint Resolution

## Objective
Implement the canonical Priority Actions read-model stack: config/item readers, active-row resolution, normalization, audience filtering, schedule filtering, breakpoint visibility resolution, and overflow assignment.

## Current-state repo-truth
- The current repo already mounts the public `PriorityActionsRail`, so the runtime surface exists.
- The list-schema docs explicitly say the direct public list-read adapter is still pending, so this seam is a real implementation gap, not a speculative enhancement.
- The hb-webparts package already has homepage helper/model territory where this logic can be placed deliberately rather than hiding it in a render component.

## Relevant SharePoint list-schema truth
Use the documented fields exactly.
Critical rules:
- config active-row resolution must follow the documented precedence
- item normalization must treat `ItemStatus=Enabled` as the base render gate
- `AudienceKeys` must normalize from newline-delimited storage format
- `OverflowOnly=true` must force overflow treatment
- deterministic ordering must use `SortOrder` then stable identity
- schedule visibility must respect `StartsAtUtc`/`EndsAtUtc` validity
- device gates must respect all five explicit visibility fields

## Why the current implementation is insufficient
The public rail cannot credibly meet the spec if:
- config selection is implicit or first-row-based
- list reads are hidden in the webpart component
- audience/schedule/device logic is scattered or duplicated
- overflow assignment is driven only by UI layout instead of normalized render intent
- breakpoint visibility is not explicit and testable

This prompt closes the runtime truth layer before UI refactor begins.

## Relevant governing doctrine / benchmark authorities
- Doctrine requires explicit breakpoint behavior, host-safe runtime resilience, and credible empty/loading/error states.
- Benchmark governance requires contract/data rigor, backend seam quality, state orchestration quality, and closure proof.
- The homepage overlay explicitly requires prioritized actions rather than a flat equal-weight directory and binds action visibility by breakpoint expectations.

## Exact files, seams, symbols, patterns, and schema docs to inspect
Inspect:
- outputs from Prompt 01
- `apps/hb-webparts/src/webparts/priorityActionsRail/`
- `apps/hb-webparts/src/homepage/helpers/`
- `apps/hb-webparts/src/homepage/models/`
- any existing list-source, adapter, or resolver patterns already used elsewhere in `hb-webparts`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md`

Implement named seams equivalent to:
- `readPriorityRailBandConfig(...)`
- `readPriorityRailItems(...)`
- `resolveActivePriorityRailConfig(...)`
- `normalizePriorityRailData(...)`
- `filterPriorityRailByAudience(...)`
- `resolvePriorityRailByBreakpoint(...)`

## Required implementation outcome
Build a deliberate read-model layer that:
- reads config/items from the canonical lists
- resolves the active config row deterministically
- maps SharePoint rows into normalized contracts
- filters by audience, schedule, and device class
- resolves visible primary actions vs overflow actions by config and breakpoint
- exposes a clean result model that the public rail and admin preview can both consume

## What done really looks like
- The public rail can request one normalized model instead of reaching into SharePoint rows directly.
- The same model can power admin preview without preview-only divergence.
- Breakpoint caps, layout modes, overflow labeling, and visibility decisions are code-visible and testable.
- Invalid config/data states resolve into explicit empty/partial/error branches rather than silent degradation.

## Proof of closure required
- Code diff showing named reader/resolver/filter seams
- unit tests or equivalent seam tests for:
  - active-row resolution
  - `OverflowOnly` behavior
  - date-window validation/filtering
  - audience key normalization
  - breakpoint visible-count and overflow resolution
- public runtime can consume a single normalized result object

## Constraints / prohibited shortcuts
- Do not hide readers inside the React component body.
- Do not perform ad hoc filtering in JSX.
- Do not use viewport-only assumptions when the layout may be nested.
- Do not silently ignore duplicate-active config rows or invalid schedules.
- Do not hardcode fallback values that conflict with documented defaults.

## Instruction not to re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
