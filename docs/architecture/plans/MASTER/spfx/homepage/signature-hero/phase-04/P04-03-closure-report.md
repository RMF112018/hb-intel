# P04-03 Closure Report — Add SharePoint-Configurable Background

**Prompt:** `Prompt-03-Add-SharePoint-Configurable-Background.md`
**Date:** 2026-04-06
**Version:** 1.0.0.80

## Objective

Make the hero background configurable from within SharePoint after the web part is added to the page, using the SPFx property pane.

## Resolution Order

The effective hero background image is resolved in this order:

1. **Property-pane override** — author-configured `backgroundImageUrl` from the SharePoint property pane
2. **CDN default** — `{assetBaseUrl}banner_home_7.png` (repo-controlled default image)
3. **Charcoal fallback** — deep charcoal surface with material grain texture

Clearing the property-pane field restores the CDN default. No code redeploy is needed to change the background after this phase.

## Changes Applied

### 1. Property pane configuration (ShellWebPart.ts)

- Imported `PropertyPaneTextField` from `@microsoft/sp-property-pane`
- Added `IShellWebPartProperties` interface with optional `backgroundImageUrl`
- Updated class to extend `BaseClientSideWebPart<IShellWebPartProperties>`
- `getPropertyPaneConfiguration()` now returns a text field for background image URL, **conditionally** — only when the webpart ID matches the Signature Hero (`28acd6a7-...`)
- Other webparts continue to see empty property pane pages
- Field includes description text guiding authors to use a SharePoint-hosted image URL

### 2. Mount path threading (mount.tsx)

- Hero renderer now extracts `backgroundImageUrl` from `config` (which holds `webPartProperties`)
- Non-empty string values are passed as the `backgroundImage` prop to `HbSignatureHero`
- Empty or missing values result in `undefined`, which triggers the CDN default fallback

### 3. No HbSignatureHero changes needed

The component's existing resolution logic already handles this:
```
heroBackground = backgroundImage ?? (assetBaseUrl ? assetBaseUrl + DEFAULT_BANNER : undefined)
```

## Files Changed

| File | Change |
|------|--------|
| `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | Add property pane with `backgroundImageUrl` field for hero webpart |
| `apps/hb-webparts/src/mount.tsx` | Extract `backgroundImageUrl` from config, pass to hero renderer |
| `tools/spfx-shell/config/package-solution.json` | Version 1.0.0.79 → 1.0.0.80 |

## Verification

| Check | Scope | Result |
|-------|-------|--------|
| `tsc --noEmit` | `@hbc/spfx-hb-webparts` | Pass |
| `eslint src/` | `@hbc/spfx-hb-webparts` | Pass |
| `vite build` | `@hbc/spfx-hb-webparts` | Pass (452.57 KB JS / 20.07 KB CSS) |

## Authoring Note

After deploying the updated `.sppkg`:
1. Add the **HB Signature Hero** web part to a SharePoint page
2. Click the web part, then open the property pane (pencil icon)
3. In the **Background Image** section, paste a SharePoint-hosted image URL
4. The hero immediately reflects the configured image
5. Clear the field to revert to the default `banner_home_7.png`

Recommended: use wide, low-clutter project or craft photography hosted in a SharePoint image library for best results.

## What Was NOT Changed

- No changes to HbSignatureHero component (existing resolution logic sufficient)
- No custom image picker added (property-pane text field per prompt guidance)
- No visual regression to hero composition
- Runtime CSS loading behavior preserved

## Remaining Phase 04 Prompts

- **P04-04**: Clean rebuild and SharePoint proof
