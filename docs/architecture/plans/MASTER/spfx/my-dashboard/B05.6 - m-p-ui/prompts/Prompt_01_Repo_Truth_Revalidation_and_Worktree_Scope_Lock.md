# Prompt — 01 Repo-Truth Revalidation and Worktree Scope Lock

## Objective

Perform the required no-edit repo-truth preflight for the My Projects flagship UI/UX rebuild. Confirm that the local repo still matches the implementation package’s baseline, identify any drift that affects later prompts, and produce an execution-ready scope lock. Do not implement UI changes in this prompt.


## Critical instruction — context efficiency

**Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.**

Use active context aggressively. Read only the files required for the current prompt, the tests you will update, exact type definitions needed to compile, and adjacent seams only when prompt truth requires it.


## Authoritative files

Read only what is required to verify current truth:

- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx`
- `apps/my-dashboard/package.json`
- `packages/models/src/myWork/MyProjectLinksReadModel.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- the package files:
  - `00_FULL_IMPLEMENTATION_PLAN.md`
  - `01_TARGET_STATE_DECISION_LOCK.md`
  - `07_DEPENDENCY_AND_FILE_OWNERSHIP_MAP.md`

## Critical instructions

- Do not edit product code.
- Do not edit docs in the repo unless the operator separately asked you to persist this package into repo docs.
- Do not reopen backend/auth/data remediation.
- Do not challenge or reopen the locked design decisions.
- Do not run broad repo audits.
- If repo truth materially contradicts a package assumption, stop and report the contradiction precisely rather than silently improvising.

## Required working approach

1. Confirm the current My Projects card still contains the known baseline seams:
   - `My Work` eyebrow;
   - metrics strip;
   - `Launch List`;
   - visible source badge rendering;
   - persistent dual action slot rail;
   - inline disclosure expansion.
2. Confirm home-surface span posture still matches the package.
3. Confirm read model still supplies the fields needed for the UI rebuild.
4. Confirm `apps/my-dashboard/package.json` does not already own the premium dependencies required by later prompts, or record which are already present.
5. Run:
   ```bash
   git status --short
   ```
6. Produce a concise execution readiness report.

## Specific questions you must answer

1. Is the package baseline still accurate?
2. Are any locked decisions already partially implemented?
3. Are any files unexpectedly dirty before implementation begins?
4. Are any required premium dependencies already present in `apps/my-dashboard/package.json`?
5. Is there any repo drift that changes the later prompt sequence?

## Deliverables

Return an execution report using the package closeout template.

## Required report update

Include a subsection titled:

### Prompt-01 Progress — Repo-Truth Revalidation

List:
- original baseline verified;
- drift found, if any;
- worktree condition;
- whether Prompt 02 may proceed unchanged.

## Validation commands

```bash
git status --short
```

## Final instruction

Do not implement changes in Prompt 01. This prompt closes only with a verified repo-truth scope lock and a clear go/no-go statement for Prompt 02.
