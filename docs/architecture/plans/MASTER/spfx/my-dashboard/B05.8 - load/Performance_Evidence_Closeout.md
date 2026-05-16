# B05.8 — Performance Evidence Closeout

> Derived from `supporting/Performance_Evidence_Closeout_Template.md`. Closeout for the My Dashboard Load-Time Remediation Package (Prompts 01–04 implemented, Prompt 05 documents the evidence state at HEAD).

Status legend:

- ✅ Verified in repo truth (code/test review + automated suites).
- ⏳ Pending — requires live capture (browser HAR / Application Insights KQL) after deployment.
- ❌ Failing / regressed.
- ⚠️ Parallel-work blocker — not a B05.8 regression but blocks a downstream gate.

---

# 1. Deployment / Branch Context

- **Branch:** `main`
- **Commits (Prompt 01–04, in landing order on `main`):**
  - `a02b838cf` — `feat(my-dashboard): HB Intel My Dashboard 1.0.0.020 — B05.8 Prompt 01 render both primary cards during load and error`
  - `ad85d04ed` — `feat(my-dashboard): HB Intel My Dashboard 1.0.0.021 — B05.8 Prompt 02 unify My Projects read-model client ownership`
  - `35dc5f5c9` — `feat(my-dashboard): HB Intel My Dashboard 1.0.0.022 — B05.8 Prompt 03 frontend load performance marks`
  - `12efbae0f` — `feat(adobe-sign): add transient action-handoff policy and resolver telemetry` (parallel-author commit that landed the Prompt 04 production stage-duration instrumentation alongside unrelated B05.9 action-handoff work)
  - `3a8005cbf` — `test(functions/my-work-read-model): B05.8 Prompt 04 — project-links stage-duration event coverage`
- **Deployment target:** none yet. SPFx package not built/uploaded as part of this closeout (no Prompt-05 manifest bump). Live capture sections below are PENDING the next hosted deploy.
- **Date/time:** Closeout authored 2026-05-16 (UTC).
- **Reviewer:** PENDING.

---

# 2. UX Validation Summary

## Primary composition (✅ all yes from repo-truth review)

| Acceptance row                                                    | Result                                               | Evidence                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell rendered immediately                                        | ✅ yes                                               | `MyWorkShell.tsx` mount-effect emits `my-dashboard:shell:mounted` once on first render.                                                                                                                                                                             |
| My Projects visible during home loading                           | ✅ yes                                               | `MyWorkHomeSurface.tsx` `loading` branch renders `myProjectsCard` alongside `adobeCard` in order `[my-projects-home, adobe-sign-action-queue]`.                                                                                                                     |
| Adobe visible during home loading                                 | ✅ yes                                               | Same branch as above — Adobe card mounts with `data-adobe-sign-action-queue-state="loading"` driven by `resolveStateMarker(readinessVariant === 'loading')`.                                                                                                        |
| My Projects card-local loading state visible                      | ✅ yes                                               | `MyProjectsHomeCard.tsx` `data-my-projects-compact-state="loading"` compact block; locked by `MyProjectsHomeCard.test.tsx` "shows compact loading block…".                                                                                                          |
| Adobe card-local loading state visible                            | ✅ yes                                               | `AdobeSignActionQueueCard.tsx` `resolveStateMarker` returns `'loading'` when readiness variant is loading.                                                                                                                                                          |
| My Projects starts independent read path early                    | ✅ yes                                               | `MyProjectsHomeCard.tsx` `useEffect → client.getMyProjectLinks()` runs on mount with the provider-supplied client (Prompt 02). Spy-asserted in `MyWorkSurfaceRouter.test.tsx`: `expect(stub.getMyProjectLinks).toHaveBeenCalled()` inside the unresolved-home test. |
| Loading variant card-roles order                                  | ✅ `['my-projects-home', 'adobe-sign-action-queue']` | `MyWorkHomeSurface.test.tsx` loading-variant `getCardRoles → ['my-projects-home', 'adobe-sign-action-queue']`.                                                                                                                                                      |
| Error variant card-roles order                                    | ✅ `['my-projects-home', 'adobe-sign-action-queue']` | `MyWorkHomeSurface.test.tsx` error-variant assertion of same shape with Adobe `data-adobe-sign-action-queue-state="backend-unavailable"`.                                                                                                                           |
| No false ready flash                                              | ✅ yes                                               | `MyWorkSurfaceRouter.test.tsx` unresolved-home test asserts `[data-my-work-source-status]` is null.                                                                                                                                                                 |
| Recent completions request still waits for user interaction       | ✅ yes                                               | `AdobeSignActionQueueCard.tsx:179-181` calls `useAdobeSignRecentCompletionsReadModel({ enabled: effectiveActiveView === 'completed' })`; hook (`useAdobeSignRecentCompletionsReadModel.ts:46`) early-returns when `!enabled`.                                       |
| Client ownership unified (My Projects uses shared context client) | ✅ yes                                               | `MyProjectsHomeCard.tsx:91` `const client = useMyWorkReadModelClient();`. Local factory call retired in Prompt 02.                                                                                                                                                  |
| `getApiToken` removed from surface/router path                    | ✅ yes                                               | Source review + frontend `check-types` clean across `MyWorkHomeSurfaceProps`, `MyWorkSurfaceRouterProps`, `MyProjectsHomeCardProps`. (`MyWorkShell` still uses `getApiToken` for the unrelated OAuth-start callback — out of scope.)                                |
| No copy regression                                                | ✅ yes                                               | `MyWorkHomeSurface.test.tsx` "never renders developer-facing strings (TODO / mock / placeholder / fake)" still green.                                                                                                                                               |

