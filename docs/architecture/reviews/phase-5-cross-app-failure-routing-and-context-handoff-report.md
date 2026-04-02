# Phase 5 — Cross-App Failure Routing and Context Handoff Report

> **Prompt:** P5-02 | **Date:** 2026-04-02 | **Type:** Implementation + documentation

## Executive Summary

This prompt hardens the cross-app failure routing contract between Accounting, Estimating, and Admin. Three code defects were fixed: a dead link in Estimating's "Open Admin Recovery" button, a spec-deviating `URLSearchParams` usage in the Admin page, and a multi-run disambiguation gap. Documentation was updated to reflect the corrected handoff contract.

The `crossAppUrls.ts` duplication across Accounting and Estimating was evaluated and retained as-is — the utility is 14 lines, architecturally scoped as an app-level concern per W0-G4-T07, and does not yet justify a shared package extraction.

---

## Changes Made

### 1. Fix Estimating Dead Link (P5-01 Issue 9 — High)

**File:** `apps/estimating/src/components/project-setup/RetrySection.tsx:88`

**Before:** `${adminUrl}/provisioning-oversight?projectId=${projectId}` — route does not exist in Admin app.

**After:** `${adminUrl}/provisioning-failures?projectId=${projectId}` — matches the canonical Admin route at `apps/admin/src/router/routes.ts:42`.

**Rationale:** The Admin app's provisioning route has always been `/provisioning-failures`. The navigation label "Provisioning Oversight" in the sidebar (`root-route.tsx:19`) likely caused the original confusion, but the route path is `/provisioning-failures`.

### 2. Replace URLSearchParams with useSearch() (P5-01 Issue 7 — Low)

**File:** `apps/admin/src/pages/ProvisioningOversightPage.tsx:175–183`

**Before:** Manual `new URLSearchParams(window.location.search)` parsing of `projectId`.

**After:** `useSearch({ from: '/provisioning-failures' })` using TanStack Router's validated search params.

**Rationale:** The route already defines `validateSearch()` to normalize `projectId` (lines 43–44 of `routes.ts`). Using `useSearch()` leverages this validation and aligns with the architectural pattern established in other apps (e.g., `apps/estimating/src/pages/NewRequestPage.tsx:52`).

### 3. Multi-Run Disambiguation (P5-01 Issue 8 — Low–Moderate)

**File:** `apps/admin/src/pages/ProvisioningOversightPage.tsx:180`

**Before:** `allRuns.find(r => r.projectId === projectId)` — selects the first array match for a given project, which may not be the latest run.

**After:** Filters all runs for the project, sorts by `startedAt` descending, and selects the first (latest) result.

**Rationale:** The durable provisioning model stores one entity per saga run (keyed by `projectId` + `correlationId`). Retries create new rows in the same partition with new `correlationId` values. When the Admin `listProvisioningRuns()` endpoint returns multiple historical runs for the same project, the latest run by `startedAt` is the operationally correct selection. This matches the backend's canonical read pattern documented in the durable-status-contract (`getProvisioningStatus(projectId)` returns the latest run by `startedAt`).

### 4. crossAppUrls.ts Duplication — Retained As-Is (P5-01 Issue 10 — Low)

**Files:** `apps/accounting/src/utils/crossAppUrls.ts`, `apps/estimating/src/utils/crossAppUrls.ts`

**Decision:** Keep the duplication. The utility is 14 lines, reads an app-specific Vite environment variable (`import.meta.env.VITE_ADMIN_APP_URL`), and is architecturally scoped as an app-level concern per W0-G4-T07 §3.2. No shared package currently owns cross-app URL construction. Extracting to `@hbc/provisioning` or a new package would require resolving the `import.meta.env` dependency at the package level, which adds complexity without proportional benefit for a single 14-line function.

**Risk:** If the URL construction logic changes, both apps must be updated. This is an acceptable risk given the stability of the pattern.

---

## Documentation Updates

### admin-recovery-boundary.md

Updated the Route section to document:
- Multi-run selection behavior (latest by `startedAt`)
- Query param reading via TanStack Router `useSearch()` instead of manual `URLSearchParams`

### coordinator-visibility-spec.md

Updated §7 (Out-of-Bounds Failure Routing) to specify the correct Admin route target (`/provisioning-failures?projectId={projectId}`).

---

## Verification Evidence

### Accounting Route-Out Behavior

**Verified:** No changes to Accounting route-out. The existing implementation at `ProjectReviewDetailPage.tsx:429` already uses the correct route (`/provisioning-failures?projectId=${request.projectId}`). Test at `ProjectReviewDetailPage.test.tsx:516–535` validates this URL.

### Admin Route-In Behavior

**Changed:** `ProvisioningOversightPage.tsx` now uses `useSearch({ from: '/provisioning-failures' })` to read the validated `projectId` from TanStack Router search params. This aligns with the route's `validateSearch()` at `routes.ts:43–44`.

### Multi-Run Correctness

**Changed:** When `?projectId=` matches multiple provisioning runs, the latest run by `startedAt` is now selected. This matches the backend's canonical latest-run read pattern.

### Context Preservation

**Verified:** The `projectId` query parameter is the sole context token passed in the handoff. This is sufficient because:
- Admin loads all provisioning runs from the backend
- The latest run for the project is auto-selected
- Admin displays full run detail (steps, timestamps, failure class, escalation markers) from the provisioning status entity
- No additional context (failure class, error message, etc.) needs to be embedded in the URL

### Operator Messaging

**Verified:**
- Accounting: "Site provisioning encountered an error. Route to Admin for resolution." (`stateDisplayHelpers.ts:21`) — correctly indicates ownership transfer.
- Estimating: "This failure requires Admin recovery." with failure-class description (`RetrySection.tsx:78–80`) — correctly indicates escalation.
- Admin: Recovery actions with appropriate labels and confirmation dialogs — correctly indicates admin ownership.

---

## Deferred Items

| Item | Reason | Target |
|------|--------|--------|
| Backend auth hardening on retry/escalate | Separate concern (authorization boundary, not routing) | P5-03 |
| Escalation lifecycle and reopen behavior | Separate concern (lifecycle integration, not routing) | P5-04 |
| state-machine.md terminal-state label | Documentation-only fix, not routing-related | P5-05 |

---

## Files Changed

| File | Change |
|------|--------|
| `apps/estimating/src/components/project-setup/RetrySection.tsx` | Fix dead link: `/provisioning-oversight` → `/provisioning-failures` |
| `apps/admin/src/pages/ProvisioningOversightPage.tsx` | Replace `URLSearchParams` with `useSearch()`, add multi-run `startedAt` sort |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Document multi-run selection and useSearch usage |
| `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` | Document correct Admin route target |
| `docs/architecture/reviews/phase-5-cross-app-failure-routing-and-context-handoff-report.md` | This report |
