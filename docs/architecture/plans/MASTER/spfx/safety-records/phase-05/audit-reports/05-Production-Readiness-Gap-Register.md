# 05 — Production-Readiness Gap Register

## Severity legend
- **Blocker** — must close before calling the app production-ready
- **High** — should close in the same remediation program
- **Medium** — meaningful improvement, but not first blocker
- **Low** — follow-on hardening

---

## G-01 — Preview route not implemented in frontend
- Severity: **Blocker**
- Area: workflow / backend wiring
- Current state: frontend repository exposes ingest + replay only
- Risk: UI does not match backend preview-before-commit architecture
- Correction: add typed preview method, hook, client, state model, and UI stage

## G-02 — Direct SPFx entry appears to omit backend config
- Severity: **Blocker**
- Area: bootstrap / deploy integrity / auth
- Current state: `SafetyWebPart.tsx` renders `App` without `functionAppUrl` or `apiAudience`
- Risk: app can render but ingest/replay cannot truthfully call the backend
- Correction: choose one authoritative production mount contract and prove config injection

## G-03 — Backend diagnostic envelope is collapsed
- Severity: **Blocker**
- Area: supportability / error truthfulness
- Current state: adapter throws generic fetch error on non-OK responses
- Lost data: requestId, failureClass, previewFailureClass, graphContext, diagnostics
- Correction: preserve backend envelope in typed frontend errors and surface it selectively

## G-04 — No request-id propagation from frontend
- Severity: **High**
- Area: observability
- Current state: backend can issue request IDs; frontend does not generate/preserve one per request
- Risk: difficult support correlation across browser, function logs, and operator screenshots
- Correction: generate client request ID, send it, retain returned request ID, display support reference

## G-05 — No cancellation / timeout posture for backend calls
- Severity: **High**
- Area: resilience / UX integrity
- Current state: bare `fetch` without AbortController or timeout
- Risk: hung UI, duplicate submissions, opaque operator experience
- Correction: add bounded request cancellation and timeout classification

## G-06 — Retry behavior is implicit/absent rather than deliberate
- Severity: **High**
- Area: resilience
- Current state: no explicit transient-fault policy
- Risk: either no recovery path or later accidental retry storm behavior
- Correction: add bounded retry only for clearly transient failures; never auto-retry contract/gate failures

## G-07 — Upload UX still presents direct commit model
- Severity: **Blocker**
- Area: UX contract / async truthfulness
- Current state: submit button directly mutates ingest
- Risk: operator mental model does not match actual backend design
- Correction: redesign upload into preview -> confirm commit

## G-08 — Mixed authority model is under-explained in the UI
- Severity: **High**
- Area: contract truthfulness
- Current state: repo says operator-entered project/inspection values are authoritative; workbook values become provenance/mismatch advisory
- Risk: user-facing copy may imply parser-first authority where repo truth does not
- Correction: make the authority model explicit and consistent, or deliberately change the contract

## G-09 — Backend readiness is not meaningfully surfaced or proven at release boundary
- Severity: **High**
- Area: release integrity
- Current state: backend has liveness/readiness surfaces; frontend release proof does not clearly verify mount/config/backend alignment
- Risk: broken host binding can ship unnoticed
- Correction: add release-proof checks for backend base URL, API audience, token acquisition, preview route, and round-trip request correlation

## G-10 — Hosted GUID overlay is hardcoded in the frontend bundle
- Severity: **High**
- Area: config drift / maintainability
- Current state: list/library GUIDs are compiled into the app
- Risk: stale bindings, environment drift, silent host mismatch
- Correction: move toward verified runtime binding or at minimum release-time verification and fail-loud behavior

## G-11 — Feature package responsibility boundary is too blurred
- Severity: **Medium**
- Area: maintainability
- Current state: one adapter mixes SharePoint REST read-side behavior with backend ingest/replay calls
- Risk: support and testing complexity; obscures backend client needs
- Correction: separate read-side SharePoint repository from backend command client or command adapter seam

## G-12 — Accessibility for async state change is incomplete
- Severity: **Medium**
- Area: accessibility
- Current state: some helpful panels exist, but live-region discipline is incomplete
- Risk: blocking/terminal states may not be reliably announced
- Correction: add dedicated polite status region + assertive alert region with correct timing

## G-13 — Support surfaces do not expose enough operational detail
- Severity: **Medium**
- Area: supportability
- Current state: run IDs are surfaced, but request IDs and classified backend failure details are not
- Risk: slower triage and weaker incident evidence
- Correction: show bounded support details in outcome panels and review queue detail views

## G-14 — No authoritative proof of which production entry path is active
- Severity: **Blocker**
- Area: packaging / deployment
- Current state: repo has direct SPFx webpart and IIFE shell entry patterns
- Risk: wrong artifact or wrong host behavior can appear “fine” visually
- Correction: collapse to one runtime authority or add explicit host-mode verification gates
