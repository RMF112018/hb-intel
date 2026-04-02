# Prompt-09 — Phase 11 Final Release Reconciliation and Closure

## Objective

Perform final Phase 11 reconciliation across code, docs, packaged artifact evidence, hosted-validation preparation, and unresolved questions so the repo ends the phase with one clear Accounting release posture.

This is the closure prompt. It should consolidate the work of Prompts 01–08 and state plainly what Phase 11 achieved, what remains blocked, and how the Accounting surface should now be classified.

## Critical Working Rules

- Treat Prompts 01–08 outputs as the evidence base.
- Do not re-read files already in current context or memory unless needed to confirm contradiction, capture exact evidence, or finalize the closure memo.
- Do not reopen settled questions without new evidence.
- If a prior audit finding was disproven during the phase, record the corrected conclusion clearly.
- Keep the final classification evidence-based and specific.

## Required Scope

Review at minimum:
- all Phase 11 outputs
- any changed auth/package/runtime docs
- the rebuilt Accounting artifact evidence
- the hosted staging validation readiness package
- any remaining open-risk items

## Required Work

1. Reconcile which original audit findings were:
   - confirmed
   - partially confirmed
   - disproven
   - superseded by implementation changes
2. State the final Accounting release classification.
3. Record any remaining blockers or external prerequisites.
4. Identify the exact next step after Phase 11:
   - further repo work
   - hosted staging execution
   - tenant/admin action
   - or release-candidate signoff

## Required Outputs

### 1. Create the final closure report at:
`docs/architecture/reviews/phase-11-accounting-spfx-reconciliation-closure-report.md`

The report must include:
- Executive Summary
- Original Finding Disposition Matrix
- Final Package/Repo Alignment Status
- Final Permission Contract Status
- Final Runtime Injection Status
- Final Hosted Dependency Status
- Final Shell Continuity Status
- Artifact Evidence Summary
- Hosted Validation Readiness Summary
- Remaining External Blockers
- Final Readiness Classification
- Recommended Next Action
- Exact Files Inspected

### 2. Create or update the phase-local final summary at:
`docs/architecture/plans/MASTER/spfx/accounting/phase-11/09-Phase-11-Closure-Summary.md`

### 3. Update the Phase 11 README or implementation summary if required so the phase package remains internally consistent.

## Hard Requirements

- Final classification must use one of:
  - not ready
  - staging-ready only
  - pilot-ready with blockers
  - production-ready with caveats
  - production-ready without material blockers
- Distinguish between repo-truth completion and external readiness.
- If hosted staging is the next required step, say so directly.

## Completion Standard

This prompt is complete only when the repo contains a final, evidence-based Phase 11 closure package that later release work can trust without re-auditing the same Accounting `.sppkg` ambiguities again.
