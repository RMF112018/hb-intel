# hb-webparts LoaderConfig Emission Remediation Summary

## Root cause

The authoritative multi-manifest emission logic in `tools/build-spfx-package.ts` still emitted per-webpart shim assets with stable names (`shell-entry-<webpart-id>.js`).

Even when package internals were structurally correct, stable shim URLs made stale browser/CDN/App Catalog bytes plausible at SharePoint loader time, including the observed `Could not load 39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0 in require` symptom.

## Authoritative source of the emission defect

- `tools/build-spfx-package.ts`
  - per-webpart shim filename generation used stable names
  - manifest rewrite mapped `scriptResources[entryModuleId]` to those stable shim paths
  - package verification did not fail on legacy non-versioned shim path patterns

## Remediation applied

- Preserved neutral shared shell module identity for `hb-webparts`:
  - `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`
- Replaced stable shim filenames with deterministic content-hashed names:
  - `shell-entry-<webpart-id>-<sha256-8>.js`
- Shim AMD payload contract remains unchanged:
  - `define("<webpart-id>_1.0.0", ["9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"], ...)`
- Manifest composition now maps each target webpart `entryModuleId` to its own hashed shim path.
- Packaging verification for `hb-webparts` now fails on any of the following:
  - missing target manifest
  - `entryModuleId` mismatch
  - missing/mismatched `scriptResources[entryModuleId]`
  - missing packaged shim asset
  - shim asset missing expected AMD `define(...)`
  - shim asset missing expected dependency on neutral base module identity
  - any packaged manifest still referencing legacy `shell-entry-<webpart-id>.js`
- Packaging emits machine-readable anti-staleness proof output:
  - `dist/sppkg/hb-webparts-shim-proof.json`
  - includes emitted local shim filenames, packaged manifest-to-shim mapping, and neutral base module identity

## Files changed

- `tools/build-spfx-package.ts`
- `apps/hb-webparts/config/package-solution.json`
- `docs/architecture/plans/MASTER/spfx/webparts/00_Implementation_Summary.md`
- `docs/architecture/plans/MASTER/spfx/webparts/README.md`
- `docs/architecture/plans/MASTER/spfx/webparts/hb-webparts-loaderconfig-emission-remediation-summary.md`
- `docs/architecture/plans/MASTER/spfx/webparts/hb-webparts-loaderconfig-emission-verification.md`

## Old vs new packaged behavior

### Shim path emission
- Old: `shell-entry-<webpart-id>.js` (stable URL)
- New: `shell-entry-<webpart-id>-<content-hash>.js` (cache-busting URL on shim-content change)

### `entryModuleId` + `scriptResources`
- Old: per-webpart mapping present but shim URL was stable.
- New: per-webpart mapping present and URL is content-versioned.

### Verification posture
- Old: archive verification focused on structure + ID presence.
- New: archive verification enforces manifest↔shim↔AMD-define↔neutral-dependency integrity and rejects legacy shim path pattern.

## Rebuild path used

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`
- `npx tsx tools/build-spfx-package.ts --domain hb-webparts`

## Packaged verification highlights

- Rebuilt artifact: `dist/sppkg/hb-webparts.sppkg`
- Packaged neutral shell asset defines:
  - `define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)`
- Packaged per-webpart shim assets define `<webpart-id>_1.0.0` and depend only on neutral shell module identity.
- Legacy non-versioned shim references are explicitly rejected by verification.
- Version bump applied:
  - `solution.version`: `1.0.0.12`
  - `feature.version`: `1.0.0.12`

## Operator live validation checklist (SharePoint)

1. Upload/deploy `hb-webparts.sppkg` and open a page with **HB Hero Banner**.
2. In browser DevTools Network, filter for `shell-entry-39762a4d` and confirm requested filename matches `shell-entry-39762a4d-c7fd-44a6-a11e-4f8de9f5778d-<hash>.js` (hashed suffix present).
3. Open the response body and verify it contains:
   - `define("39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0"`
   - dependency `"9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"`
4. Confirm console no longer reports `Could not load 39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0 in require`.
5. Distinguish stale-asset state vs code defect:
   - stale state: live requested shim filename does not match new hashed filename from `hb-webparts-shim-proof.json`
   - code defect: live shim filename matches package proof but console still fails require resolution

## Secondary warnings

`Card` composition warnings remain separate follow-up work and are not part of this loader metadata remediation scope.

## Remaining risks

- Browser runtime validation still depends on tenant deployment and cannot be fully proven in this local build environment alone.
- `BACKEND_MODE` remains unset by default in local packaging unless explicitly provided by CI/CD.
