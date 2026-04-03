# Prompt-06 — Target-App Runtime Resolver Integration

## Objective

Integrate the first-class app-binding resolution path into the target SPFx apps so they can resolve their active backend/runtime binding before first backend-dependent use.

## Important execution rules

- Start with the minimum supported target apps:
  - Accounting
  - Project Setup
- **Do not re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.**
- Preserve clear separation between runtime resolution, auth bootstrap, and business-page logic.
- Avoid circular dependency.

## Inputs

Use:
- the Prompt-01 runtime-gap findings
- the Prompt-02 resolution lifecycle
- the binding contracts/store from Prompts 03–04
- the current runtimeConfig/mount/backend provider flow in Accounting and Project Setup
- the SPFx shell/runtime packaging path only where needed

## Required work

### A. Define the runtime resolution seam
Implement the smallest correct runtime-resolution seam so each target app can:
- request/resolve its active binding,
- set/apply runtime config,
- handle missing/not-configured binding state explicitly,
- and only then proceed to backend-dependent behavior.

### B. Integrate for Accounting
Update the Accounting runtime startup/config path accordingly.

### C. Integrate for Project Setup
Update the Project Setup runtime startup/config path accordingly.

### D. Provide clear fallback/diagnostic behavior
When no active binding is available, the target app must surface a clear configuration state rather than failing with obscure downstream API errors.

### E. Documentation output
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-target-app-runtime-resolution.md`

Explain:
- the runtime resolution sequence,
- how the target apps consume the binding,
- what happens when binding is missing or stale,
- and how this coexists with any remaining build-time injection path.

## Required boundaries

- Do not bury the resolver inside arbitrary page components.
- Do not make the target app depend on already knowing `functionAppUrl` to fetch `functionAppUrl`.
- Do not silently fall back to misleading defaults in production-mode flows.
- Do not break local/dev flows if existing mock/dev behavior must remain.

## Validation

Run targeted validation for the touched apps and shared/runtime surfaces.
Add focused tests for:
- successful binding resolution
- missing binding state
- stale/invalid binding handling
- runtime config application order

Document the exact validation set used.

## Completion condition

Stop after the target-app runtime resolver path exists, is documented, and is validated.
Do not build verification/drift or admin UX in this prompt.
