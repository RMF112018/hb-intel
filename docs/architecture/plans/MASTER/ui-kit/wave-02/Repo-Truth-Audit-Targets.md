# Repo Truth Audit Targets

The local coding agent must inspect these paths before making changes.

## UI Kit Governance and Brand

- `docs/reference/ui-kit/README.md`
- `docs/reference/ui-kit/doctrine/README.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md`
- `docs/reference/ui-kit/entry-points.md`
- all `docs/reference/ui-kit/*.md` component, layout, pattern, audit, and deprecated-token references
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`
- `docs/reference/spfx-surfaces/benchmark/**`
- `docs/reference/brand/README.md`
- `docs/reference/brand/BRAND-ASSET-INVENTORY.md`
- `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`
- `docs/reference/brand/source/**` or the actual checked-in brand-kit location under `docs/reference/brand/`
- `packages/ui-kit/src/branding/index.ts`
- `packages/ui-kit/src/branding/assets/**`
- `packages/ui-kit/src/theme/**`
- `packages/ui-kit/package.json`, `packages/ui-kit/tsconfig.json`, and relevant build/test config
- relevant SPFx consumers for import-policy proof only: `apps/hb-webparts/**`, `apps/project-sites/**`, `packages/spfx/**`


## Required Searches

Run targeted repo searches for:

```text
UI Doctrine
SPFx Governing Standard
Homepage Overlay
PWA Governing Standard
Productive-Lane-Standard
Presentation-Lane-Standard
UI-System-Layer-Model
homepage-uiux-audit-scorecard
homepage-uiux-audit-checklist
homepage-uiux-audit-evidence
48+/56
benchmark-grade
hard stop failures
entry-points
@hbc/ui-kit/branding
brandAssets
font-face
Futura
HB-Brand-Guide
BRAND-ASSET-INVENTORY
BRAND-USAGE-GOVERNANCE
PCC
Project Control Center
bento
masonry
command center
cockpit
component reference only
supersedes
supersession
```

## Questions to Answer During Prompt 01

- Do the new `docs/reference/brand/` files exist on the working branch?
- Where exactly is the brand kit archive saved?
- Does `packages/ui-kit/src/branding/index.ts` still export the existing `brandAssets` registry?
- What asset file types are accepted by the ui-kit build pipeline?
- Does the repo already have a font loading convention?
- Are there existing `@font-face` definitions?
- Are there lint/build/test commands for `@hbc/ui-kit`?
- Which docs are current authority and which are historical/planning-only?
- Which component reference docs need governance-status headers?
