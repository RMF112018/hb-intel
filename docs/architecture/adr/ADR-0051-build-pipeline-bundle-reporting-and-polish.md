# ADR-0051: Build Pipeline, Bundle Reporting, and Polish Finalization

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 4b.17 (P2/P4)
- **Related Plans:** `docs/architecture/plans/PH4B.17-C-UI-Design-Plan.md`, `docs/architecture/plans/PH4B-C-UI-Design-Plan.md`

## Context

Phase 4b.17 requires deterministic build-pipeline hardening and regression protection for SPFx bundle size. Prior to this ADR, the bundle budget script existed but was not enforced as a first-class Turbo task and CI gate, and artifact-ignore policy/documentation needed final polish for P2/P4 closure.

## Decision

1. Add Turbo task `bundle-report` and scope it to SPFx bundle reporting via existing script `packages/spfx/scripts/report-bundle-size.mjs`.
2. Enforce the bundle-size budget in CI with a dedicated `Bundle Size Gate` job running `pnpm turbo run bundle-report --filter=@hbc/spfx`.
3. Normalize root `.gitignore` dist policy for app/library/function generated outputs.
4. Document Vercel policy as preview-only in `CLAUDE.md`.

## Implementation Notes

- `turbo.json`
  - Added `bundle-report` task with deterministic inputs and no outputs.
  - Tightened `build`, `lint`, and `check-types` task cache contracts (`inputs`/`outputs`) for clearer invalidation boundaries.
- `.github/workflows/ci.yml`
  - Added `bundle-size` job depending on `build`.
  - Added `bundle-size` to final CI gate dependency chain.
- `.gitignore`
  - Replaced broad `dist` ignore with explicit generated output patterns for `apps/*/dist/`, `packages/*/dist/`, and `backend/functions/dist/`.
- `packages/spfx/scripts/report-bundle-size.mjs`
  - Added explicit phase/gate documentation comments.
  - Clarified budget logging and failure diagnostics.
- Governance/docs
  - Updated PH4B.17-C and PH4B-C progress notes and remediation gates.
  - Updated blueprint and foundation plan comment-only progress trails.

## Consequences

### Positive

- Bundle-size regressions are now enforced by default in CI.
- Turbo execution is more cache-deterministic for core quality tasks.
- Artifact ignore behavior is explicit and easier to audit.
- Vercel usage policy is documented to avoid production deployment ambiguity.

### Tradeoffs

- CI now has an additional gate that can fail for legitimate size growth; such changes require explicit follow-up and justification.
- Turbo configuration is slightly more complex due to tighter input declarations.

## Verification Evidence

Executed on 2026-03-06:

- `pnpm turbo run build` ✅
- `pnpm turbo run check-types` ✅
- `pnpm turbo run lint` ✅ (0 errors)
- `pnpm turbo run bundle-report --filter=@hbc/spfx` ✅

This completes Phase 4b.17 P2/P4 bundle reporting and build-pipeline polish requirements.
