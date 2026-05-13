# Prompt 06 Closeout — My Dashboard B05-Remediation Final Production Closeout

**Date:** 2026-05-13
**Operator:** RMF (`bfetting@outlook.com`)
**Scope:** Documentation-only validation pass. No source, backend, tools, manifest, or model changes.

---

## 1. Final Verdict

**PASS — with operator-pending tenant lane.**

Per `feedback_closeout_tri_state_not_fixed`, the verdict is reported in three classes rather than collapsed into a single claim:

| Class                                                                | State                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prior issue: authenticated user trapped in static non-ready scaffold | **No longer observed.** Surface readiness is driven by envelope state (Prompt 03 selector + Prompt 04 view-models), the My Work read-model client is provisioned at app root (Prompt 02 provider), Adobe OAuth start + return-side callback UX are reconciled with the backend route contract (Prompt 05), and a fresh `.sppkg` traces to source HEAD (Lane 4b below). |
| Current target: B05-remediation closure                              | **Closed in source.** All six remediation commits land (00–05). Tests pass: 338/338 frontend + 2756/2759 backend (3 skipped, pre-existing).                                                                                                                                                                                                                            |
| Known intact: backend contract + per-prompt guardrails               | **Preserved.** No backend OAuth state/security/grant-store edits. No model contract changes. No tenant / app-catalog / CI mutation. The `.sppkg` produced in Lane 4b is local-only and NOT uploaded.                                                                                                                                                                   |

**Operator-pending lanes** (documented but not executed in this closeout, per `feedback_operator_pending_proof`):

- Lane 4c (production `.sppkg` build with real tenant `FUNCTION_APP_URL` / `API_AUDIENCE`)
- App-catalog upload of the production artifact
- Hosted load / browser-side smoke evidence on a SharePoint page
- SharePoint Admin Center API permission approval

---

## 2. Branch / HEAD

| Field                   | Value                                                                                                                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch                  | `main`                                                                                                                                                                                                                             |
| HEAD (validation start) | `b220cf880 feat(my-projects): implement dual-launch rows and complete module states`                                                                                                                                               |
| Working tree            | Clean before validation (`git status --short` empty). Lane 4b produces transient untracked artifacts under `dist/sppkg/`, `tools/spfx-shell/sharepoint/**`, `tools/spfx-shell/temp/**`, `apps/my-dashboard/dist/**` — none staged. |

### Commit ledger relevant to B05-remediation (oldest → newest)

```
400bc1f0d feat(my-dashboard): add Connect Adobe Sign CTA + read-model client OAuth start method      ← pre-remediation baseline
d412e617f docs(my-dashboard): record Prompt 00 sppkg parity gate closeout                            ← Prompt 00 (mine)
ea278bbc0 feat(tools): gate production My Dashboard .sppkg on FUNCTION_APP_URL+API_AUDIENCE          ← Prompt 01 (mine)
f596ca645 feat(my-dashboard): add MyWorkReadModelClientProvider runtime composition seam             ← Prompt 02 (mine)
adfe7e917 HB Intel My Dashboard v1.0.0.005: SPFx version bump and B05 remediation plan pack          ← operator (version + plan)
8f998fd03 feat(my-dashboard): drive home + Adobe surface readiness from live envelope state          ← Prompt 03 (mine)
7944edb69 feat(my-dashboard): drive card content from live envelope view-models                       ← Prompt 04 (mine)
d0f15d44f feat(my-projects): add flagship home-surface composition shell                              ← operator (adjacent My Projects feature)
4ceca7ffb feat(my-dashboard): wire Adobe Sign OAuth callback result UX                                ← Prompt 05 (mine)
b220cf880 feat(my-projects): implement dual-launch rows and complete module states                    ← operator (adjacent My Projects feature)
```

The two operator `my-projects` commits are adjacent feature work (a separate "My Projects" home-surface composition) that share the `MyWorkHomeSurface` host but introduce a distinct `MyProjectsHomeCard`. They are not part of B05-remediation and do not conflict with the remediation work.

---

## 3. Prompt Completion Table