## Live UX capture

- ⏳ HAR Run A (fresh page load) — see §3 and §10.
- ⏳ HAR Run B (Adobe completed toggle) — see §3 and §10.
- ⏳ HAR Run C (warm refresh) — see §3 and §10.

---

# 3. Browser Waterfall Summary

All runtime fields ⏳ PENDING the next hosted deploy. Procedure (excerpted from `supporting/HAR_Capture_And_Browser_Waterfall_Checklist.md`):

> Chrome/Edge incognito, DevTools Network panel with **Preserve log** + **Disable cache** on. Reload the dashboard page, wait until BOTH cards reach a non-loading state, then File → Export HAR. Repeat for Run B (click the Adobe completed/history toggle, confirm exactly one deferred recent-completions request fires) and Run C (immediate reload to compare cold vs warm).

| Measurement                  |                                                                                 Value |
| ---------------------------- | ------------------------------------------------------------------------------------: |
| Time to shell visible        |                                                                                    ⏳ |
| Time to My Projects useful   |                                                                                    ⏳ |
| Time to Adobe useful         |                                                                                    ⏳ |
| `/home` start → end          |                                                                                    ⏳ |
| `/project-links` start → end |                                                                                    ⏳ |
| Requests overlap?            | ⏳ (architecturally yes — repo truth proves both cards mount before `/home` resolves) |
| Recent completions deferred? |      ⏳ (architecturally yes — `enabled: effectiveActiveView === 'completed'` gating) |

HAR path/reference: ⏳ PENDING — convention to be established on first capture. Suggest `docs/architecture/evidence/b05-8-my-dashboard-load/HAR/run-a-fresh.har` (no evidence directory exists yet for this package; the next reviewer should create it).

---

# 4. Frontend User Timing Marks Observed

