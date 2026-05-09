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

Complete accessibility, false-affordance, no-developer-copy, and regression test hardening for Phase 05.

## Scope

Tests only unless small production fixes are required to make tests pass.

Likely files:

```text
apps/project-control-center/src/tests/
apps/project-control-center/src/shell/
apps/project-control-center/src/state/
apps/project-control-center/src/surfaces/
```

## Required Test Coverage

### Navigation

- eight primary tabs render in order;
- every primary tab has a dropdown toggle;
- toggle uses `aria-haspopup`, `aria-expanded`, `aria-controls`;
- ArrowLeft/ArrowRight/Home/End behavior remains valid;
- ArrowDown opens dropdown;
- Escape closes dropdown;
- blur outside closes dropdown;
- opening one menu closes others.

### Module Items

- selectable module item calls module selection;
- non-selectable module item does not call module selection;
- non-selectable module item exposes reason copy;
- launch-only item exposes no-writeback cue;
- HBI item exposes advisory/no-decision/no-writeback cue;
- active module item exposes active marker.

### State

- selecting primary tab clears module;
- selecting selectable module sets parent tab and module;
- selecting disabled module leaves state unchanged.

### Dashboard

- every tab renders a dashboard;
- no dashboard ready path is blank;
- bento direct-child invariant preserved;
- active tabpanel marker remains on shell main.

### No Developer Copy

Rendered UI must not contain:

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

Important: scope this test to rendered product UI text, not test names, source code comments, or documentation files.

### No Routing / No Sidebar

- no test should expect URL changes from module selection;
- add assertions where practical that no persistent PCC sidebar marker exists;
- no navigation item is an external anchor unless specifically launch-only and safely labeled.

## Implementation Rule

If tests expose production defects, make the smallest necessary production fixes. Do not broaden scope into visual redesign, routing, or live integrations.

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

- test files added/updated;
- defects found and fixed;
- confirmation no forbidden UI copy renders;
- confirmation no sidebar/routing/writeback was introduced;
- validation results.
