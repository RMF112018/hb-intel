# Prompt 01 — Hard Reset Feed Desk Shell

## Objective

Replace the current Foleon Manager IA with a news/feed-management IA.

Current IA to retire:

- Content Operations
- Lane Board
- Preview
- Admin / Config

New IA:

- Feed Desk
- Schedule
- Preview
- Admin

This is not a styling pass. Replace the product structure.

## Files to Inspect

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOperationsShell.tsx`
- `apps/hb-intel-foleon/src/pages/manage/CommandHeader.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagerPrimaryNav.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`

Do not re-read files still in your current context unless repo truth is unclear.

## Files Likely to Add

- `FoleonFeedManagerApp.tsx`
- `FeedManagerHeader.tsx`
- `FeedManagerNav.tsx`
- `feedManagerViewModel.ts`

## Files Likely to Retire

- `ManageOperationsShell.tsx`
- `CommandHeader.tsx`
- `ManagerPrimaryNav.tsx` or at least the current four-key implementation

## Required Implementation

1. Add `FeedManagerWorkspaceKey = 'feed-desk' | 'schedule' | 'preview' | 'admin'`.
2. Make `feed-desk` default.
3. Remove `Lane Board` from primary nav.
4. Replace header with:
   - title: `Foleon Feed Manager`
   - subtitle: `Place Foleon-produced content into HB Central feeds, schedule display windows, and validate what employees will see.`
   - one primary action based on state
   - one utility/menu area for secondary actions.
5. Keep all data/readiness/auth behavior owned by `ManageOrchestrator`.
6. Preserve sync workflow, safe-origin behavior, Admin diagnostics, and token degraded state.

## Guardrails

- Do not change backend routes.
- Do not invent content fields.
- Do not keep old IA labels for test convenience.
- Do not keep top-level `Lane Board`.

## Tests

- Feed Desk default renders.
- Nav has Feed Desk, Schedule, Preview, Admin.
- Nav does not have Lane Board.
- Header has one primary action and no command-button clutter.
- Admin diagnostics remains reachable.
- Token degraded state remains sanitized.

## Validation

Run full package validation after all prompts, not just after this step.

## Commit Message

`SPFx Foleon Manager: reset shell around feed desk IA`

