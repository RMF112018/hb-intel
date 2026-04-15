# Prompt 07 — Close accessibility, host-fit, and hardening gaps

    ## Objective
    Complete a bounded but exacting structural hardening pass across the Wave 02 seams, focusing on accessibility, instance-safety, token discipline, and SPFx host-fit correctness.

    ## Why this issue matters
    Structural rebuild work is not closed while low-level correctness issues remain in the rebuilt seams. These are not cosmetic follow-ups; they are closure blockers because they affect reliability, accessibility confidence, and host safety.

    ## Current repo-truth problem state
    The live repo still shows at least two concrete issues in the touched seam set:
    - `ProjectPicker.tsx` uses a constant listbox ID pattern that is not instance-safe
    - `apps/hb-publisher/src/mount.tsx` still renders an unknown-webpart fallback with raw inline style values instead of a token-disciplined host-safe surface

    There may be additional keyboard/focus/aria drift in touched Wave 02 surfaces that needs a final bounded sweep.

    ## Intended future state
    Every touched Wave 02 surface should be stronger on:
    - accessibility semantics
    - focus management
    - keyboard interaction
    - instance-safe IDs and aria relationships
    - token discipline and host-safe fallback behavior

    ## Governing authority / required reference docs
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` where relevant
    - this wave package’s `Validation-Strategy.md`

    ## Exact repo files and seams to inspect
    - `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/*`
    - all Wave 02 touched media/editor/preview files for final semantics/focus sweep
    - `apps/hb-publisher/src/mount.tsx`

    ## Required implementation outcome
    - Replace constant DOM IDs with instance-safe IDs where needed.
    - Remove remaining token-bypass / inline-style fallback behavior in touched Publisher seams.
    - Confirm strong aria relationships, keyboard support, and focus behavior across rebuilt controls.
    - Keep the pass tightly bounded to real Wave 02 closure work.

    ## Validation / proof-of-closure requirements
    - No duplicate-ID risk remains in the touched controls.
    - Touched fallback surfaces are token-disciplined and host-safe.
    - Keyboard/focus behavior is strong across rebuilt flows.
    - Error-state semantics are explicit and accessible.

    ## Deliverables / closure notes to create
    - `docs/architecture/reviews/publisher/wave-02-hardening-closure.md`


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
