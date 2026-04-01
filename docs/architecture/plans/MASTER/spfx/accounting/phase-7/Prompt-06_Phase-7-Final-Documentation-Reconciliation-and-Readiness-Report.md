# Prompt-06 — Phase 7 Final Documentation Reconciliation and Readiness Report

## Objective

Perform final reconciliation for Phase 7 so the repo contains a decision-ready, evidence-backed readiness package for security, connected services, and environment gating.

## Core instructions

- Treat the live repo as authoritative implementation truth.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Use official Microsoft documentation where platform/security behavior needs confirmation.
- Distinguish clearly between:
  - confirmed repo fact
  - confirmed repo-doc intent
  - confirmed Microsoft-documented requirement / best practice
  - inferred recommendation
  - unresolved dependency
- Keep scope constrained to this prompt’s task.

## Required work

1. Audit all docs and code updated by Prompts 01–05 against current repo truth.
2. Correct any drift, unresolved ambiguity, or contradictory statements left behind by earlier prompt execution.
3. Produce a final Phase 7 readiness report that summarizes: what is complete, what is tenant-dependent, what remains blocked, and what is ready for the next phase.
4. Confirm that the final package clearly distinguishes confirmed repo facts from doc intent and unresolved external dependencies.
5. Provide explicit closure recommendations and entry criteria for the next phase.

## Required outputs

- A final Phase 7 readiness report
- Reconciled and internally consistent documentation
- A clear entry-criteria statement for the next implementation phase

## Documentation / report targets to update

- `docs/architecture/reviews/project-setup-phase-7-final-readiness-report.md`

## Additional requirements

- This prompt is a closure prompt, not an excuse to reopen settled scope.
- Be rigorous about documenting any remaining external blockers.

