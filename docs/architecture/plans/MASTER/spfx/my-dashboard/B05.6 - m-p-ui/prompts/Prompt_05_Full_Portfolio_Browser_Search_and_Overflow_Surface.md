# Prompt — 05 Full Portfolio Browser, Search, and Overflow Surface

## Objective

Replace final inline all-project expansion with the locked responsive modal portfolio browser overlay. Add deterministic search by project name and number, full-project rendering, responsive drawer/sheet posture, and accessible open/close behavior.


## Critical instruction — context efficiency

**Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.**

Use active context aggressively. Read only the files required for the current prompt, the tests you will update, exact type definitions needed to compile, and adjacent seams only when prompt truth requires it.


## Authoritative files

Primary edit/create files:

- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.tsx` — create
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.module.css` — create
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.test.tsx` — create
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css`
- `apps/my-dashboard/src/modules/myProjects/myProjectPortfolioPresentation.ts`
- `apps/my-dashboard/src/modules/myProjects/myProjectPortfolioPresentation.test.ts`

Reference package files:

- `01_TARGET_STATE_DECISION_LOCK.md`
- `04_BREAKPOINT_SHELL_FIT_CONTRACT.md`
- `05_ACCESSIBILITY_AND_INTERACTION_SPEC.md`

## Critical instructions

- Do not keep unlimited inline expansion as the final all-project pattern.
- The resting card should render the mode-specific visible count only.
- `View all projects` opens the portfolio browser overlay.
- Search must filter by project name and project number.
- Modal browser must return focus to the originating trigger on close.
- Browser should reuse the same launch menu/tile semantics rather than invent a second action model.
- Desktop/tablet-landscape posture = right-side drawer/panel.
- Tablet portrait/phone/short-height posture = full-screen sheet.

## Required working approach

1. Extend presentation helpers for:
   - normalized search;
   - filter-by-name-or-number results.
2. Implement `ProjectPortfolioBrowser`.
3. Browser content:
   - title `All My Projects`;
   - search input placeholder `Search by project name or number`;
   - close control;
   - all matching projects;
   - no-results copy `No projects match your search.`
4. Browser semantics:
   - modal dialog;
   - focus on search input on open;
   - Escape closes;
   - focus returns to `View all projects` trigger.
5. Rewire `MyProjectsHomeCard`:
   - remove final inline all-project expansion path;
   - use mode visible-count rule;
   - show CTA only when items exceed visible count.
6. Add tests for:
   - browser open/close;
   - search filtering by name;
   - search filtering by number;
   - no-results state;
   - dialog semantics;
   - focus return.

## Specific questions you must answer

1. How was inline expansion retired?
2. How does the browser respond across desktop and handheld posture?
3. How does search normalize and match values?
4. How is focus managed on open and close?
5. How does the browser preserve the same action model as resting tiles?

## Deliverables

- Prompt 05 implementation changes.
- Closeout report.
- Commit-ready summary and proposed commit message.

## Required report update

### Prompt-05 Progress — Portfolio Browser and Search Closure

Include:
- browser files created;
- search helper behavior;
- replacement of inline expansion;
- tests and validation results.

## Validation commands

```bash
pnpm --filter @hbc/spfx-my-dashboard test -- ProjectPortfolioBrowser
pnpm --filter @hbc/spfx-my-dashboard test -- myProjectPortfolioPresentation
pnpm --filter @hbc/spfx-my-dashboard test -- MyProjectsHomeCard
pnpm --filter @hbc/spfx-my-dashboard check-types
```

If targeted test invocation is unsupported, run the package test command.

## Final instruction

Close Prompt 05 only when the full-project overflow behavior is handled through the modal browser and search is validated.
