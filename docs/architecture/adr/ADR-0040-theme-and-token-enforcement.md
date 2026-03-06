# ADR-0040: Theme & Token Enforcement (D-05, D-10)

**Status:** Accepted
**Date:** 2026-03-05
**Phase:** 4b.6 — Theme & Token Enforcement
**References:** PH4B.6-UI-Design-Plan.md §9, PH4B-UI-Design-Plan.md §2 (D-05, D-10), Blueprint §1d

## Context

The HB Intel Design System V2.1 defines a comprehensive token system (brand colors, semantic status colors, surface/border/text palettes, spacing scale, intent-based typography, dual-shadow elevation) with full Light and Field Mode themes. However, prior to Phase 4b.6, there was no automated enforcement preventing developers from using hardcoded values instead of design tokens, or importing Fluent UI components directly instead of through the `@hbc/ui-kit` facade.

Binding decisions D-05 and D-10 mandate:
- **D-05:** All color, spacing, typography, and shadow values must come from `@hbc/ui-kit` tokens. Hardcoded values are a lint error.
- **D-10:** Pages must import exclusively from `@hbc/ui-kit`. Direct imports from `@fluentui/react-components` are prohibited and enforced via ESLint.

## Decision

### 1. Enhanced `enforce-hbc-tokens` Rule (4b.6.1)

The existing `enforce-hbc-tokens` rule (which only detected hex colors) was enhanced to detect three categories of hardcoded design values:

| Pattern | Detection | Message ID |
|---------|-----------|------------|
| Hex colors | `/#[0-9A-Fa-f]{3,8}\b/` on string literals | `noHardcodedHex` |
| RGB/RGBA | `/^rgba?\(\s*\d+/` on string literals | `noHardcodedRgb` |
| Raw pixels | `/^\d+(\.\d+)?px$/` only in style property contexts | `noHardcodedPixel` |

Pixel detection uses an `isInStyleContext()` guard that checks whether the string literal is a Property value whose key matches a CSS property name pattern (margin, padding, fontSize, width, height, gap, border*, etc.). This prevents false positives on non-style contexts like SVG viewBox, image dimensions, or data values.

### 2. `no-direct-fluent-import` Rule (4b.6.2)

A new rule that visits `ImportDeclaration` nodes and flags any import with source `@fluentui/react-components`. All Fluent UI components should be consumed through the `@hbc/ui-kit` re-export layer.

### 3. Root ESLint Configuration (4b.6.3)

Both rules are configured as `error` level in `.eslintrc.base.js` via an override targeting `apps/**/*.ts` and `apps/**/*.tsx`. The `@hbc/eslint-plugin-hbc` plugin is loaded via the `@hbc/hbc` prefix.

Existing violations (31 direct Fluent imports, ~9 hex values) have `eslint-disable` comments with `TODO: Phase 4b.11` migration references.

### 4. Dark Mode Token Verification (4b.6.5)

All 25 `HbcSemanticTokens` properties are mapped in both `hbcSemanticLight` and `hbcSemanticField`. TypeScript structural typing enforces completeness — any new token added to the interface without values in both objects is a compile error.

## Consequences

### Positive
- New code in `apps/` cannot introduce hardcoded design values without triggering a lint error
- Direct Fluent UI imports are blocked, ensuring design system consistency
- Token reference table in `packages/ui-kit/src/theme/README.md` provides a single source of truth for all available tokens
- Dark mode (Field Mode) is verified complete with proper contrast adjustments

### Negative
- Existing violations require `eslint-disable` comments until Phase 4b.11 migration
- Pixel detection is limited to style property contexts — hardcoded pixel values in non-property contexts (e.g., template literals, JSX attributes) are not caught
- The `no-direct-fluent-import` rule cannot distinguish between `FluentProvider` (infrastructure) and component imports

### Migration Path
- Phase 4b.11 (Component Consumption Enforcement) will systematically replace all `@fluentui/react-components` imports with `@hbc/ui-kit` equivalents and remove `eslint-disable` comments

## Files Changed

| File | Change |
|------|--------|
| `packages/eslint-plugin-hbc/src/index.js` | Enhanced `enforce-hbc-tokens` + added `no-direct-fluent-import` |
| `.eslintrc.base.js` | Added `@hbc/hbc` plugin, overrides with both rules as `error` |
| `packages/ui-kit/src/theme/README.md` | Added comprehensive token reference table |
| `packages/ui-kit/src/theme/theme.ts` | Added dark mode verification JSDoc |
| 37 files in `apps/` | Added `eslint-disable` comments for existing violations |
