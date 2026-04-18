# Validation and Closure Standards

## Closure rule

This work is **not** complete because:

- it compiles
- it renders locally
- it looks somewhat better
- the flagship path still behaves like a refined categorized list

This work is complete only when the homepage rail is clearly a signature-grade command/launcher surface **and** the hosted SPFx result proves it.

---

## Category 1 — Architecture invariants

Verify all of the following remain true:

- the homepage wrapper still renders the rail before the shell
- the rail remains wrapper-owned and pre-shell
- the shell does not absorb rail semantics
- `homepage-flagship` remains explicit and traceable
- wrapper config extraction remains the integration seam
- list-source vs manifest-fallback resilience still works

Failure on any of these is a closure failure.

---

## Category 2 — Flagship surface quality

Verify all of the following:

- the homepage flagship path is structurally distinct from the default path
- the surface reads as a command/launcher band, not a grouped list
- primary actions are obvious
- section grouping improves scan speed
- action recognition cues are stronger and more useful than before
- overflow feels intentional and productized

---

## Category 3 — Responsive and container-driven behavior

Validate the hosted result across:

- ultrawide desktop
- standard laptop / desktop
- tablet landscape
- tablet portrait
- phone portrait
- short-height / constrained window
- common zoom conditions

For each class, verify:

- no accidental compression
- no horizontal scrolling required for primary content
- no timid centered fallback where left-authoritative composition is correct
- compact modes remain clear and tappable
- primary task clarity survives

---

## Category 4 — Accessibility and interaction correctness

Validate:

- visible keyboard focus on all interactive elements
- correct focus order
- focus return from overflow
- no hover-only critical cues
- semantic correctness for the overflow model used
- target-size / spacing credibility in compact states
- reduced-motion support
- link/button roles match actual behavior

---

## Category 5 — Authoring and runtime resilience

Validate:

- loading, empty, and error states remain professional
- partial configuration remains safe
- rail enable/disable behavior still works
- fallback config still behaves safely when no site context exists

---

## Category 6 — Regression lock-in

Tests must fail if the implementation regresses into these conditions:

- homepage flagship path collapses back into the old row/list grammar
- wrapper order changes
- shell-occupant migration occurs
- overflow semantics or focus-return behavior breaks
- compact-state behavior becomes brittle

---

## Category 7 — Packaging and hosted proof

Required proof:

1. exact commands run
2. test suite results
3. build result
4. package result
5. hosted SharePoint validation notes
6. concise defect list
7. confirmation that any in-scope defects were fixed now

No “future work” placeholder is acceptable for meaningful in-scope defects discovered during closure.

---

## Evidence standard

A complete closure note should include:

- what changed
- what invariants were preserved
- what behaviors were re-validated
- what commands were run
- what was verified in hosted SharePoint
- whether any residual issues remain

If residual issues remain, state whether they are truly out of scope and why.
