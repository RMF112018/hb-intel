# PH7-BW-3 — SPFx Config & Manifests: package-solution.json, Manifests, Serve Config

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §2a (SPFx 1.18+, App Catalog deployment)
**Date:** 2026-03-07
**Priority:** HIGH — Required before CI/CD can build .sppkg packages; also needed for BW-4 Vite config
**Depends on:** BW-1 (class names needed for manifest componentType references)
**Blocks:** BW-4, BW-9

---

## Summary

SharePoint Framework requires a `config/` directory in each webpart app containing:
- `package-solution.json` — Identifies the solution (unique GUID, tenant-wide deployment flag, version)
- `[Domain]WebPart.manifest.json` — Identifies the webpart component (unique GUID, entry module path, title, description)
- `serve.json` — Local dev server configuration (SharePoint Workbench URL, webpart component ID)
- `deploy-azure-storage.json` — Asset CDN configuration for production deployment

None of these files exist in any of the 11 apps. This task creates them all.

**Key constraint:** Every manifest and solution GUID must be globally unique across all tenants. Generate them once with `uuidv4()` and lock them permanently. They must never be regenerated — changing a GUID is equivalent to uninstalling and reinstalling the webpart.

---

## Files to Create Per Domain

```
apps/[domain]/
└── config/
    ├── package-solution.json
    ├── serve.json
    └── deploy-azure-storage.json

apps/[domain]/src/webparts/[domain]/
└── [Domain]WebPart.manifest.json
```

---

## package-solution.json Template

Substitute `[SOLUTION_GUID]`, `[WEBPART_GUID]`, `[Domain]`, `[domain]`, and `[PORT]` per domain.

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/package-solution.schema.json",
  "solution": {
    "name": "hb-intel-[domain]",
    "id": "[SOLUTION_GUID]",
    "version": "1.0.0.0",
    "includeClientSideAssets": true,
    "skipFeatureDeployment": true,
    "isDomainIsolated": false,
    "developer": {
      "name": "HB Caldwell",
      "websiteUrl": "https://hbcaldwell.com",
      "privacyUrl": "",
      "termsOfUseUrl": "",
      "mpnId": ""
    },
    "metadata": {
      "shortDescription": {
        "default": "HB Intel [Domain] workspace"
      },
      "longDescription": {
        "default": "HB Intel [Domain] workspace for construction project management."
      },
      "screenshotPaths": [],
      "videoUrl": "",
      "categories": []
    },
    "features": [
      {
        "title": "hb-intel-[domain] Feature",
        "description": "Deploys HB Intel [Domain] webpart assets.",
        "id": "[FEATURE_GUID]",
        "version": "1.0.0.0"
      }
    ]
  },
  "paths": {
    "zippedPackage": "solution/hb-intel-[domain].sppkg"
  }
}
```

---

## Manifest Template

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/core-build/entry.schema.json",
  "id": "[WEBPART_GUID]",
  "alias": "[Domain]WebPart",
  "componentType": "WebPart",
  "version": "*",
  "manifestVersion": 2,
  "requiresCustomScript": false,
  "supportedHosts": ["SharePointWebPart", "TeamsPersonalApp"],
  "supportsThemeVariants": true,
  "preconfiguredEntries": [
    {
      "groupId": "5c03119e-3074-46fd-976b-c60198311f70",
      "group": { "default": "HB Intel" },
      "title": { "default": "HB Intel [Domain]" },
      "description": { "default": "HB Intel [Domain] workspace." },
      "officeFabricIconFontName": "BuildDefinition",
      "properties": {
        "description": "[Domain]"
      }
    }
  ]
}
```

---

## Per-Domain GUIDs and Port Assignments

Generate all GUIDs before writing files. Record them here permanently — do not regenerate.

| Domain | Solution GUID | Webpart GUID | Feature GUID | Dev Port |
|---|---|---|---|---|
| accounting | *(generate once)* | *(generate once)* | *(generate once)* | 4001 |
| estimating | *(generate once)* | *(generate once)* | *(generate once)* | 4002 |
| project-hub | *(generate once)* | *(generate once)* | *(generate once)* | 4003 |
| leadership | *(generate once)* | *(generate once)* | *(generate once)* | 4004 |
| business-development | *(generate once)* | *(generate once)* | *(generate once)* | 4005 |
| admin | *(generate once)* | *(generate once)* | *(generate once)* | 4006 |
| safety | *(generate once)* | *(generate once)* | *(generate once)* | 4007 |
| quality-control-warranty | *(generate once)* | *(generate once)* | *(generate once)* | 4008 |
| risk-management | *(generate once)* | *(generate once)* | *(generate once)* | 4009 |
| operational-excellence | *(generate once)* | *(generate once)* | *(generate once)* | 4010 |
| human-resources | *(generate once)* | *(generate once)* | *(generate once)* | 4011 |

