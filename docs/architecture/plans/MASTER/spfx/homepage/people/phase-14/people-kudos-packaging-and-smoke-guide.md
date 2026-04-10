# Packaging and Smoke Validation Guide

Phase-14 testing package · Prompt-05 deliverable.

## What the smoke suite validates

The smoke suite at `scripts/testing/people-kudos/smoke/index.ts` runs 41 assertions covering 5 areas. No SharePoint tenant access is required — all checks are against local file system artifacts.

### 1. Build artifact existence (7 steps)
- `apps/hb-webparts/dist/` directory exists
- `hb-webparts-app.js` exists and is > 100 KB
- `spfx-hb-webparts.css` exists and is > 10 KB
- `apps/hb-webparts/config/package-solution.json` exists with version field

### 2. Manifest inclusion (6 steps)
- `tools/spfx-shell/config/package-solution.json` `componentIds` array includes all 5 refactored surface GUIDs:
  - HB Kudos (`f14e59a3-…`)
  - HB Kudos Companion (`a8c5d9e2-…`)
  - People Culture merged (`27ac10f4-…`)
  - People Culture Public (`e39d9662-…`)
  - People Culture Companion (`7c3f8e24-…`)
- Reports total componentIds count (expected: 16)

### 3. Shell-entry shim parity (12 steps)
- Counts `shell-entry-*.js` files in `tools/spfx-shell/release/assets/`
- Verifies each refactored surface GUID has a matching shell-entry shim
- Counts `.manifest.json` files in `tools/spfx-shell/release/manifests/`
- Verifies each refactored surface GUID has a matching release manifest

### 4. Stale-artifact detection (1 step)
- Compares `mtime` of `dist/hb-webparts-app.js` against `release/assets/hb-webparts-app-*.js`
- Warns if delta exceeds 60 minutes (signals a stale release build)

### 5. Refactored surface registration (9 steps)
- Verifies source `.manifest.json` exists for each of the 5 surfaces
- Reports component id + version from each manifest
- Verifies runtime `.tsx` entry file exists for the 4 non-legacy surfaces

## Running the smoke suite

```bash
# Standalone
npx tsx scripts/testing/people-kudos/runSuite.ts --suite smoke --dry-run

# As part of the full suite
npx tsx scripts/testing/people-kudos/runAll.ts --dry-run
```

The smoke suite does NOT require `--live` mode — it reads local files only.

## When to run

- After any `pnpm --filter @hbc/spfx-hb-webparts build`
- After any `npx tsx tools/build-spfx-package.ts --domain hb-webparts`
- Before committing a version bump
- As part of the full test suite dry-run

## Expected output

All 41 steps should pass. A `warn` on `smoke.stale.freshness` means the release assets are older than the dist build and should be regenerated via the SPFx packaging orchestrator.
