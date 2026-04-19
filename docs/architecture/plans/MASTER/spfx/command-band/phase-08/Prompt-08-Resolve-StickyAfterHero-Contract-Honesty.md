# Prompt 08 — Resolve StickyAfterHero Contract Honesty

## Objective
Resolve whether `stickyAfterHero` is a real, supported behavior or misleading contract vocabulary, and make the contract honest either way.

## Why this prompt exists
The config contract still exposes `stickyAfterHero`.
If that capability is not fully implemented and validated, it misleads maintainers and weakens the product contract.

## Current issue
This is not the biggest product-quality failure, but it is still an in-scope contract problem.
A benchmark-grade surface should not expose misleading behavior vocabulary.

## Governing authority
Apply directly:
- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md`
- benchmark package closure materials
- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`

## Inspect at minimum
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- any config read/write seams that surface `stickyAfterHero`
- any preview/admin/runtime code that claims to honor sticky behavior
- any tests or docs that describe sticky behavior

## Required implementation outcome
Do one of the following, based on repo truth:

### Option A — Fully support it
If sticky behavior is intended and useful, implement it credibly and prove it in hosted runtime and tests.

### Option B — Narrow or remove it
If sticky behavior is not actually supported, remove or narrow the contract so maintainers are not misled.

Do not leave an ambiguous middle state.

## Done state
“Done” means the contract truthfully reflects the shipped behavior.

## Required proof of closure
Return:
- which option was chosen and why
- exact contract/doc/runtime changes made
- hosted proof if implemented
- or proof that the misleading surface was removed/narrowed

## Working rules
- Do not reopen already-correct wrapper ownership unless repo truth proves a real defect.
- Do not migrate the rail into shell-occupant semantics.
- Do not drift into unrelated homepage modules.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Return concrete proof of closure, not just a description of the changes.
