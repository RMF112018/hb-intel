# Prompt 02 — Align Launcher Version and Manifest Truth

## Objective
Make package/runtime truth for the homepage launcher boundary clean, consistent, and easy to verify.

## Governing repo authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Files / seams to inspect
- `packages/homepage-launcher/package.json`
- `packages/homepage-launcher/src/constants.ts`
- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- launcher-focused proof files under `e2e/webparts/` and `e2e/live-sharepoint/`

## Current gap to close
The runtime marker claims `1.1.72.0`, the homepage package/manifest version is also `1.1.72.0`, but:
- the dedicated launcher package itself is still `0.1.0`
- the two homepage manifests are not textually aligned
- proof is strong but package-truth cleanliness is not complete

## Required implementation outcome
Do all of the following:
- choose and implement one clear versioning strategy for `@hbc/homepage-launcher`
- either align its package version to the active launcher boundary or explicitly codify the intentional decoupling
- align both homepage manifest descriptions and any adjacent package-solution text that should describe the same active launcher boundary
- add or tighten proof assertions so drift across these seams is caught automatically

## Proof of closure required
Provide:
- the final versioning strategy in one paragraph
- all files changed
- a concise seam table showing final values for:
  - dedicated launcher package version
  - dedicated launcher runtime constant
  - homepage package-solution version
  - both homepage manifest versions
- proof that automated checks will now fail if these seams drift again

## Prohibitions
- no unrelated feature work
- no hidden manual-only validation
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