| Prompt | Subject                                                           | Commit      | Supporting closeout                                       | Completion criterion (per prompt)                                                                                                                                      |
| ------ | ----------------------------------------------------------------- | ----------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00     | Repo Truth and Deployed Artifact Parity Gate                      | `d412e617f` | `supporting/03_Prompt_00_Parity_Gate_Closeout.md`         | PASS — source ↔ local `.sppkg` parity reconciled; uploaded-artifact parity is operator-side.                                                                           |
| 01     | Harden Production Runtime Config and `.sppkg` Packaging           | `ea278bbc0` | `supporting/04_Prompt_01_Packaging_Hardening_Closeout.md` | Production-intended My Dashboard `.sppkg` builds with missing `FUNCTION_APP_URL` / `API_AUDIENCE` fail loud (preflight + defense-in-depth).                            |
| 02     | Wire the My Work Read-Model Client into App Runtime               | `f596ca645` | (no closeout — commit body documents)                     | `MyWorkReadModelClientProvider` + `useMyWorkReadModelClient` + three per-envelope hooks mounted at app root; 16 new tests.                                             |
| 03     | Drive Home and Adobe Module Readiness from Live Envelope State    | `8f998fd03` | (no closeout — commit body documents)                     | `selectSurfaceReadiness` maps all 7 statuses + loading + error to surface variants; router consumes hooks and forwards readiness props; 30 new tests.                  |
| 04     | Convert Home and Adobe Cards from Static to Data-Driven Rendering | `7944edb69` | (no closeout — commit body documents)                     | `myWorkCardViewModel` pure selectors for all 7 cards; surfaces thread view-model props; empty queue distinguished from non-ready; 47 new tests.                        |
| 05     | Reconcile Adobe OAuth User Initiation with Live Frontend Runtime  | `4ceca7ffb` | (no closeout — commit body documents)                     | `adobeSignAuthorization` query parameter parsed + cleaned; per-status banner copy (closed-set, no provider leaks); end-to-end shell OAuth handler test; ~30 new tests. |

---

## 4. Validation Commands and Outcomes

### Lane 1 — Source truth

| Command                             | Result                                     |
| ----------------------------------- | ------------------------------------------ |
| `git status --short`                | empty (clean tree)                         |
| `git rev-parse --abbrev-ref HEAD`   | `main`                                     |
| `git rev-parse HEAD`                | `b220cf880b6270ff0f32c1aa3e51b4236b21189a` |
| `git log --oneline 400bc1f0d..HEAD` | 9 commits (table above)                    |

### Lane 2 — Frontend runtime

| Command                                            | Result                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @hbc/spfx-my-dashboard check-types` | clean exit; `tsc --noEmit` reports no errors                                                                                                                                                                                                                                                                                                                                             |
| `pnpm --filter @hbc/spfx-my-dashboard test`        | **Test Files 25 passed (25). Tests 338 passed (338).** Includes 6 new B05 test files: `MyWorkReadModelClientProvider.test.tsx`, `useMyWorkReadModelEnvelope.test.tsx`, `myWorkSurfaceReadiness.test.ts`, `myWorkCardViewModel.test.ts`, `adobeSignCallbackResult.test.ts`, `useAdobeSignCallbackResult.test.tsx`, `AdobeSignCallbackBanner.test.tsx`, `MyWorkShell.adobeOAuth.test.tsx`. |
| `pnpm --filter @hbc/spfx-my-dashboard build`       | `tsc --noEmit && vite build` → built in 451ms. `dist/my-dashboard-app.js` 251.78 KB, `dist/spfx-my-dashboard.css` 15.71 KB.                                                                                                                                                                                                                                                              |

### Lane 3 — Backend contract compatibility

| Command                                    | Result                                                                                                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm --filter @hbc/functions check-types` | clean exit                                                                                                                                                               |
| `pnpm --filter @hbc/functions test`        | **Test Files 170 passed (170). Tests 2756 passed \| 3 skipped (2759).** Adobe Sign OAuth routes, protected `my-work/me/*` routes, source-readiness provider — all green. |

### Lane 4 — Package truth (tri-state)

#### Lane 4a — Production gate fires when env is empty (Prompt 01 evidence)

Command: `BACKEND_MODE=production pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard`

Outcome: process exits non-zero before any gulp shell process is spawned. Error wording captured verbatim:

