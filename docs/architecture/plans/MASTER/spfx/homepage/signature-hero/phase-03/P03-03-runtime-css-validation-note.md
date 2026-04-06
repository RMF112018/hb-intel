# P03-03 Runtime CSS Validation Note — SharePoint CSS Load Path

**Prompt:** `Prompt-03-Validate-SharePoint-CSS-Load-Path.md`
**Date:** 2026-04-06
**Version:** 1.0.0.76

## Artifact-Level Proof (Pre-Upload)

### CSS Asset Emission

| Check | Result |
|-------|--------|
| `spfx-hb-webparts.css` in `dist/` | Present (20,170 bytes) |
| `spfx-hb-webparts.css` in `.sppkg` ClientSideAssets | Present |
| `loadCss("spfx-hb-webparts.css")` in compiled shell | Present |

### CSS-to-JS Class Hash Alignment

All 13 hero CSS module classes have **identical hashes** in both the CSS and JS bundles (module hash: `18fbi`):

| Class | CSS Selector | JS Reference | Match |
|-------|-------------|-------------|-------|
| surface | `._surface_18fbi_24` | `"_surface_18fbi_24"` | Yes |
| photo | `._photo_18fbi_38` | `"_photo_18fbi_38"` | Yes |
| scrim | `._scrim_18fbi_47` | `"_scrim_18fbi_47"` | Yes |
| grain | `._grain_18fbi_59` | `"_grain_18fbi_59"` | Yes |
| content | `._content_18fbi_71` | `"_content_18fbi_71"` | Yes |
| lockup | `._lockup_18fbi_84` | `"_lockup_18fbi_84"` | Yes |
| logo | `._logo_18fbi_90` | `"_logo_18fbi_90"` | Yes |
| label | `._label_18fbi_97` | `"_label_18fbi_97"` | Yes |
| identity | `._identity_18fbi_107` | `"_identity_18fbi_107"` | Yes |
| tagline | `._tagline_18fbi_114` | `"_tagline_18fbi_114"` | Yes |
| greeting | `._greeting_18fbi_124` | `"_greeting_18fbi_124"` | Yes |
| greetingLine | `._greetingLine_18fbi_130` | `"_greetingLine_18fbi_130"` | Yes |
| greetingName | `._greetingName_18fbi_138` | `"_greetingName_18fbi_138"` | Yes |

**No mismatch.** When the JS bundle renders an element with class `_surface_18fbi_24`, the CSS bundle has a rule for `._surface_18fbi_24`. If the stylesheet is loaded, the rules will apply.

### CSS Load Path (Proven)

```
ShellWebPart.onInit()
  ├─ resolves CDN base URL from manifest.loaderConfig.internalModuleBaseUrls
  ├─ normalizedBase = baseUrl + "/"
  ├─ SPComponentLoader.loadCss(normalizedBase + "spfx-hb-webparts.css")
  │   └─ SharePoint injects <link rel="stylesheet" href="...spfx-hb-webparts.css">
  └─ SPComponentLoader.loadScript(normalizedBase + "hb-webparts-app-{hash}.js")
      └─ mount() renders HbSignatureHero with module class names
```

## Host-Style Conflict Analysis

| Property | Source Value | SharePoint Risk | Assessment |
|----------|-------------|-----------------|------------|
| `border-radius: 20px` | `.surface` | CanvasZone overflow reset | **LOW** — CSS modules scoped, SPFx container does not reset child overflow |
| `color: #fff` | `.surface` | Theme color injection | **LOW** — module selector specificity beats unscoped host rules |
| `min-height: 380px` | `.surface` | Section height constraint | **LOW** — webpart renders in its own DOM subtree |
| `display: grid` | `.surface` | Host display override | **LOW** — scoped to module class |
| `font-size: 3.5rem` | `.tagline` | Fluent base typography | **MEDIUM** — rem anchors to html root, not body; Fluent's body font-size reset does not affect rem calculation |
| `background-color: hsl(220 12% 11%)` | `.surface` | Theme background | **LOW** — module class specificity wins |

**Conclusion:** CSS module scoping (`_surface_18fbi_24`) provides sufficient specificity against all identified SharePoint host selectors. No `!important` overrides needed. No proactive host-conflict fixes required.

## SharePoint Runtime Verification Checklist

After uploading `hb-webparts.sppkg` to the App Catalog:

### 1. Browser Network Proof
Open DevTools → Network → filter by `spfx-hb-webparts.css`:
- [ ] CSS asset is requested
- [ ] Request URL matches CDN path: `https://{tenant}.sharepoint.com/sites/{site}/ClientSideAssets/{guid}/spfx-hb-webparts.css`
- [ ] Response status is 200
- [ ] Response Content-Type is `text/css`
- [ ] Response body contains `_surface_18fbi_24`

### 2. DOM / Class Proof
Open DevTools → Elements → inspect the hero section:
- [ ] `<section>` has `class` containing `_surface_18fbi_24`
- [ ] `<section>` has `data-hbc-premium="signature-hero"`
- [ ] `<h1>` has class containing `_tagline_18fbi_114`
- [ ] `<div>` with lockup has class containing `_lockup_18fbi_84`
- [ ] `<span>` with greeting has class containing `_greetingName_18fbi_138`

### 3. Computed Style Proof
Select the hero `<section>` → Computed tab:
- [ ] `background-color`: `rgb(24, 27, 32)` (≈ `hsl(220 12% 11%)`)
- [ ] `min-height`: `380px`
- [ ] `border-radius`: `20px`
- [ ] `color`: `rgb(255, 255, 255)`
- [ ] `display`: `grid`
- [ ] `overflow`: `hidden`

Select the tagline `<h1>`:
- [ ] `font-size`: approximately `56px` (`3.5rem` at default root)
- [ ] `font-weight`: `800`

### 4. Visual Proof
- [ ] Dark charcoal surface visible (not white/default)
- [ ] "Build with GRIT." tagline is large and dominant
- [ ] Logo is small and subtle (18px height)
- [ ] Greeting is subordinate below tagline
- [ ] Content is left-anchored with negative space on right
- [ ] Hero fills full-width section without narrow-rail bottleneck
- [ ] No gradient wash visible

### 5. Override / Conflict Check
In DevTools → Elements → Styles panel for the hero section:
- [ ] No crossed-out (overridden) CSS module rules
- [ ] No SharePoint host selectors competing with hero styles
- [ ] If any overrides found, document the competing selector

## Console Debug Evidence

The shell webpart logs CSS loading. In DevTools → Console, filter for `HB-Intel`:
```
[HB-Intel ShellWebPart] cssUrl: https://{cdn}/spfx-hb-webparts.css
[HB-Intel ShellWebPart] rawBaseUrl: https://{cdn}/
[HB-Intel ShellWebPart] bundleUrl: https://{cdn}/hb-webparts-app-{hash}.js
[HB-Intel ShellWebPart] Module resolved. { source: "loadScript", keys: ["mount", "unmount"] }
```

If `cssUrl` is missing, `__APP_CSS_NAME__` was not injected at build time — rebuild with the orchestrator.