**To generate GUIDs:**
```bash
node -e "const {randomUUID}=require('crypto'); for(let i=0;i<3;i++) console.log(randomUUID())"
```
Run 3× per domain (solution, webpart, feature). Record permanently in this table; never change.

---

## serve.json Template

Used with `gulp serve` or the SPFx workbench for local testing against a real SharePoint tenant:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/core-build/serve.schema.json",
  "port": [PORT],
  "https": true,
  "serveConfigurations": {
    "default": {
      "pageUrl": "https://[tenant].sharepoint.com/sites/[department-site]/_layouts/workbench.aspx",
      "webParts": [
        {
          "id": "[WEBPART_GUID]",
          "preconfiguredEntries": [{ "default": "HB Intel [Domain]" }]
        }
      ]
    }
  }
}
```

Note: `[tenant]` and `[department-site]` are filled in at deployment time, not here. Use placeholder values in the committed file.

---

## deploy-azure-storage.json Template

Used for CDN deployment of webpart assets (production path):

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/core-build/deploy-azure-storage.schema.json",
  "workingDir": "./temp/deploy/",
  "account": "$(AZURE_STORAGE_ACCOUNT)",
  "containerName": "hb-intel-[domain]",
  "accessKey": "$(AZURE_STORAGE_ACCESS_KEY)"
}
```

Environment variables `AZURE_STORAGE_ACCOUNT` and `AZURE_STORAGE_ACCESS_KEY` are injected by CI/CD (BW-9). Do not hardcode values.

---

## GUID Validation Tool

Create `tools/validate-manifests.ts` to prevent GUID collisions across all webpart apps:

```typescript
// tools/validate-manifests.ts
import fs from 'fs';
import path from 'path';

const domains = [
  'accounting', 'estimating', 'project-hub', 'leadership',
  'business-development', 'admin', 'safety', 'quality-control-warranty',
  'risk-management', 'operational-excellence', 'human-resources',
];

const guids = new Set<string>();
let hasCollision = false;

for (const domain of domains) {
  const manifestDir = path.join('apps', domain, 'config');
  const pkgPath = path.join(manifestDir, 'package-solution.json');
  if (!fs.existsSync(pkgPath)) {
    console.error(`MISSING: ${pkgPath}`);
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const solutionId = pkg.solution?.id;
  if (guids.has(solutionId)) {
    console.error(`COLLISION: solution ID ${solutionId} used by multiple domains`);
    hasCollision = true;
  }
  guids.add(solutionId);
}

if (!hasCollision) {
  console.log(`✅ All ${domains.length} solution GUIDs are unique`);
}
process.exit(hasCollision ? 1 : 0);
```

Add to `turbo.json` as a lint-adjacent task: `pnpm turbo run validate-manifests`.

---

## pnpm-workspace.yaml Verification

All 11 app directories are already included via `apps/*` glob. No changes needed to workspace config.

Verify:
```bash
grep -E "apps/\*" pnpm-workspace.yaml
```

---

## Verification

```bash
# Validate all manifests exist and have unique GUIDs
node tools/validate-manifests.ts

# Check package-solution.json schema
npx ajv validate -s node_modules/@microsoft/sp-build-web/node_modules/... \
  -d apps/accounting/config/package-solution.json

# Confirm port uniqueness across serve.json files
grep -h '"port"' apps/*/config/serve.json | sort | uniq -d
# Expected: no output (all ports unique)
```

---

## Definition of Done

- [ ] `config/package-solution.json` created for all 11 apps with unique solution GUIDs
- [ ] `[Domain]WebPart.manifest.json` created for all 11 apps with unique webpart GUIDs
- [ ] `config/serve.json` created for all 11 apps with ports 4001–4011
- [ ] `config/deploy-azure-storage.json` created for all 11 apps
- [ ] GUID table populated in this document (permanentrecord)
- [ ] `tools/validate-manifests.ts` created and runs without collisions
- [ ] No hardcoded secrets in any config file (storage credentials are env var references)
- [ ] `skipFeatureDeployment: true` set in all package-solution.json (enables tenant-wide deployment)
