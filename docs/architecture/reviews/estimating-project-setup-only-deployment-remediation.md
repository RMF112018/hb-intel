# Estimating Project Setup-Only Deployment Remediation

> **Date**: 2026-03-30
> **Scope**: Hide Bids/Templates, make Project Setup the only accessible surface

---

## 1. Root Cause / Page Registry Summary

The Estimating app registered 5 routes: `/` (BidsPage), `/templates` (TemplatesPage), `/project-setup`, `/project-setup/new`, `/project-setup/$requestId`. The navigation tool-picker showed all 3 top-level tabs. The default landing was `/` (BidsPage). For the Project Setup-only deployment, Bids and Templates were visible and directly accessible despite being non-functional (Bids used mock data, Templates showed empty state).

---

## 2. Files Changed

| File | Change |
|------|--------|
| `apps/estimating/src/router/routes.ts` | Removed Bids/Templates route registrations; index route redirects to `/project-setup` |
| `apps/estimating/src/router/root-route.tsx` | Removed Bids/Templates from `toolPickerItems`; only Project Setup visible |
| `apps/estimating/src/router/index.ts` | Changed memory history initial entry from `/` to `/project-setup` |
| `apps/estimating/src/test/router.test.ts` | Updated: verifies Project Setup routes present, Bids/Templates routes absent |

---

## 3. Implementation Approach

**Deployment-scoped route restriction** — routes are not registered (not just hidden from nav):

- **Index route (`/`)**: Still registered but `beforeLoad` throws `redirect({ to: '/project-setup' })`. Any access to `/` immediately redirects.
- **Bids route**: Removed from `webpartRoutes` array. Not registered in router. Direct access results in TanStack Router's default not-found behavior.
- **Templates route**: Removed from `webpartRoutes` array. Not registered in router. Same behavior.
- **Navigation**: `toolPickerItems` array reduced to single entry: `{ label: 'Project Setup', path: '/project-setup' }`.
- **Default landing**: Memory history starts at `/project-setup`.

---

## 4. Reversibility

**Fully reversible.** No page code was deleted. `BidsPage.tsx` and `TemplatesPage.tsx` remain in `apps/estimating/src/pages/`. To re-enable:

1. Add routes back to `webpartRoutes` in `routes.ts`:
   ```typescript
   const bidsRoute = createRoute({ path: '/', component: ... BidsPage ... });
   const templatesRoute = createRoute({ path: '/templates', component: ... TemplatesPage ... });
   ```
2. Add items back to `toolPickerItems` in `root-route.tsx`
3. Change memory history initial entry back to `/` if desired
4. Remove the redirect from the index route's `beforeLoad`

All page components, their tests, and their imports remain intact.

---

## 5. Test Coverage

| Test | File | Proves |
|------|------|--------|
| Memory history starts at `/project-setup` | `router.test.ts` | Default landing is Project Setup |
| Project Setup routes registered | `router.test.ts` | `/project-setup`, `/project-setup/new`, `/project-setup/$requestId` all present |
| Templates route NOT registered | `router.test.ts` | `/templates` not in route tree |
| Bids route NOT registered (as standalone) | `router.test.ts` | `/` exists only as redirect |

---

## 6. Verification Results

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-estimating test` | 9 files, 68 passed, 2 todo |
| `pnpm --filter @hbc/spfx-estimating build` | Clean — 1,140 KB (reduced from 1,183 KB) |
| Bids hidden from UI | Yes — removed from `toolPickerItems` |
| Bids blocked at route level | Yes — not registered in `webpartRoutes` |
| Templates hidden from UI | Yes — removed from `toolPickerItems` |
| Templates blocked at route level | Yes — not registered in `webpartRoutes` |
| Default landing = Project Setup | Yes — memory history starts at `/project-setup` |
| `/` redirects to `/project-setup` | Yes — `beforeLoad` throws redirect |

---

## 7. Manual SharePoint Validation Needed

- [ ] Deploy updated `.sppkg` to App Catalog
- [ ] Verify only "Project Setup" tab visible in navigation
- [ ] Verify no "Bids" or "Templates" tabs appear
- [ ] Verify app lands on Project Setup list page
- [ ] Verify manually entering `#/templates` or `#/` in URL does not render Bids/Templates content
