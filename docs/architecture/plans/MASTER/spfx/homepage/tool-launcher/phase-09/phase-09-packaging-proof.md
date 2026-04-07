# Phase 09 — Packaging and Build Proof

## Build Sequence Executed

### Step 1: Vite build (typecheck + bundle)

```
pnpm --filter @hbc/spfx-hb-webparts build
  → tsc --noEmit        ✅ Pass (zero errors)
  → vite build          ✅ Pass
    → 4367 modules transformed
    → dist/hb-webparts-app.js  508.52 KB (gzip: 186.95 KB)
    → dist/spfx-hb-webparts.css  22.50 KB (gzip: 4.75 KB)
```

### Step 2: Lint

```
pnpm lint --filter=@hbc/spfx-hb-webparts
  → eslint src/ --ext .ts,.tsx  ✅ Pass (zero errors, zero warnings)
```

### Step 3: Full SPFx packaging

```
npx tsx tools/build-spfx-package.ts --domain hb-webparts
  → Content-hash rename: hb-webparts-app-12dfdd01.js
  → Node VM smoke test: globalThis + window API verified
  → SPFx gulp bundle --ship
  → Per-webpart AMD shim generation (11 webparts)
  → Per-webpart manifest rewriting
  → SPFx gulp package-solution --ship
  → .sppkg structure verification
  → Shim proof artifact written

  ✅ hb-webparts.sppkg (2.9 MB) generated successfully
```

## Tool Launcher Packaging Proof

### Manifest identity

| Property | Value |
|----------|-------|
| Webpart ID | `cb7060f5-b852-4600-b912-a5f6f7221ce2` |
| Alias | `ToolLauncherWorkHubWebPart` |
| Component type | WebPart |
| Supported hosts | SharePointWebPart |
| Hidden from toolbox | true |

### Shell-entry shim

| Property | Value |
|----------|-------|
| Shim file | `shell-entry-cb7060f5-b852-4600-b912-a5f6f7221ce2-540a6a2c.js` |
| Entry module ID | `cb7060f5-b852-4600-b912-a5f6f7221ce2_1.0.0` |
| Base module ID | `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0` |
| Content hash | `540a6a2c` |

### Mount dispatcher registration

```typescript
// mount.tsx line 31
'cb7060f5-b852-4600-b912-a5f6f7221ce2': ({ config }) =>
  createElement(ToolLauncherWorkHub, { config }),
```

### .sppkg contents verified

The .sppkg archive contains:
- `hb-webparts-app-12dfdd01.js` — Vite IIFE bundle (all 10 webparts + launcher)
- `spfx-hb-webparts.css` — extracted CSS
- `shell-web-part_90253ff2a7818771094a.js` — compiled shell webpart
- 11 shell-entry shims (one per webpart including Tool Launcher)
- `shell-entry-cb7060f5-b852-4600-b912-a5f6f7221ce2-540a6a2c.js` — Tool Launcher shim ✅
- Manifest JSON files per webpart

### Proof artifact

`dist/sppkg/hb-webparts-shim-proof.json` confirms:
- Tool Launcher manifest ID matches expected UUID
- Entry module ID follows `{webpartId}_1.0.0` convention
- Shim file name follows `shell-entry-{webpartId}-{hash}.js` pattern
- Base module ID is consistent across all 11 shims

## Packaging-Sensitive Audit

### Launcher-specific packaging assumptions

| Assumption | Status | Evidence |
|-----------|--------|----------|
| Webpart UUID registered in mount dispatcher | ✅ Verified | `mount.tsx` line 31 |
| Manifest exists with correct ID | ✅ Verified | Source manifest + compiled manifest |
| Shell-entry shim generated | ✅ Verified | Shim proof artifact |
| Bundle IIFE format (no ESM exports) | ✅ Verified | Node VM smoke test |
| Global API `__hbIntel_hbWebparts` exposed | ✅ Verified | Node VM smoke test |
| CSS extracted alongside JS | ✅ Verified | `spfx-hb-webparts.css` in .sppkg |
| `includeClientSideAssets: true` in package-solution | ✅ Verified | `config/package-solution.json` |

### Launcher-specific import audit

| Import category | Status |
|----------------|--------|
| `@hbc/ui-kit/homepage` | ✅ Correct — all launcher UI imports through governed barrel |
| `../../homepage/` relative paths | ✅ Correct — homepage-local helpers resolved by Vite |
| No dynamic `import()` | ✅ Correct — IIFE format, no code splitting |
| No `@hbc/ui-kit` root or `@hbc/ui-kit/app-shell` | ✅ Correct — homepage import discipline maintained |

## Packaging Risks

| Risk | Severity | Status |
|------|----------|--------|
| **Bundle size growth** | Low | 509 KB IIFE is well within acceptable range for a cumulative 10-webpart bundle. No runtime code splitting means all webparts load together. |
| **Logo asset paths** | Medium | `logoAssetRef` and manifest logo paths reference `/assets/tool-launcher/vendors/...` which are not in the .sppkg. These assets must be deployed separately to the HBCentral site. Until deployed, all cards use Lucide fallback icons. |
| **SharePoint REST API availability** | Low | The list data source (`Tool Launcher Contents`) must exist on the target site. If missing, the launcher falls through to config fallback. |
| **Cache busting** | ✅ Resolved | Content-hash rename (`hb-webparts-app-12dfdd01.js`) ensures browsers load the new bundle after .sppkg deployment. |

## Build Evidence Summary

| Check | Result |
|-------|--------|
| TypeScript typecheck | ✅ Pass |
| Vite IIFE bundle generation | ✅ Pass (509 KB) |
| ESLint | ✅ Pass (zero errors/warnings) |
| Node VM global API smoke test | ✅ Pass |
| SPFx gulp bundle | ✅ Pass |
| Per-webpart shim generation (11 shims) | ✅ Pass |
| Per-webpart manifest rewriting | ✅ Pass |
| SPFx gulp package-solution | ✅ Pass |
| .sppkg structure verification | ✅ Pass |
| Tool Launcher shim in .sppkg | ✅ Confirmed |
| Shim proof artifact | ✅ Written |
| .sppkg file size | 2.9 MB |
