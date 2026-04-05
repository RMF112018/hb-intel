# Prompt 01 — Phase C Baseline and Utility / Discovery Architecture

## Objective

Implement the **Phase C baseline architecture and scoping pass** for the homepage utility/discovery premiumization work.

This prompt is not a detached planning exercise. It must produce real repo changes that lock the implementation approach for the three Phase C target surfaces and identify any additional shared-vs-local adjustments required before surface redesign begins.

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
- `apps/hb-webparts/src/homepage/shared/HomepageRailShell.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageUtilityDenseGroup.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageDiscoveryCluster.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- `apps/hb-webparts/src/webparts/smartSearchWayfinding/SmartSearchWayfinding.tsx`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/homepage/helpers/discoveryConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `apps/hb-webparts/src/homepage/webparts/discoveryContracts.ts`
- `packages/ui-kit/src/homepage.ts`
- any shared homepage primitives already added by the earlier premiumization work
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Also inspect any adjacent files needed to implement this prompt correctly.

---

## What You Must Decide and Implement

Establish the final **Phase C utility/discovery implementation model** and scaffold any remaining shared/local seams accordingly.

You must determine, based on actual repo truth, which of the following should be reused as-is, extended in shared code, or remain local to the homepage package:

- action rows
- action group headers
- launcher tiles / destination rows
- icon treatment for utility/discovery surfaces
- search-field wrapper treatment
- quick-path presentation
- promoted destination presentation
- category-group presentation

Then implement the file structure and export scaffolding necessary for the remaining prompts.

---

## Required Tasks

### 1. Confirm the utility/discovery ownership split
Create or update a concise implementation note that states:

- what utility/discovery patterns already exist and should be reused
- what new or extended shared homepage primitives are justified
- what will stay local in `apps/hb-webparts/src/homepage/shared/`
- why that split is correct under current doctrine and repo truth

### 2. Audit and remove obvious placeholder-grade dependencies
If there are still clearly placeholder-grade behaviors that block premiumization at the architecture level, identify and replace them now at the correct seam.

Examples may include:
- pseudo-icon token patterns
- weak destination/action wrappers
- duplicated local row/tile scaffolding

Do not redesign the full surfaces yet; just remove structural blockers.

### 3. Prepare the shared/local file structure
Add or adjust the file structure under `packages/ui-kit/src/` and/or `apps/hb-webparts/src/homepage/shared/` so the next prompts can implement the three target surface redesigns cleanly.

### 4. Update homepage entry-point exports if needed
If new utility/discovery-safe shared primitives are warranted, expose them through `packages/ui-kit/src/homepage.ts` without breaking existing exports or import discipline.

### 5. Update any doctrine-adjacent docs only if implementation truth changed
Update the most appropriate docs so the repo truth reflects the actual ownership split and export surface.

Do not over-document.

---

## Hard Constraints

- Do not redesign the three target surfaces fully in this prompt.
- Do not change authoring contracts unless absolutely necessary.
- Do not introduce root `@hbc/ui-kit` imports into homepage webparts.
- Do not create shell chrome or lane-boundary violations.
- Do not break existing build/test/package behavior.
- Do not promote one-off choreography into shared code without a clear repeated-use case.

---

## Deliverables for This Prompt

By the end of this prompt, the repo should contain:

- a clear Phase C shared/local ownership decision reflected in code/docs
- scaffolded shared/local structure for the utility/discovery redesign work
- any minimal shared export changes needed for the next prompts
- no broad consumer redesign yet beyond what is needed to remove structural blockers

---

## Acceptance Criteria

- the ownership split is explicit and justifiable
- structural blockers to utility/discovery premiumization are removed or isolated
- the shared/local file structure is prepared cleanly
- `packages/ui-kit/src/homepage.ts` is updated only if justified
- docs are aligned with the new implementation direction
- lint/type-check/build remain viable after the scaffolding changes

---

## Completion Note

At the end, produce a concise completion note that states:

- exact files created/updated
- the final shared/local ownership split for utility/discovery patterns
- any implementation assumptions carried into Prompts 02–04
