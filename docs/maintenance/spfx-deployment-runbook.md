# SPFx Deployment Runbook

**Version:** 2.0
**Date:** 2026-03-28
**Audience:** DevOps, Administrators, Developers
**References:** [Packaging remediation](../architecture/reviews/estimating-spfx-packaging-remediation.md), [Runtime remediation](../architecture/reviews/estimating-spfx-runtime-and-registration-remediation.md), [Deployment closeout](../architecture/reviews/estimating-spfx-deployment-validation-closeout.md)

---

## Architecture Summary

All 11 HB Intel webpart domains are **web-part-only** SPFx components. Each domain app:

1. **Builds** with Vite in IIFE library mode → produces a single `{domain}-app.js` bundle
2. **Packages** through an isolated SPFx 1.18 shell project (`tools/spfx-shell/`) using official `gulp bundle --ship && gulp package-solution --ship`
3. **Deploys** to SharePoint App Catalog via PnP PowerShell with tenant-wide scope

The packaging orchestrator (`tools/build-spfx-package.ts`) handles the full pipeline.

---

## Deployment Pipeline

### Four Stages

```
Build (Vite IIFE)  →  Package (SPFx gulp)  →  Staging (auto)  →  Production (manual approval)
```

### Pipeline Triggers

| Trigger | Workflow | Result |
|---------|----------|--------|
| Push to `main` or `develop` (SPFx paths) | `spfx-build.yml` | Build + package + upload artifacts |
| PR to `main` | `spfx-build.yml` | Build + validate (no deploy) |
| Successful build on `main` | `spfx-deploy.yml` | Auto-deploy to staging |
| Manual dispatch | `spfx-deploy.yml` | Deploy to chosen environment |

---

## Build and Package Locally

### Prerequisites

- Node.js 20+ (workspace builds)
- Node.js 18 (SPFx shell — SPFx 1.18 requires Node 18; install via `nvm install 18`)
- pnpm (workspace package manager)
- npm (for the isolated SPFx shell project)
- `zip` command (for Vite bundle injection into .sppkg)

### Full Pipeline

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Install Node 18 for SPFx shell (if not already installed)
nvm install 18 && nvm use default

# 3. Install SPFx shell dependencies (isolated project, uses npm + Node 18)
cd tools/spfx-shell && nvm use 18 && npm install && nvm use default && cd ../..

# 4. Build shared packages
pnpm turbo run build --filter="./packages/*"

# 5. Build a single domain (Estimating)
pnpm turbo run build --filter="./apps/estimating"

# 6. Validate manifests
npx tsx tools/validate-manifests.ts

# 7. Check bundle sizes
npx tsx tools/spfx-bundle-check.ts

# 8. Package a single domain (uses nvm to switch to Node 18 for gulp)
npx tsx tools/build-spfx-package.ts --domain estimating

# 9. Package all 11 domains
npx tsx tools/build-spfx-package.ts
```

### Output

```
dist/sppkg/hb-intel-estimating.sppkg    # Estimating package
dist/sppkg/hb-intel-accounting.sppkg    # Accounting package
dist/sppkg/hb-intel-*.sppkg             # ... all 11 domains
```

### What the Orchestrator Does

For each domain, `tools/build-spfx-package.ts`:

1. Verifies Vite IIFE bundle exists and is not ES module format
2. Copies bundle into the SPFx shell project
3. Writes domain-specific manifest (component ID, title, icon) and solution config
4. Runs `gulp bundle --ship` (compiles the thin shell webpart)
5. Copies Vite bundle into `temp/deploy/` for inclusion in .sppkg
6. Runs `gulp package-solution --ship` (official Microsoft .sppkg generation)
7. Verifies .sppkg contents (OPC structure, bundle presence, manifest ID)
8. Copies .sppkg to `dist/sppkg/`

---

## Deploy to SharePoint

### Automated (CI/CD)

Staging deploys automatically when `spfx-build.yml` succeeds on `main`.
Production deploys after staging succeeds, with a manual approval gate (1 reviewer, 30-min wait).

### Manual Deployment

**Via GitHub Actions:**

1. Go to **Actions > SPFx Deploy to App Catalog**
2. Click **Run workflow**
3. Select target environment (`staging` or `production`)
4. Optionally specify a domain name (leave blank for all)
5. Click **Run workflow**

**Via PnP PowerShell (direct):**

```powershell
# Connect to App Catalog
Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -ClientSecret $ClientSecret

# Upload and publish a single domain
Add-PnPApp -Path "dist/sppkg/hb-intel-estimating.sppkg" -Scope Tenant -Overwrite -Publish

