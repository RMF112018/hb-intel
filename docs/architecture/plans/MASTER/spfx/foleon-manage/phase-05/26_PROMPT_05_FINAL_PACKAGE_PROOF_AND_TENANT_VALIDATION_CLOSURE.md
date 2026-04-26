# Prompt 05 Closure - Final Package Proof and Tenant Validation

## Summary
Prompt 05 closes the registry-first Foleon Manager implementation at source/package proof level for `1.0.27.0`. The local package was rebuilt from current repo truth with the SPFx packaging toolchain selecting Node 18 automatically, package proof passed, and the Production platform registry validation passed with zero failures and zero warnings.

Hosted tenant proof is not claimed complete. The local agent cannot directly verify the browser tenant session or capture SharePoint screenshots, so hosted validation remains an open manual action using the runbook in `docs/how-to/foleon-final-package-tenant-validation-runbook.md`.

## Prior Wave Status
- Wave 00 - registry provisioned and validated: complete. Latest validation proof generated at `2026-04-26T10:06:39.9484670Z`.
- Wave 01 - registry reader/runtime bridge: complete by prior closure and runtime bridge validation.
- Wave 02 - Manager load/write-readiness: complete by prior closure; readiness states remain separated.
- Wave 03 - two-tab Manager UI: complete in `24_PROMPT_03_MANAGER_TWO_TAB_UI_CLOSURE.md`.
- Wave 04 - content workflow/validation: complete at commit `ef3a1d344`.

## Package Version
- Package version: `1.0.27.0`.
- Manifest ID: `2160edb3-675e-4451-92bb-8345f9d1c71e`.
- Product ID: `c23635f5-ab4d-44c2-96b5-2a2c90f4afc0`.
- Fresh package: `dist/sppkg/hb-intel-foleon.sppkg`.
- Package SHA-256: `99796bc45806fe552f27b1cc6ac64fefaf80148346e2fb1c6580746ffd77beb6`.
- App bundle: `hb-intel-foleon-app-af96935c.js`.
- App bundle SHA-256: `af96935c0839cba546f49c2ab53a2d499e5c96333f96dcc1a980805602fb9b05`.
- CSS bundle: `spfx-hb-intel-foleon-e3c32a1a.css`.
- Shell entry: `shell-entry-2160edb3-675e-4451-92bb-8345f9d1c71e-40d88148.js`.

## Registry Proof
- Registry list URL: `/sites/HBCentral/Lists/HB Platform Configuration Registry`.
- Full registry URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Platform%20Configuration%20Registry`.
- Registry list GUID: not printed by the validation proof; list existence, URL, read/write access, fields, indexes, and records were validated successfully.
- Field count: `54`.
- Index count: `12`.
- Seed record count: `14 / 14`.
- Duplicate active key check: `pass`.
- Secret hygiene check: `pass`.
- Read access: `True`.
- Write access: `True`.
- Failures: `0`.
- Warnings: `0`.
- Foleon values resolved: content registry list GUID, homepage placements list GUID, interaction events list GUID, sync runs list GUID, backend function URL, Foleon API base URL, and Foleon API resource.
- Foleon API resource validated with no `/.default` and no custom scope suffix.
- `FoleonClientSecret` remains a secret-reference record only.
- Blocked records: none reported.
- Missing records: none reported.
- Expired records: none reported.
- Duplicate records: none reported.
- Not-validated risk: hosted SPFx token acquisition and backend route authorization still require browser/tenant validation before claiming tenant write readiness.

Fresh proof artifacts:

- `docs/architecture/plans/MASTER/platform/config-registry/proof/platform-config-registry-validation-2026-04-26-100617.md`
- `docs/architecture/plans/MASTER/platform/config-registry/proof/platform-config-registry-validation-2026-04-26-100617.json`

## Package Proof
Completed locally:

- `npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon` passed.
- Packaging tool selected Node `v18.20.8` from `~/.nvm/versions/node/v18.20.8/bin/node`.
- SPFx bundle and package steps passed.
- `.sppkg` structure verified.
- Packaged bundle freshness verified.
- Packaged shell asset references `hb-intel-foleon-app-af96935c.js` and `__hbIntel_foleon`.
- `pnpm --filter @hbc/spfx-hb-intel-foleon package:proof` passed.
- Package proof verified solution version, feature version, toolbox entries, schema assets, package structure, source Feature Framework validation, lookup target validity, and uniqueness posture.

Generated package proof files under `dist/sppkg/` are local build artifacts and were not staged:

- `hb-intel-foleon-package-truth-proof.json`
- `hb-intel-foleon-shim-proof.json`
- `hb-intel-foleon.sppkg`

The package build rewrote derived shell files in `tools/spfx-shell/config/package-solution.json` and `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json` for the Foleon package target. Those files are build-time shell copies, not the Foleon source authorities, and are not staged in this proof commit.

## Hosted Proof
Hosted proof is open, not fabricated.

Required hosted page:

- `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Foleon-Manager.aspx`

Required browser evidence:

- Screenshot of Manager page load.
- Screenshot of `Homepage Foleon Content` tab.
- Screenshot of `Config` tab showing registry source and redacted values.
- Screenshot of each homepage lane state for Project Spotlight, Company Pulse, and Leadership Message.
- Screenshot or network proof of authorized content read/write behavior.
- Screenshot or network proof of unauthorized denial for a non-admin/non-marketing user.
- Console JSON from:

```js
JSON.stringify(window.__hbIntel_foleonRuntimeBindingProof, null, 2)
```

Expected hosted runtime fields are documented in `docs/how-to/foleon-final-package-tenant-validation-runbook.md`.

## Commands Run
- `pnpm --filter @hbc/spfx-hb-intel-foleon lint`
- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types`
- `pnpm --filter @hbc/spfx-hb-intel-foleon test`
- `pnpm --filter @hbc/spfx-hb-intel-foleon build`
- `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate`
- `pnpm --filter @hbc/functions check-types`
- `pnpm --filter @hbc/functions test`
- `npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts`
- `npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon`
- `pnpm --filter @hbc/spfx-hb-intel-foleon package:proof`
- `pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" -AppId "08c399eb-a394-4087-b859-659d493f8dc7" -EnvironmentKey "Production"`

