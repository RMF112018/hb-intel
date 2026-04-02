# Prompt-08 — Phase 11 Hosted Staging Validation and Tenant Approval Readiness

## Objective

Convert the newly rebuilt Accounting release candidate into a hosted validation plan that cleanly separates:
- repo/package proof
- hosted SharePoint proof
- tenant/admin approval prerequisites
- remaining production blockers

This prompt should prepare staged validation and release-governance execution. It should not pretend those hosted checks are already complete unless the environment evidence truly exists.

## Critical Working Rules

- Execute this prompt only after the fresh Accounting artifact evidence exists.
- Do not re-read files already in current context or memory unless needed to verify contradiction, capture exact wording, or reference final build evidence.
- Use official Microsoft documentation wherever SharePoint admin approval, SPFx API access, CORS, or hosted token behavior must be described.
- Keep hosted/manual prerequisites separate from repo-complete claims.

## Required Scope

Inspect at minimum:
- the Phase 11 artifact evidence outputs
- current release/readiness/runbook docs affecting Accounting
- current Project Setup auth/runtime docs
- any current staging validation templates or release checklists
- Microsoft guidance for:
  - SharePoint API access approval
  - SPFx hosted API calling behavior
  - Azure Functions hosted configuration and CORS considerations where relevant

## Required Work

Create a hosted validation and prerequisite package covering at minimum:
1. App Catalog deployment/trust
2. API access approval posture
3. token acquisition in hosted SharePoint context
4. Function App URL resolution in hosted runtime
5. backend route connectivity
6. CORS verification
7. any remaining `/api/users/me/*` or same-origin dependency validation
8. smoke workflow path for Accounting controller/review behavior
9. clear owner assignment for external/admin prerequisites

## Required Outputs

### 1. Create a hosted validation memo at:
`docs/architecture/reviews/accounting-hosted-staging-validation-and-tenant-approval-readiness.md`

The memo must include:
- Executive Summary
- Artifact Baseline Used
- Hosted Validation Checklist
- External / Tenant Prerequisite Register
- Owner Assignment
- Blocking Severity
- Evidence Still Needed
- Exact Files / References Used

### 2. Create or update a phase-local checklist at:
`docs/architecture/plans/MASTER/spfx/accounting/phase-11/08-Hosted-Staging-Validation-Checklist.md`

### 3. If appropriate, add or update any release-readiness/runbook docs so Accounting’s hosted validation path is explicit and reusable.

## Hard Requirements

- Distinguish clearly between:
  - package proof
  - hosted proof
  - admin approval proof
  - production readiness
- Do not mark anything “done” unless evidence exists.
- Build a simple dependency register with:
  - dependency
  - owner
  - evidence required
  - impacted stage
  - severity

## Completion Standard

This prompt is complete only when the team has a clean hosted-validation and admin-approval execution path for the rebuilt Accounting release candidate.
