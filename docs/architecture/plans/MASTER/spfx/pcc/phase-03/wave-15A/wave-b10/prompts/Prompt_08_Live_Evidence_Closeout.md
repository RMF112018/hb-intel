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

Perform Phase 05 evidence closeout after implementation is complete.

## Scope

Run final validation and, if hosted PCC navigation changed materially, run live Playwright evidence.

Do not implement new features in this prompt unless required to fix validation/evidence failures.

## Required Preflight

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Required Evidence Decision

Because Phase 05 materially changes visible hosted navigation, run or justify not running:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

If live tenant credentials/session are unavailable, state that clearly and provide all local validation evidence. Do not claim live evidence was captured if it was not.

## Screenshot Evidence Targets

Capture evidence showing:

- all eight primary tabs;
- Project Home dropdown open;
- Core Tools dropdown open;
- Document Control dropdown open;
- Project Controls dropdown open;
- Cost & Time dropdown open;
- Systems Administration dropdown open;
- a disabled/future module with reason copy;
- a selected active module context;
- Document Control visible label;
- no horizontal overflow at standard laptop;
- desktop / ultrawide if evidence harness supports it.

## Closeout Report Must Include

- current commit SHA before work;
- final commit SHA after work if committed;
- changed files;
- validation command outputs;
- test counts;
- lockfile MD5 before/after;
- evidence command outputs;
- evidence artifact paths;
- screenshots/contact sheet if generated;
- confirmation:
  - no standalone hero/header Module Launcher;
  - no sidebar;
  - no URL routing;
  - no SharePoint page routing;
  - no writeback;
  - no developer copy in UI;
  - Document Control visible tab is present;
  - all primary tabs and dropdowns render.

## If Evidence Fails

If evidence fails:

1. classify failure as implementation defect, environment/session issue, selector drift, or pre-existing issue;
2. fix implementation defects;
3. do not mask failures by weakening assertions;
4. rerun relevant tests;
5. document any environment/session limitation honestly.

## Validation

End with:

```bash
git status --short
```
