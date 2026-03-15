# W0-G5-T06 — Install-Ready, Browser-First, and Mobile Posture

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 5
> **Governing plan:** `docs/architecture/plans/MVP/G5/W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md`

**Status:** Proposed
**Stream:** Wave 0 / G5
**Locked decisions served:** LD-06, LD-07

---

## Shared Feature Gate Check

### Required Infrastructure

| Concern | Location | Required For | Maturity Check |
|---|---|---|---|
| PWA manifest | `apps/pwa/public/manifest.json` or `apps/pwa/index.html` | Install-ready posture | Inspect whether a web app manifest (`manifest.json`) exists with required fields: `name`, `short_name`, `icons` (at minimum 192x192 and 512x512), `start_url`, `display: 'standalone'`, `theme_color`, `background_color`. If absent, a manifest must be created as part of T06. |
| Service worker | `apps/pwa/src/` or build config | Install-ready + draft offline protection | A service worker must exist to enable PWA installation. Inspect whether a service worker is configured (e.g., via Vite PWA plugin, Workbox, or manual registration). If absent, configure one as part of T06. The service worker in Wave 0 has a narrow scope: app shell caching for fast load and service worker lifecycle (install, activate, fetch). Full offline API caching is not required. |
| Mobile viewport config | `apps/pwa/index.html` | Tablet/phone rendering | Verify `<meta name="viewport" content="width=device-width, initial-scale=1">` is present. Verify `@hbc/ui-kit` breakpoints are appropriate for tablet and phone viewports. |
| `@hbc/ui-kit` | `packages/ui-kit/` | Responsive layout primitives | Verify that ui-kit provides responsive layout components (grid, container, stack) with breakpoints at tablet (≥768px) and phone (<768px). If not, local responsive layout in the PWA feature module is acceptable but must be documented as a gap for ui-kit. |

### Gate Outcome

If the PWA manifest and service worker are absent, T06 cannot be closed without creating them. Creating a minimal manifest and configuring a basic Workbox-backed service worker (via the Vite PWA plugin) is the preferred approach if the infrastructure does not already exist.

---

## Objective

Ensure the hosted PWA requester surfaces are installable as a Progressive Web App and are comfortably usable on tablet and phone browsers. After this task:

1. The PWA meets installation criteria in Chrome, Edge, and Safari (iOS)
2. The app shell and key requester surfaces cache correctly for fast subsequent loads
3. Key requester actions are comfortably usable on a tablet (≥768px) and on a phone browser (<768px)
4. Install prompts do not block the requester workflow — the browser path always works without installation

---

## Scope

### Install-Ready Posture

**Web app manifest:** Create or verify the web app manifest includes all required fields for installability:
- `name`: full app name
- `short_name`: app name suitable for home screen icon label
- `icons`: minimum 192×192px and 512×512px PNG icons (maskable variants preferred)
- `start_url`: `/` or the appropriate requester landing route
- `display`: `"standalone"` (removes browser chrome when installed)
- `theme_color` and `background_color`: brand-appropriate colors
- `description`: brief app description

**Service worker:** Configure a service worker that:
- Caches the app shell (HTML, CSS, JS bundles) for fast subsequent loads and reliable startup in degraded connectivity
- Uses a cache-first strategy for static assets
- Uses a network-first strategy for API calls (do not cache API responses in Wave 0 — the operation queue in `@hbc/session-state` handles the offline mutation path)
- Handles service worker lifecycle events (install, activate, fetch) correctly
- Does not conflict with `@hbc/session-state`'s IndexedDB-based operation queue

**Install prompt handling:**
- Do not show a custom install prompt that blocks or interrupts the requester workflow
- If a custom "Add to Home Screen" prompt is shown, it must be dismissible and must not reappear on the same session after dismissal
- The browser's native install affordance is sufficient for Wave 0; a custom install prompt is optional
- The install prompt must not appear during an active guided setup flow (step entry)

### Browser-First Support Rule

The browser path is the primary supported path. The following requirements enforce this:

- All requester surfaces must work fully in a standard browser without installation
- No feature may require service worker activation to function (e.g., draft persistence uses IndexedDB directly via `@hbc/session-state`, which does not require a service worker)
- No route may require "installed app" context to render
- The PWA's `start_url` may be the home route, but navigation to `/project-setup` directly in a browser tab must always work

### Tablet-Safe Posture (≥768px)

"Tablet-safe" means no horizontal scrolling, no broken layouts, no truncated or overlapping content on viewports from 768px width and up.

Required for all G5 surfaces (T01–T05 surfaces):

