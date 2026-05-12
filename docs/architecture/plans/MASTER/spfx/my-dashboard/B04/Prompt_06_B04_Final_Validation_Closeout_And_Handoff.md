# Prompt 06 — B04 Final Validation, Closeout, and Handoff

## 1. Objective

Perform the final B04 validation pass, document the implemented repo truth, and produce a closeout suitable for the user’s commit/handoff workflow.

## 2. Why this work exists

B04 is a foundational data-contract batch. The final prompt must prove the implementation is complete, narrowly scoped, and ready for downstream B05/B07 work without leaving ambiguous claims or hidden blockers.

## 3. Current repo-truth problem or gap

A completed set of code changes is not self-validating. Without a disciplined closeout, it is easy to miss route drift, fixture gaps, app-scaffold dependencies, or unintentional cross-batch scope creep.

## 4. Attached B04 authority / plan basis

Use the attached **B04 — My Work Read Models, Routes, Error Taxonomy, and Fixture Architecture Development** artifact as the authoritative batch plan. Preserve these closed decisions:

Close against the B04 package support docs:
- README
- implementation plan
- target contracts/route map
- validation guide
- gap register

Preserve the B04 scope boundary:
- contracts,
- fixtures,
- client seam,
- backend read-model host/routes,
- validation,
and nothing beyond that.

## 5. Exact files, folders, docs, and symbols to inspect

Inspect:
- all files changed by Prompts 01–05,
- `git diff --stat` / working-tree posture,
- package validation outputs,
- B04 gap register to confirm every item is closed or explicitly blocked by a prerequisite absent from the working tree.

## 6. Required implementation outcome

Produce a final closeout message that reports:
- verdict,
- changed-file families,
- tests and type checks,
- exact blockers if any,
- residual handoff notes to B05/B07,
- recommended commit summary if the user’s workflow expects one.

## 7. Detailed change instructions

1. Run the full applicable validation matrix from `03_B04_Validation_And_Closeout_Requirements.md`.

2. Confirm no dependency or lockfile changes occurred unless explicitly necessary and explained.

3. Reconcile the B04 gap register:
   - mark each gap as closed,
   - or identify the exact prerequisite blocker, such as absent B02/B03 app scaffold in the current working tree.

4. Summarize changed files grouped by:
   - models,
   - fixtures,
   - app client,
   - backend routes/providers,
   - tests.

5. State the final B04 implementation verdict:
   - PASS,
   - PARTIAL due to documented prerequisite blocker,
   - FAIL.

6. Confirm scope guardrails:
   - no Adobe OAuth/provider implementation,
   - no direct Adobe SPFx calls,
   - no cross-user routes,
   - no new broad personal-work platform,
   - no one-off Problem Details response format.

7. If the user’s local-agent workflow expects a commit suggestion, include a concise subject and bullet summary, but do not actually commit unless explicitly instructed.

## 8. What done looks like

Done means:
- the final closeout is specific and evidence-backed,
- all applicable validations have been run,
- any blockers are precise rather than vague,
- the repo is demonstrably ready for B05/B07 follow-on implementation.

## 9. Strict constraints / prohibitions

- Do not introduce new code changes except minor closeout-required fixes revealed by validation.
- Do not hide blockers.
- Do not declare PASS if a prerequisite-blocked prompt was not executable.
- Do not claim hosted SharePoint evidence; that belongs later.

## 10. Validation requirements

Run and report exact results for all applicable commands:
```text
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

If app scaffold exists:
```text
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

## 11. Proof of closure

Provide:
- final gap-register resolution,
- validation matrix,
- working-tree status,
- exact residual blocker list if any,
- downstream handoff to B05/B07.

## 12. Commit / closeout expectations

Return the final B04 closeout in a compact but complete format suitable for the user to paste back into ChatGPT for the next audit step.

## 13. Do not re-read files already in active context unless needed to confirm drift

Do not re-read files that are still available in your active context or memory unless you need to confirm repo drift, resolve a conflict, or verify an implementation detail that cannot be trusted from the current context.
