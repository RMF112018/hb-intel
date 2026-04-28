# Fresh Code-Agent Prompt — HB Intel Foleon Manager

You are working in the live `hb-intel` repository. Use `main` as repo truth unless the user provides another branch.

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth or resolve a contradiction.

Preserve security and runtime boundaries:
- Do not weaken `withAuth`.
- Do not weaken route authorization.
- Do not weaken token validation.
- Do not weaken safe-config gates.
- Do not leak secrets or raw diagnostics into the browser.
- Preserve registry-first runtime configuration.
- Preserve redacted diagnostics.
- Preserve package/runtime proof.

Required validation commands for final proof:

```bash
git status --short
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Objective

Rebuild the Manager shell from a diagnostics-forward page into a content operations console. This wave should establish the IA, command header, status summary, primary navigation, and orchestration seams without implementing the full inbox/workflow yet.

## Files to Inspect

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageShellHeader.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageTabs.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/manageFields.module.css`
- `apps/hb-intel-foleon/src/pages/manage/foleonManageTokens.css`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`

## Files Likely to Change

- `ManageOrchestrator.tsx`
- `ManageShellHeader.tsx`
- `ManageTabs.tsx`
- `manageShell.module.css`
- `manageFields.module.css`

## New Files to Consider

- `ManageOperationsShell.tsx`
- `CommandHeader.tsx`
- `StatusSummaryStrip.tsx`
- `ManagerPrimaryNav.tsx`
- `managerOperationsViewModel.ts`

## Guardrails

- Do not change backend routes.
- Do not change package version in this wave unless packaging policy requires it.
- Do not remove diagnostics; subordinate them.
- Do not use fake SharePoint shell chrome.
- Do not leave dead buttons.

## Steps

1. Split the existing header into a task-oriented `CommandHeader`.
2. Group actions:
   - Sync from Foleon
   - Review new content
   - Manage placements
   - Open Foleon
   - Admin diagnostics
3. Add a `StatusSummaryStrip` that summarizes new/unassigned/blocked/live/staged counts.
4. Replace tab labels with product-language navigation:
   - Content Operations
   - Lane Board
   - Preview
   - Admin / Config
5. Keep current content/config rendering behind the new shell until later waves replace internals.
6. Add tests for header copy, disabled sync reason, admin navigation, and status summary.

## Acceptance Criteria

- First screen reads as a content operations console.
- Technical diagnostics are no longer the dominant first impression.
- Sync blocked state has a plain-language reason and next action.
- Header actions are grouped by task, not backend route.
- Existing readiness and auth behavior remains intact.

## Commit Message

`SPFx Foleon Manager: rebuild command shell for content operations`
