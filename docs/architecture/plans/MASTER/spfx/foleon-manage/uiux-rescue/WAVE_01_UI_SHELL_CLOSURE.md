# Wave 01 — UI shell and information architecture — closure

Date: 2026-04-26  
Package: `@hbc/spfx-hb-intel-foleon` (no `package.json` / manifest version bump; surgical UI-only change per wave policy).

## Summary

Repositioned the Manage surface as **Foleon Manager** with Marketing Operations copy, compact header status chips, grouped **Sync content** (Docs + Projects preserved), **Open Foleon (site)** when an HTTPS allowlisted viewer origin exists, **View diagnostics** (switches to Config and opens the diagnostics disclosure), and moved **Sync run history** out of the default content layout into Config under the diagnostics `<details>`. Blocked/error states use Foleon Manager titles with issue codes in a **Technical details** disclosure.

## Repo-truth files inspected

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageShellHeader.tsx`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageConfigViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/components/FoleonStates.tsx`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`

## Files changed

- `apps/hb-intel-foleon/src/pages/manage/manageHeaderStatusModel.ts` (new)
- `apps/hb-intel-foleon/src/pages/manage/ManageShellHeader.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/manageConfigViewModel.ts`
- `apps/hb-intel-foleon/src/components/FoleonStates.tsx`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`
- `docs/architecture/plans/MASTER/spfx/foleon-manage/uiux-rescue/WAVE_01_UI_SHELL_CLOSURE.md` (this file)

## UI/UX changes

- Primary title **Foleon Manager**; eyebrow **Marketing Operations**; subtitle per wave spec.
- Header chip row: Content lanes, API connection, Registry status, Last sync (plain language).
- **Sync content** `<fieldset>` with **Sync Docs** and **Sync Projects** (unchanged handlers).
- **Open Foleon (site)** opens the first configured `https://` entry from `originPolicy.allowedOrigins`; if none, disabled label with short reason (no URLs in UI).
- **View diagnostics** → Config tab + diagnostics `<details open>`.
- **ManageSyncPanel** only under Config diagnostics (with redacted JSON).
- Readiness cards: label + status separated visually; `withBlocker` maps blockers by card label to avoid cross-matching token-related codes.

## Architecture guardrails preserved

- Registry-first model unchanged; split `foleonReadiness` booleans unchanged.
- Consent-degraded path still uses `ready` + status banner + limited actions.
- No new backend routes; no raw URLs/GUIDs/tokens in primary shell.
- Existing content workflows and API ownership unchanged.

## Tests added/updated

- Default tab, Foleon Manager title, chips, absence of glued `TOKEN ACQUISITIONBlocked` on content tab, sync history only after Config + diagnostics, View diagnostics behavior, consent shell asserts Manager status list, blocked alert copy, manage shell / preview tests adjusted for sync panel location.

## Commands run and results

- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types` — pass  
- `pnpm --filter @hbc/spfx-hb-intel-foleon test` — pass (293 tests)  
- `pnpm --filter @hbc/spfx-hb-intel-foleon lint` — pass (warnings only, pre-existing across package)  
- `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate` — pass  

Runtime bridge script not run (no `apps/hb-intel-foleon/src/runtime/**` edits).

## Screenshots / hosted validation

Not run in this session.

## Limitations

- `HbcButton` does not forward `aria-label`; header action is labeled **Open Foleon (site)** to distinguish from lane **Open Foleon** (publication).
- Lint reports many existing token/style warnings in the Foleon app; no new errors introduced.

## Commit message

```text
SPFx Foleon Manager: rescue shell and information architecture
```
