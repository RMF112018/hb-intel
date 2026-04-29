# Prompt 05 Evidence and Update Notes

## Objective Coverage

Prompt 05 curated stable reusable corporate logo marks from `docs/reference/brand/HB-Brand-Guide.zip` into `packages/ui-kit/src/branding/assets/` and exposed them through `@hbc/ui-kit/branding`.

## Declaration Setup Verification

Verified prior to curation:

- `packages/ui-kit/types/ambient-assets.d.ts` already includes `*.svg` declaration.
- `packages/ui-kit/tsconfig.json` includes `types/**/*.d.ts`.
- No new declaration file and no modification to existing declaration files were required.

## Extraction Safety

- Used targeted extraction to temp directory with archive path context preserved.
- Did not use blind `unzip -j`.
- Copied only selected approved logo files into branding assets.

## Scope and Guardrails

- No font files copied/extracted/moved.
- No archive relocation.
- No PDF copy.
- No app-local brand asset placement.
- No product/runtime/backend/CI-CD/deployment/version/lockfile/manifest changes.

## Option B Corrective Patch

- Applied Option B for Reef Arches SVG safety remediation.
- Removed `reefArchesLogo` active export and `brandAssets` key from `@hbc/ui-kit/branding`.
- Deleted `packages/ui-kit/src/branding/assets/reef-arches-logo.svg` from curated implementation assets because the source SVG is not self-contained.
- Active registry now exposes `reefArchesLogoPng` only for Reef Arches.
