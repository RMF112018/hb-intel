# Prompt 01 — Phase E Baseline and Composition Architecture

## Objective

Implement the **Phase E baseline architecture and scoping pass** for the homepage composition work.

This prompt is not a detached planning exercise. It must produce real repo changes that lock the implementation approach for the composition pass and identify any additional shared-vs-local adjustments required before deeper composition refinements begin.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Repo-Truth Files to Use First

Start with the current live repo truth in at least these files if they are not already in active memory:

- `apps/hb-webparts/README.md`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/homepage/tokens.ts`
- `apps/hb-webparts/src/homepage/shared/index.ts`
- `apps/hb-webparts/src/homepage/shared/HomepageSectionShell.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageTopBandPair.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageRailShell.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageCuratedContentCluster.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageOperationalAwarenessCluster.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageDiscoveryCluster.tsx`
- any additional shared homepage wrappers introduced in earlier phases
- `packages/ui-kit/src/homepage.ts`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Also inspect any adjacent files needed to implement this prompt correctly.

---

## What You Must Decide and Implement

Establish the final **Phase E composition implementation model** and scaffold any remaining shared/local seams accordingly.

You must determine, based on actual repo truth, which of the following should be reused as-is, extended in shared code, or remain local to the homepage package:

- section shell treatment
- section intro / subtitle treatment
- zone wrapper logic
- inter-zone spacing rhythm
- background / tint posture
- top-band composition posture
- composition-only helper patterns used by `ReferenceHomepageComposition`

Then implement the file structure and export scaffolding necessary for the remaining prompts.

---

## Required Tasks

### 1. Confirm the composition ownership split
Create or update a concise implementation note that states:

- what composition-layer patterns already exist and should be reused
- what new or extended shared homepage-safe composition primitives are justified
- what should stay local in `apps/hb-webparts/src/homepage/shared/`
- why that split is correct under current doctrine and repo truth

### 2. Clarify the reference-vs-production boundary
Make the repo truth explicit about what `ReferenceHomepageComposition` is and is not.

If README comments, component comments, or nearby docs need tightening so future contributors do not confuse the governed composition reference with the production rendering path, fix that now.

### 3. Prepare the shared/local file structure
Add or adjust the file structure under `packages/ui-kit/src/` and/or `apps/hb-webparts/src/homepage/shared/` so the next prompts can implement the composition pass cleanly.

### 4. Update homepage entry-point exports if needed
If new composition-safe shared primitives are warranted, expose them through `packages/ui-kit/src/homepage.ts` without breaking existing exports or import discipline.

### 5. Update doctrine-adjacent docs only if implementation truth changed
Update the most appropriate docs so the repo truth reflects the actual composition ownership split and preview-vs-production boundary.

Do not over-document.

---

## Hard Constraints

- Do not fully redesign the homepage composition in this prompt.
- Do not create a fake global “homepage shell app” architecture.
- Do not introduce root `@hbc/ui-kit` imports into homepage webparts.
- Do not create shell chrome or lane-boundary violations.
- Do not break existing build/test/package behavior.
- Do not promote one-off composition choreography into shared code without a clear repeated-use case.

---

## Deliverables for This Prompt

By the end of this prompt, the repo should contain:

- a clear Phase E composition implementation note or equivalent repo-truth artifact
- any required shared/local scaffolding changes
- any required export or doc adjustments
- no speculative redesign drift

---

## Acceptance Criteria

- the composition ownership split is explicit
- the reference-vs-production boundary is clearer in repo truth
- required shared/local scaffolding exists
- later Phase E prompts can proceed without architecture ambiguity

---

## Completion Note

At the end, produce a concise completion note that states:

- which files were changed
- what composition ownership decisions were made
- what was promoted vs kept local
- any known constraints or follow-ons
