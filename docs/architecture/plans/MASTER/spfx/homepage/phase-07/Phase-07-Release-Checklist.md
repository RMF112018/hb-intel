# Phase 07 Release Checklist

Repeatable pre-release and post-release checklist for the SharePoint homepage ecosystem.

## Lane A — `apps/hb-webparts` (`@hbc/spfx-hb-webparts`)

### Pre-build checks

- [ ] `pnpm --filter @hbc/spfx-hb-webparts check-types` passes
- [ ] `pnpm --filter @hbc/spfx-hb-webparts lint` passes (includes `no-restricted-imports` guardrail)
- [ ] No `@hbc/ui-kit` root or `@hbc/ui-kit/app-shell` imports in source (`importDiscipline.test.ts`)
- [ ] All 10 production webpart manifest IDs wired in `mount.tsx` (`mountDispatch.test.ts`)
- [ ] Excluded scaffold manifest ID (`535f5a17-...`) NOT referenced in `mount.tsx`

### Build output checks

- [ ] `pnpm --filter @hbc/spfx-hb-webparts build` passes
- [ ] `dist/hb-webparts-app.js` emitted — JS under 400 KB hard budget
- [ ] `dist/spfx-hb-webparts.css` emitted — CSS under 10 KB hard budget
- [ ] `pnpm --filter @hbc/spfx-hb-webparts test` passes — all tests green

### Solution metadata checks

- [ ] `config/package-solution.json` version is correct 4-part format (`X.X.X.X`)
- [ ] Solution ID `39b8f2ea-59bd-45b7-b4ec-b590b316833b` unchanged
- [ ] Feature ID `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96` unchanged
- [ ] Feature `componentIds` will list all 10 production manifest IDs (set by build tool)

### `.sppkg` packaging checks (when building deployment artifact)

- [ ] `npx tsx tools/build-spfx-package.ts --domain hb-webparts` succeeds
- [ ] 10 per-webpart shell entry files generated with patched `define()` names
- [ ] Each manifest's `entryModuleId` matches its shell entry file's internal `define()` name
- [ ] No neutral shell ID (`9a2f7f61-...`) in any per-webpart manifest's `scriptResources`
- [ ] `hb-webparts-shim-proof.json` has 10 populated entries
- [ ] `.sppkg` file size is reasonable (~100-150 KB)

### Documentation reconciliation

- [ ] `apps/hb-webparts/README.md` reflects current architecture
- [ ] Bundle sizes in `Phase-07-Bundle-Budget-Baseline.md` match actual build output
- [ ] No stale completion notes contradict current behavior

---

## Lane B — `apps/hb-shell-extension` (`@hbc/spfx-hb-shell-extension`)

### Pre-build checks

- [ ] `pnpm --filter @hbc/spfx-hb-shell-extension check-types` passes
- [ ] `pnpm --filter @hbc/spfx-hb-shell-extension lint` passes (includes `no-restricted-imports` guardrail)
- [ ] No `@hbc/ui-kit` root or `@hbc/ui-kit/homepage` imports in source

### Build output checks

- [ ] `pnpm --filter @hbc/spfx-hb-shell-extension build` passes
- [ ] `dist/hb-shell-extension-app.js` emitted — JS under 300 KB hard budget
- [ ] `dist/spfx-hb-shell-extension.css` emitted — CSS under 10 KB hard budget
- [ ] `pnpm --filter @hbc/spfx-hb-shell-extension test` passes — all tests green

### Solution metadata checks

- [ ] `config/package-solution.json` version is correct 4-part format
- [ ] Solution ID `a7c3e1f2-8b4d-4a6e-9f12-3c5d7e8a9b01` unchanged
- [ ] Feature ID `b8d4f2a3-9c5e-4b7f-a012-4d6e8f9a0b12` unchanged

### Runtime contract checks

- [ ] `mountTop(null)` safe no-op (tested)
- [ ] `mountBottom(null)` safe no-op (tested)
- [ ] Top and bottom placeholders can render independently

### Documentation reconciliation

- [ ] `apps/hb-shell-extension/README.md` reflects current architecture
- [ ] Bundle sizes match actual build output

---

## Post-deployment runtime smoke checks

### Lane A (after App Catalog upload)

- [ ] Each webpart renders when placed on a page via the webpart gallery
- [ ] `[HB-Intel ShellWebPart] Module resolved` appears in console for each webpart
- [ ] Shell entry files (`shell-entry-*.js`) load with 200 OK
- [ ] IIFE bundle (`hb-webparts-app-*.js`) loads with 200 OK
- [ ] No `Could not load ... in require` errors in console
- [ ] Empty/loading/stale states render correctly when no content is configured

### Lane B (after App Catalog upload)

- [ ] Top placeholder renders ribbon and alert band when configured
- [ ] Bottom placeholder renders footer rail and support band when configured
- [ ] Placeholders render nothing gracefully when unconfigured
- [ ] No JavaScript errors in console from shell-extension code
