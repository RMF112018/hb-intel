# W0-G4-T07 — Responsive Behavior, Navigation, Composition, and Failure Modes

> **Doc Classification:** Canonical Normative Plan — implementation-governing task plan for Wave 0 Group 4, Task 07. Specifies desktop-first responsive posture, tablet-safe requirements for key workflows, navigation composition between Estimating / Accounting / Admin / Project Hub, degraded/failure/unavailable state expectations in SPFx surfaces, and how `@hbc/ui-kit` governs shared layout and state-display primitives.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — implementation validates and supplements T01–T06 surface specifications
**Parent Plan:** `W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md`
**Governed by:** CLAUDE.md v1.6 → `current-state-map.md` → G3-T07 → G4 master plan → this document
**Depends on:** T01–T06 (all primary surfaces and complexity rules)
**Unlocks:** T08 (failure-mode tests, responsive verification)
**Phase 7 gate:** ADR-0090 must exist on disk before implementation begins

---

## 1. Objective

Define the governing rules for:

- Desktop-first responsive posture for all G4 SPFx surfaces
- Tablet-safe requirements for key workflows (guided setup, coordinator retry, controller review)
- Navigation rules between Estimating, Accounting, Admin, and Project Hub
- Page and component composition rules relevant to cards, panels, and routed surfaces
- What the UI must do when backend or shared-platform data is delayed, missing, or temporarily inconsistent
- How `@hbc/ui-kit` governs shared layout, state-display, and navigation-related presentation primitives

This task does not introduce new functional surfaces. It governs how the surfaces defined in T01–T06 behave under real-world layout and failure conditions.

---

## 2. Responsive Posture

### 2.1 Desktop-First Definition

All G4 SPFx surfaces are designed and tested for desktop-class viewports as the primary rendering target.

**Desktop class:** 1024px viewport width and above.

At desktop width, all surfaces must:
- Render without horizontal overflow
- Use `WorkspacePageShell` in its standard layout modes (`'list'`, `'detail'`, `'form'`, `'dashboard'`) as provided by `@hbc/ui-kit`
- Display all essential-tier and (where applicable) standard-tier content without requiring horizontal scroll
- Support `HbcDataTable` column display without column truncation on the primary columns (Project Name, State, Submitted, Owner)

### 2.2 Tablet-Safe Requirements

The following workflows must function correctly on tablet-class viewports (768px–1023px viewport width):

| Workflow | Surface | Tablet-Safe Requirement |
|----------|---------|------------------------|
| Guided setup form (T01) | Estimating `NewRequestPage` | All steps, fields, navigation buttons, and auto-save indicator must be usable without horizontal scroll |
| Post-submit status view (T01) | Estimating `RequestDetailPage` | Core summary and state context must be readable; BIC badge must not overflow |
| Coordinator bounded retry (T02) | Estimating `RequestDetailPage` | Retry button and out-of-bounds banner must be accessible and tappable |
| Controller queue (T03) | Accounting `ProjectReviewQueuePage` | Table must reflow to fewer columns or a card-list layout; primary action ("Open") must be tappable |
| Controller review (T03) | Accounting `ProjectReviewDetailPage` | Core summary and action panel must be accessible; action panel must stack vertically rather than floating |
| Completion confirmation (T05) | Estimating `RequestDetailPage` | Completion card and "Open Project Hub" button must be readable and tappable |

**Tablet-safe definition:**
- No horizontal overflow or scroll required for primary content
- Minimum touch target size for all primary action buttons: 44px × 44px (WCAG 2.5.5 guideline)
- Readable type hierarchy: body text minimum 14px, heading minimum 18px at 768px
- Form fields must have adequate height for tap interaction (minimum 44px touch target)
- `HbcDataTable` tables that do not fit at 768px must reflow to a card-based list layout or hide non-essential columns (with a "More" expand option if all columns are important)

### 2.3 Mobile Posture

Mobile (< 768px) is **not a Wave 0 SPFx delivery target.** Surfaces are not required to function at mobile widths. Surfaces should not actively break at mobile widths (i.e., do not use fixed-width containers that produce horizontal overflow on any device), but mobile layout optimization is deferred to a future delivery milestone.

If a surface is accessed on a mobile device, it must render at least the essential-tier core summary without crashing, even if the layout is not optimized. It must not show a blank screen or an uncaught error.

### 2.4 Responsive Breakpoints

