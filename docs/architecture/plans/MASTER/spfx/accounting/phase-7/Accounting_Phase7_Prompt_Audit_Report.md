# Accounting Phase 7 Prompt Package Audit Report

## Executive Summary

The attached Phase 7 package is **well aimed but not yet safe enough as an execution guide without revision**.

Its overall intent is correct:

- lock the production auth contract
- verify SPFx-to-backend access
- harden environment and CORS posture
- validate managed identity and connected services
- define deployment and tenant readiness gates

The package structure is also strong. The six-stage order is logical and should be preserved.

The weaknesses are mostly not about direction. They are about **precision, source coverage, and boundary clarity**.

### What the original package gets right

- It correctly treats Phase 7 as a **security / connected-services / environment-readiness** phase rather than a workflow redesign phase.
- It correctly separates the work into audit, auth alignment, config hardening, managed identity readiness, deployment gates, and final closure.
- It correctly recognizes that official Microsoft guidance should be used heavily.
- It correctly treats the live repo as authoritative implementation truth.

### What it was missing or understating

1. It did not force review of several now-authoritative repo files:
   - `backend/functions/src/middleware/validateToken.ts`
   - `backend/functions/src/middleware/auth.ts`
   - `backend/functions/src/middleware/authorization.ts`
   - `backend/functions/src/hosts/project-setup/host.json`
   - `backend/functions/host.json`
   - `backend/functions/src/utils/validate-config.ts`
   - `backend/functions/src/config/wave0-env-registry.ts`
   - `backend/functions/src/utils/adapter-mode-guard.ts`
   - `apps/estimating/config/package-solution.json`
   - `docs/reference/developer/project-setup-connected-service-posture.md`
   - `docs/reference/configuration/sites-selected-validation.md`
   - `backend/functions/README.md`

2. It did not force a clean separation between:
   - **inbound delegated auth** for SPFx callers into the protected API
   - **outbound app-only auth** from the backend into SharePoint / Graph / Storage
   - **platform-level CORS configuration**
   - **repo-coded startup validation**
   - **tenant-side permission prerequisites**

3. It did not explicitly require the agent to distinguish:
   - hard startup gates
   - warning-only startup checks
   - provisioning-time gates
   - tenant/admin prerequisites that are not resolved in repo code

4. It did not strongly enough neutralize already-known configuration documentation drift.

5. Some prompt targets were written as if the repo already had a clean `project-setup-*` configuration doc family under `docs/reference/configuration/`, but at least some of those exact target files are not currently present and must be **created if absent** rather than assumed to exist.

### Bottom line

- **Keep the six-stage structure**
- **Keep the phase intent**
- **Strengthen the source set**
- **Sharpen the auth/CORS/config distinctions**
- **Explicitly reconcile stale config and readiness docs**
- **Add stronger closure criteria tied to tenant-readiness and production gating**

That is what the revised package does.

---

## Current Repo-Truth Security and Connected-Service Summary

## 1. Inbound API auth is repo-defined and explicit

The backend currently uses:

- `withAuth()` for Bearer extraction and authenticated handler wrapping
- `validateToken()` for JWT verification
- `authorization.ts` for role, scope, ownership, and workload checks

The current token-validation contract already includes several important production constraints:

- `AZURE_TENANT_ID` is required in production
- `API_AUDIENCE` is required in production
- accepted issuers include both:
  - `https://sts.windows.net/{tenantId}/`
  - `https://login.microsoftonline.com/{tenantId}/v2.0`
- both v1 and v2 tokens are tolerated
- `oid` is always required
- delegated tokens require `upn` or `preferred_username`
- app-only tokens are detected through `idtyp === 'app'` or the absence of delegated-user identity claims

This is more precise than the original Phase 7 package source list implied.

## 2. Authorization is claims-based and ownership-aware

The current authorization layer no longer reflects older env-var-allowlist assumptions.

Repo truth now distinguishes:

- app roles:
  - `Admin` / `HBIntelAdmin`
  - `Controller` / `HBIntelController`
  - `BreakGlass`
  - `Automation`
- delegated scope:
  - `access_as_user`
