# Prompt 02 — Force a Material Hosted Visual Delta for the Priority Actions Rail

You are working in the local checked-out live repo.

Run this prompt only **after Prompt 01 has completed** and identified the actual mismatch.

## Objective

Make only the changes required to produce a **material, hosted, visually obvious improvement** to the **Priority Actions Rail** and its immediate HB Homepage integration seam.

This is not a general homepage redesign.
This is not hero work.
This is not project spotlight work.
This is not a shell rewrite.

This prompt targets the **Priority Actions Rail**.

---

## Current failure to solve

The current hosted screenshot still reads as:

- a generic sparse card row
- low-density repeated tiles
- weak grouping rhythm
- wasted frame/chrome relative to content
- insufficiently premium command-band identity
- visually too close to a default enterprise card outcome

The prior package failed because it allowed that condition to remain while still treating the repo as largely complete.

That is over.

---

## What “done” actually looks like

The after state must be materially different in hosted SharePoint.

At minimum, the after state must clearly show:

- stronger rail-specific visual authority
- better tile density and scan rhythm
- less empty framing and less dead gutter
- more credible grouping or explicit suppression of weak/singleton grouping
- a clearer command-band feel instead of generic repeated cards
- a visibly more intentional overflow/secondary-action model where applicable

A viewer comparing before vs after must not reasonably say:
> “This is basically the same rail.”

---

## Required implementation posture

### First principle
Follow the findings from Prompt 01.

If Prompt 01 proved a package/deploy parity issue, fix that path first.
If Prompt 01 proved a mount/context/CSS activation issue, fix that path first.
If Prompt 01 proved the live logic itself still creates the weak generic layout, fix that logic directly.

### Second principle
Make the narrowest set of changes that produces a real hosted result.

### Third principle
Do not allow a second false-positive closure.

---

## In-scope seams

### Homepage wrapper / integration
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`

### Public rail logic / presentation
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`

### Shared rail surface / styling
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `packages/ui-kit/src/HbcPriorityRail/variants.ts`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`

### Packaging / deployment truth
- `apps/hb-webparts/config/package-solution.json`
- relevant build/package outputs and versioning seams

---

## Governing authority

You must align the work with:

- `docs/reference/ui-kit/doctrine/**`
- `docs/reference/spfx-surfaces/benchmark/**`

Particularly honor:

- host-aware premium SPFx posture
- anti-safety-zone rules
- shell-level and application-level breakpoint governance
- practical usable space
- container-aware behavior
- proof-based closure

---

## Explicit implementation requirements

### 1. Fix parity before polish
If the tenant is not rendering the intended flagship path, correct that first.

### 2. Fix the rail, not the whole homepage
Do not broaden into adjacent surfaces unless required to make the rail actually render correctly.

### 3. Remove weak sparse outcomes
If current linear primary selection followed by grouping produces low-value singleton sections or repetitive weak headings, correct that.

### 4. Increase tile authority
The tile field must feel more deliberate and command-oriented:
- stronger spacing rhythm
- stronger internal hierarchy
- less decorative emptiness
- clearer launch affordances
- better use of available horizontal space

### 5. Improve overflow as a secondary command layer
Overflow must feel intentional, not like a leftover footer action.

### 6. Rebuild and package
Produce a fresh, deployment-ready `.sppkg` that reflects the changes.

### 7. Prove hosted change
Closure is invalid without hosted before/after evidence.

---

## Hard prohibitions

- Do not re-read files already in active context unless needed to confirm drift, dependencies, build/package truth, or uncertainty after changes.
- Do not declare success with zero code changes.
- Do not declare success with package-only churn if the hosted UI still looks the same.
- Do not drift into hero redesign.
- Do not drift into shell redesign outside what the rail needs.
- Do not close on local-only screenshots.
- Do not treat “already present in repo” as success.
- Do not return a materially similar hosted screenshot.

---

## Required closure proof

Return all of the following:

1. **Changed file list**
   - every file changed
   - why each change mattered

2. **Implementation summary**
   - what was corrected first
   - what visual/logic changes were made
   - why those changes were the minimum necessary set

3. **Build/package summary**
   - commands run
   - package path produced
   - any version changes made to guarantee fresh deployment

4. **Hosted proof**
   - before screenshot reference
   - after screenshot
   - explicit explanation of the visual delta

5. **Rail-specific success statement**
   - explain why the new hosted rail is no longer a generic sparse card row

6. **Regression guard**
   - note any test, assertion, or documentation update added to prevent this contradiction from reappearing
