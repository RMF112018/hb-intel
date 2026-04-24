# 02 — Research-Backed Assessment

## A. What is already strong enough to preserve

### 1. Governed workbook contract
The shared Safety package is not treating uploads as arbitrary spreadsheets. The parser and template validation layer define a strict workbook contract with required sheets, anchors, response headers, parser markers, accepted contract versions, and reporting-period/key-findings seams. Preserve this architecture.

### 2. Shared project resolution seam reuse
The Safety project picker reuses the Project Sites search pipeline instead of inventing a second project lookup model. Preserve that.

### 3. Review queue triage framing
The review queue is not just a raw table anymore. It has a stronger triage posture and bounded replay actions. Preserve the triage framing and action clustering.

### 4. Better-than-before state semantics on some read seams
Reporting-period and project-registry failures are surfaced more honestly than a generic empty/error collapse. Preserve those distinctions.

## B. Directionally usable, but still insufficient

### 1. Direct token acquisition in SPFx
The app uses SPFx token acquisition to get a bearer token for the backend. That is directionally valid, but Microsoft’s documented standard path for Entra-secured APIs in SPFx is `AadHttpClient`, which handles the token flow for API calls and is the recommended approach for SPFx solutions calling Entra-secured resources. If the app intentionally bypasses `AadHttpClient`, that needs to be an explicit design decision with parity checks for:
- token failure handling,
- popup/redirect behavior,
- header consistency,
- and supportability.  
Source guidance: Microsoft Learn on SPFx Entra-secured APIs and `AadHttpClient`; `AADTokenProvider` guidance also notes token acquisition fallback flows like popup/full-page redirect when silent SSO fails.

### 2. Retry posture
The frontend currently has almost no deliberate retry/cancellation posture for backend calls. Official Azure guidance is not “retry everything”; it is to retry only likely-transient failures, avoid retry storms, and log retry behavior. For an interactive Safety upload flow, most 4xx contract/gate failures should not auto-retry. A small, explicit retry policy may be reasonable for transient network/5xx faults, but only if it is bounded and observable.

### 3. Accessibility intent is present but not complete
The app uses some `role="status"` / `role="alert"` style patterns and structured panels, which is directionally right. But live-region use should be stricter:
- advisory async updates => `status` / polite live region,
- urgent blocking failures => `alert`,
- live region container should exist before content changes,
- and operator feedback should not rely only on visible panels.

## C. Structurally weak or materially wrong

### 1. The frontend does not implement the backend’s actual workflow model
The backend is explicitly preview-first and commit-gated. The frontend is still direct-submit. That is not a small improvement gap; it is a workflow mismatch.

### 2. The backend client seam is underpowered
The app uses a repository adapter that:
- posts directly with `fetch`,
- discards backend request IDs and failure classes,
- has no abort/timeout model,
- has no clear transient-fault policy,
- and does not surface backend diagnostic richness to the UI.

That is below current production-grade frontend/API integration practice.

### 3. Production mounting is ambiguous
A production app should have one authoritative host-binding contract. The Safety app has two materially different production entry models with different assumptions. That is a deploy-integrity problem.

### 4. Config and binding truth is not adequately proven
The frontend depends on host-injected runtime config and hardcoded GUID overlays. The backend has stronger startup/readiness validation than the frontend does. The result is a system where backend readiness may be solid while the frontend can still be mounted incorrectly.

## D. Recommended correction direction

### Refinement work
Keep:
- the domain package,
- parser contract,
- project search seam,
- review queue triage patterns,
- list/query layering.

### Structural redesign work
Redesign:
- the backend client abstraction,
- the upload flow (preview before commit),
- the production entry/config contract,
- the support/observability surface between frontend and backend.

That is not a broad rewrite. It is a bounded architecture correction at the integration seam.
