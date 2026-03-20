# HB Intel Architecture Documentation Reconciliation
## Summary, Change Ledger, and Residual Issues

**Date:** 2026-03-20
**Reconciliation scope:** Phase 1 MASTER plan documents and architecture audit report
**Trigger:** Architecture audit surfaced 11 Microsoft platform claim corrections; Phase 1 implementation status became code-complete after audit report was originally written

---

## Part 1: Reconciliation Summary

### What Changed and Why

This reconciliation applied two categories of corrections:

**Category A — Implementation status updates**

All Phase 1 engineering workstreams (B1, C1, C2, C3, D1, E1) reached code-complete status as of 2026-03-19. Multiple planning documents retained stale "not yet started" or "implementation pending" language for C1, C2, C3, and D1. These claims contradicted the authoritative deliverables README and were corrected to reflect the actual repo state.

**Category B — Microsoft platform claim corrections**

The architecture audit report contained 11 claims requiring precision correction. The changes are labeled below using four claim classifications:

- **Hard Microsoft requirement** — Technical requirement; non-compliance causes failures
- **Strong best practice** — Strongly recommended; non-compliance creates operational risk
- **Project recommendation** — Appropriate for HB Intel's context; not a universal requirement
- **Future-state option** — Applies only to the Azure target-state, not current MVP

---

## Part 2: Claim Classification for Audit Report Corrections

| # | Original Claim | Corrected Claim | Classification |
|---|---|---|---|
| 1 | "Microsoft requires separate storage accounts for host and app data" | Separation is a **strong best practice**, not a hard requirement. Same-account is technically supported but creates lifecycle policy blast radius and RBAC coupling. | Strong best practice |
| 2 | (Implicit) AzureWebJobsStorage works anywhere | Azure Functions host **requires** Blob + Queue + Table services available; same-region strongly preferred; **cannot** use network-secured storage with Consumption plan | Hard Microsoft requirement |
| 3 | "@azure/data-tables supports Cosmos DB for Table migration" | Corrected to explicitly call `@azure/data-tables` the **intentional migration seam** (connection-string-only swap; not a rewrite) | Hard Microsoft fact |
| 4 | "Cosmos DB serverless throughput model for cost control" | Serverless is single-region only. **Multi-region requires provisioned throughput** with a different account strategy | Hard Microsoft requirement |
| 5 | "Cosmos DB for Table emulator can be used in CI" | The Docker/Linux Cosmos DB emulator does **not** support the Table API endpoint. Only the Windows local emulator supports Table storage. **CI on Linux agents may require a real Azure test account** | Hard Microsoft requirement |
| 6 | "Cosmos DB native TTL via the `_ts` property" | `_ts` is a system-managed timestamp, **not the TTL setting knob**. TTL is set via `DefaultTimeToLive` at the container or database level. Items use an explicit `ttl` property or the container default. | Hard Microsoft requirement (precision) |
| 7 | "Managed Identity has correct RBAC role assignments: Storage Table Data Contributor..." | RBAC must be **specific per resource** — not one blanket role. Distinct roles for: host storage, app-data Table/Cosmos DB, SignalR, App Insights, Key Vault. No Contributor role on resource group. | Strong best practice + precision |
| 8 | "Key Vault references planned for production secrets" | Endpoint URIs and account names are **configuration** (app settings), not secrets. Only credentials and keys go to Key Vault. | Hard Microsoft best practice |
| 9 | "5,000 items triggers migration from SharePoint" | 5,000 is a **list-view/query threshold** concern, not a storage ceiling. SharePoint Online can hold far more items. The real migration trigger is when query patterns or app-data needs don't fit SharePoint. | Precision correction |
| 10 | "Azure Queue Storage provides dead-letter queue" | Storage Queues have **no true DLQ**. Poison messages use max dequeue count → companion poison queue (manual monitoring). True DLQ capability requires Service Bus. | Hard Microsoft requirement (precision) |
| 11 | "Blob Storage boundary: templates should stay in SharePoint" | Confirmed and sharpened: Blob is for **app-managed objects** (imports, exports, generated artifacts). SharePoint document libraries remain the correct home for **project team collaboration documents**. These are distinct concerns. | Project recommendation (sharpened) |

---

## Part 3: File-by-File Change Ledger

### `docs/architecture/plans/MASTER/phase-1-deliverables/HB-Intel-Architecture-Audit-2026-03-20.docx`

