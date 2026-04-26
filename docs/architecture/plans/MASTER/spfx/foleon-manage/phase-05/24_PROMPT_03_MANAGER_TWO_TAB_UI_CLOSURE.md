# Prompt 03 Closure — Registry-Aware Foleon Manager Two-Tab UI

## Summary

Implemented the first-pass two-tab Foleon Manager shell with `Homepage Foleon Content` and `Config` tabs. The implementation preserves the existing backend-backed content, placement, validation, publish, suppress, and sync workflows while adding lane-oriented homepage status and a redacted registry-aware Config surface.

## Changed Files

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageTabs.tsx`
- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageLaneViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/manageConfigViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagePlacementPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageRegistryPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageShellHeader.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`
- Foleon package/version authority files updated to `1.0.26.0`.

## UI Structure Implemented

The Manager now opens on `Homepage Foleon Content` and exposes a second `Config` tab. The first pass reuses the existing registry table, content editor, placement panel, sync history, and workflow actions rather than introducing a new content-management data model.

## Registry-Aware Config Behavior

The Config tab displays split runtime readiness cards, registry source status, config source rows, list binding status, backend/API/auth status, origin policy, package governance, and a redacted admin diagnostics section. Normal UI shows configured/missing/blocked/source state only; raw backend URLs, API resources, list GUIDs, tokens, and secrets are not rendered.

## Readiness States Preserved

The UI keeps separate states for registry, list bindings, backend URL, API resource, token provider, token acquisition, backend safe config, route authorization, read path, write path, and sync path. `writePathReady=false` remains explicit and is shown as blocked until backend safe-config and route authorization are proven.

## Tests Added/Updated

Updated `ManagePage.test.tsx` to cover the two-tab shell, default selected tab, three homepage lane cards, Config readiness states, source labels, apiBaseUrl-only write blocking, backend safe-config/route authorization write blocking, and redaction of unsafe raw values.

## Commands Run

- `pnpm --filter @hbc/spfx-hb-intel-foleon test -- --run src/pages/__tests__/ManagePage.test.tsx`
- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types`
- `pnpm --filter @hbc/spfx-hb-intel-foleon lint`
- `pnpm --filter @hbc/spfx-hb-intel-foleon test`
- `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate`
- `pnpm --filter @hbc/spfx-hb-intel-foleon build`
- `pnpm tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts`
- `pnpm exec tsc -p tsconfig.json --noEmit` from `tools/spfx-shell`
- `pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 -SiteUrl https://hedrickbrotherscom.sharepoint.com/sites/HBCentral -AppId 08c399eb-a394-4087-b859-659d493f8dc7 -Tenant hedrickbrothers.com -EnvironmentKey Production`
- `pnpm --filter @hbc/spfx-hb-intel-foleon package:proof`
- `pnpm build` from `tools/spfx-shell`

## Validation Results

- Lint completed with existing warnings and zero errors.
- TypeScript checks passed.
- Foleon app unit tests passed: 27 files, 283 tests.
- Foleon schema validation passed: 498 checks.
- Foleon app Vite build passed.
- Runtime config bridge validation passed.
- SPFx shell source TypeScript check passed.
- Platform configuration registry validation passed with zero failures and zero warnings.
- Package proof did not pass because the local `.sppkg` is stale at `1.0.23.0`; regeneration requires the SPFx gulp package path under Node 18.
- SPFx shell gulp build did not run under Node 22 because SPFx 1.18 rejects Node versions outside `>=18.17.1 <19.0.0`.

## Known Node/SPFx Environment Limitations

The local environment uses Node 22. SPFx 1.18 build/package tooling requires Node `>=18.17.1 <19.0.0`, so final gulp bundle/package proof must be run under Node 18 before hosted deployment. Node 22-compatible TypeScript, unit, schema, runtime bridge, and registry validation checks remain valid for source closure.

## Manual Hosted Validation Still Required

Validate the hosted SharePoint page with the deployed `1.0.26.0` package to confirm registry fetch, SPFx token acquisition, backend audience acceptance, read-route authorization, Config tab redaction, and disabled write/sync states in tenant context.

## Commit Message

`SPFx Foleon 1.0.26.0: add registry-aware manager tabs`
