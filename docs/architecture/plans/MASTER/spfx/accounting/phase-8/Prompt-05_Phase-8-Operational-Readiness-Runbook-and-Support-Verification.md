# Prompt-05 — Phase 8: Operational Readiness, Runbook, and Support Verification

## Objective

Verify that the Project Setup workflow is operationally supportable and that runbooks, maintenance guidance, and troubleshooting documentation accurately reflect live repo behavior.

## Required working approach

1. Audit and reconcile operational documentation including, where relevant:
   - provisioning runbooks
   - observability runbooks
   - troubleshooting docs
   - verification matrices
   - any phase readiness or supportability reports

2. Ensure the documentation reflects actual repo behavior for:
   - diagnosing failed or stuck runs
   - routing failures from Accounting to Admin
   - retry / escalation / archive actions
   - status-truth and polling / SignalR expectations
   - environment-dependent operational prerequisites

3. Update the relevant docs to match repo truth.

4. Update progress and evidence in:
   - `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

## Required outputs

- reconciled runbooks and support docs
- explicit statement of operational readiness strengths and remaining weaknesses
- evidence-backed supportability conclusions

## Rules

- Prefer correcting docs to match implemented truth rather than writing aspirational guidance.
- Be explicit wherever the repo still requires environment-gated verification outside local/test execution.
