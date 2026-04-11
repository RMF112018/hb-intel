# Prompt 02 — PnP Ops Runner Abstraction and Frontend Contract Refactor

## Objective

Refactor the PnP Ops frontend and shared service logic so the webpart no longer hard-depends on the Azure admin API seam and instead targets a **runner abstraction** that supports local runner, remote runner, and mock mode.

---

## Critical instruction

**Do not re-read files that are already in your active context or memory.**

Work from the architecture direction established in Prompt 01.

---

## Primary goal

Replace the current “backend admin API” assumption in the PnP Ops frontend path with a **transport-neutral runner client**.

The webpart should no longer think in terms of “Azure backend.” It should think in terms of “selected execution mode and runner endpoint.”

---

## Required execution modes

Implement a runtime model equivalent to:

- `local-runner`
- `remote-runner`
- `mock`

Optional:
- `legacy-admin-api` only if needed for non-breaking migration, but mark it deprecated in code comments and UI messaging.

---

## Required refactor scope

Likely paths include:

- `apps/hb-webparts/src/webparts/pnp/PnpOps.tsx`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsClient.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsActionCatalog.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsValidation.ts`
- `apps/hb-webparts/src/mount.tsx`
- manifest / property surface files under the PnP webpart path

Refactor only what is necessary to establish the new execution seam cleanly.

---

## Required changes

### 1. Introduce explicit runner config
Replace or extend the current config model with something equivalent to:

- `executionMode`
- `runnerBaseUrl`
- `defaultTargetSiteUrl`
- `mockMode` only if still useful, or fold into `executionMode`
- optional local-runner trust / certificate flags only if truly necessary
- remove or de-emphasize `backendAudience` for the live PnP path

Do not leave Azure naming as the primary abstraction if Azure is no longer the intended live path.

### 2. Introduce a runner client abstraction
Create a clean client layer, for example:

- `pnpOpsRunnerClient.ts`
- `pnpOpsTransport.ts`
- `pnpOpsExecutionModes.ts`

It should:
- construct URLs from a chosen runner base URL,
- call the neutral runner contract,
- normalize responses into the current UI model,
- keep evidence/artifact handling clear,
- isolate transport details from the React component.

### 3. Update frontend state and messaging
Update the UI so it clearly shows:

- which execution mode is active,
- whether a local runner is expected,
- whether a remote runner is expected,
- whether mock mode is active,
- why live mode is unavailable when no runner is reachable.

The UI must no longer tell the user to configure Azure backend settings for the preferred live extraction path.

### 4. Update validation
Validation must now include:

- target site URL validation
- action-specific list/page filter validation
- execution-mode-specific runner URL validation
- mode-specific helpful error text

Do not keep stale “backend token provider unavailable” messaging as the primary failure state for live extraction.

### 5. Preserve the operator UX strengths
Retain:
- action catalog clarity
- preflight → launch → status → evidence flow
- artifact manifest clarity
- clear warnings about browser-side privileged execution not being supported

---

## Non-goals

- Do not implement the actual local runner service in this prompt unless required for frontend compilation.
- Do not implement the full remote fallback host here.
- Do not rework unrelated admin-control-plane routes.

---

## Deliverables

1. Refactored frontend/service layer targeting the runner abstraction.
2. Updated webpart config/property model.
3. Clean mode-aware UI messaging.
4. Completion report with:
   - changed files,
   - removed Azure-specific assumptions in the UI path,
   - any migration notes.

---

## Acceptance criteria

- Frontend compiles and no longer assumes Azure as the required live path.
- PnP Ops can be configured against a generic runner endpoint.
- Mode-aware UX is clear and honest.
- The React layer is no longer tightly coupled to `/api/admin/*`.
