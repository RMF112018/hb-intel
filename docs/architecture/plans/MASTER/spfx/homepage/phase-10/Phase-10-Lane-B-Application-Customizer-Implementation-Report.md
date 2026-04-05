# Phase 10 — Lane B Application Customizer Implementation Report

## Outcome

**Lane B is now deployment-packaging-ready.** A real `.sppkg` has been produced.

## What was implemented

### 1. SPFx Application Customizer class
`tools/spfx-shell/src/extensions/customizer/ShellExtensionCustomizer.ts`

A `BaseApplicationCustomizer` subclass that:
- Resolves CDN base URL from the manifest's `loaderConfig`
- Loads the IIFE bundle via `SPComponentLoader.loadScript`
- Acquires top and bottom placeholders via `this.context.placeholderProvider.tryCreateContent`
- Calls `mountTop(domElement)` and `mountBottom(domElement)` with placeholder DOM elements
- Handles missing placeholders gracefully (safe no-op with console debug)
- Cleans up via `unmountTop()` and `unmountBottom()` on dispose

### 2. Extension manifest
`apps/hb-shell-extension/src/extensions/ShellExtensionCustomizer.manifest.json`

- ID: `c4e8f1a2-7b3d-4e9f-a516-2d8c9e7f0b34`
- componentType: `Extension`
- extensionType: `ApplicationCustomizer`

### 3. Build orchestrator changes
`tools/build-spfx-package.ts`

- Added `extensionType` field to `DomainConfig` interface
- Added `hb-shell-extension` domain to `ALL_DOMAINS`
- Made manifest discovery path conditional (`src/extensions/` for extension domains)
- Made smoke test API surface conditional (`mountTop/mountBottom` for extensions)
- Extensions compile via the same webpart shell entry (SPFx compiles all manifests in the project) with the extension manifest ID
- Clean function now clears `release/` dir and stale extension manifests
- Shell asset detection and `scriptResources` key handling remain `shell-web-part` (shared compilation entry)
- `verifySppkg` updated to accept both webpart and extension asset patterns

### 4. SPFx shell project
- Added `@microsoft/sp-application-base@1.18.0` dependency to `tools/spfx-shell/package.json`

## Build approach

The SPFx shell project compiles both the `ShellWebPart.ts` (webpart entry) and `ShellExtensionCustomizer.ts` (extension entry). For extension domains, the build orchestrator writes the extension's manifest ID into the webpart manifest location so SPFx compiles it as the primary component. The compiled shell JS loads the Vite IIFE bundle identically for both webparts and extensions.

## Verification

| Step | Result |
|------|--------|
| Lane B check-types | PASS |
| Lane B lint | PASS |
| Lane B build | PASS — 146.78 KB JS + 2.25 KB CSS |
| Lane B test | PASS — 4 files / 29 tests |
| Lane B `.sppkg` | PASS — `hb-shell-extension.sppkg` (55.4 KB) |
| Lane A `.sppkg` (regression) | PASS — `hb-webparts.sppkg` (113.2 KB) |
| Bundle budget | PASS — both lanes within limits |
