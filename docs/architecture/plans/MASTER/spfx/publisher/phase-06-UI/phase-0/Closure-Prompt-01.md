# Closure Note — Phase 06 UI / Phase 0 / Prompt 01

**Step:** Close hosted list and runtime drift (Wave 0 Step 01)
**Status:** Closed in source; awaits tenant redeploy for live verification
**Built version:** hb-webparts Feature `1.0.0.264` / solution `1.0.0.253`
**New hosted bundle:** `hb-webparts-app-a6514738.js` (replaces legacy `hb-webparts-app-7657b695.js`)

## Problem

The deployed Article Publisher bundle still embedded legacy list descriptors
(`Project Spotlight Posts`, `Project Spotlight Post Team Members`, `Project
Spotlight Post Media`) even though the tenant was migrated to the `HB Article*`
family. Source seams already target `HB Article*`, but the hosted artifacts in
`tools/spfx-shell/assets/`, `tools/spfx-shell/release/assets/`, and
`apps/hb-webparts/dist/` had not been regenerated after the migration, so the
hosted runtime emitted list-404s against the legacy titles.

## Files changed

- `apps/hb-webparts/config/package-solution.json` — bumped to solution
  `1.0.0.253` / feature `1.0.0.264` to force a fresh tenant deploy.
- `apps/hb-webparts/dist/hb-webparts-app*.js` — regenerated (stale
  `*-7657b695.js` removed; new `*-a6514738.js` built).
- `tools/spfx-shell/assets/hb-webparts-app-*.js` — regenerated from new bundle.
- `tools/spfx-shell/release/assets/` — full refresh (new hashed
  `hb-webparts-app`, `shell-entry-*`, `shell-web-part_*`,
  `spfx-hb-webparts-*.css`).
- `tools/spfx-shell/release/manifests/*.manifest.json` — regenerated to point
  at the new per-webpart shim hashes.
- `tools/spfx-shell/config/package-solution.json` — synced from source.
- `dist/sppkg/hb-webparts.sppkg` — rebuilt (3208.5 KB).
- `dist/sppkg/hb-webparts-shim-proof.json`,
  `dist/sppkg/hb-webparts-package-truth-proof.json` — regenerated.

No source code in `apps/hb-webparts/src/**` required modification: the
publisher adapter/descriptor/repository/row-mapper seams were already aligned
with `HB Article*` (verified by targeted grep).

## Implementation summary

1. Confirmed via repo-truth grep that no runtime source file under
   `apps/hb-webparts/src/**` still referenced `Project Spotlight Post*`. The
   drift was limited to stale packaged/deployed artifacts.
2. Built `@hbc/spfx-hb-webparts` (`pnpm build`) and verified the fresh
   `hb-webparts-app.js` contains zero `Project Spotlight Post*` references.
3. Bumped solution and feature manifest versions in the canonical source
   config (`apps/hb-webparts/config/package-solution.json`).
4. Ran the full SPFx package orchestrator (`tsx
   tools/build-spfx-package.ts --domain hb-webparts`) which regenerated the
   content-hashed bundle, per-webpart shell-entry shims, compiled manifests,
   and the `.sppkg` payload, and wrote package-truth + shim proofs.

## Validation performed

- `pnpm --filter @hbc/spfx-hb-webparts build` → pass (tsc + vite).
- `tsx tools/build-spfx-package.ts --domain hb-webparts` → pass:
  - structural validity, freshness, semantic alignment, and live-runtime
    static proofs all `pass: true`.
  - packaged bundle freshness verified against source sha256 `a6514738…`.
  - 18 shell-entry shims packaged and verified.
- Static runtime drift scan:
  - `grep -c "Project Spotlight Post"
    tools/spfx-shell/{release/,}assets/hb-webparts-app-*.js
    apps/hb-webparts/dist/hb-webparts-app*.js` → `0` in every file.
  - No legacy hashed bundle (`*-7657b695.js`) remains on disk.

## Hosted / deployment follow-up

The .sppkg at `dist/sppkg/hb-webparts.sppkg` must be uploaded to the tenant App
Catalog and the updated solution accepted on the host site. Only after that
deploy will the hosted authoring surface load the regenerated bundle. Live
validation (Prompt 03 of this phase) should confirm that the hosted status
line and browser console no longer emit `Project Spotlight Post*` 404s when
loading queue, article, media, team, preview, and status tabs.

## Residual risk

- No source-level drift remains. Risk is limited to the operational step of
  actually publishing the new `.sppkg`; if a stale version is left in the App
  Catalog, clients will continue to load the legacy bundle from CDN cache.
- The content-hashed filename (`-a6514738.js`) forces cache invalidation on
  deploy, so once the App Catalog accepts the new package, SharePoint will
  fetch the fresh bundle on the next page load.