## Validation Results
- Foleon lint passed with existing warnings only: `128 problems (0 errors, 128 warnings)`.
- Foleon typecheck passed.
- Foleon tests passed: `28` files, `290` tests.
- Foleon build passed.
- Foleon schema validation passed: `498` checks.
- Functions typecheck passed.
- Functions tests passed: `134` files, `2242` passed, `3` skipped.
- Runtime config bridge validation passed.
- Foleon package build passed under Node `v18.20.8`.
- Foleon package proof passed for `1.0.27.0`.
- Registry validation passed with `0` failures and `0` warnings.

## Known Unrelated Failures or Risks
- The working tree contained unrelated dirty docs and untracked/modified Foleon reader phase-04 files before Prompt 05 execution. They were not staged for this commit.
- No validation failures are attributed to Prompt 05 source/package proof.
- Hosted tenant proof is still manual because the agent has no direct browser session or screenshot capture for the SharePoint tenant.

## Rollback Notes
- Do not delete `HB Platform Configuration Registry` during rollback.
- To disable registry-driven Foleon config, set affected active Foleon Production records to `IsActive=False`, add `AdminNotes`, and rerun registry validation.
- To restore page/webpart overrides, edit the hosted SharePoint page, re-enter prior known-good explicit properties, publish the page, and confirm runtime proof config source.
- To redeploy the prior package, upload and approve the prior known-good `1.0.26.0` Foleon `.sppkg`, then hard-refresh the hosted page and confirm runtime proof `packageVersion`.
- Registry failures present as missing/blocked/invalid/expired/duplicate registry proof or Config tab registry failures.
- Package failures present as wrong package version, missing bundle marker, failed package proof, or stale app catalog deployment.
- Backend/auth failures present as token provider, token acquisition, backend safe config, route authorization, write path, or sync path readiness blockers despite healthy registry values.
- Homepage lane data failures present as Blocked/Empty/Preview lane states caused by content records, display windows, origin policy, placement mismatch, or duplicate active edition rules.

## Open Manual Actions
- Upload and approve `dist/sppkg/hb-intel-foleon.sppkg` in the SharePoint app catalog.
- Validate `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Foleon-Manager.aspx` after deployment.
- Capture hosted runtime binding proof JSON and screenshots listed above.
- Confirm unauthorized denial with a non-admin/non-marketing account.
- Confirm Project Spotlight, Company Pulse, and Leadership Message lane states on the hosted homepage.

## Commit Message
`SPFx Foleon 1.0.27.0: add final package and tenant proof`
