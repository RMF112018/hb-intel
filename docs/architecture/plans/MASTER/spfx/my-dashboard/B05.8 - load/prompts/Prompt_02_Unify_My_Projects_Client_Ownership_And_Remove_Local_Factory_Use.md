# Prompt 02 — Unify My Projects Client Ownership and Remove Local Factory Use

## Role

Act as a senior React application architect and repo-truth refactoring specialist working in `RMF112018/hb-intel`.

## Objective

Refactor My Projects so it consumes the existing app-level read-model client context instead of constructing a new local client with the factory.

The expected outcome is cleaner ownership, less prop threading, and a safer path for future request dedupe/caching work.

## Governing Package Files

Read:
- `01_Proposed_Implementation_Plan.md`
- `02_Target_Architecture_And_Closed_Decisions.md`
- `03_Validation_Matrix_And_Acceptance_Criteria.md`
- `06_Exact_File_Level_Targets.md`

Do **not** re-read files that remain within current context or memory unless needed.

## Primary Files to Edit

- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`

Touch other files only if TypeScript requires coordinated cleanup.

## Required Production Refactor

### Replace this ownership model
Inside `MyProjectsHomeCard`:

```ts
createMyWorkReadModelClient({ getApiToken })
```

### With this ownership model

```ts
const client = useMyWorkReadModelClient();
```

using:

```text
apps/my-dashboard/src/runtime/MyWorkReadModelClientProvider.tsx
```

## Required Prop Cleanup

Remove now-obsolete `getApiToken` plumbing from:

1. `MyProjectsHomeCardProps`
2. `MyWorkHomeSurfaceProps`
3. `MyWorkSurfaceRouterProps`
4. `MyWorkShell` call into `MyWorkSurfaceRouter`

Retain `getApiToken` where still required:
- `MyDashboardApp`
- `MyWorkReadModelClientProvider`
- `MyWorkShell` OAuth start logic

## Required Test Refactor

### `MyProjectsHomeCard.test.tsx`
The current tests mock:
```text
../../api/myWorkReadModelClientFactory.js
```

Delete that factory mock.

Replace test rendering with:
- `MyWorkReadModelClientProvider client={stubClient}`
- a stub client whose `getMyProjectLinks` is controlled by test setup.

Preserve all existing behavioral assertions, including:
- loading compact block,
- tile behavior,
- launch-menu behavior,
- partial and unavailable banners,
- empty state,
- disclosure behavior.

## Additional Guardrail

Do not modify the My Projects business logic or visual layout in this prompt. This is a seam-ownership refactor, not a UI redesign.

## Validation

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard check-types
```

## Required Closeout Format

### Summary
### Files Modified
### Contract Changes
### Tests / Validation
### Risk Review
### Commit Recommendation
