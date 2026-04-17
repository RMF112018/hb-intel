# Prompt 08 — Hosted Validation, Benchmark, and Closure

## Objective
Execute the hosted validation, benchmark scoring, and final closure pass for `PriorityActionsRail` and `PriorityActionsRailAdmin` so the effort closes on proof rather than assumption.

## Current-state repo-truth
- The repo already uses a proof-case mount seam for the public rail, which means validation is an expected part of the workflow.
- The benchmark package provides an explicit scorecard and closure checklist.
- The carried-forward spec defines concrete hosted-proof requirements for both the public rail and admin.

## Relevant SharePoint list-schema truth
Hosted validation must verify the real schema-backed behaviors:
- active config resolution
- enabled-item filtering
- schedule gating
- audience gating where testable
- device visibility gating
- overflow assignment
- stable persisted ordering and archive behavior
- admin write/read-after-write fidelity

## Why the current implementation is insufficient
This effort cannot close at compile time. The doctrine and benchmark package explicitly require:
- hosted SharePoint runtime validation
- screenshot evidence
- benchmark scoring
- explicit closure proof

Without this prompt, the package would still defer meaningful acceptance work.

## Relevant governing doctrine / benchmark authorities
Use directly:
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/06-Closure-Checklist.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/07-Persona-and-Design-Symmetry-Rule.md`
- carried-forward doctrine files

Closure thresholds:
- `PriorityActionsRail`: target `36+/40`
- `PriorityActionsRailAdmin`: minimum `32+/40`, preferred `36+/40`
- no category below `2`
- doctrine violations override numeric pass

## Exact files, seams, symbols, patterns, and schema docs to inspect
Inspect:
- finished public rail and admin webpart files
- proof-case entries
- package output
- carried-forward spec file
- benchmark scorecard/checklist files
- list-schema docs for scenario validation
- any repo-local validation or hosted test documentation patterns already used for homepage webparts

## Required implementation outcome
Produce the closure package for the implemented work:
- hosted screenshots across required breakpoints
- keyboard/focus and reduced-motion validation
- public loading/empty/error/partial-state proof
- admin add/edit/reorder/archive/discard/validation/permission proof
- completed scorecard for public and admin
- completed closure checklist
- logged remaining issues, if any, with explicit blocker/non-blocker classification

## What done really looks like
- There is concrete evidence that the public rail is compact, premium, and utility-first in SharePoint-hosted conditions.
- There is concrete evidence that the admin is a credible maintainer product, not just a save form.
- Benchmark scoring is explicit and traceable.
- Closure language is earned by evidence, not by subjective satisfaction.

## Proof of closure required
- screenshot set stored with the effort
- written scorecards completed
- closure checklist completed
- final defect list attached
- explicit statement whether the effort passes or fails closure, and why

## Constraints / prohibited shortcuts
- Do not self-certify closure without hosted evidence.
- Do not skip the scorecard because the result “looks good.”
- Do not ignore doctrine violations because the numeric score is passing.
- Do not leave mobile/tablet or keyboard behavior unvalidated.
- Do not hide unresolved material issues under “future work.”

## Instruction not to re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
