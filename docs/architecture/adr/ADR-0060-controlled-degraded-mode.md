# ADR-0060: Controlled Degraded Mode

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.7 (Controlled Degraded Mode)
- **Related Plans:** `docs/architecture/plans/PH5.7-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.7 requires degraded mode to be safe-by-default and tightly constrained. Degraded mode is allowed only for recently authenticated users that retain enough trusted last-known section state. During degraded operation, the shell must preserve the core frame and safe context, visibly communicate restricted zones plus freshness/validation state, and block sensitive/current-authorization-dependent operations. Recovery to fully connected mode must be explicit and observable in shell-status messaging.

## Decision

1. Add a centralized degraded-mode policy domain in `@hbc/shell` (`degradedMode.ts`) with deterministic resolvers for:
   - degraded eligibility (4-hour auth recency + trusted fresh section state requirement),
   - sensitive action blocking (write/approve/permission-change/current-auth-dependent/backend-validated),
   - restricted-zone state resolution,
   - safe recovery transition detection.
2. Extend shell-status section labeling so every visible cached section communicates:
   - freshness state,
   - validation state,
   - restricted/safe zone state.
3. Integrate policy resolvers in `ShellCore` to:
   - allow degraded mode only when eligible,
   - preserve shell frame while degraded (no frame replacement),
   - emit centralized restricted-zone/sensitive-action/recovery state callbacks,
   - surface explicit recovery messaging via unified shell-status state (`recovered`).
4. Keep locked Option C boundaries:
   - centralized shell-status signaling remains canonical,
   - section-level freshness labels remain shell-level metadata, not feature-owned status writes,
   - richer future sub-state contribution model is documented but intentionally not implemented.

## Consequences

### Positive

- Degraded-mode entry is constrained by explicit trust/freshness rules.
- Sensitive operations are blocked centrally with deterministic policy behavior.
- Operators and users receive clear section-level freshness/validation communication.
- Recovery to fully connected mode is explicit, consistent, and observable in the status rail.

### Tradeoffs

- Features must provide explicit action/zone metadata to fully participate in centralized degraded-mode enforcement.
- Additional shell policy surface area increases strict type/contracts that downstream shells must satisfy.

## Deferred Expansion Path

The phase intentionally does not implement richer multi-source sub-state contribution frameworks. Future phases may add:
- feature-owned sub-state contribution contracts,
- richer operation classes and action-level remediation guidance,
- telemetry-driven degraded-mode diagnostics and adaptive policy windows.

These remain documented future paths and are not part of Phase 5.7 implementation scope.

## Traceability

- `docs/architecture/plans/PH5.7-Auth-Shell-Plan.md` §5.7 items 1-6
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` §5.7 locked Option C decisions
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
