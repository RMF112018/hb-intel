# Phase B-01 — Repo Truth and Top-Band Contract

## Status: Complete

## Objective

Audit the live repo state for the homepage top band and produce the exact implementation contract for Phase B before any visual redesign work begins.

---

## 1. Repo-Truth Audit — Exact Target Files

### 1.1 Homepage composition layer (`apps/hb-webparts`)

| File | Role | Lines |
|------|------|-------|
| `src/homepage/ReferenceHomepageComposition.tsx` | Authoritative composition reference; renders all 10 webparts in 5-zone layout | 332 |
| `src/homepage/shared/HomepageTopBandPair.tsx` | Flex layout wrapper composing welcome + hero side-by-side | 42 |
| `src/homepage/shared/HomepageRailShell.tsx` | Horizontal flex layout utility for zone rail arrangements | 29 |
| `src/homepage/shared/HomepageSectionShell.tsx` | Accessible section wrapper delegating to `HbcHomepageSectionShell` | 42 |

### 1.2 Top-band webpart components (`apps/hb-webparts`)

| File | Role | Lines | `@hbc/ui-kit/homepage` imports |
|------|------|-------|-------------------------------|
| `src/webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.tsx` | Personalized greeting with time-based welcome, support/context lines, optional alert | 51 | `HbcHomepageSurfaceCard`, `HbcHomepageMetadataRow`, `HbcStatusBadge`, `HBC_HOMEPAGE_BRAND_FOUNDATION`, `HBC_HOMEPAGE_TYPOGRAPHY` |
| `src/webparts/hbHeroBanner/HbHeroBanner.tsx` | Editorial hero banner with headline, message, gradient background, CTA | 62 | `HbcHomepageSurfaceCard`, `HbcHomepageCta`, `HbcHomepageMetadataRow`, `useHomepageReducedMotion` |

### 1.3 Top-band contracts, helpers, and tokens (`apps/hb-webparts`)

| File | Role | Lines |
|------|------|-------|
| `src/homepage/webparts/topBandContracts.ts` | TypeScript interfaces + defaults for `PersonalizedWelcomeHeaderConfig` and `HbHeroBannerConfig` | 36 |
| `src/homepage/helpers/topBandConfig.ts` | Normalization logic for welcome header and hero banner config | 36 |
| `src/homepage/helpers/welcomeMessage.ts` | Combines time-based greeting + first name into headline | 18 |
| `src/homepage/helpers/greeting.ts` | Time-of-day greeting resolution (morning/afternoon/evening) | 17 |
| `src/homepage/helpers/identity.ts` | First-name resolution from identity object | 29 |
| `src/homepage/models/contentModels.ts` | Shared data structures: `HomepageCtaLink`, `HomepageMediaSlot` | 44 |
| `src/homepage/tokens.ts` | Full local token system (spacing, radius, borders, hero, welcome, motion, zones) | 314 |
| `src/homepage/homepage-interactive.module.css` | CSS module for interactive states (CTA hover, focus-visible, reduced-motion) | 70 |
| `src/homepage/helpers/authoringGovernance.ts` | Governance registry including top-band webpart ownership and freshness | 219 |

### 1.4 Shared-kit primitives currently consumed by top band (`packages/ui-kit`)

| Component | File | Role | Top-band consumers |
|-----------|------|------|-------------------|
| `HbcHomepageSurfaceCard` | `src/HbcHomepageSurfaceCard/index.tsx` | Surface-class-aware card with weight mapping | Welcome, Hero |
| `HbcHomepageCta` | `src/HbcHomepageCta/index.tsx` | Branded CTA with link/button/secondary variants | Hero |
| `HbcHomepageMetadataRow` | `src/HbcHomepageMetadataRow/index.tsx` | Flex row for badges and metadata | Welcome, Hero |
| `HbcHomepageSectionShell` | `src/HbcHomepageSectionShell/index.tsx` | Accessible section wrapper with heading | HomepageTopBandPair |
| `HbcStatusBadge` | `src/HbcStatusBadge/` | Status badge with severity variants | Welcome (alert) |
| `useHomepageReducedMotion` | `src/hooks/usePrefersReducedMotion.ts` | Reduced-motion hook | Hero |
| `HBC_HOMEPAGE_BRAND_FOUNDATION` | `src/homepage.ts` (inline const) | Primary blue, secondary orange, posture tokens | Welcome |
| `HBC_HOMEPAGE_TYPOGRAPHY` | `src/homepage.ts` (inline const) | Typography aliases mapped to ui-kit scale | Welcome |

### 1.5 Homepage barrel and guardrails (`packages/ui-kit`)