| Mark                                                                              | Repo truth                                                                                                                                                         | Live timeline                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `my-dashboard:shell:mounted`                                                      | ✅ `MyWorkShell.tsx` mount effect emits once on first render.                                                                                                      | ⏳ DevTools Performance recording. |
| `my-dashboard:request:home:start` / `:end` / `:duration`                          | ✅ `myWorkBackendReadModelClient.ts:callBackend` try/finally wraps every read-model GET; `routeId === 'home'` resolves to the spec-stable mark strings.            | ⏳                                 |
| `my-dashboard:request:project-links:start` / `:end` / `:duration`                 | ✅ Same `callBackend` seam, `routeId === 'project-links'`.                                                                                                         | ⏳                                 |
| `my-dashboard:request:adobe-sign-recent-completions:start` / `:end` / `:duration` | ✅ Same `callBackend` seam, `routeId === 'adobe-sign-recent-completions'`; only fires after user toggles to the completed view (deferred-fetch posture preserved). | ⏳                                 |
| `my-dashboard:module:my-projects:useful`                                          | ✅ `MyProjectsHomeCard.tsx` once-per-mount `useEffect` keyed on `isLoading` transition + `usefulEmittedRef`.                                                       | ⏳                                 |
| `my-dashboard:module:adobe-sign-action-queue:useful`                              | ✅ `AdobeSignActionQueueCard.tsx` once-per-mount `useEffect` keyed on `stateMarker !== 'loading'` + `usefulEmittedRef`; reuses existing `MODULE_ID` constant.      | ⏳                                 |

Helper contract (`apps/my-dashboard/src/runtime/myWorkPerformanceMarks.ts`) is independently locked by `myWorkPerformanceMarks.test.ts`: no-op when `globalThis.performance` is absent, swallows throws from `performance.mark` / `performance.measure`, MY_WORK_MARK string-stable, end-to-end emission resolves a real entry on the timeline. No PII or payload value is passed to any `detail` field in this prompt's call-site set (all marks are name-only).

---

# 5. Backend Telemetry Summary

All runtime values ⏳ PENDING live capture (KQL queries in §10). Repo-truth instrumentation:

## `/home` (Adobe Sign action-queue path)

| Field                             | Repo truth                                                                                                                                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Handler duration (existing)       | ✅ `withTelemetry` `handler.success` event (pre-B05.8).                                                                                                                                                                           |
| Auth duration (existing)          | ✅ `auth.bearer.success` event (pre-B05.8).                                                                                                                                                                                       |
| Principal resolution `durationMs` | ✅ `adobe-sign-principal-resolver.ts` — `const start = Date.now();` at closure top, `trackResult(...)` default-arg attaches `durationMs: Date.now() - start` to `adobeSign.read.principalResolution.result`.                      |
| Token acquisition `durationMs`    | ✅ `adobe-sign-token-service.ts` — `tokenStart = Date.now()` + `trackTokenResult` default-arg → `adobeSign.read.tokenAcquisition.result`.                                                                                         |
| Refresh `durationMs`              | ✅ `adobe-sign-token-service.ts` — `refreshStart` captured immediately before `deps.refreshClient.refresh(...)`; `trackRefreshResult` default-arg → `adobeSign.read.refresh.result`.                                              |
| Adobe search `durationMs`         | ✅ `adobe-sign-action-queue-adapter.ts` — `searchStart = Date.now()` immediately before `deps.searchClient.search(...)`; appended to all 3 `adobeSign.read.search.result` emission sites (`unauthorized` / `unreachable` / `ok`). |
| Adapter overall `durationMs`      | ✅ `adobe-sign-action-queue-adapter.ts` — `actionQueueStart = Date.now()` at adapter body top; `trackActionQueueResult(...)` default-arg → `adobeSign.read.actionQueue.result`.                                                   |

## `/project-links`

