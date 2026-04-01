# Prompt-02 — Phase 8 SPFx Runtime Config and Token Contract Reconciliation

## Objective

Reconcile and harden the runtime-config and token-acquisition contract between the Project Setup SPFx shell, mounted frontend app, and backend API expectations so the packaged artifact behaves correctly in production posture.

## Context

The prior audit indicated that the current source model expects shell-provided runtime config and audience-scoped API token behavior, while the packaged artifact may not have been honoring that contract correctly.

## Required Working Rules

- Treat the current packaged build and current source as separate truth sources until proven reconciled.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction, inspect exact evidence, or resolve an ambiguity.
- Preserve the current dual-mode posture only if it remains production-correct and diagnostically clear.
- Preserve permanent light mode for the SPFx surface.

## Tasks

### 1. Audit the current runtime-config chain end-to-end
Trace the exact flow for:
- shell compile-time constants
- shell runtime config object
- `mount(...)` contract
- `setRuntimeConfig(...)`
- frontend `getFunctionAppUrl()`
- frontend `getApiAudience()`
- production readiness checks
- SPFx API token provider creation

Confirm whether the packaged artifact now passes:
- `functionAppUrl`
- `backendMode`
- `allowBackendModeSwitch`
- `apiAudience`

### 2. Verify frontend/backend audience compatibility
Audit repo truth for:
- frontend API audience resolution
- backend `API_AUDIENCE` expectations
- any env docs or deployment docs that define the audience contract

Implement any corrections required so the contract is explicit, narrow, and internally consistent.

### 3. Verify packaged production-mode behavior
Using the packaged build output and source truth, verify:
- production mode activates only when prerequisites are satisfied
- ui-review fallback is intentional and diagnosable
- missing runtime config produces clear diagnostics
- missing token-provider prerequisites do not create misleading narrow-demo success

### 4. Tighten diagnostics and release safety
If gaps remain, implement improvements such as:
- clearer runtime-config diagnostics
- stronger readiness messaging
- build-time or runtime assertions for missing required mount inputs
- better separation between review-mode permissiveness and production-mode requirements

Do not add noisy or brittle checks. Prefer high-signal diagnostics.

## Deliverables

### Code / Repo Deliverables
- runtime-config contract fixes
- shell injection fixes if still needed
- token-provider / audience contract fixes if needed
- improved production-readiness diagnostics where justified

### Documentation Deliverables
Update the Phase 8 report with:
- exact runtime-config chain summary
- frontend/backend token contract summary
- packaged verification results
- files changed
- closure statement for Prompt-02
- carry-forward items for Prompt-03+

## Completion Standard

This prompt is complete only when repo truth and current packaged truth agree on how production mode becomes live, how the API audience is resolved, and how SPFx acquires tokens for the backend.
