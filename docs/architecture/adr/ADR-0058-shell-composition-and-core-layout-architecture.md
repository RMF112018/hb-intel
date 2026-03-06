# ADR-0058: Shell Composition and Core Layout Architecture

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.5 (Shell Composition and Core Layout Architecture)
- **Related Plans:** `docs/architecture/plans/PH5.5-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.5 requires one shared HB Intel shell core with strictly bounded responsibilities, environment-specific behavior through explicit extension points only, centralized shell-mode rule enforcement, safe redirect restoration with role-appropriate landings, and full sign-out cleanup governance. The shell must not absorb feature/business logic.

## Decision

1. Introduce `ShellCore` as the orchestration boundary for:
   - bootstrap/init framing
   - auth-aware layout composition
   - navigation frame composition
   - shell-status slot composition
   - route enforcement extension seam
   - degraded/recovery/access-denied surface selection
   - workspace persistence coordination
2. Keep `ShellLayout` presentational-only and move orchestration decisions into `ShellCore`.
3. Define approved environment extension contracts in `@hbc/shell` types for:
   - runtime environment identity (`pwa`, `spfx`, `hb-site-control`, `dev-override`)
   - route enforcement callback
   - environment artifact cleanup callback
   - retention-tier feature cache cleanup callback
4. Add centralized shell-mode rule resolution (`resolveShellModeRules`) and prohibit ad hoc mode branching in feature modules.
5. Add redirect memory utilities with safe-redirect policy and mode-aware restore checks.
6. Add role-appropriate landing fallback resolution in shell core orchestration.
7. Implement deterministic sign-out cleanup orchestration API to clear:
   - auth/session state
   - redirect memory
   - shell bootstrap/core state
   - environment artifacts
   - feature cache tiers (`strict`, `standard`, `preserve-session` hooks)
8. Add unit tests for shell mode rules, redirect safety/restore logic, cleanup ordering, and experience-state resolution.

## Consequences

### Positive

- Shell behavior is centralized and consistent across runtime environments.
- Environment-specific differences remain bounded to approved extension seams.
- Sign-out cleanup policy becomes deterministic and auditable.
- Safe redirect restore and role landing behavior reduce unsafe navigation outcomes.

### Tradeoffs

- Adapter implementers must provide cleanup and enforcement hooks explicitly.
- Shell core now coordinates more orchestration logic, requiring strong boundary discipline to avoid future feature leakage.

## Deferred Expansion Paths

Phase 5.5 intentionally leaves these as explicit future extensions:
- richer multi-message shell-status hierarchy beyond slot-driven composition
- expanded degraded-mode telemetry/analytics surfaces
- advanced per-feature cache retention controls beyond tier hooks
- fuller admin-facing shell diagnostics UI

## Traceability

- `docs/architecture/plans/PH5.5-Auth-Shell-Plan.md` §5.5 items 1-7
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` locked Option C shell decisions:
  - one shared core shell
  - narrow shell boundary
  - centralized rule enforcement
  - extension points only
  - safe degraded/recovery handling
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