| Field                                        | Repo truth                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Handler duration (existing)                  | ✅ `handler.success` event.                                                                                                                                                                                                                                                                                                                        |
| Auth duration (existing)                     | ✅ `auth.bearer.success` event.                                                                                                                                                                                                                                                                                                                    |
| `myProjectLinks.read.sources.result` event   | ✅ `my-project-links-read-model-provider.ts` — per-loader `.finally(...)` timing wrapped around `Promise.all([loadProjectsRows, loadRegistryRows])`; event emitted after settle with `projectsDurationMs`, `registryDurationMs`, `projectsStatus`, `registryStatus`, `projectsRowCount`, `registryRowCount`, `projectsBounded`, `registryBounded`. |
| `myProjectLinks.read.reconcile.result` event | ✅ Same file — `reconcileStart = Date.now()` immediately before `reconcileProjectLinks(...)`; event includes `durationMs`, `matchedItemCount`, `sourceStatus`, plus the 4 safe summary counts (`assignedProjectCount`, `dualLaunchReadyCount`, `sharePointReadyCount`, `procoreReadyCount`).                                                       |
| Principal-unresolved early-return path       | ✅ Neither new event is emitted (work was not performed). Locked by `my-project-links-read-model-provider.test.ts` "does NOT emit sources.result or reconcile.result on the principal-unresolved early-return branch".                                                                                                                             |
| Privacy guard                                | ✅ `my-project-links-read-model-provider.test.ts` privacy test: with an actor UPN, displayName, OID, project name, and SharePoint URL in the fixture, JSON-stringified event payload contains none of those substrings, no SharePoint host, and no `https://` prefix.                                                                              |

---

# 6. Interpretation

**Primary latency owner:** UNDETERMINED at closeout time — live capture pending.

The package's rubric (`04_Observability_And_Telemetry_Plan.md` Part 7) determines this from the captured HAR + KQL pivots. Until §3 and §5 runtime values land, no conclusion can be drawn beyond "the avoidable frontend sequencing defect has been removed; the architecture now permits the two requests to overlap."

---

# 7. Follow-On Recommendation

DEFERRED pending §3 + §5 capture. Decision matrix (from `04_Observability_And_Telemetry_Plan.md` Part 7) for the next reviewer to fill in once data lands:

- If **Adobe search duration dominates** `/home` overall handler time → Adobe upstream/read-model optimization package.
- If **Project Links source loaders or reconcile duration dominate** `/project-links` overall handler time → Project Links backend optimization package (list-query narrowing, preprojected assignments, server-side short-TTL caching).
- If **backend stage durations are low but total network duration is high** in HAR Run A vs Run C (cold vs warm) → Function host / cold-start investigation.
- If after Prompt 01 the two requests **overlap and the page improves materially** → no major follow-on needed for B05.8; close the loop and re-prioritize.

---

# 8. Validation Commands Completed

Re-run at HEAD `3a8005cbf` for this closeout (2026-05-16):

```
pnpm --filter @hbc/spfx-my-dashboard test
  → 33 test files passed, 507 tests passed, 0 failed   ✅

pnpm --filter @hbc/spfx-my-dashboard check-types
  → ❌ 2 errors — apps/my-dashboard/src/state/myWorkCardViewModel.ts:205 and :357
    "Property 'actionHandoff' does not exist on type 'MyWorkAdobeSignActionQueueItem'."
    ⚠️ B05.9 parallel work — NOT a B05.8 regression. See §11.

pnpm --filter @hbc/functions test
  → 182 test files passed, 2956 tests passed, 3 skipped, 0 failed   ✅

pnpm --filter @hbc/functions check-types
  → ❌ 4 errors — all in hosts/my-work-read-model files:
    adobe-sign-action-link-routes.ts:9 / :10 — missing model exports
      'ResolveAdobeSignActionLinkRequest' / 'AdobeSignActionLinkResolveResult'.
    adobe-sign-action-queue-adapter.ts:149 / :528 — 'actionHandoff' property
      reference against a model that does not expose the field.
    ⚠️ All four errors trace to B05.9 a-s-extend parallel work — NOT B05.8 regressions. See §11.
```

Vitest baselines (zero failures across both suites) confirm Prompts 01–04 are functionally complete. The check-types failures are cross-traffic from a partially-landed parallel package (B05.9), surfaced here so they are not absorbed into closeout silence.

---

# 9. Commit / PR Summary

