# 00 — Homepage Launcher Audit Summary

## Objective

Audit the live `main`-branch homepage launcher against the governing SPFx doctrine, homepage overlay, homepage checklist, and homepage scorecard, with explicit emphasis on the launcher row and drawer issues surfaced in the hosted screenshots.

## Repo-truth framing

The hosted homepage launcher is not governed by the old standalone `PriorityActionsRail` webpart path. The real flagship homepage path is:

1. `HbHomepageEntryStack`
2. `HbHomepageLauncherBand`
3. `HbcHomepageLauncher`
4. `HbcHomepageLauncherOverflow`

The launcher is therefore a composed product across wrapper, data, ui-kit, shell-fit, and hosted runtime seams.

## High-level verdict

The current implementation is directionally useful but not close to flagship benchmark.

It has a credible foundation:
- explicit shell-fit authority
- explicit device-class governance
- prioritized tool ordering
- clean wrapper/data/ui-kit separation
- authored diagnostics and host-fit tests

But the rendered launcher still underperforms in the exact places that matter most on the homepage:
- the first-view row reads too boxed-in and too timid
- the row still carries noisy chrome/count treatment in the hosted result
- the overflow trigger does not read as a peer to the primary tiles
- the drawer underuses width and visually collapses
- the drawer interaction model is not runtime-truth stable
- closure evidence is stale relative to current launcher versioning

## Focused findings against the user’s six issues

### 1. More Tools tile parity
The source tries to keep `.overflowTile` on the same square size contract as `.tile`, but the active trigger anatomy adds count/chrome treatment that makes the overflow entry read differently from peer tiles. The hosted result confirms the user’s complaint. The fix is not just a width tweak; the overflow trigger must be rebuilt as the same tile primitive with the same geometry, internal alignment, and hover contract.

### 2. Remove `Homepage tools / Priority Actions` title text
The homepage launcher should not carry extra heading chrome in the flagship row. Even though the current `HbcHomepageLauncher` component does not visibly render a title block, the hosted result still shows row-heading text, which means package/runtime truth is not aligned with the intended flagship launcher posture. Homepage row heading chrome should be removed entirely for the homepage path.

### 3. Remove tool count from container
Counts are overexposed. The hosted row count pill, overflow-trigger count, sheet-header count, and section counts create unnecessary cognitive noise. The launcher should prioritize destination clarity, not inventory signaling.

### 4. Drawer should use more window width
The current drawer width cap is too conservative for desktop/tablet hosted use. It reads as a small centered modal instead of a premium bottom tray. The drawer needs a breakpoint-governed width model that uses materially more of the viewport on desktop/tablet while still respecting safe-area margins.

### 5. Drawer tile spacing / overlap
The current active drawer JSX uses grouped flex-wrapped rails. The hosted result shows clipping/overlap behavior, which means the live package is either stale or the current grouped layout still breaks in real host conditions. This is a structural gap, not a micro-spacing issue.

### 6. Functional horizontal scroll without visible scrollbar
The CSS contains dormant horizontal-rail classes, but the active JSX does not use them. If horizontal overflow is needed, it must be implemented deliberately with a true scroll viewport, not as an accidental spill state. Scrollbar suppression must be paired with alternate affordance cues and keyboard-safe operation.

## Scorecard

### Total score
**29 / 56**

### Interpretation
- Below homepage-grade acceptance
- Well below flagship / benchmark-grade acceptance
- Multiple hard-stop failures remain

### Hard-stop failures
- Hosted/package truth does not currently demonstrate stable, evidence-backed closure
- Breakpoint/overflow behavior is stressed and low-value in the supplied runtime evidence
- The first-view launcher row is still too timid/boxed-in for a flagship homepage utility surface

## Preserve vs rebuild

### Preserve
- wrapper/data/ui-kit separation
- shell-fit measurement authority
- prioritized primary tool ordering
- explicit handheld mode governance
- diagnostic marker strategy
- loading/empty/error states

### Refine heavily
- band width model
- row surface shell
- overflow trigger anatomy
- drawer header posture
- icon/title alignment
- tile spacing at all breakpoints

### Rebuild structurally
- desktop/tablet drawer layout
- overflow section rail strategy
- package-truth and hosted-proof closure workflow
