# 00 — Enhanced Shell Audit Summary

## Phase 1 — Framing

### Objective
Audit the two attached draft packages against live repo truth in `main`, keep only the shell findings that survive contact with the codebase, add research-backed shell architecture guidance, and produce one stronger shell-only implementation package.

### Inputs audited
1. `basic-ui-audit`
2. `composition-future-state-audit`

### Live repo under audit
Primary seams:
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/ZoneErrorBoundary.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/*`
- `apps/hb-webparts/src/mount.tsx`

Relevant governing docs:
- `docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/03-Architecture-and-Shell-Embedded-Contract.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`

### Boundary lock
The shell is the audited product.

Hosted webparts are discussed only for:
- shell nesting fit
- slot comfort
- width and density assumptions
- shell-aware variant needs
- compatibility restrictions
- future admission readiness

### No-deferral rule applied here
Material shell work that the earlier packages split into later waves has been pulled into one consolidated shell implementation track.

## Repo-truth verdict

`hbHomepage` is **not** currently a governed shell. It is a thin fixed host.

### What the code actually does today
- `HbHomepage.tsx` delegates directly to `HbHomepageShell.tsx`.
- `HbHomepageShell.tsx` builds one `zoneProps` object and renders five zone wrappers in a fixed hard-coded order.
- `HbHomepageShell.module.css` defines a single flex-column shell with widening gap and padding at two viewport breakpoints.
- `hbHomepageContract.ts` exposes broad `Record<string, unknown>` config typing and does not define a typed shell layout schema, preset model, or capability contract.
- `ZoneErrorBoundary.tsx` catches errors and returns `null`, producing invisible slot loss.
- `mount.tsx` explicitly states that `hbSignatureHero` remains independent and that `hbHomepage` owns the composed post-hero operating layer.

### What that means
The shell has:
- zone wrappers
- intentional module composition
- a clear post-hero boundary
- basic reduced-motion protection

But it still lacks:
- a typed shell schema
- declarative slot/band resolution
- capability metadata for occupants
- container-aware responsive logic
- governed presets
- invalid-layout fallbacks
- visible degraded-state behavior
- closure proof

## Phase 2 — Package-to-repo truth audit

### Correct findings to preserve

#### From `basic-ui-audit`
Keep:
- shell contract drift
- silent zone-failure problem
- need for stronger shell authority
- need for hosted validation and closure proof

#### From `composition-future-state-audit`
Keep:
- schema / slot / registry direction
- module capability metadata
- breakpoint-aware shell orchestration
- protected vs configurable shell decisions
- control-panel-readiness groundwork
- compatibility-aware placement and prominence modeling

### Findings that are directionally right but underdeveloped

1. **“Shell authority”** is right, but both packages stop short of requiring a typed parser/validator for shell layout data.
2. **“Breakpoint behavior”** is right, but the stronger package still speaks mostly in viewport terms; the shell needs container-aware rules.
3. **“Control-panel readiness”** is right, but both packages leave the persistence / normalization / invalid-config contract too vague.
4. **“People & Culture needs work”** is right only in shell-fit terms. The final package narrows that work to occupant capability and shell-fit adjustments, not a broad standalone redesign brief.

### Duplicated findings across packages

Repeated and now merged:
- explicit registry / schema need
- shell-level responsive orchestration
- shell-level fallback behavior
- shell closure proof
- People & Culture as the shell-fit outlier

### Outdated or inaccurate findings

#### 1. Hero absorption into `hbHomepage`
This is the biggest correction.

The earlier basic package treated the absence of a flagship top-band *inside the shell* as a critical shell gap. Repo-truth does not support that. The shell is post-hero by design.

This is removed from the final implementation package.

#### 2. Broad child-webpart remediation phrasing
Several earlier prompts drift into standalone module redesign. Those have been rewritten into shell-compatibility work only.

#### 3. Wave-based deferral of core shell work
Both earlier packages postpone material shell work. That conflicts with the no-deferral rule for this exercise, so the final package uses one implementation track.

### Missing shell issues not fully covered by the earlier packages

1. Typed shell schema validation and normalization
2. Explicit separation between:
   - shell layout schema
   - module config slices
   - runtime renderer context
3. Container-aware layout resolution instead of only viewport-based CSS spacing
4. Invalid-preset / invalid-occupancy fallback behavior
5. A code-level distinction between:
   - current active occupants
   - inactive but known candidate occupants
6. Clear persistence boundaries for future control-panel state without shipping the control panel UI now

### Structural gaps in the earlier package organization

1. Too much emphasis on historical wave grouping.
2. Not enough emphasis on typed shell data contracts.
3. Not enough closure detail around invalid layout states.
4. Too much module-specific remediation language for a shell-only package.
5. No dedicated compatibility matrix file for current shell occupants.

## Breakpoint-spec alignment update

The package is now also aligned to the local repo breakpoint spec at `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`.

That matters because the earlier package still treated shell responsiveness too generically. The new spec makes several entry-state requirements explicit:

- the first screen must deliver brand + action + value
- the hero is not the homepage
- the first shell lane must begin on first view
- practical usable shell width matters more than raw device resolution
- tablet portrait and handheld states should default to disciplined single-column first-lane behavior
- two-column first lanes are conditional on real shell-fit stability, not on technical width alone

The shell package therefore now treats **entry-state breakpoint policy** as a first-class shell concern instead of just “responsive CSS.”

## Phase 3 — Research-enhanced shell findings

Research-backed implications are detailed in `02-Research-Informed-Shell-Architecture-and-UX-Implications.md`, but the decisive conclusions are:

1. The shell should become **container-aware**, not just viewport-aware.
2. A **preset-driven public render path** is the right next step; freeform layout engines should not become the public runtime too early.
3. Shell responsiveness should be driven by:
   - container width
   - slot comfort thresholds
   - capability metadata
   - governed demotion / collapse rules
4. Future drag/reorder work belongs to a maintainer-facing authoring surface, not to the public shell renderer.
5. The shell should meet accessibility reflow obligations for all non-excepted content around module chrome and shell-level controls.

## Phase 4 — Consolidated shell issue architecture

The best consolidated issue structure is:

1. typed shell schema / registry / validation
2. registry-driven post-hero shell renderer
3. container-aware responsive orchestration
4. degraded-state + invalid-config + diagnostics
5. occupant capability contracts + bounded shell-fit adjustments
6. governed presets + protected decisions + persistence boundaries
7. validation + conformance + closure proof

That structure is what the prompt set now follows.

## Phase 5 — Final package contents

This package includes all minimum required files and adds one extra file:

Added beyond the minimum:
- `01A-Current-Occupant-Shell-Compatibility-Matrix.md`
- `02A-Shell-Entry-Breakpoint-Spec-Alignment.md`

That file exists to keep the hosted-webpart discussion bounded to shell compatibility.

## Phase 6 — Executive summary

### Biggest weaknesses in the original packages
- the basic package mis-scoped the independent hero into the shell
- both packages deferred too much shell work
- both packages under-specified typed shell data validation
- both packages blurred shell work and child-webpart work in places

### Biggest improvements in this package
- hard shell-only boundary
- hero boundary corrected to repo truth
- one consolidated implementation track
- stronger typed-schema and invalid-config emphasis
- explicit entry-state breakpoint policy aligned to the local shell spec
- explicit control-panel readiness without drifting into freeform layout UI work

### Highest-risk shell issues now properly addressed
- fixed-stack rendering without layout data contracts
- silent slot disappearance
- lack of container-aware behavior
- lack of explicit first-lane and entry-state breakpoint policy
- missing occupant capability model
- missing preset / persistence boundary
- lack of closure proof

### Implement-now priorities
1. schema + registry + validation, including named entry-state breakpoint policy
2. registry-driven orchestrator with an explicit first-lane concept
3. container-aware layout resolution aligned to the breakpoint spec’s practical shell targets
4. visible degraded-state behavior
5. capability metadata, narrowest stable modes, and shell-fit rules
6. governed presets, protected entry-state decisions, and persistence boundaries
7. validation and scorecard closure against the breakpoint spec as well as benchmark doctrine
