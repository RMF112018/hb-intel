# ADR-0029: UI NGX Modernization Strategy

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.15
**Deciders:** HB Intel Architecture Team

## Context

With all 13 UI implementation phases (4.3–4.14.5) complete, we need enforcement mechanisms to prevent regression into legacy patterns. The design plan §15 mandates "Build Modern From Day One" — ensuring all new code uses HBC design tokens, follows Storybook coverage requirements, and avoids external styling imports.

## Decision

### 1. Local ESLint Plugin (`eslint-plugin-hbc`)

Created a local CommonJS ESLint plugin at `src/lint/eslint-plugin-hbc/` with a single rule:

- **`enforce-hbc-tokens`**: Warns on hardcoded hex color string literals (`#xxxxxx`). Developers must use HBC design tokens from `@hbc/ui-kit/theme` instead.

**Excluded from the rule:** `src/theme/**` (source of truth), `src/icons/**`, `src/lint/**`, `*.stories.tsx`.

### 2. No-Restricted-Imports

Added `no-restricted-imports` rule blocking direct imports from `@fluentui/react-theme`. All theme values must come through HBC token layer.

### 3. Mandatory Storybook Exports

All core component stories must export four named stories:
- `Default` — Primary usage
- `AllVariants` — Visual grid of representative prop combinations
- `FieldMode` — Dark theme (hbcFieldTheme) rendering
- `A11yTest` — Accessibility verification with instructional text

Layout/demo/shell stories are exempt.

### 4. DESIGN_SYSTEM.md Authoring Guide

Created `packages/ui-kit/DESIGN_SYSTEM.md` documenting all 10 authoring rules: token usage, import rules, Storybook requirements, dual-theme support, naming conventions, elevation, typography, spacing, accessibility, and file structure.

## Alternatives Considered

1. **`--rulesdir` flag** — Deprecated in ESLint 9. Local plugin is the forward-compatible approach.
2. **Manual code review only** — Not scalable; automated enforcement catches issues at lint time.
3. **External ESLint plugin package** — Unnecessary complexity for a single internal rule.

## Consequences

- New component code that uses hardcoded hex values will receive ESLint warnings
- Developers have clear documentation on design system rules
- Storybook coverage is enforceable via story export audits
- Zero breaking changes — rule is set to `warn`, not `error`
