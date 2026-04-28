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

Build the primary content inbox and lane control board so the Manager answers what content is available, what needs attention, and where it should be placed.

## Files to Inspect

- `HomepageFoleonContentTab.tsx`
- `SelectedLaneWorkspace.tsx`
- `ContentLibraryPanel.tsx`
- `manageLaneViewModel.ts`
- `manageMutationUtils.ts`
- `foleon-management.types.ts`
- `ManagePage.test.tsx`

## Files Likely to Change

- `HomepageFoleonContentTab.tsx`
- `SelectedLaneWorkspace.tsx`
- `manageLaneViewModel.ts`
- `manageShell.module.css`
- `manageFields.module.css`
- tests under `apps/hb-intel-foleon/src/pages/__tests__/`

## New Files to Consider

- `ContentInbox.tsx`
- `ContentInboxRow.tsx`
- `LaneControlBoard.tsx`
- `LaneDestinationCard.tsx`
- `contentOperationsViewModel.ts`

## Guardrails

- Do not invent content not present in source data except clearly marked sample/skeleton limited-mode content.
- Do not show raw backend/list terminology in the primary path.
- Keep raw diagnostics in Admin only.
- Preserve typed data contracts.

## Steps

1. Add `ContentInbox` as the primary queue.
2. Support filters:
   - New
   - Unassigned
   - Needs review
   - Blocked
   - Staged
   - Live
3. Add search and sort by title, doc ID, source date, lane, status.
4. Add `LaneControlBoard` with required lanes:
   - Project Spotlight
   - Company Pulse
   - Leadership Message
5. Each lane must show:
   - live now,
   - staged next,
   - display window,
   - readiness,
   - blockers,
   - next action,
   - preview CTA.
6. Add view models that convert DTOs into content-operations states.
7. Add tests for all major queue/lane states.

## Acceptance Criteria

- Content inbox is visible in the first meaningful viewport.
- Lanes are the primary editorial destination model, not a small rail.
- Unassigned and blocked content is obvious.
- Empty/OAuth limited mode still shows useful lane structure.
- No raw registry/list language appears in primary inbox/lane board.

## Commit Message

`SPFx Foleon Manager: add content inbox and lane control board`
