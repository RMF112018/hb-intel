# PH7-Estimating-Features — Estimating Module Master Summary

> **Doc Classification:** Canonical Normative Plan — master summary and locked-decisions index for the Estimating module feature build-out; governs `ph7-estimating/PH7-Estimating-1` through `PH7-Estimating-12` task files. This is v2.0 which superseded the monolithic `PH7-Estimating-Feature-Plan.md` v1.0. Implementation pending PH7.12 sign-off (ADR-0090) and BW infrastructure layer completion.

**Version:** 2.0 (Rewritten — split into task files)
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-08
**Derived from:** Structured product-owner interview (2026-03-07); all decisions locked.
**Supersedes:** `PH7-Estimating-Feature-Plan.md` v1.0 (monolithic — retained as archive)
**Type:** MASTER SUMMARY — index only; all implementation detail lives in numbered task files below.

---

## Purpose

This file is the authoritative index for the Estimating module feature build-out. It defines the scope, locked decisions, implementation sequence, and task file inventory. All code-level specification is delegated to the numbered task files.

---

## Locked Interview Decisions

| # | Topic | Decision | Locked |
|---|---|---|---|
| Q11 | Tracking table scope | All three tables (Current Pursuits, Current Preconstruction, Estimate Tracking Log) live in Estimating | ✅ |
| Q11 | Preconstruction placement | Stays in Estimating — Project Hub is single-project context only | ✅ |
| Q12 | Kickoff / submission checklist | Lives in **Project Hub** at `/project-hub/:projectId/kickoff`; Estimating pursuits rows redirect there | ✅ |
| Q13 | Bid Templates | **Option B** — curated, categorized SharePoint link library (no file storage in HB Intel) | ✅ |
| Q14 | Estimate Tracking Log analytics | **Option C** — dedicated analytics view with recharts charts, fiscal year comparisons, win-rate breakdown | ✅ |
| Q15 | External platform integration | **Option B** — contextual deep links to Building Connected & Procore per pursuit record; Option C (live API) documented for future in ADR-0075 | ✅ |
| BW-0 | Page component location | All pages in `packages/features/estimating/src/` via `@hbc/features-estimating` — NOT in `apps/estimating/src/pages/` | ✅ |

### Governing Architectural Rule (product-owner, 2026-03-07)
> "The Project Hub will contain features that use data for one unique project at a time. Tracking that includes multiple projects will never be included in the Project Hub."

---

## Module Scope

The Estimating module (`apps/estimating/` webpart + `packages/features/estimating/`) owns:

- **Current Pursuits** — active bids and proposals in progress (multi-project CRUD table)
- **Active Preconstruction** — signed precon engagements with budget tracking (multi-project CRUD table)
- **Estimate Tracking Log** — historical FY record of all submitted estimates (append/edit, no delete)
- **Estimate Analytics** — dedicated recharts-powered analytics view with fiscal year comparison
- **Proposal Templates** — curated SharePoint link library for proposal deliverables
- **Project Setup Status** — real-time provisioning checklist display (bridges Phase 6 provisioning saga output)

---

## Prerequisites

- BW-0 complete — `packages/features/estimating/` scaffolded, `@hbc/features-estimating` alias wired in all vite configs ✅
- BW-3 complete — SPFx config/manifests exist for estimating webpart ✅
- Phase 5C complete — auth, shell, PersonaRegistry, DevToolbar ✅
- Phase 6 complete — `@hbc/provisioning`, SignalR hub, provisioning saga backend (**required for EST-2**)
- `@hbc/models` estimating domain exists with minimal stubs (will be expanded in EST-1)
- `@hbc/ui-kit` components available: `WorkspacePageShell`, `HbcDataTable`, `HbcStatusBadge`, `HbcButton`, `HbcCard`, `HbcModal`, `HbcTextField`, `HbcSelect`, `HbcPeoplePicker`, `HbcFormSection`, `HbcConfirmDialog`, `HbcToggle`

---

## Implementation Sequence

```
EST-1   → Foundation: models, routes, data layer            ← Start here
EST-2   → ProjectSetupPage (provisioning status + SignalR)  ← Requires Phase 6 complete
EST-3   → Estimating Home Dashboard
EST-4   → Active Pursuits (table + PursuitForm)
EST-5   → Active Preconstruction (table + PreconForm)
EST-6   → Estimate Tracking Log (table + EstimateLogForm)
EST-7   → Estimate Analytics (recharts charts)              ← Requires EST-6 backend endpoint
EST-8   → Proposal Templates
EST-9   → Cross-Module Integration + Admin Hook
EST-10  → Backend API Endpoints + SharePoint List Schemas
EST-11  → Testing (Vitest unit + Playwright E2E)
EST-12  → Documentation & ADR
```

EST-2 has a hard dependency on Phase 6 provisioning saga. EST-3 through EST-9 can proceed without Phase 6 but EST-2 must remain a placeholder until the `@hbc/provisioning` package is available.

---

## Task File Index

