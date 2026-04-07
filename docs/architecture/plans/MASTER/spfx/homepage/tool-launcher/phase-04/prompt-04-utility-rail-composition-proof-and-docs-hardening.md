# Prompt 04 — Utility Rail Composition Proof and Docs Hardening

## Objective

Prove that the **utility rail** reads correctly inside the homepage Utility zone and harden the local launcher documentation so later phases build on a stable, explicit support-action implementation.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- validate against homepage composition reality, not isolated component fantasy
- document remaining debt instead of hiding it
- do not broaden this prompt into Phase 05 or Phase 06 scope

## Existing implementation context

Review at minimum:

- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- the current `ToolLauncherWorkHub` implementation
- the Phase 02 launcher shell files
- the Phase 03 flagship-stage files
- the Phase 04 utility-rail files produced in Prompts 01–03
- any launcher notes or README files already created during earlier phases

## What you must do

1. update the reference composition or equivalent local proof path so the utility rail can be visually and structurally verified beside the flagship stage inside the Utility zone
2. confirm that the utility rail is clearly secondary to the flagship stage while still useful and legible
3. confirm that empty / partial / degraded rail states do not break the composition
4. update local launcher documentation so later phases understand the utility-rail contract and current limits
5. explicitly document what remains for:
   - workflow shelf refinement
   - all-platform overlay / index
   - advanced search / personalization
   - deeper support-governance and authoring tooling

## Required output

Produce a markdown file named:

- `phase-04-implementation-notes.md`

The file must include:

### 1. Composition proof summary
What was proven in the Utility zone composition.

### 2. Remaining debt
What is intentionally deferred to later phases.

### 3. Risks observed
Any issues that could affect Phase 05+.

### 4. Recommended next phase entry conditions
What should be true before beginning Phase 05.

## Coding expectation

As part of this prompt, update the reference composition and local launcher documentation so the utility-rail implementation is legible, testable, and ready for the next package.
