# 08 — Audit Context Notes

## Current repo-truth observations to preserve during implementation

### Hero Banner
- `HbHeroBanner` is currently a thin standalone editorial hero consumer built on `HbcSignatureHeroSurface`.
- It normalizes props through `normalizeHeroBannerConfig`.
- Its current manifest is hidden from toolbox and intended as a standalone/non-flagship hero.

### Signature Hero
- `HbSignatureHero` remains the canonical homepage flagship identity surface.
- Do not flatten it into the admin-managed editorial Hero Banner.

### Greeting logic
- Current greeting logic uses simple hour thresholds in `greeting.ts`.
- This must be updated as a shared helper change, not as duplicated view logic.

### Existing reusable patterns
- list-backed homepage config reads already exist in the repo and should be reused in principle
- companion/admin patterns already exist in the repo and should be reused in principle
- shell mount and property-pane integration already use explicit webpart IDs and must remain single-source-of-truth

## Locked host facts

- **Admin hosting page:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SitePages/Homepage-Admin.aspx`
- **Controlled public homepage:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

## Strict doctrine reminder

Every implementation prompt in this package assumes strict compliance with:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Any shortcut that conflicts with those files is out of bounds.

## Interpretation guardrail

This package is for:
1. greeting-awareness refinement, and
2. an admin-managed config system for the standalone Hero Banner that controls the HBCentral homepage banner from the dedicated admin page.

It is not a mandate to:
- redesign the flagship `HbSignatureHero`
- broaden into a generic content-management system
- collapse homepage personas into one visual family recipe
