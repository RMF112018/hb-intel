# 01 — Repo-Truth Architecture and Ownership Map

## 1. Entry/runtime composition
`HbHomepage.tsx` is intentionally thin. It delegates directly to `HbHomepageEntryStack.tsx`, which is the actual wrapper-owned pre-shell composition seam.

That means the homepage runtime is already organized as:
1. authored hero webpart above this package
2. wrapper-owned priority-actions region
3. `HbHomepageShell`

That composition boundary is sound and should remain intact.

## 2. Wrapper-owned responsibilities
`HbHomepageEntryStack.tsx` and `hbHomepageWrapperConfig.ts` own:
- whether the embedded rail renders at all
- wrapper-owned band key and audience threading into the embedded rail
- wrapper-owned featured action promotion inputs
- DOM order: actions region before shell region
- the explicit decision that the rail is embedded as a React surface and is **not** a shell occupant

The wrapper should continue to own those decisions.

## 3. Shell-owned responsibilities
`HbHomepageShell.tsx` and `shell/**` own:
- layout parsing and diagnostics
- container measurement
- entry-state resolution
- first-lane recomposition
- band pairing/stacking
- slot comfort resolution
- shell conformance reporting
- shell-only orchestration of zone wrappers

The shell should continue to own those decisions.

## 4. The load-bearing live seams
### Wrapper / entry stack
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`

### Shell runtime
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`

### Shell logic
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/firstLaneResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellConformance.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`

### Current proof seam clearly in play
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageEntryStack.test.tsx`

## 5. The current fit/governance risk pattern
### Outer envelope pattern
The entry stack root currently behaves like a page envelope:
- `width: 100%`
- `max-width: 2200px`
- `margin: 0 auto`

The shell root also behaves like a page envelope:
- `width: 100%`
- `max-width: 2200px`
- `margin: 0 auto`
- breakpoint-sensitive root padding

That is the core governance concern.

### Why this matters
The repo comments make clear that the actions strip is supposed to feel narrower and more top-band-like than the shell below it. That is a valid **inner inset** decision. The problem is that the current code still makes both wrapper and shell look like outer envelope authorities.

Those are different jobs and should not be collapsed together.

## 6. Current measurement ownership
`useShellContainer.ts` is the active shell measurement seam.

Right now it:
- observes the shell element itself with `ResizeObserver`
- reads observed dimensions from the element’s box data
- feeds that width into entry-state resolution
- feeds that width into slot comfort and pairing logic via `resolveBandLayout`

That makes the current width model highly sensitive to how the shell root itself is sized and padded.

## 7. Current proof condition
`hbHomepageEntryStack.test.tsx` proves wrapper composition order and boundary integrity well.

What it does **not** yet prove at the same level is:
- authoritative outer fit
- truthful usable-width accounting
- breakpoint truth near threshold widths
- no-hosted-overflow regression
- closure under realistic hosted device/viewport conditions

## 8. Architecture judgment
The shell architecture is mature enough to preserve.

The closure problem is not “the shell needs to be reinvented.”
It is “the shell and wrapper need a more explicit fit contract, a better measurement model, and harder proof.”