- Step Wizard renders without horizontal overflow on 768px
- Each step's form fields are fully usable (inputs not clipped, labels not wrapping unexpectedly)
- The connectivity banner does not obscure content
- The completion summary is readable without scrolling horizontally
- The status list (requester's request list) renders correctly with at least 2 visible columns on tablet

### Phone-Friendly Key Requester Actions (<768px)

"Phone-friendly" means that the following specific actions are comfortable on a phone browser. Full feature parity on phone is not required; these specific actions must work:

| Action | Phone-Friendly Requirement |
|---|---|
| Start a new request | The CTA (button or link) is large enough to tap comfortably (minimum 44×44px touch target) |
| Complete a single step | Step form fields are full-width and tappable; no horizontal scroll needed to reach a field |
| Save draft | "Save and close" action is reachable without horizontal scroll |
| Submit request | Submit button is reachable and tappable on the phone viewport |
| View request status | The status list is readable on a phone viewport; each request row is tappable |
| Return a clarification response | The clarification entry form is full-width and submittable on a phone viewport |

Actions that are acceptable to be suboptimal on phone in Wave 0:
- Multi-column comparison views (if any)
- Rich data tables in the status list (acceptable to use a simplified single-column layout)
- Detailed operation queue inspection panel (acceptable to be less optimized on phone)

---

## Exclusions / Non-Goals

- Do not build a native app. PWA installability is the scope.
- Do not implement background sync via Service Worker for the operation queue. `@hbc/session-state` uses IndexedDB directly; background sync is a Wave 0+ enhancement.
- Do not implement push notifications via Service Worker. That belongs to `@hbc/notification-intelligence` in a later wave.
- Do not implement a fully offline-capable mobile app. LD-03 and LD-07 are explicit that Wave 0 is primarily online.
- Do not optimize every PWA surface for phone. Only the key requester actions listed above must be phone-friendly.
- Do not implement a native-app-like bottom navigation or mobile-specific UX patterns beyond what is required for the key actions.

---

## Governing Constraints

- The browser path must never be blocked (LD-07)
- Install prompts must not interrupt an active workflow (LD-07)
- Touch targets for key actions must meet the 44×44px minimum (WCAG 2.5.5 / Apple HIG guidance)
- No reusable visual UI outside `@hbc/ui-kit` (package boundary rule)
- Service worker must not conflict with `@hbc/session-state`'s IndexedDB behavior

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `apps/pwa` | Target | Manifest, service worker, viewport config |
| Vite PWA plugin (or Workbox) | Build tooling | Service worker generation — prefer the existing pattern in `apps/pwa/` if already configured |
| `@hbc/ui-kit` | Required | Responsive layout primitives |
| `@hbc/session-state` | Supporting | Service worker must not interfere with IndexedDB usage |
| All T01–T05 surfaces | Predecessor | Mobile posture applies across all G5 surfaces |

---

## Acceptance Criteria

1. **Installability criteria met.** Running Chrome's Lighthouse PWA audit on the hosted PWA returns a passing installability score. The manifest includes all required fields. The service worker is registered and active.

2. **Install prompt does not block workflow.** Starting a guided request entry session does not trigger an install prompt. Any prompt shown elsewhere is dismissible and does not reappear on the same session.

3. **Browser path works without installation.** Navigate to `/project-setup` in an incognito browser (no PWA install). All G5 surfaces load and function correctly.

4. **Tablet layout is clean at 768px.** Using browser DevTools at 768px width, all G5 surfaces render without horizontal scrolling, clipped inputs, or overlapping content.

5. **Key requester actions are phone-friendly.** Using DevTools at 375px width (iPhone SE equivalent), all key requester actions (start, step entry, save, submit, status view, clarification response) are accessible and tappable without horizontal scroll.

6. **Service worker does not break IndexedDB.** After a force-refresh with the service worker active, `@hbc/session-state`'s draft and connectivity behavior functions correctly.

---

## Validation / Readiness Criteria

Before T06 is closed:

- Lighthouse PWA audit passed (installability and performance scores within acceptable range — document the specific scores)
- Manual tablet test at 768px width completed for all G5 surfaces
- Manual phone test at 375px width completed for all key requester actions
- Service worker registration verified in DevTools (Application tab → Service Workers)
- Manifest validated in DevTools (Application tab → Manifest)

---

## Known Risks / Pitfalls

**Vite PWA plugin configuration:** If the existing `apps/pwa/` build uses Vite, the `vite-plugin-pwa` plugin is the preferred way to generate the service worker. If the plugin is not yet configured, setup requires both plugin installation and manifest configuration. Inspect `apps/pwa/vite.config.ts` before implementing.

**Safari PWA support limitations:** Safari on iOS has historically had restrictions on PWA features (Background Sync, Push API). Wave 0 does not require these, but confirm the manifest `display: "standalone"` and the service worker lifecycle work correctly in Safari before closing T06.

**Icon asset creation:** If the PWA does not have 192×192 and 512×512 PNG icons, they must be created or sourced. Do not use placeholder icons in a shipped build.

**Service worker cache invalidation:** If the service worker caches the app shell aggressively, a deployed code update may not reach users. Ensure the service worker uses a proper cache-busting strategy (e.g., versioned cache names, Workbox's `injectManifest` or `generateSW` with revision hashes).

---

## Progress Documentation Requirements

During active T06 work:

- Record the service worker approach chosen (Vite PWA plugin config, Workbox, or manual) and the rationale
- Record the Lighthouse PWA audit score from first run (before optimization) as a baseline
- Record any Safari-specific compatibility issues found during testing

---

## Closure Documentation Requirements

Before T06 can be closed:

- `apps/pwa/README.md` documents: PWA manifest location, service worker strategy, install-ready posture, and browser-first rule
- Lighthouse PWA audit scores are recorded (either in this file or in a testing artifact referenced here)
- Tablet and phone test results are recorded
- All acceptance criteria verified and checked off
