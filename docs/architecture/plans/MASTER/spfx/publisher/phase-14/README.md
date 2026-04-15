# Publisher UI Remediation — Wave 01 Structural Redesign Closure Package

This package replaces the weaker baseline Wave 01 package with an execution-grade package that **forces structural redesign**, not modest refinement.

## Governing posture

- Treat the live `main` branch as implementation truth.
- Treat the uploaded Wave 01 package as a stale input artifact under audit, not as the final shape of the work.
- Use the SPFx governing doctrine as binding UI authority.
- Use current repo truth to decide what must be preserved, what must be replaced, and what must be structurally recomposed.
- Do **not** close these prompts with thin styling edits, copy-only cleanup, or modest rearrangement.

## What changed in this package

Compared with the uploaded Wave 01 zip, this package:

- rewrites every prompt to require **structural UI/UX redesign** where the current composition still traps the product in an admin-workbench posture
- adds a dedicated prompt for **media acquisition / hero / gallery authoring redesign**, because the live repo still exposes URL-first asset authoring in critical flows
- separates visual-system/tokenization work from iconography/label/accessibility work so neither closure unit gets diluted
- preserves truthful workflow, validation, persistence, and orchestration logic unless a prompt explicitly authorizes a bounded seam change
- removes any implied permission for “minor enhancement” closure

## Required execution order

Run the prompts in numeric order.

1. `Prompt-01-Structural-redesign-editorial-shell-and-information-architecture.md`
2. `Prompt-02-Structural-redesign-default-authoring-flow-and-section-hierarchy.md`
3. `Prompt-03-Structural-redesign-project-selection-and-bound-identity-surface.md`
4. `Prompt-04-Structural-redesign-media-acquisition-and-hero-gallery-authoring.md`
5. `Prompt-05-Structural-redesign-preview-readiness-and-publish-command-surface.md`
6. `Prompt-06-Structural-redesign-legacy-operator-separation-and-advanced-disclosure.md`
7. `Prompt-07-Structural-redesign-visual-system-tokenization-and-surface-language.md`
8. `Prompt-08-Structural-redesign-label-governance-iconography-and-selector-accessibility.md`

## Non-negotiable rule

Do **not** interpret “redesign” as:

- small spacing cleanup
- light card restyling
- button polish
- hiding one or two notices
- copy edits without compositional change
- cosmetic disclosure wrappers placed over the same weak structure

If the current surface still reads as a cautious operator console after the prompt is complete, the prompt is **not closed**.

## Mandatory working method for every prompt

1. Exhaustively scrub the affected seam before editing.
2. Verify that all referenced files, exports, symbols, CSS classes, and tests still match live repo truth.
3. Do **not** re-read files that are already in active context unless needed to verify drift, dependencies, or uncertainty after changes.
4. Identify what must be preserved.
5. Identify what must be structurally replaced, recomposed, or demoted.
6. Prove closure with running-surface validation and any required tests before moving on.
7. Do **not** make unrelated code changes.
