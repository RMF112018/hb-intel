# SF01-T10: Deployment

**Package:** `@hbc/sharepoint-docs`
**Wave:** 4 — Testing & Deployment
**Estimated effort:** 0.25 sprint-weeks
**Prerequisite tasks:** All (SF01-T01 through SF01-T09 must be complete and passing)
**Governed by:** CLAUDE.md v1.2 §8 (Verification Protocol); Blueprint §CI/CD

---

## 1. Pre-Deployment Checklist

Complete every item before proceeding to environment deployment. Do not proceed if any item is unchecked.

### Code Quality
- [ ] `pnpm turbo run build` exits with code 0 — zero TypeScript errors across monorepo
- [ ] `pnpm --filter @hbc/sharepoint-docs test:coverage` reports ≥95% on all four critical services
- [ ] `pnpm turbo run lint` exits with zero warnings
- [ ] No `@ts-ignore` or `@ts-expect-error` comments added without documented justification
- [ ] All SPFx webpart imports use `@hbc/ui-kit/app-shell` (verified by bundle analysis)
- [ ] Lazy chunk `hbc-sharepoint-docs` is ≤400 KB gzipped (verified by bundle analysis)

### Infrastructure
- [ ] `HBCDocumentRegistry` list exists in dev SharePoint tenant with all 19 columns
- [ ] `HBCMigrationLog` list exists in dev SharePoint tenant with all 10 columns
- [ ] `HBCDocumentRegistry` has indexes on: `HbcModuleType`, `HbcRecordId`, `HbcProjectId`, `HbcDocumentId`, `HbcMigrationStatus`, `HbcUploadedAt`
- [ ] Staging folders exist: `Shared Documents/BD Leads/`, `Shared Documents/Estimating Pursuits/`, `Shared Documents/System/`
- [ ] Tier-2 AD groups exist and have Read on correct parent folders
- [ ] Tier-3 Executives AD group exists and has Read on both staging root folders

### Azure Functions Backend
- [ ] Azure Function endpoints deployed and responding: `/api/sharepoint/folder-exists`, `/api/sharepoint/folder`, `/api/sharepoint/folder-url`, `/api/sharepoint/file-upload`, `/api/sharepoint/upload-session`, `/api/sharepoint/upload-chunk`, `/api/sharepoint/file-move`, `/api/sharepoint/url-file`, `/api/sharepoint/folder-files`
- [ ] Azure Function timer trigger for `processNightlyWindow` deployed with cron `0 22 * * *`
- [ ] Azure Function timer trigger for `autoResolveExpired` (conflict TTL watchdog) deployed with cron `0 * * * *` (every hour)
- [ ] MSAL on-behalf-of token acquisition working for all Graph API calls
- [ ] SharePoint throttle retry (429 → exponential backoff) tested manually

### ADR
- [ ] `docs/architecture/adr/ADR-0082-sharepoint-docs-pre-provisioning-storage.md` created with all decisions documented

---

## 2. Environment Deployment Order

Always deploy in this order: `dev` → `staging` → `prod`. Never deploy directly to `prod`.

### Dev Environment

```bash
# 1. Deploy SharePoint infrastructure
cd packages/sharepoint-docs/infrastructure
.\provision-all.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-dev" -Environment dev

# 2. Build the package
pnpm --filter @hbc/sharepoint-docs build

# 3. Build and deploy Azure Functions backend
cd packages/api
func azure functionapp publish hb-intel-api-dev --typescript

# 4. Build and package SPFx
cd apps/spfx
npm run bundle
npm run package-solution

# 5. Deploy SPFx to SharePoint App Catalog
# (requires SharePoint App Catalog admin access)
# Upload apps/spfx/sharepoint/solution/hb-intel.sppkg to dev app catalog

# 6. Run infrastructure verification
cd packages/sharepoint-docs/infrastructure
.\verify-infrastructure.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel-dev"

# 7. Run integration smoke test
pnpm --filter @hbc/sharepoint-docs test:e2e --env=dev
```

### Staging Environment

```bash
# Run the same steps with -Environment staging and staging URLs
# Requires sign-off from QA lead on dev results first
.\provision-all.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel" -Environment staging
```

### Production Environment

```bash
# Production deployment requires:
# 1. Staging E2E test results attached to the release PR
# 2. Architecture review sign-off
# 3. Deployment window: non-business hours (align with migration window convention)
.\provision-all.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/hb-intel" -Environment prod
```

---

## 3. Azure Function Timer Triggers

Two timer triggers must be deployed to support the migration pipeline.

### `processNightlyWindow` — Nightly Migration Runner

