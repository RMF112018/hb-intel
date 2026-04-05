# Phase 04-01 Completion Note — Shell Extension Architecture and Scaffold

## Status

**Complete.** Lane B (`apps/hb-shell-extension`) exists as a real package with architecture, placeholder scaffolds, mount seam, import discipline, tests, and documentation.

## What was created

### New package: `apps/hb-shell-extension`
- `package.json` — `@hbc/spfx-hb-shell-extension` v0.0.1 with React 18, Vite, Vitest, SPFx Application Customizer types
- `tsconfig.json` — extends monorepo base with `@hbc/ui-kit/app-shell`, `/theme`, `/icons` path aliases
- `vite.config.ts` — IIFE build as `__hbIntel_hbShellExtension`, externalizes SPFx modules
- `vitest.config.ts` — jsdom environment matching hb-webparts pattern
- `.eslintrc.cjs` — standalone config with `no-restricted-imports` enforcing Lane B import policy (prohibits `@hbc/ui-kit` root and `@hbc/ui-kit/homepage`)
- `config/package-solution.json` — SPFx solution metadata v1.0.0.1

### Mount seam: `src/mount.tsx`
Publishes `__hbIntel_hbShellExtension` on globalThis with:
- `mountTop(el)` — renders TopPlaceholder into provided element; safe no-op if el is null
- `mountBottom(el)` — renders BottomPlaceholder into provided element; safe no-op if el is null
- `unmountTop()` — cleans up top React root
- `unmountBottom()` — cleans up bottom React root

### Placeholder scaffolds
- `src/placeholders/TopPlaceholder.tsx` — top ribbon + alert band slots with `role="banner"`, `aria-label`, conditional rendering on `available` prop
- `src/placeholders/BottomPlaceholder.tsx` — footer rail + support band slots with `role="contentinfo"`, `aria-label`, conditional rendering on `available` prop
- `src/placeholders/types.ts` — `PlaceholderRegion`, `PlaceholderConfig`, `ShellExtensionConfig`, `DEFAULT_SHELL_EXTENSION_CONFIG`
- `src/placeholders/index.ts` — barrel export

### Tests: `src/__tests__/shellExtension.test.ts`
9 structural tests:
- globalThis API publishes mountTop, mountBottom, unmountTop, unmountBottom
- mountTop handles null element safely (no-op)
- mountBottom handles null element safely (no-op)
- TopPlaceholder source has conditional rendering and data attributes
- BottomPlaceholder source has conditional rendering and data attributes
- No placeholder uses unsupported DOM manipulation (getElementById, querySelector, innerHTML)
- Source files found for import discipline check
- No source file imports from broad `@hbc/ui-kit` root
- No source file imports from `@hbc/ui-kit/homepage`

### Documentation
- `apps/hb-shell-extension/README.md` — product-lane documentation with architecture, placeholder regions, mount seam, import policy, package structure, and related doc links

## Import discipline

| Entry Point | Status | Enforcement |
|-------------|--------|-------------|
| `@hbc/ui-kit/app-shell` | **Allowed — Primary** | Documentation |
| `@hbc/ui-kit/theme` | Allowed — supplementary | Documentation |
| `@hbc/ui-kit/icons` | Allowed — supplementary | Documentation |
| `@hbc/ui-kit` | Prohibited | ESLint `no-restricted-imports` + structural test |
| `@hbc/ui-kit/homepage` | Prohibited | ESLint `no-restricted-imports` + structural test |

## Verification

| Step | Result |
|------|--------|
| `check-types` | PASS |
| `lint` | PASS |
| `build` | PASS (144.15 KB) |
| `test` | PASS (1 file, 9 tests) |

## Remaining for Prompt 02

- Top ribbon content implementation
- Alert/notification band content and rendering
- Integration with SPFx Application Customizer placeholder provider
