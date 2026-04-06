# Prompt 01 — Project Spotlight Repo-Truth Baseline and Ownership Map

## Objective

Audit live repo truth and produce the exact implementation baseline for the Project Spotlight webpart before making broader structural changes.

This prompt is the gating phase for all later work.

Do not jump into broad implementation before this prompt is complete.

## Primary Repo

- `https://github.com/RMF112018/hb-intel`

Treat repo truth as authoritative.

## Mandatory Inputs

Read only the smallest authoritative set needed, but include at minimum:

- `CLAUDE.md`
- `docs/architecture/blueprint/current-state-map.md`
- `apps/hb-webparts/**`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/**`
- `apps/hb-webparts/src/webparts/hbHeroBanner/**`
- `apps/hb-webparts/src/homepage/shared/**`
- `apps/hb-webparts/src/homepage/helpers/**`
- `apps/hb-webparts/src/homepage/models/**`
- `packages/ui-kit/**`
- `docs/reference/ui-kit/**`
- `docs/reference/ui-kit/doctrine/**`

Do **not** re-read files already in your active context unless the file changed, the context is stale, or the scope expanded.

## Required Outcome

Produce a repo-truth grounded implementation baseline that answers:

1. What currently exists for Project Spotlight?
2. What already exists that can be reused safely?
3. What current patterns would hold the premium direction back?
4. What belongs in:
   - `@hbc/ui-kit`
   - `@hbc/ui-kit/homepage`
   - `apps/hb-webparts/src/homepage/shared`
   - `apps/hb-webparts/src/webparts/projectPortfolioSpotlight`
5. What exact file-level implementation path should be used for this work?
6. What must remain local at this stage?

## Hard Constraints

- This is **not** a generic homepage audit.
- This is **not** a broad refactor prompt.
- Do **not** let dashboard-card patterns define the solution.
- Do **not** promote Spotlight-specific orchestration into shared kit.
- Do **not** broaden scope into unrelated homepage webparts except where comparison to the Signature Hero is necessary.

## Specific Work Required

### 1. Inspect and map current structure
Identify:
- current Project Spotlight files
- hero files relevant to alignment
- homepage shared primitives relevant to reuse
- helper/model files relevant to ranking, normalization, and view-model shaping
- any relevant UI kit primitives already suitable for this work

### 2. Build the ownership map
Create a written ownership decision matrix covering:
- keep local
- keep homepage-local shared
- promote later
- already safe to reuse now

### 3. Define the target anatomy
Define the exact target anatomy of:
- featured spotlight
- supporting rail
- metadata layer
- CTA layer
- Project Team strip
- Project Team detail layer

### 4. Define the implementation sequence
Map the implementation sequence across the next prompts so the work proceeds in the right order.

## Required Deliverables

Provide all of the following in your response:

### A. Repo-Truth Starting Point
- what exists
- what is reusable
- what is insufficient
- what must be avoided

### B. Ownership Matrix
A precise file/package-level map for:
- `@hbc/ui-kit`
- `@hbc/ui-kit/homepage`
- `src/homepage/shared`
- `src/webparts/projectPortfolioSpotlight`

### C. Component Anatomy Freeze
A concise but exact anatomy definition for the final Project Spotlight structure.

### D. Implementation Readiness Decision
State whether the repo is ready to proceed to Prompt 02 and why.

## Validation Requirements

Before closing this prompt:

- verify that the current Project Spotlight path is correctly identified
- verify that the hero comparison path is correctly identified
- verify that no proposed shared-kit promotions are actually Spotlight-specific
- verify that the recommended implementation path preserves homepage product boundaries

Use the smallest meaningful validation set.

## Standards / Best Practices

- repo truth over historical assumption
- premium editorial hierarchy over metadata density
- local-first ownership unless reuse is proven
- strong boundary discipline
- no speculative abstraction

## Final Instruction

Do not implement the full feature in this prompt.

This prompt is complete only when the repo-truth baseline, anatomy freeze, and ownership map are strong enough to guide the next prompt without ambiguity.
