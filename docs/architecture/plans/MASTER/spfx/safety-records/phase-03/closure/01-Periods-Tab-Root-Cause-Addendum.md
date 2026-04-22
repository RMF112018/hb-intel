# Safety — Periods Tab Root-Cause Addendum (1.2.3.1)

Addendum to `00-Closure-Evidence.md`. Scope: the hosted Periods-tab failure
surfacing as "Failed to load reporting periods." while Upload continued to
work.

## Root cause

**UI-level collapse of two independent failure sources into one message, masking the real failing seam.** Evidence, from repo truth:

- `useReportingPeriods()` and `useProjectWeeks()` both bubble raw adapter errors through React Query (`packages/features/safety/src/hooks/queries.ts`).
- `ReportingPeriodDashboardPage` previously derived page state as `periodsQuery.isError || projectWeeksQuery.isError` and always rendered `errorMessage="Failed to load reporting periods."` (prior revision of that file, §stateprops).
- Upload uses only `useReportingPeriods()`, so *any* failure exclusive to `useProjectWeeks()` would reproduce the symptom: Upload looks fine, Periods hard-fails with a message blaming periods.
- The adapter layer (`SharePointSafetyInspectionRepository.fetchItems`) already throws with the real list title ("Fetch Safety Project Week Records failed (…)"), but the UI discarded that information.
- There is a second, latent cause that the same UI collapse was hiding: `resolveDescriptor()` throws a hard error when a list's GUID overlay is missing (zero-GUID fail-closed). A partial `window.__HB_SAFETY_LIST_GUIDS__` — one that supplies `SafetyReportingPeriods` but not `SafetyProjectWeekRecords` — reproduces the observed behavior exactly. Because the UI never exposed the list name, a partial overlay was indistinguishable from a permissions / list-not-found failure.

The most defensible, verifiable fix therefore has three parts:

1. **Stop lying** — the page state must distinguish which seam failed.
2. **Carry the real error** — the adapter must throw typed errors the UI can surface.
3. **Classify configuration gaps separately from runtime I/O** — so a missing overlay is visibly different from a 403/404 and reviewable in-page.

Note: `@testing-library/react` was hoisting via the workspace but is now a declared devDep on `apps/safety` to keep the new unit tests honest.

## Files changed

| File | Change | Why |
|---|---|---|
| `packages/features/safety/src/adapters/sharepoint/errors.ts` *(new)* | `SafetyAdapterFetchError` + `SafetyConfigurationError` typed errors with list name / site URL / endpoint / HTTP status / body snippet. `isSafetyAdapterFetchError`, `isSafetyConfigurationError` predicates. | Carry the real failure detail to callers. |
| `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts` | `fetchItems`, `fetchItem`, `postItem` now throw `SafetyAdapterFetchError` with endpoint + body snippet. | Make adapter errors inspectable. |
| `packages/features/safety/src/lists/descriptors.ts` | Zero-GUID fail-closed throw is now `SafetyConfigurationError(listName, message)`. | Distinguish configuration gap from runtime I/O. |
| `packages/features/safety/src/index.ts` | Export new error classes + predicates. | Consumer API surface. |
| `apps/safety/src/pages/periodsDashboardState.ts` *(new)* | Pure `derivePeriodsDashboardState(periodsQuery, projectWeeksQuery, count)` returning a discriminated union `loading \| fatal-periods \| fatal-both \| subordinate-project-weeks \| empty \| ready`. Preserves the real adapter message in `detail`. | Single place where "what actually failed" is decided; unit-testable. |
| `apps/safety/src/pages/ReportingPeriodDashboardPage.tsx` | Consumes the helper. Page-fatal only when periods itself (or both) failed. Subordinate-only failures render a scoped in-page `HbcBanner` with the real adapter message and a **Retry project-week records** button that re-fetches only that query. True empty state uses `HbcEmptyState`. | Stop the lie; honest, scoped retry UX. |
| `apps/safety/src/App.tsx` | Dev-only (`import.meta.env.DEV`) `console.warn/info` summarizing which overlay keys are present/missing. Production is silent. | Make overlay gaps visible to developers without prod noise. |
| `apps/safety/src/test/periodsDashboardState.test.ts` *(new)* | 7 branch tests: loading, fatal-periods, fatal-both, subordinate-project-weeks (explicitly asserts the message does NOT say "reporting periods"), empty, ready, non-Error detail handling. | Lock in the UX honesty. |
| `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.errors.test.ts` *(new)* | 4 tests: `SafetyAdapterFetchError` carries list name + 403; body snippet propagates; `SafetyConfigurationError` thrown on zero-GUID list; populated list with failing REST produces the fetch error, not the configuration error. | Lock in the error taxonomy. |
| `apps/safety/config/package-solution.json` | Solution + feature version 1.2.3.0 → 1.2.3.1. | Bugfix bump. |

