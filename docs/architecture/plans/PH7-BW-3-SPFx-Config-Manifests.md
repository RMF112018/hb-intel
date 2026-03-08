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
| accounting | 7dca8e93-b2fb-4e06-9e4b-d14118f87990 | cf3c98bf-ff78-4f00-bd6d-c304433d959e | fbb5ac04-cf50-458b-91dd-3784de51a7af | 4001 |
| estimating | d01a9600-a68a-4afe-83a5-514339f47dbb | 3c4dbd5c-5bec-4014-8b77-737ac725a5cc | cb3b1520-1665-4412-83ab-344c2182a2fd | 4002 |
| project-hub | 84a37e6a-f1ac-4d0b-8cb6-0421812a59c4 | 0be76e1d-593d-472e-9969-30bdd07881fb | bdea1d8b-4779-4b46-af41-be3b66c5df14 | 4003 |
| leadership | 8495e122-6945-44e4-863d-e206beffeaad | f88e7ed1-016a-487a-a04a-1a6b286dca93 | bc9c7dcb-f49b-4901-843a-648c66c19911 | 4004 |
| business-development | c7a1a2ae-cab2-4d37-89b6-008b44a454e0 | 47470bf6-192a-4d72-a905-0d8e5a71ac37 | f3511fee-63aa-402c-a198-2002c79572a5 | 4005 |
| admin | a77a1dbc-7ba3-42e1-b8f1-3524550dd136 | cfade002-7ec3-4939-92bf-4aec3e2162e7 | 5a33a204-be56-448d-8dc3-bce7631594db | 4006 |
| safety | e78a16be-7853-40a4-be18-3b01b3ca405d | ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e | 2673ffd9-9581-4cdb-9261-7b8bfb604baa | 4007 |
| quality-control-warranty | 95508e50-b68a-48a5-b505-0d5f05c6c954 | d4c56ae6-c4cf-4505-a663-a68293e1651c | 65168a80-fa11-46c4-b595-55cdc78c0233 | 4008 |
| risk-management | 36e2f704-63f5-47b2-b989-5775c84a2780 | 639db52b-2e01-4a45-9cc7-2fcd94ab7997 | c4d6a151-9c97-45f4-8e47-86b87a3a0cb3 | 4009 |
| operational-excellence | 18cb387e-74fa-4de2-8b23-3da666b393fb | a1bc7020-d27f-40a6-9e50-f40610bbd8f3 | 5f4db6cf-047f-4c73-bad2-eb1ec057ecc9 | 4010 |
| human-resources | 01e48e3d-fc8f-4271-a8c9-958f4a037ece | 37ba7b53-b62f-4a5f-bfed-5b459085b30c | d5c485ac-c705-48a7-95cd-e881d8e3027e | 4011 |

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

<!-- IMPLEMENTATION PROGRESS & NOTES
BW-3 completed: 2026-03-08
- Generated and locked 33 GUIDs (3 per domain: solution, webpart, feature) — recorded in GUID table above
- Created 11 config/package-solution.json with unique solution GUIDs, skipFeatureDeployment: true, isDomainIsolated: false
- Created 11 config/serve.json with ports 4001–4011, placeholder tenant URL
- Created 11 config/deploy-azure-storage.json with env var references (no hardcoded secrets)
- Created 11 [Domain]WebPart.manifest.json in apps/[domain]/src/webparts/[sub]/
- Created tools/validate-manifests.ts — validates file existence, GUID uniqueness (33), port uniqueness (11)
- Added validate-manifests task to turbo.json
- Validation passes: 33 unique GUIDs, 11 unique ports, 44 files present
- Build verified: 24/24 tasks pass
Next: BW-4 (Vite Bundle Config)
-->
