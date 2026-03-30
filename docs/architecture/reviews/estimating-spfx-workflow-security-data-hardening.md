# Estimating SPFx Workflow Security & Data Hardening

> **Date**: 2026-03-29
> **Scope**: Authorization, validation, persistence, SP target alignment, Year field

---

## 1. Issues Addressed

| # | Issue | Status |
|---|-------|--------|
| 1 | Requester-scoped request listing | **Fixed** — non-privileged callers see only own requests |
| 2 | Role-gated state transitions | **Fixed** — controller/admin/submitter roles enforced |
| 3 | Backend validation parity | **Fixed** — projectLocation required, estimatedValue >= 0 |
| 4 | Clarification-loop completeness | **Fixed** — clarificationItems, clarificationRequestedAt persisted |
| 5 | Persistence/model drift | **Fixed** — retryCount, clarificationRequestedAt, Year now in toListItem/fromListItem |
| 6 | Audit-field correctness | **Fixed** — completedBy/completedAt only set on Completed state |
| 7 | SP target alignment (field_N names) | **Fixed** — repository uses confirmed field_N internal names |
| 8 | Year field integration | **Fixed** — derived from projectNumber, stored in SP `Year` column |

## 2. Solution Summary

### Authorization

- `resolveRequestRole()` resolves caller role (admin/controller/submitter/system) from UPN against ADMIN_UPNS, CONTROLLER_UPNS, and request.submittedBy
- `isAuthorizedTransition()` gates each transition by role
- GET list endpoint scopes non-privileged callers to their own requests
- New GET-by-id endpoint returns 403 for unauthorized callers

### Validation

- `validateSubmission()` enforces: projectName required, projectLocation required, groupMembers non-empty, estimatedValue >= 0, projectStage enum
- Matches wizard step validation rules

### Clarification Loop

- NeedsClarification transition stores: clarificationNote, clarificationRequestedAt, clarificationItems (structured)
- Resubmit (NeedsClarification → UnderReview) allows updated clarificationNote

### Persistence

- `toListItem()`/`fromListItem()` now use confirmed field_N SP internal names
- Year, retryCount, clarificationRequestedAt written and read correctly

### Audit Semantics

- `completedBy`/`completedAt` only set when `newState === 'Completed'` (not on Provisioning)

## 3. Changed Files

| File | Change |
|------|--------|
| `packages/models/src/provisioning/IProvisioning.ts` | Added `year?: number` to `IProjectSetupRequest` |
| `backend/functions/src/state-machine.ts` | Added `resolveRequestRole`, `isAuthorizedTransition`, `deriveProjectYear` |
| `backend/functions/src/functions/projectRequests/index.ts` | Requester-scoped listing, role-gated transitions, validation parity, GET-by-id, Year derivation, audit fix |
| `backend/functions/src/services/project-requests-repository.ts` | field_N internal names in toListItem/fromListItem/select/filter, Year column |
| `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts` | Added role auth tests (C1-C10), Year derivation tests (E1-E6), persistence tests (D10-D12) |

## 4. SharePoint Target Alignment

| Property | Expected | Implementation |
|----------|----------|---------------|
| Site URL | `https://<sharepoint-site-url>` | `SHAREPOINT_PROJECTS_SITE_URL` env var → `spfi(siteUrl)` |
| List title | `Projects` | `PROJECTS_LIST_NAME = 'Projects'` |
| Field names | `field_1`..`field_24`, `Title`, `Year` | Confirmed from SP schema; all select/filter/write use field_N |

## 5. Year Field Integration

| Aspect | Detail |
|--------|--------|
| SP internal name | `Year` (confirmed — added post-import, not a field_N) |
| SP type | Number |
| Model property | `year?: number` on `IProjectSetupRequest` |
| Data-source rule | Derived from projectNumber prefix: `##-###-## → 2000 + ##`. Falls back to current year if no project number. |
| When populated | On submit (from projectNumber or current year); on ReadyToProvision (re-derived from assigned projectNumber) |
| Explicit override | Wizard can pass `year` directly in submission body |
| Compatibility | Used by project-sites webpart `SP_PROJECTS_FIELDS.YEAR = 'Year'` for year filter |

### Migration / Backfill

Existing rows in the Projects list that lack a Year value will return `year: undefined`. The project-sites webpart already handles this gracefully (items without Year are excluded from year-filtered views). To backfill: run a one-time script that reads each item's field_2 (ProjectNumber) and derives Year using the `##-###-##` prefix rule.

## 6. Deferred Items

| Item | Reason |
|------|--------|
| Clarification enforcement (items must be addressed before resubmit) | Requires UI changes to mark items as responded |
| Integration tests with real SP service | Requires staging environment |
| E2E wizard → backend round-trip tests | Requires Playwright / staging |
| Frontend `listMyRequests` client update | Frontend currently uses `listRequests`; should switch to scoped endpoint |

## 7. Manual Validation Notes

- Deploy to staging and verify:
  - Submit a project setup request → confirm field_N fields populated in SP list
  - Advance state as controller → confirm role check passes
  - Attempt state advance as submitter on non-NeedsClarification → confirm 403
  - Verify Year column populated correctly in SP list view
  - Verify project-sites webpart can filter by Year on the same list
