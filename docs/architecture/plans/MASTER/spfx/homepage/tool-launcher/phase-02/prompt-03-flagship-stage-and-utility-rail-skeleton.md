# Prompt 03 — Flagship Stage and Utility Rail Skeleton

## Objective

Implement the **desktop skeleton** for the flagship platforms stage and the secondary utility rail so the launcher establishes the intended 8 / 4-style hierarchy without yet requiring every final card treatment.

## Required stance

- repo truth first
- do not re-read files still in current context unless needed
- preserve the normalized Phase 01 launcher seam
- structure first, polish later
- do not collapse flagship and utility content into one equal-weight grid

## Existing implementation context

Review at minimum:

- the launcher anatomy / shell work from Prompts 01 and 02
- the current Tool Launcher component
- the tool launcher asset manifest
- any Phase 01 adapter outputs that identify featured, support, notice, and action metadata

## Flagship stage requirements

Implement a structural stage that can render **featured platforms** at primary visual weight.

At this phase, prove:

- featured ordering is supported
- real logo/brand asset slots exist
- primary descriptor and launch CTA placement exist
- a fallback path exists when branded assets are missing

Do **not** reduce the flagship stage to icon-only generic tiles.

## Utility rail requirements

Implement a quieter adjacent rail that can structurally support:

- need help
- request access
- notices / status content
- optional favorites / recent placeholders if clearly segregated and not overbuilt

The utility rail should be visibly secondary to the flagship stage.

## Required output

Produce a markdown file named:

- `phase-02-flagship-and-rail-notes.md`

The file must include:

### 1. Flagship stage skeleton
What was built and how it is structured.

### 2. Utility rail skeleton
What was built and how it is structured.

### 3. Data dependencies
Which normalized launcher slices feed each region.

### 4. Fallback behavior
How missing logos or missing support metadata are handled in skeleton form.

### 5. Deferred visual deepening
What Phase 03 / Phase 04 should deepen later.

## Additional instruction

If necessary, create local homepage launcher-specific composition components instead of prematurely pushing unfinished business-specific structures into `@hbc/ui-kit`.