All G4 surfaces must use the following breakpoints consistently (these must match `@hbc/ui-kit`'s theme breakpoints — verify against `packages/ui-kit/src/theme/`):

| Breakpoint | Viewport Width | Layout Behavior |
|------------|----------------|-----------------|
| `sm` | < 768px | Not a target; degrade gracefully |
| `md` | 768px–1023px | Tablet-safe layout required for key workflows |
| `lg` | 1024px+ | Desktop-first primary target |

If `@hbc/ui-kit`'s theme uses different breakpoint names or values, use those values — do not introduce competing breakpoint constants in G4 app code.

---

## 3. Navigation Composition

### 3.1 Within-App Navigation

Within each SPFx app, navigation uses TanStack Router (`useNavigate`, `<Link>`, `createRoute`). This is the existing pattern in all G4 apps.

**Rule:** Do not use `window.location.href` for within-app navigation. Use TanStack Router's `useNavigate()` or `<Link to="...">` components.

**Rule:** Do not use `<a href="...">` for within-app navigation (it would trigger a full page reload in SPFx). Exception: the Project Hub cross-site link (T05) which intentionally opens a new tab via `window.open`.

### 3.2 Cross-App Navigation

Cross-app navigation in SPFx means navigating to a different SharePoint page that hosts a different webpart. These are cross-origin navigations that cannot use TanStack Router.

The following cross-app navigations are specified in G4:

| From | To | Trigger | Navigation Method |
|------|----|---------|-------------------|
| Estimating coordinator failure banner | Admin provisioning failures | "Open Admin Recovery" button | `window.open(adminUrl, '_blank')` or `window.location.href = adminUrl` |
| Accounting controller "Send to Admin" | Admin provisioning failures | "Send to Admin" button | `window.open(adminUrl, '_blank')` or `window.location.href = adminUrl` |
| Estimating completion card | Project Hub project site | "Open Project Hub" button | `window.open(projectSiteUrl, '_blank', 'noopener,noreferrer')` |

**URL construction for cross-app navigation:**

The Admin app URL and Accounting app URL must be configured via environment variables — not hardcoded. The following env vars (or equivalent) must exist in the Estimating app's environment configuration:

```
VITE_ADMIN_APP_URL=https://{tenant}.sharepoint.com/sites/HBIntelAdmin
VITE_ACCOUNTING_APP_URL=https://{tenant}.sharepoint.com/sites/HBIntelAccounting
```

**Query parameter passing for pre-selection:**

When the coordinator or controller navigates to Admin with a specific `projectId`, append `?projectId={projectId}` to the URL:

```typescript
const adminUrl = `${import.meta.env.VITE_ADMIN_APP_URL}/provisioning-failures?projectId=${projectId}`;
```

The Admin app's route handler for `/provisioning-failures` must read `projectId` from `useSearch()` (TanStack Router) and auto-scroll or highlight the matching row.

### 3.3 Back Navigation

All detail/review pages (Estimating `RequestDetailPage`, Accounting `ProjectReviewDetailPage`, Admin failure detail) must include a "← Back" navigation element that uses TanStack Router's history navigation (`useNavigate(-1)` or a direct link to the queue route).

**Implementation:** Use `HbcBreadcrumbs` from `@hbc/ui-kit` if available, or a simple `HbcButton variant="ghost"` labeled "← Back to [Queue Name]". Do not implement custom back-button logic.

### 3.4 Navigation After Action

After a controller submits an approval or clarification request (T03), the page must navigate back to the queue (`/project-review`). This navigation must happen after the API response resolves — not on button click.

After a coordinator submits a successful retry (T02), the page stays on `RequestDetailPage` — the store refresh will update the state. No navigation after retry.

After an admin submits force-retry or archive (T04), the page stays on the failures view — the table refreshes.

---

## 4. Panel and Modal Composition

### 4.1 When to Use Panels

`HbcPanel` from `@hbc/ui-kit` is used for secondary content that overlays the current page without a full route change:

- Admin failure detail (a panel overlaying the failures table when a row is opened — alternative to navigating to a separate page; use panel for simpler failure detail, page for complex)
- Coordinator retry confirmation (inline — a brief confirmation, not a full panel; use `HbcConfirmDialog`)

### 4.2 When to Use Modals

`HbcModal` from `@hbc/ui-kit` is used for focused interactions that require the user's complete attention before proceeding:

- Controller clarification note entry (T03) — the controller must write a note before submitting the clarification request
- Admin manual state override (T04) — the admin must confirm the override in a modal with a strong warning

### 4.3 When to Use Full Page Routes

Full page routes are used when the content justifies a full workspace — not a panel overlay:

- Accounting `ProjectReviewDetailPage` — the full review surface requires the full viewport
- Estimating `RequestDetailPage` — provisioning detail and completion confirmation require full context

**Rule:** Do not use modals for content that routinely requires scrolling. If the modal content would scroll, it belongs in a page route or a panel.

---

## 5. Failure Modes and Degraded-State Catalog

The following catalog defines the expected behavior for each failure mode that G4 surfaces may encounter.

### 5.1 Backend API Unavailable or Slow

**Detection:** `createProvisioningApiClient` calls fail with network error or timeout (5-second threshold recommended).

**Expected behavior in all G4 surfaces:**
- Show `HbcEmptyState` with message "Unable to load data. Check your connection and try again." — do not show a blank page or uncaught error
- Show `HbcButton variant="secondary"` labeled "Retry" that re-triggers the `useEffect` data fetch
- Do not show stale data after a confirmed fetch failure — show empty state

**Estimating `NewRequestPage` (setup wizard):**
- If the submit API call fails, show `HbcBanner variant="error"` with "Submission failed. Your progress has been saved. Try again." — do not clear the draft
- The retry button in the wizard is for re-submitting, not for retrying provisioning

**Estimating `RequestDetailPage`:**
- If the status fetch fails, show the last known request state from the store (may be stale) with a `HbcBanner variant="warning"` labeled "Live status unavailable — showing last known state."

### 5.2 SignalR Connection Failure (Real-Time Updates Unavailable)

**Detection:** `useProvisioningSignalR()` connection fails or drops.

**Expected behavior:**
- Show `HbcConnectivityBar` (from `@hbc/session-state`) or equivalent indicator that live updates are paused
- Fall back to polling: trigger a `client.getProvisioningStatus()` call every 30 seconds while the user is on `RequestDetailPage` and the request is in `Provisioning` state
- The polling fallback must not be implemented directly in the component — verify whether `@hbc/provisioning`'s `useProvisioningSignalR` hook already provides a polling fallback; if not, the polling must be implemented in the component with a 30-second interval
- Show last-updated timestamp so the user knows when the data was last confirmed fresh

### 5.3 Auth Session Expired or Unavailable

**Detection:** `useCurrentSession()` returns null; `@hbc/auth` signals an expired session.

**Expected behavior (all G4 surfaces):**
- The `@hbc/auth` provider handles session expiry and re-authentication. G4 surfaces must not implement their own session-expiry UI.
- If the session is null at render time, render `WorkspacePageShell` with an appropriate loading state or `HbcEmptyState` labeled "Session loading..." — do not crash.
- The auth provider's `RoleGate` or `FeatureGate` will handle unauthorized access — G4 surfaces do not need to implement their own unauthorized-access UI.

### 5.4 `IProjectSetupRequest` Missing or Not Found

**Detection:** `requests.find(r => r.requestId === requestId)` returns `undefined` in `RequestDetailPage`.

**Expected behavior:**
- Show `WorkspacePageShell layout="detail" title="Request Not Found"` with `HbcEmptyState` body: "The project setup request was not found. It may have been removed or you may not have access."
- This is already partially implemented in the existing `RequestDetailPage.tsx`: `if (!request) { return <WorkspacePageShell ...>Request not found.</WorkspacePageShell> }` — T01 must upgrade this to use `HbcEmptyState`.

### 5.5 `IProvisioningStatus` Missing After Completion

**Detection:** `request.state === 'Completed'` but `provisioningStatus` is null/undefined (e.g., the status API call failed after a successful provisioning run).

**Expected behavior (T05 — completion confirmation):**
- Render the completion confirmation card without the site URL / Project Hub link
- Show `HbcBanner variant="warning"`: "Project site URL is not yet available. Check back in a few moments."
- Do not block the completion confirmation card itself — the state is `Completed` and that should be communicated even if the status payload is missing

### 5.6 Coordinator Retry API Failure (T02)

**Detection:** `client.retryProvisioning()` returns an error.

**Expected behavior:**
- Button returns to non-loading state
- Show `HbcBanner variant="error"`: "Retry failed. If the issue persists, contact Admin."
- Do not immediately re-enable the retry button — force a data refresh cycle first (the store refresh will re-evaluate eligibility)

### 5.7 Controller Action API Failure (T03)

**Detection:** Approve, request clarification, or hold API call returns an error.

**Expected behavior:**
- Action button returns to non-loading state
- Show `HbcBanner variant="error"` in the review page body (not a toast — the error should persist until the user takes action)
- Provide a "Try Again" affordance in the banner

### 5.8 Admin Force-Retry or Archive Failure (T04)

**Detection:** Admin API call returns an error.

**Expected behavior:**
- Same as controller action failure — `HbcBanner variant="error"` with "Try Again" affordance

### 5.9 Cross-App URL Configuration Missing (T02, T03)

**Detection:** `import.meta.env.VITE_ADMIN_APP_URL` is undefined or empty.

**Expected behavior:**
- Do not render the "Open Admin Recovery" or "Send to Admin" cross-app buttons
- Show a fallback `HbcBanner variant="warning"` with: "Admin navigation is not configured in this environment. Contact your system administrator."
- This prevents broken links in development or misconfigured environments

### 5.10 Project Hub `siteUrl` Invalid or Missing (T05)

**Expected behavior:** Already specified in T05 §7.2 — render warning banner, do not render the button.

### 5.11 `@hbc/complexity` Context Not Initialized

**Detection:** `useComplexity()` returns null or throws before the `ComplexityProvider` has mounted.

**Expected behavior:**
- All content should default to `essential` tier visibility (the safest fallback — shows the least rather than the most)
- Do not crash — `HbcComplexityGate` should handle a null complexity context gracefully; verify this in the `@hbc/complexity` package tests

---

## 6. `@hbc/ui-kit` Layout and State-Display Governance

The following `@hbc/ui-kit` primitives govern layout and state display in G4. Implementers must not introduce competing layout systems:

| Concern | Required Component | Notes |
|---------|-------------------|-------|
| Page layout | `WorkspacePageShell` | Used in all G4 pages; do not use raw `<div>` page layouts |
| Error boundary | `HbcErrorBoundary` | Wrap each SPFx webpart's root render in an `HbcErrorBoundary` to prevent full-page crashes |
| Loading state | `HbcSpinner` | While API data is loading |
| Empty state | `HbcEmptyState` | When no data is available |
| Error message | `HbcBanner variant="error"` | For recoverable errors (API failures, validation failures) |
| Warning message | `HbcBanner variant="warning"` | For degraded state or user attention items |
| Info message | `HbcBanner variant="info"` | For neutral informational context |
| Success toast | `HbcToast` | Transient success feedback after action completion |
| Confirmation | `HbcConfirmDialog` | Before destructive or significant state-changing actions |

**Error boundaries:** Every SPFx webpart bootstrap file (`EstimatingWebPart.tsx`, `AccountingWebPart.tsx`, `AdminWebPart.tsx` — implied from manifest structure) must wrap the app root in `HbcErrorBoundary`. This prevents the entire SharePoint page from going blank if a G4 component throws an unhandled error.

---

## 7. Reference Document Output

T07 produces `docs/reference/spfx-surfaces/responsive-failure-catalog.md`. This document must contain:

1. The responsive breakpoint table (§2.4)
2. Tablet-safe requirements per workflow (§2.2)
3. The cross-app navigation URL table with env var names (§3.2)
4. The complete failure mode catalog (§5.1–5.11) formatted as a lookup table for implementers
5. `HbcErrorBoundary` placement requirements

---

## 8. Acceptance Criteria

T07 is complete when all of the following are true:

- [ ] All G4 surfaces render without horizontal overflow at 1024px viewport width
- [ ] All tablet-safe key workflows (guided setup, coordinator retry, controller queue and review, completion confirmation) function correctly at 768px without horizontal scroll
- [ ] Touch target size for primary action buttons is ≥ 44px × 44px at 768px
- [ ] All cross-app navigation uses env-var-sourced URLs (no hardcoded URLs)
- [ ] `VITE_ADMIN_APP_URL` is documented as a required env var in the Estimating app's environment config
- [ ] All failure modes in §5 are implemented with the specified degraded-state behavior
- [ ] All SPFx webpart roots are wrapped in `HbcErrorBoundary`
- [ ] No blank pages or uncaught error screens when the backend is unavailable
- [ ] SignalR failure triggers polling fallback with 30-second interval
- [ ] Missing `siteUrl` on completion renders warning banner (not crash)
- [ ] Reference document exists at `docs/reference/spfx-surfaces/responsive-failure-catalog.md`

---

*End of W0-G4-T07 — Responsive Behavior, Navigation, Composition, and Failure Modes v1.0*
