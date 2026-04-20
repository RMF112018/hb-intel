# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 4
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026


## 4. Global Application Shell

The global shell is the persistent chrome visible on every authenticated screen. It is built once in `@hbc/ui-kit` and deployed in two environments:
1. As the root layout wrapper in the standalone PWA
2. As an SPFx Application Customizer injected into all SharePoint pages

---

### 4.1 Dark Header Anatomy

The header is a **fixed-position horizontal bar, 56px tall**, background `#1E1E1E`. It is the most recognizable element of the HB Intel UI.

**Above the dark header:** The `HbcConnectivityBar` — a 2px persistent ambient strip (see below). The combined visual unit is 58px total.

**Component:** `packages/ui-kit/src/HbcAppShell/HbcHeader.tsx`

#### `HbcConnectivityBar` — Ambient Network Status **[V2.1]**

**Component:** `packages/ui-kit/src/HbcAppShell/HbcConnectivityBar.tsx`

A 2px horizontal bar that sits above the dark header at the very top of the viewport. It is always visible and communicates network state through color alone — no text, no icons, no interruption to workflow.

| State | Color Token | Hex | Visual Treatment |
|---|---|---|---|
| Online & synced | `--hbc-connectivity-online` | `#00C896` | Solid 2px bar |
| Online, syncing | `--hbc-connectivity-syncing` | `#FFB020` | Solid 4px bar with subtle pulse animation |
| Offline | `--hbc-connectivity-offline` | `#FF4D4D` | Solid 4px bar with pulse animation (1.5s cycle) |

**Implementation:**
- Driven by `navigator.onLine` + `online`/`offline` window events.
- The service worker communicates sync queue state to the UI via `postMessage` to drive the amber "syncing" state.
- When offline, any interactive element that requires network connectivity displays the `CloudOffline` icon (16px, `--hbc-text-muted` color) in place of its normal action icon. Tapping an offline-blocked element shows a `HbcTooltip`: `"This action requires a network connection and will sync when you reconnect."`.
- `z-index: 10001` — above the Application Customizer header.
- In Field Mode (dark), the bar colors remain the same saturated values — they are intentionally high-contrast against the dark background.

#### Header Layout (Left to Right)

```
[ 2px connectivity bar — full viewport width                         ]
[ Logo ] [ Project Selector ▼ ] [ Toolbox ] [ ★ Favs ] [ 🔍 Search ] [ ⌘K ] [ + Create ] [ ⊞ ] [ 🔔 ] [ Avatar ]
|←—— LEFT ——|  |←————————— CENTER —————————→|  |← CENTER-RIGHT →|  |←—————————— RIGHT ————————————→|
```

#### Header Element Specifications

| Element | Specification |
|---|---|
| **HB Intel Logo** | `hb_logo_icon-NoBG.svg` white variant. Height: 32px. Links to Project Home. Left margin: 16px |
| **Project Selector** | Active project name. `heading-4` intent, white. Click opens searchable project dropdown. Chevron-down right |
| **Toolbox Menu** | Grid icon, 20px, `--hbc-header-icon-muted`. Opens `HbcToolboxFlyout` — full-width overlay listing all permissioned tools by role group |
| **Favorite Tools** | Up to 6 starred tool icons (20px, white). Hidden if no favorites saved |
| **Global Search** | Text input, min-width 320px. Placeholder: `"Search projects, RFIs, drawings…"`. On focus: renders `HbcSearchOverlay`. Keyboard: `Cmd+K` or `Ctrl+K` also opens Command Palette |
| **Command Palette Trigger** | `⌘K` badge displayed in the search bar right region. Also activates via keyboard shortcut. See Section 12 |
| **+ Create Button** | Background: `#F37021`. Text: white, `label` intent. Border-radius: 4px. Padding: `8px 16px`. Context-sensitive create actions based on active tool |
| **M365 Waffle** | Microsoft 365 official waffle SVG (24px, white). Opens native M365 app switcher |
| **Notifications Bell** | Bell icon, 20px, white. Red badge showing unread count. Click opens `HbcNotificationsPanel` |
| **User Avatar** | 32px circular avatar. Click opens `HbcUserMenu`: Profile Settings, Field Mode toggle, Sign Out |

#### `HbcUserMenu` — Field Mode Toggle **[V2.1]**

The user menu includes a **Field Mode** toggle. It is presented with a construction-specific label and icon, not as generic "Dark Mode":

```
[ 🌙  Field Mode  ] ●——○   (toggle, currently off = light)
```

When enabled, the toggle activates `hbcFieldTheme` and applies `[data-theme="field"]` to the root element. Preference is persisted to `localStorage` key `hbc-field-mode`. The toggle is overridden by `prefers-color-scheme: dark` (the system preference is respected unless the user explicitly sets a preference via this toggle — in which case their explicit choice wins).

#### Header Accessibility Requirements

- All icon-only buttons: `aria-label` required.
- Tab order (left to right): Logo → Project Selector → Toolbox → Search/Command Palette → Create → M365 Waffle → Notifications → Avatar.
- Minimum 3:1 contrast ratio for all icons against `#1E1E1E`.
- `Escape` closes any open flyout and returns focus to triggering element.
- `role="banner"` on the header element.