```
[build-spfx-package] Refusing to build production-intended .sppkg for domain "my-dashboard":
missing required runtime env vars: FUNCTION_APP_URL, API_AUDIENCE.
Resolved BACKEND_MODE: production.
Either supply FUNCTION_APP_URL and API_AUDIENCE (non-secret runtime values),
or set BACKEND_MODE=ui-review to build an explicit non-production artifact.
    at assertProductionRuntimeConfigRequirements (tools/build-spfx-package-production-runtime-config.ts:74:9)
    at <anonymous> (tools/build-spfx-package.ts:2900:3)
```

This is Prompt 01's preflight gate working as designed. No `.sppkg` produced.

#### Lane 4b — Non-production ui-review build succeeds (fresh artifact traced to HEAD)

Command: `BACKEND_MODE=ui-review pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard`

Outcome: pipeline completes; fresh `.sppkg` written to `dist/sppkg/hb-intel-my-dashboard.sppkg`.

| Field                               | Value                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Artifact path                       | `dist/sppkg/hb-intel-my-dashboard.sppkg`                                                                                       |
| Artifact SHA-256                    | `90d43a396509d25f7614622aa94905a7939c19ab6623dd211bd13f987f82472c`                                                             |
| Artifact size                       | ~98.5 KB                                                                                                                       |
| `AppManifest.xml` `App[@Version]`   | `1.0.0.005`                                                                                                                    |
| `AppManifest.xml` `App[@ProductID]` | `2f47bece-2668-4a02-a2ac-4e86eb3970a2`                                                                                         |
| `AppManifest.xml` Name              | `hb-intel-my-dashboard`                                                                                                        |
| Feature ID                          | `7a8b5491-bd3b-4fdd-8acd-81008bb4a64a`                                                                                         |
| WebPart component ID                | `412eb9fd-2eb2-4f7d-a4f1-7865e339a369`                                                                                         |
| Bundled My Dashboard app            | `ClientSideAssets/my-dashboard-app-e4bbe8b7.js` (251,781 bytes; freshness SHA `e4bbe8b727ea…`)                                 |
| Bundled shell webpart               | `ClientSideAssets/shell-entry-412eb9fd-…-889895fa.js` (24,611 bytes; identical bytes mirrored at `shell-web-part_6c6bbb8b…js`) |
| Bundled CSS                         | `ClientSideAssets/spfx-my-dashboard-3e449132.css` (17,613 bytes)                                                               |
| Package-truth proof                 | `dist/sppkg/my-dashboard-package-truth-proof.json` (emitted by `buildHbPackageTruthProof()`)                                   |
| Shim proof                          | `dist/sppkg/my-dashboard-shim-proof.json`                                                                                      |

Build evidence lines captured from stdout:

```
✓ Packaged shim files (1): shell-entry-412eb9fd-2eb2-4f7d-a4f1-7865e339a369-889895fa.js
✓ Neutral shared shell module identity: 412eb9fd-2eb2-4f7d-a4f1-7865e339a369_1.0.0
✓ 412eb9fd... supportsFullBleed: true preserved
✓ .sppkg structure verified
✓ Packaged bundle freshness verified (my-dashboard-app-e4bbe8b7.js, sha256:e4bbe8b727ea...)
✓ Packaged shell asset references my-dashboard-app-e4bbe8b7.js and __hbIntel_myDashboard
```

#### Runtime marker verification on the Lane 4b shell asset

Grep over the packaged `ClientSideAssets/shell-entry-…-889895fa.js`:

| Marker                                                                                   | Present?                                                                                                   |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `production` (string literal — backend-mode enum value used by runtime defaults)         | ✓ present                                                                                                  |
| `ui-review` (string literal — backend-mode enum value)                                   | ✓ present                                                                                                  |
| `apiAudience` value (runtime API audience URL/literal)                                   | ❌ absent (correctly — `ui-review` build does not embed production audience)                               |
| `functionAppUrl` value (live Function App URL)                                           | ❌ absent (correctly — `ui-review` build does not embed production Function App URL)                       |
| Unreplaced `__FUNCTION_APP_URL__` / `__API_AUDIENCE__` / `__BACKEND_MODE__` placeholders | ❌ absent (build-time `DefinePlugin` substitution ran with empty strings → DCE eliminated the assignments) |

