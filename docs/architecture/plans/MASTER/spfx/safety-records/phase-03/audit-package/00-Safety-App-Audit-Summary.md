# 00 — Safety App Audit Summary

## Bottom line

The current Safety app is **not close to flagship / benchmark-grade status**. It is a credible **domain and repository baseline** with working route coverage for the core Release 1 workflow, but the rendered UX remains closer to an internal operational prototype than a premium, doctrine-compliant SPFx product surface.

Current assessment:
- **Not flagship**
- **Not homepage-grade by the governing scorecard**
- **Fails minimum professional acceptance without written exceptions**
- Strongest area: domain/data seam rigor
- Weakest areas: composition, responsive strategy, state modeling, and visual productization

## Key preserved strengths

1. **Thin-ish architecture**
   - `apps/safety/src/App.tsx` is mostly composition/orchestration, not business-logic sink.
   - `packages/features/safety` carries the typed repository, query hooks, parsing/scoring contracts, and list topology.

2. **Real workflow coverage exists**
   - Upload
   - Reporting-period dashboard
   - Project-week drill-in
   - Inspections list/detail
   - Review queue / replay path

3. **Host posture is directionally correct**
   - The app does not try to replace SharePoint chrome wholesale.
   - It stays within the page canvas and uses a simplified internal shell.

4. **The data layer is much stronger than the UI layer**
   - The domain package documents the ingestion state machine, cross-site topology, and runtime GUID overlay discipline.

## Most important failures

1. **The visual result is materially under-productized**
   - Large blank canvas
   - timid left-rail composition
   - sparse forms
   - raw tables
   - little visual hierarchy
   - minimal premium language

2. **The pages do not meaningfully use the shell’s state-model contract**
   - `WorkspacePageShell` supports loading, empty, error, dashboard/list layouts, command bars, and shell-aware overlays.
   - The Safety pages mostly bypass that value and render raw child content with `data = []` fallbacks.

3. **Layout labels are present, but the real layout system is not actually engaged**
   - `layout="list"` is passed without `listConfig`
   - `layout="dashboard"` is passed without `dashboardConfig`
   - The result is nominal shell usage, not actual shell-quality composition

4. **Responsive and compact-state behavior is largely implicit**
   - fixed-width tables
   - fixed 4-column stat rows
   - inline styles
   - no container-aware strategy
   - no authored compact mode

5. **The exposed navigation over-promises product completeness**
   - The shell advertises `Incidents`, but the route is a future-release empty placeholder.

## Fastest high-impact wins

1. Rebuild the Safety workspace masthead and top task composition.
2. Replace raw table-and-copy pages with authored sectioned layouts and reusable safety-specific primitives.
3. Wire `WorkspacePageShell` correctly for loading/empty/error/list/dashboard states.
4. Add real compact/mobile behavior instead of letting wide layouts compress.
5. Convert upload/review/detail surfaces into intentional workflow objects instead of basic form/table blocks.

## Structural upgrade opportunities

1. Create a **Safety Workspace Surface family**
   - masthead
   - filter bar
   - stat cards
   - action rail
   - score strip
   - findings stack
   - review action cluster
   - responsive data grid/card hybrid

2. Separate page orchestration from view primitives more cleanly.
3. Hide or defer incomplete routes until they are credible, or restyle them as intentionally gated roadmap states.
4. Expand hosted validation and breakpoint-proof closure.

## Score

**20 / 56**

Hard-stop failures remain:
- generic enterprise / prototype posture
- incomplete state-model use
- weak breakpoint behavior
- weak host-runtime proof
- no package-truth validation in this session because the referenced `.sppkg` was not actually available
