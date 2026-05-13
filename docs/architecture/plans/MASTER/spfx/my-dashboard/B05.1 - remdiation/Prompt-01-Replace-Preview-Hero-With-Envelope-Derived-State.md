# Prompt 01 — Replace Preview Hero With Envelope-Derived State

## Objective
Remove the production shell’s dependency on static My Work hero preview copy and replace it with a truthful hero view-model derived from the active route’s actual read-model envelope and source status.

## Why This Issue Exists Now
`MyWorkShell.tsx` still calls `selectMyWorkHeroPreviewViewModel(...)`, and `myWorkHeroPreview.ts` hard-codes “Pending source connection” values. This produces the operator-observed contradiction where the hero implies a pending source while lower cards show populated queue content.

## Why It Matters
The hero is the highest-salience runtime status surface. If it is stale, every hosted screenshot and operator diagnosis becomes unreliable.

## Current Repo-Truth Condition
Inspect and verify:
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/preview/myWorkHeroPreview.ts`
- the current route envelope hooks and any hero-band types/selectors.

Current known condition:
- the shell computes hero state from a preview selector,
- the focused Adobe preview hero hard-codes pending values.

## Required Future State
- Production shell composition must not use a preview-only hero selector.
- Hero highlights must be derived from current active surface/module state and the active route’s read-model envelope/status.
- The hero must accurately represent at least:
  - live available / connected,
  - authorization-required,
  - configuration-required,
  - backend-unavailable,
  - loading/error where applicable.
- Preview-only helper(s) may remain only for explicit visual review/test contexts if clearly separated from production composition.

## Exact Files / Seams / Symbols to Inspect
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/preview/myWorkHeroPreview.ts`
- `apps/my-dashboard/src/shell/MyWorkHeroBand.tsx`
- `apps/my-dashboard/src/runtime/useMyWorkReadModelEnvelope.ts`
- `apps/my-dashboard/src/state/myWorkCardViewModel.ts`
- `apps/my-dashboard/src/state/myWorkSurfaceReadiness.ts`
- any existing tests for hero band / shell / surface router.

## Required Implementation Scope
1. Introduce or extend an envelope-derived hero selector.
2. Thread the necessary state from active route/shell composition without creating duplicate fetches.
3. Preserve existing shell navigation behavior.
4. Remove production dependence on `selectMyWorkHeroPreviewViewModel(...)`.
5. Update/add tests proving:
   - focused Adobe `authorization-required` drives hero authorization-required copy,
   - focused Adobe `available` drives connected/fresh hero copy,
   - home/readiness states are truthful,
   - no static “Pending source connection” copy persists where live state exists.

## Explicit Non-Scope
- Do not redesign the full shell layout.
- Do not alter OAuth route logic.
- Do not change backend provider behavior.
- Do not change My Projects data matching in this prompt.

## Required Tests
- Shell/hero selector tests.
- Surface/router integration tests if required to prove active module-to-hero state.
- Regression test that fails against the current preview-bound implementation.

## Validation Commands
Run the closest available equivalent commands in the repo. At minimum, execute the relevant package checks for changed areas, such as:

```bash
pnpm --filter @hbc/my-dashboard check-types
pnpm --filter @hbc/my-dashboard test
pnpm --filter @hbc/functions test
```

Also run any narrower Vitest files or package-specific test commands that directly cover the changed files. If the repo exposes an existing SPFx package verification command for My Dashboard, use it when the prompt changes packaging/runtime proof seams.

## Proof-of-Closure Artifacts
Provide:
- changed-file inventory,
- test command results,
- concise before/after behavior summary,
- any new fixtures/snapshots/evidence docs,
- any remaining operator-only proof items.

## Completion Standard
The prompt is complete only when:
- the required future state is implemented,
- tests are added/updated,
- validation commands are executed or clearly documented if unavailable,
- the closure evidence is produced,
- no out-of-scope surface was disturbed.

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
