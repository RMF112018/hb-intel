# PCC SPFx Packaging Contract Closeout

## Objective

Create the Project Control Center (PCC) SPFx packaging contract so the repository can build a local uploadable `.sppkg` artifact through the existing SPFx shell orchestrator path.

## Changed Files

- `tools/build-spfx-package.ts`
- `apps/project-control-center/config/package-solution.json`
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json`
- `apps/project-control-center/src/mount.tsx`
- `docs/architecture/reviews/spfx/project-control-center/pcc-spfx-packaging-contract-closeout.md`

## Fixed PCC IDs

- PCC web part/component ID: `6f5f3be4-6ec8-4b3f-8fd5-0f97d7612d27`
- PCC solution ID: `1bfcc4f0-d947-42d2-81c7-c6c2f2ab5923`
- PCC feature ID: `0ef9e6c6-89b6-48a9-bb8f-7e7163d83f2a`

## Packaging Command

- `npx tsx tools/build-spfx-package.ts --domain project-control-center`
- Result: success after adding PCC runtime marker emission in app bundle

## Output Artifact

- `dist/sppkg/hb-intel-project-control-center.sppkg`

## Bundle-in-Package Proof

Command:

```bash
unzip -Z1 dist/sppkg/hb-intel-project-control-center.sppkg | grep 'project-control-center-app'
```

Observed:

```text
ClientSideAssets/project-control-center-app-7beb1b88.js
```

## IIFE Global Proof

Commands:

```bash
APP_BUNDLE_PATH="$(unzip -Z1 dist/sppkg/hb-intel-project-control-center.sppkg | grep 'project-control-center-app' | head -1)"
unzip -p dist/sppkg/hb-intel-project-control-center.sppkg "$APP_BUNDLE_PATH" | grep '__hbIntel_projectControlCenter'
```

Observed: bundled runtime includes `__hbIntel_projectControlCenter`.

## Lockfile MD5 Proof

- Before: `MD5 (pnpm-lock.yaml) = c56df7b79986896624536aab74d609f4`
- After: `MD5 (pnpm-lock.yaml) = c56df7b79986896624536aab74d609f4`

## Tenant Posture

No tenant upload was performed.
No tenant app catalog deployment was performed.
No SharePoint/Graph/Procore/Sage/external-system mutation was performed.

## Validation Summary

- `git diff --check`: pass
- `pnpm --filter @hbc/models build`: pass
- `pnpm --filter @hbc/spfx-project-control-center check-types`: pass
- `pnpm --filter @hbc/spfx-project-control-center test`: **fails** (pre-existing route-count assertions in `src/api/pccReadModelClient.test.ts`)
- `pnpm --filter @hbc/spfx-project-control-center build`: pass
- `npx tsx tools/build-spfx-package.ts --domain project-control-center`: pass
- `test -f dist/sppkg/hb-intel-project-control-center.sppkg`: pass
- `unzip app bundle proof`: pass
- `IIFE global proof`: pass
- `pnpm exec prettier --check ...`: pass after formatting
- `md5 pnpm-lock.yaml`: unchanged

## Residual Risks / Next Steps

1. Resolve PCC test expectations in `src/api/pccReadModelClient.test.ts` for the expanded route list so the package can be committed under the strict stop-condition gate.
2. Optionally add a domain-specific automated assertion for the runtime marker GUID presence to catch regressions earlier than package-truth stage.
