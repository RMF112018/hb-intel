# Phase 7 — Security, Connected Services, and Environment Readiness

## Purpose

This package defines the ordered implementation prompts for **Phase 7 — Security, Connected Services, and Environment Readiness** for the HB Intel Project Setup / Accounting / provisioning workflow.

This phase is intended to bring the platform from functionally-complete workflow behavior to a **production-deployable and tenant-ready** posture.

The focus of this phase is:

- API auth contract hardening
- Entra app registration and permission alignment
- SPFx → API security posture
- CORS and origin allowlist correctness
- managed identity and backend resource access
- SharePoint / Graph / Storage / SignalR connected-service readiness
- environment configuration validation and deployment gating
- administrator-facing runbook and readiness evidence

## Package contents

- `Phase-7_Security-Connected-Services-and-Environment-Readiness_Implementation-Plan.md`
- `Prompt-01_Phase-7-Repo-Truth-Security-and-Connected-Services-Audit.md`
- `Prompt-02_Phase-7-API-Auth-Contract-and-SPFx-Access-Alignment.md`
- `Prompt-03_Phase-7-CORS-Origin-and-Environment-Configuration-Hardening.md`
- `Prompt-04_Phase-7-Managed-Identity-and-Connected-Service-Readiness.md`
- `Prompt-05_Phase-7-Deployment-Gates-Runbooks-and-Tenant-Readiness-Verification.md`
- `Prompt-06_Phase-7-Final-Documentation-Reconciliation-and-Readiness-Report.md`

## Execution order

Run the prompts in numeric order:

1. Repo-truth security and connected-services audit
2. API auth contract and SPFx access alignment
3. CORS/origin and environment configuration hardening
4. Managed identity and connected-service readiness
5. Deployment gates, runbooks, and tenant-readiness verification
6. Final documentation reconciliation and readiness report

## Important execution rules for the local code agent

- Treat the live repo as authoritative implementation truth.
- Do not re-read files that are still within the agent's current context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not make production-facing security assumptions without evidence in repo truth or Microsoft documentation.
- Prefer official Microsoft guidance when validating platform behavior, permissions, and deployment requirements.
- Distinguish clearly between:
  - confirmed repo fact
  - confirmed repo-doc intent
  - confirmed Microsoft-documented requirement / best practice
  - inferred recommendation
  - unresolved dependency
- Update the designated report files as each prompt requires.
- Preserve boundary discipline: this phase is about **security, connected services, and environment readiness**, not broad feature redesign.

## Expected outputs from the phase

By the end of Phase 7, the repo and documentation should clearly define and evidence:

- the authoritative API token contract
- the expected SPFx permission / API approval model
- the production CORS posture
- the managed identity / backend access model
- the required environment variables and readiness gates
- the unresolved tenant-admin prerequisites, if any
- the production deployment blockers, if any
- the go-forward package required for pilot or production deployment