---

### 4.2 SPFx Application Customizer Integration

**Purpose:** Inject the identical dark header + connectivity bar into SharePoint pages.

**Component:** `packages/spfx/src/extensions/hbIntelHeader/HbIntelHeaderApplicationCustomizer.ts`

#### Implementation Steps

1. Generate the extension:
   ```bash
   yo @microsoft/sharepoint
   # → Extension → Application Customizer → Name: HbIntelHeaderCustomizer
   ```

2. Render into the Top placeholder:
   ```ts
   const topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
   if (topPlaceholder) {
     ReactDOM.render(
       <FluentProvider theme={hbcLightTheme}>
         <HbcConnectivityBar />
         <HbcAppShell context={this.context} />
       </FluentProvider>,
       topPlaceholder.domElement
     );
   }
   ```

3. The dark header background (`#1E1E1E`) and connectivity bar are hardcoded and do not respond to `FluentProvider` theme switching.

4. Suppress SharePoint's native suite bar:
   ```css
   .o365cs-topBar, #SuiteNavWrapper { display: none !important; }
   ```

5. `z-index: 10000` on the Application Customizer container. Connectivity bar: `z-index: 10001`.

6. Deploy to the SharePoint App Catalog scoped to the HB Intel site collection.

#### SPFx Bundle Size Constraint

The Application Customizer bundle must stay **under 250KB**. Create a separate `@hbc/app-shell` package exporting only `HbcConnectivityBar`, `HbcAppShell`, and direct dependencies. The full component library is consumed only by webpart bundles.

---

### 4.3 Collapsible Icon-Rail Sidebar

**Component:** `packages/ui-kit/src/HbcAppShell/HbcSidebar.tsx`

#### Sidebar States

| State | Width | Behavior |
|---|---|---|
| **Collapsed** (default) | 56px | Icon-only. Hover shows tooltip + mini-flyout of tool links |
| **Expanded** | 240px | Role-group label + all tool links with icon + text. Transition: `width 250ms cubic-bezier(0.4, 0, 0.2, 1)` **[V2.1]** |
| **Mobile/Tablet `< 1024px`** | Hidden | Bottom navigation bar replaces sidebar |

#### Expand/Collapse Behavior

- Collapse/Expand toggle button at the bottom of the sidebar.
- User preference persisted to `localStorage` key `hbc-sidebar-state`.
- Hover does **not** auto-expand. Click/keyboard only.
- In Focus Mode (Section 12), the sidebar auto-collapses to 56px regardless of saved preference.

#### Role-Based Navigation Groups

| Group | Visible To | Tools |
|---|---|---|
| **Marketing** | Marketing role members | Proposals, Presentations, Project Photography |
| **Preconstruction** | Preconstruction role members | Go/No-Go Scorecards, Estimating, Bid Management |
| **Operations** | Operations role members | Project Controls, RFIs, Punch List, Drawings, Budget, Daily Log, Turnover, Documents |
| **Admin** | Admin role only | User Management, System Settings, Audit Logs |

#### Active State Visual Treatment

- **Active tool link (expanded):** 3px solid left border `#F37021` + background `#E8F1F8` + text color `#004B87`
- **Active tool link (collapsed):** Icon fill `#F37021` + 3px left border `#F37021`
- **Hover state:** Background `#F0F2F5`, text color `#004B87`
<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.4 completed: 2026-03-04
Files created:
  - packages/ui-kit/src/HbcAppShell/types.ts
  - packages/ui-kit/src/HbcAppShell/hooks/ (useOnlineStatus, useFieldMode, useSidebarState, useKeyboardShortcut, index)
  - packages/ui-kit/src/HbcAppShell/HbcConnectivityBar.tsx
  - packages/ui-kit/src/HbcAppShell/HbcProjectSelector.tsx
  - packages/ui-kit/src/HbcAppShell/HbcToolboxFlyout.tsx
  - packages/ui-kit/src/HbcAppShell/HbcFavoriteTools.tsx
  - packages/ui-kit/src/HbcAppShell/HbcGlobalSearch.tsx
  - packages/ui-kit/src/HbcAppShell/HbcCreateButton.tsx
  - packages/ui-kit/src/HbcAppShell/HbcNotificationBell.tsx
  - packages/ui-kit/src/HbcAppShell/HbcUserMenu.tsx
  - packages/ui-kit/src/HbcAppShell/HbcHeader.tsx
  - packages/ui-kit/src/HbcAppShell/HbcSidebar.tsx
  - packages/ui-kit/src/HbcAppShell/HbcAppShell.tsx
  - packages/ui-kit/src/HbcAppShell/index.ts (barrel)
  - 4 Storybook stories (ConnectivityBar, Header, Sidebar, AppShell)
Documentation: docs/how-to/developer/phase-4.4-global-application-shell.md
ADR: docs/architecture/adr/ADR-0017-ui-global-shell.md
Build: pnpm turbo run build --filter=@hbc/ui-kit — zero errors
Type check: pnpm turbo run check-types --filter=@hbc/ui-kit — zero errors
Note: @hbc/auth added as dependency to @hbc/ui-kit for usePermission() in sidebar filtering
Next: Phase 4.5
-->