| File | Role |
|------|------|
| `src/homepage.ts` | Constrained entry point (`@hbc/ui-kit/homepage`) — 6 Phase 11A primitives, 6 foundational components, 1 hook, 4 governance/token objects |
| `src/theme/typography.ts` | Typography scale: display, heading1-4, body, bodySmall, label |
| `src/theme/grid.ts` | Spacing tokens: HBC_SPACE_XS through HBC_SPACE_XXL; breakpoints |
| `src/theme/radii.ts` | Border radius tokens: HBC_RADIUS_NONE through HBC_RADIUS_FULL |
| `src/theme/density.ts` | Density tier system (compact/comfortable/touch) |

---

## 2. Current Architecture Assessment

### 2.1 What works well

- **Composition pattern is clean.** `HomepageTopBandPair` composes welcome and hero as flex siblings with clear min-width and flex-ratio constraints.
- **Shared primitives are well-scoped.** Phase 11A primitives (`HbcHomepageSurfaceCard`, `HbcHomepageCta`, `HbcHomepageMetadataRow`) provide real reuse across all 10 webparts.
- **Token system is disciplined.** `tokens.ts` centralizes all spacing, border, motion, focus, and zone styling decisions locally.
- **Accessibility is present.** Reduced-motion support, focus-visible, semantic landmarks, ARIA labels all exist.
- **Import discipline is enforced.** All homepage imports use `@hbc/ui-kit/homepage` — no prohibited root imports.

### 2.2 What limits the top band today

1. **Welcome header uses generic `HbcHomepageSurfaceCard surface="hero"`** — there is no differentiated welcome-surface visual treatment. The welcome header looks like a competent card, not a signature greeting.

2. **Welcome greeting hierarchy is flat.** The 1.5rem heading, single support line, and optional context line create a uniform text block without visual presence or authority.

3. **Hero banner gradient is visually solid but structurally basic.** The `<section>` inside `HbcHomepageSurfaceCard` renders headline + message + CTA in a single vertical flow with no editorial hierarchy, no layered treatment, and no secondary CTA option.

4. **Hero CTA uses `variant="link"` only.** The design brief calls for premium primary CTA treatment — the current text-link-with-arrow is understated for a flagship surface.

5. **No shared top-band visual language exists in `@hbc/ui-kit`.** The two surfaces share `HbcHomepageSurfaceCard` and `HbcHomepageMetadataRow` but have no top-band-specific primitives that establish visual cohesion between welcome and hero.

6. **Local tokens carry surface-specific styling.** `HP_HERO` (gradients, text color) and `HP_WELCOME` (accent width, greeting size) are defined in the app-local `tokens.ts`. If future top-band surfaces outside the homepage need similar treatment, these would need to move.

7. **No secondary CTA contract exists.** `HbHeroBannerConfig.cta` is a single `HomepageCtaLink`. The hero banner cannot express a secondary CTA.

---

## 3. Phase B Implementation Contract

### 3.1 What stays in `apps/hb-webparts` (homepage-local)

| Concern | Files | Rationale |
|---------|-------|-----------|
| Welcome header authored composition | `PersonalizedWelcomeHeader.tsx` | Homepage-specific authored content — not reusable outside homepage |
| Hero banner authored composition | `HbHeroBanner.tsx` | Homepage-specific authored content |
| Top-band pair flex layout | `HomepageTopBandPair.tsx` | Homepage-specific zone composition |
| Config contracts + normalization | `topBandContracts.ts`, `topBandConfig.ts` | Homepage-specific authoring contracts |
| Greeting, identity, welcome-message helpers | `greeting.ts`, `identity.ts`, `welcomeMessage.ts` | Homepage-local personalization logic |
| Local design tokens | `tokens.ts` | Homepage-local styling — promotion to ui-kit only when 2+ non-homepage consumers exist |
| Authoring governance | `authoringGovernance.ts` | Homepage-local content governance |
| Interactive CSS module | `homepage-interactive.module.css` | Homepage-local interactive states |
| Reference composition | `ReferenceHomepageComposition.tsx` | Development preview / visual integration test |

### 3.2 What stays in `packages/ui-kit` (shared-kit, no changes needed)

| Component | Status |
|-----------|--------|
| `HbcHomepageSurfaceCard` | **Stable.** Continue using `surface="hero"` for both top-band surfaces. No API change needed. |
| `HbcHomepageCta` | **Stable.** Already supports `link`, `button`, and `secondary` variants. Hero redesign should upgrade from `variant="link"` to `variant="button"` for the primary CTA and optionally add a `variant="secondary"` for a secondary CTA. No component change needed. |
| `HbcHomepageMetadataRow` | **Stable.** No change needed. |
| `HbcHomepageSectionShell` | **Stable.** No change needed. |
| `HbcStatusBadge` | **Stable.** No change needed. |
| `useHomepageReducedMotion` | **Stable.** No change needed. |

