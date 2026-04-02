# Prompt 10 — Validation and Phase 3 Exit Reconciliation

## Objective

Run the final validation and phase-exit reconciliation for the Phase 3 privileged backend foundation.

This prompt exists to prove that the new backend substrate is wired correctly, boundary-safe, and accurately documented.

## Context efficiency rule

Do **not** re-read files that are still in your active context or memory unless they changed or this prompt explicitly requires a fresh comparison.

## Required repo-truth context

Read the smallest authoritative set necessary, including:

- the full set of Phase 3 docs created in this sequence
- the touched backend/functions files
- touched admin/provisioning/features-admin files if any
- `docs/reference/developer/verification-commands.md`
- `docs/architecture/blueprint/current-state-map.md` if updated in Prompt 09

## Scope of work

1. Validate the new host/composition-root registration.
2. Validate service-container/factory construction.
3. Validate route registration and auth wiring.
4. Validate handler / adapter / orchestration-bridge import-export integrity.
5. Validate any admin app seam changes if they were required.
6. Reconcile docs against final code.
7. Produce a formal Phase 3 validation report and exit summary.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-3/admin-control-plane-phase-3-validation-report.md`

The report must include:
- what was changed,
- what was validated,
- exact commands run,
- what was intentionally not run,
- known residual risks,
- and whether Phase 3 exit criteria are satisfied.

## Implementation requirements

- Use the smallest meaningful validation set that still proves backend integrity.
- Prefer targeted checks over wasteful broad workspace runs unless the actual changes justify broad verification.
- Be explicit about residual risk and any deferred later-phase work.

## Documentation requirements

- Cross-link the validation report to the Phase 3 summary docs and decision register.
- Make the exit assessment specific, not generic.

## Validation requirements

At minimum, consider the smallest relevant subset of:
- backend lint / typecheck / build commands
- focused host-boundary or route tests
- focused consumer checks in `apps/admin` if needed
- repo search to confirm no broken imports / stale route assumptions remain

Report:
- **Verified**
- **Not run**
- **Why this set**
- **Residual risk**

## Acceptance / completion conditions

This prompt is complete when:
- the repo has a final Phase 3 validation report,
- the reported verification set matches the real changes,
- and the repo can credibly claim a landed privileged backend foundation for later phases.

## No-go boundaries

- Do not claim production-hardening completeness that belongs to later phases.
- Do not hide failed or skipped checks.
- Do not leave unresolved doc/code contradictions unreported.
