# 01 — Repo-Truth File Inspection Map

## Purpose

This map tells the local agent which files matter and why.

## Core Runtime Files

| Path | Why Inspect |
|---|---|
| `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx` | Main card orchestration and current view-state rendering. |
| `apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts` | Completed lazy-fetch/cache behavior; retry enhancement target. |
| `apps/my-dashboard/src/state/myWorkCardViewModel.ts` | Copy, list mapping, summary selectors, metadata fallback logic. |
| `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx` | Current span overrides and row composition; preserve unless contradiction exists. |

## Shared Layout Files

| Path | Why Inspect |
|---|---|
| `apps/my-dashboard/src/layout/MyWorkBentoGrid.module.css` | Height/stretch posture. |
| `apps/my-dashboard/src/layout/MyWorkCard.tsx` | Remove `titleContent`; preserve generic card semantics. |
| `apps/my-dashboard/src/layout/MyWorkCard.module.css` | Remove Adobe-specific CSS and heading accommodations no longer needed. |
| `apps/my-dashboard/src/layout/myWorkFootprints.ts` | Span logic; inspect but do not alter in this package. |
| `apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts` | Responsive modes available to target. |

## Runtime Client Files — Read Only

| Path | Why Inspect |
|---|---|
| `apps/my-dashboard/src/runtime/MyWorkReadModelClientProvider.tsx` | Preserve seam; avoid accidental changes. |
| `apps/my-dashboard/src/api/myWorkReadModelClient.ts` | Confirm recent completions contract. |
| `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts` | Read-only awareness of fallback behavior; do not edit. |
| `apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts` | Read-only awareness of fixtures. |

## Test Files

| Path | Why Inspect |
|---|---|
| `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx` | Expand toggle/status/row/state tests. |
| `apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.test.tsx` | Add retry coverage. |
| `apps/my-dashboard/src/layout/MyWorkCard.test.tsx` | Remove titleContent test and preserve heading semantics. |
| `apps/my-dashboard/src/layout/MyWorkBentoGrid.test.tsx` | Inspect only if grid alignment behavior needs test posture. |

## Package/Dependency Truth — Read Only

| Path | Why Inspect |
|---|---|
| `apps/my-dashboard/package.json` | Confirm no new direct dependency is added. |
| `packages/ui-kit/package.json` | Confirm premium stack presence is already centralized in ui-kit. |

## Docs to Create in Prompt 08

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/01_Implementation_Closeout.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/02_Validation_And_Evidence_Register.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/03_Reaudit_Scorecard.md
```
