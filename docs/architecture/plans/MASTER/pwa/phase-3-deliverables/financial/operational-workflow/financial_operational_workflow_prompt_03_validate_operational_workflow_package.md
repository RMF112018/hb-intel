# Financial Operational Workflow — Prompt 03
## Objective
Validate that the Financial operational workflow package is now production-operationally credible after implementation of runtime honesty and reconciliation/history/recovery workflows.

## Context
Prompts 01 and 02 should already be complete.
This is a validation and closure pass.
Do not expand scope into unrelated architecture work unless a tightly bounded defect prevents meaningful validation.

## Critical Guardrails
- Validate against actual changed files and actual behavior, not intentions.
- Do not overclaim operational completeness.
- Do not treat rendered UI as proof of operational safety.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Keep remediation tightly scoped to closure of real operational workflow gaps discovered in validation.

## Validation Scope
Validate that the updated Financial module now gives users trustworthy operational guidance in real conditions.

### Runtime honesty
- Can users clearly tell whether a Financial surface is live, stale, blocked, pending, editable, read-only, or failed?
- Is project / month / version / artifact context explicit?
- Is next-step ownership explicit?
- Are blockers and warnings operationally meaningful?

### Reconciliation / history / recovery
- Can users inspect meaningful session or workflow history where required?
- Are partial or failed operations traceable?
- Are sanctioned recovery paths visible?
- Are revise / reopen / resubmit / supersede flows understandable?

### Operational posture
- Do the Financial surfaces behave like governed workspaces rather than viewers or dashboards?
- Is the module fit for real monthly operation, not just happy-path demo behavior?

### Test coverage
- Are critical operational workflow states covered by tests?
- Do tests prove behavior for stale, blocked, failed, returned, reopened, resumed, and publish-eligibility conditions where applicable?

## Required Actions
1. Re-read the changed files as needed for validation.
2. Validate the end-to-end operational posture of the touched Financial surfaces.
3. Fix any final operational-state disclosure, recovery-path, or traceability gaps that materially undermine production readiness.
4. Summarize what is now operationally credible and what is still missing.
5. Produce a recommended next-step list limited to downstream categories such as:
   - acceptance / staging / release-readiness hardening
   - additional domain-specific workflow completion
   - deeper audit / notification / handoff integration

## Deliverables
1. final changed-files summary
2. operational workflow coherence verdict
3. production-operational readiness verdict for the touched scope
4. remaining operational gaps, if any
5. recommended next-step sequence

## Definition of Done
This prompt is complete only when:
- runtime honesty is visible and trustworthy,
- important Financial workflows expose meaningful reconciliation/history/recovery behavior,
- the touched scope behaves like a real governed operational workspace,
- remaining risk is explicitly documented,
- and the package is ready for downstream staging/readiness work.

## Output Format
Return:
1. objective completed
2. files changed
3. operational workflow coherence verdict
4. production-operational readiness verdict
5. remaining gaps
6. recommended next-step sequence
