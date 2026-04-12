# Prompt 08 — Final Validation and Closure

## Active finding
End-to-end closure validation for the HB Kudos audit package.

This is the **only active remediation topic** for this prompt. Do not work on any other audit finding in parallel.

## Repo and branch
- Repo: `https://github.com/RMF112018/hb-intel.git`
- Branch: `main`

## Governing authority
Primary binding doctrine:
1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Supporting authority:
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`
- `apps/hb-webparts/.eslintrc.cjs`

## Mandatory working posture
- Treat this finding as unresolved until it is **fully closed**.
- Perform an **exhaustive scrub** of the complete repo-truth footprint associated with this finding.
- Do **not** apply superficial fixes.
- Do **not** stop when the most visible symptom improves.
- Do **not** re-read files that are still within your current context or memory.
- Preserve strong existing architecture unless this prompt explicitly directs structural replacement.
- Do not declare success until you can prove the defect is gone everywhere in the relevant footprint.

## Why this finding matters
The package only succeeds if every prior finding is actually closed and the final state is stable, doctrine-aligned, and production-ready.

## In-scope footprint to start from
- all files touched by prompts 01–07
- `apps/dev-harness/src/harness/kudosHarness.ts`
- `e2e/webparts/kudos/`
- manifest/package seams
- doctrine/benchmark docs used as validation criteria

You must expand from these seed files to every directly and indirectly related file needed to fully close the finding.

## Required work
1. Validate each prior finding against repo truth, not intention.
2. Run/update the hosted Kudos Playwright lane and confirm the critical flows still pass.
3. Re-check doctrine compliance for:
   - import discipline
   - token discipline
   - accessibility semantics
   - host-aware behavior
   - manifest intent
4. Produce a concise closure report mapping each finding to the exact files and proof points that closed it.
5. Identify any residual gap honestly; do not overstate closure.

## Non-negotiables
- Do not rubber-stamp the package.
- Do not say “validated” unless the evidence is real.
- Do not merge residual gaps into vague future-work language; name them explicitly if they remain.

## Closure proof required before you stop
You must provide:
1. the full list of files touched
2. why each touched file was in scope
3. what stale / redundant / contradictory code was removed
4. what replaced it
5. what remains intentionally unchanged
6. why the original finding is now 100% closed in the audited footprint

## Deliverables
- code changes
- any necessary test/harness updates
- any necessary docs/comments updates
- a concise closure summary tied to the finding only
