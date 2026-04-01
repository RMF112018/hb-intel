# Phase 7 — Security, Connected Services, and Environment Readiness

## Purpose

This is the revised canonical Phase 7 prompt set for the Accounting-side / Project Setup security, connected-services, and environment-readiness effort.

Phase 7 is about bringing the solution to a **production-deployable and tenant-ready posture**. It is not a workflow redesign phase and it is not a generic hardening catch-all. Its job is to make the repo’s actual auth contract, CORS posture, config gating, managed-identity usage, connected-service dependencies, and deployment readiness explicit enough that later implementation and rollout work do not drift back into stale assumptions.

## Canonical Copy Rule

Treat the repo-relative package path as canonical only if the package has been committed there in the current workspace:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-7/`

Do not hard-code workstation-specific paths in findings or updated docs.  
If duplicate package copies exist in the current workspace, record them explicitly.  
If the package being audited exists only as an attached artifact or working draft, say so directly.

## Authority Order

Every prompt in this package must use this authority order:

1. live repo code and tests
2. current living reference docs that already describe the Project Setup security / service posture
3. official Microsoft documentation for SPFx, Entra-secured APIs, Azure Functions CORS, managed identity, Graph permissions, and Sites.Selected
4. older or broader repo docs as drift evidence when they conflict with current implementation truth

Use older docs to identify stale assumptions, not to override current code.

## Current Repo-Truth Baseline That Motivates Phase 7

The live repo currently shows all of the following:

- inbound API auth uses `withAuth()` + `validateToken()` + claims-based authorization helpers
- production JWT validation requires `AZURE_TENANT_ID` and `API_AUDIENCE`
- accepted issuers include both the Entra v1 and v2 issuer forms for the configured tenant
- delegated callers are expected to carry `access_as_user`
- app-only workload tokens are handled separately from delegated user tokens
- the estimating-side SPFx package currently declares `webApiPermissionRequests` for `hb-intel-api-production` / `access_as_user`
- the Project Setup backend has a domain-scoped host config (`backend/functions/src/hosts/project-setup/host.json`) with a narrower CORS posture than the shared host
- startup validation is tiered:
  - core settings are startup-gated
  - SharePoint settings are warning-only at startup in the current Project Setup service factory
  - provisioning prerequisites are validated later at saga execution time
- downstream service access is app-only managed identity for SharePoint / Graph / storage, while SignalR remains connection-string based
- the repo already contains a current connected-service posture doc and a Sites.Selected validation doc
- the repo also still contains older configuration guidance that no longer cleanly matches current typed config and validation logic

These are the starting facts for this package. Do not write prompts that flatten them into a simpler but less accurate model.

## Files In This Package

- `Accounting_Phase7_Prompt_Audit_Report.md`
- `README_Phase-7-Security-Connected-Services-and-Environment-Readiness.md`
- `Phase-7_Security-Connected-Services-and-Environment-Readiness_Implementation-Plan.md`
- `Prompt-01_Phase-7-Repo-Truth-Security-and-Connected-Services-Audit.md`
- `Prompt-02_Phase-7-API-Auth-Contract-and-SPFx-Access-Alignment.md`
- `Prompt-03_Phase-7-CORS-Origin-and-Environment-Configuration-Hardening.md`
- `Prompt-04_Phase-7-Managed-Identity-and-Connected-Service-Readiness.md`
- `Prompt-05_Phase-7-Deployment-Gates-Runbooks-and-Tenant-Readiness-Verification.md`
- `Prompt-06_Phase-7-Final-Documentation-Reconciliation-and-Readiness-Report.md`

## Required Working Rules For Every Prompt

- Treat the live repo as authoritative for implementation facts.
- Do not assume the current package wording is correct just because it already exists.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Keep Phase 7 focused on security, connected-services, environment readiness, and deployment gating.
- Do not silently broaden scope into unrelated feature work.
- Do not weaken auth or CORS posture for convenience.
- Do not silently convert tenant/platform prerequisites into “code-complete” claims.
- Prefer updating existing authoritative docs when they already exist.
- If a target file path does not yet exist, create it deliberately and record that it was created.
- Preserve the distinction between:
  - inbound delegated auth
  - outbound app-only managed identity
  - platform-level resource configuration
  - repo-coded startup validation
  - tenant-admin prerequisites

## Evidence Discipline

Every prompt and every resulting artifact must clearly separate:

1. confirmed repo fact
2. confirmed repo-doc intent
3. confirmed Microsoft-documented requirement or best practice
4. inferred recommendation
5. unresolved dependency or external blocker

When a prompt asks for reconciliation, it must explicitly classify older language as one of:

- still correct
- incomplete and needs clarification
- partially stale
- superseded by current repo truth
- still useful only as historical evidence

## Known Drift Sources That Must Be Handled Carefully

The following files are especially likely to mislead later work if they are not classified carefully:

- `docs/reference/configuration/wave-0-config-registry.md`
- `backend/functions/README.md`

The following current docs are important authority-family inputs and should not be ignored:

- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/configuration/sites-selected-validation.md`

## Phase 7 Success Standard

Phase 7 is complete only when all of the following are true:

- the inbound API auth contract is explicit and internally consistent
- the SPFx permission-request and admin-approval posture is explicit
- the Project Setup CORS posture is explicit and distinguished from broader shared-host posture
- the environment readiness model clearly separates startup gates, warnings, and provisioning-time prerequisites
- the downstream connected-service posture is explicit service by service
- managed identity, Graph, SharePoint, storage, SignalR, and notification dependencies are classified correctly
- tenant-admin prerequisites are explicit and not hidden inside “code-ready” statements
- the documentation set later phases must trust is explicit and non-contradictory
- unresolved dependencies are preserved as external blockers rather than mislabeled as repo gaps
- the final closure report states whether pilot or production readiness can proceed and under what exact conditions

## Execution Order

Execute the prompts in numeric order:

1. Prompt-01
2. Prompt-02
3. Prompt-03
4. Prompt-04
5. Prompt-05
6. Prompt-06

Do not skip order. Each prompt depends on the evidence, narrowed scope, and reconciled definitions produced by earlier prompts.