| Section | Change |
|---|---|
| §3.2 Functions Host Storage Isolation | Replaced "Microsoft recommends separate accounts" with full precise statement: hard requirements (Blob+Queue+Table; same-region; Consumption plan cannot use network-secured storage) + strong best practice (separation for lifecycle/RBAC) |
| §3.3 Cosmos DB for Table Readiness | Added serverless single-region constraint; corrected TTL to use `DefaultTimeToLive` container property, not `_ts`; explicitly named `@azure/data-tables` as the migration seam |
| §3.5 Blob Storage Readiness | Sharpened distinction: Blob = app-managed objects; SharePoint = project team collaboration documents |
| §3.6 Queue Storage Readiness | Corrected DLQ claim: Storage Queues have no true DLQ (poison queue via max dequeue count only); Service Bus is needed for true DLQ |
| §3.8 Identity/Config/Deployment | Added per-resource RBAC specificity; added secrets vs config distinction (endpoints = config; credentials = Key Vault) |
| §5.1 Deployment Checklist | "Two storage accounts required" → labeled "strong best practice" with precise host requirements |
| §5.7 RBAC Checklist | Specific roles listed per resource |
| §5.10 Test Coverage | Cosmos DB emulator note: Docker/Linux does not support Table API |
| §6 MVP Viability | SharePoint 5,000 item limit corrected: query design concern, not storage ceiling |
| §7.3 Preparation Sequence WS 3 | Added serverless single-region constraint; added Linux CI emulator limitation note |
| §8 Decisions | "5,000 items" migration trigger replaced with correct trigger (query pattern/app-data fit) |

### `docs/architecture/plans/MASTER/02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md`

| Location | Change |
|---|---|
| Header Status (line 5) | "Planning Complete — implementation pending" → "Implementation Complete — code-complete across all workstreams; E2 gated on staging deployment" |
| §Planning Completion Summary (line 15) | Replaced stale "C1, C2, C3 not yet started" with accurate code-complete summary |
| §15 Execution Priorities | Preserved original sequencing as planning record; annotated each step as COMPLETE or PENDING |

### `docs/architecture/plans/MASTER/README.md`

| Location | Change |
|---|---|
| Phase 1 summary text | "B1 transport and 10 of 11 repos" → "all implementation workstreams code-complete as of 2026-03-19" |
| Implementation Baseline table | "Ready for narrow kickoff" → "Code-complete"; "Complete remaining 4 proxy repos" → "Resolve IT-side staging deployment blockers" |

### `docs/architecture/plans/MASTER/phase-1-deliverables/README.md`

| Location | Change |
|---|---|
| Workstream D index | P1-D1 status: "Partially Unblocked" → "Complete (2026-03-19)" |
| Workstream E index | P1-E2 status: "BLOCKED (C1 domain routes, staging infrastructure)" → "Gated on staging deployment — all code dependencies delivered" |
| Repo-Truth Notes | "Backend domain data routes — not implemented" → "C1 complete (2026-03-19)" with delivered items listed |
| Phase 1 Completion Criteria | Removed "until C1 routes, C2 auth, C3 instrumentation ... are complete" |
| Carry-Forward Items | C1, C2, C3 statuses: "Implementation pending" → "Complete (2026-03-19)" with delivered evidence |

### `docs/architecture/plans/MASTER/phase-1-deliverables/P1-CLOSEOUT-Pre-Phase-1-Contradiction-Register.md`

| Location | Change |
|---|---|
| Executive Summary | Blocker ledger: "6 closed, 4 remaining (1 engineering in-progress)" → "7 closed, 3 remaining (engineering blocker #7 CLOSED 2026-03-19)" |
| Recommendation block | "Begin now: B1 Auth, C2, C3" → "Complete: B1, C1, C2, C3, D1, E1 — gated on staging deployment for E2" |
| Implementation Readiness Summary | C2, C3: "Yes" → "Complete"; D1, E1: "Unblocked" → "Complete"; E2: updated to "Gated on staging deployment" |
| Footer | Blockers count updated to match Executive Summary |

### `docs/architecture/plans/MASTER/phase-1-deliverables/P1-D1-Write-Safety-Retry-Recovery.md`

| Location | Change |
|---|---|
| Header Status | "Implementation-Ready — partially unblocked" → "Complete (2026-03-19)" |
| Current Repo State | All stale "10 of 11 repos", "no retry logic", "no idempotency guard" entries updated to COMPLETE |

### `docs/architecture/plans/MASTER/phase-1-deliverables/P1-E2-Staging-Readiness-Checklist.md`