### 3.3 What new shared primitives or variants are required in `packages/ui-kit`

**None required for Phase B.** The existing shared primitives already support the redesign:

- `HbcHomepageCta` already has `button` and `secondary` variants — the hero just needs to switch from `link` to `button` and optionally add a secondary CTA.
- `HbcHomepageSurfaceCard` already differentiates surface classes — no new surface class is needed.
- Top-band-specific visual cohesion (greeting accent treatment, hero gradient layering, editorial hierarchy) is **composition-level** work that belongs in the homepage-local components, not in the shared kit.

**Rationale:** The design brief describes the top band as a **homepage-specific signature surface**. Extracting top-band-specific visual primitives into `@hbc/ui-kit` would violate the "2+ non-homepage consumers" promotion rule and risk coupling the shared kit to homepage-specific editorial decisions.

If future non-homepage surfaces (e.g., project pages, team spaces) need similar top-band treatments, the relevant patterns can be promoted at that time.

### 3.4 Responsive and accessibility constraints

| Constraint | Implementation location | Status |
|------------|------------------------|--------|
| Flex wrap at narrow widths | `HomepageTopBandPair.tsx` (welcome: `1 1 280px`, hero: `2 1 440px`) | **Existing.** Validate at 768px, 1024px, 1200px. |
| Reduced-motion handling | `useHomepageReducedMotion` hook in hero; CSS module `@media (prefers-reduced-motion: reduce)` | **Existing.** Must be preserved. All new transitions must be gated. |
| Focus-visible treatment | CSS module `.ctaLink:focus-visible` + `HbcHomepageCta` built-in | **Existing.** All new interactive elements must have visible focus. |
| Color contrast on gradient | `HP_HERO.textColor: #ffffff` on brand gradient | **Must verify.** Phase B gradient changes must maintain 4.5:1 contrast ratio for text, 3:1 for interactive elements. |
| Semantic heading hierarchy | Welcome: `<h2>` for greeting. Hero: `<h2>` for headline | **Existing.** Must preserve; no duplicate `<h1>` allowed in page-canvas. |
| ARIA landmarks | Welcome: via `HbcHomepageSurfaceCard`. Hero: `aria-label="Hero banner"`. Alert: `role="status"` | **Existing.** Must preserve. |

---

## 4. Implementation Sequence for Prompts 02–06

### Prompt 02 — Shared UI-Kit Top-Band Primitives

**Scope:** No new shared components required. This prompt should instead:
- Verify that `HbcHomepageCta` `button` and `secondary` variants render correctly for the hero use case.
- Add any missing CSS class or token refinements to existing primitives if needed during verification.
- Document the shared-kit surface for the redesigned top band.

**Acceptance gate:** Existing `HbcHomepageCta` button variant renders a visually premium, brand-colored CTA suitable for the hero banner.

### Prompt 03 — Personalized Welcome Header Redesign

**Scope:** Rebuild `PersonalizedWelcomeHeader.tsx` with:
- Stronger greeting hierarchy (larger, more distinctive heading with clear visual weight)
- More deliberate support/context line treatment (separated from greeting with intentional spacing and opacity)
- Stronger alert section (more prominent badge + message treatment)
- Refined accent treatment (left border or equivalent brand signal)
- Preserve all existing props and config contract
- Preserve accessibility and reduced-motion compliance

**Files to modify:**
- `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.tsx`
- `apps/hb-webparts/src/homepage/tokens.ts` (if new welcome-specific tokens are needed)

**Acceptance gate:** Welcome header reads as a signature greeting surface, not a generic card. Heading hierarchy is stronger. Alert section is more prominent. Focus and reduced-motion pass.

### Prompt 04 — HB Hero Banner Redesign

**Scope:** Rebuild `HbHeroBanner.tsx` with:
- More authoritative headline structure (stronger typography and spacing)
- Improved supporting copy rhythm (clearer separation from headline)
- Better metadata treatment (if metadata is present, it should be visually distinct)
- Premium primary CTA (`variant="button"` instead of `variant="link"`)
- Optional secondary CTA (`variant="secondary"`)
- More deliberate gradient layering (refine gradient values for premium feel)
- Preserve all existing props; extend `HbHeroBannerConfig` with optional `secondaryCta`
- Preserve accessibility and reduced-motion compliance

