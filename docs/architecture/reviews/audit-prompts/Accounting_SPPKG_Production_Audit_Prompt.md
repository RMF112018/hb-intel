# Accounting SPFx `.sppkg` Artifact-First Production Audit Prompt (Revised)

You are continuing an in-progress architecture, deployment, and production-readiness effort for the HB Intel **Accounting SPFx application** and its dependency on the Project Setup / provisioning backend.

Authoritative implementation repository:
- `https://github.com/RMF112018/hb-intel.git`

Relevant repo planning and development-stage documentation:
- `docs/architecture/plans/MASTER/spfx/accounting/`

Relevant repo audit and review artifacts:
- `docs/architecture/reviews/`

Primary attached artifact for this audit:
- The attached **`hb-intel-accounting.sppkg`** is the current SharePoint deployment artifact to audit.
- Treat the attached package as the **primary frontend truth source** for this audit unless live repo evidence proves it is stale, mismatched, incomplete, or no longer representative of the intended release candidate.

## Context and intent

This audit must be performed in a **different order** than a normal repo-first review.

The audit is intentionally **artifact-first**:
1. **First**, conduct an exhaustive audit of the attached `hb-intel-accounting.sppkg` as a shipped SharePoint deployment artifact.
2. **Second**, after establishing what the package actually ships and assumes, audit the live repo with emphasis on the **backend and package-supporting source code** to verify alignment, completeness, and production viability.
3. **Third**, reconcile package truth against repo truth and current Microsoft guidance to identify every meaningful gap, mismatch, risk, blocker, missing approval, configuration issue, and production-readiness deficiency.

The goal is to avoid incorrectly treating repo intent as proof of what the deployed package actually is.

## Primary objective

Conduct an exhaustive and comprehensive audit of the attached **`hb-intel-accounting.sppkg`** to determine:

1. what the package itself actually contains, proves, assumes, and requires
2. whether the package aligns with the live repo’s **backend implementation and supporting source code**
3. whether the package and source code together are truly complete enough for production deployment
4. whether there are any gaps in the package, the package’s source code, or the backend/runtime contract that would prevent or weaken a real production release
5. whether the correct readiness classification is:
   - not ready
   - staging-ready only
   - pilot-ready with blockers
   - production-ready with caveats
   - production-ready without material blockers

## Critical instructions

- Treat the attached `hb-intel-accounting.sppkg` as the starting point and primary deployment artifact truth.
- Treat the live repo as the authoritative implementation source for backend, packaging, and current intended behavior.
- Do **not** start with a broad repo architecture summary. Start with the package.
- Do **not** assume prior conclusions are correct.
- Do **not** treat repo completeness as proof that the shipped package is complete.
- Do **not** re-read files already in your active context or memory unless needed to verify contradiction, confirm exact evidence, or capture exact wording for updates.
- Do **not** jump into remediation prompts until the audit is complete.
- Do **not** overstate readiness.
- Be explicit wherever the evidence proves only:
  - package-built
  - repo-complete
  - build-complete
  - staging-ready
  - pilot-ready
  - production-ready
  These are **not interchangeable**.
- Validate all meaningful conclusions against:
  1. package artifact truth
  2. live repo truth
  3. current Microsoft documentation and official guidance
- Use web search extensively and prefer **official Microsoft sources** wherever possible.
- If non-Microsoft sources are used, use them only as secondary/supporting references and not as the primary basis for technical guidance.
- Distinguish clearly between:
  1. confirmed package fact
  2. confirmed repo fact
  3. confirmed Microsoft-documented requirement / best practice
  4. inferred conclusion
  5. unresolved issue

## Required audit sequence

### Phase 1 — Exhaustive audit of the attached `hb-intel-accounting.sppkg`

Inspect the attached package thoroughly as a shipped SharePoint artifact before drawing repo-based conclusions.

At minimum, inspect and evaluate:
- `AppManifest.xml`
- web part manifest(s)
- package metadata
- package identity / solution ID / feature ID / versioning
- ClientSideAssets bundle(s)
- shell wrapper behavior
- runtime config injection behavior
- auth and token acquisition assumptions
- backend URL / API resource / API audience assumptions
- SharePoint tenant / host assumptions
- feature flags / backend mode / ui-review / production-mode behavior
- any hardcoded staging, dev, preview, or tenant-specific values
- any dead references or runtime assumptions that would affect real deployment
- mounted route tree and visible shipped surfaces
- loading, error, empty, warning, and success-state patterns
- app framing, shell behavior, headings, labels, commands, and navigation behavior
- any signals that the package is stale, partial, mismatched, or no longer representative of the intended release candidate

You must determine what the package itself proves about:
- the deployable Accounting surface that is actually shipped
- the backend and config it expects
- the permissions and approvals it implicitly requires
- the production risks embedded in the artifact
- whether the package appears complete only in a narrow path or is broadly supportable in a real production environment

### Phase 2 — Audit the live repo with emphasis on backend truth and package-supporting source code

Only after the package audit is complete, audit the live repo comprehensively with emphasis on the code and docs required to support the shipped package.

Repo focus areas must include at minimum:
- `apps/accounting`
- `apps/accounting/src/config/*`
- `apps/accounting/src/backend/*`
- `apps/accounting/src/mount.tsx`
- packaging-related source such as:
  - `tools/build-spfx-package.ts`
  - `tools/spfx-shell/*`
- `backend/functions`
- `backend/functions/src/hosts/project-setup`
- `backend/functions/src/middleware/*`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- `packages/provisioning`
- `docs/architecture/blueprint/current-state-map.md`
- current release/readiness/runbook/configuration docs relevant to the Accounting deployment path
- any test, verification, acceptance, or packaging-truth artifacts relevant to the shipped Accounting package

