# Prompt 08 — Run Wave 02 regression and produce closure evidence

    ## Objective
    Perform the bounded Wave 02 closure pass that proves the rebuilt seams actually close the wave instead of merely landing scattered improvements.

    ## Why this issue matters
    A structural-rebuild wave is not closed by implementation alone. It closes when the rebuilt seams are validated together and their interaction model is proven coherent.

    ## Current repo-truth problem state
    Wave 02 spans multiple interacting seams: media acquisition, save/recovery, editor, preview, readiness, and host hardening. Without a dedicated regression/evidence step, the wave can appear “done” while still containing cross-seam breakage or unclear trust signals.

    ## Intended future state
    Wave 02 ends with a concrete closure record that proves:
    - the rebuilt seams work together
    - author trust is stronger than before the wave
    - no meaningful regression remains in the touched paths

    ## Governing authority / required reference docs
    - this wave package’s `Plan-Summary.md`
    - `Dependency-Map.md`
    - `Validation-Strategy.md`
    - every per-prompt closure note produced in Prompts 01–07

    ## Exact repo files and seams to inspect
    - all files touched by Prompts 01–07
    - any associated tests, fixtures, or validation helpers added in the wave

    ## Required implementation outcome
    - Run a bounded regression across the Wave 02 state matrix.
    - Verify media, recovery, save truth, navigation guard, editor, preview, readiness, and hardening outcomes together.
    - Produce a final wave closure report and validation checklist.
    - Record any residual limitation only if it is genuinely outside Wave 02 scope and not required for closure.

    ## Validation / proof-of-closure requirements
    - A final `Wave-02-Closure-Report.md` exists and names every touched seam, what changed, and what was verified.
    - A final `Wave-02-Validation-Checklist.md` exists and records the exercised state matrix.
    - The final report explicitly states whether the wave is closed and why.
    - No “future pass” language is used for work that belongs inside Wave 02.

    ## Deliverables / closure notes to create
    - `docs/architecture/reviews/publisher/Wave-02-Closure-Report.md`
    - `docs/architecture/reviews/publisher/Wave-02-Validation-Checklist.md`


## Explicit instruction not to make unrelated changes
- Do **not** make unrelated code changes.
- Do **not** reopen unrelated Wave 01 shell/layout decisions unless a direct dependency makes it necessary for Wave 02 closure.
- Do **not** perform broad cleanup outside the touched seams.

## Mandatory execution rules
- Conduct an exhaustive scrub of the affected code path before changing anything.
- Verify whether referenced files, symbols, or contracts have drifted before editing.
- Do **not** re-read files already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
- Preserve already-verified closures unless this prompt explicitly requires refinement.
- Prove closure before moving to the next prompt.
