# Phase 9 — Release Hardening, Pilot, and Cutover

## Purpose

This package guides the local code agent through the final phase required to move the Accounting app and connected Project Setup / provisioning workflow from implementation-ready state to controlled production release.

Phase 9 assumes Phases 1 through 8 are already complete or materially complete:
- workflow contract and boundary freeze
- backend lifecycle hardening
- Accounting app functional completion
- provisioning status and saga interaction hardening
- Admin exception-path integration
- data contract and SharePoint schema hardening
- security / connected services / environment readiness
- reliability, testing, and operational readiness

This phase is focused on:
- release gating
- staging validation
- production deployment readiness
- pilot execution
- cutover
- rollback preparedness
- final signoff evidence

## Package contents

- `Phase-9_Release-Hardening-Pilot-and-Cutover_Implementation-Plan.md`
- `Prompt-01_Phase-9-Repo-Truth-Release-Readiness-Audit.md`
- `Prompt-02_Phase-9-Staging-Deployment-and-Pre-Cutover-Validation.md`
- `Prompt-03_Phase-9-Pilot-Readiness-and-Controlled-User-Enablement.md`
- `Prompt-04_Phase-9-Production-Cutover-and-Rollback-Preparation.md`
- `Prompt-05_Phase-9-Post-Cutover-Verification-and-Hypercare-Readiness.md`
- `Prompt-06_Phase-9-Final-Release-Closure-and-Signoff-Report.md`

## Execution order

Run the prompts in numeric order:
1. Prompt-01
2. Prompt-02
3. Prompt-03
4. Prompt-04
5. Prompt-05
6. Prompt-06

Do not skip ahead unless the prior prompt explicitly records that its acceptance criteria are satisfied.

## Global instructions for the code agent

- Start from repo truth, not prior assumptions.
- Do not re-read files that are still within your current context or memory.
- Prefer updating existing authoritative docs rather than creating duplicate guidance.
- Where deployment or tenant work cannot be completed from code, document it explicitly as an external prerequisite with owner, dependency, and blocking impact.
- Preserve the Accounting / Admin / backend responsibility boundaries established in earlier phases.
- Treat release readiness as evidence-driven. Do not mark items complete without repo evidence or documented manual verification steps.
- Keep all new or updated documentation crisp, implementation-oriented, and auditable.

## Expected outputs from the phase

By the end of Phase 9, the repo should contain:
- an updated release-readiness view grounded in repo truth
- a staging validation checklist and evidence
- a pilot execution and enablement plan
- a production cutover / rollback checklist
- a post-cutover verification + hypercare plan
- a final closure report with explicit go / no-go language and remaining risks
