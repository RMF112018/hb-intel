# Gap 1 Build-Time Parameterization — `webApiPermissionRequests` Resource

> **Created:** 2026-04-01 (P10-03)
> **Status:** Implemented

## 1. Chosen Parameterization Mechanism

The build orchestrator (`tools/build-spfx-package.ts`) now supports an optional `SPFX_API_RESOURCE` environment variable that overrides the `webApiPermissionRequests[0].resource` value at build time. This follows the same pattern used for `API_AUDIENCE`, `FUNCTION_APP_URL`, and `BACKEND_MODE` — environment-specific values are injected via env vars during CI/CD or local builds, with sensible defaults when unset.

The override is applied after reading the domain `package-solution.json` but before writing the shell copy, so the authoritative source file retains a static default (`hb-intel-api-staging`) while the packaged artifact receives the correct environment-specific value.

## 2. Environment Input

| Variable | Purpose | Default if unset |
|----------|---------|-----------------|
| `SPFX_API_RESOURCE` | Entra app registration display name for `webApiPermissionRequests` resource | Source config value (`hb-intel-api-staging`) |

The `scope` (`access_as_user`) is constant across all environments and is not parameterized.

## 3. Produced Values by Environment

| Environment | `SPFX_API_RESOURCE` | Resulting `resource` in `.sppkg` |
|-------------|--------------------|---------------------------------|
| Development | `hb-intel-api-dev` | `hb-intel-api-dev` |
| Staging | `hb-intel-api-staging` (or unset) | `hb-intel-api-staging` |
| Production | `hb-intel-api-production` | `hb-intel-api-production` |

## 4. Why This Approach Is Correct

1. **Follows the established pattern.** `API_AUDIENCE`, `FUNCTION_APP_URL`, and `BACKEND_MODE` are all injected the same way — env var at build time, with defaults when unset. No new mechanism is introduced.

2. **Single source of truth.** The build orchestrator is already the authority for shell config assembly. Adding the override here keeps the parameterization co-located with the existing env var handling (lines 537–548).

3. **Backward compatible.** When `SPFX_API_RESOURCE` is not set, the source config value is used unchanged. Existing builds that do not set the variable continue to work exactly as before.

4. **Minimal blast radius.** Only one line in the orchestrator conditionally overrides one field. No new files, no new build steps, no changes to the gulp pipeline or CI/CD workflows.

5. **`scope` is correctly constant.** The delegated scope `access_as_user` is defined once on the Entra app registration and is the same across all environments. Parameterizing it would add complexity with no benefit.

## 5. Fallback/Default Behavior

- If `SPFX_API_RESOURCE` is **set**: the orchestrator overrides `webApiPermissionRequests[0].resource` with the env var value and logs a confirmation message.
- If `SPFX_API_RESOURCE` is **not set**: the source config value (`hb-intel-api-staging`) is used as-is. No warning is logged — this is the expected default for local development and staging builds.
- If the domain config has **no `webApiPermissionRequests` array**: the override is skipped silently. This supports domain configs that do not declare API permissions.

## 6. Files Changed

| File | Change |
|------|--------|
| `tools/build-spfx-package.ts` | Added `SPFX_API_RESOURCE` env var override for `webApiPermissionRequests[0].resource` after domain config read (lines ~506–518) |
| `apps/estimating/config/package-solution.json` | Version bump `001.000.006` → `001.000.007` |
| `docs/architecture/reviews/project-setup-gap-1-parameterization-implementation.md` | This document |