| File | Title | Priority | Status |
|---|---|---|---|
| `PH7-Estimating-1-Foundation.md` | Data Models, Routes, Data Layer | **CRITICAL** | ⬜ pending |
| `PH7-Estimating-2-ProjectSetupPage.md` | Provisioning Status + SignalR Checklist | HIGH | ⬜ pending |
| `PH7-Estimating-3-HomeDashboard.md` | Estimating Home Dashboard | HIGH | ⬜ pending |
| `PH7-Estimating-4-ActivePursuits.md` | Pursuits Table + PursuitForm | **CRITICAL** | ⬜ pending |
| `PH7-Estimating-5-ActivePreconstruction.md` | Precon Table + PreconForm | HIGH | ⬜ pending |
| `PH7-Estimating-6-EstimateTrackingLog.md` | Log Table + EstimateLogForm | HIGH | ⬜ pending |
| `PH7-Estimating-7-Analytics.md` | Analytics Page + Recharts Components | MEDIUM | ⬜ pending |
| `PH7-Estimating-8-Templates.md` | Proposal Templates Page | MEDIUM | ⬜ pending |
| `PH7-Estimating-9-CrossModule.md` | Cross-Module Contract + Admin Integration | HIGH | ⬜ pending |
| `PH7-Estimating-10-Backend-API.md` | API Endpoints + SharePoint List Schemas | **CRITICAL** | ⬜ pending |
| `PH7-Estimating-11-Testing.md` | Vitest Unit + Playwright E2E | MEDIUM | ⬜ pending |
| `PH7-Estimating-12-Documentation.md` | ADR-0075 + How-To Guide | LOW | ⬜ pending |

---

## Key File Locations

All feature pages and components go to `packages/features/estimating/src/` per the BW-0 locked decision.

```
packages/features/estimating/src/
├── index.ts                    ← barrel exports
├── data/
│   └── estimatingQueries.ts    ← data access functions (HTTP adapter pattern)
├── components/
│   ├── PursuitForm.tsx          ← create/edit form for IActivePursuit
│   ├── PreconForm.tsx           ← create/edit form for IActivePreconstruction
│   ├── EstimateLogForm.tsx      ← create/edit form for IEstimateLogEntry
│   ├── PursuitChecklistInline.tsx
│   └── ExternalPlatformLinks.tsx
├── EstimatingHomePage.tsx
├── ActivePursuitsPage.tsx
├── ActivePreconstructionPage.tsx
├── EstimateTrackingLogPage.tsx
├── EstimateAnalyticsPage.tsx
├── TemplatesPage.tsx
└── ProjectSetupPage.tsx

apps/estimating/src/
├── App.tsx                     ← provider stack only (no changes from scaffold)
├── bootstrap.ts                ← PersonaRegistry bootstrap (updated in BW-5)
├── main.tsx                    ← dual-mode entry point (no changes)
└── router/
    ├── index.ts                ← memory history router
    ├── root-route.tsx          ← SimplifiedShellConfig
    └── routes.ts               ← 7 routes, all importing from @hbc/features-estimating

packages/models/src/estimating/
├── EstimatingEnums.ts
├── IActivePursuit.ts
├── IActivePreconstruction.ts
├── IEstimateLogEntry.ts
├── ITemplateLink.ts
├── IEstimatingAnalytics.ts
├── IEstimating.ts              ← deprecated stubs retained for migration
└── index.ts
```

---

## RBAC Summary

| Feature | Minimum Permission | Notes |
|---|---|---|
| View all Estimating pages | `estimating:read` | Applied in `beforeLoad` on root route |
| Add/Edit/Delete pursuits | `estimating:write` | Toolbar buttons hidden for read-only users |
| Add/Edit precon records | `estimating:write` | |
| Add/Edit log entries | `estimating:write` | Log entries are never deleted |
| View analytics | `estimating:read` | Read-only page |
| View templates | `estimating:read` | Read-only page |
| Manage template links (Admin) | `admin:write` | Implemented in Admin module EST-9 cross-reference |
| View ProjectSetupPage | `provisioning:read` | Shows provisioning status |

---

## SharePoint Lists Used

| List Name | Purpose |
|---|---|
| `HBIntelActivePursuits` | Current Pursuits tracking table |
| `HBIntelActivePreconstruction` | Active Preconstruction tracking table |
| `HBIntelEstimateLog` | Estimate Tracking Log |
| `HBIntelTemplateLinks` | Proposal template link library (managed via Admin) |

Full schemas defined in `PH7-Estimating-10-Backend-API.md`.

---

## Cross-Module Contracts

**Estimating → Project Hub (outbound):**
- Pursuit row click navigates to `/project-hub/{projectNumber}/kickoff`
- Project Hub must implement this route (deferred to PH7-ProjectHub feature plan)

**Admin → Estimating (inbound):**
- Admin → System Settings → Template Library tab manages `ITemplateLink` records
- Templates page reads from `HBIntelTemplateLinks` list automatically
- Details in `PH7-Estimating-9-CrossModule.md`

---

## Definition of Done

- [ ] All 7 routes in `apps/estimating/src/router/routes.ts` import from `@hbc/features-estimating`
- [ ] All page components exist in `packages/features/estimating/src/`
- [ ] `packages/features/estimating/` builds without TypeScript errors
- [ ] `apps/estimating/` builds without TypeScript errors
- [ ] `PursuitForm`, `PreconForm`, `EstimateLogForm` components fully implemented
- [ ] `estimatingQueries.ts` implements all required data access functions
- [ ] Analytics page renders recharts charts (no stub placeholders)
- [ ] All pages have `estimating:read` permission guard applied
- [ ] All mutation operations guarded by `estimating:write`
- [ ] Vitest unit tests pass (80%+ coverage for covered files)
- [ ] Playwright E2E baseline spec passes for the Estimating tab
- [ ] ADR-0075 exists in `docs/architecture/adr/`
- [ ] How-to developer guide exists in `docs/how-to/developer/phase-7-estimating-guide.md`
- [ ] `pnpm turbo run build` passes 24/24 tasks

<!-- IMPLEMENTATION PROGRESS & NOTES
Master summary v2.0 created: 2026-03-08
Derived from: PH7-Estimating-Feature-Plan.md v1.0 (monolithic, retained as archive)
Rewritten as slim index. All code-level detail moved to PH7-Estimating-1 through PH7-Estimating-12.
Next: Create task files EST-1 through EST-12.
-->
