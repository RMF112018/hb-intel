# 02 — Current Implementation Map

## Live implementation map

### A. Wrapper-owned entry stack
The relationship seam is explicit in `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`:

- the entry stack is documented as a three-part runtime sequence
- the rail is rendered before the shell
- comments explicitly state that the rail is **not** a shell occupant, preset slot, or band member
- the shell is rendered in a separate post-rail region

### B. Wrapper config seam
`apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts` keeps rail integration separate from shell module semantics.

The wrapper owns:
- `enabled`
- `bandKey`
- `activeAudience`
- optional fallback config pass-through

This is the correct seam to preserve.

### C. Wrapper envelope
`apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css` currently does two important things:

1. it sets a container-aware root with `max-width: 2200px`
2. it mirrors the shell’s density steps and padding

That mirroring is well-intentioned, but it also reinforces the impression that the rail is just another interior module inside the same padded content rail.

### D. Shell implementation
The shell remains a real post-hero operating layer with dedicated logic under:
- `HbHomepageShell.tsx`
- `shell/breakpointPolicy.ts`
- `shell/entryStackPolicy.ts`
- `shell/firstLaneResolver.ts`
- `shell/shellConformance.ts`

These seams prove that the shell already owns its own breakpoint, first-lane, and conformance rules and should **not** absorb the rail to solve a visual problem.

### E. Rail render path
`apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx` shows that the rail already has a real, container-aware presentation path:

- list-sourced data read seam
- container measurement
- device resolution
- layout / overflow normalization
- grouped sections
- governed loading / empty / error states

This means the work now is not “make it dynamic.” The work is “make the final public expression worthy of the flagship context and lock it against regression.”

### F. Presentation normalization seam
`apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts` maps device classes to presentation outcomes.

Current outcomes already normalize authored layouts into governed public modes such as:
- desktop segmented -> grid
- desktop hybrid -> rail
- tablet hybrid -> rail
- mobile grid -> compact + menu
- mobile scroll -> compact + inline disclosure

That is strong infrastructure. It needs harder proof and a better flagship surface contract.

### G. Shared UI surface family
The decisive public render is in:
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/variants.ts`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

This surface family currently:
- uses CVA variants for urgency and layout
- uses `motion`, `lucide-react`, and Radix Separator
- supports inline/menu/sheet overflow strategies
- preserves loading/empty/error states

But the root surface still uses:
- tinted card-like background
- 10px rounded border radius
- visible border
- narrow card header rhythm
- row treatment that still reads as “module card” before it reads as “homepage command band”

### H. Current rendered-condition diagnosis
The screenshot aligns with repo truth:

- architecture is correct
- public expression is still underpowered
- the failure is **not** that the rail is in the wrong ownership layer
- the failure is that the wrapper envelope and surface-family language combine into a visually boxed result