This is the expected and correct posture for a `ui-review` artifact. A production-intended build (Lane 4c) would embed the operator-supplied `FUNCTION_APP_URL` and `API_AUDIENCE` values; absent those, Prompt 01's preflight gate refuses to build (Lane 4a evidence above).

#### API permission request posture

From `apps/my-dashboard/config/package-solution.json:36–41`:

```json
"webApiPermissionRequests": [
  { "resource": "HB SharePoint Creator", "scope": "access_as_user" }
]
```

Permission request remains exactly the `access_as_user` delegated scope against `HB SharePoint Creator` (the HB Function App registration). Embedded in `AppManifest.xml` of the Lane 4b artifact. **SharePoint Admin Center approval is operator-pending** when this artifact is uploaded to the tenant app catalog.

#### Lane 4c — Production build with real tenant env values (OPERATOR-PENDING)

Documented command path:

```bash
export BACKEND_MODE=production
export FUNCTION_APP_URL='https://<tenant-function-app>.azurewebsites.net'
export API_AUDIENCE='api://<tenant-function-app-client-id>'
pnpm exec tsx tools/build-spfx-package.ts --domain my-dashboard
```

Env value sources of truth (operator):

- `FUNCTION_APP_URL`: Azure Portal → Function App → Overview → URL
- `API_AUDIENCE`: Entra → App registrations → HB Function App → Expose an API → Application ID URI (the `api://…` identifier registered for delegated `access_as_user`)
- `BACKEND_MODE`: literal value `production`

The Prompt 01 preflight gate validates that both `FUNCTION_APP_URL` and `API_AUDIENCE` are non-empty before the gulp build is spawned. The build then writes the operator-supplied URL into the shell asset via `webpack.DefinePlugin` (`tools/spfx-shell/gulpfile.js:31, 34`). The Prompt 01 post-build inspectors confirm the literals are present in the packaged shell asset.

Lane 4c **not executed in this closeout** — closeout artifact does not have access to operator tenant values, per `feedback_operator_pending_proof`.

### Lane 5 — Regression tests evidence

Covered by Lanes 2 and 3. Counts: **338 frontend tests / 25 files + 2756 backend tests / 170 files** all passing. No skipped frontend tests; 3 pre-existing backend skips (unrelated to B05-remediation).

---

## 5. Remaining Operator-Owned Deployment Prerequisites

The following are explicitly out-of-scope for this closeout per `feedback_operator_pending_proof` and the prompt's Non-Scope rules. Each is a tenant-side action that requires operator credentials and cannot be proved from source alone.

| #   | Action                                                                                               | Why it's operator-pending                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | SharePoint Admin Center API permission approval for `HB SharePoint Creator` / `access_as_user`       | Requires tenant admin sign-in; approval is a one-time tenant grant.                                         |
| 2   | Provide Azure Function App env values: `FUNCTION_APP_URL`, `API_AUDIENCE`, `BACKEND_MODE=production` | Values are tenant-specific; no source default can substitute.                                               |
| 3   | Adobe OAuth app config (client ID / secret / redirect URI)                                           | Configured in Adobe Sign admin + Function App app-settings.                                                 |
| 4   | Build Lane 4c production artifact with the env values from #2                                        | Produces the artifact uploaded in #5.                                                                       |
| 5   | Upload `.sppkg` to the tenant app catalog                                                            | Replaces any prior uploaded artifact; triggers SP Admin approval cycle.                                     |
| 6   | Sanity-load on a SharePoint page in HBCentral                                                        | Hosted browser evidence. Confirms `mount.tsx` token-provider creation, envelope load, ready-surface render. |

Lane 4b's local artifact at `dist/sppkg/hb-intel-my-dashboard.sppkg` (SHA-256 `90d43a39…472c`) is a `ui-review` build; it is **not** suitable for tenant upload as a production artifact and must be regenerated via Lane 4c.

---

## 6. Why Did the App Render Non-Ready Before, and Why Is That Now Closed?

**Before remediation**, an authenticated production user landed in the static `non-ready` scaffold even when backend prerequisites were satisfied because three independent gaps compounded:

