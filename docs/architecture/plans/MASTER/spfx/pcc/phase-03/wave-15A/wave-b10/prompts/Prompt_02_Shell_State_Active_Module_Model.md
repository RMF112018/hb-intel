# Fresh Local Code Agent Prompt — PCC Phase 05

## Role

You are my local implementation agent for `RMF112018/hb-intel`.

You are implementing **PCC Phase 05 — Grouped Tab Module Navigation** inside `apps/project-control-center`.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Work against current `main`.
- Inspect repo truth before editing.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve the distinction between primary dashboard surfaces and child modules.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not add a standalone hero/header Module Launcher.
- Do not add a persistent PCC sidebar.
- Do not introduce URL routing, query-string routing, or SharePoint page routing.
- Do not introduce Procore, Sage, SharePoint, tenant, group, list, library, approval, or HBI writeback.
- Do not present developer copy in the UI. All rendered content must be production-grade and end-user-facing.
- Do not render these strings in product UI: TODO, TBD, placeholder, stub, mock, fixture, debug, dev-only, not implemented, lorem, developer, code agent, prompt, repo, test selector, internal only.
- Do not delete existing surfaces to satisfy navigation changes. Map, adapt, or wrap them safely.

## Objective

Extend PCC shell state to support safe in-memory active module context.

## Scope

Modify `apps/project-control-center/src/state/usePccShellState.ts` and relevant tests only unless additional type imports are required.

## Required State Shape

Target:

```ts
export interface PccShellState {
  readonly activeSurfaceId: PccPrimaryTabId;
  readonly activeModuleId?: PccModuleId;
  readonly previewMode: true;
  readonly selectedProjectId?: PccProjectId;
}
```

## Required Actions

```ts
selectPrimarySurface(id: PccPrimaryTabId): void;
selectModule(id: PccModuleId): void;
clearActiveModule(): void;
setSelectedProject(id: PccProjectId | undefined): void;
```

Keep `setActiveSurface` as a compatibility alias only if current code/tests require it. If retained, it must call `selectPrimarySurface`.

## Behavior Rules

- Default active surface remains `project-home`.
- Default active module is `undefined`.
- `previewMode` remains literal `true`.
- `selectPrimarySurface(id)`:
  - normalizes invalid IDs to `project-home`;
  - sets active surface;
  - clears active module.
- `selectModule(id)`:
  - finds module in registry;
  - if missing, leaves state unchanged;
  - if non-selectable, leaves state unchanged;
  - if selectable, sets active surface to module parent tab and sets active module.
- `clearActiveModule()` clears only active module.
- `setSelectedProject(id)` sets project and clears active module.
- No URL routing.
- No persistence.
- No localStorage/sessionStorage.
- No tenant reads.

## Tests

Update `usePccShellState.test.ts` or add equivalent tests:

- defaults to Project Home and no active module;
- preserves `previewMode === true`;
- primary tab selection clears active module;
- selectable module selection sets parent tab and module;
- non-selectable/deferred module selection does not mutate state;
- invalid surface normalizes to Project Home;
- invalid module does not mutate state;
- project change clears active module;
- setter references remain stable;
- compatibility alias works if retained.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Closeout

Include:

- state API before/after;
- tests added/updated;
- validation results;
- explicit confirmation that no URL routing/persistence/writeback was introduced.
