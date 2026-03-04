# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 14
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 14. Mobile & PWA Adaptations

HB Intel is deployed as an installable Progressive Web App (PWA). The delivery architecture — service workers, Background Sync, Push Notifications, Application Badging — is what enables every field-first feature in this plan.

> **Critical context:** As of March 2026, **no current construction technology platform** implements a Web App Manifest for installability, service workers for offline caching, the Background Sync API, or the Push API. HB Intel's PWA architecture is a category-defining differentiator, not an enhancement.

### PWA Manifest **[V2.1 — Expanded]**

```json
{
  "name": "HB Intel",
  "short_name": "HB Intel",
  "description": "Hedrick Brothers Construction — Project Intelligence Platform",
  "theme_color": "#1E1E1E",
  "background_color": "#004B87",
  "display": "standalone",
  "orientation": "any",
  "start_url": "/",
  "categories": ["productivity", "business"],
  "icons": [
    { "src": "/assets/hb_icon_blueBG.jpg", "sizes": "192x192", "type": "image/jpeg", "purpose": "any" },
    { "src": "/assets/hb_icon_blueBG.jpg", "sizes": "512x512", "type": "image/jpeg", "purpose": "any" },
    { "src": "/assets/hb_icon_maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/assets/screenshot-wide.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" },
    { "src": "/assets/screenshot-narrow.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" }
  ],
  "shortcuts": [
    { "name": "RFIs", "url": "/rfis", "icons": [{ "src": "/assets/icon-rfi.png", "sizes": "96x96" }] },
    { "name": "Punch List", "url": "/punch-list", "icons": [{ "src": "/assets/icon-punch.png", "sizes": "96x96" }] },
    { "name": "Daily Log", "url": "/daily-log", "icons": [{ "src": "/assets/icon-daily-log.png", "sizes": "96x96" }] }
  ]
}
```

### Service Worker Caching Strategy **[V2.1]**

| Asset Type | Strategy | Rationale |
|---|---|---|
| App shell (HTML, CSS, JS, fonts, icons) | Cache-first + version-keyed cache | Instant load from cache. Updated via SW update lifecycle |
| Drawing files (PDFs, rendered tiles) | Cache-first + background revalidation | Pre-cached when project selected. Offline drawing access |
| API data (item lists, detail records) | Stale-while-revalidate | Instant render from cache, fresh data loads behind |
| Form submissions (POST requests) | Background Sync | Queue offline. Replay when connected |
| Photos and markup annotations | Background Sync with upload queue | Optimistic UI + upload when connected |
| Command Palette intent map (JSON) | Cache-first | Offline keyword navigation always available |
| Saved view definitions | IndexedDB + SW cache | Offline filter/sort access |

### Application Badging API **[V2.1]**

Use the Badging API to display the count of action-required items on the installed PWA icon. A superintendent's home screen showing "5" on the HB Intel icon communicates five pending items before the app is opened.

```ts
// Update badge whenever responsibility items count changes
if ('setAppBadge' in navigator) {
  navigator.setAppBadge(myResponsibilityItemsCount);
}
// Clear when all items addressed
if ('clearAppBadge' in navigator) {
  navigator.clearAppBadge();
}
```

### Push Notifications **[V2.1]**

Register for Push API to deliver workflow notifications directly to the device notification center. Notifications include action buttons:

```
"RFI #042 requires your response — due tomorrow"
[ Review Now ]  [ Remind in 1 Hour ]
```

Ball in Court transitions, approval requests, deadline warnings, and signature requests are the primary notification triggers.

### Installability Promotion **[V2.1]**

Display the custom install banner (triggered by `beforeinstallprompt`) after the user has visited 3+ times OR spent 5+ minutes in a session — not on first visit. Banner copy:

```
Install HB Intel for instant offline access,
push notifications, and a full-screen experience.
[ Install ]  [ Not now ]
```

### Responsive Behavior

| Viewport | Navigation | Layout Changes |
|---|---|---|
| Desktop `≥ 1024px` | Icon-rail sidebar | Standard 3-region layout |
| Tablet `768px – 1023px` | Bottom navigation bar | Sidebar hidden. Full-width content. `DetailLayout` sidebar stacks below |
| Mobile `< 768px` | Bottom navigation bar | Single-column. All multi-column rows stack vertically |
| `< 640px` | Bottom navigation | `HbcDataTable` transforms to card stack |

### Bottom Navigation Bar (Tablet & Mobile)

- Fixed to viewport bottom. Height: 56px. Background: `#1E1E1E`.
- 5 slots: 4 primary tool shortcuts + "More" bottom sheet.
- Active tab: Icon fill `#F37021`, label color `#F37021`.

### Field Mode (Dark Theme) **[V2.1 — Phase 4 First-Class Feature]**

Field Mode is completed in Phase 4. It is not a Phase 5 enhancement.

**Activation priority (highest to lowest):**
1. User's explicit manual override via `HbcUserMenu` toggle (`localStorage` key `hbc-field-mode: "light"` or `"dark"`)
2. System `prefers-color-scheme: dark` (auto-activates if no manual override)
3. Default: light theme

**Implementation:**
- `[data-theme="field"]` applied to `<html>` root element.
- All `--hbc-surface-*` and `--hbc-text-*` tokens resolve to Field Mode values (Section 3.1).
- The dark header (`#1E1E1E`) is unchanged.
- Status colors are the same sunlight-optimized values in both modes.
- `theme_color` meta tag updates dynamically when mode switches:
  ```html
  <meta name="theme-color" content="#1E1E1E">  <!-- Field Mode -->
  <meta name="theme-color" content="#004B87">  <!-- Light Mode -->
  ```
- All Storybook stories must pass in both `hbcLightTheme` and `hbcFieldTheme`.
- `prefers-reduced-motion` is respected in both modes.

### Mobile-Specific Adaptations

- **`HbcDataTable`:** Cards below 640px. Tap row to expand inline detail. "View Full Detail" link.
- **`HbcPanel`:** Bottom sheet on mobile. Full width.
- **`HbcModal`:** Full-screen on mobile.
- **`HbcCommandPalette`:** Full-screen on mobile. Bottom-up slide animation instead of center overlay.
- **Forms:** Single-column input layout below 768px.

### Offline Indicator (Replaced by Connectivity Bar)

The V2.0 `HbcBanner` offline indicator is **replaced** by the `HbcConnectivityBar` (Section 4.1). The connectivity bar is always visible and never pushes page content down. The `HbcBanner` component is still used for other persistent page-level messages — it is not deprecated, only removed from offline indicator duty.

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.14.4 (Field Mode Dark Theme) completed: 2026-03-04
- useFieldMode hook: added dynamic <meta name="theme-color"> update (Light=#FFFFFF, Field=#0F1419)
- HbcAppShell: wrapped children in FluentProvider with dynamic theme selection
- HbcUserMenu: dropdown bg/text/border now theme-aware via isFieldMode prop
- FieldMode.stories.tsx: LightMode + FieldMode stories demonstrating full shell
- ADR-0027 filed: docs/architecture/adr/ADR-0027-ui-field-mode-implementation.md
- Developer guide: docs/how-to/developer/phase-4.14-mobile-pwa-adaptations.md
- Verification: pnpm turbo run build (0 errors), lint (0 new warnings)
-->