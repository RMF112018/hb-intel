# Prompt 01 — Phase A Baseline and Shared-Surface Architecture

## Objective

Implement the **Phase A baseline architecture decision and scaffolding pass** for the homepage shared-system uplift.

This prompt is not a detached planning exercise. It must produce real repo changes that establish the clean shared/local ownership split and the shared-surface implementation path for the rest of Phase A.

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
- `apps/hb-webparts/src/homepage/shared/HomepageRailShell.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageCuratedContentCluster.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageOperationalAwarenessCluster.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageDiscoveryCluster.tsx`
- `packages/ui-kit/src/homepage.ts`
- `packages/ui-kit/src/HbcCard/index.tsx`
- `packages/ui-kit/src/theme/typography.ts`
- `packages/ui-kit/DESIGN_SYSTEM.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Also inspect any adjacent files needed to implement this prompt correctly.

---

## What You Must Decide and Implement

Establish the final **Phase A shared/local ownership model** and scaffold the codebase accordingly.

You must determine, based on actual repo truth, which of the following belong in `@hbc/ui-kit/homepage` versus local homepage shared code:

- homepage card/surface variants
- CTA primitives
- metadata row / signal row primitives
- icon wrapper or mapped icon primitives
- section shell / section intro primitives
- utility/destination/action row primitives

Then implement the file structure and export scaffolding necessary for the remaining prompts.

---

## Required Tasks

### 1. Confirm the ownership split
Create or update a concise internal implementation note that states:

- what is being promoted to `@hbc/ui-kit/homepage`
- what is explicitly staying local in `apps/hb-webparts/src/homepage/shared/`
- why that split is correct under current doctrine and repo truth

Do not make this speculative. Anchor it to the actual current homepage package and doctrine overlay.

### 2. Create the shared homepage primitive file structure
Add the necessary file structure under `packages/ui-kit/src/` for the new homepage-safe primitives.

Use existing ui-kit conventions. Keep names clean and production-grade.

### 3. Prepare the homepage entry-point exports
Update `packages/ui-kit/src/homepage.ts` so the entry-point can expose the new homepage-safe primitive surface cleanly.

Do not break existing exports.
Do not introduce broad package drift.

### 4. Introduce any missing shared token/utility seam needed for Phase A
If the new shared primitives require small supporting theme or utility additions, add them in the correct package location.

Do not dump homepage-specific styling logic into unrelated generic theme files unless it truly belongs there.

### 5. Add or update docs that lock the Phase A ownership model
Update the most appropriate docs so the repo truth clearly reflects the new shared/local split.

This should likely include the relevant homepage entry-point and/or homepage doctrine references if the implementation truth changed.

Do not over-document.
Keep it exact.

---

## Hard Constraints

- Do not redesign individual webparts yet.
- Do not change authoring contracts unless absolutely necessary for the new shared primitive seam.
- Do not create shell chrome or lane-boundary violations.
- Do not import root `@hbc/ui-kit` into homepage webparts.
- Do not break existing build/test/package behavior.
- Do not promote one-off editorial choreography into ui-kit.

---

## Deliverables for This Prompt

By the end of this prompt, the repo should contain:

- a clear Phase A shared/local ownership decision reflected in code/docs
- scaffolded shared homepage primitive files in `packages/ui-kit`
- updated `@hbc/ui-kit/homepage` export surface prepared for the new shared language
- any minimal required support tokens/utilities
- no consumer migration yet beyond what is required for scaffolding sanity

---

## Acceptance Criteria

- the ownership split is explicit and justifiable
- the new shared primitive structure exists
- `packages/ui-kit/src/homepage.ts` is updated cleanly
- docs are aligned with the new implementation direction
- lint/type-check/build remain viable after the scaffolding changes

---

## Completion Note

At the end, produce a concise completion note that states:

- exact files created/updated
- the final shared/local ownership split
- any implementation assumptions carried into Prompt 02