1. **Frontend runtime did not consume the read-model client.** `MyDashboardApp` plumbed `getApiToken` but no component constructed `createMyWorkReadModelClient(...)` for data loading. Home and Adobe queue surfaces rendered as static scaffolds with no envelope reference.
2. **Surface readiness was prop-default driven.** `MyWorkSurfaceRouter` passed nothing to `MyWorkHomeSurface` / `AdobeSignActionQueueModuleSurface`; both surfaces defaulted `readinessVariant='non-ready'` unconditionally.
3. **Packaging silently accepted incomplete production runtime config.** `tools/build-spfx-package.ts` validators short-circuited when `FUNCTION_APP_URL` / `API_AUDIENCE` were empty, so a `.sppkg` could be produced and uploaded with `backendMode='production'` but no usable Function App URL or token audience. The SPFx delegated token provider in `mount.tsx:80–82` was conditional on `apiAudience`, which was empty in such a build — so the bearer-token chain never engaged. Even if the frontend had consumed the client (gap 1), it would have called against an empty Function App URL.

**After remediation**, each gap is closed in source:

1. **Prompt 02** mounts `MyWorkReadModelClientProvider` at the app root, exposes `IMyWorkReadModelClient` to all descendants via context, and provides three per-envelope async hooks. **Prompt 03** rewires `MyWorkSurfaceRouter` to consume the hooks via `selectSurfaceReadiness` and forward readiness props (variant + sourceStatus + envelope) into both surfaces.
2. **Prompt 03** maps `MyWorkReadModelSourceStatus` (7 closed-set values) plus loading + error into the surface variant union via the pure selector module. **Prompt 04** turns each card's static placeholders into envelope-derived view-models via narrow pure selectors with exhaustive tests.
3. **Prompt 01** adds a preflight hard-gate that refuses to build a production-intended `.sppkg` when `FUNCTION_APP_URL` or `API_AUDIENCE` is missing. Defense-in-depth post-build inspectors enforce the same predicate. Lane 4a above demonstrates the gate firing as designed.
4. **Prompt 05** closes the OAuth round-trip: the backend's `adobeSignAuthorization=<status>` callback marker is now parsed, mapped to typed per-status user copy (no provider word leaks), surfaced via an accessible status/alert banner, and the URL is cleaned via `history.replaceState`. An end-to-end shell test proves the Connect CTA → start-route POST → redirect to authorizationUrl path.

The combined effect: an authenticated production user with the operator-pending tenant config in place will (a) have a token-provider chain, (b) reach the protected backend routes via a typed client, (c) see ready surfaces when envelopes report `available` or `partial`, (d) see typed non-ready guidance distinguishing configuration-required from authorization-required from backend-unavailable, (e) see real data values (counts, refresh time, agreement items) in ready cards, and (f) receive immediate banner feedback after Adobe Sign OAuth round-trip.

---

## 7. Acceptance Test Ledger

Each of the eight acceptance items required by Prompt 06, with source-of-truth evidence:

