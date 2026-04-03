# Admin SPFx IT Control Center — Phase 8 SharePoint Control Lane UX

**Prompt:** P8-08 — SPFx SharePoint Control Lane UX
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the operator-facing SharePoint control lane implementation.

---

## 1. What was implemented

### New page: `SharePointControlPage.tsx`

**File:** `apps/admin/src/pages/SharePointControlPage.tsx`

Replaces the empty `SharePointLanePage.tsx` scaffold with a real operator control surface providing:

| Section | Purpose |
|---------|---------|
| **Action bar** | Drift detection, preview repair, apply repair, check posture buttons |
| **Drift summary** | Area breakdown with outcome badges, expectation counts, drift/repairable tallies |
| **Drift findings** | Per-finding list with severity badges, repairable vs advisory distinction |
| **Repair preview** | Proposed changes (create) vs advisory-only (no-change) items with risk level |
| **Preview warnings** | Uninspectable areas, non-repairable critical findings |
| **Posture validation** | App catalog (4 checks) and API access (4 checks) with status, detail, and recommended actions |
| **Summary cards** | Numeric summary cards for at-a-glance status |

### Route and registry updates

| File | Change |
|------|--------|
| `lane-registry.ts` | SharePoint lane status changed from `scaffold` to `active`; removed stale `deliversIn: 'Phase 7'` |
| `routes.ts` | Route component changed from `SharePointLanePage` to `SharePointControlPage` |

### UX distinctions

The page makes these operator-facing distinctions clear:

| Distinction | How shown |
|-------------|----------|
| Advisory vs actionable | `HbcStatusBadge` with "repairable" (inProgress) or "advisory" (neutral) labels |
| Preview vs executed | Separate preview section shown only after preview generation |
| In-scope vs out-of-scope | Action buttons disabled until prior step completes (drift → preview → repair) |
| Repair vs apply/reapply | Preview shows `changeType: create` for repairs, `no-change` for advisory |
| Current status vs history | Drift/posture results show timestamp; history access via Runs lane |

### Design compliance

- All styles use HBC design tokens (`HBC_SPACE_*`, `HBC_STATUS_COLORS.*`) — no hardcoded hex/px values
- All typography uses `HbcTypography` with valid `intent` props (`heading3`, `heading4`, `bodySmall`)
- All buttons use `HbcButton` with valid `variant` props (`primary`, `secondary`, `ghost`)
- Status visualization uses `HbcStatusBadge` with semantic variants
- Layout uses `WorkspacePageShell` with `layout="list"` per admin shell patterns
- No privileged execution logic in the frontend — all buttons trigger backend APIs

---

## 2. API wiring status

Backend services (P8-04 through P8-07) are fully implemented and tested. The page's action handlers currently show placeholder messages indicating API routes are not yet wired. This is intentional — Prompt-08 establishes the UX shell; API route integration will be completed when the admin API surface is extended.

| Action | Backend service | API route | Status |
|--------|----------------|-----------|--------|
| Run Drift Detection | `runSharePointDriftDetection()` | Pending | Service ready, route pending |
| Preview Repair | `runSharePointRepairPreview()` | Pending | Service ready, route pending |
| Apply Repair | `executeSharePointRepair()` | Pending | Service ready, route pending |
| Check Posture | `runPostureValidation()` | Pending | Service ready, route pending |

---

## 3. Repo-truth corrections

| Correction | Before | After |
|-----------|--------|-------|
| Lane registry status | `scaffold` | `active` |
| Lane registry `deliversIn` | `'Phase 7'` (stale) | Removed (now active) |
| Route component | `SharePointLanePage` (empty scaffold) | `SharePointControlPage` (real content) |

---

## Validation

### Verified

| Check | Command | Result |
|-------|---------|--------|
| Admin lint | `pnpm --filter @hbc/spfx-admin lint` | **Pass** — 0 errors, 3 warnings (unused state setters, expected) |
| Admin build | `pnpm --filter @hbc/spfx-admin build` | **Pass** — tsc + vite, built in 3.94s |

### Not run

| Check | Reason |
|-------|--------|
| Admin tests | No test file for new page (follows existing page pattern — no pages have dedicated tests) |
| Backend tests | No backend changes in this prompt |
| E2E | No E2E for admin app |

---

## Cross-references

- [Phase 8 Control Baseline](admin-spfx-phase-8-sharepoint-control-baseline.md) — SPFx responsibilities (section 5)
- [Drift Detection Workflow](admin-spfx-phase-8-drift-detection-workflow.md) — backend drift service
- [Preview and Dry-Run](admin-spfx-phase-8-preview-and-dry-run.md) — backend preview service
- [Repair and Standards Application](admin-spfx-phase-8-repair-and-standards-application.md) — backend repair service
- [Package and API Posture](admin-spfx-phase-8-package-and-api-posture.md) — backend posture service
- Page code: `apps/admin/src/pages/SharePointControlPage.tsx`
- Lane registry: `apps/admin/src/router/lane-registry.ts`
- Routes: `apps/admin/src/router/routes.ts`
