# Phase 07 Packaging Truth Audit

Repo-truth audit of build, packaging, and runtime seams for the SharePoint homepage ecosystem.

## Lane A — `apps/hb-webparts` (`@hbc/spfx-hb-webparts`)

| Field | Value |
|-------|-------|
| **Package name** | `@hbc/spfx-hb-webparts` |
| **Version (npm)** | `0.0.1` |
| **Version (SPFx)** | `1.0.0.37` |
| **Solution ID** | `39b8f2ea-59bd-45b7-b4ec-b590b316833b` |
| **Feature ID** | `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96` |
| **Build command** | `pnpm --filter @hbc/spfx-hb-webparts build` |
| **Output format** | Vite IIFE library |
| **Production entrypoint** | `src/mount.tsx` |
| **Global API** | `globalThis.__hbIntel_hbWebparts` |
| **Emitted JS** | `dist/hb-webparts-app.js` (264.07 KB) |
| **Emitted CSS** | `dist/spfx-hb-webparts.css` (0.63 KB) |
| **Packaging model** | Multi-webpart cumulative `.sppkg` via `tools/build-spfx-package.ts` |
| **UI entry point** | `@hbc/ui-kit/homepage` |
| **Import enforcement** | ESLint `no-restricted-imports` in `.eslintrc.cjs` + structural test |
| **Tests** | 17 files / 69 tests |

### Production entrypoints

| File | Role | Production? |
|------|------|:-----------:|
| `src/mount.tsx` | Primary mount/dispatch seam — maps webpart IDs to React components | **Yes** |

### Non-production entrypoints

| File | Role | Retained? | Rationale |
|------|------|:---------:|-----------|
| `src/mount-hero-proof-case.tsx` | Isolated tenant-validation entry for HbHeroBanner | Yes | Used during tenant proof-case validation; not imported by production mount |
| `src/mount-priority-actions-rail-proof-case.tsx` | Isolated tenant-validation entry for PriorityActionsRail | Yes | Same — proof-case only |
| `src/homepage/ReferenceHomepageComposition.tsx` | Governed composition reference / dev preview | Yes | Renders when no webPartId is provided; not production rendering path |

### Deprecated / scaffold-era files (retained, not production)

| File | Status |
|------|--------|
| `src/homepage/helpers/normalization.ts` | `@deprecated` — zero imports, orphaned |
| `src/homepage/helpers/config.ts` | Scaffold-era — used only by ReferenceHomepageComposition |
| `src/webparts/hbWebparts/HbWebpartsWebPart.manifest.json` | Legacy scaffold manifest — excluded from builds by `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS` |

### Verification commands

```bash
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/spfx-hb-webparts lint
pnpm --filter @hbc/spfx-hb-webparts build
pnpm --filter @hbc/spfx-hb-webparts test
```

---

## Lane B — `apps/hb-shell-extension` (`@hbc/spfx-hb-shell-extension`)

| Field | Value |
|-------|-------|
| **Package name** | `@hbc/spfx-hb-shell-extension` |
| **Version (npm)** | `0.0.1` |
| **Version (SPFx)** | `1.0.0.3` |
| **Solution ID** | `a7c3e1f2-8b4d-4a6e-9f12-3c5d7e8a9b01` |
| **Feature ID** | `b8d4f2a3-9c5e-4b7f-a012-4d6e8f9a0b12` |
| **Build command** | `pnpm --filter @hbc/spfx-hb-shell-extension build` |
| **Output format** | Vite IIFE library |
| **Production entrypoint** | `src/mount.tsx` |
| **Global API** | `globalThis.__hbIntel_hbShellExtension` |
| **Emitted JS** | `dist/hb-shell-extension-app.js` (146.76 KB) |
| **Emitted CSS** | `dist/spfx-hb-shell-extension.css` (2.22 KB) |
| **UI entry point** | `@hbc/ui-kit/app-shell` |
| **Import enforcement** | ESLint `no-restricted-imports` in `.eslintrc.cjs` + structural test |
| **Tests** | 3 files / 26 tests |

### Production entrypoints

| File | Role | Production? |
|------|------|:-----------:|
| `src/mount.tsx` | Mount/unmount seam for top and bottom placeholders | **Yes** |

### Non-production entrypoints

None — Lane B has no proof-case or preview files.

### Deprecated / scaffold-era files

None.

### Verification commands

```bash
pnpm --filter @hbc/spfx-hb-shell-extension check-types
pnpm --filter @hbc/spfx-hb-shell-extension lint
pnpm --filter @hbc/spfx-hb-shell-extension build
pnpm --filter @hbc/spfx-hb-shell-extension test
```

---

## Loader/runtime seam assumptions

### Global API stability

| Lane | Global Name | mount Surface | unmount Surface | Null-safe? | Test-backed? |
|------|-------------|--------------|-----------------|:----------:|:------------:|
| A | `__hbIntel_hbWebparts` | `mount(el, spfxContext?, config?)` | `unmount()` | N/A (el always provided by shell) | Yes |
| B | `__hbIntel_hbShellExtension` | `mountTop(el)` / `mountBottom(el)` | `unmountTop()` / `unmountBottom()` | Yes (null el = safe no-op) | Yes |

### CSS in deployment

Both lanes now emit CSS alongside their JS bundles. The SPFx packaging pipeline must include CSS assets in the `.sppkg` alongside the JS. The build tool (`tools/build-spfx-package.ts`) copies all files from `dist/` into the shell's asset directory — CSS files are automatically included.

---

## Cumulative `.sppkg` packaging (Lane A)

Lane A uses the multi-webpart cumulative model:
1. Vite builds `hb-webparts-app-{hash}.js` (IIFE bundle with content hash)
2. `gulp bundle --ship` compiles the SPFx shell webpart
3. Post-build generates 10 per-webpart shell entry files with patched `define()` names
4. `gulp package-solution --ship` produces the `.sppkg` with all assets

Lane B would follow a similar pattern when its SPFx Application Customizer is wired (deployment-phase work — deferred).
