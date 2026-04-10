# PnP Ops Theme Provider Root Cause and Fix

## Root Cause Summary

PnP Operations rendered through the normal `hb-webparts` shell mount path (`ShellWebPart.render()` -> `mount()` -> `WEBPART_RENDERERS['9e2dd84a-a121-4fb3-a964-f43a94abf9fd']` -> `PnpOps`) without a surrounding `HbcThemeProvider`.

`PnpOps` imports `@hbc/ui-kit/homepage` primitives (`HbcBanner`, `HbcButton`, `HbcCard`, `HbcStatusBadge`) that rely on theme hooks (`useHbcTheme`). Without provider context, SharePoint runtime threw:

`[HBC] useHbcTheme must be called inside <HbcThemeProvider>.`

## Fix Implemented

Changed files:

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/__tests__/mountDispatch.test.ts`
- `apps/hb-webparts/src/webparts/pnp/PnpOpsWebPart.manifest.json`

Fix details:

- Added `HbcThemeProvider` at the `mount.tsx` render boundary (root-level, not per-webpart).
- Wrapped the normal webpart-render branch and the no-ID composition-preview branch in `HbcThemeProvider` with `forceTheme: 'light'`.
- Kept unknown-webpart-ID error rendering behavior unchanged.

Why this location is repo-consistent:

- Other SPFx surfaces in this repo establish theme context at mount/root boundaries (for example `apps/project-sites/src/mount.tsx`).
- Root-level provider ownership avoids inconsistent duplicated providers across individual webparts and guarantees the context before any UI-kit hook executes.

## Prompt-01 Guardrail

Added a structural regression test assertion in `mountDispatch.test.ts` to ensure `mount.tsx` continues to include:

- `HbcThemeProvider` wiring, and
- `forceTheme: 'light'` context for SharePoint-hosted rendering.

This catches accidental removal of provider wiring in this render seam before deployment.

## Follow-up Concerns

- This prompt addresses the immediate missing-theme-provider crash path.
- Tenant-hosted page runtime behavior should still be validated in subsequent prompts (packaging/deploy/runtime smoke), but the root context gap is now closed in code.