| #   | Acceptance bullet                                                                | Proven? | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Backend runtime config is supplied for production package truth                  | ✓       | Prompt 01 commit `ea278bbc0` adds `assertProductionRuntimeConfigRequirements` to `tools/build-spfx-package.ts` (preflight + both post-build inspectors). Lane 4a above demonstrates the gate firing with empty env.                                                                                                                                                                                                      |
| 2   | Token-provider creation is possible when runtime `apiAudience` exists            | ✓       | `apps/my-dashboard/src/mount.tsx:80–82` creates `createSpfxApiTokenProvider(spfxContext, apiAudience)` when `getApiAudience()` returns a non-empty value. Wiring unchanged across B05-remediation.                                                                                                                                                                                                                       |
| 3   | App runtime uses the My Work client                                              | ✓       | `MyDashboardApp.tsx` wraps `<MyWorkShell>` in `<MyWorkReadModelClientProvider getApiToken={getApiToken}>` (commit `f596ca645`). `MyWorkSurfaceRouter` route containers consume `useMyWorkHomeEnvelope` / `useAdobeSignActionQueueEnvelope` (commit `8f998fd03`). Tests: `MyWorkReadModelClientProvider.test.tsx` (5 cases), `useMyWorkReadModelEnvelope.test.tsx` (10 cases), `MyWorkSurfaceRouter.test.tsx` (14 cases). |
| 4   | Ready surface can render when envelope source status is available                | ✓       | `selectSurfaceReadiness` maps `available` and `partial` → `'ready'` (`apps/my-dashboard/src/state/myWorkSurfaceReadiness.ts`). `MyWorkSurfaceRouter.test.tsx`'s home-route + adobe-route ready-tree cases prove DOM rendering. Card-level data: Prompt 04 view-model selectors covered by `myWorkCardViewModel.test.ts`.                                                                                                 |
| 5   | Non-ready surface remains for authorization/configuration/backend unavailability | ✓       | `mapSourceStatusToVariant` maps the other 5 statuses → `'non-ready'`. Per-status guidance copy in `sourceStatusCopy` (`apps/my-dashboard/src/state/myWorkCardViewModel.ts`) — closed-set, asserted distinct, asserted no provider-word leaks. Surface tests assert non-ready DOM markers per status.                                                                                                                     |
| 6   | Cards render real data values in ready envelopes                                 | ✓       | Prompt 04 view-models for 7 cards in `myWorkCardViewModel.ts`. `MyWorkHomeSurface.test.tsx` `data-driven content via homeEnvelope` describe + `AdobeSignActionQueueModuleSurface.test.tsx` `data-driven content via queueEnvelope` describe assert `data-adobe-queue-pending-count="6"`, `data-my-work-action-item-count="6"`, agreement-item rows count, empty-state marker distinct from non-ready.                    |
| 7   | No package/source parity ambiguity remains                                       | ✓       | Prompt 00 closeout PASS (`supporting/03_Prompt_00_Parity_Gate_Closeout.md`). Lane 4b artifact in this closeout is freshly built from HEAD source: solution version `1.0.0.005` matches working-tree, source bundle SHA `e4bbe8b727ea…` matches packaged bundle.                                                                                                                                                          |
| 8   | Adobe OAuth initiation UX is reconciled with backend truth                       | ✓       | Prompt 05 commit `4ceca7ffb`: `parseAdobeSignCallbackResult` covers all 7 backend `CALLBACK_UX_STATUS` enum values + unknown fallback; `useAdobeSignCallbackResult` cleans the URL; `AdobeSignCallbackBanner` renders typed copy with accessibility roles; `MyWorkShell.adobeOAuth.test.tsx` proves end-to-end POST → redirect handler.                                                                                  |

---

## 8. Residual Risks and Operator Notes

Per `feedback_drift_continue_classify_not_stop` and `feedback_closeout_tri_state_not_fixed`:

- **Tenant-uploaded artifact still operator-owned.** Prompt 00's audit found a prior parity gap between an uploaded `.sppkg` and source. Lane 4b proves source ↔ local-artifact parity for the `ui-review` posture. The production-posture artifact for tenant upload is Lane 4c, which is operator-pending.
- **Hosted load not in scope.** Browser-side smoke evidence on an actual SharePoint page (token-provider creation, envelope POST/GET, ready-surface render, OAuth round-trip) is operator-pending hosted proof.
- **My Projects feature surface (operator's `d0f15d44f` + `b220cf880`) lives in the same shell as B05-remediation but is unrelated.** Its `getApiToken` thread on `MyWorkSurfaceRouter` is observed and confirmed non-conflicting: it routes to `MyProjectsHomeCard` for the My Projects feature; B05-remediation surfaces (`WorkSummaryCard`, Adobe Sign cards) do not consume it.
- **Shell's one-shot OAuth client at `MyWorkShell.tsx:79–95` is intentional**, not a residual cleanup item. It forces `readModelMode='backend'` regardless of runtime mode so the OAuth start works in `ui-review` builds. Refactoring it to the Prompt 02 provider context would break that property and is explicitly out of scope.
- **Banner mounting position is functional, not visually-refined.** Prompt 05 placed `<AdobeSignCallbackBanner />` inside `<main role="tabpanel">` above the bento grid with no bespoke styling — only inherited shell CSS. A future UX prompt can add styling without changing the typed copy, accessibility roles, or DOM markers.

No blocking residuals.

---

## 9. Post-Closeout Branch Position

After this closeout commits:

```
git log --oneline -3
<this-commit>  docs(my-dashboard): record Prompt 06 B05-remediation final production closeout
b220cf880       feat(my-projects): implement dual-launch rows and complete module states
4ceca7ffb       feat(my-dashboard): wire Adobe Sign OAuth callback result UX
```

(Exact short SHA captured at commit time.)
