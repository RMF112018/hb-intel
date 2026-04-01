# Prompt-02 — Phase 7 API Auth Contract and SPFx Access Alignment

## Objective

Freeze and remediate the production API auth contract so the SPFx callers, protected backend, and authoritative documentation are aligned on audience, issuer handling, token version tolerance, claim requirements, delegated scope, workload-token exceptions, and admin approval dependencies.

Use the audit output from:

`docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

## Critical Working Rules

- Treat live repo code and tests as authoritative for what is implemented.
- Use official Microsoft guidance for SPFx and Entra-secured API behavior.
- Do not re-read files already in active context unless needed to verify contradiction, retrieve exact evidence, or confirm a change.
- This is a contract-freeze prompt, not a broad implementation prompt.
- Do not weaken auth validation for convenience.
- Prefer narrow code clarification and authoritative-doc reconciliation over broad behavior changes.

## Required Source Review

At minimum, review and reconcile:

- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/authorization.ts`
- `apps/estimating/config/package-solution.json`
- `apps/accounting/config/package-solution.json`
- any current SPFx token or API client code that actually acquires access tokens for the protected API
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `backend/functions/README.md`
- the Phase 7 audit report

Also use official Microsoft docs for:

- SPFx `webApiPermissionRequests`
- `AadHttpClient` / token acquisition posture
- SharePoint admin center API access approvals

## Required Decisions To Freeze

You must explicitly freeze and document:

1. the expected API audience format in production
2. accepted issuer values
3. token-version tolerance and the reason for it
4. required claims for delegated user tokens
5. required claims for app-only workload tokens
6. the required delegated scope for interactive SPFx callers
7. the exact app-role posture for admin/controller/break-glass/automation
8. whether ownership fallback remains part of the production contract and in what limited sense
9. whether the current SPFx package manifest(s) are aligned with the intended backend auth contract
10. what exact SharePoint admin approval(s) are required for the SPFx solution(s) to successfully call the API
11. whether any current docs still imply an older or different auth model

## Hard Requirements

At the end of this prompt there must be one unambiguous answer to:

- what exact audience value production tokens are expected to carry
- what exact delegated scope interactive SPFx callers must have
- what exact admin approval workflow is required before SharePoint-hosted callers can obtain those tokens successfully
- what exact claim/role/scope checks the backend enforces

Also make explicit:

- inbound auth is delegated for interactive SPFx callers
- outbound service access is not delegated user auth
- notification UPN env vars are not authorization sources
- app-only workload tokens are handled separately from delegated user tokens

## Required Deliverables

Create or update:

- `docs/reference/configuration/project-setup-api-auth-contract.md`
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

If `project-setup-api-auth-contract.md` does not yet exist, create it and record that fact in the audit report.

## Required Contents For `project-setup-api-auth-contract.md`

- Executive Summary
- Scope of the Contract
- Interactive SPFx Caller Model
- Required SPFx Permission Requests
- SharePoint Admin API Access Approval Model
- Backend Audience / Issuer / Token Version Contract
- Required Claims and Roles
- Delegated Scope Rules
- App-Only Workload Rules
- Ownership Fallback Rules
- Explicit Non-Sources of Authorization
- Validation and Telemetry Expectations
- Known External Dependencies
- Files and Docs This Contract Depends On

## Completion Standard

This prompt is complete only when later prompts no longer need to reopen the inbound auth contract except to correct a newly discovered repo-truth contradiction.
