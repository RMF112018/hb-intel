# Prompt-01 — Phase 9 Repo-Truth Release Readiness Audit

## Objective

Perform a rigorous repo-truth audit of release readiness for the Accounting app and connected Project Setup / provisioning workflow.

The goal is to establish:

- what is already proved by the repo
- what still requires manual/environment validation
- what is externally blocked
- what is intentionally deferred
- what must be true before staging, pilot, or production cutover can proceed

This is a release-readiness audit prompt, not a broad implementation prompt.

## Critical Working Rules

- Treat live repo code, tests, runbooks, and current-state docs as authoritative for present implementation truth.
- Use official Microsoft documentation where platform behavior must be confirmed, especially for Azure Functions staging/deployment-slot behavior and SPFx app-catalog / API approval behavior.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Do not make broad code changes.
- Only make narrowly scoped documentation updates if they are required to record a strictly factual repo-truth finding.
- Do not blur repo-proven readiness with tenant/platform readiness.

## Canonical Copy Check

Before concluding the audit memo, confirm which package copy is canonical **in the current workspace**.

Required result for this package:

- state whether the package exists under `docs/architecture/plans/MASTER/spfx/accounting/phase-9/`
- explicitly state whether duplicate package copies were found in the current workspace
- if the package being audited is only an attached artifact / local draft and not yet committed in the repo, say so directly
- do not hard-code machine-specific absolute paths in the memo

## Required Audit Scope

Audit the current release posture across at least the following sources.

### Current-state and release boundary
- `docs/architecture/blueprint/current-state-map.md`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`

### Verification and support evidence
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

### Configuration and external prerequisite posture
- `docs/reference/configuration/wave-0-config-registry.md`
- `docs/reference/configuration/sites-selected-validation.md`

### Current verification suites
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`

### Additional current release/readiness materials if present
- release/readiness checklists
- prior Phase 7/8 outputs committed in the repo
- environment/config docs
- deployment-oriented docs
- Project Setup host/auth/config docs that materially affect release

### Official Microsoft guidance to consult where necessary
- Azure Functions continuous deployment / staging-slot guidance
- Azure Functions deployment-slot swap / rollback behavior
- SharePoint API access approval
- SPFx solution deployment / app-catalog trust / deployment path guidance

## Questions You Must Answer

1. What is already repo-proven for release purposes?
2. What is only documented but not yet repo-proven?
3. What requires manual staging or tenant validation outside the repo?
4. What is externally blocked today?
5. What remains deferred by design and therefore must not be counted as a release blocker unless it is in the current release scope?
6. What exact workflow path can be used as the release smoke baseline?
7. What exact support/observability evidence already exists?
8. What exact external dependencies still stand between repo-complete and staging/pilot/production readiness?
9. Does the target release posture currently support a slot-based cutover/rollback assumption, or is that only a recommended pattern pending environment confirmation?
10. Which statements in current docs sound stronger than the evidence actually supports?

## Required Evidence Classification

Every major finding must be labeled as one of:

- **repo-proven**
- **manual verification required**
- **externally blocked**
- **deferred / out of scope**
- **not yet evidenced**
- **inferred recommendation**

Do not mix these categories without saying which category is doing the work.

## Required Output

Create a markdown audit memo at:

`docs/architecture/reviews/phase-9-release-readiness-audit.md`

The memo must include:

- Executive Summary
- Canonical Copy Check
- Scope Reviewed
- Confirmed Repo Facts
- Current Release Evidence Inventory
- Readiness Classification by Area
  - Repo Complete
  - Staging Ready
  - Pilot Ready
  - Production Ready
- External / Tenant / Operational Dependencies
- Blocking Items
- Recommended Order for Remaining Phase 9 Work
- Explicit Open Risks
- Evidence Appendix
- Exact Files Inspected

## Hard Requirements

- Distinguish clearly between:
  - repo-complete
  - staging-ready
  - pilot-ready
  - production-ready
- Build an explicit external-dependency register with:
  - dependency
  - owner
  - evidence required
  - impacted stage
  - blocking severity
- Use current workflow language:
  - submit
  - controller review
  - clarify / hold / approve
  - `ReadyToProvision`
  - backend auto-start
  - status visibility
  - admin exception handling

Do not regress into generic “launch” wording unless a source specifically uses it and you classify that wording carefully.

## Completion Standard

This prompt is complete only when the repo contains a release-readiness baseline that the later Phase 9 prompts can use without reopening basic readiness semantics.
