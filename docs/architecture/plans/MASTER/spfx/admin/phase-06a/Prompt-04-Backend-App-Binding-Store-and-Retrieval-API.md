# Prompt-04 — Backend App-Binding Store and Retrieval API

## Objective

Implement the backend-controlled persistence and retrieval path for app bindings so the Admin control plane can publish durable target-app bindings and target apps can retrieve them through the intended runtime resolution path.

## Important execution rules

- Keep privileged writes in the backend/control plane.
- Reuse existing persistence foundations where practical.
- **Do not re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.**
- Do not assume the storage medium until repo truth confirms the best fit.

## Inputs

Use:
- the app-binding architecture docs
- the shared contracts from Prompt-03
- current admin-control-plane persistence services
- any existing config or registry persistence surfaces in the repo
- target app runtime-resolution constraints from Prompt-01/02

## Required work

### A. Implement the binding store
Create the smallest correct durable store for:
- get active binding by app key
- publish/replace binding
- list bindings for admin review
- mark superseded/inactive where appropriate
- retrieve verification/drift metadata if part of the store model

### B. Implement retrieval support
Implement the backend API and/or retrieval surface required for:
- Admin UX to read binding status and history
- target apps to retrieve the active binding in the intended runtime flow

The implementation must respect the architecture requirement that target apps can resolve their binding **before** first backend-dependent use.

### C. Implement publication support
Support a backend write path for:
- initial publication from install/setup flow
- subsequent update/reapply from admin repair/config actions

### D. Documentation output
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-store-and-api.md`

This doc must explain:
- where bindings are stored,
- how they are keyed,
- how target apps retrieve them,
- how publication and supersession work,
- and why this is Phase-6A-appropriate rather than a full Phase 10 registry.

## Required boundaries

- Do not expose secrets to the frontend.
- Do not require privileged browser writes.
- Do not create an operator workflow that depends on hand-editing storage directly.
- Do not force target apps to already know `functionAppUrl` just to fetch the binding.

## Validation

Run the smallest targeted validation set for the touched backend and shared surfaces.
Add focused tests for:
- get active binding
- publish/replace
- target-app retrieval path
- invalid/missing binding behavior
- supersession behavior if implemented

Document what was run and why.

## Completion condition

Stop after the store and retrieval path exist, are documented, and are validated.
Do not integrate the install flow in this prompt.
