# SPFx Deployment Runbook

**Version:** 1.0
**Date:** 2026-03-08
**Audience:** DevOps, Administrators
**Reference:** PH7-BW-9-CI-CD-Pipeline.md

---

## Deployment Lifecycle Overview

SPFx webparts follow a four-stage deployment pipeline:

1. **Build** — Vite compiles React bundles for all 11 webpart domains
2. **Package** — `tools/package-sppkg.ts` creates `.sppkg` ZIP archives (bundle + manifest)
3. **Staging** — `.sppkg` files uploaded to the staging SharePoint App Catalog
4. **Production** — After manual approval, `.sppkg` files uploaded to the production App Catalog

### Pipeline Triggers

| Trigger | Workflow | Result |
|---|---|---|
| Push to `main` or `develop` (SPFx paths) | `spfx-build.yml` | Build + package artifacts |
| PR to `main` | `spfx-build.yml` | Build + validate (no deploy) |
| Successful build on `main` | `spfx-deploy.yml` | Auto-deploy to staging |
| Manual dispatch | `spfx-deploy.yml` | Deploy to chosen environment |

---

## Required GitHub Secrets

Configure these in **Settings > Secrets and variables > Actions**:

| Secret Name | Description | Example |
|---|---|---|
| `SPFX_STAGING_SITE_URL` | SharePoint admin site URL for staging tenant | `https://contoso-staging-admin.sharepoint.com` |
| `SPFX_STAGING_CLIENT_ID` | Azure AD app registration client ID (staging) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `SPFX_STAGING_CLIENT_SECRET` | Azure AD app registration client secret (staging) | (generated in Azure Portal) |
| `SPFX_PROD_SITE_URL` | SharePoint admin site URL for production tenant | `https://contoso-admin.sharepoint.com` |
| `SPFX_PROD_CLIENT_ID` | Azure AD app registration client ID (production) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `SPFX_PROD_CLIENT_SECRET` | Azure AD app registration client secret (production) | (generated in Azure Portal) |

### Azure AD App Registration Requirements

The app registration used for deployment must have:

- **API permissions:** `AppCatalog.ReadWrite.All` (SharePoint)
- **Admin consent:** Granted by a tenant admin
- **Client secret:** Active (not expired)

---

## GitHub Environment Configuration

Configure in **Settings > Environments**:

### `spfx-staging`

- **Protection rules:** None (auto-deploys on successful build)
- **Secrets:** `SPFX_STAGING_SITE_URL`, `SPFX_STAGING_CLIENT_ID`, `SPFX_STAGING_CLIENT_SECRET`

### `spfx-production`

- **Protection rules:**
  - Required reviewers: 1 (any repository admin)
  - Wait timer: 30 minutes
- **Secrets:** `SPFX_PROD_SITE_URL`, `SPFX_PROD_CLIENT_ID`, `SPFX_PROD_CLIENT_SECRET`

---

## Manual Deployment

To deploy a specific domain or target a specific environment:

1. Go to **Actions > SPFx Deploy to App Catalog**
2. Click **Run workflow**
3. Select the target environment (`staging` or `production`)
4. Optionally specify a domain name (leave blank for all)
5. Click **Run workflow**

---

## Rollback Procedure

If a deployment causes issues:

1. **Identify the last known good version**
   - Go to **Actions > SPFx Build and Package**
   - Find the last successful run before the problematic deployment
   - Download the `spfx-packages` artifact from that run

2. **Re-upload to App Catalog**
   - Extract the `.sppkg` files from the downloaded artifact
   - Use the manual deployment workflow, OR:
   - Connect to the App Catalog via PnP PowerShell:
     ```powershell
     Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -ClientSecret $ClientSecret
     Add-PnPApp -Path "hb-intel-accounting.sppkg" -Scope Tenant -Overwrite -Publish
     ```

3. **Verify rollback**
   - Navigate to the SharePoint site where the webpart is installed
   - Confirm the previous version is active
   - Check the App Catalog for the correct version number

---

## Troubleshooting

### Build failures

| Symptom | Cause | Resolution |
|---|---|---|
| `dist/ not found` | Vite build failed for a domain | Check build logs; fix TypeScript or import errors |
| `EXCEEDS 1 MB budget` | Bundle too large after changes | Review imports; use code splitting or tree shaking |
| `Duplicate GUID` | Two manifests share the same GUID | Run `npx tsx tools/validate-manifests.ts` locally; regenerate the duplicate |

### Deployment failures

| Symptom | Cause | Resolution |
|---|---|---|
| `Connect-PnPOnline: Access denied` | Client secret expired or wrong permissions | Rotate the secret in Azure Portal; update GitHub secret |
| `Add-PnPApp: The file was not found` | Artifact download failed | Check that `spfx-build.yml` completed successfully; verify `run-id` |
| `401 Unauthorized` | App registration missing `AppCatalog.ReadWrite.All` | Grant the permission and admin consent in Azure Portal |
| Staging works but production fails | Production secrets not configured | Verify all `SPFX_PROD_*` secrets exist in the `spfx-production` environment |

### Artifact issues

| Symptom | Cause | Resolution |
|---|---|---|
| `No artifacts found` in deploy workflow | Build workflow didn't produce artifacts | Re-run `spfx-build.yml`; check for packaging errors |
| `.sppkg` file is 0 bytes | Archive stream closed before write completed | Check `tools/package-sppkg.ts` for stream handling errors |

---

## Local Testing

Test the full pipeline locally before pushing:

```bash
# Build all packages and apps
pnpm turbo run build

# Check bundle sizes
npx tsx tools/spfx-bundle-check.ts

# Validate manifests
npx tsx tools/validate-manifests.ts

# Package .sppkg files
npx tsx tools/package-sppkg.ts

# Verify output
ls dist/sppkg/*.sppkg | wc -l   # Expected: 11
file dist/sppkg/hb-intel-accounting.sppkg  # Expected: "Zip archive data"
```
