# PH7-BW-9 — CI/CD Pipeline: .sppkg Build + SharePoint App Catalog Deployment

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §5 (CI/CD, GitHub Actions, Turborepo-aware)
**Date:** 2026-03-07
**Priority:** MEDIUM — Required before any webpart can be deployed to a real SharePoint tenant
**Depends on:** BW-3 (package-solution.json exists), BW-4 (vite build outputs dist/)
**Blocks:** Production deployments and staging environment testing

---

## Summary

An SPFx webpart is deployed to SharePoint by:
1. Building the React/Vite bundle into `dist/`
2. Packaging the bundle + manifest into a `.sppkg` file (a ZIP archive with a specific structure)
3. Uploading the `.sppkg` to the SharePoint App Catalog
4. Installing/upgrading the solution on target SharePoint sites

This task creates the GitHub Actions workflow to automate steps 1–4 for all 11 webpart apps. The pipeline is Turborepo-aware (only rebuilds changed packages), uses manual approval gates for production deployments, and follows the existing CI/CD patterns already used for the PWA.

---

## Deployment Strategy (Locked — Blueprint §2a)

- **App Catalog type:** Tenant-wide App Catalog (not site collection catalog)
- **Deployment scope:** `skipFeatureDeployment: true` (tenant-wide — avoids per-site installation in most cases)
- **Target sites that require explicit installation:** Project-specific SharePoint sites (installed during provisioning saga — Phase 6)
- **Environment sequence:** dev tenant → staging tenant → production tenant (with manual gate between staging and production)
- **Rollback:** Re-upload previous `.sppkg` version to App Catalog; previous version preserved in GitHub Releases

---

## Workflow Files

### 1. SPFx Build + Package Workflow: `.github/workflows/spfx-build.yml`

```yaml
name: SPFx Build and Package

on:
  push:
    branches: [main, develop]
    paths:
      - 'apps/accounting/**'
      - 'apps/estimating/**'
      - 'apps/project-hub/**'
      - 'apps/leadership/**'
      - 'apps/business-development/**'
      - 'apps/admin/**'
      - 'apps/safety/**'
      - 'apps/quality-control-warranty/**'
      - 'apps/risk-management/**'
      - 'apps/operational-excellence/**'
      - 'apps/human-resources/**'
      - 'packages/**'
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      domain:
        description: 'Domain to build (leave empty for all)'
        required: false
        type: choice
        options:
          - all
          - accounting
          - estimating
          - project-hub
          - leadership
          - business-development
          - admin
          - safety
          - quality-control-warranty
          - risk-management
          - operational-excellence
          - human-resources

jobs:
  build-spfx:
    name: Build SPFx Webparts
    runs-on: ubuntu-latest
    outputs:
      changed-apps: ${{ steps.changed.outputs.apps }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2 # Need previous commit for Turborepo change detection

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Restore Turborepo cache
        uses: actions/cache@v4
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      - name: Build shared packages
        run: pnpm turbo run build --filter="./packages/*"

      - name: Build SPFx webpart apps
        run: |
          if [ "${{ inputs.domain }}" = "" ] || [ "${{ inputs.domain }}" = "all" ]; then
            pnpm turbo run build \
              --filter="./apps/accounting" \
              --filter="./apps/estimating" \
              --filter="./apps/project-hub" \
              --filter="./apps/leadership" \
              --filter="./apps/business-development" \
              --filter="./apps/admin" \
              --filter="./apps/safety" \
              --filter="./apps/quality-control-warranty" \
              --filter="./apps/risk-management" \
              --filter="./apps/operational-excellence" \
              --filter="./apps/human-resources"
          else
            pnpm turbo run build --filter="./apps/${{ inputs.domain }}"
          fi

      - name: Check bundle sizes
        run: node tools/spfx-bundle-check.ts

      - name: Validate manifests (unique GUIDs)
        run: node tools/validate-manifests.ts

      - name: Package .sppkg files
        run: node tools/package-sppkg.ts

      - name: Upload .sppkg artifacts
        uses: actions/upload-artifact@v4
        with:
          name: spfx-packages
          path: 'dist/sppkg/*.sppkg'
          retention-days: 30

  lint-and-typecheck:
    name: Lint and TypeCheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint typecheck --filter="./apps/*" --filter="./packages/*"
```

### 2. SPFx Deploy to App Catalog: `.github/workflows/spfx-deploy.yml`