# Upload and publish all domains
Get-ChildItem -Path "dist/sppkg/*.sppkg" | ForEach-Object {
    Write-Host "Deploying $_"
    Add-PnPApp -Path $_.FullName -Scope Tenant -Overwrite -Publish
}
```

---

## SharePoint Validation Checklist

After deploying to a SharePoint environment, verify each step:

### Package and Catalog

- [ ] `.sppkg` generated without errors (`npx tsx tools/build-spfx-package.ts --domain estimating`)
- [ ] Package uploads to App Catalog without errors
- [ ] Solution shows in App Catalog with name "hb-intel-estimating"
- [ ] Solution status shows "Deployed" / "Published"
- [ ] `skipFeatureDeployment: true` — no per-site installation required

### Toolbox Visibility

- [ ] Navigate to any SharePoint site page → Edit → Add a web part
- [ ] "HB Intel" group appears in the web part picker
- [ ] "HB Intel Estimating" web part appears with BuildDefinition icon
- [ ] Description shows "HB Intel Estimating workspace."

### Add-to-Page Behavior

- [ ] Click "HB Intel Estimating" in the picker
- [ ] Web part placeholder appears on the page
- [ ] No errors in the browser console during add

### Runtime Rendering

- [ ] Web part loads and renders the React application
- [ ] No "App bundle failed to load" error message
- [ ] No 404 errors for `estimating-app.js` in the browser Network tab
- [ ] Navigation within the web part works (TanStack Router memory history)
- [ ] Authentication context is available (user identity, permissions)
- [ ] Page save and re-load preserves the web part

### Update/Upgrade

- [ ] Re-deploying a newer `.sppkg` with `--Overwrite --Publish` updates the web part
- [ ] Existing web part instances on pages automatically use the new version
- [ ] No manual per-site update action needed (tenant-wide deployment)

---

## Required GitHub Secrets

Configure in **Settings > Secrets and variables > Actions**:

| Secret Name | Description |
|-------------|-------------|
| `SPFX_STAGING_SITE_URL` | SharePoint admin site URL for staging tenant |
| `SPFX_STAGING_CLIENT_ID` | Azure AD app registration client ID (staging) |
| `SPFX_STAGING_CLIENT_SECRET` | Azure AD app registration client secret (staging) |
| `SPFX_PROD_SITE_URL` | SharePoint admin site URL for production tenant |
| `SPFX_PROD_CLIENT_ID` | Azure AD app registration client ID (production) |
| `SPFX_PROD_CLIENT_SECRET` | Azure AD app registration client secret (production) |

### Azure AD App Registration Requirements

The app registration must have:
- **API permissions:** `AppCatalog.ReadWrite.All` (SharePoint)
- **Admin consent:** Granted by a tenant admin
- **Client secret:** Active (not expired)

---

## GitHub Environment Configuration

### `spfx-staging`
- **Protection rules:** None (auto-deploys on successful build)

### `spfx-production`
- **Protection rules:** Required reviewers (1), wait timer (30 minutes)

---

## Rollback Procedure

1. **Find the last known good build:**
   - Go to **Actions > SPFx Build and Package**
   - Find the last successful run before the bad deployment
   - Download the `spfx-packages` artifact

2. **Re-deploy the previous version:**
   ```powershell
   Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -ClientSecret $ClientSecret
   Add-PnPApp -Path "hb-intel-estimating.sppkg" -Scope Tenant -Overwrite -Publish
   ```

3. **Verify rollback** by checking the web part renders on a SharePoint page.

---

## Troubleshooting

### Build Failures

| Symptom | Cause | Resolution |
|---------|-------|-----------|
| `dist/ not found` | Vite build failed | Check TypeScript or import errors |
| `EXCEEDS 1.5 MB budget` | Bundle too large | Review imports; consider externalizing large deps |
| `MISSING IIFE GLOBAL` | Vite not using lib mode | Verify `build.lib` config in `vite.config.ts` |
| `MISSING EXPORTS: mount/unmount` | `mount.tsx` entry not exporting correctly | Check `src/mount.tsx` exports |
| `ES MODULE FORMAT` | Wrong output format | Verify `build.lib.formats: ['iife']` |
| `INVALID HOST: SharePointFullPage` | Manifest declares unsupported host | Remove `SharePointFullPage` from `supportedHosts` |

### Packaging Failures

| Symptom | Cause | Resolution |
|---------|-------|-----------|
| `gulp bundle` fails | SPFx shell TS compilation error | Check `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` |
| `.sppkg missing Vite bundle` | Asset copy timing issue | Verify `assets/` → `temp/deploy/` copy in orchestrator |
| `npm ci` fails in CI | SPFx shell `package-lock.json` missing | Run `cd tools/spfx-shell && npm install` and commit `package-lock.json` |

### Deployment Failures

| Symptom | Cause | Resolution |
|---------|-------|-----------|
| `Access denied` on Connect-PnPOnline | Client secret expired | Rotate secret in Azure Portal; update GitHub secret |
| `401 Unauthorized` | Missing `AppCatalog.ReadWrite.All` | Grant permission + admin consent |
| Web part shows "App bundle failed to load" | IIFE global not assigned | Rebuild; verify `var __hbIntel_{domain}=` in bundle head |
| Web part not in toolbox | Missing `preconfiguredEntries` | Check manifest has title, groupId, icon |
| 404 on `estimating-app.js` | CDN asset not in .sppkg | Re-run packaging; verify `.sppkg` contains the bundle |

---

## Key Files

| File | Purpose |
|------|---------|
| `tools/build-spfx-package.ts` | Packaging orchestrator (authoritative) |
| `tools/spfx-shell/` | Isolated SPFx 1.18 project for official packaging |
| `tools/validate-manifests.ts` | Pre-build manifest and format validation |
| `tools/spfx-bundle-check.ts` | Bundle size budget enforcement |
| `tools/package-sppkg.legacy.ts` | Retired custom OPC packager (do not use) |
| `.github/workflows/spfx-build.yml` | CI build and packaging pipeline |
| `.github/workflows/spfx-deploy.yml` | CD deployment pipeline |
| `apps/{domain}/src/mount.tsx` | IIFE production entry point per domain |
| `apps/{domain}/vite.config.ts` | Build config (lib mode for IIFE) |
