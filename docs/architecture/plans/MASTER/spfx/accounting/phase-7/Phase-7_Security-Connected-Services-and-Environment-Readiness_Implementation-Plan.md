# Phase 7 — Security, Connected Services, and Environment Readiness Implementation Plan

## Objective

Bring the Project Setup / Accounting / provisioning solution to a **production-deployable security and platform-readiness posture** by hardening the protected API contract, validating SPFx-to-backend access, confirming connected-service identity and permission requirements, and formalizing deployment-readiness evidence.

## Scope

This phase covers:

- Entra ID / API audience / token validation posture
- SPFx API access and tenant approval dependencies
- Azure Functions auth expectations
- CORS and origin allowlists
- environment variable readiness and startup validation
- managed identity access to SharePoint, Graph, Storage, SignalR, and related resources
- SharePoint App Catalog / package / API approval dependencies
- runbook and deployment-readiness documentation

This phase does **not** redesign core workflow behavior or add unrelated feature scope.

---

## Phase structure

### Stage 1 — Repo-truth security and connected-services audit

Establish current implementation truth for:

- JWT validation and audience rules
- accepted issuer model
- role resolution model
- startup validation and env-gating
- CORS posture
- backend service initialization
- connected-service assumptions in code and docs
- unresolved production dependencies

**Primary output:** a repo-truth audit and gap inventory.

### Stage 2 — API auth contract and SPFx access alignment

Freeze and remediate the production auth contract between:

- SPFx callers
- the protected Azure Functions API
- Entra app registration / exposed API scopes
- audience / issuer handling
- controller/admin role resolution assumptions

**Primary output:** an authoritative API auth contract aligned across code and docs.

### Stage 3 — CORS, origin, and environment configuration hardening

Harden and verify:

- allowed origins
- credential/header behavior
- local vs production environment posture
- required vs optional environment variables
- startup validation behavior and failure messaging
- release gating based on environment readiness

**Primary output:** explicit and validated origin/config posture with documented gates.

### Stage 4 — Managed identity and connected-service readiness

Validate and harden the backend’s service access model for:

- SharePoint
- Microsoft Graph
- Azure Table Storage
- SignalR
- App Insights
- any other required connected service in the Project Setup domain

**Primary output:** a least-privilege service-readiness model with clear unresolved tenant/admin prerequisites.

### Stage 5 — Deployment gates, runbooks, and tenant-readiness verification

Create and reconcile the production readiness package:

- deployment checklist
- tenant prerequisite matrix
- admin approval dependencies
- operational runbook references
- rollout / staging / pilot gates
- blocker register

**Primary output:** deployment-readiness documentation suitable for implementation and IT coordination.

### Stage 6 — Final reconciliation and phase closure

Reconcile all updated docs and reports against repo truth and produce a final Phase 7 readiness report.

**Primary output:** final closure report with explicit open items, if any.

---

## Prompt execution order

1. `Prompt-01_Phase-7-Repo-Truth-Security-and-Connected-Services-Audit.md`
2. `Prompt-02_Phase-7-API-Auth-Contract-and-SPFx-Access-Alignment.md`
3. `Prompt-03_Phase-7-CORS-Origin-and-Environment-Configuration-Hardening.md`
4. `Prompt-04_Phase-7-Managed-Identity-and-Connected-Service-Readiness.md`
5. `Prompt-05_Phase-7-Deployment-Gates-Runbooks-and-Tenant-Readiness-Verification.md`
6. `Prompt-06_Phase-7-Final-Documentation-Reconciliation-and-Readiness-Report.md`

---

## Global instructions for every prompt

- Use the live repo as authoritative implementation truth.
- Do not re-read files still in current context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Use official Microsoft documentation heavily for auth, SPFx, CORS, Entra, managed identity, Graph, SharePoint, and deployment guidance.
- Be explicit about what is:
  - confirmed in code
  - confirmed only in docs
  - inferred
  - unresolved
- Where docs conflict with code, update docs to reflect repo truth unless the prompt explicitly directs otherwise.
- Do not silently broaden scope.
- Record evidence paths and exact files changed.
