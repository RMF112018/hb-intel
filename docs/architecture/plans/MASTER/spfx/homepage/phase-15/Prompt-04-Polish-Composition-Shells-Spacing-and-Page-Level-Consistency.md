# Prompt 04 — Polish Composition Shells, Spacing, and Page-Level Consistency

## Objective

Perform the final **Phase E composition polish pass** so the homepage reference and shared composition layer feel consistent, finished, and premium at page scale.

This prompt should clean up any remaining mismatch between section shells, spacing utilities, wrappers, and page-level visual posture.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Start Here

Use the repo truth as modified by Prompts 01–03.

At minimum, inspect:

- `apps/hb-webparts/src/homepage/tokens.ts`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/homepage/shared/*`
- any composition-safe shared primitives touched earlier in the phase
- `apps/hb-webparts/README.md` if composition-related descriptions need final truth alignment

Also inspect any adjacent files needed to complete the polish pass.

---

## Required Tasks

### 1. Normalize final spacing and wrapper consistency
Clean up any remaining inconsistency in:
- top margins
- section padding
- wrapper nesting
- gap scales
- repeated ad hoc spacing styles

### 2. Clean up page-level semantics and labeling
Verify that section labels, `aria` labels, wrapper semantics, and in-file comments remain clean and coherent after the composition redesign.

### 3. Tighten full-page visual consistency
Look for any remaining places where:
- one section intro feels much weaker than the others
- one zone uses a noticeably different rhythm without justification
- wrappers create accidental visual clutter
- composition posture still feels mixed or unfinished

Correct those now.

### 4. Keep the composition layer maintainable
If the composition pass introduced needless duplication or awkward local abstractions, simplify them now while preserving the improved visual result.

---

## Design Intent

The final outcome should feel:

- cohesive
- premium
- polished
- maintainable
- intentionally paced
- clean at full-page scale

---

## Hard Constraints

- do not backslide into generic semantic wrappers
- do not introduce ornamental excess
- do not regress lane boundaries or architecture truth
- do not leave spacing logic fragmented across too many one-off style objects
- do not break lint/build/type-check viability

---

## Deliverables for This Prompt

By the end of this prompt, the homepage composition layer should feel finished enough that validation/closeout can proceed cleanly.

---

## Acceptance Criteria

- spacing and wrapper logic are cleaner and more consistent
- page-level semantics and labels are coherent
- the homepage composition feels polished at full-page scale
- maintainability is at least as strong as before

---

## Completion Note

At the end, produce a concise completion note that states:

- which files were cleaned up or normalized
- what consistency issues were corrected
- whether any composition debt remains for later phases