```typescript
// packages/api/src/functions/processNightlyMigration.ts
import { app } from '@azure/functions';
import { MigrationScheduler } from '@hbc/sharepoint-docs';

app.timer('processNightlyMigration', {
  schedule: '0 22 * * *',   // 10 PM every night (local time per Azure Function timezone setting)
  handler: async (myTimer, context) => {
    context.log('Starting nightly migration window processing…');
    const scheduler = buildMigrationScheduler();   // factory function injects dependencies
    await scheduler.processNightlyWindow();
    context.log('Nightly migration window complete.');
  },
});
```

**Azure Function App timezone setting:** Must be set to the company's local timezone (not UTC) so the `0 22 * * *` cron fires at 10 PM local time. Set via `WEBSITE_TIME_ZONE` app setting in Azure Portal.

### `resolveExpiredConflicts` — Conflict TTL Watchdog

```typescript
// packages/api/src/functions/resolveExpiredConflicts.ts
import { app } from '@azure/functions';
import { ConflictResolver } from '@hbc/sharepoint-docs';

app.timer('resolveExpiredConflicts', {
  schedule: '0 * * * *',   // Every hour
  handler: async (myTimer, context) => {
    context.log('Checking for expired conflicts…');
    const resolver = buildConflictResolver();
    await resolver.autoResolveExpired();
    context.log('Conflict TTL watchdog complete.');
  },
});
```

---

## 4. Environment Variables

All environment variables must be set before deployment. Add to Azure Function App settings and to the PWA's `.env` files per environment.

| Variable | Required in | Description |
|---|---|---|
| `VITE_HBINTEL_SITE_URL` | PWA, SPFx | Root HB Intel SharePoint site URL (e.g., `https://contoso.sharepoint.com/sites/hb-intel`) |
| `VITE_API_BASE_URL` | PWA, SPFx | Azure Functions backend base URL (e.g., `https://hb-intel-api-dev.azurewebsites.net`) |
| `VITE_PWA_BASE_URL` | PWA | PWA base URL for migration notification links (e.g., `https://hb-intel.vercel.app`) |
| `AZURE_CLIENT_ID` | Azure Functions | App registration client ID for MSAL |
| `AZURE_TENANT_ID` | Azure Functions | Azure AD tenant ID |
| `AZURE_CLIENT_SECRET` | Azure Functions | App registration client secret (use Key Vault reference) |
| `SHAREPOINT_ROOT_SITE` | Azure Functions | Same as `VITE_HBINTEL_SITE_URL` — available to Functions runtime |
| `WEBSITE_TIME_ZONE` | Azure Function App | Local timezone for cron scheduling (e.g., `Eastern Standard Time`) |

---

## 5. Post-Deployment Verification Protocol

Run this verification protocol after every deployment. All steps must pass before marking the deployment complete.

### Automated Verification

```bash
# Infrastructure verification (runs against live SharePoint)
cd packages/sharepoint-docs/infrastructure
.\verify-infrastructure.ps1 -SiteUrl $SITE_URL

# E2E smoke test (runs against deployed environment)
PLAYWRIGHT_BASE_URL=$PWA_URL npx playwright test tests/e2e/sharepoint-docs.spec.ts --project=chromium

# Azure Function connectivity test
curl -X GET "$API_BASE_URL/api/sharepoint/folder-exists?siteUrl=$SITE_URL&path=Shared%20Documents%2FBD%20Leads" \
  -H "Authorization: Bearer $TEST_TOKEN"
# Expected: 200 {"exists": true}
```

### Manual Verification Checklist

Complete manually in the target environment after automated tests pass:

- [ ] Log in as a test BD user → open a BD Scorecard → open Documents panel → confirm panel loads
- [ ] Attach a small PDF (< 4 MB) → confirm it appears in the document list with "Awaiting migration" badge
- [ ] Attach a PDF > 4 MB → confirm chunked upload progress bar appears → file appears in list
- [ ] Go offline (DevTools → Network → Offline) → attach a small PDF → confirm queue indicator appears
- [ ] Go back online → confirm file uploads automatically → queue indicator disappears
- [ ] Browse to `https://{tenant}.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/` → confirm folder structure exists
- [ ] Open `HBCDocumentRegistry` list → confirm uploaded document appears as a new row
- [ ] Trigger a test migration manually via API → confirm `HBCMigrationLog` row created with `status=pending`
- [ ] After migration: confirm tombstone `.url` file exists in staging folder → click it → navigates to project site

### `infrastructure/verify-infrastructure.ps1`