- ownership checks:
  - prefer `submittedByOid`
  - fall back to UPN only for pre-migration records

That means Phase 7 must explicitly preserve the difference between:

- authn
- authz
- notification routing
- workload authorization
- ownership fallback

## 3. SPFx-side access is already part of the repo contract

At least one current SPFx package explicitly declares a web API permission request:

- `apps/estimating/config/package-solution.json`
  - `resource: "hb-intel-api-production"`
  - `scope: "access_as_user"`

That is a real repo-truth part of the auth contract and must be in the Phase 7 prompt source list.

The original package was directionally aware of SPFx/API alignment, but it needed to point more explicitly at the package manifest and the SharePoint admin API-access approval model.

## 4. The backend uses a domain-scoped Project Setup host

The repo currently contains **two** relevant host configurations:

- `backend/functions/src/hosts/project-setup/host.json`
- `backend/functions/host.json`

The Project Setup host is narrower:

- only the specific tenant SharePoint origin
- `supportCredentials: true`

The shared host is broader:

- specific tenant origin
- `https://*.sharepoint.com`
- still no plain `*` wildcard

That means CORS posture is **not one flat setting** in repo truth.  
The package should force the agent to distinguish:

- domain-scoped Project Setup production host posture
- broader shared-host posture
- actual Azure Function App resource-level CORS settings applied in Azure

## 5. Startup validation is intentionally tiered, not monolithic

The repo already encodes a three-tier validation model:

### Core tier
Validated at startup and intended to block startup:

- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_TABLE_ENDPOINT`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`
- `API_AUDIENCE`
- `HBC_ADAPTER_MODE`

### SharePoint tier
Validated at startup but currently warning-only in the Project Setup service factory:

- `SHAREPOINT_TENANT_URL`
- `SHAREPOINT_PROJECTS_SITE_URL`

### Provisioning prerequisites
Validated later at saga execution time, not at startup:

- `GRAPH_GROUP_PERMISSION_CONFIRMED`
- `SHAREPOINT_HUB_SITE_ID`
- `SHAREPOINT_APP_CATALOG_URL`
- `HB_INTEL_SPFX_APP_ID`
- `OPEX_MANAGER_UPN`
- conditional Sites.Selected confirmation gate

This is a key repo-truth distinction the original package did not force strongly enough.

## 6. Outbound connected-service auth is app-only managed identity

The Project Setup backend’s downstream service posture is clear:

- SharePoint: app-only token via `DefaultAzureCredential`
- Graph: app-only token via `DefaultAzureCredential`
- Table Storage: managed identity / Azure identity client path
- SignalR: connection string
- Notifications: service abstraction, not authorization source

The currently authoritative connected-service posture doc explicitly says that **no OBO or user-delegated flow** is used for downstream service calls in production.

That means the Phase 7 package must force a strong separation between:

- user tokens coming **into** the API
- app-only identity used **outbound** by backend services

## 7. Sites.Selected governance is already a live repo concern

The repo already carries a meaningful Sites.Selected posture:

- preferred least-privilege path
- `SITES_SELECTED_GRANT_CONFIRMED` gate
- manual pilot-bridge model documented
- `Sites.FullControl.All` treated as governed fallback
- explicit dependence on tenant/admin grant workflow

This is not merely “future architecture.” It is already part of current production-readiness posture and must be in the Phase 7 package source set.

## 8. The repo already contains configuration-doc drift

There is meaningful documentation drift that Phase 7 must explicitly reconcile.

### Example: `wave-0-config-registry.md`
This document still contains older assumptions such as:

- `AZURE_CLIENT_SECRET` as required in production
- `HBC_ADAPTER_MODE=live`
- some production-required declarations that no longer match the current typed registry and validation logic
- missing or older framing around `API_AUDIENCE`

### Example: `backend/functions/README.md`
This doc still includes older local-dev and config language, including a local setup example with `AZURE_CLIENT_SECRET`, even though the current typed registry and current production posture no longer treat that as part of the production auth contract.

This is precisely the type of repo/doc drift that the original Phase 7 package should have forced into the explicit reconciliation set.

## 9. Some target docs in the original package are not yet live files