```yaml
name: SPFx Deploy to App Catalog

on:
  workflow_run:
    workflows: ['SPFx Build and Package']
    types: [completed]
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options: [staging, production]
      domain:
        description: 'Domain to deploy (or all)'
        required: false
        type: string

jobs:
  deploy-staging:
    name: Deploy to Staging App Catalog
    runs-on: ubuntu-latest
    environment: spfx-staging
    if: ${{ github.event.workflow_run.conclusion == 'success' || github.event_name == 'workflow_dispatch' }}

    steps:
      - uses: actions/checkout@v4

      - name: Download .sppkg artifacts
        uses: actions/download-artifact@v4
        with:
          name: spfx-packages
          path: dist/sppkg/

      - name: Install PnP PowerShell
        shell: pwsh
        run: Install-Module -Name PnP.PowerShell -Force -AllowClobber

      - name: Deploy to Staging App Catalog
        shell: pwsh
        env:
          STAGING_SITE_URL: ${{ secrets.SPFX_STAGING_SITE_URL }}
          STAGING_CLIENT_ID: ${{ secrets.SPFX_STAGING_CLIENT_ID }}
          STAGING_CLIENT_SECRET: ${{ secrets.SPFX_STAGING_CLIENT_SECRET }}
        run: |
          Connect-PnPOnline -Url $env:STAGING_SITE_URL `
            -ClientId $env:STAGING_CLIENT_ID `
            -ClientSecret $env:STAGING_CLIENT_SECRET

          Get-ChildItem -Path "dist/sppkg/*.sppkg" | ForEach-Object {
            Write-Host "Deploying $_"
            Add-PnPApp -Path $_.FullName -Scope Tenant -Overwrite -Publish
          }

  deploy-production:
    name: Deploy to Production App Catalog
    runs-on: ubuntu-latest
    environment: spfx-production  # Requires manual approval gate in GitHub Environments
    needs: [deploy-staging]

    steps:
      - uses: actions/checkout@v4

      - name: Download .sppkg artifacts
        uses: actions/download-artifact@v4
        with:
          name: spfx-packages
          path: dist/sppkg/

      - name: Deploy to Production App Catalog
        shell: pwsh
        env:
          PROD_SITE_URL: ${{ secrets.SPFX_PROD_SITE_URL }}
          PROD_CLIENT_ID: ${{ secrets.SPFX_PROD_CLIENT_ID }}
          PROD_CLIENT_SECRET: ${{ secrets.SPFX_PROD_CLIENT_SECRET }}
        run: |
          Connect-PnPOnline -Url $env:PROD_SITE_URL `
            -ClientId $env:PROD_CLIENT_ID `
            -ClientSecret $env:PROD_CLIENT_SECRET

          Get-ChildItem -Path "dist/sppkg/*.sppkg" | ForEach-Object {
            Write-Host "Deploying $_"
            Add-PnPApp -Path $_.FullName -Scope Tenant -Overwrite -Publish
          }
```

---

## .sppkg Packaging Script

The `.sppkg` file is a ZIP archive with a specific structure. Create `tools/package-sppkg.ts`:

```typescript
// tools/package-sppkg.ts
import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver'; // npm: archiver

const domains = [
  'accounting', 'estimating', 'project-hub', 'leadership',
  'business-development', 'admin', 'safety', 'quality-control-warranty',
  'risk-management', 'operational-excellence', 'human-resources',
];

fs.mkdirSync('dist/sppkg', { recursive: true });

for (const domain of domains) {
  const solutionPkg = JSON.parse(
    fs.readFileSync(`apps/${domain}/config/package-solution.json`, 'utf8')
  );
  const sppkgName = solutionPkg.paths.zippedPackage.replace('solution/', '');
  const outputPath = `dist/sppkg/${sppkgName}`;

  const output = createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.directory(`apps/${domain}/dist/`, 'ClientSideAssets');
  archive.file(`apps/${domain}/config/package-solution.json`, { name: 'package-solution.json' });

  await archive.finalize();
  console.log(`✅ Packaged: ${outputPath}`);
}
```

Add `archiver` to root `package.json` devDependencies.

---

## Required GitHub Secrets

Configure these in the GitHub repository settings before running the deploy workflow:

| Secret Name | Description |
|---|---|
| `SPFX_STAGING_SITE_URL` | SharePoint admin site URL for staging tenant |
| `SPFX_STAGING_CLIENT_ID` | Azure AD app registration client ID (staging) |
| `SPFX_STAGING_CLIENT_SECRET` | Azure AD app registration client secret (staging) |
| `SPFX_PROD_SITE_URL` | SharePoint admin site URL for production tenant |
| `SPFX_PROD_CLIENT_ID` | Azure AD app registration client ID (production) |
| `SPFX_PROD_CLIENT_SECRET` | Azure AD app registration client secret (production) |

The Azure AD app registration must have the `AppCatalog.ReadWrite.All` SharePoint permission granted with admin consent.

---

## GitHub Environment Configuration

Configure these environments in GitHub Settings → Environments:

| Environment | Protection Rules |
|---|---|
| `spfx-staging` | No approval required; auto-deploys on merge to `main` |
| `spfx-production` | Required reviewers: 1 (any repo admin); 30-minute wait timer |

---

## Verification

```bash
# Local: test the package script
node tools/package-sppkg.ts
ls dist/sppkg/
# Expected: 11 .sppkg files

# Validate the .sppkg structure (should be a valid ZIP)
file dist/sppkg/hb-intel-accounting.sppkg
# Expected: "Zip archive data"

# Manual: push to develop branch and confirm workflow runs in GitHub Actions
git push origin develop
# Check Actions tab for "SPFx Build and Package" workflow run
```

---

## Definition of Done

- [ ] `.github/workflows/spfx-build.yml` created and triggers correctly on path changes
- [ ] `.github/workflows/spfx-deploy.yml` created with staging + production jobs
- [ ] `tools/package-sppkg.ts` creates valid `.sppkg` ZIP files for all 11 apps
- [ ] Bundle size check (`tools/spfx-bundle-check.ts`) runs in CI and fails build if > 1 MB
- [ ] Manifest GUID validation (`tools/validate-manifests.ts`) runs in CI
- [ ] Production deploy job requires manual approval (GitHub Environment protection rule)
- [ ] Required GitHub Secrets documented in this file and in `docs/maintenance/` runbook
- [ ] First successful build run produces 11 `.sppkg` artifacts
- [ ] CI/CD runbook created at `docs/maintenance/spfx-deployment-runbook.md`
