# Prompt — 02 Card Shell, Copy, KPI Removal, and Composition Reset

## Objective

Implement the first structural pass of the My Projects flagship rebuild. Remove low-value card scaffolding, update card-level copy, preserve existing state semantics, and prepare the card body for the new tile/grid architecture.


## Critical instruction — context efficiency

**Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.**

Use active context aggressively. Read only the files required for the current prompt, the tests you will update, exact type definitions needed to compile, and adjacent seams only when prompt truth requires it.


## Authoritative files

Primary edit files:

- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx` only if copy assertions require adjustment

Reference package files:

- `00_FULL_IMPLEMENTATION_PLAN.md`
- `01_TARGET_STATE_DECISION_LOCK.md`
- `02_REPO_TRUTH_BASELINE.md`

## Critical instructions

- Do not modify backend/auth/data seams.
- Do not modify home-surface span values.
- Do not alter Adobe Sign.
- Do not create the full tile/menu/browser system yet; Prompt 02 is the card-level composition reset.
- Preserve loading/empty/banner-only/degraded state truth.
- If a change requested here is already present, do not churn it.

## Required working approach

1. Update card copy:
   - eyebrow `My Work` → `My Portfolio`;
   - support copy → `Open assigned projects in SharePoint or Procore.`
2. Remove the populated-state KPI metrics strip entirely.
3. Remove the `Launch List` label.
4. Remove obsolete CSS for metric tiles and the launch heading.
5. Keep the project list temporarily functional even if the new tile architecture lands in Prompt 03.
6. Update tests so they assert:
   - new eyebrow/purpose copy;
   - absence of metrics strip;
   - absence of `Launch List`;
   - state blocks still render correctly.
7. Preserve existing unavailable-action honesty and existing list visibility until Prompt 03/04 replace the list/rail model.

## Specific questions you must answer

1. Which card-level scaffolding was removed?
2. Which test assertions were retired or replaced?
3. Did any state-copy behavior change unintentionally?
4. Did home-surface span/order remain untouched?

## Deliverables

- Implement the Prompt 02 code changes.
- Return the required closeout report.
- Provide a commit-ready summary and proposed commit message.

## Required report update

### Prompt-02 Progress — Card Shell Reset

Include:
- removed card furniture;
- copy changes;
- tests updated;
- exact files changed.

## Validation commands

Run narrow validation first:

```bash
pnpm --filter @hbc/spfx-my-dashboard test -- MyProjectsHomeCard
```

If the package test command does not accept that narrow argument in the local runner, run:

```bash
pnpm --filter @hbc/spfx-my-dashboard test
```

## Final instruction

Do not proceed into tile/menu/browser implementation in this prompt. Close Prompt 02 only when the card shell reset is implemented and validated.
