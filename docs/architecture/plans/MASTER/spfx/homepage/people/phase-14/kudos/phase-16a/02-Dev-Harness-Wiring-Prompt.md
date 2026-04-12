# 02 — Dev Harness Wiring Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to close the **dev-harness execution blocker** for the HB Kudos Playwright lane.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Implement the exact dev-harness routes and global hooks already expected by the existing Playwright Kudos suite so the browser specs can actually execute.

## Repo areas to inspect and update

At minimum inspect and update where repo truth requires:

- `apps/dev-harness/src/**`
- current tab / route registration for the harness
- any preview shell or tab registry used by `@hbc/dev-harness`
- `e2e/webparts/kudos/helpers/kudosHarnessPage.ts`
- `e2e/webparts/kudos/helpers/kudosAssertions.ts`
- `e2e/webparts/kudos/fixtures/**`
- `playwright.webparts.config.ts`

## Required outcomes

### 1. Add real harness routes

Implement real dev-harness routes for:

- `/?tab=kudos`
- `/?tab=kudos-companion`

These routes must mount the real runtime surfaces, not fake placeholders.

### 2. Add the seed hook expected by the suite

Expose:

- `window.__hbKudosSeed(payload)`

This must install deterministic seeded state before the mounted public/companion surface renders its data-dependent UI.

Do not fake this with post-render DOM mutation.
Do not bypass the real runtime seams more than necessary.

### 3. Add the workflow probe expected by the suite

Expose:

- `window.__hbKudosProbe.workflowStates`

This must reflect the actual workflow union currently exported by repo truth so the drift guard is meaningful.

### 4. Add the cache probe expected by the suite

Expose:

- `window.__hbKudosCacheProbe.invalidations`

Wire this to real invalidation behavior so the browser suite can prove cache refresh coupling after successful mutations.

### 5. Add the mode/fault toggles the specs expect

Expose harness-level controls for:

- people-search mode override
- hosted-fault override

These must drive the seeded / deterministic harness behavior already assumed by the browser specs and fixture catalog.

### 6. Ensure fail-fast behavior remains honest

If the harness is misconfigured, the existing helper fail-fast behavior may stay, but once this workstream is complete the default expectation should be successful execution, not dependency failure.

## Implementation rules

- mount the real `HbKudos` and `HbKudosCompanion` components
- keep harness wiring deterministic and reversible
- do not cross-contaminate production runtime code with dev-only globals unless clearly gated
- keep the global surface small and explicit
- prefer one coherent Kudos harness adapter instead of scattered ad hoc helpers

## Validation required

Before closing this workstream, prove all of the following:

- `gotoKudosPublic(...)` works
- `gotoKudosCompanion(...)` works
- seed injection occurs before runtime assertions execute
- workflow probe returns the true 7-state workflow core
- cache probe increments on successful mutation paths
- people-search and hosted-fault overrides are reachable from browser tests

## Required deliverables

- real harness wiring committed
- any supporting dev-only adapter/module committed
- short markdown implementation note committed
- no remaining TODO/placeholder comments for the above items
