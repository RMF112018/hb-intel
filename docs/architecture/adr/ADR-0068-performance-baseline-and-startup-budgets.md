# ADR-0068: Performance Baseline and Startup Budgets

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.15 (Performance Baseline and Startup Budgets)
- **Related Plans:** `docs/architecture/plans/PH5.15-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.15 requires explicit startup expectations before Phase 5 release. Locked Option C decisions require startup budgets to be treated as release criteria (not aspirational), while avoiding premature deep optimization work. Instrumentation must cover both PWA and SPFx preview startup seams with traceable diagnostics.

## Decision

1. Add centralized startup timing utilities in `@hbc/shell` (`packages/shell/src/startupTiming.ts`) with locked balanced budget profile:
   - `runtime-detection`: `100ms`
   - `auth-bootstrap`: `800ms`
   - `session-restore`: `500ms`
   - `permission-resolution`: `200ms`
   - `first-protected-shell-render`: `1500ms`
2. Use non-blocking enforcement:
   - no runtime throws on budget failures
   - explicit failure payloads through `StartupBudgetValidationResult` and `StartupTimingSnapshot`
   - release gating consumes diagnostics output.
3. Instrument startup phases at existing boundaries only:
   - runtime detection (`resolveCanonicalAuthMode`)
   - auth bootstrap/session restore (`authStore`, adapters, SPFx bootstrap seam)
   - permission resolution (`resolveGuardResolution`)
   - first protected shell render (`ShellCore` readiness boundary).
4. Expose optional shell diagnostics observer callback and startup timing exports through `@hbc/shell` entrypoints; keep auth integration behind a narrow bridge seam to preserve package boundaries.
5. Defer deep optimization/refactors and event-tier budget specialization to future phases; document deferment explicitly.

## Consequences

### Positive

- Startup expectations are explicit, measurable, and testable before release.
- Budget failures are visible without destabilizing runtime behavior.
- Both PWA and SPFx startup paths share one timing model and one validation surface.

### Tradeoffs

- Additional startup timing state/metadata increases shell/auth integration surface.
- Initial budgets may require recalibration as real production telemetry matures.

## Rejected Alternatives

1. **No explicit startup budgets in Phase 5:** rejected because release criteria would remain undefined.
2. **Throwing runtime errors on budget violations:** rejected because it creates user-impacting failures for an observability concern.
3. **Phase-by-phase deep optimization now:** rejected because scope is baseline + instrumentation, not broad refactor.

## Verification Evidence

- `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` (PASS, 2026-03-06)
- `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` (PASS, 2026-03-06)
- `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell` (PASS, 2026-03-06)
- `pnpm exec vitest run ...` targeted startup suite (BLOCKED by existing workspace Vite resolution issue: package-local `vite` import from `.vite-temp` configs)

## Traceability

- `docs/architecture/plans/PH5.15-Auth-Shell-Plan.md` §5.15 items 1-4
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` locked Option C release-criteria decisions
- `docs/architecture/plans/PH5.14-Auth-Shell-Plan.md` boundary continuity for SPFx-hosted startup instrumentation seams
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- Implementation alignment markers in code comments: D-04, D-07, D-10, D-12
