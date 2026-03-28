# Final Monday Verification and Evidence Package

**Date:** 2026-03-28
**Scope:** Provisioning saga + SPFx Estimating/Accounting/Admin surfaces
**Verification pass:** Post-Prompts 02-04

---

## 1. Final Deficiency Closure Table

| ID | Validated in P01 | Fixed | Test Coverage | Status | Notes |
|----|-----------------|-------|---------------|--------|-------|
| **F1+F6** | Yes — 8 form fields silently dropped by submit handler + repository | **Yes** (P02) — handler persists all fields, repository `toListItem`/`fromListItem`/`select()` updated | **Yes** (P04) — 10 regression tests (D1-D10) in `request-lifecycle.test.ts` prove individual field round-trip and combined saga handoff | **CLOSED** | `department` critical for Step 6 viewers; all 8 fields now survive submit→read→saga handoff |
| **F5** | Yes — 2 accounting tests failing (approve without project number) | **Yes** (P02) — tests G4-T03-006 and G4-T03-013 now enter `25-001-01` before clicking Approve | **Yes** (P02+P04) — original tests fixed + D-REGR-F5 regression test proves button disabled/enabled behavior | **CLOSED** | Component code was always correct; tests were stale |
| **F2a** | Partially — backend list has no requester scoping | **Deferred** | N/A | **DEFERRED** | No Monday SPFx surface requires server-side requester filtering. Estimating uses requestId lookup; Accounting sees all (correct for reviewer); Admin uses provisioning runs. |
| **F2b** | Yes — repository has no submittedBy filter | **Deferred** | N/A | **DEFERRED** | Same rationale as F2a. PWA "My Requests" is out of Monday scope. |
| **F3** | Yes — Step 6 Entra group compensation not implemented | **Deferred** — acceptable design choice | Existing compensation chain tests cover steps 7→4→3→2→1 | **ACCEPTED** | Documented as intentional (`step6-permissions.ts:110-114`). Orphaned groups are inert. |
| **F4** | Not validated — Step 5/timer continuity is correct | N/A | Existing saga + timer tests cover deferral + completion + failure | **NO DEFICIENCY** | Implementation verified correct in P01 audit |
| **CSS** | Pre-existing — estimating complexity test used static CSS class | **Yes** (P03) — replaced with `getByRole('button', { name: /essential/i })` | Self-verifying (test now passes) | **CLOSED** | Aligned with official `@hbc/complexity` test patterns |

---

## 2. Monday Readiness Verdict

### **Ready for Monday with known low-risk limitations**

**Rationale:**
- All validated Monday-critical deficiencies (F1+F6, F5) are **closed with protective test coverage**
- All four test suites pass with **zero failures**: backend 413, estimating 55, accounting 26, admin 59 = **553 tests passing**
- Backend typecheck clean, lint clean (0 errors, 53 pre-existing warnings)
- Saga orchestrator, compensation chain, Step 5 deferral, timer retry, and request reconciliation all covered by existing tests that continue to pass
- The three deferred items (F2a, F2b, F3) do not affect the Monday-critical SPFx delivery path

**Known low-risk limitations:**
- Requester scoping is global (all users see all requests via list endpoint) — acceptable for Monday SPFx surfaces but should be addressed for PWA
- Step 6 Entra group compensation is intentionally not implemented — orphaned groups are inert
- SharePoint Projects list must have the new columns (`Department`, `GroupLeadersJson`, `EstimatedValue`, `ClientName`, `StartDate`, `ContractType`, `ProjectLeadId`, `ViewerUPNsJson`, `AddOnsJson`) before field persistence works in staging — this is a deployment prerequisite, not a code gap

---

## 3. Evidence Summary

### Files Changed Across Remediation (Prompts 02-04)