## UX correction summary

| Failure shape | Before | After |
|---|---|---|
| Periods failed alone | Page-fatal: "Failed to load reporting periods." | Page-fatal: "Reporting periods failed to load. The dashboard cannot render without them." Retry refetches both. |
| Project-weeks failed alone (periods OK) | Page-fatal: "Failed to load reporting periods." ← **the lie** | In-page subordinate banner: "Project-week records failed to load for the selected reporting period." Real adapter detail surfaced (`Adapter reported: Fetch Safety Project Week Records failed (<status>)`). Period selector stays live. **Retry project-week records** button refetches only that query. |
| Both failed | Page-fatal (same message, same retry) | Page-fatal: "Reporting periods and project-week records both failed to load. Retry both to recover." Both retries wired. |
| No project-weeks (success) | No distinction from other states | True `HbcEmptyState`: "No project-week records for this reporting period." |

## Validation

### Unit + integration

```
Safety app (apps/safety):
 ✓ src/test/wpsState.test.ts              (9 tests)
 ✓ src/test/themePosture.test.ts          (11 tests)
 ✓ src/test/bootstrap.test.ts             (4 tests)
 ✓ src/test/periodsDashboardState.test.ts (7 tests)   ← new
 ✓ src/test/reviewActions.test.tsx        (6 tests)
 ✓ src/test/router.test.ts                (18 tests)
 Test Files  6 passed (6)
      Tests  55 passed (55)

Features-safety (packages/features/safety):
 ✓ SharePointSafetyInspectionRepository.errors.test.ts   (4 tests)   ← new
 ✓ SharePointSafetyInspectionRepository.filters.test.ts (4 tests)
 ✓ SharePointSafetyInspectionRepository.contract.test.ts (4 tests)
 ✓ descriptors.overlay.test.ts (6 tests)
 ✓ … (83 tests total)
 Test Files  19 passed (19)
      Tests  83 passed (83)
```

### Typecheck / Lint

Both packages: `tsc --noEmit` exit 0. `pnpm --filter @hbc/spfx-safety lint` exit 0 with zero warnings.

### Package rebuild

`npx tsx tools/build-spfx-package.ts --domain safety` (fresh — `apps/safety/dist` cleared).

| Assertion | Result |
|---|---|
| `dist/sppkg/hb-intel-safety.sppkg` produced | ✓ |
| `AppManifest.xml` → `Version="1.2.3.1"` | ✓ |
| Packaged `safety-app-*.js` contains `SafetyAdapterFetchError` identifier | ✓ (1 match) |
| Packaged bundle contains `project-weeks-subordinate-error` / `Retry project-week records` | ✓ (1 match) |
| Packaged bundle contains `Reporting periods failed to load` / `both failed to load` copy | ✓ (1 match) |
| `safety-shim-proof.json` written with `allRequiredAssetsPresent: true` | ✓ |

The freshness-evidence gate still reports not satisfied because safety does not carry `freshBuildRequired: true` in the orchestrator's domain registry (same exception register entry as 1.2.3.0; pre-existing tooling scope).

## Remaining risk

**If the true hosted failure is a missing `SafetyProjectWeekRecords` overlay entry, this remediation does not inject the GUID — it cannot, from code.** What it does do: the UI will now clearly say "Project-week records failed to load" with the adapter's `SafetyConfigurationError` message ("Safety list 'Safety Project Week Records' (…) is bound to the zero GUID. Populate the list GUID via `configureSafetyListGuids()` at tenant-provisioning time…"). That message names the specific gap and the specific fix. Closing the provisioning side (whoever owns the hosted `window.__HB_SAFETY_LIST_GUIDS__` population / tenant provisioning) is a separate, visible task that the UI now makes unambiguous.

If the hosted failure is HTTP (403 / 404 / 500) rather than configuration, the same page renders the typed `SafetyAdapterFetchError.message` in the subordinate banner ("Fetch Safety Project Week Records failed (<status>). Body: …"). Either way, the page never again lies about the failure being "reporting periods".
