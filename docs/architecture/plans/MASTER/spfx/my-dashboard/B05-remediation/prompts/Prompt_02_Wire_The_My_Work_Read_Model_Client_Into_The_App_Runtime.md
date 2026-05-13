# Prompt 02 — Wire the My Work Read-Model Client into the App Runtime

## Objective

Connect the already-existing My Work read-model client/factory to the active My Dashboard React runtime so authenticated production users can actually exercise the backend read-model routes.

## Why this exists now

The audit found:

- `apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts` exists and can select backend vs fixture mode.
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts` exists and can call protected routes with bearer token.
- `MyWorkShell` receives `getApiToken` but discards it as `_getApiToken`.
- The production render tree does not construct/use `createMyWorkReadModelClient(...)`.

In other words: the data client exists, but the app root/shell never instantiates and consumes it.

## Required future state

Implement a narrow, testable runtime composition seam so that:

1. `MyDashboardApp` / `MyWorkShell` creates or receives an `IMyWorkReadModelClient`.
2. The client is produced through `createMyWorkReadModelClient(...)`, not reimplemented ad hoc.
3. Production mode uses the backend client when:
   - runtime backend mode requires it,
   - Function App base URL exists,
   - `getApiToken` exists.
4. Missing backend config/token seams degrade to the existing typed fallback posture rather than crashing.
5. No card component performs raw fetching directly.

## Required architecture

Prefer one of these two controlled patterns:

### Preferred pattern
Create an app-local runtime context/provider, for example:
- `MyWorkReadModelClientProvider`
- `useMyWorkReadModels(...)`
- or a similarly focused hook/context seam

that:
- owns client construction,
- loads required envelopes,
- exposes loading/result/error/readiness state.

### Acceptable alternative
Thread a single composed client through `MyDashboardApp → MyWorkShell → MyWorkSurfaceRouter`, provided the resulting surface data flow remains clean and testable.

Avoid scattering `createMyWorkReadModelClient(...)` calls across multiple cards/surfaces.

## Exact seams to inspect and likely touch

```text
apps/my-dashboard/src/MyDashboardApp.tsx
apps/my-dashboard/src/shell/MyWorkShell.tsx
apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts
apps/my-dashboard/src/config/runtimeConfig.ts
```

Create new files only if they materially improve composition clarity.

## Data loading expectations

At minimum, the runtime seam must support:

- loading `getMyWorkHome()` for the home/dashboard shell,
- loading `getAdobeSignActionQueue(...)` for the focused Adobe Sign module,
- preserving `getMyProjectLinks()` compatibility if the current repo already expects that provider shape elsewhere.

Use existing read-model envelope types from `@hbc/models/myWork`.

## State handling

Do not collapse every failure into a generic boolean. Preserve enough detail for Prompt 03 to map real envelope states to UI:

- `mode`
- `sourceStatus`
- `warnings`
- `generatedAtUtc`
- `data`

## Required tests

Add or update tests proving:

1. The production runtime constructs a backend-intent client when config/token seams are available.
2. The runtime safely falls back when:
   - no token callback,
   - no function app URL,
   - no backend-ready runtime config.
3. The app/shell no longer ignores `getApiToken`.
4. The data seam invokes existing client methods rather than bypassing them.

Tests may be unit-level around composition hooks/providers plus targeted shell/router integration tests.

## Validation commands

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

## Non-scope

- Do not yet convert card markup to live props in this prompt unless required minimally to prove data flow.
- Do not alter backend route contract.
- Do not alter OAuth token security.
- Do not remove fixture/back-end unavailable fallback behavior.

## Completion standard

Prompt 02 is complete only when the runtime can load My Work read-model envelopes in production/backend mode and expose those envelopes to the surface layer in a testable way.

## Agent Efficiency Directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
