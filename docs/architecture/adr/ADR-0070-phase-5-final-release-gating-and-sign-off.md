# ADR-0070: Phase 5 Final Release Gating and Sign-Off

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.17 (Release Gating and Sign-Off)
- **Related Plans:** `docs/architecture/plans/PH5.17-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5 requires formal release gating and named accountability before production release. Locked Option C decisions explicitly require a pass/fail release checklist and captured sign-offs from architecture, product, and operations/support owners. Phase 5.16 already established the validation matrix and supporting evidence; Phase 5.17 must convert those outcomes into a mandatory release package decision gate.

## Decision

1. Establish one canonical Phase 5 release package artifact:
   - `docs/architecture/release/PH5-final-release-checklist-and-signoff.md`
2. Treat the checklist as a hard production gate with explicit pass/fail criteria covering:
   - architecture compliance
   - `@hbc/auth` + `@hbc/shell` completeness
   - dual-mode validation matrix status
   - degraded-mode safety
   - audit/retention readiness
   - admin operability
   - documentation completion
   - known-issues review
   - startup performance budget results
3. Require named approvals from all three roles before release is considered complete:
   - architecture owner
   - product owner
   - operations/support owner
4. Mark final Phase 5 acceptance as complete only when all three acceptance layers are closed:
   - Layer 1: Feature Completion
   - Layer 2: Outcome Validation
   - Layer 3: Operational Readiness
5. Record final verification evidence (build/lint/type-check/validation matrix) in both the release package and phase documentation.

## Consequences

### Positive

- Production release is blocked until objective criteria and accountable approvals are captured.
- Phase 5 completion becomes auditable end-to-end across implementation, validation, and operations readiness.
- Final acceptance criteria align directly with locked Option C governance requirements.

### Tradeoffs

- Release process now includes additional documentation overhead.
- Sign-off capture cadence depends on owner responsiveness.

## Rejected Alternatives

1. **Engineering-intuition release decision without formal gate artifact:** rejected due insufficient governance and auditability.
2. **Checklist without named role approvals:** rejected because ownership/accountability would remain ambiguous.
3. **Sign-off-only process without explicit pass/fail technical criteria:** rejected because approval would lack objective gate evidence.

## Verification Evidence

- `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` (PASS, 2026-03-06)
- `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` (PASS, 2026-03-06)
- `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell` (PASS, 2026-03-06)
- `pnpm exec vitest run --config /tmp/hb-intel-vitest.config.ts` (PASS, 2026-03-06)

## Traceability

- `docs/architecture/plans/PH5.17-Auth-Shell-Plan.md` §5.17
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` locked Option C release-gating/sign-off decisions and Final Phase 5 Definition of Done
- `docs/architecture/plans/PH5.16-Auth-Shell-Plan.md` validation matrix continuity
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- Implementation alignment markers in code/docs: D-04, D-07, D-10, D-12
