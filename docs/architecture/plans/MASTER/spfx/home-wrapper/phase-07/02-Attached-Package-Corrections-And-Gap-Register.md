# 02 — Attached Package Corrections and Gap Register

## A. What remains valid from the attached packages

### 1. Architecture direction
The attached packages correctly identified the key architectural fork:
- shell occupant migration vs
- wrapper-owned pre-shell region

Their recommendation to choose the wrapper-owned model is still correct.

### 2. Runtime-state diagnosis
The attached packages correctly identified:
- `HbHomepage.tsx` pass-through status
- separate mount-path status in `mount.tsx`
- governance-only status of `entryStackOrchestration.ts`
- absence of a rail occupant in shell types/registry/presets

### 3. General sequencing logic
The original prompt order was directionally sensible:
1. create wrapper
2. extend contracts/config
3. harden diagnostics/docs/proof

That logic still holds, but it is incomplete.

---

## B. What needs correction or reframing

### 1. “Shell is post-hero only”
This is too blunt.

The shell **renders** only shell lanes, but repo contract language already says the shell owns shell-facing entry-stack integration and begins immediately after the hero.

That language must be reconciled if the flagship homepage will become:
- hero webpart
- wrapper-owned rail
- shell

### 2. “Shared config flow from homepage wrapper to rail”
This must be narrowed.

The wrapper should not become the rail’s new content owner.  
The rail already has a mature product/data seam.

The wrapper should own only:
- whether the embedded rail is enabled
- which band key to request
- any fallback manifest config genuinely needed
- audience/context pass-through
- wrapper-level diagnostics / data attributes

### 3. “Wrapper-level integration is enough”
Not by itself.

Without page-canvas cutover / proof, wrapper integration alone can leave the flagship homepage in a broken state:
- duplicate rail
- rail + OOB Quick Links
- wrong order on the actual page
- discrepancy between repo code and tenant page reality

---

## C. Critical gaps the attached packages missed

### Gap 1 — No explicit cutover / page-canvas proof prompt
This is the biggest gap.

The prior package assumes runtime embedding is the finish line. It is not.

Completion requires proving or implementing the actual flagship homepage page-canvas state.

### Gap 2 — No explicit duplicate-action-layer risk register
Once the rail is embedded, the agent must verify the homepage page canvas no longer shows an independent action-layer surface above it.

### Gap 3 — No precise recommendation for wrapper seam placement
The prior package leaves too much latitude on implementation shape.

Preferred target:
- keep `HbHomepage.tsx` as a thin façade if helpful
- introduce a dedicated wrapper runtime component
- introduce a dedicated wrapper CSS module
- introduce a dedicated wrapper-config extraction seam outside shell-fit code where feasible

### Gap 4 — No explicit reconciliation plan for `entryStackOrchestration.ts`
This file currently says the actions layer is separately mounted in production. That statement will become partially stale for the flagship homepage if wrapper embedding is completed.

### Gap 5 — No explicit reference-composition reconciliation
`ReferenceHomepageComposition.tsx` currently states that production mounts hero, actions, and shell as separate webparts. That needs refinement after wrapper embedding.

### Gap 6 — Validation bar too low
The prior package asks for proof, but not enough proof:
- no explicit DOM attribute requirement
- no explicit page-canvas proof requirement
- no explicit visual proof set across breakpoint classes
- no explicit “no duplicate action layer” acceptance check

---

## D. New mandatory package requirements

The upgraded package must require all of the following:

1. wrapper runtime implementation
2. wrapper contract/config seam
3. comment/doc/reference reconciliation
4. homepage page-canvas cutover / proof
5. tests
6. visual proof
7. hard closure checklist

---

## E. Corrected target-state wording

Use this wording going forward:

> `PriorityActionsRail` must become a wrapper-owned, pre-shell region inside the flagship `HbHomepage` runtime. The rail remains a standalone product surface and may remain independently mountable as an SPFx webpart for non-homepage contexts. The shell remains a shell: it does not absorb the rail as an occupant, preset, or shell-semantic band.
