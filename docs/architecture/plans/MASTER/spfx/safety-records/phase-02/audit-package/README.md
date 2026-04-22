# Safety UI/UX Audit Package — Repo-Truth Deep Audit (v2)

## Scope
Deep UI/UX audit of the Safety / Safety Record Keeping SPFx surface in `RMF112018/hb-intel` `main`, using the live repo files plus hosted screenshots supplied in-session.

## Governing authorities
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/responsive-failure-catalog.md`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/WorkspacePageShell.md`

## Core repo seams audited
- `apps/safety/src/App.tsx`
- `apps/safety/src/router/root-route.tsx`
- `apps/safety/src/router/routes.ts`
- `apps/safety/src/pages/*`
- `apps/safety/src/webpart.css`
- `apps/safety/src/webparts/safety/*`
- `apps/safety/config/package-solution.json`
- `packages/shell/src/ShellLayout/index.tsx`
- `packages/shell/src/HeaderBar/index.tsx`
- `packages/shell/src/BackToProjectHub/index.tsx`
- `packages/ui-kit/src/WorkspacePageShell/index.tsx`
- `packages/ui-kit/src/layouts/DashboardLayout.tsx`
- `packages/ui-kit/src/layouts/ListLayout.tsx`
- `packages/features/safety/README.md`
- `e2e/webparts/safety.spec.ts`
- `apps/safety/src/test/router.test.ts`

## What makes this package deeper than the prior pass
This version is based on actual source inspection and ties each major UX failure to:
1. the exact architectural seam that produces it,
2. the governing doctrine/checklist item it violates,
3. the concrete file(s) the local code agent needs to change.

## Output files
- `00-Safety-App-Audit-Summary.md`
- `01-Safety-Implementation-Map.md`
- `02-Checklist-Based-Assessment.md`
- `03-Scorecard-and-Flagship-Gap.md`
- `04-Safety-Gap-Register.md`
- `05-Prioritized-Enhancement-Plan.md`
- `06-Recommended-Implementation-Waves.md`
