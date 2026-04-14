# Prompt 03 — Make archive/withdraw fail closed on binding lookup

## Objective

Close the fail-open lifecycle defect in archive/withdraw. A binding read failure must not be treated as “no binding exists.”

## Governing authority / required reference docs

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`

## Files and code paths to inspect

- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `any lifecycle tests for archive/withdraw`

## Exact defect to close

`runLifecycleTransition(...)` currently does `getByArticleId(...).catch(() => undefined)`. That means a binding lookup failure is swallowed and archive/withdraw can proceed without demoting the live page or updating the binding.

## Required implementation outcome

Refactor archive/withdraw so binding lookup failure is an explicit lifecycle failure. Absence of a binding is only acceptable when the repository positively returns `undefined`, not when the read throws.

Keep this prompt tightly bounded:
- do not redesign lifecycle ordering here
- only close the fail-open lookup defect and add proof

## Validation / proof of closure requirements

You must prove:
1. a thrown binding lookup now fails the lifecycle action
2. a clean `undefined` binding still behaves as the “no binding exists” path
3. page demotion is no longer skipped silently due to a swallowed read failure
4. no unrelated ordering/rollback changes were made in this prompt

## Deliverables / closure docs to create

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/closure-make-archive-withdraw-fail-closed-on-binding-lookup.md`
- include before/after failure-path trace and tests

## Guardrails

- Work in the live local repo.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Conduct an exhaustive scrub of the affected code path before making changes.
- Prove closure of this issue before moving to the next prompt.
- Do not make unrelated changes.