| Location | Change |
|---|---|
| Header Status | "BLOCKED (C1 domain routes, staging infrastructure)" → "Gated on staging deployment — all code dependencies delivered" |
| Repo Truth Snapshot | Domain route handlers: "None exist" → "C1 DELIVERED" |
| Planned but Blocked | Domain route handlers: "BLOCKED on C1" → "DELIVERED (C1)" |
| Staging Env Matrix | OBO app registration: "C2 not delivered" → "C2 code delivered; IT action required for physical registration" |
| Staging Env Matrix | Health endpoint: "NOT registered" → "DELIVERED" |
| Dependency Matrix | All sections: "BLOCKED on C1 + C2" → "GATED on staging deployment"; C1/C2 checkmarks added |
| Section 1 | Health endpoint: "BLOCKED — no health function" → "DELIVERED — gated on staging deploy" |
| Section 2 header | "BLOCKED on C2" → "GATED on staging deployment (C2 delivered)" |
| Section 2 current/target table | 401 shape: "current: `{ error, reason }` / target after C2: `{ message, code }`" → "C2 DELIVERED — shape is `{ message, code: 'UNAUTHORIZED' }`" |
| Sections 3–8, 10 headers | "BLOCKED on C1 + C2" → "GATED on staging deployment (C1 ✅, C2 ✅)" |
| Section 9 Write-Safety table | All NOT FROZEN/BLOCKED items → DELIVERED |
| Section 9 "CONFIRMED NOW" | "Nothing verifiable" → "All D1 infrastructure code-complete; verifiable after staging deployment" |
| Section 10 auth shape | "current: `{ error, reason }` / target after C2" → "C2 delivered — shape is `{ message, code }`" |

### `docs/architecture/plans/MASTER/phase-1-deliverables/P1-C3-Observability-and-Instrumentation-Spec.md`

| Location | Change |
|---|---|
| Header Status | "Spec-complete — only logger + provisioning telemetry implemented" → "Complete — code (2026-03-19)" with full delivered list |
| Implementation Baseline | ❌ items for proxy.request.*, auth.*, withTelemetry(), health endpoint → ✅ COMPLETE |

---

## Part 4: Residual Issues and Open Decisions

These items were identified during the reconciliation but are not resolved by documentation changes alone. They require engineering, infrastructure, or organizational decisions.

### R1 — IaC gap ✅ RESOLVED

Bicep IaC added in `infra/main.bicep` defining two storage accounts (`hbintelhost{env}` for Functions host, `hbinteldata{env}` for app data tables) with per-resource RBAC role assignments for Managed Identity. Storage topology, network posture, and RBAC are now verifiable from the repository.

**Owner:** Platform engineering + DevOps
**Resolved:** 2026-03-20 — `infra/main.bicep` with host + data account definitions and RBAC assignments

---

### R2 — Production storage topology ✅ RESOLVED

Two-account topology confirmed and implemented. `AzureWebJobsStorage` maps to `hbintelhost{env}` (Functions host runtime). `AZURE_TABLE_ENDPOINT` (renamed from `AZURE_STORAGE_CONNECTION_STRING`) maps to `hbinteldata{env}` (app data tables). All 12 domain services now use `createAppTableClient()` which supports both endpoint URL (production, Managed Identity) and connection string (local dev, Azurite) modes.

**Owner:** Platform engineering
**Resolved:** 2026-03-20 — env var renamed, `table-client-factory.ts` created, config registry updated

---

### R3 — Cosmos DB serverless single-region planning — DECIDED

**Decision:** Cosmos DB serverless (single-region) for MVP. Multi-region is not required at current scale. Serverless provides cost control during early adoption without committing to provisioned RU capacity.

**Migration trigger:** When multi-region replication becomes a business requirement, the Cosmos DB account throughput model will be changed from serverless to provisioned. This is a Cosmos DB account-level configuration change — no application code changes are required since the `@azure/data-tables` SDK and `AZURE_TABLE_ENDPOINT` connection pattern are throughput-model-agnostic.

**Owner:** Architecture + Product
**Decided:** 2026-03-20 — serverless single-region accepted for MVP

---

### R4 — Linux CI emulator gap for Cosmos DB Table API — DECIDED

**Decision:** Interface-only testing with mock adapters for CI. Every domain service has a `Mock*Service` implementation wired through `IServiceContainer`. Unit tests run against mocks on Linux CI (`ubuntu-latest`). Integration tests against the live Cosmos DB Table API run in staging (real Azure account), not in CI. This avoids Windows CI agent cost and real-Azure-account-in-CI credential complexity.

