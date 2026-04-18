Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Critical operating instruction:
Do not re-read files that are already in your current context or memory unless needed to resolve uncertainty or verify drift.

Execution standard:
This prompt is part of a multi-prompt package. Stay tightly scoped to this prompt, but do whatever is required inside scope to reach a real finished state. Do not defer required work. If a boundary, diagnostic, or validation item is necessary for this prompt to be complete, address it now.

Objective:
Finish the integration only when wrapper ownership, shell-boundary integrity, page-canvas truth, and responsive comfort are all provable.

Inspect first:
- the wrapper runtime files created/updated in Prompts 01–02
- the semantics/doc files updated in Prompt 03
- the cutover/proof tooling from Prompt 04
- existing hbHomepage tests and visual proof seams
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/entryStackPolicy.test.ts`
- any existing snapshot / harness / verification patterns already used in the repo that are directly relevant

Current issue:
The prior package did not set a strong enough closure bar. This work must not close on:
- JSX render only
- manual eyeballing only
- docs only
- package build only

Required implementation:
1. Add automated proof for wrapper order.
   - Verify embedded rail region renders before shell region.
2. Add proof that the shell did not absorb the rail as an occupant.
   - This can be test-based, grep-based validation in report, or both.
3. Ensure wrapper data attributes or diagnostics make ownership/order machine-checkable.
4. Add or update visual proof for key responsive states where the harness permits.
5. Include page-canvas proof results from Prompt 04 in the final closure report.
6. Run lint/typecheck/tests for touched packages and capture results.

Minimum visual proof set:
- standard-laptop
- tablet landscape
- tablet portrait
- narrow / phone-like width
- short-height constrained state if supported by the harness

Acceptance criteria:
- automated order proof exists
- wrapper ownership is machine-checkable
- no shell-occupant migration slipped in
- visual proof confirms no obvious width/spacing regression
- page-canvas proof confirms no duplicate action layer
- final closure report is concise but complete

Required final deliverables in your response:
1. concise summary
2. file-by-file change list
3. commands used
4. automated validation performed and results
5. visual proof summary
6. page-canvas proof summary
7. residual risks only if truly outside scope and narrowly bounded

What done looks like:
A reviewer can verify, without guesswork, that:
- `PriorityActionsRail` is wrapper-owned on the flagship homepage,
- the shell remains a shell,
- the real homepage page canvas is in the right state,
- and the integration is stable enough to close.
```