Specific repo focus areas:
- package source code that should correspond to the shipped artifact
- Azure Functions startup and registered handlers
- Project Setup host boundary and release scope
- config validation / startup validation / feature gating
- auth middleware and token validation model
- API audience / issuer / claim expectations
- managed identity usage
- SharePoint / Graph service access patterns
- CORS posture
- environment variable requirements
- service factory and dependency initialization
- operational/runbook assumptions
- test/readiness evidence
- packaging / build / deployment assumptions that affect production viability

### Phase 3 — Reconcile package truth against repo truth

After auditing both the package and the repo, reconcile them directly.

You must verify and explicitly state:
- whether the attached package matches the current intended Accounting release surface
- whether the package reflects current source code or appears older/stale/misaligned
- whether the package expects backend routes or behavior the repo does not actually support
- whether the repo expects approvals, config, or services the package cannot practically operate without
- whether there are frontend/backend contract mismatches that would block deployment or operation
- whether the package source code and the backend are sufficiently complete and aligned for real release use
- whether the repo shows only source-level completion or actual release readiness

### Phase 4 — Conduct comprehensive subject-matter research using current official Microsoft guidance

Use current official Microsoft documentation to validate the design and production posture for all relevant connected services, including at minimum:
- Azure Functions production deployment guidance
- Azure Functions auth guidance
- App Service / Functions CORS guidance
- Entra ID app registration / API exposure / audience / token validation guidance
- SPFx guidance for calling Entra-secured APIs
- SharePoint App Catalog and API approval guidance
- Microsoft Graph and SharePoint permission guidance
- managed identity guidance
- Sites.Selected / site permission grant guidance if implicated by the repo
- any other connected Azure or Microsoft 365 service guidance actively implicated by this solution

### Phase 5 — Audit package and repo posture against Microsoft guidance

Identify where the implementation:
- aligns with Microsoft guidance
- deviates but is acceptable with caveats
- is under-specified
- is risky, outdated, over-broad, or inconsistent with Microsoft guidance
- works only in a narrow demo or controlled test path rather than a real production release posture

### Phase 6 — Conduct an explicit production-preparedness determination

You must explicitly determine whether the attached Accounting package is production-prepared in relation to:
- build artifact integrity
- runtime config correctness
- API auth correctness
- package/backend compatibility
- CORS and browser-hosted access readiness
- SharePoint App Catalog / API approval readiness
- Entra / managed identity / Graph / SharePoint permission readiness
- startup gating and dependency readiness
- staging / pilot / production differentiation
- rollback / redeploy practicality
- runbook / support readiness
- monitoring / observability readiness
- unresolved external blockers
- completeness of the shipped package and its source code

## Specific audit questions you must answer

- What does the attached `hb-intel-accounting.sppkg` actually prove about the shipped Accounting surface?
- Does the attached package contain any staging-specific, demo-only, outdated, or mismatched assumptions that make it unsafe for production?
- Does the package match the current Accounting source code in the repo, or does it appear stale or inconsistent with live repo truth?
- Does the current backend, Project Setup host, and provisioning runtime fully support the shipped package?
- Are backend startup requirements properly scoped to the actual Accounting release posture, or are there over-broad boot blockers?
- Does the package assume runtime config or token behavior that the backend or shell does not correctly support?
- Is the current auth model internally consistent across SPFx, backend, Entra ID, and Microsoft guidance?
- Is the API audience / token validation model correctly designed for production?
- Is the managed identity / Graph / SharePoint access model correctly designed for production?
- Are required connected Azure and SharePoint services correctly identified and appropriately used?
- Are there any Microsoft-guidance conflicts, anti-patterns, or production risks in the current implementation?
- Are there packaging, approval, permission, config, deployment, or source-code-completeness issues that would block a real production launch?
- Are there conditions where the package might appear usable in a narrow test path but is not actually production-ready?
- Based on package truth, repo truth, and Microsoft guidance, what is the correct readiness classification?

## Required output

Produce a rigorous audit report **before** proposing any implementation or remediation prompts.

The report must include:

1. Executive Summary
2. Package-First Audit Summary
3. Confirmed `.sppkg` Package Facts
4. Confirmed Repo Facts
5. Confirmed Microsoft Guidance / Best-Practice Findings
6. Package ↔ Source-Code Alignment Analysis
7. Package ↔ Backend Alignment Analysis
8. Production-Preparedness Analysis
9. Gap Analysis
10. Risk Analysis
11. Readiness Classification
12. Prioritized Remediation List
13. Explicit Unresolved Questions, if any

## Required output format expectations

- Be exhaustive and specific.
- Use direct citations throughout.
- Prefer official Microsoft citations for platform/best-practice claims.
- Cite repo/package evidence when describing implementation facts.
- Make the report suitable for architecture, deployment, and release decision-making.
- Do **not** jump into implementation prompts until the audit is complete.
- Do **not** overstate readiness.
- Be explicit about the difference between:
  - package truth
  - repo truth
  - source-code truth
  - documented manual prerequisites
  - external tenant/admin approvals
  - actual production readiness

## Required first response

Before proposing any implementation steps, conduct comprehensive research on the subject matter, perform an exhaustive audit of the attached `hb-intel-accounting.sppkg`, then audit the live repo with emphasis on backend truth and Accounting package-supporting source code, reconcile package truth against repo truth and Microsoft guidance, search for gaps in both the package and its source code, and then summarize the findings clearly with an evidence-based production-readiness assessment before we proceed.