```powershell
param([Parameter(Mandatory)][string]$SiteUrl)
Connect-PnPOnline -Url $SiteUrl -UseWebLogin

$errors = 0

# Verify lists
foreach ($listName in @("HBCDocumentRegistry", "HBCMigrationLog")) {
  $list = Get-PnPList -Identity $listName -ErrorAction SilentlyContinue
  if (-not $list) {
    Write-Host "  ✗ MISSING list: $listName" -ForegroundColor Red
    $errors++
  } else {
    Write-Host "  ✓ List exists: $listName" -ForegroundColor Green
  }
}

# Verify HBCDocumentRegistry columns
$requiredColumns = @("HbcModuleType","HbcRecordId","HbcProjectId","HbcDocumentId","HbcFileName","HbcMigrationStatus","HbcUploadedAt")
foreach ($col in $requiredColumns) {
  $field = Get-PnPField -List "HBCDocumentRegistry" -Identity $col -ErrorAction SilentlyContinue
  if (-not $field) {
    Write-Host "  ✗ MISSING column: HBCDocumentRegistry.$col" -ForegroundColor Red
    $errors++
  } else {
    Write-Host "  ✓ Column exists: $col" -ForegroundColor Green
  }
}

# Verify staging folders
foreach ($folderPath in @("Shared Documents/BD Leads", "Shared Documents/Estimating Pursuits", "Shared Documents/System")) {
  $folder = Get-PnPFolder -Url $folderPath -ErrorAction SilentlyContinue
  if (-not $folder) {
    Write-Host "  ✗ MISSING folder: $folderPath" -ForegroundColor Red
    $errors++
  } else {
    Write-Host "  ✓ Folder exists: $folderPath" -ForegroundColor Green
  }
}

Disconnect-PnPOnline

if ($errors -gt 0) {
  Write-Host "`n✗ Verification FAILED: $errors error(s). Run provision-all.ps1 to fix." -ForegroundColor Red
  exit 1
} else {
  Write-Host "`n✓ All infrastructure verified." -ForegroundColor Green
  exit 0
}
```

---

## 6. Rollback Plan

If a deployment causes regressions in the dev or staging environment:

### Code Rollback

```bash
# Revert to the previous NPM package version
git revert HEAD --no-commit
pnpm turbo run build
# Re-deploy following the same deployment steps above
```

### SharePoint Infrastructure Rollback

The SharePoint lists and folders are not destructively modified on re-deployment (all provisioning scripts are idempotent). If a column was added incorrectly:

```bash
# Connect to SharePoint and remove the offending column manually
Connect-PnPOnline -Url $SiteUrl -UseWebLogin
Remove-PnPField -List "HBCDocumentRegistry" -Identity "OffendingColumnName" -Force
```

**Do not run `teardown.ps1` in staging or prod.** That script is for dev environment cleanup only and will delete all list data.

---

## 7. ADR Creation

Create `docs/architecture/adr/ADR-0082-sharepoint-docs-pre-provisioning-storage.md` with the following content outline:

```markdown
# ADR-0082: SharePoint Document Pre-Provisioning Storage Strategy

**Status:** Accepted
**Date:** 2026-03-08
**Deciders:** [Product Owner interview, 2026-03-08]

## Context
Multiple modules require document attachment before a SharePoint project site exists.

## Decision
Use the HB Intel root site collection as a staging area for pre-provisioning documents,
with the following sub-decisions all locked via structured product-owner interview:

- D-01: Move & Archive (tombstone .url files at source after migration)
- D-02: Smart Auto scheduling with 10 PM–2 AM window + pre-notification
- D-03: Informed Queue offline pattern with 50 MB cap and 48-hr TTL
- D-04: 3-tier permission model (owner/collaborator, manager/director, executive)
- D-05: BD + Estimating scope now; Project Hub extensibility designed in
- D-06: Conflict Queue with 48-hr fallback to "project site wins"
- D-07: Federated single registry list + companion MigrationLog
- D-08: Project Hub deferred — architecture extension point documented
- D-09: SPFx inline default (lazy-loaded) + standalone webpart option
- D-10: Broad allowlist; two-tier size system (250 MB standard, 1 GB confirm, >1 GB blocked)
- D-11: Checkpoint resume + escalating alerts (PM → Director after 3 failures)
- D-12: Folder naming: yyyymmdd_{SanitizedName}_{UploadingUserLastName}

## Consequences
- All modules must use @hbc/sharepoint-docs — no per-module document storage implementations
- HBCDocumentRegistry and HBCMigrationLog must be provisioned before any domain module deploys
- Azure Function timer triggers required for nightly migration and hourly conflict resolution
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan authored: 2026-03-08
Interview conducted: 2026-03-08 (12 questions, all decisions locked)
All 10 task files written: SF01-T01 through SF01-T10
ADR created: docs/architecture/adr/ADR-0082-sharepoint-docs-pre-provisioning-storage.md
  (corrected from 0010 in PH7.7 — ADR-0010 was occupied by ADR-0010-ci-cd-pipeline.md)
Build verification: Run `pnpm turbo run build` after completing SF01-T01
Next phase: Begin Wave 1 implementation (SF01-T01 scaffold → SF01-T02 contracts → SF01-T03 infra → SF01-T04 upload)
-->
