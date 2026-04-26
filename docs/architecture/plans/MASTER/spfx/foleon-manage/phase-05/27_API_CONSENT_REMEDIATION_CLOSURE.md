# API Consent Remediation Closure

## Summary
This remediation addresses the confirmed hosted token failure root cause: `AADSTS65001 / consent_required`. The Foleon SPFx package now declares the delegated API permission request required for SharePoint Online Web Client Extensibility to acquire a token for the backend API, and the Manager degrades into a read-only API approval required state when tenant approval is still missing.

## Root Cause
- Azure Entra app ID: `08c399eb-a394-4087-b859-659d493f8dc7`.
- API identifier URI: `api://08c399eb-a394-4087-b859-659d493f8dc7`.
- Exposed delegated scope: `access_as_user`.
- `preAuthorizedApplications`: empty.
- SharePoint Admin Center API access had no pending or approved request for this backend API.
- Foleon package metadata did not declare `webApiPermissionRequests`, so SharePoint had no tenant API request to approve.

## Files Changed
- `apps/hb-intel-foleon/config/package-solution.json`
- `apps/hb-intel-foleon/src/mount.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageConfigViewModel.ts`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`
- `apps/hb-intel-foleon/src/__tests__/foleonApiPermissionContract.test.ts`
- Foleon package version authority files updated to `1.0.28.0`.
- `docs/how-to/foleon-final-package-tenant-validation-runbook.md`

## Package Permission Request
The Foleon package now declares:

```json
"webApiPermissionRequests": [
  {
    "resource": "HB SharePoint Creator",
    "scope": "access_as_user"
  }
]
```

The package does not request `user_impersonation` for this API.

Package/version proof:

- Package version: `1.0.28.0`.
- Fresh package: `dist/sppkg/hb-intel-foleon.sppkg`.
- Package SHA-256: `f63cd3abaef020ea2cec875118fd71fb89b975d4843ba7a94203811b51905784`.
- App bundle: `hb-intel-foleon-app-de6323c4.js`.
- Package archive contains the permission strings in `AppManifest.xml`.

## Degraded Manager Behavior
- Token provider creation may succeed independently of token acquisition.
- Token acquisition failure is captured as readiness state, not as a fatal mount error.
- `AADSTS65001` / `consent_required` is sanitized to `consent_required`.
- The Manager shell renders in read-only mode before API approval.
- `Homepage Foleon Content` still renders empty/unavailable lane states when backend reads cannot authenticate.
- `Config` renders an API approval required section and redacted diagnostics.
- Save, validate, publish, suppress, placement mutation, and sync actions remain blocked.
- Retry remains available through `Retry API readiness`.

## Tenant Action Required
After uploading and redeploying the rebuilt `.sppkg`, approve the API request:

1. Open SharePoint Admin Center.
2. Go to **Advanced -> API access**.
3. Approve:
   - Resource: `HB SharePoint Creator`
   - Scope: `access_as_user`
4. Retest `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Foleon-Manager.aspx`.

## Expected Hosted Proof
Before API approval:

- Manager shell renders.
- Config tab shows `API Consent Missing`.
- Runtime proof shows `tokenProviderReady=true` when the SPFx provider exists.
- Runtime proof shows `tokenAcquisitionReady=false`.
- `readPathReady=false`, `writePathReady=false`, and `syncPathReady=false`.
- No full-surface fatal block for `token-acquisition-failed`.

After API approval:

- SPFx token acquisition succeeds.
- Runtime proof shows `tokenAcquisitionReady=true`.
- Backend read path can execute after backend read probes pass.
- `writePathReady` remains `false` unless backend safe-config and route authorization are both proven.

## Commit Message
`SPFx Foleon 1.0.28.0: request backend delegated API consent`

## Validation Results
- `pnpm --filter @hbc/spfx-hb-intel-foleon lint` passed with existing warnings only.
- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types` passed.
- `pnpm --filter @hbc/spfx-hb-intel-foleon test` passed: 29 files, 292 tests.
- `pnpm --filter @hbc/spfx-hb-intel-foleon build` passed.
- `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate` passed: 498 checks.
- `npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts` passed.
- `npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon` passed using Node `v18.20.8`.
- `pnpm --filter @hbc/spfx-hb-intel-foleon package:proof` passed for `1.0.28.0`.
- Package archive inspection confirmed `HB SharePoint Creator` / `access_as_user` in `AppManifest.xml`.
