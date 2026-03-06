# ADR-0061: Guards, Redirects, and Recovery Surfaces

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.8 (Guards, Hooks, Redirects, and Recovery Surfaces)
- **Related Plans:** `docs/architecture/plans/PH5.8-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.8 requires HB Intel to centralize protected-content guard behavior, prevent protected render before guard decisions resolve, and provide deterministic redirect + recovery surfaces across dual runtime modes. It also requires a simple in-app request-access submission seam into the admin review queue without overbuilding future governance workflows.

## Decision

1. Implement centralized guard resolution in `@hbc/auth` (`resolveGuardResolution`) with strict precedence:
   - runtime/environment support
   - authentication/reauth lifecycle
   - role access
   - permission access
2. Implement `ProtectedContentGuard` as the canonical pre-render boundary that:
   - evaluates centralized guard outcomes before children render,
   - selects dedicated recovery/access surfaces for each failure class,
   - captures intended redirect destination only for auth/reauth failures.
3. Expand shared hooks:
   - `@hbc/auth`: current session, resolved runtime mode, permission evaluation.
   - `@hbc/shell`: shell-status state and degraded visibility rules.
4. Extend redirect utilities to include:
   - intended-destination capture (`captureIntendedDestination`),
   - safe post-guard restore with role-landing fallback (`resolvePostGuardRedirect`).
5. Provide dedicated recovery surfaces:
   - bootstrap/loading
   - session restore
   - access denied
   - expired session/reauth required
   - unsupported runtime
   - fatal startup failure
6. Extend request-access flow with typed in-app submission seam:
   - `RequestAccessSubmission`
   - `AccessRequestSubmitter`
   - response contract for queue integration.

## Consequences

### Positive

- Guard behavior is deterministic and centralized across apps and runtimes.
- Protected content cannot render before required guard checks are complete.
- Redirect recovery is safe and predictable, with explicit fallback behavior.
- Recovery states are clearly communicated through dedicated surfaces.
- Request-access entry supports immediate Phase 5 operations without coupling to a full admin workflow UI.

### Tradeoffs

- Consumers must adopt centralized guard/hook contracts to avoid duplicate local logic.
- Request-access remains a minimal boundary seam in this phase and does not include advanced tracking UI.

## Deferred Expansion Path

Phase 5.8 intentionally defers:
- multi-step request tracking UX and threaded reviewer comments,
- richer policy-driven redirect context composition,
- advanced recovery diagnostics and telemetry surfaces.

These remain documented extension paths for later phases.

## Traceability

- `docs/architecture/plans/PH5.8-Auth-Shell-Plan.md` §5.8 items 1-6
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` §5.8 locked Option C decisions
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
