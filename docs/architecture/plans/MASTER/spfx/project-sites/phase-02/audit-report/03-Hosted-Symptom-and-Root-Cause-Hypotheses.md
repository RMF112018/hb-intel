# Hosted Symptom and Root-Cause Hypotheses

## Ranked Hypothesis 1 — Self-observed height-driven layout mode is causing control-bar and grid jitter
**Confidence:** High  
**Classification:** Proven defect with very high confidence as a symptom driver

### Code paths
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

### Why this can produce the observed glitch
The responsive mode is derived from the measured dimensions of the component’s own section element. Height is one of the mode determinants. The section height changes when the component rerenders. That means the component can change its own mode because of changes it just made itself.

### Likely visible behaviors
- controls re-stack unexpectedly
- wide layouts collapse to compact on short result sets
- filter-panel open/close causes a mode shift
- card-grid density changes after mode recalculation
- transient instability that is hard to capture in a screenshot

### Validation
Instrument the layout hook and log:
- width
- height
- previous mode
- next mode
- trigger source

Then interact with:
- scope changes
- search that reduces results
- filter panel open/close
- sort changes

### Remediation direction
- stop using rendered content height as a mode determinant
- derive mode from stable container width and true viewport-height constraints only
- add equality guards before setting layout state

---

## Ranked Hypothesis 2 — Forced grid remount and animation replay are making ordinary transitions look like flicker
**Confidence:** High  
**Classification:** Proven defect

### Code paths
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

### Why this can produce the observed glitch
The success grid has a `key` derived from `scope` and `sortKey`. That guarantees a full grid remount when those values change. The same grid also has entry animation styles. So scope/sort changes trigger complete subtree replacement plus animation replay.

### Likely visible behaviors
- sort change looks like a flash instead of a reorder
- scope change looks like a remount rather than a data update
- the grid can briefly feel unstable even when the result set is valid

### Validation
Remove the grid key locally and compare visual behavior with the same dataset and same interaction sequence.

### Remediation direction
- remove the forced grid key
- constrain grid animation to first paint only, not ordinary state updates
- prefer stable reconciliation

---

## Ranked Hypothesis 3 — The shell mount contract is rebooting the app on host-driven rerenders
**Confidence:** Medium-high  
**Classification:** High-confidence likely cause; code defect is proven, symptom frequency still needs environment confirmation

### Code paths
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/project-sites/src/mount.tsx`
- contrast file: `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.ts`

### Why this can produce the observed glitch
The shell’s `render()` calls `mount(...)`. The mount path creates a new React root and `QueryClient` every time. There is no guard for “already mounted.” If SharePoint invokes `render()` again, the app can effectively be recreated rather than updated.

### Likely visible behaviors
- brief loading flashes
- query cache reset
- full-tree remount feel
- hard-to-reproduce instability tied to authoring or host page events

### Validation
Add shell-level instrumentation to record:
- each `render()` call
- each `mount()` call
- whether a root already exists
- whether a new `QueryClient` was created

### Remediation direction
- make `mount()` idempotent
- persist root and query client across rerenders
- optionally move bootstrap to a one-time init seam

---

## Ranked Hypothesis 4 — Render-time normalization churn is amplifying rerender cost
**Confidence:** Medium-high  
**Classification:** Proven inefficiency and strong contributing weakness

### Code paths
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`

### Why this can produce the observed glitch
The hook normalizes raw data during render, recreating entry objects even when the underlying query data did not change. That increases rerender work and weakens downstream memoization.

### Likely visible behaviors
- cards rerender on search keystrokes before the debounced term changes
- filter panel toggle causes unnecessary visible work
- people-label facet derivations and pipeline work are repeated more than needed

### Validation
Memoize normalization on query `data` identity or move it into React Query `select`, then compare render counts.

### Remediation direction
- normalize once per data change
- preserve entry identity across UI-only state changes
- optionally memoize `ProjectSiteCard`

---

## Ranked Hypothesis 5 — Missing regression coverage allowed the instability seams to persist
**Confidence:** High  
**Classification:** Proven test gap

### Code paths
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`
- no dedicated layout-hook regression test in the audited footprint

### Why this matters
Current root tests mock the layout hook, so they cannot detect:
- self-observed mode oscillation
- no-op `ResizeObserver` churn
- repeated shell mount behavior

### Remediation direction
Add tests for:
- repeated shell render → no remount / no new query client
- container-state updates only when dimensions materially change
- wide desktop staying wide when content height is short
- scope/sort changes not remounting the grid
