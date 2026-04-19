# Package vs Repo Truth Reconciliation

## Scope

This reconciliation compares the attached `hb-homepage-hero-unification-package.zip` against the live `main` branch implementation seams governing:

- `HbHomepage`
- `HbHomepageEntryStack`
- `HbSignatureHero`
- `mount.tsx`
- `ReferenceHomepageComposition.tsx`
- entry-stack governance contracts
- responsive and measurement policy seams

## What the attached package got right

### 1. It correctly identified that the current split is intentional
The attached package correctly recognized that the current hero/homepage split is codified in repo truth rather than being a casual wiring accident.

### 2. It correctly identified wrapper ownership as the right destination
The attached package correctly concluded that the hero belongs in the wrapper-owned entry stack rather than the shell occupant registry.

### 3. It correctly identified responsiveness as a first-class closure unit
The attached package correctly called out that the hero is too desktop-biased and that a proper solution must handle constrained widths and heights better.

### 4. It correctly identified that orchestration seams must be updated
The attached package correctly understood that the runtime cutover cannot be closed by editing hero JSX/CSS alone. It must also touch runtime and governance seams.

## What the attached package got wrong or overreached

### 1. It treated manifest truth as a larger closure unit than repo truth currently supports
The repo already gives both the hero and homepage full-bleed support. Manifest churn may still be warranted for clarity, but it is not a primary architecture blocker.

### 2. It did not distinguish strongly enough between reusable hero surface and flagship composition
The repo should still preserve non-flagship/article-mode reuse. The package did not emphasize enough that the flagship composition truth and the reusable hero surface are different concerns.

## What the attached package under-explained

### 1. Wrapper-owned hero property/config migration
The attached package did not sufficiently explain how the flagship hero’s homepage-specific inputs move from standalone hero-property flow into a wrapper-owned integration seam.

### 2. Shared entry-state truth
The repo already has:
- `useShellContainer`
- `ShellContainerState`
- shared snapshot helpers
- `breakpointPolicy`
- `entryStackPolicy`
- `entryStackContract`

The attached package did not anchor tightly enough to those existing seams or force the hero to participate in them.

### 3. Duplicate-hero hosted cutover risk
The attached package did not explicitly close the operational risk that the old standalone hero may remain authored on the page after wrapper-owned hero cutover.

### 4. Reference/runtime drift
The attached package identified orchestration work, but not with enough precision around:
- `mount.tsx`
- `entryStackOrchestration.ts`
- `ReferenceHomepageComposition.tsx`
- wrapper ownership comments
- hosted validation docs

### 5. Closure proof
The attached package did not require enough concrete proof of:
- region ordering,
- no duplicate hero,
- no horizontal overflow,
- constrained-height behavior,
- and first-lane-first-view preservation.

## Which existing prompts were too broad or too weak

### Original Prompt 01
Directionally right, but it needs to be split between:
- wrapper-owned runtime cutover,
- and wrapper-owned hero config migration.

### Original Prompt 02
Directionally right, but too abstract. It discussed a shared contract without forcing use of the repo’s existing measurement/state seams.

### Original Prompt 03 and 04
Good direction, but too separable from the already-existing entry-state apparatus. The enhanced package makes hero responsiveness explicitly subordinate to entry-stack truth.

### Original Prompt 05
Too broad. It bundled mount, reference, and manifest truth into one unit without distinguishing must-change from maybe-change.

### Original Prompt 06
Correct to require validation, but it did not force duplicate-hero proof or a hosted operational cutover path strongly enough.

## Rebuilt package posture

The enhanced package therefore:

- keeps the correct architecture conclusion,
- sharpens the ownership boundary,
- narrows the wave structure,
- adds missing cutover and proof units,
- removes overbroad emphasis where repo truth does not require it,
- and produces more precise implementation prompts.
