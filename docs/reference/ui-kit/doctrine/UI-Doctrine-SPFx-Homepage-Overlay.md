# UI Doctrine — SPFx Homepage Overlay

> **Governing Status:** Homepage-specific overlay on the [SPFx Governing Standard](./UI-Doctrine-SPFx-Governing-Standard.md).
> **Scope:** HB Central homepage webparts (`apps/hb-webparts`), homepage shared primitives, homepage editorial compositions.
> **Relationship:** Inherits all binding rules from the SPFx Governing Standard. Adds homepage-specific constraints and freedoms that do not apply to generic SPFx domain apps.
> **Supersedes:** Any older UI-kit guidance that assumes homepage webparts should follow the same composition patterns as domain-app SPFx surfaces.

---

## 1. Doctrine hierarchy

This overlay does not replace the SPFx Governing Standard. It sits on top of it.

**Reading order for homepage work:**
1. SPFx Governing Standard — binding shared rules (accessibility, token discipline, host awareness, import discipline)
2. This homepage overlay — homepage-specific rules, freedoms, and constraints
3. SharePoint Homepage & Shell Boundaries — lane boundaries and supported customization posture
4. Homepage Import Policy — entry-point and import rules (in `entry-points.md`)

When this overlay is silent on a topic, the SPFx Governing Standard governs.
When this overlay speaks, it takes precedence for homepage surfaces.

---

## 2. Binding homepage rules

These rules are mandatory for all homepage webpart work. They are not flexible.

### 2.1 Page-canvas ownership — BINDING

Homepage webparts own the page canvas. They must not:
- create shell chrome (nav bars, sidebars, footer rails)
- duplicate or fight SharePoint's host chrome
- render placeholder-extension content (belongs to Lane B)
- assume control over page regions they do not own

### 2.2 Import discipline — BINDING

Homepage webparts must import from `@hbc/ui-kit/homepage` as their primary UI entry point. Broad `@hbc/ui-kit` and `@hbc/ui-kit/app-shell` are prohibited. Enforced by ESLint `no-restricted-imports` in `apps/hb-webparts/.eslintrc.cjs`.

Supplementary token imports from `@hbc/ui-kit/theme` and icon imports from `@hbc/ui-kit/icons` are allowed when the homepage entry point does not export the needed item.

### 2.3 Accessibility — BINDING

All homepage webparts must meet:
- WCAG 2.1 AA minimum contrast (4.5:1 text, 3:1 interactive)
- Visible keyboard focus indicators
- `prefers-reduced-motion` support (use `useHomepageReducedMotion` hook)
- No hover-only critical information
- Light theme first (dark theme is not a homepage priority)

### 2.4 Authoring safety — BINDING

Every homepage webpart must behave well when:
- minimally configured (default property pane values only)
- partially configured (some fields set, others empty)
- moved between page sections (different widths)
- viewed in SharePoint edit mode
- loaded with missing, stale, or empty data

A webpart that looks good only when fully configured is not production-ready.

### 2.5 Empty and loading states — BINDING

Every webpart must have:
- a clear empty state (not a blank rectangle)
- a professional loading state (use `HbcSpinner` from the homepage entry)
- a graceful error state (not a stack trace or `[object Object]`)
- author-safe defaults that communicate what the webpart does

### 2.6 Token discipline — BINDING

Use shared semantic tokens from `@hbc/ui-kit/theme` by default. Homepage-specific aliases (typography, spacing, density) are published through `HBC_HOMEPAGE_TYPOGRAPHY`, `HBC_HOMEPAGE_SPACING`, and `HBC_HOMEPAGE_DENSITY_POLICY` in the homepage entry point.

Direct hex/rgb values and hardcoded pixel spacing are prohibited in homepage webpart source. Enforced by `@hb-intel/hbc/enforce-hbc-tokens` ESLint rule.

---

## 3. Directional homepage guidance

These rules represent strong guidance. Deviation is allowed when it produces a materially better homepage experience, but should be justified.

### 3.1 Editorial hierarchy — DIRECTIONAL

Homepage compositions should establish clear visual hierarchy:
- Hero / top-band content is visually dominant (large, branded, compelling)
- Section headers establish rhythm between zones (utility, communications, operations, discovery)
- Editorial cards support scanning — title, summary, metadata, CTA
- Utility tiles are compact and action-oriented

This is guidance, not a pixel-level mandate. The design brief establishes the zone structure; the webpart implementations should express appropriate visual weight for their zone.

### 3.2 Premium top-band / hero expectations — DIRECTIONAL

The Personalized Welcome Header and HB Hero Banner form the homepage's top-band pair. They should:
- feel premium and branded (not generic SharePoint)
- use `HBC_HOMEPAGE_BRAND_FOUNDATION` for color direction
- support personalization (greeting, role-awareness)
- establish the page's visual quality standard immediately

### 3.3 Motion with discipline — DIRECTIONAL

Homepage motion should be:
- lighter and faster than PWA motion
- purposeful (state transitions, loading feedback) — not decorative
- `prefers-reduced-motion` aware (binding, via §2.3)
- page-composition friendly (no animations that fight section reflow)

Avoid theatrical motion, parallax effects, or scroll-triggered animations in homepage webparts.

### 3.4 Media and image treatment — DIRECTIONAL

