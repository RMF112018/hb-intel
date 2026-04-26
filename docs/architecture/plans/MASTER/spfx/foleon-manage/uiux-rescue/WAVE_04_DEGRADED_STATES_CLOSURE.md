# Wave 04 — Degraded states and diagnostics — closure

Date: 2026-04-26  
Package: `@hbc/spfx-hb-intel-foleon` (no backend routes, runtime bridge, registry architecture, package manifests, or four-part version changes per wave policy.)

## Summary

Polished **degraded** and **limited-mode** experiences for the Manager shell: **primary UI** no longer shows raw `preflightBlocker.message` strings; copy is routed through **`manageDegradedCopy`** / **`manageWritePathMessage`** helpers. The existing **token-acquisition / consent** path remains **degraded-ready** (shell loads with structured API banner + collapsible technical line with **code only**).

**Homepage Foleon Content** shows a compact **Limited mode** status when the read path is not proven or consent blocks API-backed reads. **Write actions** (save, validate, publish, suppress, placement create, sync) use **plain-language** disabled context; **`HbcButton`** now forwards **`aria-label`** and **`aria-describedby`** so visible labels stay the control names while reasons attach to stable hint elements (no raw tokens, OAuth fragments, URLs, API resources, GUIDs, or list/registry keys in primary surfaces).

**Lane cards** include short **consumer hints** for Live, Preview, Blocked, Empty, and Needs setup via **`laneStateConsumerHint`**. **Config diagnostics** stay collapsed/redacted by default; when diagnostics are expanded and **blocker codes** exist, a one-line **“what this proof is for”** note lists **codes only**; **Copy redacted proof** remains the only full JSON clipboard path.

## Repo-truth files inspected

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageDegradedCopy.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageWritePathMessage.ts`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `packages/ui-kit/src/HbcButton/index.tsx`

## Files changed

- `apps/hb-intel-foleon/src/pages/manage/manageDegradedCopy.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageWritePathMessage.ts`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageLaneViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagePlacementPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageShellHeader.tsx`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/__tests__/manageDegradedCopy.test.ts`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`
- `packages/ui-kit/src/HbcButton/types.ts`
- `packages/ui-kit/src/HbcButton/index.tsx`
- `docs/architecture/plans/MASTER/spfx/foleon-manage/uiux-rescue/WAVE_04_DEGRADED_STATES_CLOSURE.md` (this file)

## Architecture guardrails preserved

- No new backend routes; **`src/runtime/**`** and registry packaging unchanged.
- **Degraded-ready** widening limited to the existing **token-acquisition-failed** consent path; other blockers are not promoted to degraded-ready without separate proof.
- **`managerReadPathProven`** continues to gate hosted writes and limited-mode messaging.

## Tests added/updated

- Limited mode + consent degraded shell expectations (API banner, lane summary, sync hint paragraph).
- Raw preflight / JWT-like strings absent from primary API banner.
- Lane microcopy for a **live** lane (archive group supplied so the lane is not Blocked).
- Publish-disabled **priority**: workflow validation messaging when **Save** is allowed.
- Sync / placement / publish disabled context via **`aria-describedby`** and stable hint element text.
- Expanded diagnostics **blocker-code** support note (codes only, no raw consent strings).
- `manageDegradedCopy` unit coverage for publish-disabled reason ordering.

## Commands run and results

- `pnpm --filter @hbc/spfx-hb-intel-foleon lint` — pass (0 errors; existing package warnings only)  
- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types` — pass  
- `pnpm --filter @hbc/spfx-hb-intel-foleon test` — pass (305 tests)  
- `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate` — pass (498 checks)  
- `pnpm exec vitest run src/HbcButton/__tests__/HbcButton.test.tsx` (from `packages/ui-kit`) — pass (10 tests)

## Commit message

```text
SPFx Foleon Manager: polish degraded states and diagnostics
```
