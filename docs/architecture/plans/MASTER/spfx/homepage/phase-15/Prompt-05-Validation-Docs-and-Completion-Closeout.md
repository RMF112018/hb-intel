# Prompt 05 — Validation, Docs, and Completion Closeout

## Objective

Perform the full Phase E validation and closeout pass.

This prompt must verify that the homepage composition pass is complete, coherent, documented, and safe for the current HB Central homepage/SPFx lane.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Required Starting Context

Use the repo truth as modified by Prompts 01–04.

Inspect all relevant changed files and any additional packaging-sensitive/config/testing files needed for proper closeout.

At minimum, review:

- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/homepage/tokens.ts`
- `apps/hb-webparts/src/homepage/shared/*`
- any composition-safe shared/homepage-safe primitives touched for this phase
- `packages/ui-kit/src/homepage.ts`
- any docs or story files touched
- `apps/hb-webparts/README.md`
- any tests touched or required by the implementation

---

## Required Validation Tasks

### 1. Run the required checks
Run the appropriate repo commands for the touched scope, including the relevant combinations of:

- type-check
- lint
- tests
- build

Also run any additional checks required to gain confidence that the homepage lane and shared ui-kit lane remain healthy.

### 2. Inspect for doctrine compliance
Verify that the final implementation remains compliant with:

- homepage import discipline
- token discipline
- accessibility expectations
- reduced-motion support
- lane boundaries
- authoring-safe defaults
- reference-vs-production truthfulness

### 3. Inspect for shared/local boundary correctness
Verify that the final code does **not** over-promote narrow composition choreography into shared ui-kit space.

If anything crossed that line, correct it now.

### 4. Update docs to final repo truth
Update any remaining docs required so the final implementation truth is reflected accurately.

Do not leave the repo in a state where the composition posture changed materially but the docs still describe the old generic page rhythm.

### 5. Write the final completion note
Produce a polished Phase E completion note that includes:

- summary of what changed
- shared vs local ownership outcomes
- validation commands run and results
- risks/issues encountered
- what remains for later phases
- recommendation on whether Phase E is complete and what should happen next

Create the completion note in an appropriate docs/plans/reviews location consistent with repo conventions.

---

## Hard Constraints

- do not leave failing checks unresolved without explicitly documenting them
- do not claim completion if build/package-sensitive risk remains unexamined
- do not write vague completion notes
- do not create speculative docs drift

---

## Acceptance Criteria

- required checks have been run
- final repo state is coherent and documented
- shared/local composition ownership is clean
- homepage lane doctrine compliance has been verified
- a high-quality Phase E completion note exists in the repo

---

## Completion Note

Your final response for this prompt should include:

- exact commands run
- result of each command
- exact files materially changed in this prompt
- path to the final Phase E completion note
- any remaining known risks or follow-ons
