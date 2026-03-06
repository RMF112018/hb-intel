# ADR-0056: Central Auth / Session / Permission State

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.3 (Central Auth / Session / Permission State)
- **Related Plans:** `docs/architecture/plans/PH5.3-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.3 requires `@hbc/auth` to become the central, typed source of truth for auth lifecycle, normalized session, restore state, runtime mode, and authorization resolution. Existing consumers rely on legacy auth store fields, but the architecture now requires structured state, atomic actions, and shared permission evaluation APIs.

## Decision

1. Centralize auth/session truth in one Zustand store with typed lifecycle phases, restore state, structured error state, and shell bootstrap readiness flags.
2. Keep auth store actions atomic with explicit side-effect boundaries (provider SDK calls remain outside the store).
3. Publish shallow-subscription selector APIs for lifecycle, bootstrap readiness, session summary, and permission summary to reduce rerender cascades.
4. Add an adjacent permission-resolution layer (`resolveEffectivePermissions`, `isPermissionGranted`, `getPermissionResolutionSnapshot`) as the shared authorization truth API.
5. Permission resolution combines all required sources in deterministic order:
   - base role grants
   - default feature-action grants
   - explicit per-user overrides
   - expiring/temporary override state
   - emergency access state
6. Preserve temporary compatibility fields/actions (`currentUser`, `isLoading`, `error`, `setUser`, `setLoading`, `setError`, `clear`) while migrating consumers to canonical contracts.
7. Enforce anti-bypass policy: feature modules must consume shared permission APIs and must not compute authorization truth independently.

## Consequences

### Positive

- Authorization and session truth are centralized and typed.
- Selector and action contracts are explicit and maintainable.
- Shared permission APIs reduce feature-level drift and inconsistent access checks.
- Structured restore/error states improve shell/guard orchestration reliability.

### Tradeoffs

- Compatibility shims add short-term complexity.
- Full anti-bypass enforcement still depends on follow-up lint/governance guardrails across feature packages.

## Traceability

- `docs/architecture/plans/PH5.3-Auth-Shell-Plan.md` §5.3 items 1-7
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` §5.3 locked Option C decisions
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
