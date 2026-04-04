# 04B — HB Hero Banner Authoring and Config Contract

## Purpose

Define Prompt-04 hero-banner authoring and normalization rules for downstream homepage prompts.

## Contract Surface

- Webpart module: `apps/hb-webparts/src/webparts/hbHeroBanner/`
- Manifest baseline: `HbHeroBannerWebPart.manifest.json`
- Config contract: `HbHeroBannerConfig`
- Normalization seam: `normalizeHeroBannerConfig`

## Authoring Rules

- `headline` is required for authored hero mode.
- `message`, `metadata`, `background`, and `cta` are optional and normalized.
- CTA is only enabled when both label and href are non-empty after trim.
- Motion remains reduced-motion-safe through homepage contract hook usage.
- Light-theme-first rendering is required for top-band composability.

## Empty-State and Loading Policy

- Missing authored hero headline renders a clear empty state for site-owner action.
- Authoring gaps are treated as configuration issues, not runtime failures.

## Ownership and Maintenance

- Hero authored fields are owned by homepage site owners/content stewards.
- Shared normalization and rendering seams are owned by `hb-webparts` app maintainers.
- Feature prompts may consume hero contract but must not fork independent hero data models.
