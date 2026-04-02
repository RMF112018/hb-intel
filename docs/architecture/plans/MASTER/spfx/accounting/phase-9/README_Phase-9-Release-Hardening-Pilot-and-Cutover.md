# Phase 9 — Release Hardening, Pilot, and Cutover

## Package Purpose

This is the revised canonical Phase 9 prompt set for the Accounting-side Project Setup release-hardening effort.

Phase 9 is a **release-governance and release-execution-readiness phase**. It is not a broad implementation phase. Its job is to turn the current repo state, test evidence, configuration posture, operational guidance, and external prerequisites into a credible release package that can support:

- staging validation
- controlled pilot
- production cutover planning
- rollback preparation
- post-cutover verification
- final go / no-go closure

## Canonical Copy Rule

Treat the repo-relative package path as canonical **only if the package has been committed there in the current workspace**:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-9/`

Do not hard-code workstation-specific paths in findings or final docs.  
If duplicate package copies exist in the current workspace, record them explicitly and name which one was audited.  
If the package only exists as an attached artifact or local working draft, say so directly.

## Authority Order

Every prompt in this package must use this authority order:

1. live repo code, tests, and runbooks
2. `docs/architecture/blueprint/current-state-map.md`
3. current living release / readiness / configuration / maintenance docs
4. prior phase outputs and historical plans as supporting evidence, not present-truth authority
5. official Microsoft platform guidance for staging slots, SPFx app-catalog deployment, API access approval, and related release mechanics

Use external platform guidance to shape safe deployment practice, but do not claim the target environment supports a feature unless repo evidence or documented manual verification supports that claim.

## Release-Readiness Baseline That Motivates Phase 9

The live repo already contains material release evidence and readiness context, including:

- current-state architecture and Wave 0 closeout status
- Project Setup host release-scope manifest
- Accounting review queue/detail verification
- Admin exception-path verification
- provisioning verification matrix
- operations and observability runbooks
- configuration registry and permission-path validation docs

Phase 9 must begin from that evidence instead of rediscovering readiness from scratch.

## Core Release-Governance Principle

Every major conclusion in this package must classify evidence as one of:

- **repo-proven** — clearly evidenced in code/tests/docs already in the repo
- **manual verification required** — supported by repo docs but must be checked in a real environment
- **externally blocked** — depends on tenant/admin/platform work outside the repo
- **deferred / out of scope** — intentionally not part of the current release path
- **not yet evidenced** — neither proved nor formally blocked yet

Do not blur these categories.

## Files In This Package

- `Accounting_Phase9_Prompt_Audit_Report.md`
- `Phase-9_Release-Hardening-Pilot-and-Cutover_Implementation-Plan.md`
- `Prompt-01_Phase-9-Repo-Truth-Release-Readiness-Audit.md`
- `Prompt-02_Phase-9-Staging-Deployment-and-Pre-Cutover-Validation.md`
- `Prompt-03_Phase-9-Pilot-Readiness-and-Controlled-User-Enablement.md`
- `Prompt-04_Phase-9-Production-Cutover-and-Rollback-Preparation.md`
- `Prompt-05_Phase-9-Post-Cutover-Verification-and-Hypercare-Readiness.md`
- `Prompt-06_Phase-9-Final-Release-Closure-and-Signoff-Report.md`

## Execution Progress

| Stage | Prompt | Status | Date | Output |
|-------|--------|--------|------|--------|
| 1 | Prompt-01 | **Complete** | 2026-04-02 | `docs/architecture/reviews/phase-9-release-readiness-audit.md` |
| 2 | Prompt-02 | **Complete** | 2026-04-02 | `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md` |
| 3 | Prompt-03 | **Complete** | 2026-04-02 | `docs/architecture/release/phase-9-pilot-readiness-and-controlled-user-enablement.md` |
| 4 | Prompt-04 | **Complete** | 2026-04-02 | `docs/architecture/release/phase-9-production-cutover-and-rollback-checklist.md` |
| 5 | Prompt-05 | **Complete** | 2026-04-02 | `docs/architecture/release/phase-9-post-cutover-verification-and-hypercare-plan.md` |
| 6 | Prompt-06 | **Complete** | 2026-04-02 | `docs/architecture/reviews/phase-9-final-release-closure-and-signoff-report.md` |

## Required Working Rules For Every Prompt

- Treat live repo truth as authoritative for implementation facts.
- Do not assume the current package language is correct just because it already exists.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Keep Phase 9 focused on release readiness, release evidence, deployment gating, pilot/cutover planning, and closure.
- Do not drift into broad feature implementation.
- Do not mark anything “ready” unless evidence supports it.
- Prefer updating existing authoritative docs and review artifacts over creating duplicate parallel docs.
- Do not treat recommended Azure or SharePoint practices as already available in the target environment unless that has been evidenced.
- Preserve the current workflow contract language:
  - submit
  - controller review
  - clarify / hold / approve
  - `ReadyToProvision`
  - backend auto-start
  - provisioning/runtime status visibility
  - admin exception handling

## Required Source Set

Every Phase 9 prompt should begin from the current evidence stack most relevant to release work, including as applicable:

- `docs/architecture/blueprint/current-state-map.md`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`
- `docs/reference/configuration/wave-0-config-registry.md`
- `docs/reference/configuration/sites-selected-validation.md`
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`

Also use official Microsoft guidance where platform behavior must be confirmed, especially for:

- Azure Functions staging slots and swap/rollback posture
- Azure Functions staging-before-production deployment practice
- SPFx app catalog deployment
- SharePoint API access approval for Entra-secured APIs

## Phase 9 Success Standard

Phase 9 is complete only when all of the following are true:

- the current release-readiness posture has been audited against repo truth
- staging validation requirements are explicit and executable
- pilot scope and decision thresholds are explicit
- cutover and rollback are defined against evidence, not hand-waving
- post-cutover verification and hypercare are aligned to real support docs
- repo-complete, staging-ready, pilot-ready, and production-ready are clearly distinguished
- external prerequisites are visible with owner, impact, and blocking stage
- the final closure report gives a credible go / no-go recommendation

## Execution Order

Execute the prompts in numeric order:

1. Prompt-01
2. Prompt-02
3. Prompt-03
4. Prompt-04
5. Prompt-05
6. Prompt-06

Do not skip order. Each prompt depends on the decisions, evidence, and classifications produced by the earlier prompts.
