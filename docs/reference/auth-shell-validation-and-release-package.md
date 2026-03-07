# Auth/Shell Validation Matrix and Release Package Reference

- **Status:** Canonical validation and release reference
- **Date:** 2026-03-06

## Dual-Mode Validation Matrix

Formal validation matrix includes required scenario categories:

- sign-in and session restore by runtime mode
- redirect restoration and role landing behavior
- unauthorized access and locked navigation presentation
- request-access and override lifecycle flows
- override expiration/renewal and role review flags
- emergency access path and post-review behavior
- degraded mode entry/exit and shell-status priority checks
- sign-out cleanup and unsupported/missing context handling
- controlled dev/test mode override behavior

Reference tests:

- `packages/auth/src/validation/dualModeValidationMatrix.test.ts`
- `packages/shell/src/validation/dualModeShellValidationMatrix.test.ts`
- `packages/auth/src/validation/performanceRerenderMatrix.test.ts`
- `packages/shell/src/validation/accessibilityAndBoundary.test.ts`

## Accessibility, Performance, and Boundary Checks

Phase 5 validation includes:

- shell navigation/status surface accessibility contract checks
- selector/rerender stability checks for auth/shell transitions
- boundary checks preventing shell/auth contract bypass

## Release Checklist Package

Canonical release gate document:

- `docs/architecture/release/PH5-final-release-checklist-and-signoff.md`

This checklist is the mandatory pass/fail gate and includes named sign-offs for:

- architecture owner
- product owner
- operations/support owner

## Required Verification Commands

- `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell`
- `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell`
- `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell`
- `pnpm exec vitest run --config /tmp/hb-intel-vitest.config.ts`

## Traceability

- Plans: PH5.15, PH5.16, PH5.17, PH5.18
- ADRs: ADR-0068, ADR-0069, ADR-0070, ADR-0071
