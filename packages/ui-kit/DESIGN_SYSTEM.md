# HBC Design System — Authoring Rules

**Version:** 1.0 | **Phase:** 4.15 | **Last Updated:** 2026-03-04

This document defines the mandatory rules for authoring components in the `@hbc/ui-kit` package. All contributors must follow these rules to maintain design consistency and accessibility compliance.

---

## 1. Token Usage

All colors **must** come from `src/theme/tokens.ts`. The `enforce-hbc-tokens` ESLint rule is active and warns on any hardcoded hex values (`#xxxxxx`) in component source files.

```ts
// ✅ Correct
import { HBC_COLORS } from '../theme/tokens.js';
const color = HBC_COLORS.primary;

// ❌ Incorrect — triggers ESLint warning
const color = '#004B87';
```

**Exceptions:** Theme definition files (`src/theme/**`), icon files (`src/icons/**`), and story files (`*.stories.tsx`) are excluded from this rule since they are the source of truth for token definitions.

---

## 2. Import Rules

- **No external color/spacing imports.** Do not import from `@fluentui/react-theme` directly. The `no-restricted-imports` ESLint rule blocks this with a warning.
- Use `@hbc/ui-kit/theme` (or relative imports within the package) for all design tokens.
- Fluent UI component imports from `@fluentui/react-components` are allowed.

---

## 3. Storybook Requirements

Every core component story file **must** export these four named stories:

| Export | Purpose |
|---|---|
| `Default` | Primary usage with minimal props |
| `AllVariants` | Visual grid of representative prop combinations |
| `FieldMode` | Component in `hbcFieldTheme` with dark background |
| `A11yTest` | Instructional text about ARIA roles, keyboard nav, focus management + rendered component |

**Exempt from 4-export requirement:** Layout/demo/shell stories in `theme/`, `interactions/`, `module-configs/`, `layouts/`, and `HbcAppShell/` directories.

**AllVariants pattern:** Render representative configurations, not exhaustive permutations. Complex components (HbcDataTable, HbcDrawingViewer, HbcForm) show key configs.

**FieldMode pattern:**
```tsx
export const FieldMode = () => (
  <FluentProvider theme={hbcFieldTheme}>
    <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
      <YourComponent />
    </div>
  </FluentProvider>
);
```

**A11yTest pattern:** Include descriptive text explaining ARIA roles, keyboard navigation, and focus management, followed by a rendered component instance.

---

## 4. Dual-Theme Support

All components must be tested in both themes:
- **`hbcLightTheme`** — Office/desktop environment (default)
- **`hbcFieldTheme`** — Outdoor/field environment (dark, high-contrast)

Theme tokens automatically adapt. Components should not hard-code light or dark values.

---

## 5. Naming Conventions

- **Component prefix:** `Hbc` (e.g., `HbcButton`, `HbcDataTable`)
- **File casing:** PascalCase for components, camelCase for utilities
- **Types file:** Each component directory includes `types.ts`
- **Styles:** Use Griffel `makeStyles` for all component styles
- **Story titles:** Use category prefixes (`Components/`, `Overlays/`, `Messaging/`, `Navigation/`)

---

## 6. Elevation

Four elevation levels are available:

| Token | Usage |
|---|---|
| `elevationLevel0` | Flat surfaces, inline content |
| `elevationLevel1` | Cards, panels (default for HbcCard) |
| `elevationLevel2` | Modals, popovers, elevated overlays |
| `elevationLevel3` | Tearsheets, command palette, top-level overlays |

Elevation automatically adjusts in Field Mode via theme tokens.

---

## 7. Typography

Use intent-based typography tokens, not raw font sizes:

| Intent | Semantic Use |
|---|---|
| `display` | Page titles, hero text |
| `heading1`–`heading4` | Section headings |
| `body` | Standard body text |
| `bodySmall` | Secondary text, metadata |
| `label` | Form labels, badges |
| `code` | Code snippets, technical values |

V2.1 token names are preferred. Renders semantic HTML elements by default (h1–h5, p, span, code).

---

## 8. Spacing

Use HBC spacing tokens based on a 4px grid:

| Token | Value |
|---|---|
| `HBC_SPACE_XS` | 4px |
| `HBC_SPACE_SM` | 8px |
| `HBC_SPACE_MD` | 16px |
| `HBC_SPACE_LG` | 24px |
| `HBC_SPACE_XL` | 32px |
| `HBC_SPACE_XXL` | 48px |

---

## 9. Accessibility

- **WCAG 2.2 AA** compliance required for all components
- **Field Mode:** WCAG AAA (7:1 contrast ratio) for outdoor readability
- **Touch targets:** Minimum 44px (desktop), 56px (touch/field mode)
- **Focus indicators:** 2px focus ring on all interactive elements
- **Keyboard navigation:** All interactive components must be fully keyboard accessible
- **Screen readers:** Use appropriate ARIA roles, labels, and live regions
- **Color independence:** Never rely on color alone to convey information (use shape/icon pairing)

---

## 10. File Structure

Each component lives in its own directory:

```
src/
  HbcComponentName/
    index.tsx              # Component implementation + exports
    types.ts               # TypeScript interfaces and types
    HbcComponentName.stories.tsx  # Storybook stories (4 required exports)
```

- One component per directory
- Re-export from `index.tsx`
- Keep types in `types.ts` for clean imports
- Stories file name matches component directory name

---

## 11. Dual Entry-Point Rules (Final)

To keep runtime bundles predictable, choose the narrowest entry point that satisfies the feature:

### `@hbc/ui-kit` (full)
- Use for PWA pages, dev-harness, and rich workspace UI where full component access is required.
- Includes heavy dependencies (charts/tables/etc.) and should be treated as the comprehensive entry point.

### `@hbc/ui-kit/app-shell` (lean shell)
- Use for SPFx shell-chrome scenarios and other constrained bundle surfaces.
- Includes shell-facing exports without the full component payload.

### `@hbc/ui-kit/theme`
- Use when only theme tokens/hooks are needed.
- Prevents accidental component/library payload in utility packages.

### `@hbc/ui-kit/icons`
- Use when only icon components are needed.

### Anti-patterns (prohibited)
- Importing full `@hbc/ui-kit` into shell-only SPFx contexts where `@hbc/ui-kit/app-shell` is sufficient.
- Pulling component exports via `@hbc/ui-kit` when the consuming module only requires `theme` or `icons`.
- Mixing entry-point strategies arbitrarily within the same feature without clear rationale.

### Migration guidance
- Existing full-entry imports can remain if they rely on non-shell component families.
- For SPFx and shell-only consumers, migrate imports incrementally to `/app-shell` and validate with lint/build/e2e.
- Keep `docs/reference/ui-kit/entry-points.md` aligned whenever entry-point behavior changes.
