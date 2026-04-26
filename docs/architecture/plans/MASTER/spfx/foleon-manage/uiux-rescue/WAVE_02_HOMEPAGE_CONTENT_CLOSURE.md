# Wave 02 — Homepage Foleon Content tab (lane-first UX) — closure

Date: 2026-04-26  
Package: `@hbc/spfx-hb-intel-foleon` (no `package.json` / manifest version bump; surgical UI-only change per wave policy).

## Summary

Homepage **Foleon Content** is **lane-first**: three **lane summary** cards and a **selected-lane workspace** sit **above** a secondary **content library** (`ManageRegistryPanel` unchanged internally). `buildFoleonLaneViewModels` remains the source of truth for lane state. Default lane card faces avoid reader keys, placement keys, publication IDs, raw readiness codes, API/registry jargon, tokens, GUIDs, and backend URLs. Internal state **`Config Incomplete`** maps to user-facing **“Needs setup”** only. Lane **`readConfigReady`** now requires `hasLoadedReadPath` (wired from **`managerReadPathProven`**) **and** contract `listBindingsReady` / `readPathReady` when present, so consent-degraded / token-degraded shells do not show falsely “ready” lanes when the manager read path is not proven.

Editor, placement, validate, publish, suppress, sync, and registry list behaviors are preserved. **Lane selection** sets `selectedLane` and `selectedId` to active → staged → null for an empty lane. **Library selection** updates both. Empty lanes keep a stable workspace with a plain setup message. Write-disable reasons use **`plainLanguageWriteBlockReason`** in headers/toolbars.

## Repo-truth files inspected

- `apps/hb-intel-foleon/src/pages/manage/manageLaneViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`

## Files changed

- `apps/hb-intel-foleon/src/pages/manage/manageLaneViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageWritePathMessage.ts` (new)
- `apps/hb-intel-foleon/src/pages/manage/ContentLibraryPanel.tsx` (new)
- `apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx` (new)
- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/ManageShellHeader.tsx`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`
- `docs/architecture/plans/MASTER/spfx/foleon-manage/uiux-rescue/WAVE_02_HOMEPAGE_CONTENT_CLOSURE.md` (this file)

## UI/UX changes

- Lane summary row: plain-language titles, publish-readiness one-liner, **Needs setup** for config-incomplete lanes.
- Selected lane workspace: header, empty state, publish checklist from `buildPublishChecklist`, **Open Foleon**, editor and placement panels with `writeBlockReason`.
- Content library section below workspace.
- Orchestrator: `selectedLane` + `selectedId`; `resolveInitialSelection` via `pickDefaultLaneSelection` with fallback to first sorted homepage record; `selectLane` / `selectRegistryRecord`; `selected` resolves by `selectedId` only (no `content[0]` fallback).
- `managerReadPathProven` passed into tab and lane VM `hasLoadedReadPath` for aligned degraded UX.

## Architecture guardrails preserved

- Registry-first model; management API usage unchanged.
- `ManageRegistryPanel`, editor, placement panels unchanged in core behavior.
- No new backend routes.

## Tests added/updated

- Homepage lane summary: three `listitem` lane cards, no raw keys on card faces, lane switch, plain-language write block, no PATCH when Save disabled, **Needs setup** in API-consent-degraded shell test.

## Commands run and results

- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types` — pass  
- `pnpm --filter @hbc/spfx-hb-intel-foleon test` — pass (296 tests)  
- `pnpm --filter @hbc/spfx-hb-intel-foleon lint` — pass (0 errors; existing package warnings)  
- `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate` — pass (498 checks)  

Runtime bridge script not run (no `apps/hb-intel-foleon/src/runtime/**` edits).

## Screenshots / hosted validation

Not run in this session.

## Limitations

- `HbcButton` props: tooltips on header actions use a wrapping `<span title>` where `title` is not on the button directly.

## Commit message

```text
SPFx Foleon Manager: redesign homepage content lanes
```
