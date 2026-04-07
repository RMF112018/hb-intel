# Prompt 04 — Overlay Composition Proof and Docs Hardening

## Objective

Complete the **all-platforms overlay / index layer** by proving that it fits the launcher composition cleanly and documenting the resulting structure, behavior, and known limits.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- preserve the normalized launcher seam and all hierarchy decisions from earlier phases
- do not broaden into responsive hardening or later personalization work in this prompt
- document remaining debt honestly rather than hiding it

## Existing implementation context

Review at minimum:

- the Phase 01 launcher seam files
- the Phase 02 launcher shell / anatomy files
- the Phase 03 flagship-stage files
- the Phase 04 utility-rail files
- the Phase 05 workflow-shelf files
- the Phase 06 overlay/index files from Prompts 01–03
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- any README or local docs in `apps/hb-webparts` affected by the new overlay layer

## What you must implement

1. update the reference composition or equivalent local proof so the all-platforms entry point and overlay behavior are represented clearly
2. validate that the overlay adds breadth without cluttering the homepage surface
3. document the final overlay / index structure, state model, and guardrails
4. document deferred items that belong to later phases such as responsive hardening or deeper personalization
5. ensure empty / loading / partial-data behavior remains coherent after the overlay work

## Required output

Produce a markdown file named:

- `phase-06-overlay-composition-proof.md`

The file must include:

### 1. Composition proof summary
How the all-platforms layer fits into the launcher hierarchy.

### 2. Entry-point behavior
How the user reaches the full inventory and returns to the main launcher.

### 3. Known limitations
Anything intentionally deferred to Phase 07 or later.

### 4. Documentation updates
Which docs were updated and why.

## Coding expectation

Complete any remaining local documentation and composition proof updates required to close Phase 06 without broadening scope beyond the all-platforms overlay / index layer.
