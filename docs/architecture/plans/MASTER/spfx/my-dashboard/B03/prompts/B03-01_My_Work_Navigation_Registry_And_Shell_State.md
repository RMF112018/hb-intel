# B03-01 — Implement My Work Navigation Registry and Shell State

## Objective

Implement the typed My Work navigation registry and in-memory shell-state controller required by B03. This prompt establishes the canonical identifiers and state transitions that every later B03 prompt must consume.

## Execution prerequisites

- B02 has been completed and merged into the current branch.
- `apps/my-dashboard/` exists.
- The working tree is clean or any pre-existing operator-owned work is documented before edits.

## Read first

Inspect only the files you need. Do not re-read files that are still in your current context or memory.

Required reference targets:

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
apps/project-control-center/src/state/usePccShellState.ts
packages/my-work-feed/README.md
docs/architecture/adr/ADR-0115-my-work-feed-architecture.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B03_My_Work_Shell_Navigation_And_UX_Development.md
```

## Implement

### 1. Create the My Work navigation model namespace

Create:

```text
packages/models/src/myWork/MyWorkNavigation.ts
packages/models/src/myWork/index.ts
```

Update the relevant package barrel(s) so My Work navigation exports are available through the same public package strategy used elsewhere in `@hbc/models`.

### 2. Define the canonical MVP surface IDs

```ts
export const MY_WORK_PRIMARY_SURFACE_IDS = ['my-work-home'] as const;
export type MyWorkPrimarySurfaceId =
  (typeof MY_WORK_PRIMARY_SURFACE_IDS)[number];
```

### 3. Define the canonical MVP module IDs

```ts
export const MY_WORK_MODULE_IDS = ['adobe-sign-action-queue'] as const;
export type MyWorkModuleId =
  (typeof MY_WORK_MODULE_IDS)[number];
```

### 4. Define module state vocabulary

Use the B03 vocabulary:

```ts
available
preview
read-only
configuration-required
authorization-required
principal-unresolved
source-unavailable
deferred
```

Do not invent additional B03 navigation states. `partial` belongs to later read-model envelope semantics, not this registry enum.

### 5. Define typed registry interfaces

Create equivalents of PCC’s navigation metadata, adapted for My Work:

- `MyWorkPrimaryNavigationSurface`
- `MyWorkNavigationModule`
- `MyWorkModuleStateCopy`

The registry must remain:
- metadata-only,
- UI-free,
- router-free,
- backend-free,
- non-overlapping with `@hbc/my-work-feed`.

### 6. Add the single primary surface record

```text
id: my-work-home
label: My Work Home
dashboardTitle: My Work
dashboardDescription:
  Your personal command surface for work requiring attention across connected HB systems.
modules:
  adobe-sign-action-queue
```

### 7. Add the Adobe queue module record

Use exactly:

```text
id: adobe-sign-action-queue
label: Adobe Sign Action Queue
parentSurfaceId: my-work-home
state: read-only
stateLabel: Read-only
sourceSystem: Adobe Sign
selectable: true
summary:
  Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.
authorityCue:
  Queue visibility only. Agreement actions remain in Adobe Sign.
```

### 8. Implement lookup and normalization helpers

Required functions:

- `getMyWorkPrimaryNavigationSurface`
- `getMyWorkModule`
- `getMyWorkModulesForPrimarySurface`
- `isSelectableMyWorkModule`
- `normalizeMyWorkPrimarySurfaceId`
- `normalizeMyWorkModuleId`

Normalization behavior:
- invalid primary surface → `my-work-home`,
- invalid module → `undefined`.

### 9. Implement shell state controller

Create:

```text
apps/my-dashboard/src/state/useMyWorkShellState.ts
```

Contract:

```ts
interface MyWorkShellState {
  readonly activePrimarySurfaceId: MyWorkPrimarySurfaceId;
  readonly activeModuleId?: MyWorkModuleId;
}

interface MyWorkShellStateActions {
  selectPrimarySurface(id: MyWorkPrimarySurfaceId): void;
  selectModule(id: MyWorkModuleId): void;
  clearActiveModule(): void;
}
```

Behavior:
- initialize to `my-work-home`,
- selected module may only be a selectable registered module,
- `selectPrimarySurface('my-work-home')` clears `activeModuleId`,
- selecting `adobe-sign-action-queue` leaves parent surface as `my-work-home`,
- no localStorage,
- no URL state,
- no runtime mode or preview mode field.

## Tests

Add or update tests covering:

- primary surface registry value,
- Adobe module registry value,
- `read-only` state value,
- helper lookup behavior,
- normalization behavior,
- shell-state transitions,
- invalid input handling.

Use the test style already present in the relevant package/app.

## Validation

Run the minimum targeted checks available for the changed model/app scopes. Use the actual package names in the repo. Report exact commands and results.

## Hard no-go rules

- Do not create multiple MVP primary surfaces.
- Do not render future modules.
- Do not add feed aggregation, counts, ranking, dedupe, or queue logic.
- Do not redefine `@hbc/my-work-feed`.
- Do not re-read files still in current context or memory.

## Completion note

At the end, report:
- files changed,
- registry/state decisions implemented,
- tests run,
- whether Prompt 02 is unblocked.
