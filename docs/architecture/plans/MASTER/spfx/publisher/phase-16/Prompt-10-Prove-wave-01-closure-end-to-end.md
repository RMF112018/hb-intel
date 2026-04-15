# Prompt 10 — Prove Wave 01 closure end to end

## Objective

After Prompts 01 through 09 are complete, run a final Wave 01 proof pass that demonstrates the package actually closed the intended adoption, trust, and current-scope truth issues without introducing regression.

## Why this issue matters

The prior Wave 01 package relied too heavily on per-prompt closure notes.
This enhanced package requires a final integrated proof pass because several Wave 01 items now cross-reference each other directly:
- project-binding truth
- first-pass compose structure
- preview truth
- readiness next-action language
- queue momentum cues
- current-scope product truth

A final integrated pass is required to prove those seams agree with each other.

## Governing authority / required references

- live local repo mirroring `main` in `RMF112018/hb-intel`
- all prompts in this enhanced Wave 01 package
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- the attached Wave 01 audit package as the closure baseline

## Exact repo files / symbols / seams to inspect first

Inspect the changed seams from Prompts 01–09.
Do not blindly re-read the entire app.
Focus on the modified files and their directly coupled dependencies.

At minimum, scrub the final changed paths under:
- `apps/hb-publisher/src/webparts/articlePublisher/`
- `apps/hb-publisher/src/data/publisherAdapter/` where Wave 01 changes landed
- any directly coupled tests or validation harnesses updated during Prompts 01–09

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty after new findings.

## Required implementation outcome

Produce a real end-to-end Wave 01 proof pass.

At minimum:

1. verify build/test/regression health for the changed seams
2. verify no remaining contradiction between:
   - project-picker copy and project-search behavior
   - first-pass compose structure and readiness jump targets
   - preview narration and actual preview source of truth
   - readiness next-action language and queue cues
   - current product naming and current supported destination scope
3. verify no already-closed workflow quality is accidentally regressed
4. fix any true Wave 01 defects discovered during this proof pass
   - do **not** defer a genuine Wave 01 closure defect discovered here

## Minimum regression walkthrough to prove

Demonstrate a sane end-to-end path covering at least:

1. create a new draft
2. bind it to a project using the authoritative picker
3. complete the first-pass compose path
4. verify preview/readiness truth while the draft is dirty and after save
5. verify publish-next-action clarity
6. add/edit teammate content
7. add/edit media content
8. verify queue cues for readiness / next action / stuck state
9. verify current-scope product truth in the live author-facing surface

## Validation / proof-of-closure requirements

Prove all of the following:

- Wave 01 changed seams build cleanly under the repo’s normal validation path
- targeted tests and/or manual validation prove the changed flows still work
- no remaining contradiction is left between the major Wave 01 surfaces
- any defect discovered during the proof pass that truly belongs to Wave 01 is fixed now

## Deliverables / closure artifacts

Produce a final closure artifact that includes:

1. changed files list by prompt
2. validation/test/build evidence
3. regression walkthrough notes
4. final list of Wave 01 issues proven closed
5. explicit call-out of any item that was found already closed before code changes and therefore remained verification-only

## Explicit non-goals

- do not widen scope into Wave 02 premium-surface work
- do not introduce unrelated cleanup while running this proof pass
- do not leave genuine Wave 01 contradictions open after discovering them here
