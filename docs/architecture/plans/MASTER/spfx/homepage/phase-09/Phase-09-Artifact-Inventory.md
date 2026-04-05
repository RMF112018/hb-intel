# Phase 09 Artifact Inventory

## Deployment artifacts

| Lane | Artifact | Path | Size | Status |
|------|----------|------|------|--------|
| **A** | `hb-webparts.sppkg` | `dist/sppkg/hb-webparts.sppkg` | 113.2 KB | **Ready for App Catalog** |
| **B** | (none produced) | — | — | **Not yet packaging-ready** |

## Lane A emitted assets (inside `.sppkg`)

| Asset | Size | Purpose |
|-------|------|---------|
| `hb-webparts-app-112d78d9.js` | ~264 KB | IIFE bundle with all 10 webpart components |
| `spfx-hb-webparts.css` | 628 bytes | CSS module (interactive states) |
| `shell-web-part_ba914cb802b3ded228cf.js` | ~3 KB | Compiled SPFx shell webpart |
| 10× `shell-entry-{uuid}-{hash}.js` | ~3 KB each | Per-webpart shell entries with patched `define()` names |

## Lane B emitted assets (build output only — not packaged)

| Asset | Size | Purpose |
|-------|------|---------|
| `hb-shell-extension-app.js` | 146.78 KB | IIFE bundle with placeholder components |
| `spfx-hb-shell-extension.css` | 2.25 KB | CSS module (ribbon, alerts, footer) |

## Supporting artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| `hb-webparts-shim-proof.json` | `dist/sppkg/hb-webparts-shim-proof.json` | 10-entry proof of per-webpart `define()` name mapping |

## Package metadata summary

| Field | Lane A | Lane B |
|-------|--------|--------|
| npm name | `@hbc/spfx-hb-webparts` | `@hbc/spfx-hb-shell-extension` |
| npm version | `0.0.1` | `0.0.1` |
| SPFx version | `1.0.0.40` | `1.0.0.6` |
| Solution ID | `39b8f2ea-59bd-45b7-b4ec-b590b316833b` | `a7c3e1f2-8b4d-4a6e-9f12-3c5d7e8a9b01` |
| Feature ID | `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96` | `b8d4f2a3-9c5e-4b7f-a012-4d6e8f9a0b12` |
| Global API | `__hbIntel_hbWebparts` | `__hbIntel_hbShellExtension` |
| Tests | 18 files / 72 | 4 files / 29 |
| Deployable `.sppkg` | **Yes** | **No** — missing Application Customizer wiring |
