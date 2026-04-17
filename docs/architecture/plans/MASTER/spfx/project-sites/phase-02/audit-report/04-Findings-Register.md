# Findings Register

## P1 — Self-observed height-driven layout mode causes feedback-loop instability
- **Files**
  - `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
  - `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- **Symbols**
  - `useProjectSitesContainerState`
  - `resolveProjectSitesLayoutMode`
  - `rootRef`
- **Issue**
  - Layout mode is derived from the dimensions of the component’s own rendered section, including content height.
- **Likely symptom**
  - control-bar wrap jitter, compact/wide flips, grid instability during filtering and transition states
- **Why it matters**
  - this is the strongest direct explanation for transient re-render glitches
- **Remediation**
  - redesign layout-mode resolution around stable container width and real viewport constraints; add state equality guard
- **Fix type**
  - structural redesign

## P1 — Grid is intentionally remounted on scope/sort changes
- **Files**
  - `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- **Symbols**
  - success-grid `key`
- **Issue**
  - grid container key is tied to `scope` and `sortKey`
- **Likely symptom**
  - flash/flicker on sort or scope change
- **Why it matters**
  - defeats React reconciliation and replays animations
- **Remediation**
  - remove the remount key; keep DOM identity stable
- **Fix type**
  - targeted refinement

## P1 — Active shell mount seam is not idempotent
- **Files**
  - `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
  - `apps/project-sites/src/mount.tsx`
  - contrast: `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.ts`
- **Symbols**
  - `ShellWebPart.render`
  - `mount`
  - module-level `root`
  - module-level `queryClient`
- **Issue**
  - `render()` calls `mount()`, while `mount()` recreates root and query client unconditionally
- **Likely symptom**
  - host-driven rerender flashes, full app reboot feel, cache resets
- **Why it matters**
  - SharePoint host behavior should not be able to destabilize the app this easily
- **Remediation**
  - make shell mount idempotent and bootstrap-once
- **Fix type**
  - structural redesign

## P2 — Render-time normalization recreates entry identity on UI-only rerenders
- **Files**
  - `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
  - `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- **Symbols**
  - `normalizeProjectSiteEntries`
- **Issue**
  - normalized entries are recreated in the hook render path
- **Likely symptom**
  - downstream rerender churn and reduced memoization effectiveness
- **Why it matters**
  - amplifies perceived instability under search/filter interaction
- **Remediation**
  - move normalization into stable query `select` or memoize on query data identity
- **Fix type**
  - targeted refinement

## P2 — Layout hook emits no-op state updates
- **Files**
  - `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
- **Symbols**
  - `setState(resolveProjectSitesContainerState(...))`
- **Issue**
  - every qualifying `ResizeObserver` event generates a fresh state object even if nothing materially changed
- **Likely symptom**
  - redundant rerenders and observer-driven churn
- **Why it matters**
  - worsens the primary layout instability issue
- **Remediation**
  - compare next/previous width bucket, mode, and short-height flag before updating state
- **Fix type**
  - targeted refinement

## P2 — Motion is attached to unstable transition points
- **Files**
  - `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- **Symbols**
  - `grid`
  - `filterPanel`
  - `provisioningDot`
  - shimmer classes
- **Issue**
  - animations are replayed or displayed at moments when the tree is already unstable
- **Likely symptom**
  - normal updates feel like glitches
- **Why it matters**
  - compounds user perception of instability
- **Remediation**
  - keep motion but restrict it to first paint or explicitly stable transitions
- **Fix type**
  - targeted refinement

## P2 — Regression coverage does not exercise real layout instability paths
- **Files**
  - `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`
- **Issue**
  - tests mock the layout hook instead of exercising it
- **Likely symptom**
  - layout-feedback defects escape test coverage
- **Why it matters**
  - current test suite cannot prove transition stability
- **Remediation**
  - add dedicated tests for layout hook behavior and repeated shell render safety
- **Fix type**
  - targeted refinement

## P3 — Manifest seam drift increases packaging risk
- **Files**
  - `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
  - `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
- **Issue**
  - manifest copies are not aligned on `supportsFullBleed`
- **Likely symptom**
  - packaging/runtime drift risk; not a direct cause of the reported glitch
- **Why it matters**
  - undermines confidence in the host-fit contract
- **Remediation**
  - align the authoritative manifest seam and document the source of truth
- **Fix type**
  - hardening
