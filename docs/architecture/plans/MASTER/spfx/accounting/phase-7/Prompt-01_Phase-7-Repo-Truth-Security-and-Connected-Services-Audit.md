# Prompt-01 — Phase 7 Repo-Truth Security and Connected-Services Audit

## Objective

Conduct a comprehensive repo-truth audit of the Project Setup domain’s security posture, auth contract, CORS posture, environment gating, managed-identity usage, connected-service assumptions, and deployment-readiness dependencies before any remediation work begins.

This is an audit prompt, not a broad implementation prompt.

## Critical Working Rules

- Treat live repo code and tests as authoritative for implementation facts.
- Use existing current living docs before broader or older repo references.
- Use official Microsoft documentation where platform/security behavior needs confirmation.
- Do not re-read files that are still within active context unless needed to verify a contradiction, retrieve exact evidence, or confirm a change.
- Do not make broad code changes.
- Only make narrowly scoped factual doc updates if needed to record a verified repo-truth observation.
- Explicitly distinguish:
  - inbound delegated caller auth
  - outbound app-only managed identity
  - repo-defined host/config posture
  - Azure resource-level / tenant-level configuration
  - repo gaps versus external prerequisites

## Canonical Copy Check

Before concluding the audit memo, confirm which package copy is canonical in the current workspace.

Required result for this package:

- state whether the package exists under `docs/architecture/plans/MASTER/spfx/accounting/phase-7/`
- explicitly state whether duplicate package copies were found
- if the package being audited is only an attached artifact or local working draft, say so directly
- do not hard-code machine-specific absolute paths in the memo

## Required Audit Scope

At minimum, audit the following current repo sources.

### Auth / authorization core
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/authorization.ts`

### Host / config / startup validation
- `backend/functions/src/hosts/project-setup/host.json`
- `backend/functions/host.json`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/src/config/wave0-env-registry.ts`
- `backend/functions/src/utils/adapter-mode-guard.ts`

### Connected services
- `backend/functions/src/services/managed-identity-token-service.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/graph-service.ts`

### SPFx access posture
- `apps/estimating/config/package-solution.json`
- `apps/accounting/config/package-solution.json`
- any current SPFx-side token / API client code directly implicated by Project Setup protected API access

### Current living docs
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/configuration/sites-selected-validation.md`

### Drift-risk operational and config docs
- `docs/reference/configuration/wave-0-config-registry.md`
- `backend/functions/README.md`

## Microsoft Documentation To Use Heavily

Use official Microsoft docs to confirm:

- SPFx connection to Entra-secured APIs
- SharePoint admin API access approval model
- Azure Functions/App Service CORS posture
- DefaultAzureCredential with user-assigned managed identity
- Microsoft Graph permission requirements
- Sites.Selected / selected-permissions model

## Questions You Must Answer

1. What exact inbound auth contract is implemented today?
2. What exact audience, issuer, token-version, and claims assumptions are implemented today?
3. What exact delegated-scope posture is implemented today?
4. What exact app-only workload posture is implemented today?
5. Is role resolution claims-driven, ownership-aware, hybrid, or environment-driven?
6. What exact SPFx permission-request posture exists today?
7. What exact SharePoint admin API-access approvals are implied by repo truth?
8. What exact CORS posture exists in the Project Setup host?
9. How does that differ from the shared host posture?
10. Is CORS fully represented in repo truth, or partly platform-configured?
11. What exact environment variables materially affect auth, service access, and deployment readiness?
12. Which settings are startup-gated, warning-only at startup, or provisioning-time prerequisites?
13. Which connected services are active, optional, stubbed, or unresolved?
14. For each connected service, what exact identity model is used today?
15. Which docs currently disagree with code or with current living posture docs?
16. Which discrepancies are severe enough to block later rollout work if unresolved?

## Required Deliverable

Create:

`docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

The memo must include:

- Executive Summary
- Canonical Copy Check
- Confirmed Repo Facts
- Confirmed Repo-Doc Intent
- Confirmed Microsoft-Documented Requirements / Best Practices
- Current Auth Contract Summary
- Current CORS / Host / Environment Summary
- Current Connected-Service Summary
- Gap Inventory
- Drift-Risk Documentation Inventory
- Severity Ranking
- Recommended Remediation Sequence For Prompts 02–06
- Explicit Open Questions
- Exact Files Inspected

## Required Gap Inventory Structure

For each gap, include:

- ID
- topic
- classification
- repo-truth evidence
- conflicting doc or missing authority evidence
- why it matters
- recommended resolution direction
- downstream risk if unresolved

At minimum, expect gap rows for:

- auth-core source coverage
- SPFx permission / approval clarity
- Project Setup host vs shared host CORS posture
- tiered startup validation versus saga-time gating
- managed identity versus delegated auth confusion risk
- stale config-registry drift
- stale backend README drift
- missing target-doc create-vs-update clarity

## Completion Standard

This prompt is complete only when the repo contains a rigorous audit memo that later prompts can use as the decision basis for auth, CORS, config, connected-service, and deployment-readiness freeze work.
