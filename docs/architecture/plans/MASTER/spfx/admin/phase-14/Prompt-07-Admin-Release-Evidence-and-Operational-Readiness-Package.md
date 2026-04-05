# Prompt 07 — Admin Release Evidence and Operational Readiness Package

## Objective

Produce the documentation and validation evidence required for production deployment, support, rollback, and release governance of the remediated Admin SPFx package.


## Non-Negotiable Working Rules

- Do not re-read files that are already in your current context or memory unless needed to verify a contradiction, confirm exact wording, inspect a newly changed file, or capture exact evidence for a report.
- Do not make assumptions about the package, build, or runtime contract. Prove every material conclusion.
- Distinguish clearly between:
  1. confirmed package fact
  2. confirmed repo fact
  3. confirmed doc intent
  4. inferred recommendation
  5. unresolved issue
- Prefer narrow, high-signal code changes over broad speculative edits.
- Do not collapse multiple unresolved root-cause areas into one mixed remediation step.
- Preserve forensic traceability from finding → code change → regenerated artifact → validation evidence.


## Required Tasks

1. Create a release evidence package for the Admin SPFx surface covering:
   - package provenance
   - packaging commands
   - package inventory
   - runtime contract
   - auth/API permission posture
   - production config requirements
   - deployment steps
   - smoke tests
   - rollback steps
   - support diagnostics
2. Reconcile Admin README and current-state docs wherever the remediation changed truth.
3. Produce a clear operator/deployer runbook for app-catalog deployment and initial verification.

## Deliverables

Create or update:

- `phase-14/release/admin-release-evidence-package.md`
- `phase-14/release/admin-deployment-runbook.md`
- `phase-14/release/admin-smoke-test-checklist.md`
- `phase-14/release/admin-rollback-plan.md`
- any current-state docs that must be updated to remain truthful

## Hard Gates

This prompt is not complete unless:
- release, deployment, support, and rollback evidence all exist
- docs match the remediated implementation
- a deployment team could execute the release without tribal knowledge

## Required Final Report

Return:
- all release evidence created
- every current-state doc updated
- any remaining non-blocking follow-up items
