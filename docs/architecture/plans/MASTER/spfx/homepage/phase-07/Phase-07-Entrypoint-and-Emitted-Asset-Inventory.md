# Phase 07 Entrypoint and Emitted Asset Inventory

Concise inventory of production vs non-production seams and emitted assets.

## Production seams

| Lane | Entrypoint | Global API | Emitted JS | Emitted CSS |
|------|-----------|------------|------------|-------------|
| **A** | `src/mount.tsx` | `__hbIntel_hbWebparts` | `hb-webparts-app.js` (264.07 KB) | `spfx-hb-webparts.css` (0.63 KB) |
| **B** | `src/mount.tsx` | `__hbIntel_hbShellExtension` | `hb-shell-extension-app.js` (146.76 KB) | `spfx-hb-shell-extension.css` (2.22 KB) |

## Non-production seams

| Lane | File | Classification | Status |
|------|------|---------------|--------|
| A | `src/mount-hero-proof-case.tsx` | Proof-case only | Retained — tenant validation |
| A | `src/mount-priority-actions-rail-proof-case.tsx` | Proof-case only | Retained — tenant validation |
| A | `src/homepage/ReferenceHomepageComposition.tsx` | Preview / reference | Retained — governed dev preview |

## Deprecated / orphaned files

| Lane | File | Classification | Status |
|------|------|---------------|--------|
| A | `src/homepage/helpers/normalization.ts` | Orphaned (`@deprecated`) | Retained — zero imports |
| A | `src/homepage/helpers/config.ts` | Scaffold-era | Retained — used only by ReferenceHomepageComposition |
| A | `src/webparts/hbWebparts/HbWebpartsWebPart.manifest.json` | Legacy scaffold manifest | Retained — excluded from builds |

## Production vs non-production boundary

### What is production

- `src/mount.tsx` in both lanes
- All files imported transitively by the production mount
- All 10 webpart component folders in Lane A
- All placeholder components in Lane B
- The homepage token system (`src/homepage/tokens.ts`)
- The CSS modules (`homepage-interactive.module.css`, `shell-extension.module.css`)
- All zone contract, helper, and shared-primitive files imported by production webparts

### What is preview/reference only

- `ReferenceHomepageComposition.tsx` — renders when no webPartId is provided (dev context)
- `src/homepage/helpers/config.ts` — `normalizeHomepageConfig()` called only by ReferenceComposition

### What is proof-case only

- `mount-hero-proof-case.tsx` — isolated entry for single-webpart tenant validation
- `mount-priority-actions-rail-proof-case.tsx` — isolated entry for single-webpart tenant validation
- Both are selected at build time via `HB_WEBPARTS_PROOF_CASE_ENTRY_MAP` in `tools/build-spfx-package.ts`
- Neither is imported by the production cumulative build

### What is deprecated/orphaned

- `helpers/normalization.ts` — `@deprecated`, zero imports
- `webparts/hbWebparts/HbWebpartsWebPart.manifest.json` — excluded by `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS`

## Asset stability assessment

| Concern | Status | Notes |
|---------|--------|-------|
| JS asset names stable? | Yes | Named by Vite `lib.fileName` config; content-hashed at `.sppkg` build time |
| CSS asset names stable? | Yes | Named by Vite CSS extraction convention |
| Global API names stable? | Yes | `__hbIntel_hbWebparts` and `__hbIntel_hbShellExtension` — tested structurally |
| Solution IDs stable? | Yes | Locked in `config/package-solution.json` |
| Manifest IDs stable? | Yes | 10 webpart UUIDs locked in source manifests |
| Proof-case files safe to retain? | Yes | Not imported by production; used for tenant validation |
| Scaffold files safe to retain? | Yes | `@deprecated` annotated; excluded from builds |
