# ADR-0055: Dual-Mode Authentication Architecture

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.2 (Dual-Mode Authentication Architecture)
- **Related Plans:** `docs/architecture/plans/PH5.2-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.2 requires a typed, non-speculative dual-mode auth foundation that supports PWA and SPFx host environments while preserving one HB Intel product behavior. Existing apps still branch on legacy auth mode aliases (`msal`, `spfx`), so migration must avoid broad app churn while adopting canonical runtime naming.

## Decision

1. Introduce canonical runtime modes in `@hbc/auth`: `pwa-msal`, `spfx-context`, `mock`, and `dev-override`.
2. Keep a compatibility layer for legacy aliases (`msal`, `spfx`) during Phase 5.2 to prevent immediate breakage in app entrypoints.
3. Implement a typed `IAuthAdapter` contract and concrete adapters (`MsalAdapter`, `SpfxAdapter`, `MockAdapter`) with structured `AuthResult` outcomes.
4. Enforce structured authentication failure classification with required categories:
   - missing context
   - expired session
   - unsupported runtime
   - access validation issue
   - provider bootstrap failure
   - unknown fatal initialization failure
5. Normalize all provider identity output into a single session contract with mandatory fields (identity, provider reference, resolved roles, permission summary, runtime mode, timestamps, restore metadata, optional raw context).
6. Implement restore-policy evaluation that emits typed restore outcomes (`restored`, `reauth-required`, `invalid-expired`, `fatal`) and typed shell-status transition events.
7. Enforce production runtime auto-detection with explicit non-production override gating.

## Consequences

### Positive

- Centralized, typed auth seams reduce drift between PWA and SPFx runtime behavior.
- Structured failures improve diagnostics and deterministic recovery handling.
- Session normalization creates a stable contract for downstream guards, hooks, and shell state derivation.
- Compatibility mapping allows phased migration from legacy auth mode values.

### Tradeoffs

- Compatibility aliases add short-term complexity and must be retired in a follow-up phase.
- Existing callers using legacy branches remain functional but should migrate to canonical mode checks.

## Traceability

- `docs/architecture/plans/PH5.2-Auth-Shell-Plan.md` §5.2 items 1-8
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` §5.2 locked Option C decisions
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