**Files to modify:**
- `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBanner.tsx`
- `apps/hb-webparts/src/homepage/webparts/topBandContracts.ts` (add `secondaryCta?: HomepageCtaLink`)
- `apps/hb-webparts/src/homepage/helpers/topBandConfig.ts` (normalize `secondaryCta`)
- `apps/hb-webparts/src/homepage/tokens.ts` (if new hero-specific tokens are needed)

**Acceptance gate:** Hero reads as a flagship homepage surface. CTA treatment is premium. Gradient is refined. Contrast passes 4.5:1. Reduced-motion passes.

### Prompt 05 — Homepage Top-Band Integration and Polish

**Scope:** Integrate both redesigned surfaces into the homepage composition:
- Validate welcome + hero side-by-side at multiple widths (768, 1024, 1200px)
- Refine inter-surface spacing and zone treatment
- Ensure visual hierarchy flows: welcome greeting → hero headline → hero CTA
- Update `ReferenceHomepageComposition.tsx` sample data if needed
- Polish transitions, focus order, and responsive collapse

**Files to modify:**
- `apps/hb-webparts/src/homepage/shared/HomepageTopBandPair.tsx` (spacing/layout adjustments if needed)
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` (updated sample data if needed)
- `apps/hb-webparts/src/homepage/homepage-interactive.module.css` (polish interactive states if needed)
- `apps/hb-webparts/src/homepage/tokens.ts` (zone or layout token refinements if needed)

**Acceptance gate:** Top band feels cohesive. Welcome and hero are clearly differentiated. Layout holds at narrow widths. Focus order is correct.

### Prompt 06 — Validation, Hardening, and Documentation

**Scope:**
- Run full verification suite (check-types, lint, build, test)
- Verify accessibility: contrast, focus-visible, reduced-motion, landmarks, heading hierarchy
- Verify responsive behavior at 768, 1024, 1200px
- Document the Phase B top-band contract and implementation decisions
- Capture acceptance evidence

**Acceptance gate:** All verification passes. Accessibility checks pass. Documentation captures the new contract.

---

## 5. Risks and Blockers

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Hero gradient refinement could break contrast | High | Verify 4.5:1 text contrast, 3:1 interactive contrast against any gradient change |
| Welcome header restructuring could break existing SPFx property mapping | Medium | Preserve `PersonalizedWelcomeHeaderConfig` interface — restructure render only |
| Adding `secondaryCta` to hero could affect all hero instances | Low | Optional field with undefined default — existing behavior unchanged |
| Over-styling welcome could make it compete with hero for visual weight | Medium | Keep welcome restrained and personal; hero should carry editorial authority |
| Responsive collapse could stack welcome above hero at narrow widths | Low | Already handled by flex-wrap — verify min-widths still work with redesigned content |

### Blockers

None identified. All required primitives exist. All required contracts are stable.

---

## 6. Key Decisions

1. **No new `@hbc/ui-kit` primitives.** Phase B uses existing shared primitives. Top-band-specific styling stays in the homepage layer.
2. **Hero CTA upgrades from `link` to `button`.** The existing `HbcHomepageCta` component already supports this variant.
3. **`secondaryCta` is added as optional.** Extends `HbHeroBannerConfig` without breaking existing instances.
4. **No CSS-in-JS framework change.** Welcome and hero continue to use inline styles + local tokens + CSS module, consistent with Phase 11A patterns.
5. **Contracts are stable.** `PersonalizedWelcomeHeaderConfig` and `HbHeroBannerConfig` interfaces are preserved; only the optional `secondaryCta` field is added.

---

## 7. Assumptions

1. The `HbcHomepageCta` `button` variant is visually adequate for a flagship hero CTA. If it needs refinement, that is a Prompt 02 concern.
2. The greeting resolution logic (`greeting.ts`, `identity.ts`, `welcomeMessage.ts`) does not need changes — only the visual rendering changes.
3. SharePoint canvas width at typical tenant configurations provides at least 768px for homepage content.
4. The authoring governance registry does not need changes — content ownership and freshness rules remain the same.

---

## 8. Acceptance Evidence

- [x] Exact target files and ownership seams identified (Section 1)
- [x] Shared-kit vs local-layer responsibilities clearly defined (Section 3)
- [x] Required new primitives/variants named and justified — none required (Section 3.3)
- [x] Responsive and accessibility constraints documented (Section 3.4)
- [x] Risks and blockers identified explicitly (Section 5)
- [x] Implementation sequence defined for Prompts 02–06 (Section 4)
- [x] Plan is actionable enough to drive remaining prompts without ambiguity
