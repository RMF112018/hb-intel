# Phase 10 — Lane B Packaging Evidence

## Artifact

| Field | Value |
|-------|-------|
| Path | `dist/sppkg/hb-shell-extension.sppkg` |
| Size | 55.4 KB |
| Solution ID | `a7c3e1f2-8b4d-4a6e-9f12-3c5d7e8a9b01` |
| Feature ID | `b8d4f2a3-9c5e-4b7f-a012-4d6e8f9a0b12` |
| Version | `1.0.0.7` |
| Extension manifest ID | `c4e8f1a2-7b3d-4e9f-a516-2d8c9e7f0b34` |

## Package contents

| Asset | Purpose |
|-------|---------|
| `hb-shell-extension-app-762b76f7.js` | IIFE bundle with all placeholder components |
| `spfx-hb-shell-extension.css` | CSS module (ribbon, alerts, footer, interactive states) |
| `shell-entry-c4e8f1a2-...-e5459eb7.js` | Per-extension shell entry with patched `define()` name |
| `shell-web-part_*.js` | Compiled SPFx shell (shared compilation entry) |

## Build command

```bash
npx tsx tools/build-spfx-package.ts --domain hb-shell-extension
```

## CSS confirmed in package

`spfx-hb-shell-extension.css` (2.25 KB) is included as a `ClientSideAssets` entry in the `.sppkg`.
