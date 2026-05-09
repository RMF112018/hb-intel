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

Implement final module selection behavior, disabled/non-selectable module behavior, and production-grade state copy.

## Scope

Modify navigation/dropdown/state/dashboard files as needed, but do not create new routing or writeback behavior.

## Required Behavior

### Selectable Modules

When a selectable module is selected:

1. set `activeSurfaceId` to the module's parent tab;
2. set `activeModuleId` to the module;
3. close the dropdown;
4. render selected module context on the parent dashboard;
5. do not change URL;
6. do not perform external writeback.

### Non-Selectable Modules

When a non-selectable module is clicked or activated with keyboard:

1. do not change `activeSurfaceId`;
2. do not change `activeModuleId`;
3. keep reason copy visible;
4. do not navigate;
5. do not render as anchor;
6. do not imply live action.

## Required Selected Module Context

When `activeModuleId` is set, the dashboard must display:

- selected module label;
- state label;
- state cue/reason;
- authority cue if relevant.

Example:

```text
Selected module: Constraints Log
Preview only. Review source records before taking action.
```

Do not show module IDs in UI.

## Required Disabled Copy

Use approved copy:

| State | Copy |
|---|---|
| configuration-required | Configuration is required before this module can open for the selected project. |
| source-unavailable | Source data is not available for the selected project. |
| deferred | Planned for a future release. This module is not active for the selected project. |

## Required Authority Cues

Use production-grade cues:

| Module Type | Cue |
|---|---|
| HBI | HBI is advisory. It does not make decisions, approve work, or write back to source systems. |
| Launch-only external module | Opens or references the source system. PCC does not write back to that system. |
| Approvals | Read-only approval context. Approval decisions remain in governed workflows. |
| Procore | Procore remains the source of truth for Procore-owned records. |
| Financial | Financial information is presented for review. Sage remains the accounting book of record. |

## Tests

Add/update tests proving:

- enabled module selection updates active surface and active module;
- disabled module click does not mutate state;
- disabled module keyboard activation does not mutate state;
- selected module context uses label and production-grade cue;
- HBI Assistant does not imply decision/writeback authority;
- launch-only items include no-writeback cue;
- approvals do not expose approve/reject/waive actions;
- no forbidden developer copy renders.

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

- state transition behavior summary;
- disabled behavior summary;
- authority cue summary;
- tests added/updated;
- validation results.
