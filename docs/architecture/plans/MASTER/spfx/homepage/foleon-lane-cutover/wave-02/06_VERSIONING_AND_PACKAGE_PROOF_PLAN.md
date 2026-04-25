# 06 — Versioning And Package Proof Plan

## Homepage Versioning

Repo truth during planning showed homepage version `1.1.76.0` already present in:

- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `packages/homepage-launcher/src/constants.ts`

Before implementation, confirm whether those changes are committed on main.

If the execution baseline is `1.1.75.0`, Wave 02 should bump homepage coherently to `1.1.76.0`.

If the execution baseline is already `1.1.76.0`, Wave 02 should bump to the next appropriate SharePoint 4-part version, likely `1.1.77.0`, because the homepage package is changing for tenant deployment.

## Version-Bearing Files To Check

Homepage authority:

- `apps/hb-homepage/config/package-solution.json`
  - `solution.version`
  - `solution.features[0].version`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
  - `version`

Additional repo guardrails:

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
  - `version`
- `packages/homepage-launcher/src/constants.ts`
  - `HOMEPAGE_LAUNCHER_VERSION`
- e2e expected version files if present:
  - `e2e/webparts/hb-homepage-host-fit.spec.ts`
  - `e2e/webparts/hb-homepage-handheld-closure-proof.spec.ts`
  - `e2e/live-sharepoint/homepage.launcher.handheld.live.spec.ts`

## Foleon Versioning

Current Foleon deployed package truth is `1.0.21.0`.

Do not bump Foleon unless Wave 02 changes deployable Foleon source or a shared package API change is packaged through the standalone Foleon package.

If `@hbc/foleon-reader` only adds an optional homepage-consumed status callback and no Foleon package artifact is produced, document it as source-only for Foleon and do not leave package proof stale.

If a Foleon artifact is rebuilt, bump coherently from `1.0.21.0` to the next version and run the full Foleon package proof chain.

## Homepage Package Proof

Run:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-homepage
```

Expected artifacts:

- `dist/sppkg/hb-intel-homepage.sppkg`
- `dist/sppkg/hb-homepage-package-truth-proof.json`
- `dist/sppkg/hb-homepage-shim-proof.json`
- `dist/sppkg/hb-intel-homepage-effectiveness-proof.json`

Inspect `dist/sppkg/hb-intel-homepage-effectiveness-proof.json`:

- `versionAuthority.aligned === true`
- `checks.versionAuthorityAligned.pass === true`
- `checks.flagshipMarkersPresent.pass === true`
- `checks.homepageBannerAssetsPresent.pass === true`
- packaged app bundle SHA reflects current source

Run focused authority test:

```bash
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage/__tests__/hbHomepagePackageAuthority.test.ts
```

Run banner archive check:

```bash
unzip -Z1 dist/sppkg/hb-intel-homepage.sppkg | rg "ClientSideAssets/banner_home_7_(morning|mid-day|evening|night)\\.png"
```

## Artifact Staging Policy

Do not modify `.sppkg` directly.

Generated package artifacts are expected to exist in `dist/sppkg`. Report artifact path and git staged status in closure. Do not stage generated artifacts unless repo convention or user request requires it.