At least some Phase 7 target docs referenced by the prompt package were written as if they already existed under `docs/reference/configuration/`, but exact file-path existence is not guaranteed from current repo truth.

That means the package should tell the agent:

- update existing docs when they exist
- create the target doc when it does not
- record whether the file was created or updated
- avoid silently inventing “authoritative” docs without noting their creation status

---

## Confirmed Phase 7 Prompt-Package Facts

The attached package defines a six-stage Phase 7 structure focused on:

1. repo-truth audit
2. API auth contract and SPFx access alignment
3. CORS / origin / env hardening
4. managed identity and connected service readiness
5. deployment gates and tenant readiness
6. final reconciliation and closure

That overall sequence is correct.

The attached package also correctly says that this phase is about:

- Entra ID / audience / token handling
- Azure Functions auth expectations
- CORS and origin allowlists
- environment variable readiness
- managed identity access
- SharePoint / Graph / SignalR / storage connected-service posture
- deployment readiness docs and runbooks

These are the right top-level concerns.

---

## Prompt-Package ↔ Repo Alignment Analysis

## 1. Phase objective

**Assessment:** aligned.

The package objective is correct. This phase should bring the solution to a production-deployable security and environment-readiness posture without redesigning core workflow behavior.

## 2. Phase structure

**Assessment:** aligned.

The six-stage structure is logical and should be kept.

## 3. Audit stage

**Assessment:** partially aligned, needs a broader source list.

The current Prompt-01 correctly asks for JWT validation, startup validation, service factory initialization, CORS-related configuration, managed identity usage, and connected services.

What it still lacked:

- exact auth-core file review
- exact host.json review
- exact typed environment registry review
- exact drift-doc review
- explicit classification of startup gates vs saga gates
- explicit SPFx permission-manifest review

## 4. API auth contract stage

**Assessment:** aligned in intent, too generic in repo grounding.

The original Prompt-02 was right to focus on:

- audience
- issuer
- token version
- claims handling
- SPFx access dependencies

But it needed to explicitly review and freeze:

- `validateToken.ts`
- `auth.ts`
- `authorization.ts`
- `apps/estimating/config/package-solution.json`
- current SharePoint admin API-access approval expectations

It also needed to explicitly distinguish:

- delegated user token requirements
- app-only workload authorization
- ownership fallback rules
- what is enforced in code vs what is tenant-admin approval work

## 5. CORS / environment stage

**Assessment:** aligned in intent, too flat in its mental model.

The original Prompt-03 correctly cared about origins and environment variables.

But repo truth requires a sharper model:

- Project Setup host CORS
- shared host CORS
- Azure Function App resource-level applied config
- startup core config validation
- startup SharePoint warning tier
- provisioning-time prerequisites

Without that, a local agent could easily oversimplify or misdocument the real gating model.

## 6. Managed identity / connected-service stage

**Assessment:** aligned, but missing a stronger least-privilege and service-by-service matrix requirement.

The original Prompt-04 was already aimed at:

- SharePoint
- Graph
- Storage
- SignalR
- telemetry
- production service access model

But it needed to explicitly require:

- distinction between managed-identity app-only services and connection-string-based services
- explicit Sites.Selected vs full-control governance
- separation of code-ready versus tenant-blocked
- review of the live connected-service posture doc
- review of typed env gates and prerequisite gates

## 7. Deployment / runbook stage

**Assessment:** aligned, but documentation targets needed strengthening.

The original Prompt-05 is correct in concept.  
What it needed:

- explicit code-complete vs environment-ready vs tenant-ready vs production-approved distinctions
- explicit linkage to actual repo-truth blocker sources
- explicit treatment of admin approvals:
  - SharePoint API access approval
  - managed identity assignments
  - Graph permissions
  - CORS configuration
  - Sites.Selected grant confirmation
- explicit instruction to record which readiness items are repo-verifiable vs platform-only

## 8. Closure stage

**Assessment:** aligned.

The original closure prompt is conceptually correct.  
It needed stronger entry-criteria wording tied to:
- inbound auth contract frozen
- downstream service posture frozen
- CORS posture frozen
- environment validation model frozen
- known drift docs reconciled or classified
- tenant prerequisites clearly separated from code work

