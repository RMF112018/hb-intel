# Prompt-10 — Tests, Docs, and Phase 11 Exit Reconciliation

## Objective

Finish Phase 11 by reconciling the implementation, tightening docs, validating the changed scope, and producing the official exit artifact.

## Important execution rules

- Do not introduce major new feature work here.
- Use this prompt to fix contradictions, fill documentation gaps, and prove completion.
- Use the smallest meaningful validation set that credibly covers the touched implementation.

## Required work

### A. Documentation reconciliation
Review and align:
- all new Phase 11 docs,
- any touched local READMEs,
- and any touched admin architecture docs.

Ensure no contradiction remains around:
- package placement,
- risk tiers,
- preview vs dry-run semantics,
- confirmation requirements,
- validation evidence,
- provisioning straight-through exceptions,
- first-adopter scope.

### B. Validation
Run the smallest credible validation set for all touched packages.

Likely candidates:
- `pnpm --filter @hbc/models lint`
- `pnpm --filter @hbc/models check-types`
- `pnpm --filter @hbc/ui-kit lint`
- `pnpm --filter @hbc/ui-kit check-types`
- `pnpm --filter @hbc/ui-kit test`
- `pnpm --filter @hbc/features-admin lint`
- `pnpm --filter @hbc/features-admin check-types`
- `pnpm --filter @hbc/features-admin test`
- `pnpm --filter @hbc/functions check-types`
- `pnpm --filter @hbc/functions test`
- `pnpm --filter @hbc/spfx-admin lint`
- `pnpm --filter @hbc/spfx-admin test`
- `pnpm --filter @hbc/spfx-admin build`
- `pnpm format:check`

Run only the subset justified by the touched scope, but be credible.

### C. Exit artifact
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-exit-reconciliation.md`

## Required sections in the exit artifact

1. **What changed**
2. **Implemented deliverables vs planned deliverables**
3. **Validation actually run**
4. **Known residual gaps**
5. **Deferred follow-up items**
6. **Phase 11 acceptance-criteria checklist**
7. **Recommended next-phase handoff notes**

## Required honesty rules

- Report what was actually validated, not what was hoped.
- If a dependency gap forced a minimal seam instead of an ideal implementation, say so clearly.
- If certain first-adopter actions were deferred, explain exactly why.

## Completion condition

Stop when:
- the implementation is internally consistent,
- docs are aligned,
- validation is complete,
- and the exit artifact makes the phase status clear to the next agent or developer.