- **Commits (this package):**
  - `a02b838cf` — Prompt 01 render both primary cards during load and error
  - `ad85d04ed` — Prompt 02 unify My Projects read-model client ownership
  - `35dc5f5c9` — Prompt 03 frontend load performance marks
  - `12efbae0f` — Prompt 04 production stage-duration instrumentation (parallel-author commit; landed alongside unrelated B05.9 action-handoff)
  - `3a8005cbf` — Prompt 04 project-links stage-duration test coverage
  - _(this commit)_ Prompt 05 — `docs(my-dashboard): close load-time remediation evidence pass`
- **PR:** not opened; closeout commits land directly on `main` per repo convention (no PR cadence enforced for docs commits in this branch).
- **Notes:** B05.8 acceptance matrix (§A of `03_Validation_Matrix_And_Acceptance_Criteria.md`) is satisfied for every row by repo-truth review + the vitest suites; live UX/telemetry capture (HAR Runs A/B/C + KQL queries 1–8) is the next reviewer's responsibility before Prompt 06 Go/No-Go.

---

# 10. Evidence Still Needed (Capture Checklist)

Captures the next reviewer must paste back into this doc (§3, §4 right column, §5 right column, §6, §7) before Prompt 06 can be safely scoped.

## HAR captures

Procedure verbatim from `supporting/HAR_Capture_And_Browser_Waterfall_Checklist.md`:

- **Run A — Fresh Page Load.** Chrome/Edge incognito, DevTools Network panel, Preserve log + Disable cache. Open My Dashboard, clear network entries, reload, wait until both cards reach non-loading. Export HAR. Record: page shell visible time, request start order, `/home` start/finish, `/project-links` start/finish, overlap observation.
- **Run B — Adobe Completed Toggle.** Keep Network open. Click the Adobe completed/history toggle. Confirm exactly one `GET /api/my-work/me/adobe-sign/recent-completions` request starts. Record its duration.
- **Run C — Warm Refresh.** Reload immediately after Run A. Compare `/home`, `/project-links`, and useful-state arrival vs Run A.

## KQL queries (App Insights)

From `supporting/Application_Insights_Validation_Queries.md`. The four highest-leverage queries for this closeout are inlined here for copy/paste:

### Query 1 — Handler duration summary (My Work routes)

```kusto
customEvents
| where timestamp > ago(4h)
| extend eventName = name
| where eventName == "handler.success"
| extend domain = tostring(customDimensions.domain)
| extend operation = tostring(customDimensions.operation)
| where domain == "my-work-read-model"
| project
    timestamp,
    operation,
    durationMs = todouble(customDimensions.durationMs),
    statusCode = tostring(customDimensions.statusCode),
    correlationId = tostring(customDimensions.correlationId)
| order by timestamp desc
```

### Query 5 — Adobe stage duration pivot by correlation

```kusto
customEvents
| where timestamp > ago(4h)
| where name in (
    "adobeSign.read.principalResolution.result",
    "adobeSign.read.tokenAcquisition.result",
    "adobeSign.read.refresh.result",
    "adobeSign.read.search.result",
    "adobeSign.read.actionQueue.result"
)
| extend
    correlationId = tostring(customDimensions.correlationId),
    durationMs = todouble(customDimensions.durationMs)
| summarize
    principalMs = maxif(durationMs, name == "adobeSign.read.principalResolution.result"),
    tokenMs = maxif(durationMs, name == "adobeSign.read.tokenAcquisition.result"),
    refreshMs = maxif(durationMs, name == "adobeSign.read.refresh.result"),
    searchMs = maxif(durationMs, name == "adobeSign.read.search.result"),
    overallMs = maxif(durationMs, name == "adobeSign.read.actionQueue.result")
  by correlationId
| order by overallMs desc
```

### Query 6 — Project Links source timings

