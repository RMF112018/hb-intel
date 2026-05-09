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

Perform a repo-truth audit before implementation. Do not make runtime code changes in this prompt.

## Required Reads

Inspect at minimum:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/surfaces/
apps/project-control-center/src/tests/
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccCapabilities.ts
package.json
apps/project-control-center/package.json
playwright.pcc-live.config.ts
```

## Audit Questions

Answer these in your closeout:

1. What are the current active surface IDs?
2. What current tests protect navigation, tabpanel ownership, bento direct-child invariants, and surface smoke?
3. Does `PccHorizontalTabs.tsx` still contain a hardcoded Project Home dropdown?
4. Does `usePccShellState.ts` still lack `activeModuleId`?
5. Does `PccApp.tsx` still pass only `activeSurfaceId` to shell/router?
6. Does `PccSurfaceRouter.tsx` still route only existing MVP surface IDs?
7. Where does visible `Documents` copy appear?
8. Are there any existing components suitable for production-grade dashboard preview cards?
9. Are there existing false-affordance/no-anchor/no-writeback tests to extend?
10. Are there live evidence selectors that will need updating?

## Deliverable

Produce an audit report only. Do not edit files unless the user explicitly authorizes implementation.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```
