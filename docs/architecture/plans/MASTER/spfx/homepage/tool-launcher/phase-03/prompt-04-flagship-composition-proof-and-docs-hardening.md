# Prompt 04 — Flagship Composition Proof and Docs Hardening

## Objective

Prove that the **flagship platform stage** reads correctly inside the homepage Utility zone and harden the local launcher documentation so later phases build on a stable, explicit featured-stage implementation.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- validate against homepage composition reality, not isolated component fantasy
- document remaining debt instead of hiding it
- do not broaden this prompt into Phase 04 or Phase 05 scope

## Existing implementation context

Review at minimum:

- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- the current `ToolLauncherWorkHub` implementation
- the Phase 02 launcher shell files
- the Phase 03 featured-stage files produced in Prompts 01–03
- any launcher notes or README files already created during earlier phases

## What you must do

1. update the reference composition or equivalent local proof path so the flagship stage can be visually and structurally verified inside the Utility zone
2. confirm that the flagship stage is clearly primary relative to the utility rail and shelves while still subordinate to the Signature Hero
3. confirm that empty / partial / degraded states do not break the composition
4. update local launcher documentation so later phases understand the featured-stage contract and current limits
5. explicitly document what remains for:
   - utility rail support actions
   - workflow shelf refinement
   - all-platform overlay
   - advanced search / personalization

## Required output

Produce a markdown file named:

- `phase-03-implementation-notes.md`

The file must include:

### 1. Composition proof summary
What was proven in the Utility zone composition.

### 2. Remaining debt
What is intentionally deferred to later phases.

### 3. Risks observed
Any issues that could affect Phase 04+.

### 4. Recommended next phase entry conditions
What should be true before beginning Phase 04.

## Coding expectation

As part of this prompt, update the reference composition and local launcher documentation so the flagship-stage implementation is legible, testable, and ready for the next package.
