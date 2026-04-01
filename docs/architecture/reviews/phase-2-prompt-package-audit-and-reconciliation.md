# Phase 2 Prompt Package Audit And Reconciliation

## 1. Executive Summary

The Phase 2 prompt package was **partially sound** at the start of this audit.

It already had the correct broad intent:

- backend lifecycle hardening
- launch-contract remediation
- validation/idempotency hardening
- run/status supportability
- Accounting compatibility verification
- final documentation reconciliation

It needed substantive correction, however, because a fresh agent could still mis-execute it in several ways:

- it did not clearly enforce authority order between live repo truth, current-state docs, living refs, and PH6/MVP history
- it still pointed too naturally at PH6-era workflow plans without explicitly downgrading them
- it treated some lifecycle options as equally ungrounded even though current repo truth already favors one starting model
- it referenced a report path that does not yet exist without saying that the file is a deliverable
- some verification commands were invalid for current package scripts

The package is now materially safer to execute as an implementation-forward Phase 2 backend hardening package.

## 2. Repo-Truth Alignment Findings

### What Was Already Aligned

- The package already scoped Phase 2 toward backend hardening rather than broad frontend redesign.
- The prompt order was directionally correct: audit, contract remediation, validation/idempotency, run/status hardening, compatibility verification, closure.
- The package correctly recognized `ReadyToProvision`, `Provisioning`, `AwaitingExternalSetup`, idempotency, and Accounting compatibility as the main concerns.

### What Was Misaligned

- The package did not strongly route agents to current living refs such as:
  - `docs/reference/spfx-surfaces/controller-review-surface.md`
  - `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
  - `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
  - `docs/reference/provisioning/state-machine.md`
  - `docs/reference/provisioning/saga-steps.md`
  - `docs/reference/developer/project-setup-connected-service-posture.md`
- Prompt-02 still framed lifecycle options too symmetrically even though the repo already auto-triggers at `ReadyToProvision`.
- Prompt-03 risked overstating current backend uniqueness enforcement by not distinguishing request lifecycle enforcement from later activation-layer duplicate detection.
- Prompt-04 was too easy to read as if request/run/status and admin recovery APIs were largely absent, which is no longer true.
- Prompt-05 included an invalid verification command because `@hbc/spfx-accounting` has no `check-types` script.
- Prompt-06 did not strongly classify historical PH6/MVP docs as non-peer authorities.

### Repo Facts That Required Changes

- `backend/functions/src/functions/projectRequests/index.ts` currently auto-starts the saga when a request advances to `ReadyToProvision`.
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` reconciles the request into `Provisioning`.
- `packages/provisioning/src/api-client.ts` already exposes:
  - `listProvisioningRuns`
  - `retryProvisioning`
  - `archiveFailure`
  - `acknowledgeEscalation`
  - `forceStateTransition`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md` and current code already place admin recovery behavior well beyond what some older docs imply.
- `docs/maintenance/provisioning-runbook.md`, `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`, and `docs/architecture/plans/PH6.11-Accounting-App.md` still contain stale or pre-admin-recovery language that should be treated as drift evidence.
- `docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md` is referenced across the package but does not yet exist, so Prompt-01 must create it.

## 3. Prompt-By-Prompt Change Log

### `docs/architecture/plans/MASTER/spfx/accounting/phase-2/README_Phase-2-Backend-Lifecycle-Hardening.md`

- Changed:
  - added canonical-copy statement
  - added explicit authority order
  - added current repo-truth baseline
  - clarified that the Phase 2 report is an expected deliverable, not a missing defect
- Why:
  - the README needed stronger routing and more accurate present-state framing
- Change type:
  - corrective
  - strengthening

### `docs/architecture/plans/MASTER/spfx/accounting/phase-2/Phase-2_Backend-Lifecycle-Hardening_Implementation-Plan.md`

- Changed:
  - rewrote phase framing around current repo truth
  - kept Phase 2 implementation-forward
  - added stronger current-source set and clearer distinction between present truth and PH6 drift
- Why:
  - the plan needed to prevent backend hardening work from restarting from outdated workflow assumptions
- Change type:
  - corrective
  - strengthening