---

## Stale-Assumption and Authority-Drift Analysis

## 1. The package assumed a cleaner configuration-doc family than the repo actually has

Some prompt targets were written as if files like:

- `docs/reference/configuration/project-setup-api-auth-contract.md`
- `docs/reference/configuration/project-setup-environment-readiness.md`
- `docs/reference/configuration/project-setup-connected-services-readiness.md`

already existed or were already the authoritative family.

Current repo truth does not justify assuming that.

The revised package therefore changes the wording to:

- **create if absent, otherwise update**
- record whether the doc was created or updated
- reconcile against existing living docs already present in repo

## 2. The package did not identify `wave-0-config-registry.md` as a likely drift source

That doc is now risky because it still carries older assumptions that conflict with the current typed env registry and current validation logic.

It should be explicitly treated as a high-risk drift source for Phase 7.

## 3. The package did not identify `backend/functions/README.md` as a drift-risk operational doc

That file still contains older local-dev and config contract language and is highly likely to mislead later work if not reconciled.

It should be explicitly part of the review set.

## 4. The package did not explicitly use the already-created connected-service posture doc

`docs/reference/developer/project-setup-connected-service-posture.md` is now a live authority-family doc for this phase.  
The original package should have pointed to it explicitly.

## 5. The package treated CORS as purely repo-defined

Current repo truth shows that CORS is represented in repo `host.json`, but the effective setting still has a platform/resource application dimension.  
The prompt package must force the agent to distinguish those layers.

---

## Phase Order and Dependency-Flow Analysis

## Overall verdict

**Keep the stage order.**

The order is still correct:

1. repo-truth audit
2. auth contract freeze
3. CORS/environment hardening
4. managed identity / connected services
5. deployment gates / runbooks
6. closure

## Why the order is correct

- You should not harden CORS and environment guidance before the auth contract is explicit.
- You should not finalize connected-service readiness before the auth and env posture are frozen.
- You should not finalize deployment gates before the security and connected-service posture is explicit.
- You should not close the phase before the documentation set is internally coherent.

## What needed improvement

The dependencies between stages needed to be made more explicit:

- Stage 2 depends on Stage 1’s auth and drift findings
- Stage 3 depends on Stage 1 and Stage 2 freezing the host/auth contract
- Stage 4 depends on Stage 1, Stage 2, and Stage 3 clarifying identity and config posture
- Stage 5 depends on all prior technical posture decisions
- Stage 6 depends on verifying that all prior docs now agree

The revised package makes those dependencies more explicit.

---

## Gap Analysis

## Gap 1 — Missing auth-core source files

**Severity:** High

The original package did not force review of the live files that now define the actual auth contract:

- `validateToken.ts`
- `auth.ts`
- `authorization.ts`

Without these, the package could not safely freeze the inbound API contract.

## Gap 2 — Missing host-config source files

**Severity:** High

The original package did not force review of:

- Project Setup host.json
- shared host.json

That leaves the CORS stage underspecified and too easy to flatten incorrectly.

## Gap 3 — Missing typed config-registry and validation sources

**Severity:** High

The original package did not force review of:

- `wave0-env-registry.ts`
- `validate-config.ts`
- `adapter-mode-guard.ts`

Without those, the package cannot safely distinguish startup gates from runtime gates.

## Gap 4 — Missing current connected-service posture doc

**Severity:** Medium-High

The original package did not force review of the already-created connected-service posture document, even though it now captures several repo-truth conclusions that should govern the phase.

## Gap 5 — Inadequate drift-doc handling

**Severity:** Medium-High

The package did not explicitly identify:

- `wave-0-config-registry.md`
- `backend/functions/README.md`

as current drift-risk docs that could mislead later work.

## Gap 6 — Inadequate create-vs-update rules for target docs

**Severity:** Medium

The package assumed too much about target file existence.

## Gap 7 — Not enough distinction between inbound delegated auth and outbound app-only service auth

**Severity:** High

This is one of the most important conceptual risks in the original package.

---

## Risk Analysis

## Primary execution risk

A local code agent could follow the original package and produce documentation that is **mostly plausible but still unsafe**, because it could:

