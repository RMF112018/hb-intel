# Wave 03 — Config tab admin console — closure

Date: 2026-04-26  
Package: `@hbc/spfx-hb-intel-foleon` (no `package.json` / manifest / four-part version bump per wave policy; UI-only Config redesign.)

## Summary

Redesigned the **Config** tab as a **task-oriented admin console**: **Required admin actions** first (ranked by operational impact), then **System health** with **six grouped regions** that keep **split readiness** (API tokens, backend endpoint, safe-config probe, API identity, registry, lists, route authorization, read access, publishing/write access, sync access, origins, and governance) as **separate lines**—never merged into a single combined path status.

**Diagnostics** is toggled with an explicit **Show / Hide** control wired to the existing orchestrator `diagnosticsOpen` state (same contract as **View diagnostics** in the shell header). When expanded, diagnostics include **sync run history**, **Copy redacted proof** (clipboard JSON from `buildSafeDiagnostics`), nested disclosures for **config source table** (technical keys), **registry technical status**, **SharePoint list internal names**, and **origin / packaging / redacted JSON**. When collapsed, that body is **not mounted**, so raw technical strings are absent from the DOM for primary Config checks.

The **consent-required** callout is **short**; detailed consent guidance lives in **Required admin actions** to avoid duplication.

## Repo-truth files inspected

- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageConfigViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`

## Files changed

- `apps/hb-intel-foleon/src/pages/manage/manageConfigViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`
- `docs/architecture/plans/MASTER/spfx/foleon-manage/uiux-rescue/WAVE_03_CONFIG_ADMIN_CONSOLE_CLOSURE.md` (this file)

## UI/UX changes

- Required admin actions: ordered list from blockers + readiness gaps; consent / token acquisition prioritized above list bindings and lower layers.
- System health: six `role="region"` groups with plain-language labels and per-line `Valid` / `Blocked` / `Warning` states.
- Diagnostics: Show/Hide button with `aria-expanded`; nested `<details>` for technical proof bundles; copy control for redacted JSON only inside expanded diagnostics.

## Architecture guardrails preserved

- Registry-first model unchanged; split `foleonReadiness` booleans unchanged in contract and `buildSafeDiagnostics`.
- Consent-degraded **ready** shell unchanged; `managerReadPathProven` readiness gating in Config unchanged.
- No new backend routes; `FoleonManagementApi` and `src/runtime/**` untouched.
- Redaction policy preserved for clipboard payload; no raw URLs, API resources, GUIDs, or tokens in primary Config UI.

## Tests added/updated

- Six health regions + split labels (read / publishing / sync separate); technical source table opened only after diagnostics + nested disclosure.
- Primary tabpanel excludes raw URLs, GUIDs, `FoleonContentRegistryListGuid`, `HB_Foleon`, and `Config key` when diagnostics collapsed.
- Action ranking: consent-related action before list-binding action.
- Diagnostics mount behavior and **Copy redacted proof** clipboard payload shape.
- View diagnostics: `aria-expanded="true"` on Hide toggle when opened from header.

## Commands run and results

- `pnpm --filter @hbc/spfx-hb-intel-foleon test` — pass (299 tests)  
- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types` — pass  
- `pnpm --filter @hbc/spfx-hb-intel-foleon lint` — pass (0 errors; existing package warnings)  
- `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate` — pass (498 checks)  

Runtime bridge script not run (`src/runtime/**` unchanged).

## Screenshots / hosted validation

Not run in this session.

## Limitations

- Outer diagnostics use a **button toggle** instead of native `<details>` for the shell disclosure so React state, jsdom, and the **View diagnostics** flow stay aligned; inner proof bundles remain native `<details>`.

## Commit message

```text
SPFx Foleon Manager: redesign config admin console
```
