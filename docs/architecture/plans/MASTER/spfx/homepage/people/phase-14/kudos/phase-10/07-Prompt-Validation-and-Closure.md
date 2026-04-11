# Prompt 07 — Validation and Closure

You have completed the extraction and reintegration work.

Now prove it.

## Primary Goal

Run the smallest meaningful validation set that proves the shared people picker exists in the correct place, HB Kudos consumes it, and the required UX/contract behavior is real.

## Required Proof Points

You must prove all of the following:

1. The shared people picker exists in the correct shared destination.
2. HB Kudos consumes that shared picker rather than a local duplicate implementation.
3. Homepage consumers use the correct governed export boundary.
4. Live search is human-name-first.
5. Result rows show photo/avatar plus first and last name.
6. Missing-photo fallback works without broken-image UX.
7. The component is reusable by other consumers.
8. No regression was introduced into the Kudos composer submit flow.

## Required Validation Steps

### A. Static proof

Provide file-level proof for:

- final shared component location
- final export location
- final HB Kudos consumption path
- deletion/collapse of duplicated picker logic in `HbcKudosComposer`

### B. Type/build proof

Run the smallest relevant verification commands for the touched scope, such as the appropriate combination of:

- package-local typecheck
- package-local lint
- affected tests
- Storybook/story compile checks if required by the repo’s current standards

Do not jump to giant workspace validation unless the touched scope demands it.

### C. Behavioral proof

Prove, through test coverage, harness output, Storybook states, or equivalent targeted evidence, that:

- search results can render avatar + first/last name
- missing-photo users render initials/placeholder
- selected chips/tokens behave correctly
- keyboard navigation still works
- HB Kudos still passes the correct recipient data into its submit path

### D. Regression proof

Verify there is no remaining active duplicate picker path used by HB Kudos.

If any duplicate path is intentionally retained as a temporary shim, document exactly why, where, and when it must be removed.

## Required Closure Note

Produce a concise closure summary including:

- files changed
- ownership decision implemented
- validation commands run
- outcomes
- any remaining follow-up items
- any temporary compatibility shims that still exist

## Failure Rule

If any required proof point fails, do not declare completion.

Fix the issue or clearly mark the exact blocker.
