# Prompt 01 Brand and Font Posture Audit

## Brand Archive and Governance Files

### Confirmed Present

- `docs/reference/brand/README.md`
- `docs/reference/brand/BRAND-ASSET-INVENTORY.md`
- `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`
- `docs/reference/brand/HB-Brand-Guide.zip`

### Confirmed Absent

- `docs/reference/brand/source/` (directory not present on current branch)

## Archive Path Posture

- **Current repo truth:** brand archive is currently located at `docs/reference/brand/HB-Brand-Guide.zip`.
- **Target governance posture:** source archive territory should be `docs/reference/brand/source/`.
- **Prompt 01 action:** no archive move/copy/reconciliation performed; deferred to later explicitly authorized prompt.

## Branding Registry and Asset Conventions

Verified in `packages/ui-kit/src/branding/index.ts`:

- Named exports:
  - `gritLogo`
  - `hbIconBlueBg`
  - `hbLogoIcon`
  - `hedrickLogo`
- Registry object:
  - `brandAssets` as a typed `const` map
  - `BrandAssetKey = keyof typeof brandAssets`

Verified current branding asset files under `packages/ui-kit/src/branding/assets/`:

- `grit-logo.jpg`
- `hb-icon-blue-bg.jpg`
- `hb-logo-icon.jpg`
- `hedrick-logo.png`

No changes were made to registry exports or branding asset files in Prompt 01.

## Font Convention and `@font-face` Posture

Repo-truth checks across inspected scope (`packages/ui-kit/src/theme`, `packages/ui-kit/src`, `apps/hb-webparts`, `apps/project-sites`, `packages/spfx`, docs references) found:

- existing typography convention is tokenized/system-stack centric (not custom brand-font binary loading);
- no active `@font-face` declarations found in the inspected Prompt 01 scope;
- existing docs discuss future governed font layer, subject to license/internal-use confirmation.

## SPFx Consumer Import-Policy Proof (Read-Only)

Evidence points:

- `apps/hb-webparts/.eslintrc.cjs` enforces homepage import restrictions away from broad `@hbc/ui-kit` paths.
- `docs/reference/ui-kit/entry-points.md` documents homepage import policy and allowed/prohibited entry points.
- Current brand asset consumption examples found from `@hbc/ui-kit/branding` in homepage consumers:
  - `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBanner.tsx`
  - `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`

No raw brand import from `docs/reference/brand/` was introduced by Prompt 01.

## Hard Font Guardrail Applied in Prompt 01

Prompt 01 performed documentation-only posture capture and did **not**:

- extract font binaries;
- inventory binary font contents by filename;
- move/copy font files;
- create `@font-face` declarations;
- expose fonts through new theme exports.
