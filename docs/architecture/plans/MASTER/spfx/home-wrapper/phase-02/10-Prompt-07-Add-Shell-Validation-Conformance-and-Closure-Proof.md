# Prompt 07 — Add Shell Validation, Conformance, and Closure Proof

## Objective

Produce the validation, artifact, and scorecard package required to close the shell as a governed homepage shell with evidence rather than opinion.

This prompt turns the shell work into something that can actually be accepted.

## Why this shell issue exists / current-state problem

The earlier packages were right to require proof, but they were still too loose.

The benchmark package requires:
- doctrine review
- audit traceability
- hosted validation
- defect accounting
- scored conformance
- explicit pass/fail closure

The shell now needs a validation program that matches its actual risk profile:
- schema parsing and normalization
- registry-driven rendering
- container-aware layout changes
- degraded state handling
- occupant capability enforcement
- preset/persistence handling

## Repo-truth evidence and exact shell files / seams to inspect

Inspect at minimum:

- all shell files changed by Prompts 01–06
- shell schema / registry / preset files
- zone fallback / diagnostics files
- any existing repo validation patterns relevant to homepage work
- benchmark docs:
  - `docs/architecture/plans/MASTER/spfx/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
  - `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`

If no shell-specific validation harness exists, create one in a repo-truth-aligned way.
Also keep `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md` open; closure must now prove alignment to that spec, not just general responsive credibility.

## Why the current shell implementation is insufficient

Without proof, the shell can still regress in exactly the places this package is meant to fix:

- malformed layout data
- invisible zone loss
- breakpoint hierarchy collapse
- shell-fit violations for occupants
- invalid persisted state
- non-credible hosted behavior

That means closure would be false confidence.

## Required shell implementation outcome

Create a shell validation and closure package that covers, at minimum:

### 1. Schema / normalization proof
Add validation for:
- valid preset input
- invalid preset input
- unknown occupant ids
- prohibited slot assignments
- normalized fallback output

### 2. Rendering / degraded-state proof
Add validation for:
- normal current-occupant rendering
- failed zone fallback
- invalid slot fallback
- inactive candidate handling
- shell rhythm preservation under degradation

### 3. Responsive / hierarchy proof
Add validation and artifacts for:
- wide shell state
- medium shell state
- narrow shell state
- hierarchy preservation across those states

Do not stop at generic widths. Include proof against the practical target classes implied by `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`, especially:
- desktop baseline
- tablet landscape
- tablet portrait
- phone portrait
- short-height constrained

### 4. Entry-state / hosted-runtime proof
Where SharePoint host behavior matters, produce disciplined proof artifacts:
- screenshots
- practical usable-width notes
- keyboard/focus notes
- defect log
- runtime caveats if any

At minimum, prove:
- the first shell lane begins on first load
- paired first-lane states only occur where shell-fit remains stable
- tablet portrait and handheld states are single-column and stable
- the shell does not read as “branding first, homepage later”

### 5. Conformance scorecard
Score the shell against the benchmark matrix with a written interpretation and an explicit pass/fail decision.

The shell is not a flagship top-band surface, so do not fabricate hero-related closure criteria that do not belong to this shell. Score the shell for what it actually is: the governed post-hero operating layer.

## What done really looks like

You are done only when all of the following are true:

1. The shell has testable proof for schema normalization and rendering behavior.
2. The shell has proof for degraded states and invalid states.
3. The shell has responsive hierarchy proof.
4. The shell has explicit alignment proof against the local entry breakpoint spec.
5. A conformance scorecard exists with written interpretation.
6. Closure ends with an explicit pass/fail statement and a defect list, even if empty.

## Constraints / prohibitions

- Do not claim closure without evidence.
- Do not skip invalid-state testing.
- Do not skip degraded-state testing.
- Do not write a scorecard without underlying proof artifacts.
- Do not add hero-related acceptance criteria that do not belong to the shell.
- Do not claim breakpoint-spec alignment without first-lane proof.
- Do not bury unresolved defects.

## Proof of closure required

Your final response after implementation must include:

1. exact files created or changed
2. test / artifact inventory
3. validation coverage summary
4. breakpoint-spec alignment summary
5. scored conformance matrix summary
6. pass/fail decision
7. unresolved defect list, even if empty
8. explicit statement that the shell was evaluated as the post-hero operating layer, not as a replacement for the independent hero


## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
