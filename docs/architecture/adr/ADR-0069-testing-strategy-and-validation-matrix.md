# ADR-0069: Testing Strategy and Validation Matrix

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.16 (Testing Strategy and Validation Matrix)
- **Related Plans:** `docs/architecture/plans/PH5.16-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.16 requires a formal validation matrix that proves the auth/shell foundation works as one product across dual runtime modes and governance workflows. Locked Option C decisions also require explicit accessibility checks, performance/rerender checks, and automated boundary checks to reduce bypass risk.

## Decision

1. Add dedicated validation-matrix suites in `@hbc/auth` and `@hbc/shell` for required scenario coverage:
   - sign-in and restore by runtime mode
   - redirects and role landing
   - unauthorized and locked-navigation behavior
   - request-access presentation and governance workflow paths (approval, renewal, role review, emergency)
   - degraded mode, shell-status priority, sign-out cleanup, unsupported context, and dev/test mode override.
2. Add accessibility validations for shell navigation and status surfaces using deterministic semantic/ARIA and status-action contract checks.
3. Add performance/rerender validations around selector slice stability and shell transition readiness boundaries.
4. Add automated boundary checks for protected-feature registration enforcement and strict SPFx host seam constraints.
5. Execute verification gates for build/lint/type-check plus matrix test execution and capture results in phase documentation.

## Consequences

### Positive

- Validation coverage is consolidated into one formal matrix that maps directly to Phase 5 release criteria.
- Accessibility and boundary expectations are test-enforced instead of only documented.
- Performance/rerender guardrails are validated at stable store/transition seams.

### Tradeoffs

- Matrix-level tests overlap some existing targeted tests and increase suite size.
- Vitest execution currently uses an isolated config path for matrix runs due existing package-level Vite resolution constraints.

## Rejected Alternatives

1. **Relying only on existing unit tests without a formal matrix:** rejected because traceability to required Phase 5.16 scenarios would remain incomplete.
2. **Deferring accessibility/performance/boundary checks to later phases:** rejected because locked Option C requires these checks in Phase 5 readiness.
3. **Using only browser E2E for all matrix coverage:** rejected for Phase 5 because many governance and boundary scenarios are better validated at deterministic package seams.

## Verification Evidence

- `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` (PASS, 2026-03-06)
- `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` (PASS, 2026-03-06)
- `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell` (PASS, 2026-03-06)
- `pnpm exec vitest run --config /tmp/hb-intel-vitest.config.ts` (PASS, 6 files / 20 tests / 0 failures, 2026-03-06)

## Traceability

- `docs/architecture/plans/PH5.16-Auth-Shell-Plan.md` §5.16
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` locked Option C testing and release-validation decisions
- `docs/architecture/plans/PH5.15-Auth-Shell-Plan.md` (performance baseline continuity)
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- Implementation alignment tags in code comments: D-04, D-07, D-10, D-12
