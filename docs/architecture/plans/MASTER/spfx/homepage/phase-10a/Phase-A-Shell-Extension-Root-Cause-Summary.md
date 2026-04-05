# Phase 10a — Shell Extension Root-Cause Summary

## Status: Investigation Complete (Prompt-01)

## Runtime-Path Audit

### Full trace: SPFx customizer to rendered placeholder

1. **SPFx Application Customizer** (`tools/spfx-shell/src/extensions/customizer/ShellExtensionCustomizer.ts`)
   - `onInit()` resolves the CDN bundle URL from `manifest.loaderConfig.internalModuleBaseUrls`.
   - Loads the IIFE bundle via `SPComponentLoader.loadScript()` with `globalExportsName: __APP_GLOBAL_NAME__`.
   - Validates that `mountTop` and `mountBottom` exist on the resolved module.
   - Calls `_renderPlaceholders()`.

2. **Placeholder acquisition** (`ShellExtensionCustomizer.ts:82-113`)
   - Acquires `PlaceholderName.Top` and `PlaceholderName.Bottom` via `context.placeholderProvider.tryCreateContent()`.
   - Calls `this._appModule.mountTop(domElement)` and `this._appModule.mountBottom(domElement)`.
   - **No config, properties, or content are parsed or passed.** Only the DOM element is forwarded.

3. **Mount seam** (`apps/hb-shell-extension/src/mount.tsx`)
   - `mountTop(el)` creates a React root and renders `<TopPlaceholder available={true} />`.
   - `mountBottom(el)` creates a React root and renders `<BottomPlaceholder available={true} />`.
   - **Neither function accepts or passes a `config` prop.**

4. **Placeholder render** (`TopPlaceholder.tsx`, `BottomPlaceholder.tsx`)
   - Both components accept an optional `config` prop.
   - When `config` is `undefined`, all content arrays resolve to empty via nullish coalescing.
   - Both return a minimal empty `<div>` with the appropriate `data-hbc-shell-extension` attribute.

5. **Config types** (`placeholders/types.ts`)
   - `DEFAULT_SHELL_EXTENSION_CONFIG` controls only enabled/disabled state, not visible content.
   - No default content constants exist anywhere in the codebase.

6. **SPFx manifest** (`ShellExtensionCustomizer.manifest.json`)
   - No `properties` or `propertiesMetadata` defined.
   - No SPFx property bag exists for the customizer to parse.

## Root Cause

The root cause is a **complete absence of any config/content supply path**:

1. No config source exists — no hardcoded defaults, no SPFx component properties, no external config fetch.
2. The SPFx customizer passes only a DOM element to `mountTop`/`mountBottom`.
3. The mount seam accepts no config parameter — only passes `{ available: true }`.
4. The placeholder components correctly render empty containers per governance (`missingConfigBehavior: 'empty-container'`).

The mount-only seam is **intentionally incomplete** — it was built as an activation scaffold to prove the extension can mount, not as a content-delivery path. The content supply seam was never implemented.

## Where the Config Path Stops

```
SPFx Customizer  →  mountTop(el)  →  <TopPlaceholder available={true} />
                                       config = undefined
                                       ribbonItems = []
                                       alertItems = []
                                       → empty <div>

SPFx Customizer  →  mountBottom(el) → <BottomPlaceholder available={true} />
                                       config = undefined
                                       footerLinks = []
                                       supportItems = []
                                       operationalText = undefined
                                       → empty <div>
```

## Remediation Location

The fix belongs in these files (innermost to outermost):

| Layer | File | What must change |
|-------|------|------------------|
| Mount seam | `apps/hb-shell-extension/src/mount.tsx` | Accept and pass config to placeholder components, or supply hardcoded defaults |
| Config defaults | `apps/hb-shell-extension/src/placeholders/types.ts` | Add default content constants if built-in fallback content is desired |
| SPFx customizer | `tools/spfx-shell/src/extensions/customizer/ShellExtensionCustomizer.ts` | Parse SPFx properties or external config when governed config path is implemented |

## What is NOT broken

- App Catalog registration — working
- Tenant Wide Extensions registration — working
- Package shape and bundle loading — working
- Placeholder acquisition — working
- React mount lifecycle — working
- Component rendering logic — working (correctly renders empty when no config)

## Next Steps

- **Prompt-02:** Implement visible proof remediation with hardcoded default content
- **Prompt-03:** Replace hardcoding with governed config path and verify full build/package/runtime