### `docs/architecture/plans/MASTER/spfx/accounting/phase-2/Prompt-01_Phase-2-Backend-Lifecycle-Repo-Truth-and-Gap-Audit.md`

- Changed:
  - expanded source routing to current living refs and current provisioning references
  - required stale-authority classification
  - required explicit treatment of the missing Phase 2 report as a deliverable to create
- Why:
  - the audit prompt needed to start from the real current authority set and avoid false “missing file” conclusions
- Change type:
  - corrective
  - strengthening

### `docs/architecture/plans/MASTER/spfx/accounting/phase-2/Prompt-02_Phase-2-Backend-State-Transition-and-Launch-Contract-Remediation.md`

- Changed:
  - kept remediation implementation-forward
  - reframed the current auto-trigger-at-`ReadyToProvision` flow as the repo-truth default starting point
  - required any reversal to be treated as an explicit architecture change
  - added current provisioning refs as primary comparison sources
- Why:
  - the prompt previously made it too easy to ignore the existing live behavior
- Change type:
  - corrective
  - strengthening

### `docs/architecture/plans/MASTER/spfx/accounting/phase-2/Prompt-03_Phase-2-Backend-Validation-Idempotency-and-Uniqueness-Hardening.md`

- Changed:
  - clarified the distinction between request lifecycle enforcement and other duplicate-detection layers
  - tightened acceptance language so uniqueness claims cannot exceed actual enforcement
- Why:
  - this area was at risk of overstating current server-side uniqueness guarantees
- Change type:
  - corrective
  - narrowing

### `docs/architecture/plans/MASTER/spfx/accounting/phase-2/Prompt-04_Phase-2-Provisioning-Run-Status-Correlation-and-Observability-Hardening.md`

- Changed:
  - reframed the work around auditing and hardening existing run/status/admin APIs
  - explicitly named the already-existing admin and status methods as anchors
- Why:
  - the prompt needed to recognize that the repo already has more operational surface than older plan language suggests
- Change type:
  - corrective
  - strengthening

### `docs/architecture/plans/MASTER/spfx/accounting/phase-2/Prompt-05_Phase-2-Accounting-Workflow-Compatibility-and-Contract-Verification.md`

- Changed:
  - kept this as compatibility verification, not redesign
  - forced explicit evaluation of the real `AwaitingExternalSetup` gap
  - corrected verification commands to valid `@hbc/spfx-accounting` scripts
- Why:
  - the previous verification instructions were partly invalid and the compatibility check needed to be grounded in the actual current UI
- Change type:
  - corrective
  - strengthening

### `docs/architecture/plans/MASTER/spfx/accounting/phase-2/Prompt-06_Phase-2-Final-Documentation-Reconciliation-and-Readiness-Report.md`

- Changed:
  - added strict doc precedence
  - required classification of docs as current authority, historical evidence, partially stale, or superseded
  - corrected final verification commands to valid scripts
- Why:
  - closure would not be safe unless the package explicitly stopped PH6/MVP drift from being treated as peer authority
- Change type:
  - corrective
  - closure-related

## 4. Remaining Risks

- The repo still contains genuine lifecycle-language drift across PH6-era and current docs; this package now routes agents correctly, but the broader historical docs still require disciplined handling in later prompts.
- `AwaitingExternalSetup` remains a real live-surface gap in Accounting, even though the backend lifecycle continues to model it.
- Project-number uniqueness posture still needs careful handling in implementation prompts so server-side claims match actual enforcement and do not collapse lifecycle code together with activation-layer duplicate detection.
- If a later Phase 2 implementer chooses to reverse launch semantics away from the current `ReadyToProvision` auto-trigger model, that work must be treated as a conscious architectural change rather than a neutral cleanup.

## 5. Final Recommendation

The updated package should now be executed as-is for Phase 2.

Manual review is not strictly required before execution, but reviewers should pay particular attention during:

- Prompt-02, because it is the highest-risk point for unintentionally rewriting the live lifecycle contract
- Prompt-03, because uniqueness/idempotency wording can easily overstate what the backend already guarantees
- Prompt-06, because historical-doc classification is necessary to prevent stale plans from re-entering later work

Canonical package updated:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-2/`

Duplicate copies found in the targeted repo lookup:

- none beyond the canonical package copy under `/Users/bobbyfetting/hb-intel`
