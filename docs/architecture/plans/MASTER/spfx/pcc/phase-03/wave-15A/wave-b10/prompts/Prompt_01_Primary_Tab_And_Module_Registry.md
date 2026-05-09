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

Create the typed registry and model contract for Phase 05 primary tabs and child modules.

## Scope

Implement the navigation registry described in `01_Navigation_Registry_Contract.md`.

Preferred location:

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
```

Fallback location if package export churn is too high:

```text
apps/project-control-center/src/shell/pccPrimaryNavigation.ts
```

If using fallback location, document the reason in closeout.

## Required Content

Add types/constants for:

- `PCC_PRIMARY_TAB_IDS`
- `PccPrimaryTabId`
- `PCC_MODULE_IDS`
- `PccModuleId`
- `PCC_MODULE_STATES`
- `PccModuleState`
- `PCC_MODULE_STATE_COPY`
- `PCC_PRIMARY_NAVIGATION_TABS`
- `PCC_NAVIGATION_MODULES`
- helper functions:
  - `getPrimaryNavigationTab`
  - `getModule`
  - `getModulesForPrimaryTab`
  - `isSelectableModule`
  - `getParentTabForModule`
  - `normalizePrimaryTabId`
  - `normalizeModuleId`

## Exact Primary Tab Order

```text
project-home
core-tools
documents
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Visible labels:

```text
Project Home
Core Tools
Document Control
Estimating & Preconstruction
Project Startup & Closeout
Project Controls
Cost & Time
Systems Administration
```

## Important Compatibility Rule

Use `documents` as the internal ID for `Document Control` in this phase unless you can safely update all dependent types, router cases, tests, and read-model seams in the same prompt. The visible label must be `Document Control`.

## UI Copy Guardrail

All registry labels, summaries, authority cues, and disabled reasons are potentially user-facing. They must be production-grade.

Forbidden terms in registry visible copy:

```text
TODO
TBD
placeholder
stub
mock
fixture
debug
dev-only
not implemented
lorem
developer
code agent
prompt
repo
test selector
internal only
```

## Tests

Add or update tests proving:

- exact primary tab order;
- exact visible labels;
- exact module IDs;
- every module belongs to one existing primary tab;
- every primary tab has at least one module;
- non-selectable modules have disabled reason copy;
- all module state copy exists;
- visible registry copy contains no forbidden developer terms;
- `documents` visible label is `Document Control`.

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

- files changed;
- registry location used;
- tests added/updated;
- validation results;
- lockfile MD5 before/after;
- confirmation that no UI developer copy was introduced.
