# Pre-Phase-1 Contradiction Closeout and Go/No-Go Register

**Doc Classification:** Closeout Register — Final
**Description:** Pre-implementation reconciliation record. 26 contradictions tracked (23 closed, 3 surfaced in final sweep), go/no-go checklist, and blocker ledger.
**Date:** 2026-03-18 (final sweep)
**Scope:** 7 reconciliation passes (6 systematic + 1 deep-search final sweep) across planning authority, Phase 0 status, Phase 1 readiness, contract baseline, integration paths, auth/permission model, and a comprehensive repo-truth deep search.

---

## How to Read This Register

**Closure types:**
- **Doc-Closed** — A documentation inconsistency was corrected in planning files. No code change required. (Items 1–16, 19–24)
- **Code-Closed** — Code was added or modified in the repo to resolve the issue. (Items 17, 18, 25, 26; Blockers #4, #6, #8, #9, #10)
- **External-Pending** — Blocked on an action outside engineering's control (IT permission grant, PO approval). (Blockers #2, #3, #5)
- **Engineering-Active** — Implementation work is in progress. (Blocker #7)

A "Closed" item means the specific contradiction or blocker is resolved. It does NOT mean all downstream implementation is complete — implementation readiness is tracked in the Phase 1 README, not here.

---

## Executive Summary

Seven reconciliation passes were completed on 2026-03-18. The first six resolved 23 planning contradictions across the Phase 0/Phase 1 documentation and codebase. A final deep-search sweep identified 3 additional issues (#24–#26); all 3 have since been closed (2 via code delivery, 1 via doc correction). Total: 26 tracked contradictions, all closed.

All transport-layer design decisions (D1–D6, A8, A9) are locked and propagated. The pre-Phase-1 go/no-go checklist passes 7/7 (gate #5 corrected in final sweep commit).

**Blocker ledger:** 6 closed, 4 remaining (2 external/IT, 1 external/PO, 1 engineering in-progress).

**Recommendation: Ready with conditions.**

- **Begin now:** B1 (proxy adapters — 7 of 11 done), C2 (auth middleware), C3 (observability)
- **Blocked on B1 completion:** D1 (write safety wiring), E1 (contract tests), E2 (staging checklist)
- **Blocked on external actions:** IT permission grants (#2 per-site, #3 Graph), PO schema approval (#5)
- **Internal engineering tasks surfaced by final sweep:** #8 README fix (closed), #9 adapter-mode vocabulary remediation (closed — code delivered), #10 B3 Layer 2 startup guard (closed — code delivered)

---

## Contradiction Closeout Register

### Prompt 1 — Planning Authority Reconciliation (commit 3b4b292)

| # | Issue | Correction | Status |
|---|---|---|---|
| 1 | docs/README.md pointed to ph7-remediation as active plan | Replaced with MVP/Wave 0 as active execution baseline (PH7 signed off 2026-03-09) | Closed |
| 2 | Blueprint Crosswalk dead link in docs/README.md | Replaced with Master Plan Set link (file confirmed absent on disk) | Closed |
| 3 | MASTER README had no plan-stack crosswalk | Added "Relationship to Other Plan Stacks" section covering MVP, PH7, domain plans | Closed |
| 4 | MASTER classification was "Canonical Normative Index" | Changed to "Planning Authority Index" (navigational, not execution) | Closed |

### Prompt 2 — Phase 0 Status Normalization (commit dc6c51e)

| # | Issue | Correction | Status |
|---|---|---|---|
| 5 | Phase 0 deliverables README listed all 7 files as "Draft" | Updated to per-file actual status (Complete/Adopted/Approved) per P0-E1 evidence | Closed |
| 6 | Phase 0 plan said "Draft for working use" | Changed to "Complete — All deliverables produced, all milestones satisfied" | Closed |
| 7 | P0-A1 said M0.1 "conditionally satisfied"; D-005 pending | Updated to "satisfied"; D-005 resolved per P0-E1 (2026-03-16) | Closed |
| 8 | P0-A2 D-005 "GOVERNANCE CLOSURE PENDING" | Updated to "RESOLVED 2026-03-16"; summary counts corrected (6 resolved) | Closed |
| 9 | P0-D1 status "Draft" with internally RESOLVED gaps | Changed to "Complete — All Phase 1 entry gaps resolved" | Closed |

### Prompt 3 — Phase 1 Readiness Re-Baseline (commit 4753a88)

| # | Issue | Correction | Status |
|---|---|---|---|
| 10 | P1 README used "Execution-Ready" for blocked items (P1-E1) | Replaced vocabulary: Implementation-Ready / Implementation-Ready — Blocked; added repo-truth notes section | Closed |

### Prompt 4 — Backend Contract Divergence (commit ba8b3d5)

| # | Issue | Correction | Status |
|---|---|---|---|
| 11 | P1-C1 error field said `error` (not `message`) | Corrected to `message` per D3 lock (P1-E1 Locked Decision 2) | Closed |
| 12 | P1-C1 pagination default 50, max 200 | Corrected to 25, max 100 per D4 lock (P1-E1 Locked Decision 4) | Closed |
| 13 | P1-C1 said "PUT and PATCH" for mutations | Corrected to PUT-only per D5 lock; PATCH deferred to Phase 2 | Closed |
| 14 | P1-C1 collection envelope used `data` field | Corrected to `items` per P1-E1 `createPagedSchema` | Closed |
| 15 | P1-C1 open decisions D1–D6, A8, A9 listed as unresolved | All 8 marked RESOLVED with P1-E1 line references | Closed |
| 16 | P1-C2 error shape said `error, code, requestId` | Corrected to `message, code, requestId` per D3 lock | Closed |

### Prompt 5 — Integration Path Classification (commit ef15f2c)

| # | Issue | Correction | Status |
|---|---|---|---|
| 17 | Proxy handler appeared production-ready (no stub indicator) | Added "INTEGRATION PATH: STUB" header comment; annotated mock response line | Closed |
| 18 | Redis cache service had no classification | Added "INTEGRATION PATH: MOCK-ONLY" header comment | Closed |
| 19 | P1-B1 stale D3 assumption (reads `.error` first) | Updated A4 to `.message` first per D3 lock | Closed |
| 20 | P1-B1 stale D6 assumption (flat `?projectId=` params) | Updated A7 to nested paths per D6 lock; Appendix B reconciliation note added | Closed |
| 21 | P1-B1 stale collection envelope (`data` field) | Updated A2 to `items` per E1 lock | Closed |

### Prompt 6 — Auth Boundary Model Freeze (commit 5bae5b9)

| # | Issue | Correction | Status |
|---|---|---|---|
| 22 | No developer-facing auth boundary model | Added Phase 1 Auth Boundary Model section to P1-C2 with 4-surface map, credential model, permission requirements, blocker list, and IT Setup Guide link | Closed |
| 23 | P1-E2 referenced stale D3 error shape (5 instances) | Corrected all from `{ error: '...' }` to `{ message: '...' }` per D3 lock | Closed |

### Final Sweep — Deep Search (2026-03-18)

A deliberate deep search across the full repo identified 3 issues not caught in prior passes:

| # | Issue | Why Missed Earlier | Correction | Status |
|---|---|---|---|---|
| 24 | `packages/data-access/README.md` proxy status stale — says "Stub (config only)" but 7 of 11 proxy repos are implemented | README was not updated when B1 repos were committed (a1584b5) | Updated to "Partial (7 of 11 repos implemented)" | Closed (this commit) |
| 25 | Backend `service-factory.ts` defaults to `'real'` instead of canonical `'proxy'` mode — splits behavior when `HBC_ADAPTER_MODE` unset | Known in P1-B3 as tracked remediation but not surfaced as a closeout blocker | `normalizeAdapterMode()` maps 'real'→'proxy'; `assertAdapterModeValid()` defaults to 'proxy'; wired into `createServiceFactory()` | Closed (code) |
| 26 | P1-B3 Layer 2 startup guard (`adapter-mode-guard.ts`) not created — defense-in-depth mock isolation incomplete | Listed in P1-B3 scope as "to be created" but not tracked in CLOSEOUT | `assertAdapterModeValid()` created in `adapter-mode-guard.ts`; rejects unknown modes, blocks mock-in-production; wired into `createServiceFactory()` | Closed (code) |

---

## Pre-Phase-1 Go/No-Go Checklist

| # | Area | Condition | Status | Evidence |
|---|---|---|---|---|
| 1 | Canonical planning authority | docs/README.md and MASTER/README.md present unambiguous plan hierarchy | **PASS** | Commit `3b4b292` |
| 2 | Phase 0 status normalization | All Phase 0 artifacts use consistent, evidence-based status labels | **PASS** | Commit `dc6c51e` |
| 3 | Phase 1 readiness truth | No deliverable overstates implementation readiness; blocked items explicitly named | **PASS** | Commit `4753a88` |
| 4 | Contract baseline truth | One authoritative contract baseline; planned vs actual behavior documented | **PASS** | Commit `ba8b3d5` |
| 5 | Adapter/proxy readiness truth | Real, stub, and mock paths classified; no misleading readiness claims | **PASS** | Commit `ef15f2c`; data-access README corrected in final sweep |
| 6 | Auth/permission model clarity | Canonical auth boundary model; 4-surface map; blockers documented | **PASS** | Commit `5bae5b9` |
| 7 | Transport decisions locked | D1–D6, A8, A9 all resolved and propagated to C1, B1, E1 | **PASS** | P1-E1 Locked Decisions Applied |

**Result: 7/7 PASS**

---

## Recently Closed Blockers

| # | Blocker | Closed By | Date |
|---|---|---|---|
| 1 | OBO endpoint list not finalized | Endpoint Auth Matrix added to P1-C2 | 2026-03-18 (commit `1db75a9`) |
| 4 | Startup config validation not wired (G2.6) | `validateRequiredConfig()` wired into `createServiceFactory()` | 2026-03-18 (commit `4f89f0f`) |
| 6 | B1 Appendix B route paths predate D6 lock | All 7 domain route tables updated to D6 nested pattern | 2026-03-18 (commit `5370296`) |

---

## Remaining Implementation Blockers

| # | Blocker | Impact | Owner | Workstream | Status |
|---|---|---|---|---|---|
| 2 | Per-site grant process | Manual grants required for each new project site | IT + Architecture | Ops | **Process-documented** — `tools/grant-site-access.sh` + `IGraphService.grantSiteAccess()` automation hook. Full automation deferred to post-pilot. |
| 3 | GraphService `Group.ReadWrite.All` | Step 6 Entra group creation gated until IT confirms permission | Backend + IT | Ops | **Code-complete** — gated behind `GRAPH_GROUP_PERMISSION_CONFIRMED` env var. Awaiting IT grant. |
| 5 | SharePoint schema approval | Physical lists cannot be deployed to tenant | Product Owner | A3 | **Approval-ready** — [P1-A3-Schema-Approval-Package.md](P1-A3-Schema-Approval-Package.md) prepared for PO review. Adapter dev proceeds against mocks. |
| 7 | B1 proxy adapter implementation | D1/E1/E2 blocked until complete | Engineering | B1 | **In progress** — 7 of 11 repos done (Schedule, Buyout, Compliance, Contract, Risk, Scorecard, PMP). Remaining: Lead, Project, Estimating, Auth. |
| 8 | data-access README proxy status stale | Implementers may incorrectly assume proxy is greenfield | Engineering | B1 | **CLOSED** — corrected in this final sweep commit |
| ~~9~~ | ~~Backend adapter-mode vocabulary drift~~ | ~~defaults to 'real' not canonical 'proxy'~~ | ~~Engineering~~ | ~~C2/B3~~ | **CLOSED** — `normalizeAdapterMode()` maps 'real'→'proxy'; default changed to 'proxy'; wave0 registry and README updated |
| ~~10~~ | ~~B3 Layer 2 startup guard not created~~ | ~~defense-in-depth mock isolation incomplete~~ | ~~Engineering~~ | ~~B3~~ | **CLOSED** — `assertAdapterModeValid()` in `adapter-mode-guard.ts` wired into `createServiceFactory()`; rejects unknown modes and blocks mock-in-production |

**Active blocker count: 4** (2 external/IT, 1 external/PO, 1 engineering in-progress)

---

## Implementation Readiness Summary

| Workstream | Can Begin Now | Blocked On |
|---|---|---|
| **B1** — Proxy Adapter Implementation | **Yes** — 7 repos done; remaining 4 (Lead, Project, Estimating, Auth) can proceed against mocked fetch | Production activation: C1 route finalization, MSAL registration |
| **C2** — Auth Middleware and Validation | **Yes** — builds on existing `validateToken()`; OBO endpoint list resolved (blocker #1 closed); adapter-mode vocabulary remediated (blocker #9 closed) | — |
| **C3** — Observability Instrumentation | **Yes** — logging foundation verified complete | Telemetry events depend on B1/C2 delivering routes/middleware |
| **D1** — Write Safety and Recovery | **Partially unblocked** — `ProxyHttpClient` now exists; standalone retry types + idempotency types can proceed; wiring into proxy repositories requires B1 completion | B1 remaining 4 repos for full wiring |
| **E1** — Contract Test Suite | Transport conventions locked; harness design ready | B1 adapter repos + C1 route handlers must exist |
| **E2** — Staging Readiness Checklist | Prep-only sections | All upstream workstreams + staging infrastructure |

---

## Related Documents

- **Phase 1 Deliverables Index:** [README.md](README.md)
- **SharePoint Schema Approval Package:** [P1-A3-Schema-Approval-Package.md](P1-A3-Schema-Approval-Package.md)
- **Phase 0 Status Normalization Record:** [../phase-0-deliverables/README.md](../phase-0-deliverables/README.md#phase-0-status-normalization-record)
- **Contract Divergence Register:** [P1-C1 §Contract Divergence Register](P1-C1-Backend-Service-Contract-Catalog.md#contract-divergence-register-pre-phase-1-baseline)
- **Auth Boundary Model:** [P1-C2 §Phase 1 Auth Boundary Model](P1-C2-Backend-Auth-and-Validation-Hardening.md#phase-1-auth-boundary-model)
- **Integration Path Readiness:** [packages/data-access/README.md §Integration Path Readiness](../../../../../packages/data-access/README.md#integration-path-readiness-as-of-2026-03-18)
- **IT Department Setup Guide:** [IT-Department-Setup-Guide.md](../../../../how-to/administrator/setup/backend/IT-Department-Setup-Guide.md)

---

**Prepared:** 2026-03-18 (final sweep)
**Reconciliation passes:** 7 (commits `3b4b292` through `6e997d5` + final sweep)
**Contradictions tracked:** 26 (all closed — 23 from systematic passes, 3 from final sweep)
**Blockers:** 6 closed, 4 remaining (2 external/IT, 1 external/PO, 1 engineering in-progress)
**Newly discovered issues in final sweep:** 3 (#24 README drift — closed, #25 adapter-mode vocabulary — closed, #26 B3 Layer 2 guard — closed)