| File | Prompt | Change |
|------|--------|--------|
| `backend/functions/src/functions/projectRequests/index.ts` | P02 | Persist 8 additional form fields in submit handler |
| `backend/functions/src/services/project-requests-repository.ts` | P02 | `toListItem` +9 columns, `fromListItem` +9 fields, `select()` +9 columns, rename `safeParseGroupMembers`→`safeParseJsonArray` |
| `backend/functions/package.json` | P02-P04 | Version 0.0.52→0.0.57 |
| `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` | P02+P04 | Fix G4-T03-006/013 + add D-REGR-F5 regression |
| `apps/accounting/package.json` | P02+P04 | Version 0.0.3→0.0.5 |
| `apps/estimating/src/test/complexity.test.tsx` | P03 | Replace CSS class query with role-based button query |
| `apps/estimating/package.json` | P03 | Version 0.0.2→0.0.3 |
| `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts` | P04 | **NEW** — 31 tests (user-command, state-transition, regression) |
| `backend/functions/vitest.config.ts` | P04 | Add `projectRequests/**/*.test.ts` to unit project include |

### Test Files Changed

| File | Tests | Status |
|------|-------|--------|
| `request-lifecycle.test.ts` (NEW) | 31 | All passing |
| `ProjectReviewDetailPage.test.tsx` | 12 → 13 (1 added) | All passing |
| `complexity.test.tsx` | 5 (1 fixed) | All passing |
| `saga-orchestrator.test.ts` | 8 (fixed in earlier maintenance) | All passing |
| `steps.test.ts` | 9 (fixed in earlier maintenance) | All passing |

### Commands Run

```
cd backend/functions && pnpm test          → 413 passed, 3 skipped (Azurite-gated)
cd backend/functions && pnpm check-types   → Clean (0 errors)
cd backend/functions && pnpm lint          → 0 errors, 53 pre-existing warnings
cd apps/estimating && pnpm test            → 55 passed, 2 todo
cd apps/accounting && pnpm test            → 26 passed
cd apps/admin && pnpm test                 → 59 passed
```

### Failing or Skipped Scenarios

| Scenario | Reason | Risk |
|----------|--------|------|
| 3 backend tests skipped | Azurite-gated integration tests (`AZURITE_TEST=true`) | None — by design |
| 2 estimating tests `.todo()` | Placeholder for future completion flow tests | None — not regression |

---

## 4. Residual-Risk Register

| Risk | Severity | Monday Impact | Notes |
|------|----------|---------------|-------|
| SharePoint Projects list missing new columns | **Medium** | Deployment blocker if columns don't exist | 9 new columns must be created on the SP list before field persistence works in staging. Code handles gracefully (empty/null) but data won't round-trip. |
| Requester scoping returns all requests | **Low** | No Monday SPFx impact | Estimating detail uses requestId; Accounting/Admin should see all. Affects PWA "My Requests" post-Monday. |
| Entra group orphaning on saga failure | **Low** | No operational impact | Orphaned groups are inert security groups with no site permissions. Manual cleanup documented. |
| Workspace `turbo run check-types` blocked by `@hbc/ui-kit ↔ @hbc/complexity` cycle | **Low** | No Monday impact | Pre-existing issue. Package-local `pnpm check-types` works cleanly. |

---

## 5. Recommended Next Actions

### Must Do Before Monday

1. **Confirm SharePoint Projects list columns** — verify the 9 new columns exist in the staging SharePoint Projects list, or create them. Without them, field persistence works in code but not in staging.
2. **Deploy `@hbc/functions` v0.0.57** — latest backend with all persistence + saga fixes.
3. **Confirm IT prerequisites** — `GRAPH_GROUP_PERMISSION_CONFIRMED=true` and all env vars from `wave0-env-registry.ts`.

### Can Wait Until After Monday

1. **Requester scoping** (F2a/F2b) — add `submittedBy` filter to repository `listRequests` and expose via API parameter for PWA "My Requests".
2. **Step 6 Entra group compensation** (F3) — implement `compensateStep6` for group cleanup on saga failure.
3. **Resolve `ui-kit ↔ complexity` cyclic dependency** — frontend workspace concern, not saga-related.
4. **Azurite integration test enablement** — run the 3 skipped table-storage tests in CI when Azurite is available.
