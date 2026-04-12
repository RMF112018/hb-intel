# Prompt 07 — Static Guardrails and Doctrine-Drift Prevention

## Active finding
The repo has strong hosted interaction tests but weaker static guardrails against doctrine/token drift.

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
The current regression profile shows that interactive correctness and doctrine correctness can diverge. The repo needs static protection against reintroducing raw literals and other homepage policy drift.

## In-scope footprint to start from
- `apps/hb-webparts/.eslintrc.cjs`
- any repo scripts / lint / validation seams appropriate for homepage webparts
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`
- relevant package.json / CI-facing seams if needed
- kudos webpart family files used as the first enforcement target

You must expand from these seed files to every directly and indirectly related file needed to fully close the finding.

## Required work
1. Add static validation that detects prohibited ordinary-source literals or equivalent doctrine drift in the Kudos webpart family.
2. Preserve existing import-discipline linting and extend guardrails rather than replacing them.
3. Keep the checks practical and maintainable.
4. Update docs/benchmarks as needed so the enforcement rule and the written standard agree.
5. Ensure the new guardrails are explicit enough that the same drift does not quietly re-enter later.

## Non-negotiables
- Do not rely only on manual review.
- Do not add a brittle one-off script with no clear ownership.
- Do not make the rule so broad that it produces unmanageable false positives.

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