When homepage webparts include media:
- images should have defined aspect ratios (prevent layout shift)
- placeholder states should be visually clean (solid color or shimmer, not broken-image icons)
- hero imagery should support responsive sizing (full-width to column-width)
- alt text should be authoring-governed (property pane field, not hardcoded)

### 3.5 Utility-density expectations — DIRECTIONAL

Utility-zone webparts (Priority Actions Rail, Tool Launcher) should favor:
- compact, scannable layouts
- dense information presentation where appropriate
- touch-safe minimum targets (`HBC_HOMEPAGE_DENSITY_POLICY.minimumTouchTargetPx`)
- clear affordance for actionable items (links, buttons, status)

### 3.6 Content freshness guardrails — DIRECTIONAL

Webparts that display time-sensitive content (Company Pulse, Leadership Message) should:
- display metadata that communicates recency (date, "Updated weekly", etc.)
- degrade gracefully when content is stale (do not show year-old content as "new")
- support author-governed freshness through property pane configuration

This is doctrine-level guidance, not a runtime enforcement mechanism.

---

## 4. Homepage freedoms

These patterns are explicitly allowed for homepage work, even if generic UI-kit or SPFx guidance might seem to discourage them.

### 4.1 Full-width composition

Homepage webparts may use full-width section layouts when the page section supports it. This is standard for hero and top-band compositions.

### 4.2 Zone-specific visual treatment

Different homepage zones (top-band, utility, communications, operations, discovery) may have different visual density, card styles, and spacing. Visual uniformity across zones is not required — appropriate contrast between zones improves scannability.

### 4.3 Local homepage primitives

Homepage-local shared components (`apps/hb-webparts/src/homepage/shared/`) are allowed and encouraged when the pattern is specific to homepage composition and not yet proven for reuse. Promote to `@hbc/ui-kit` only when reuse across non-homepage surfaces is justified (2+ meaningful consumers outside homepage).

### 4.4 Brand expression

Homepage webparts may express HB brand identity more strongly than generic operational SPFx surfaces. Use `HBC_HOMEPAGE_BRAND_FOUNDATION` for color direction. Branded expression should feel premium and established, not flashy or startup-like (see the brand anti-patterns in the constant).

### 4.5 Direct Fluent usage (inherited from SPFx Standard §4.2)

Allowed when SharePoint interoperability is easier directly or the pattern is too specialized to wrap yet. If the pattern becomes common, wrap and promote.

---

## 5. Shared UI-kit vs local homepage territory

| Territory | Owned By | Examples |
|-----------|----------|---------|
| Reusable visual primitives | `@hbc/ui-kit` (via `/homepage` entry) | HbcCard, HbcButton, HbcBanner, HbcStatusBadge, HbcSpinner, HbcEmptyState, HbcSearch, HbcThemeProvider |
| Homepage shared primitives (Phase 11A) | `@hbc/ui-kit/homepage` | HbcHomepageSectionShell, HbcHomepageCta, HbcHomepageMetadataRow, HbcHomepageIconFrame, HbcHomepageSurfaceCard |
| Homepage governance constants | `@hbc/ui-kit/homepage` | Brand foundation, typography aliases, spacing aliases, a11y policy, density policy, import guardrails |
| Semantic tokens, icons | `@hbc/ui-kit/theme`, `@hbc/ui-kit/icons` | All shared tokens, all icons |
| Homepage composition shells | `apps/hb-webparts/src/homepage/shared/` | HomepageRailShell, HomepageSectionShell, HomepageTopBandPair, etc. |
| Webpart components | `apps/hb-webparts/src/webparts/` | Each webpart folder (CompanyPulse, HbHeroBanner, etc.) |
| Homepage helpers | `apps/hb-webparts/src/homepage/helpers/` | Config normalization, identity resolution, greeting logic |
| Homepage contracts | `apps/hb-webparts/src/homepage/webparts/` | Per-zone configuration type contracts |

**Promotion rule:** A local homepage component should be promoted to `@hbc/ui-kit` only when it has 2+ meaningful consumers outside the homepage package and is visually aligned with the shared HB design language. Until then, local ownership is preferred.

---

## 6. What homepage surfaces must NOT do

- Import from `@hbc/ui-kit` root or `@hbc/ui-kit/app-shell` (enforced by ESLint)
- Create shell chrome, navigation, or footer elements (belongs to Lane B)
- Use unsupported SharePoint DOM manipulation or CSS overrides
- Suppress or fight the SharePoint host chrome
- Depend on other feature packages (`@hbc/features-*`) — homepage is self-contained
- Assume all 10 webparts are always on the same page (each must render independently)

---

## 7. Locked assumptions for Phase 01+

Future implementation phases should treat the following as locked and not re-litigate:

1. `@hbc/ui-kit/homepage` is the primary UI entry point for homepage webparts
2. The 13 components (8 core + 5 homepage primitives) + 5 governance constants in the homepage entry are the current approved surface
3. Homepage primitives live locally in `apps/hb-webparts/src/homepage/shared/` until reuse is proven
4. The SPFx Governing Standard's binding rules (accessibility, host awareness, token discipline) are non-negotiable
5. Each webpart must render independently with authoring-safe defaults
6. The three-lane model (homepage / shell-extension / navigation) is the governing architecture
7. The supported customization posture (page canvas + placeholder extensions, no shell DOM hacks) is locked