The Cosmos DB Table API migration is complete. The `@azure/data-tables` SDK works transparently with both Azure Table Storage and Cosmos DB Table API endpoints — `createAppTableClient()` handles the connection seamlessly. `infra/main.bicep` now defines the Cosmos DB account (`hbintel-table-{env}`, serverless, single-region per R3).

**Owner:** Engineering + DevOps
**Decided:** 2026-03-20 — mock adapters for CI; integration tests in staging; Cosmos DB IaC deployed

---

### R5 — `responseBodyJson` entity size risk in IdempotencyRecords ✅ RESOLVED

`recordIdempotencyResult()` in `idempotency-guard.ts` now caps `responseBodyJson` at 32KB. Oversized bodies are replaced with a JSON truncation marker (`_idempotencyTruncated: true`) that preserves idempotency deduplication while preventing Azure Table entity size violations.

**Owner:** Engineering
**Resolved:** 2026-03-20 — `capResponseBody()` in `backend/functions/src/idempotency/idempotency-guard.ts`

---

### R6 — IProjectRequestsRepository port interface ✅ RESOLVED

`IProjectRequestsRepository` port interface extracted; `SharePointProjectRequestsAdapter` created. The migration seam for the SharePoint-to-Cosmos DB transition is now in place. `MockProjectRequestsRepository` provides the test adapter.

**Owner:** Engineering
**Resolved:** 2026-03-20 — pure rename refactor in `backend/functions/src/services/project-requests-repository.ts`

---

### R7 — `listRequests()` query cap pagination ✅ RESOLVED

`listRequests()` in `project-requests-repository.ts` now uses PnPjs `getAll(5000)` which handles `$skiptoken`-based pagination internally. Silent truncation at 5,000 items is eliminated.

**Owner:** Engineering
**Resolved:** 2026-03-20 — replaced `.top(5000)()` with `.getAll(5000)` in `SharePointProjectRequestsAdapter`

---

### R8 — Dashboards, alert rules, and operational runbooks absent

No Azure Monitor alert rules, Application Insights workbooks, or operational runbooks exist in the repository. The provisioning pipeline has no alerting for failure rate, Step 5 retry exhaustion, or timer function failures.

**Owner:** DevOps + Platform
**Blocks:** Production-grade operational readiness

---

### R9 — Key Vault reference configuration not visible in repo

Key Vault references are documented as planned for production secrets but no implementation is visible in the repository. The current pattern uses explicit connection strings.

**Owner:** Platform engineering
**Action required:** Implement Key Vault references for credentials/keys before production; keep endpoint URIs as app settings

---

### R10 — OBO app registration outstanding (IT action) — ACKNOWLEDGED, IT-GATED

The OBO (On-Behalf-Of) token exchange for downstream API calls requires IT to provision an Entra ID app registration with the appropriate scope grants. C2 code (`ManagedIdentityOboService`, `withAuth()`, endpoint auth matrix) is fully delivered (2026-03-19). The physical registration is an IT-owned external dependency running in parallel with engineering work.

**Owner:** IT + Architecture
**Status:** IT action required; not an engineering blocker. C2 code delivered. Only `/api/proxy/{*path}` OBO routes are affected; all Phase 1 domain data routes use Managed Identity and are unblocked.
**Formally acknowledged:** 2026-03-20 — engineering scope complete; IT registration runs as a parallel track

---

## Part 5: Items Deliberately Preserved (Not Changed)

These items appear potentially stale but were intentionally preserved:

- **P1-D1 Decision 3 (lines 192–198)**: Accurately describes Azure Table Storage having no native TTL with application-enforced approach via `expiresAt` + cleanup timer. This remains correct as a description of the current implementation. The audit report correction applies to future Cosmos DB migration guidance only.
- **P1-A1 and P1-A2**: No storage architecture claim corrections needed. Both files correctly describe Azure Table Storage, SharePoint, and storage platform capabilities without overstating requirements.
- **P1-B1, P1-B2, P1-B3, P1-E1**: No implementation status changes needed. B-series and E1 were already correctly described as complete or in-progress.
- **Section 9 "TARGET AFTER D1 + B1 DELIVERY" checklists in P1-E2**: The checkbox items themselves are correct staging acceptance criteria. Only the "CONFIRMED NOW" text and dependency labels were updated.

---

*Reconciliation prepared 2026-03-20. Governing sources: live repo truth (2026-03-19), Microsoft Azure Functions documentation, Microsoft Cosmos DB documentation, Microsoft Azure Storage documentation.*
