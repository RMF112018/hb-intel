# 05a — Source-Level Hardening Note

Closes phase-16a Gap 4 by adding direct Vitest coverage for the
highest-risk source seams. These tests run in < 2 seconds and pass
**48 / 48** on first invocation — far faster and more diagnostic than
any equivalent E2E path.

## Specs added

All under `apps/hb-webparts/src/homepage/__tests__/`:

| Spec | Target | Cases |
|---|---|---|
| `applyCompanionFilter.test.ts` | `applyCompanionFilter` in `HbKudosCompanion.tsx` | 16 |
| `kudosProminenceRules.test.ts` | `validatePinAction`, `validateFeatureAction`, `handleScheduledProminenceCollision`, `validateReassignmentAuthority` | 14 |
| `kudosRoleResolver.test.ts` | `resolveKudosRole` + `clearKudosRoleCache` | 10 |
| `fetchKudosAuditTimeline.test.ts` | `fetchKudosAuditTimeline` in `kudosGovernanceWriter.ts` | 5 |
| `cacheInvalidationObservability.test.ts` | `invalidatePeopleCultureCache` + `usePeopleCultureData` shape | 3 |

## What each spec catches

### applyCompanionFilter
- Tab → workflow-status scoping across `pending`, `revisionRequested`,
  `approved`, `rejected + withdrawn`, `removed`.
- Unknown `tabId` returns `[]` (no silent all-pass regression).
- `adminReviewOnly` and `scheduledOnly` toggles gate independently.
- Ownership variants (`all`, `mine`, `unassigned`, `others`) respect
  both `claimOwnerId` and `assignedOwnerId`.
- Aging bucket filter narrows correctly.
- Search matches across headline, excerpt, submitter, recipient
  names.
- Review queues sort oldest-first; resolved queues sort newest-first
  (Decision-Lock §sortDirection).
- Filter interaction (admin-review-only + ownership=mine) compounds
  correctly.

### kudosProminenceRules
- Featured requires an expiration date (both missing and
  whitespace-only variants rejected).
- Featured / pinned slot caps enforced at `FEATURED_MAX=1` and
  `PINNED_MAX=3`.
- `handleScheduledProminenceCollision` returns `{ok, demoteToStandard,
  flagForAdminReview, adminNotificationReason}` for both featured and
  pinned collisions.
- No collision → pass-through without demotion.
- Reassignment authority: viewers always blocked; reviewers blocked
  on flagged items only; admins always allowed.

### kudosRoleResolver
- `IsSiteAdmin` → admin (resolution order #1).
- `HB Kudos Admins` group membership → admin.
- `HB Kudos Reviewers` group membership → reviewer.
- No canonical group → viewer (fail-closed).
- Non-ok REST → viewer (fail-closed).
- Network throw → viewer (fail-closed).
- `siteUrl: undefined` + `simulatedRole: 'reviewer'` → reviewer
  (dev-only fallback).
- Malformed `simulatedRole` → viewer.
- Malformed Groups entries (missing Title, wrong key) are ignored.
- Cache honored for same `site+email` pair (second resolution skips
  the REST call).
- `clearKudosRoleCache` forces a fresh resolve.

### fetchKudosAuditTimeline
- Blank `kudosId` short-circuits to `[]` without network.
- Row mapping preserves `actorDisplayName`, trims notes, ascending
  sort by `eventAt`.
- Malformed rows (missing `EventType` or `EventAt`) are silently
  dropped.
- Non-ok REST → `[]` (failure fallback).
- `kudosId` defaults to query input when the raw row omits it.

### cacheInvalidationObservability
- `invalidatePeopleCultureCache()` is idempotent-safe and does not
  throw.
- `usePeopleCultureData()` returns `{listConfig: undefined,
  isLoading: false, refresh: fn}` when no `siteUrl` is available —
  proving the hook is observable at the shape level without needing
  a live SharePoint transport.
- `refresh()` invokes the invalidator without throwing.

## Regressions caught faster than the E2E lane

These classes fail in the source suite in < 2s, versus multi-minute
E2E failures that are also harder to diagnose:

- **Sort-direction flip on review queues** — a visual regression in
  E2E requires a multi-row seed and a DOM order assertion. The source
  test catches it with a single `toEqual(['stale', 'week', 'fresh'])`.
- **Ownership filter drift** — `mine` accidentally matching
  unassigned rows, or vice versa.
- **Prominence-cap drift** — bumping `PINNED_MAX` without updating
  denial copy.
- **Role fail-closed regression** — any new code path that returns a
  non-viewer role on REST failure.
- **Audit-row malformed drop** — a SharePoint schema drift that
  removes `EventType` or `EventAt` from the raw shape.
- **Cache-invalidation signature drift** — function rename or arg
  change would be caught at compile time, but the cache-probe
  contract (which the dev-harness couples to) is also proven.

## Scope discipline

- No new helper extractions were required for testability — every
  target was already exported at a testable boundary.
- Mocks are narrow: only `fetch` for the two REST-dependent tests,
  and `spContext` for the cache observability test.
- No snapshot tests, no empty smoke tests.
- Where a browser case already proves behavior (e.g. the public
  feed celebrate increment in `kudos.public.celebrate`), this
  source suite intentionally does not duplicate.

## Verification

- `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/homepage/__tests__/applyCompanionFilter.test.ts src/homepage/__tests__/kudosProminenceRules.test.ts src/homepage/__tests__/kudosRoleResolver.test.ts src/homepage/__tests__/fetchKudosAuditTimeline.test.ts src/homepage/__tests__/cacheInvalidationObservability.test.ts` → **48 / 48 passing**.
- Pre-existing Kudos Vitest suite (58 cases) still passing, so total
  Kudos-owned Vitest coverage is now **106 / 106**.
