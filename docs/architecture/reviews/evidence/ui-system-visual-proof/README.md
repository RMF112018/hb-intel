# UI System Visual Proof — Evidence Index

**Date:** 2026-04-21  
**Purpose:** Closure-grade visual proof for homepage shared surfaces with expanded Safety state matrix  
**Capture method:** Playwright screenshot capture against Storybook static build (Chromium)  
**Script:** `scripts/capture-visual-proof.ts` with `scripts/capture-visual-proof.config.ts`

---

## Shared-Surface Consumer Proof

| Surface Family | Primary Consumer | Desktop | Tablet | Story ID |
|---|---|---|---|---|
| `HbcSignatureHeroSurface` | `HbHeroBanner` | [desktop](HbcSignatureHeroSurface--desktop.png) | [tablet](HbcSignatureHeroSurface--tablet.png) | `homepage-surfaces-hbcsignatureherosurface--default` |
| `HbcCommandSurface` | `PriorityActionsRail` | [desktop](HbcCommandSurface--desktop.png) | [tablet](HbcCommandSurface--tablet.png) | `homepage-surfaces-hbccommandsurface--default` |
| `HbcDiscoverySurface` | `SmartSearchWayfinding` | [desktop](HbcDiscoverySurface--desktop.png) | [tablet](HbcDiscoverySurface--tablet.png) | `homepage-surfaces-hbcdiscoverysurface--default` |
| `HbcEditorialSurface` | `LeadershipMessage` | [desktop](HbcEditorialSurface--desktop.png) | [tablet](HbcEditorialSurface--tablet.png) | `homepage-surfaces-hbceditorialsurface--default` |
| `HbcSafetyHomepageSurface` | `SafetyFieldExcellence` | [desktop](HbcSafetyHomepageSurface--desktop.png) | [tablet](HbcSafetyHomepageSurface--tablet.png) | `homepage-surfaces-hbcsafetyhomepagesurface--standard` |

## Safety Matrix Proof (Closure Focus)

All routes are captured in Storybook iframe mode using:

- `/iframe.html?id=homepage-surfaces-hbcsafetyhomepagesurface--<story>&viewMode=story`

| Safety state | Desktop | Tablet | Story ID | Validation intent |
|---|---|---|---|---|
| `standard` | [desktop](HbcSafetyHomepageSurface--desktop.png) | [tablet](HbcSafetyHomepageSurface--tablet.png) | `homepage-surfaces-hbcsafetyhomepagesurface--standard` | Baseline premium operational composition with decisive hierarchy (posture, primary, secondary rail, CTA). |
| `compact` | [desktop](HbcSafetyHomepageSurface-compact--desktop.png) | [tablet](HbcSafetyHomepageSurface-compact--tablet.png) | `homepage-surfaces-hbcsafetyhomepagesurface--compact` | Shell-fit compact mode reduces information density without collapsing into a generic card stack. |
| `minimal` | [desktop](HbcSafetyHomepageSurface-minimal--desktop.png) | [tablet](HbcSafetyHomepageSurface-minimal--tablet.png) | `homepage-surfaces-hbcsafetyhomepagesurface--minimal` | Narrow mode preserves signal priority while intentionally trimming metadata. |
| `one-primary-signal` | [desktop](HbcSafetyHomepageSurface-one-primary-signal--desktop.png) | [tablet](HbcSafetyHomepageSurface-one-primary-signal--tablet.png) | `homepage-surfaces-hbcsafetyhomepagesurface--one-primary-signal` | Primary-only posture remains authoritative and does not visually stress with an empty secondary lane. |
| `multiple-active-signals` | [desktop](HbcSafetyHomepageSurface-multiple-active-signals--desktop.png) | [tablet](HbcSafetyHomepageSurface-multiple-active-signals--tablet.png) | `homepage-surfaces-hbcsafetyhomepagesurface--multiple-active-signals` | Multi-signal load remains bounded and legible with explicit severity hierarchy. |
| `stale-content` | [desktop](HbcSafetyHomepageSurface-stale-content--desktop.png) | [tablet](HbcSafetyHomepageSurface-stale-content--tablet.png) | `homepage-surfaces-hbcsafetyhomepagesurface--stale-content` | Stale/degraded communication is explicit and safety-forward (notice + stale indicators). |
| `empty-state-applicable` | [desktop](HbcSafetyHomepageSurface-empty-state--desktop.png) | [tablet](HbcSafetyHomepageSurface-empty-state--tablet.png) | `homepage-surfaces-hbcsafetyhomepagesurface--empty-state-applicable` | Empty/no-signal presentation remains intentional and non-brittle. |
| `invalid-state-applicable` | [desktop](HbcSafetyHomepageSurface-invalid-state--desktop.png) | [tablet](HbcSafetyHomepageSurface-invalid-state--tablet.png) | `homepage-surfaces-hbcsafetyhomepagesurface--invalid-state-applicable` | Invalid authoring posture is represented as a guided degraded state rather than a broken UI shell. |
| `runtime-error-state-applicable` | [desktop](HbcSafetyHomepageSurface-runtime-error-state--desktop.png) | [tablet](HbcSafetyHomepageSurface-runtime-error-state--tablet.png) | `homepage-surfaces-hbcsafetyhomepagesurface--runtime-error-state-applicable` | Runtime disruption state shows guarded fallback posture and clear operator action path. |

## Additional Variant Proof

| Variant | Artifact | Story ID |
|---|---|---|
| SignatureHero — compact layout | [desktop](HbcSignatureHeroSurface-compact--desktop.png) | `homepage-surfaces-hbcsignatureherosurface--compact-layout` |
| CommandSurface — high urgency | [desktop](HbcCommandSurface-high-urgency--desktop.png) | `homepage-surfaces-hbccommandsurface--high-urgency` |
| CommandSurface — critical urgency | [desktop](HbcCommandSurface-critical-urgency--desktop.png) | `homepage-surfaces-hbccommandsurface--critical-urgency` |

## Artifact Inventory

`29` PNG screenshots generated in this capture cycle:

- `10` default-state captures (5 surfaces x 2 viewports)
- `3` non-safety variant captures
- `16` safety matrix captures (8 states x 2 viewports)

## Reproduction

```bash
pnpm --filter @hbc/ui-kit build-storybook
npx playwright test scripts/capture-visual-proof.ts --config=scripts/capture-visual-proof.config.ts
```