- describe auth correctly in broad terms while missing important claim/scope/issuer details
- treat startup validation as a single gate rather than a tiered model
- flatten CORS into one generic origin list
- fail to distinguish SPFx delegated caller posture from backend managed identity posture
- preserve older config registry language that no longer matches code
- assume target docs already exist and update the wrong authority family

## Secondary risk

The original package could produce a “production readiness” document set that looks complete while still failing to clearly separate:

- code truth
- platform configuration
- tenant-admin prerequisites
- unresolved rollout blockers

## Lower-order risk

Because the package already had a good structure, its main risk was **false confidence through incomplete precision**, not total misdirection.

---

## Package-Quality / Execution-Readiness Assessment

### Original package

- Objective quality: strong
- Phase structure: strong
- Repo-truth orientation: strong
- Source coverage: moderate
- Auth precision: moderate
- CORS/env precision: moderate
- Connected-service posture precision: moderate
- Drift-control discipline: moderate
- Execution safety: moderate

### Revised package

- Objective quality: strong
- Phase structure: strong
- Repo-truth orientation: strong
- Source coverage: strong
- Auth precision: strong
- CORS/env precision: strong
- Connected-service posture precision: strong
- Drift-control discipline: strong
- Execution safety: strong

---

## Prioritized Refinement List

## Priority 1 — Expand the source list for all prompts

Add explicit review of:

- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/authorization.ts`
- `backend/functions/src/hosts/project-setup/host.json`
- `backend/functions/host.json`
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/src/config/wave0-env-registry.ts`
- `backend/functions/src/utils/adapter-mode-guard.ts`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/services/managed-identity-token-service.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/graph-service.ts`
- `backend/functions/README.md`
- `apps/estimating/config/package-solution.json`
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/configuration/sites-selected-validation.md`
- `docs/reference/configuration/wave-0-config-registry.md`

## Priority 2 — Force create-if-absent rules for target docs

Do not assume exact target files already exist.

## Priority 3 — Freeze inbound auth contract more precisely

Require explicit answers for:

- audience
- accepted issuers
- token versions
- required claims
- delegated scope
- app-only workload exceptions
- SPFx permission request and admin approval posture

## Priority 4 — Freeze CORS and env model more precisely

Require explicit answers for:

- Project Setup host vs shared host
- repo-defined posture vs Azure resource-applied posture
- core startup gates
- warning-only startup checks
- provisioning-time gates

## Priority 5 — Freeze connected-service posture more precisely

Require service-by-service answers for:

- identity type
- token scope or credential type
- minimum permission posture
- tenant/admin prerequisite
- code-ready vs tenant-blocked status

## Priority 6 — Reconcile drift-risk docs explicitly

Require explicit classification and reconciliation of:

- `wave-0-config-registry.md`
- `backend/functions/README.md`

---

## Explicit Unresolved Questions

These do not block the revised package, but they should remain visible:

1. **Does the Accounting SPFx package also need an explicit web API permission request in `package-solution.json`, or is API access currently isolated to the estimating-side Project Setup surface?**  
   The revised prompts should verify this rather than assume.

2. **Should the Project Setup production deployment ultimately use only the domain-scoped host.json, with the shared host treated as non-authoritative for this domain, or is the broader shared-host CORS posture still intended to remain part of the deployed runtime for some environments?**

3. **How much of the older config registry should be repaired in place versus left as historical drift evidence after a new project-setup-specific config doc family is created?**

4. **Should the next phase formally collapse remaining legacy `real` vocabulary to `proxy`, or is Phase 7 limited to documenting and gating that compatibility rather than removing it?**

---

## Final Assessment

The original Phase 7 package was a good skeleton, but it was not precise enough to safely govern security and connected-service readiness work against the live repo.

The revised package preserves the correct structure and strengthens the exact areas where current repo truth now demands tighter guidance:

- inbound auth contract
- SPFx access approval model
- domain-scoped vs shared host CORS posture
- tiered environment validation
- managed identity and connected-service separation
- Sites.Selected governance
- drift-doc reconciliation
- create-vs-update clarity for target docs

That makes it a safer and more useful implementation guide.
