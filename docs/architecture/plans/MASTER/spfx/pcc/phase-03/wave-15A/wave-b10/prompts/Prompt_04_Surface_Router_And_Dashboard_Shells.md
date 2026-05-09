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

Wire the new primary tab model through `PccApp`, `PccShell`, and `PccSurfaceRouter`, and render production-grade dashboard surfaces for all eight primary tabs.

## Scope

Likely files:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/surfaces/
apps/project-control-center/src/tests/
```

## Required App Wiring

- `PccApp` must use the extended shell state.
- Pass `activeModuleId` to `PccShell`.
- Pass `selectPrimarySurface` to tab selection.
- Pass `selectModule` to module selection.
- Pass `activeModuleId` to `PccSurfaceRouter`.

## Required Shell Wiring

- `PccShell` must pass active module props to `PccHorizontalTabs`.
- Shell `main[role="tabpanel"]` remains the sole semantic owner of `data-pcc-active-surface-panel`.
- Do not move the tabpanel marker to a card.
- Do not introduce extra wrappers that break bento direct-child behavior.

## Required Router Wiring

- Accept `activeSurfaceId: PccPrimaryTabId`.
- Accept `activeModuleId?: PccModuleId`.
- Render dashboard surfaces for all eight primary tabs.

## Render Strategy

| Tab | Phase 05 Strategy |
|---|---|
| project-home | Existing Project Home. |
| core-tools | New production-grade dashboard shell. |
| documents | Existing Documents surface, visible as Document Control. |
| estimating-preconstruction | New production-grade preview dashboard. |
| startup-closeout | New production-grade dashboard shell using readiness/startup/closeout concepts. |
| project-controls | New production-grade dashboard shell using controls/permit/inspection/constraints concepts. |
| cost-time | New production-grade preview dashboard. |
| systems-administration | New production-grade dashboard shell using settings/site-health/integration concepts. |

## Dashboard Minimum Requirements

Every new dashboard must show:

- clear dashboard title;
- clear purpose statement;
- at least three cards or structured sections;
- module states/cues;
- selected module context when active;
- no developer copy.

## Production-Grade Preview Copy Examples

Use copy like:

```text
This dashboard organizes project controls, field coordination, compliance, and communication signals for the selected project.
```

Use module state copy like:

```text
Planned for a future release. This module is not active for the selected project.
```

Never use:

```text
TODO
Not implemented
Placeholder
Mock
Fixture
```

## Tests

Add/update tests proving:

- router renders every primary tab dashboard;
- every dashboard renders at least one bento direct-child card;
- active module context appears for selected module;
- active module context uses label, not ID;
- Project Home remains reachable;
- Document Control remains reachable and maps to existing document surface;
- no forbidden developer copy renders;
- active tabpanel marker remains on shell `main`.

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

- dashboard render strategy per primary tab;
- files changed;
- tests added/updated;
- validation results;
- confirmation that existing surfaces were not deleted.
