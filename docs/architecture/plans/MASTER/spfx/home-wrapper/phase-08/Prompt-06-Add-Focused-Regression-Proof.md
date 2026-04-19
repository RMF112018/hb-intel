# Prompt 06 — Add Focused Regression Proof for Host-Fit, Breakpoint Truth, and No-Overflow Closure

## Objective
Add the narrowest meaningful proof set that would fail if the corrected `hbHomepage` shell regressed back into the current defect class.

## Why this work exists
The current proof surface is too narrow. It proves wrapper order and boundary integrity, but it does not prove host-fit closure.

That is not enough.

The next proof layer must directly target the failure mode the user is seeing.

## Governing authority
Use:
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageEntryStack.test.tsx`
- any shell-focused test seam already in repo truth
- any harness or viewport-based validation seam already available
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Required proof topics
Add focused proof for all of the following:
1. shared outer fit contract is in force
2. corrected measurement model drives entry-state selection
3. corrected width truth drives band-layout behavior
4. no ordinary right-edge overflow remains at standard laptop baseline
5. tablet portrait / narrow states degrade cleanly
6. short-height path remains coherent if testable in current harness

## Test posture
Be disciplined.

Prefer:
- direct width/accounting tests
- data-attribute assertions tied to new diagnostics
- targeted integration tests over broad snapshots
- hosted viewport/device checks where already feasible

Avoid:
- large snapshot churn
- child-surface behavioral churn unrelated to shell fit
- vague visual-only assertions with no width-truth backing

## Done means
Done means the new tests would fail if:
- outer authority becomes ambiguous again
- measurement falls back to the wrong width truth
- threshold behavior drifts
- a screenshot-class overflow returns

## Prohibitions
- Do not inflate the suite with low-value assertions.
- Do not drift into unrelated child-surface proof.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Your report must list:
1. tests added or updated
2. exact behavior each test protects
3. breakpoint/viewport cases covered
4. any gaps honestly left unautomated and why
