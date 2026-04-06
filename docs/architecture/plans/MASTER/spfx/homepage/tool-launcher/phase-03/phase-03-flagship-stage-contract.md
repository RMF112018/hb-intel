# Phase 03 — Flagship Stage Contract

## 1. Current-State Featured-Stage Gap

### What the Phase 02 stage was doing

The `LauncherFlagshipStage` rendered featured platforms as inline `<a>` elements in a responsive grid. Each card had a 56px icon container, name, descriptor, CTA label, and notice badge — all structurally correct. However:

- **No premium interaction** — CSS `transition` was declared but no motion library integration. Hover/tap felt flat.
- **Card was inlined** — the card rendering was part of the stage's `.map()` callback, not a standalone primitive. This prevented reuse and testing in isolation.
- **No motion gating** — `prefers-reduced-motion` was not checked.

### What a true flagship stage requires

- A **standalone card primitive** (`LauncherFlagshipCard`) that accepts a single `LauncherPlatformRecord` and owns its full rendering, interaction, and fallback behavior
- **Premium motion** — spring-based hover lift and tap compression using `motion.a` from the approved premium stack, gated by `prefers-reduced-motion`
- The stage grid becomes a thin layout wrapper that maps records to card primitives

## 2. Flagship Card Contract

### Minimum required fields

| Field | Type | Purpose | Skip record if missing |
|-------|------|---------|----------------------|
| `platformKey` | `string` | Unique key for dedup and React key | Yes (handled by normalization) |
| `name` | `string` | Card title | Yes (handled by normalization) |
| `launchUrl` | `string` | Navigation destination | Yes (handled by normalization) |

### Optional fields with fallback

| Field | Type | Fallback when missing |
|-------|------|----------------------|
| `logoAssetRef` | `string?` | Render platform-specific or category-based Lucide icon in 56px container |
| `descriptor` | `string?` | Card renders without subtitle — name + CTA only |
| `openInNewTab` | `boolean` | Default `true` |
| `notice.label` | `string?` | No badge rendered |
| `notice.tone` | `UtilityBadgeVariant?` | Default `'info'` when notice exists |

### Card rendering hierarchy (top to bottom)

1. **Header row** — 56px logo container + platform name (flex row)
2. **Descriptor** — optional short purpose line (suppressed if empty)
3. **CTA row** — "Launch" label with ExternalLink icon + optional notice badge (pushed to bottom via `margin-top: auto`)

### Interaction behavior

| Behavior | Implementation | Status |
|----------|---------------|--------|
| Hover lift | `motion.a` with `whileHover: { scale: 1.015, boxShadow }` | **Live** — spring stiffness 400, damping 25 |
| Tap compression | `motion.a` with `whileTap: { scale: 0.985 }` | **Live** — same spring |
| Reduced motion | `usePrefersReducedMotion()` — disables hover/tap variants | **Live** |
| Keyboard focus | Browser default focus ring on `<a>` element | **Live** |
| Launch navigation | Whole-card `<a>` click → `launchUrl` | **Live** |

### Structural distinction from workflow shelf tiles

| Property | Flagship card | Shelf tile (HbcLauncherSurface) |
|----------|--------------|----------------------------------|
| Min width | 240px | 140px |
| Logo container | 56px with brand-asset slot | 44px icon-only |
| Layout | Column (vertical: header → descriptor → CTA) | Row (horizontal: icon + label) |
| Descriptor | Rendered when available | Rendered when available |
| CTA row | Explicit "Launch" label + ExternalLink icon | Implicit whole-tile click |
| Notice badge | Inline with CTA row | Not rendered |
| Motion | Spring hover/tap via `motion.a` | CSS scale via `motion.div` |
| Visual weight | Primary — larger, more padding, stronger border | Secondary — compact, subtle |

## 3. Stage Qualification Rules

A platform qualifies for the flagship stage when:

1. **`isFeatured` is `true`** — set from the `Featured` Yes/No field in the SharePoint list
2. **Record passes normalization** — has valid `Title` and `LaunchURL`, is active
3. **Dedup passes** — `platformKey` is unique (first occurrence wins)

**Ordering within the stage:**
1. `featuredSortOrder` ascending (default 999 for unset)
2. Alphabetical by `name` as tiebreaker

**These rules are enforced by the normalization layer** (`deriveToolLauncherPresentation` → `deriveFeaturedStage`). The stage and card components do not re-evaluate qualification — they render what they receive.

## 4. Structural Coding Plan

### `LauncherFlagshipCard.tsx` (new)

**Location:** `apps/hb-webparts/src/webparts/toolLauncherWorkHub/LauncherFlagshipCard.tsx`

**Responsibility:** Single-card primitive. Accepts `platform: LauncherPlatformRecord`. Owns all card rendering, logo fallback, CTA, notice badge, and premium motion interaction.

**Key decisions:**
- Uses `motion.a` from `@hbc/ui-kit/homepage` for spring-based hover/tap
- Motion gated by `usePrefersReducedMotion()`
- Logo resolution via `resolvePlatformIcon()` from shared `launcherIconResolution.ts`
- Badge tone colors defined locally (same map as Phase 02 but now owned by the card)

### `LauncherFlagshipStage.tsx` (simplified)

**Responsibility:** Grid layout only. Maps `platforms` array to `LauncherFlagshipCard` instances. Returns null when empty.

**What was removed:** All card styles, icon resolution, badge colors — moved to the card primitive.

### No changes to other launcher components

The composition shell, command band, utility rail, and workflow shelves are unchanged. The stage's position in the shell is preserved.

## 5. Guardrails

| Must not | Reason |
|----------|--------|
| Let flagship cards regress to icon-only tiles | The 56px logo container, descriptor, and CTA row are structural requirements |
| Create a second hero | Cards use subtle white background and restrained sizing — not full-bleed gradients or hero-scale media |
| Couple the card to raw SharePoint fields | The card accepts `LauncherPlatformRecord` only |
| Move the card primitive to `@hbc/ui-kit` | The card is launcher-specific. Promotion requires a second consumer. |
| Skip reduced-motion gating | Motion must respect `prefers-reduced-motion` per doctrine |
| Over-polish at the expense of later binding | The card's logo container renders `<img>` when `logoAssetRef` exists but real logo assets are bound in Prompt 03 of this phase |
| Remove the fallback icon chain | Missing logos must degrade to meaningful Lucide icons, not broken images or empty containers |
