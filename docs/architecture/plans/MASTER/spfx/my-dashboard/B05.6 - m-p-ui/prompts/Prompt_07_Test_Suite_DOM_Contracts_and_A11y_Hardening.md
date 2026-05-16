# Prompt — 07 Test Suite, DOM Contracts, and Accessibility Hardening

## Objective

Complete the test and accessibility contract for the My Projects flagship rebuild. Replace obsolete tests that preserved the old expanded-row layout, add full coverage for the new tile/menu/browser/search model, and ensure DOM hooks support deterministic future validation.


## Critical instruction — context efficiency

**Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.**

Use active context aggressively. Read only the files required for the current prompt, the tests you will update, exact type definitions needed to compile, and adjacent seams only when prompt truth requires it.


## Authoritative files

Primary test/edit files:

- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.test.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.test.tsx`
- `apps/my-dashboard/src/modules/myProjects/myProjectPortfolioPresentation.test.ts`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx`

Source files may be adjusted only if tests reveal a real implementation defect:

- `MyProjectsHomeCard.tsx`
- `ProjectPortfolioTile.tsx`
- `ProjectLaunchMenu.tsx`
- `ProjectPortfolioBrowser.tsx`
- `myProjectPortfolioPresentation.ts`

Reference package files:

- `05_ACCESSIBILITY_AND_INTERACTION_SPEC.md`
- `06_TEST_VALIDATION_AND_EVIDENCE_MATRIX.md`

## Critical instructions

- Do not weaken tests merely to make them green.
- Remove assertions that belong only to the obsolete KPI/source-pill/dual-button/inline-expansion model.
- Add precise tests for the new locked design.
- If implementation defects are discovered, patch narrowly and report them.
- Preserve home-surface span/order tests.

## Required working approach

1. Audit the full My Projects test surface against the target-state plan.
2. Remove obsolete expectations.
3. Add/strengthen tests for:
   - eyebrow/copy/metric removal;
   - tile DOM hooks;
   - absence of source pills;
   - name/number identity block;
   - Open menu trigger and action semantics;
   - unavailable non-link states;
   - browser dialog semantics;
   - search behavior;
   - focus return on browser close;
   - Escape close where testable;
   - visible-count helper behavior;
   - display sorting helper behavior.
4. Confirm home-surface tests continue to preserve card order and span contract.
5. Run full package validation.

## Specific questions you must answer

1. Which old tests were removed or rewritten?
2. Which new DOM/interaction contracts are now enforced?
3. Did any source implementation require narrow accessibility corrections?
4. Are surface span/order tests still intact?

## Deliverables

- Prompt 07 test and narrow defect-fix changes.
- Closeout report.
- Commit-ready summary and proposed commit message.

## Required report update

### Prompt-07 Progress — Test and Accessibility Contract Closure

Include:
- tests removed/rewritten;
- tests added;
- narrow source fixes, if any;
- final validation summary.

## Validation commands

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard lint
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

## Final instruction

Close Prompt 07 only when the new UI is protected by the test suite and the package-wide validation commands are green.