```kusto
customEvents
| where timestamp > ago(4h)
| where name == "myProjectLinks.read.sources.result"
| project
    timestamp,
    correlationId = tostring(customDimensions.correlationId),
    projectsDurationMs = todouble(customDimensions.projectsDurationMs),
    registryDurationMs = todouble(customDimensions.registryDurationMs),
    projectsStatus = tostring(customDimensions.projectsStatus),
    registryStatus = tostring(customDimensions.registryStatus),
    projectsRowCount = toint(customDimensions.projectsRowCount),
    registryRowCount = toint(customDimensions.registryRowCount),
    projectsBounded = tostring(customDimensions.projectsBounded),
    registryBounded = tostring(customDimensions.registryBounded)
| order by timestamp desc
```

### Query 8 — Project Links source + reconcile joined

```kusto
let sources =
    customEvents
    | where timestamp > ago(4h)
    | where name == "myProjectLinks.read.sources.result"
    | project
        correlationId = tostring(customDimensions.correlationId),
        projectsDurationMs = todouble(customDimensions.projectsDurationMs),
        registryDurationMs = todouble(customDimensions.registryDurationMs),
        projectsRowCount = toint(customDimensions.projectsRowCount),
        registryRowCount = toint(customDimensions.registryRowCount);
let reconcile =
    customEvents
    | where timestamp > ago(4h)
    | where name == "myProjectLinks.read.reconcile.result"
    | project
        timestamp,
        correlationId = tostring(customDimensions.correlationId),
        reconcileDurationMs = todouble(customDimensions.durationMs),
        matchedItemCount = toint(customDimensions.matchedItemCount),
        sourceStatus = tostring(customDimensions.sourceStatus);
reconcile
| join kind=leftouter sources on correlationId
| order by timestamp desc
```

Use queries 2, 3, 4, 7, 9 from the full file (`supporting/Application_Insights_Validation_Queries.md`) for the slowest-instance pivot, auth duration join, raw Adobe stage rows, reconcile-only rows, and the cold-start suspicion triage respectively.

---

# 11. Pre-Existing Issues To Resolve Before Prompt 06

⚠️ The B05.9 a-s-extend (Adobe Sign action-link extension) work has been landing in parallel during B05.8 execution and currently blocks both `check-types` suites:

- **Frontend `check-types`** fails at:
  - `apps/my-dashboard/src/state/myWorkCardViewModel.ts:205` and `:357` — `Property 'actionHandoff' does not exist on type 'MyWorkAdobeSignActionQueueItem'`.
- **Backend `check-types`** fails at:
  - `backend/functions/src/hosts/my-work-read-model/adobe-sign-action-link-routes.ts:9` and `:10` — `Module '"@hbc/models/myWork"' has no exported member 'ResolveAdobeSignActionLinkRequest'` / `... 'AdobeSignActionLinkResolveResult'`.
  - `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts:149` and `:528` — same `actionHandoff` field absent on the model.

Source: parallel commits `7df502776`, `70656132b`, `12efbae0f`, `0fac7bddf` (and an in-flight worktree at `AdobeSignActionQueueCard.tsx`, `myWorkCardViewModel.{ts,test.ts}`, `packages/models/src/myWork/AdobeSignActionQueue.{ts,test.ts}`). These belong to the B05.9 plan dir `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.9 - a-s-extend/` (untracked at closeout time).

**Recommendation:** complete B05.9 — at minimum land the missing `@hbc/models/myWork` exports (`ResolveAdobeSignActionLinkRequest`, `AdobeSignActionLinkResolveResult`, and the `actionHandoff` field on `MyWorkAdobeSignActionQueueItem`) — before triggering Prompt 06. A clean `check-types` floor across both packages is a prerequisite for any evidence-based optimization decision; conflating B05.9 partial-land regressions with B05.8 capture data would muddy the optimization signal.

The B05.8 vitest suites (frontend 507/507, backend 2956/2956) are unaffected by the B05.9 cross-traffic and remain green — confirming the load-time remediation itself is functionally complete.
