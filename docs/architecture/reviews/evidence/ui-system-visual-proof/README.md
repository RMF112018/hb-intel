# UI System Visual Proof — Evidence Index

**Date:** 2026-04-08
**Purpose:** Consumer-tied visual evidence for migrated homepage presentation-lane surfaces
**Capture method:** Playwright screenshot capture against Storybook static build (Chromium)
**Storybook version:** 8.6.0 (ui-kit)
**Script:** `scripts/capture-visual-proof.ts` with `scripts/capture-visual-proof.config.ts`

---

## Shared-Surface Consumer Proof

Each shared surface family component was rendered in Storybook with representative mock data matching the real consumer's composition pattern.

| Surface Family | Primary Consumer | Desktop | Tablet | Story ID |
|---|---|---|---|---|
| `HbcSignatureHeroSurface` | HbHeroBanner | [desktop](HbcSignatureHeroSurface--desktop.png) | [tablet](HbcSignatureHeroSurface--tablet.png) | `homepage-surfaces-hbcsignatureherosurface--default` |
| `HbcCommandSurface` | PriorityActionsRail | [desktop](HbcCommandSurface--desktop.png) | [tablet](HbcCommandSurface--tablet.png) | `homepage-surfaces-hbccommandsurface--default` |
| `HbcDiscoverySurface` | SmartSearchWayfinding | [desktop](HbcDiscoverySurface--desktop.png) | [tablet](HbcDiscoverySurface--tablet.png) | `homepage-surfaces-hbcdiscoverysurface--default` |
| `HbcEditorialSurface` | LeadershipMessage | [desktop](HbcEditorialSurface--desktop.png) | [tablet](HbcEditorialSurface--tablet.png) | `homepage-surfaces-hbceditorialsurface--default` |
| `HbcOperationalSurface` | SafetyFieldExcellence | [desktop](HbcOperationalSurface--desktop.png) | [tablet](HbcOperationalSurface--tablet.png) | `homepage-surfaces-hbcoperationalsurface--default` |

## Variant Proof

| Variant | Artifact | Story ID |
|---|---|---|
| SignatureHero — compact layout | [desktop](HbcSignatureHeroSurface-compact--desktop.png) | `homepage-surfaces-hbcsignatureherosurface--compact-layout` |
| CommandSurface — high urgency | [desktop](HbcCommandSurface-high-urgency--desktop.png) | `homepage-surfaces-hbccommandsurface--high-urgency` |
| CommandSurface — critical urgency | [desktop](HbcCommandSurface-critical-urgency--desktop.png) | `homepage-surfaces-hbccommandsurface--critical-urgency` |

## Artifact Inventory

13 PNG screenshots total:
- 10 default-state captures (5 surfaces x 2 viewports: 1280px desktop, 768px tablet)
- 3 variant captures (compact hero, high urgency command, critical urgency command)

## Reproduction

```bash
# Rebuild Storybook
pnpm --filter @hbc/ui-kit build-storybook

# Serve and capture
npx http-server packages/ui-kit/storybook-static -p 6007 -s &
npx playwright test scripts/capture-visual-proof.ts --config=scripts/capture-visual-proof.config.ts
```
