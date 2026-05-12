# B04 — HB Intel My Dashboard My Work Read Models, Routes, Error Taxonomy, and Fixture Architecture Development

**Artifact status:** Batch 04 authoritative development-planning artifact  
**Prepared:** 2026-05-12  
**Target initiative:** HB Intel **My Dashboard** SPFx domain, **My Work shell**, and **Adobe Sign Action Queue** first module  
**Repo continuation anchor:** `ea60ef3d639483abc4d7cea82c66afdcc8e24b6f`  
**Immediate predecessor:** `B03_My_Work_Shell_Navigation_And_UX_Development.md`  
**Binding predecessors:**  
- `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`
- `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`
- `B03_My_Work_Shell_Navigation_And_UX_Development.md`

**Source outline:** `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md`  
**Batch scope:** Detailed development of plan Sections **12**, **13**, **18**, and **24** only. This is a closed-decision architecture and data-contract planning artifact, not runtime implementation and not a local code-agent prompt package.

---

# Executive Verdict

## Final verdict

**Proceed with a dedicated My Work read-model contract family under `packages/models/src/myWork/`, a backend-for-frontend read-model host under `backend/functions/src/hosts/my-work-read-model/`, and exactly two MVP GET routes: `my-work/me/home` and `my-work/me/adobe-sign/action-queue`.**

Batch 04 closes the data-contract layer as follows:

1. **The My Dashboard SPFx shell receives HB Intel-facing read models, not raw Adobe Sign payloads.**  
   The route layer acts as a BFF/read-model seam tailored to the My Work experience. It normalizes upstream Adobe Sign data into stable My Work DTOs and shields the UI from upstream payload churn. This aligns with the established repository posture used by PCC and with the Backends for Frontends pattern. [W1]

2. **The My Work read-model namespace is a narrow BFF/DTO layer, not a replacement for `@hbc/my-work-feed`.**  
   Batch 01’s “bridge route” is now closed: the MVP should create `packages/models/src/myWork/` for My Dashboard route DTOs and envelopes, while preserving `@hbc/my-work-feed` as the existing cross-module personal-work aggregation primitive. No competing enterprise-wide My Work platform model is introduced in this batch.

3. **The envelope contract is now locked.**  
   My Work uses:
   - `mode: 'fixture' | 'backend'`
   - `sourceStatus` values:
     - `available`
     - `partial`
     - `configuration-required`
     - `authorization-required`
     - `principal-unresolved`
     - `source-unavailable`
     - `backend-unavailable`
   - `readOnly: true`
   - structured warnings
   - deterministic `generatedAtUtc`
   - route-specific `data`.

   This intentionally avoids repeating PCC’s current mode-vocabulary drift between shared-model literals and frontend client transport behavior.

4. **The route registry is now locked.**
   ```text
   home                         -> my-work/me/home
   adobe-sign-action-queue      -> my-work/me/adobe-sign/action-queue
   ```
   Production HTTP endpoints are:
   ```http
   GET /api/my-work/me/home
   GET /api/my-work/me/adobe-sign/action-queue
   ```

5. **The frontend client surface is now locked.**
   ```ts
   getMyWorkHome()
   getAdobeSignActionQueue(query?)
   ```
   No user email, actor override, or cross-user path/query surface is permitted.

6. **The My Work Home read model is now locked.**  
   It carries:
   - actor display snapshot,
   - summary counts for the shell/home card,
   - source readiness entries,
   - an Adobe Sign Action Queue home projection with summary and preview items.

7. **The Adobe Sign Action Queue read model is now locked.**  
   It carries:
   - queue summary,
   - normalized queue items,
   - pagination metadata,
   - freshness metadata,
   - no UI copy and no raw upstream envelope leakage.

8. **The Adobe queue item and summary contracts are now locked.**  
   The queue recognizes exactly six actionable Adobe recipient statuses for MVP:
   - `WAITING_FOR_MY_SIGNATURE`
   - `WAITING_FOR_MY_APPROVAL`
   - `WAITING_FOR_MY_ACCEPTANCE`
   - `WAITING_FOR_MY_ACKNOWLEDGEMENT`
   - `WAITING_FOR_MY_FORM_FILLING`
   - `WAITING_FOR_MY_DELEGATION`. [W4]

9. **HTTP vs. source-state behavior is now locked.**  
   - Expected source/business states return **HTTP 200** with a valid My Work envelope.
   - Invalid/missing HB backend auth, malformed query inputs, or unhandled route failures use repo-standard HTTP errors.
   - Upstream Adobe degradation is represented as read-model state, not as raw Adobe error leakage to the SPFx UI.
   - RFC 9457 problem details is recognized as a modern HTTP error standard, but this batch retains the repo-consistent `errorResponse(...)` helper shape rather than introducing a one-off backend error format. [W2] [W3]

10. **The fixture matrix is now locked.**  
    MVP fixtures must cover:
    - available populated queue,
    - available empty queue,
    - available queue with pagination,
    - partial source response,
    - configuration required,
    - authorization required,
    - principal unresolved,
    - source unavailable,
    - backend unavailable frontend fallback,
    - deterministic warning and timestamp behavior.

11. **The backend/fixture/testing architecture must mirror PCC’s discipline while staying My Work-specific.**  
    Later implementation must prove:
    - route IDs and paths,
    - GET-only registrations,
    - `withAuth` posture,
    - safe provider indirection,
    - client URL/query construction,
    - backend failure fallback,
    - deterministic fixtures,
    - no user override query/path,
    - exact union/DTO shape invariants.

---

# 1. Governing Predecessor Decisions Carried Forward

## 1.1 Batch 01 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| App boundary | My Dashboard is a **standalone SPFx app/domain**, not a PCC extension. |
| Product semantics | My Dashboard is **user-contextual**; PCC is **project-contextual**. |
| Existing My Work platform | My Dashboard must not silently compete with `@hbc/my-work-feed`. |
| Adobe module identity | `adobe-sign-action-queue` remains distinct from PCC’s project-contextual `adobe-sign`. |
| Preferred My Work architecture posture | Batch 01 favored a **bridge route**: My Dashboard can have route-specific DTOs while aligning with existing My Work Feed doctrine. |

## 1.2 Batch 02 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Host page | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Home.aspx` |
| Runtime posture | Repo-consistent `production/ui-review` deployment posture with `backend/fixture` read-model transport |
| Protected API auth | SPFx API token provider + protected bearer-token routes |
| Backend configuration | No backend URL, API audience, or Adobe auth config in property pane |
| Route family outline | `my-work/me/...` remains the approved route namespace |
| Direct external calls | Direct Adobe API calls from SPFx remain prohibited |

## 1.3 Batch 03 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Shell view states | `home` and `focused-module` only |
| Primary surface | `my-work-home` |
| Rendered/selectable module | `adobe-sign-action-queue` |
| Home bento states | Ready/partial = Work Summary + Adobe queue card; non-ready = Work Summary + Queue State + Source Readiness |
| Focused Adobe module states | Ready/partial = Queue Summary + Agreement Action List; non-ready = Queue State + Connection/Source Guidance |
| Shell/module boundary | Shell owns layout and active panel; Adobe module owns state rendering, row rendering, queue filtering/pagination, and source-specific UX logic |
| No URL routing | Module focus stays in-memory; queue routes are data routes, not client-side page routes |

## 1.4 Batch 04 refinements that supersede outline-level draft suggestions

| Prior outline posture | Batch 04 final decision |
|---|---|
| `warnings: readonly string[]` | Use structured warning objects with stable warning codes. |
| Queue data may include its own `connection.state` copy | Do **not** duplicate source readiness inside queue `data`; the envelope `sourceStatus` is authoritative for route state. Home data may include `sourceReadiness[]` because the home surface has a dedicated readiness card. |
| Raw Adobe status as unbounded `string` | Use an exact six-value actionable Adobe recipient-status union for MVP. |
| Home read model contained only summary counts | Home read model must include an Adobe queue home projection with summary + preview items so the locked Batch 03 card choreography can be rendered without a second immediate route dependency. |
| Route query posture unclear | Lock `pageSize` + `cursor` as optional queue query fields; no user/actor override query is allowed. |
| Summary totals implicitly looked absolute | Summaries must declare a `countBasis` so the UI does not claim provider-wide totals unless the provider can support them. |

---

# 2. Repo-Truth Audit Method

## 2.1 Audit objective

This Batch 04 audit was designed to answer eleven implementation-grade data-contract questions:

1. What PCC read-model client patterns should My Work inherit?
2. What PCC backend host patterns should My Work inherit?
3. What model-package export and test conventions should `packages/models/src/myWork/` follow?
4. Which existing repo status/error terms should be reused, and which should be introduced deliberately?
5. What exact envelope semantics should My Work use?
6. What exact route registry and frontend client surface should My Work use?
7. What home read model is required to support the locked Batch 03 home surface?
8. What Adobe Sign queue read model is required to support the locked focused-module surface?
9. What exact queue-item normalization and summary contracts should be stable for downstream Adobe integration?
10. How should HTTP failures be separated from expected source/business-state degradation?
11. What fixture matrix is sufficient for UI, backend, and later provider implementation to work from the same stable contract?

## 2.2 Authority hierarchy

The audit used this order of authority:

1. **Live repository source at commit `ea60ef3d639483abc4d7cea82c66afdcc8e24b6f`**
2. **Committed Batch 01, 02, and 03 My Dashboard planning artifacts**
3. **The attached Batch 04 prompt and attached comprehensive My Dashboard outline**
4. **Current official Adobe, Microsoft, IETF, and contract-testing documentation for claims that could drift or that materially inform API contract design**

## 2.3 Core repo inspection lanes

### Lane A — PCC frontend read-model client seam
Focused on:
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClientFactory.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.test.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`
- `apps/project-control-center/src/api/pccReadModelStateMapping.test.ts`

### Lane B — PCC backend read-model host
Focused on:
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`

### Lane C — PCC shared read-model contracts and fixtures
Focused on:
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/PccReadModels.test.ts`
- `packages/models/src/pcc/index.ts`
- `packages/models/src/pcc/fixtures/*`
- representative downstream model families such as:
  - Responsibility Matrix
  - Constraints Log
  - Buyout Log
  - Procore Project Mapping
  - External Systems Launch Pad

### Lane D — Existing My Work platform truth
Focused on:
- `packages/my-work-feed/README.md`
- `docs/reference/my-work-feed/api.md`
- prior Batch 01 position that My Dashboard should not duplicate `@hbc/my-work-feed`

### Lane E — Committed My Dashboard predecessor artifacts
Focused on:
- `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`
- `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`
- `B03_My_Work_Shell_Navigation_And_UX_Development.md`

### Lane F — Existing source/degraded/error vocabulary
Searched repo for:
- `backend-unavailable`
- `source-unavailable`
- `missing-config`
- `configuration-required`
- `authorization-required`
- `unauthorized`
- `forbidden`
- `partial`
- `stale`
- degraded-state mapping patterns

---

# 3. Files and Documents Inspected

## 3.1 PCC frontend read-model and client files

| Path | Audit purpose |
|---|---|
| `apps/project-control-center/src/api/pccReadModelClient.ts` | Route ID/path registry, interface structure, factory contract |
| `apps/project-control-center/src/api/pccReadModelClientFactory.ts` | Fixture vs. backend client selection semantics |
| `apps/project-control-center/src/api/pccBackendReadModelClient.ts` | URL construction, `/api/` normalization, `{ data: envelope }` parsing, backend failure fallback |
| `apps/project-control-center/src/api/pccFixtureReadModelClient.ts` | Deterministic fixture-provider indirection |
| `apps/project-control-center/src/api/pccBackendReadModelClient.test.ts` | Client URL, query, fallback, and no-query-persona proofs |
| `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts` | Fixture scenarios, deterministic timestamp behavior, degraded envelope behavior |
| `apps/project-control-center/src/api/pccReadModelStateMapping.ts` | Source-status-to-preview-state mapping posture |
| `apps/project-control-center/src/api/pccReadModelStateMapping.test.ts` | Complete status coverage and visual-state mapping guardrails |

## 3.2 PCC backend route/provider files

| Path | Audit purpose |
|---|---|
| `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` | GET-only route registration, `withAuth`, telemetry, request-id/error handling |
| `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts` | Route cardinality, GET-only guards, auth wrapper proofs, error response posture |
| `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts` | Provider indirection, deterministic degraded-model construction, status-specific data shaping |

## 3.3 PCC shared model/fixture files

| Path | Audit purpose |
|---|---|
| `packages/models/src/pcc/PccReadModels.ts` | Envelope pattern and response-map pattern |
| `packages/models/src/pcc/PccReadModels.test.ts` | Mode/status literal tests, DTO shape proofs, mutation-intent prohibition |
| `packages/models/src/pcc/index.ts` | Export/barrel conventions |
| `packages/models/src/pcc/fixtures/*` | Fixture folder pattern and scenario naming precedent |

## 3.4 Existing My Work platform files

| Path | Audit purpose |
|---|---|
| `packages/my-work-feed/README.md` | Canonical cross-module personal-work aggregation ownership |
| `docs/reference/my-work-feed/api.md` | Existing item/query/result semantics and package boundary |
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Bridge-route decision and `@hbc/my-work-feed` non-competition guardrail |

## 3.5 My Dashboard predecessor batch files

| Path | Audit purpose |
|---|---|
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Protected backend routes, token-provider posture, runtime config boundary |
| `B03_My_Work_Shell_Navigation_And_UX_Development.md` | Locked home/module card choreography and shell/module ownership |

---

# 4. Repo-Truth Findings

## 4.1 PCC establishes the strongest reusable read-model precedent

PCC’s current implementation already proves a mature pattern that My Work should mirror conceptually:

- route IDs and route paths are declared centrally in the client contract;
- the app depends on a client interface, not raw `fetch` calls from UI components;
- factory logic chooses fixture vs. backend transport;
- the backend client normalizes base URLs, constructs path/query strings centrally, parses `{ data: envelope }`, and falls back safely when fetch/response parsing fails;
- fixture behavior is deterministic and provider-backed;
- tests validate route coverage, URL correctness, fallback semantics, GET-only behavior, and degraded states.

**Batch 04 decision:** My Work should use the same architecture family, but with a My Work-specific namespace and route contract rather than importing PCC app-local types or routes.

## 4.2 PCC route handlers prove the backend host pattern My Work should reuse

The PCC host establishes a backend route-registration posture that is directly reusable:

- `app.http(...)`
- `methods: ['GET']`
- `authLevel: 'anonymous'` at Azure Functions registration level, while actual route protection is applied through `withAuth(...)`
- `withTelemetry(...)`
- request-id extraction
- repo-standard `successResponse(...)` and `errorResponse(...)`
- provider indirection so HTTP concerns stay separate from read-model assembly.

**Batch 04 decision:** My Work routes must use the same route-host architecture.

## 4.3 PCC proves expected source degradation belongs in envelopes, not route-level failure

PCC returns valid envelopes with source statuses such as:
- `available`
- `backend-unavailable`
- `source-unavailable`
- `missing-config`
- `stale`
- `unauthorized`
- `forbidden`

and preserves type-valid data even in degraded branches.

**Batch 04 decision:** My Work must preserve this design principle, but it should use My Work-specific business terminology better aligned to the B01–B03 My Dashboard plan:
- `configuration-required`
- `authorization-required`
- `principal-unresolved`
- `source-unavailable`
- `partial`
- `backend-unavailable`

`available` includes the legitimate **empty queue** case. Empty is data, not degradation.

## 4.4 PCC’s “backend-unavailable” semantics are primarily a client fallback posture

In PCC’s backend client tests, transport failure, malformed JSON, and non-2xx responses collapse to fixture-backed envelopes with:
- `mode: 'fixture'`
- `sourceStatus: 'backend-unavailable'`
- warnings attached.

This is an intentional UI-stability pattern.

**Batch 04 decision:** My Work must follow the same semantic rule:
- `backend-unavailable` is the frontend client’s safe fallback state when the HB Intel backend read-model route cannot be consumed safely.
- Backend mock providers may produce the same state for deterministic preview tests, but a healthy live production route should not normally report `backend-unavailable` about itself.

## 4.5 PCC model tests prove contract files should be pure, read-only DTO declarations

`PccReadModels.test.ts` validates not only literal unions and DTO shapes, but also scrubs the source file for mutation-intent terms such as:
- `apply`
- `execute`
- `repair`
- `provision`
- `sync`
- `mirror`
- `writeBack`
- `upload`
- `delete`
- `fetch`
- `client`
- `service`.

**Batch 04 decision:** `MyWorkReadModels.ts` and `AdobeSignActionQueue.ts` should use the same contract purity discipline. These files define read-model contracts only; they must not become service/client helpers.

## 4.6 PCC fixture behavior confirms deterministic timestamps and state-preserving empty shapes

PCC fixture providers:
- accept a deterministic clock override,
- preserve type-valid data shapes in degraded branches,
- keep static/project-independent reference data where useful,
- empty only the project/source-specific arrays and counters,
- emit warnings with stable codes and messages.

**Batch 04 decision:** My Work fixtures must use:
- one fixed default generated timestamp,
- deterministic actor and agreement IDs,
- type-valid empty/degraded shapes,
- structured warnings,
- explicit scenario fixtures rather than ad hoc mock literals inside tests.

## 4.7 Existing My Work Feed architecture requires a bridge, not duplication

`@hbc/my-work-feed` already owns:
- cross-module personal-work aggregation,
- adapter registry semantics,
- canonical work-item normalization,
- count aggregation,
- ranking/dedupe/supersession,
- cross-surface feed UI.

My Dashboard Batch 04 is not designing a replacement for that package. It is designing a **route-specific My Dashboard BFF read model** for:
- the My Work Home SPFx surface, and
- the Adobe Sign Action Queue module.

**Batch 04 decision:** `packages/models/src/myWork/` is a read-model DTO package for the My Dashboard SPFx domain, not a second enterprise work-feed platform. Any future convergence with `@hbc/my-work-feed` must be explicit and intentional.

## 4.8 Batch 03 card choreography requires the home route to carry preview data

Batch 03 locked the home surface to render:
- Work Summary, and
- Adobe Sign Action Queue card

in ready/partial states.

A card with no queue preview data would either:
- trigger immediate secondary loading complexity, or
- regress to a weaker, less actionable card.

**Batch 04 decision:** `MyWorkHomeReadModel` must include an Adobe Sign home projection with:
- queue summary,
- up to five normalized preview items,
- source status/readiness data sufficient for the home card and source-readiness card.

## 4.9 PCC’s current mode vocabulary drift should not be copied

PCC’s shared model file declares one mode vocabulary (`fixture`, `mock`, `local`) while the frontend client factory accepts a transport choice of `fixture` vs. `backend`. This is workable in PCC because the implementation grew over multiple waves, but it is not the cleanest starting point for a new My Work contract.

**Batch 04 decision:** My Work read-model `mode` means **frontend-observed delivery path**:
- `fixture`
- `backend`

Backend provider implementation details such as “mock provider” vs. “live Adobe provider” do not belong in the frontend envelope `mode`.

---

# 5. Web Research Findings

## 5.1 Research source register

| ID | Source | Use in Batch 04 |
|---|---|---|
| **W1** | Microsoft Learn — *Backends for Frontends pattern* | Supports My Work’s BFF/read-model seam between SPFx and upstream systems |
| **W2** | IETF RFC 9110 — *HTTP Semantics* | Supports preserving HTTP status semantics for true transport/auth/request failures |
| **W3** | IETF RFC 9457 — *Problem Details for HTTP APIs* | Informs error-format discussion without overriding repo-standard error helpers |
| **W4** | Adobe Acrobat Sign Developer — *API Agreement Statuses, Recipient Statuses, Agreement Events, and Webhook Events* | Confirms recipient statuses that represent current-user required actions |
| **W5** | Adobe Acrobat Sign Developer — *Acrobat Sign API Best Practices* | Supports filtered/paginated agreement retrieval and avoidance of broad legacy/bulk scans |
| **W6** | Adobe Acrobat Sign Developer Guide — *API Usage* | Supports downstream resilience requirements around throttling and bounded API behavior |
| **W7** | Pact Docs — *Provider states* and *Provider verification* | Supports explicit scenario fixtures and isolated state-by-state verification for client/provider contracts |

## 5.2 Finding A — A BFF/read-model API is the correct seam for a UI-specific integration

Microsoft’s Backends for Frontends pattern recommends an interface-specific backend layer when the frontend needs a tailored contract rather than a generic service payload. It explicitly notes that the BFF can tailor pagination, aggregation, and interface-specific behavior. [W1]

**My Work implication:**  
`my-work/me/home` and `my-work/me/adobe-sign/action-queue` should be stable, My Dashboard-specific read-model routes. They should not mirror raw Adobe response bodies.

## 5.3 Finding B — HTTP status semantics should stay meaningful

RFC 9110 distinguishes successful HTTP representation responses from request/auth/server failures, and RFC 9457 provides a modern interoperable way to enrich 4xx/5xx errors. [W2] [W3]

**My Work implication:**  
- Expected integration states such as “authorization required” or “source temporarily unavailable” are valid read-model outcomes and should return `200` with typed envelope status.
- Missing/invalid HB backend authorization, malformed client queries, and unhandled backend failures remain HTTP errors.
- This batch should **not** introduce a My Work-only RFC 9457 response format when repo truth currently uses shared `errorResponse(...)` helpers. A later backend-wide standardization could revisit that.

## 5.4 Finding C — Adobe’s current-user action statuses are enumerable and should be normalized deliberately

Adobe documents recipient statuses representing action required from the current recipient, including signature, approval, acceptance, acknowledgement, form filling, and delegation. [W4]

**My Work implication:**  
The MVP queue should normalize exactly those six statuses into HB Intel-facing `requiredAction` values. The frontend should not parse or interpret raw Adobe statuses itself.

## 5.5 Finding D — Adobe recommends filtered and paginated retrieval rather than broad scans

Adobe’s best-practice guidance distinguishes:
- `GET v6/agreements` for paginated agreement listing, and
- `POST v6/search` for more advanced criteria including status, role, date-range filtering, and sort behavior. Adobe also warns against high-frequency retrieval patterns and older APIs that lack pagination/advanced filtering. [W5]

**My Work implication:**  
The later Adobe integration batch should favor a bounded, filtered query strategy capable of targeting the six actionable recipient statuses without pulling broad unrelated agreement populations into HB Intel.

## 5.6 Finding E — Upstream throttling and provider limits should map to resilient read-model degradation

Adobe documents request limits and `429` throttling behavior for REST API operations. [W6]

**My Work implication:**  
A throttled upstream Adobe response should not be leaked raw into the SPFx UI. The backend provider should translate it into:
- `source-unavailable` if no safe queue data can be returned, or
- `partial` if safe partial/cached data remains renderable,
with structured warning codes for logs/tests.

## 5.7 Finding F — Scenario-based fixture states are a strong contract-testing model

Pact’s provider-state guidance treats each fixture/test state as an isolated precondition and emphasizes scenario-specific verification rather than brittle cross-test dependencies. [W7]

**My Work implication:**  
The fixture matrix should be explicit, scenario-named, deterministic, and isolated:
- “queue available with six action classes”
- “queue empty”
- “authorization required”
- “source unavailable”
rather than one generic fixture object mutated ad hoc inside tests.

---

# 6. Fully Developed Section 12 — My Work Read-Model Architecture

## 12.1 Objective

The My Work read-model architecture establishes the stable contract between:

1. the My Dashboard SPFx shell/module layer,
2. the My Work backend read-model host,
3. future Adobe Sign provider/adapters, and
4. tests/fixtures/evidence harnesses.

The contract must support the currently locked UX surfaces without requiring the UI to understand:
- raw Adobe API response shape,
- OAuth/token storage behavior,
- upstream search/pagination mechanics,
- backend provider composition,
- or transport failure handling.

## 12.2 Final namespace and package placement

### Closed package namespace
```text
packages/models/src/myWork/
```

### Closed purpose
This namespace owns:
- My Dashboard My Work read-model envelopes,
- My Work Home read-model DTOs,
- Adobe Sign Action Queue route DTOs,
- fixture data used by frontend/backend tests,
- literal unions and status vocabularies used by Batch 04 routes.

It does **not** own:
- general cross-module work-item aggregation,
- My Work ranking/dedupe logic,
- global personal work feed primitives,
- Adobe API clients,
- OAuth services,
- UI components.

Those remain outside this contract layer.

## 12.3 Final model-file structure

```text
packages/models/src/myWork/
├── MyWorkReadModels.ts
├── AdobeSignActionQueue.ts
├── MyWorkReadModels.test.ts
├── AdobeSignActionQueue.test.ts
├── index.ts
└── fixtures/
    ├── index.ts
    ├── myWorkHomeReadModels.ts
    └── adobeSignActionQueueReadModels.ts
```

### Rationale
This mirrors the mature PCC model/fixture structure more closely than a single monolithic `MyWorkFixtures.ts` file.

## 12.4 Final export rules

### `packages/models/src/myWork/index.ts`
Must export:
- read-model literals and types,
- Adobe queue literals and types,
- fixture exports through `./fixtures/index.js`.

### Root models barrel
The repo’s root models barrel should expose `@hbc/models/myWork` through the established repository export pattern used for other model families.

### Import rule
Consumers import:
```ts
import type { MyWorkHomeReadModel } from '@hbc/models/myWork';
```
or equivalent repo-standard package subpath.

Consumers must not deep-import from:
```text
packages/models/src/myWork/...
```

## 12.5 Final read-model mode vocabulary

```ts
export const MY_WORK_READ_MODEL_MODES = ['fixture', 'backend'] as const;

export type MyWorkReadModelMode =
  (typeof MY_WORK_READ_MODEL_MODES)[number];
```

### Mode semantics

| Mode | Meaning |
|---|---|
| `fixture` | Frontend is using a local/fixture read-model client or a safe fixture fallback envelope. |
| `backend` | Frontend successfully consumed the protected HB Intel backend read-model route. |

### Explicit exclusion
Do **not** add:
- `mock`
- `local`
- `live`
- `production`

to the frontend envelope `mode`.

Backend provider implementation detail is not the UI contract.

## 12.6 Final source-status vocabulary

```ts
export const MY_WORK_READ_MODEL_SOURCE_STATUSES = [
  'available',
  'partial',
  'configuration-required',
  'authorization-required',
  'principal-unresolved',
  'source-unavailable',
  'backend-unavailable',
] as const;

export type MyWorkReadModelSourceStatus =
  (typeof MY_WORK_READ_MODEL_SOURCE_STATUSES)[number];
```

## 12.7 Source-status semantics

| Status | Meaning | Typical HTTP |
|---|---|---:|
| `available` | Route/client contract succeeded and the source is usable. Zero items is still `available`. | 200 |
| `partial` | A usable read model exists, but one or more expected source/detail enrichments could not be completed safely. | 200 |
| `configuration-required` | Backend/integration configuration required before the queue can be queried. | 200 |
| `authorization-required` | Current actor needs Adobe authorization or reauthorization. | 200 |
| `principal-unresolved` | Authenticated HB actor could not be safely mapped to the required Adobe principal. | 200 |
| `source-unavailable` | Backend route is healthy, but the upstream/source provider cannot provide safe usable queue data. | 200 |
| `backend-unavailable` | Frontend backend-client fallback state when the HB backend route cannot be consumed safely. | Client-generated fallback envelope |

## 12.8 Final warning contract

```ts
export const MY_WORK_READ_MODEL_WARNING_CODES = [
  'partial-source-data',
  'configuration-required',
  'authorization-required',
  'principal-unresolved',
  'source-unavailable',
  'backend-unavailable',
  'stale-cache-used',
  'result-set-truncated',
  'source-open-url-omitted',
  'unsupported-source-status-filtered',
] as const;

export type MyWorkReadModelWarningCode =
  (typeof MY_WORK_READ_MODEL_WARNING_CODES)[number];

export interface MyWorkReadModelWarning {
  readonly code: MyWorkReadModelWarningCode;
  readonly message: string;
  readonly source?: 'my-work' | 'adobe-sign';
  readonly retryable?: boolean;
}
```

### Warning usage rule
- Warnings may carry human-readable technical context for logs/test inspection.
- UI copy must be mapped from stable statuses/codes by the frontend/module layer.
- UI should not display raw upstream/provider exception text.

## 12.9 Final envelope contract

```ts
export interface MyWorkReadModelEnvelope<T> {
  readonly mode: MyWorkReadModelMode;
  readonly sourceStatus: MyWorkReadModelSourceStatus;
  readonly readOnly: true;
  readonly warnings: readonly MyWorkReadModelWarning[];
  readonly generatedAtUtc: string;
  readonly data: T;
}
```

## 12.10 Exact outer backend response wrapper

To remain consistent with PCC route/client truth, successful backend route responses must use:

```json
{
  "data": {
    "mode": "backend",
    "sourceStatus": "available",
    "readOnly": true,
    "warnings": [],
    "generatedAtUtc": "2026-05-12T12:00:00.000Z",
    "data": {}
  }
}
```

### Rule
The HTTP body outer wrapper remains:
```ts
{ data: MyWorkReadModelEnvelope<T> }
```

The nested inner `data` property is the route-specific read model payload.

## 12.11 Final actor summary model

```ts
export interface MyWorkActorSummary {
  readonly displayName?: string;
}
```

### Rationale
- The B03 hero may naturally display the current user’s name.
- The My Work read model should not expose raw claims or create unnecessary email-display coupling.
- Actor identity used for backend authorization/principal resolution remains a backend auth concern, not a frontend DTO concern.

## 12.12 Final source-readiness model

```ts
export const MY_WORK_SOURCE_IDS = ['adobe-sign'] as const;

export type MyWorkSourceId =
  (typeof MY_WORK_SOURCE_IDS)[number];

export interface MyWorkSourceReadinessItem {
  readonly sourceId: MyWorkSourceId;
  readonly displayName: 'Adobe Sign';
  readonly sourceStatus: Exclude<
    MyWorkReadModelSourceStatus,
    'backend-unavailable'
  >;
}
```

### Why `backend-unavailable` is excluded here
The home read model comes from a backend route when successfully received. If the frontend could not consume the backend, the entire envelope is a client fallback with `sourceStatus: 'backend-unavailable'`; the nested backend-generated readiness items do not separately claim that state.

## 12.13 Final My Work Home summary model

```ts
export const MY_WORK_COUNT_BASES = [
  'returned-items',
  'provider-total',
] as const;

export type MyWorkCountBasis =
  (typeof MY_WORK_COUNT_BASES)[number];

export interface MyWorkHomeSummary {
  readonly actionItemCount: number;
  readonly actionItemCountBasis: MyWorkCountBasis;
  readonly connectedSourceCount: number;
  readonly degradedSourceCount: number;
}
```

### Count-basis rule
- `provider-total` may be used only when the backend provider can derive a trustworthy total without violating bounded-query principles.
- Otherwise, use `returned-items`.
- UI copy must not overstate counts when the basis is `returned-items` and pagination indicates more records may exist.

## 12.14 Final Adobe Sign home projection model

```ts
export interface MyWorkAdobeSignActionQueueHomeProjection {
  readonly summary: MyWorkAdobeSignActionQueueSummary;
  readonly previewItems: readonly MyWorkAdobeSignActionQueueItem[];
  readonly previewItemLimit: 5;
}
```

### Home projection rule
- `previewItems` must contain at most five queue items.
- The home projection is sufficient for the locked Batch 03 `Adobe Sign Action Queue` card.
- It is not the focused module’s full list payload.

## 12.15 Final My Work Home read model

```ts
export interface MyWorkHomeReadModel {
  readonly actor: MyWorkActorSummary;
  readonly summary: MyWorkHomeSummary;
  readonly sourceReadiness: readonly MyWorkSourceReadinessItem[];
  readonly adobeSignActionQueue: MyWorkAdobeSignActionQueueHomeProjection;
}
```

## 12.16 Final route response-map contract

```ts
export interface MyWorkReadModelResponseMap {
  readonly home: MyWorkReadModelEnvelope<MyWorkHomeReadModel>;
  readonly 'adobe-sign-action-queue':
    MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>;
}
```

## 12.17 Read-model purity guardrails

`MyWorkReadModels.ts` and `AdobeSignActionQueue.ts` should be contract-only files. They must not contain:
- fetch logic,
- URL concatenation,
- OAuth logic,
- provider invocations,
- mutation or command methods,
- source-system writeback semantics.

Recommended tests should mirror PCC’s contract-purity posture.

---

# 7. Fully Developed Section 13 — Adobe Sign Queue Item and Summary Contracts

## 13.1 Objective

The Adobe Sign Action Queue contract must convert upstream Adobe Sign state into a stable HB Intel-facing queue model that supports:

- the My Work Home Adobe queue card,
- the focused Adobe queue module,
- safe fixture rendering,
- later provider implementation,
- and future hosted evidence testing.

It must remain:
- read-only,
- source-authority explicit,
- bounded,
- normalized,
- and suitable for degradation without malformed UI states.

## 13.2 Exact actionable Adobe recipient-status union

```ts
export const ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES = [
  'WAITING_FOR_MY_SIGNATURE',
  'WAITING_FOR_MY_APPROVAL',
  'WAITING_FOR_MY_ACCEPTANCE',
  'WAITING_FOR_MY_ACKNOWLEDGEMENT',
  'WAITING_FOR_MY_FORM_FILLING',
  'WAITING_FOR_MY_DELEGATION',
] as const;

export type AdobeSignActionableRecipientStatus =
  (typeof ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES)[number];
```

### MVP exclusion rule
The MVP queue does **not** include:
- `WAITING_FOR_MY_VERIFICATION`
- `WAITING_FOR_AUTHORING`
- `WAITING_FOR_PREFILL`
- terminal/completed/cancelled/expired recipient states
- agreement-level statuses that do not establish current-recipient action.

Those may be revisited only through a later business/product decision.

## 13.3 Exact normalized required-action union

```ts
export const MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS = [
  'signature',
  'approval',
  'acceptance',
  'acknowledgement',
  'form-filling',
  'delegation',
] as const;

export type MyWorkAdobeSignRequiredAction =
  (typeof MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS)[number];
```

## 13.4 Exact Adobe-to-My-Work mapping

| Adobe recipient status | Required action | End-user semantic |
|---|---|---|
| `WAITING_FOR_MY_SIGNATURE` | `signature` | Agreement awaits the current user’s signature |
| `WAITING_FOR_MY_APPROVAL` | `approval` | Agreement awaits the current user’s approval |
| `WAITING_FOR_MY_ACCEPTANCE` | `acceptance` | Agreement awaits the current user’s acceptance |
| `WAITING_FOR_MY_ACKNOWLEDGEMENT` | `acknowledgement` | Agreement awaits the current user’s acknowledgement |
| `WAITING_FOR_MY_FORM_FILLING` | `form-filling` | Agreement awaits form completion by the current user |
| `WAITING_FOR_MY_DELEGATION` | `delegation` | Agreement awaits delegation by the current user |

This mapping is backend-owned. The frontend consumes `requiredAction`; it does not interpret raw Adobe statuses itself.

## 13.5 Final sender model

```ts
export interface MyWorkAdobeSignSenderSummary {
  readonly displayName?: string;
  readonly email?: string;
}
```

### Sender handling
- Sender fields are optional because upstream availability may vary by query/enrichment route.
- Absence of sender data does not alone force `partial`.
- UI copy must degrade gracefully.

## 13.6 Final queue item model

```ts
export interface MyWorkAdobeSignActionQueueItem {
  readonly itemId: string;
  readonly sourceSystem: 'adobe-sign';
  readonly agreementId: string;
  readonly agreementName: string;
  readonly requiredAction: MyWorkAdobeSignRequiredAction;
  readonly adobeRecipientStatus: AdobeSignActionableRecipientStatus;
  readonly sender?: MyWorkAdobeSignSenderSummary;
  readonly createdAtUtc?: string;
  readonly modifiedAtUtc?: string;
  readonly expirationAtUtc?: string;
  readonly sourceOpenUrl?: string;
}
```

## 13.7 Queue item identity rule

### `itemId`
`itemId` must be stable and deterministic for the My Work read model. Recommended form:
```text
adobe-sign:{agreementId}
```

### `agreementId`
`agreementId` preserves the source-system identifier needed by downstream provider logic and future traceability.

### Reason
This separation prevents the UI from using raw source IDs as a universal application key while preserving provider traceability.

## 13.8 Source-open URL rule

`sourceOpenUrl` is optional and must be backend-produced and backend-validated.

### Prohibited
- frontend URL construction,
- frontend guessing of Adobe shard/access-point URL,
- shipping unsafe or unvalidated raw provider URLs to a clickable UI control.

### If URL cannot be established safely
- omit `sourceOpenUrl`,
- optionally add warning code `source-open-url-omitted`,
- keep the queue item otherwise renderable.

## 13.9 Date semantics

| Field | Meaning |
|---|---|
| `createdAtUtc` | Source-created timestamp if available |
| `modifiedAtUtc` | Last meaningful source modification timestamp if available |
| `expirationAtUtc` | Source-defined agreement expiration timestamp if available |

### Date rule
Do not invent a due date. Only source-provided expiration data may drive “expiring soon” semantics.

## 13.10 Exact queue summary count basis

```ts
export interface MyWorkAdobeSignActionQueueSummary {
  readonly countBasis: MyWorkCountBasis;
  readonly totalActionItemCount: number;
  readonly signatureCount: number;
  readonly approvalCount: number;
  readonly acceptanceCount: number;
  readonly acknowledgementCount: number;
  readonly formFillingCount: number;
  readonly delegationCount: number;
  readonly expiringSoonCount: number;
}
```

## 13.11 Count-basis rule for queue summary

### `provider-total`
Use only when the backend provider can calculate a trustworthy total across the normalized actionable result set with acceptable operational cost.

### `returned-items`
Use when counts are computed only from the returned result set/page or from a bounded preview projection.

### UI consequence
The UI must not describe `returned-items` totals as exhaustive account-wide counts when `pagination.hasMore === true`.

## 13.12 Expiring-soon rule

### Closed MVP rule
An item is `expiring soon` when:
- `expirationAtUtc` exists, and
- the expiration timestamp falls within **7 calendar days** of the backend evaluation time.

### Boundary rules
- Expired items should not be included in the actionable queue.
- Items without expiration timestamps do not contribute to `expiringSoonCount`.
- A later phase may revisit the threshold, but MVP fixture/test behavior should treat 7 days as canonical.

## 13.13 Exact queue pagination model

```ts
export interface MyWorkAdobeSignActionQueuePagination {
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}
```

### Page-size rule
- Backend default: `25`
- Minimum accepted: `1`
- Maximum accepted: `50`
- Invalid page sizes return backend query validation error, not a degraded envelope.

### Cursor rule
- `nextCursor` is opaque to the frontend.
- The frontend may send a cursor back only to the same queue route.
- The backend owns decoding/validation.

## 13.14 Exact freshness model

```ts
export const MY_WORK_FRESHNESS_STATES = [
  'fresh',
  'stale',
  'unknown',
] as const;

export type MyWorkFreshnessState =
  (typeof MY_WORK_FRESHNESS_STATES)[number];

export interface MyWorkAdobeSignActionQueueFreshness {
  readonly state: MyWorkFreshnessState;
  readonly generatedAtUtc: string;
  readonly lastSuccessfulSourceReadAtUtc?: string;
}
```

### Freshness rule
- A normal live provider result should be `fresh`.
- A safely served cache/fallback that is still allowed to render may be `stale` with warning `stale-cache-used`.
- If the provider cannot make a freshness claim, use `unknown`.

## 13.15 Final Adobe Sign Action Queue read model

```ts
export interface MyWorkAdobeSignActionQueueReadModel {
  readonly moduleId: 'adobe-sign-action-queue';
  readonly summary: MyWorkAdobeSignActionQueueSummary;
  readonly items: readonly MyWorkAdobeSignActionQueueItem[];
  readonly pagination: MyWorkAdobeSignActionQueuePagination;
  readonly freshness: MyWorkAdobeSignActionQueueFreshness;
}
```

## 13.16 Queue read-model degraded-state data shapes

| Envelope source status | `items` | Summary counts | Pagination | Freshness |
|---|---|---|---|---|
| `available` | populated or empty | actual counts | actual | fresh/unknown |
| `partial` | safe subset | counts reflect safe subset | actual if known | fresh/stale/unknown |
| `configuration-required` | `[]` | zeroes | `hasMore:false` | unknown |
| `authorization-required` | `[]` | zeroes | `hasMore:false` | unknown |
| `principal-unresolved` | `[]` | zeroes | `hasMore:false` | unknown |
| `source-unavailable` | `[]` | zeroes | `hasMore:false` | unknown |
| `backend-unavailable` | fixture fallback empty state | zeroes | `hasMore:false` | unknown |

## 13.17 Home projection vs. focused module route

| Surface | Route | Items | Page size |
|---|---|---:|---:|
| Home queue card | `my-work/me/home` | Up to 5 preview items | Fixed projection limit |
| Focused Adobe module | `my-work/me/adobe-sign/action-queue` | Default 25 returned items | `pageSize` query, max 50 |

## 13.18 Unsupported or unexpected Adobe statuses

### Provider rule
Statuses outside the six MVP actionable recipient statuses:
- must not be transformed into false My Work actions,
- should be excluded from the actionable queue result set,
- may emit warning code `unsupported-source-status-filtered` only when the provider actually encountered and filtered such a value during normalization.

---

# 8. Fully Developed Section 18 — Backend Route Family and Error Taxonomy

## 18.1 Objective

The backend route family must provide a protected, predictable, My Work-specific BFF read-model host that:

- derives actor context from validated HB backend auth,
- exposes only two MVP GET endpoints,
- isolates the frontend from provider details,
- returns typed read-model envelopes for expected source states,
- reserves HTTP errors for true request/auth/backend failures,
- and keeps the response shape aligned with PCC route/client conventions.

## 18.2 Final backend host namespace

```text
backend/functions/src/hosts/my-work-read-model/
├── my-work-read-model-routes.ts
├── my-work-read-model-routes.test.ts
└── read-models/
    ├── my-work-read-model-provider.ts
    ├── my-work-mock-read-model-provider.ts
    └── adobe-sign/
        └── [downstream provider files reserved for later Adobe integration batch]
```

### Batch 04 scope note
This artifact locks the namespace and route/provider seam. It does not implement the later Adobe OAuth/provider files.

## 18.3 Final route IDs and route paths

```ts
export const MY_WORK_READ_MODEL_ROUTE_PATHS = {
  home: 'my-work/me/home',
  'adobe-sign-action-queue':
    'my-work/me/adobe-sign/action-queue',
} as const;

export type MyWorkReadModelRouteId =
  keyof typeof MY_WORK_READ_MODEL_ROUTE_PATHS;
```

## 18.4 Final production HTTP route table

| Route name | Method | Path | Purpose |
|---|---|---|---|
| `getMyWorkHome` | `GET` | `/api/my-work/me/home` | Returns home shell/card read model |
| `getMyWorkAdobeSignActionQueue` | `GET` | `/api/my-work/me/adobe-sign/action-queue` | Returns focused Adobe queue read model |

## 18.5 Queue route query contract

```ts
export interface MyWorkAdobeSignActionQueueQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}
```

### HTTP query form
```http
GET /api/my-work/me/adobe-sign/action-queue?pageSize=25&cursor={opaque}
```

### Validation rules
| Query field | Rule |
|---|---|
| `pageSize` | optional integer, default `25`, min `1`, max `50` |
| `cursor` | optional opaque string; backend validates presence/shape length enough to reject malformed abuse |
| actor/email | prohibited |
| sort/filter | not exposed in MVP |
| arbitrary source status filter | not exposed in MVP |

## 18.6 No actor override route/query contract

### Prohibited route patterns
```http
GET /api/my-work/users/{email}/home
GET /api/my-work/users/{email}/adobe-sign/action-queue
```

### Prohibited query patterns
```http
GET /api/my-work/me/home?email=...
GET /api/my-work/me/adobe-sign/action-queue?user=...
GET /api/my-work/me/adobe-sign/action-queue?principal=...
```

### Rule
The backend derives the actor exclusively from validated authenticated context established by the protected API middleware.

## 18.7 Backend route-registration pattern

The My Work host should mirror PCC:

```ts
function registerMyWorkReadRoute(
  name: string,
  route: string,
  load: RouteLoader,
): void {
  app.http(name, {
    methods: ['GET'],
    authLevel: 'anonymous',
    route,
    handler: withAuth(
      withTelemetry(
        async (request) => {
          const requestId = extractOrGenerateRequestId(request);

          try {
            const envelope = await load(request);
            return successResponse(envelope);
          } catch {
            return errorResponse(
              500,
              'INTERNAL_ERROR',
              'Internal server error',
              requestId,
            );
          }
        },
        { domain: 'my-work-read-model', operation: name },
      ),
    ),
  });
}
```

### Contract rule
The exact implementation may vary, but route posture must preserve:
- GET-only,
- `withAuth`,
- telemetry wrapper,
- request-id error path,
- repo-standard success/error helper usage.

## 18.8 Provider indirection contract

Recommended provider interface:

```ts
export interface IMyWorkReadModelProvider {
  getMyWorkHome(
    context: MyWorkAuthenticatedReadContext,
  ): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>>;

  getAdobeSignActionQueue(
    context: MyWorkAuthenticatedReadContext,
    query: MyWorkAdobeSignActionQueueQuery,
  ): Promise<
    MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>
  >;
}
```

### Read context rule
`MyWorkAuthenticatedReadContext` is backend-only and should be built from validated `AuthContext`; it is not exported to SPFx DTO consumers.

## 18.9 Exact frontend client interface

```ts
export interface IMyWorkReadModelClient {
  getMyWorkHome(): Promise<
    MyWorkReadModelEnvelope<MyWorkHomeReadModel>
  >;

  getAdobeSignActionQueue(
    query?: MyWorkAdobeSignActionQueueQuery,
  ): Promise<
    MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>
  >;
}
```

## 18.10 Final frontend client factory posture

```ts
export type MyWorkReadModelClientMode =
  MyWorkReadModelMode;

export interface MyWorkReadModelClientFactoryOptions {
  readonly mode?: MyWorkReadModelClientMode;
  readonly backendBaseUrl?: string;
  readonly fetch?: typeof fetch;
  readonly getApiToken?: () => Promise<string>;
}
```

### Factory rules
| Input mode | Client returned |
|---|---|
| `fixture` or omitted | fixture client |
| `backend` | backend client |

### Backend-mode precondition
`backend` mode requires:
- `backendBaseUrl`,
- `getApiToken`,
- fetch implementation if not using global fetch.

Missing backend prerequisites should be handled by the runtime-readiness layer already governed by Batch 02, not by ad hoc component logic.

## 18.11 Final backend client behavior

The backend client must:
1. normalize base URL to avoid duplicate `/api/`;
2. build route URLs from the exact route registry;
3. append `pageSize`/`cursor` only for the queue route when present;
4. obtain a fresh API token through `getApiToken()`;
5. send:
   ```http
   Authorization: Bearer <token>
   ```
6. parse:
   ```json
   { "data": <MyWorkReadModelEnvelope<T>> }
   ```
7. return the envelope verbatim on successful parse;
8. fall back to a deterministic `backend-unavailable` fixture envelope if:
   - fetch rejects,
   - response is non-2xx,
   - JSON parsing fails,
   - `data` wrapper is missing,
   - envelope is unusable.

## 18.12 Exact client fallback behavior

### Home fallback
Returns:
- `mode: 'fixture'`
- `sourceStatus: 'backend-unavailable'`
- warning `backend-unavailable`
- a type-valid empty home read model
- `connectedSourceCount: 0`
- `degradedSourceCount: 1`
- Adobe preview empty and zeroed.

### Queue fallback
Returns:
- `mode: 'fixture'`
- `sourceStatus: 'backend-unavailable'`
- warning `backend-unavailable`
- empty queue items
- zeroed summary
- `hasMore:false`
- freshness `unknown`.

## 18.13 HTTP vs. read-model source-state matrix

### A. Successful/expected source-state outcomes

| Scenario | HTTP | Outer response | Envelope status | UI interpretation |
|---|---:|---|---|---|
| User queue available with items | 200 | `{ data: envelope }` | `available` | Ready |
| User queue available but empty | 200 | `{ data: envelope }` | `available` | Empty, but healthy |
| Queue read succeeds with bounded partial enrichment | 200 | `{ data: envelope }` | `partial` | Render safe subset + degraded indicator |
| Adobe integration not configured | 200 | `{ data: envelope }` | `configuration-required` | Non-ready, contact/configure state |
| User requires Adobe OAuth/re-auth | 200 | `{ data: envelope }` | `authorization-required` | Non-ready, authorization state |
| HB actor cannot map to Adobe principal | 200 | `{ data: envelope }` | `principal-unresolved` | Non-ready, principal-resolution state |
| Adobe source/provider currently unavailable | 200 | `{ data: envelope }` | `source-unavailable` | Non-ready, try later/source degradation |

### B. True HTTP failures

| Scenario | HTTP | Error shape | Envelope? | Notes |
|---|---:|---|---|---|
| Missing/invalid HB backend bearer token | 401 | repo-standard auth error response | No | Produced by auth middleware |
| Valid auth but route access denied by backend policy | 403 | repo-standard forbidden error response | No | Rare for `/me/`, but reserve semantics |
| Invalid `pageSize` / malformed query | 400 | `VALIDATION_ERROR` equivalent | No | Do not coerce malformed query silently |
| Route/provider throws unhandled exception | 500 | `INTERNAL_ERROR` equivalent | No | Client collapses to `backend-unavailable` fallback |
| HB backend route unreachable from browser | n/a at backend; client fetch failure | n/a | Client-generated fallback | UI sees `backend-unavailable` |
| Backend returns malformed JSON/body | transport/parser failure | n/a | Client-generated fallback | UI sees `backend-unavailable` |

## 18.14 Upstream Adobe error translation matrix

| Upstream/provider condition | Backend route HTTP | My Work envelope sourceStatus | Warning code guidance |
|---|---:|---|---|
| Adobe filtered query succeeds | 200 | `available` | none |
| Query succeeds, item/detail enrichment partially fails | 200 | `partial` | `partial-source-data` |
| Adobe app/provider config absent | 200 | `configuration-required` | `configuration-required` |
| OAuth token absent/revoked/refresh not recoverable | 200 | `authorization-required` | `authorization-required` |
| Actor/principal cannot be safely resolved | 200 | `principal-unresolved` | `principal-unresolved` |
| Adobe API unavailable/network provider failure | 200 | `source-unavailable` | `source-unavailable` |
| Adobe throttles provider call and no usable data remains | 200 | `source-unavailable` | `source-unavailable` |
| Adobe throttles one enrich path but safe queue subset exists | 200 | `partial` | `partial-source-data` |

## 18.15 Problem-details standardization posture

RFC 9457 is a strong modern standard for machine-readable 4xx/5xx HTTP error responses. [W3]

### Closed Batch 04 posture
Do **not** introduce a My Work-only `application/problem+json` body format in this isolated batch. The repo currently uses shared `errorResponse(...)` helpers and route tests already encode that expectation. A future backend-wide error-format standardization may adopt RFC 9457, but My Work must not diverge unilaterally.

## 18.16 Route and client tests that must exist downstream

| Test family | Required proof |
|---|---|
| Route registration | Exactly two canonical My Work routes |
| HTTP methods | Both routes GET-only; no POST/PUT/PATCH/DELETE |
| Auth wrapper | Each route handler is wrapped in `withAuth` posture |
| Response wrapper | Success returns `{ data: envelope }` |
| Query validation | Invalid page size/cursor shape returns validation error |
| No actor override | No route/query string exposes email/user/principal override |
| Client URL building | Correct `/api/` normalization and route path output |
| Client auth headers | Bearer token header added in backend mode |
| Client fallback | non-2xx/fetch reject/malformed JSON collapse to `backend-unavailable` fixture envelope |
| Queue query serialization | only `pageSize` and `cursor`; no accidental unrelated query string |
| Envelope purity | backend successful envelope returned without client mutation |

---

# 9. Fully Developed Section 24 — Fixture Matrix and Mock Data Requirements

## 24.1 Objective

The fixture architecture must allow:
- frontend shell/module development before live Adobe integration is finalized,
- backend route/provider testing without source-system dependency,
- predictable hosted UI review,
- comprehensive degraded-state rendering,
- and later provider contract verification.

Fixtures must be:
- deterministic,
- scenario-named,
- type-valid,
- production-grade in copy realism,
- and aligned with the locked status/error matrix.

## 24.2 Final fixture namespace

```text
packages/models/src/myWork/fixtures/
├── index.ts
├── myWorkHomeReadModels.ts
└── adobeSignActionQueueReadModels.ts
```

## 24.3 Default fixture clock

```ts
export const MY_WORK_FIXTURE_GENERATED_AT_UTC =
  '2026-05-12T12:00:00.000Z';
```

### Clock override rule
Fixture clients/providers should accept:
```ts
now?: () => string
```
to support deterministic tests without mutating shared fixture constants.

## 24.4 Canonical fixture actor

```ts
export const SAMPLE_MY_WORK_ACTOR = {
  displayName: 'Bobby Fetting',
} as const;
```

### Rationale
The fixture actor is a display-only DTO value for hero/home rendering and may be swapped if future shared fixture conventions prefer neutral generic personas. The fixture contract itself does not require a real production identity.

## 24.5 Canonical populated Adobe queue fixture

The populated fixture must contain **six** queue items, one for each MVP actionable status:

| Fixture item | Required action | Adobe recipient status |
|---|---|---|
| 1 | Signature | `WAITING_FOR_MY_SIGNATURE` |
| 2 | Approval | `WAITING_FOR_MY_APPROVAL` |
| 3 | Acceptance | `WAITING_FOR_MY_ACCEPTANCE` |
| 4 | Acknowledgement | `WAITING_FOR_MY_ACKNOWLEDGEMENT` |
| 5 | Form filling | `WAITING_FOR_MY_FORM_FILLING` |
| 6 | Delegation | `WAITING_FOR_MY_DELEGATION` |

### Fixture purpose
This guarantees:
- mapping coverage,
- count summary coverage,
- UI label coverage,
- list row rendering coverage,
- filter/chip/readability coverage in later UI implementation.

## 24.6 Canonical populated fixture counts

For the six-item populated fixture:

```ts
summary: {
  countBasis: 'returned-items',
  totalActionItemCount: 6,
  signatureCount: 1,
  approvalCount: 1,
  acceptanceCount: 1,
  acknowledgementCount: 1,
  formFillingCount: 1,
  delegationCount: 1,
  expiringSoonCount: 2,
}
```

### Expiring-soon fixture rule
Exactly two items in the populated fixture should expire within seven calendar days of `MY_WORK_FIXTURE_GENERATED_AT_UTC`.

## 24.7 Canonical home preview projection

The My Work Home available fixture must expose:
- the populated queue summary,
- the first five queue items as `previewItems`,
- `previewItemLimit: 5`.

### Consequence
The home card can demonstrate:
- action count,
- at least several real rows,
- and the need to focus into the Adobe module for the full queue.

## 24.8 Exact fixture scenario matrix

### Route family: `my-work/me/home`

| Fixture ID | Envelope source status | Home data posture | Intended UI proof |
|---|---|---|---|
| `MY_WORK_HOME_AVAILABLE` | `available` | actor + healthy summary + Adobe preview | Home ready state |
| `MY_WORK_HOME_EMPTY` | `available` | healthy summary, zero queue items | Home empty-but-healthy state |
| `MY_WORK_HOME_PARTIAL` | `partial` | partial warning, safe preview if applicable | Home partial state |
| `MY_WORK_HOME_CONFIGURATION_REQUIRED` | `configuration-required` | zero queue, degraded source count | Source readiness/config state |
| `MY_WORK_HOME_AUTHORIZATION_REQUIRED` | `authorization-required` | zero queue, degraded source count | User auth required state |
| `MY_WORK_HOME_PRINCIPAL_UNRESOLVED` | `principal-unresolved` | zero queue, degraded source count | Principal mapping state |
| `MY_WORK_HOME_SOURCE_UNAVAILABLE` | `source-unavailable` | zero queue, degraded source count | Source unavailable state |
| `MY_WORK_HOME_BACKEND_UNAVAILABLE` | `backend-unavailable` | frontend fallback empty state | Backend-client failure state |

### Route family: `my-work/me/adobe-sign/action-queue`

| Fixture ID | Envelope source status | Queue data posture | Intended UI proof |
|---|---|---|---|
| `ADOBE_SIGN_QUEUE_AVAILABLE` | `available` | six item list + counts | Full module ready |
| `ADOBE_SIGN_QUEUE_EMPTY` | `available` | zero item list + zero counts | Healthy empty |
| `ADOBE_SIGN_QUEUE_AVAILABLE_PAGED` | `available` | page-sized list, `hasMore:true`, `nextCursor` present | Pagination contract |
| `ADOBE_SIGN_QUEUE_PARTIAL` | `partial` | safe subset + warning | Partial renderable state |
| `ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED` | `configuration-required` | empty list + zero counts | Config-required module state |
| `ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED` | `authorization-required` | empty list + zero counts | Authorization-required module state |
| `ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED` | `principal-unresolved` | empty list + zero counts | Principal-resolution module state |
| `ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE` | `source-unavailable` | empty list + zero counts | Upstream source failure state |
| `ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE` | `backend-unavailable` | frontend fallback empty list | HB backend client failure state |

## 24.9 Fixture warning expectations

| State | Required warning code |
|---|---|
| `partial` | `partial-source-data` |
| `configuration-required` | `configuration-required` |
| `authorization-required` | `authorization-required` |
| `principal-unresolved` | `principal-unresolved` |
| `source-unavailable` | `source-unavailable` |
| `backend-unavailable` | `backend-unavailable` |

### Warning-count rule
For the core fixture scenarios, each degraded envelope should carry at least one warning. Additional warnings are allowed only when the scenario specifically requires them.

## 24.10 Fixture pagination scenario

### `ADOBE_SIGN_QUEUE_AVAILABLE_PAGED`
Recommended posture:
```ts
pagination: {
  pageSize: 25,
  hasMore: true,
  nextCursor: 'fixture-cursor-page-2',
}
```

### Rule
The cursor is fixture-only and opaque. The frontend must not inspect or construct it.

## 24.11 Fixture partial scenario

### Recommended scenario
- Four of six actionable items normalize successfully.
- Two simulated source records are not safely represented because provider enrichment failed.
- Envelope:
  - `sourceStatus: 'partial'`
  - warning `partial-source-data`
  - summary counts reflect only the safely returned normalized items.
- Do not include malformed queue items.

### Rationale
This proves the system degrades by returning a valid smaller read model rather than partially invalid objects.

## 24.12 Fixture source-open URL scenario

The populated fixture should include:
- some items with valid `sourceOpenUrl`,
- at least one item without `sourceOpenUrl`.

### Rule
Absence of `sourceOpenUrl` alone does not force `partial`. It proves the UI can render a queue row without exposing a false clickable affordance.

## 24.13 Fixture freshness scenarios

| Fixture | Freshness |
|---|---|
| Available populated | `fresh` |
| Available empty | `fresh` |
| Partial | `stale` or `unknown`, with clear warning reason |
| Configuration/auth/principal/source unavailable | `unknown` |
| Backend unavailable fallback | `unknown` |

## 24.14 Mock provider behavior

### Recommended provider
```text
backend/functions/src/hosts/my-work-read-model/read-models/my-work-mock-read-model-provider.ts
```

### Provider responsibilities
- return deterministic envelopes,
- support the exact route contract,
- accept injected clock,
- support scenario option injection for tests,
- never call Adobe or external services,
- preserve DTO shape invariants,
- return correct state-specific data arrays and summaries.

## 24.15 Fixture frontend client behavior

### Recommended fixture client
```text
apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts
```

### Client responsibilities
- expose the exact two client methods,
- return type-valid fixture envelopes,
- support `simulateBackendUnavailable` for UI preview parity,
- optionally accept deterministic `now()` override,
- not mutate shared fixture constants.

## 24.16 Required model/fixture tests

| Test suite | Required proof |
|---|---|
| `MyWorkReadModels.test.ts` | modes/status unions, envelope/read-model shapes, response map |
| `AdobeSignActionQueue.test.ts` | exact actionable status mapping, queue item shape, summary shape |
| fixture provider tests | each scenario returns exact status + type-valid data |
| fixture client tests | mode/readOnly/status/warnings generated correctly |
| deterministic clock tests | injected `now()` governs `generatedAtUtc` and fixture freshness timestamp |
| source-open URL tests | optional URL behavior preserved; omission does not break item shape |

## 24.17 Provider-state and contract-testing guidance

Scenario fixtures should be suitable for future provider-state verification:
- each scenario named as a precondition,
- each verified in isolation,
- no test depends on side effects from another test,
- provider stubs can use the same scenario vocabulary.

This aligns with provider-state testing discipline in contract-testing practice. [W7]

---

# 10. Final Consolidated Contracts

## 10.1 Final model namespace

```text
packages/models/src/myWork/
```

## 10.2 Final envelope contract

```ts
export interface MyWorkReadModelEnvelope<T> {
  readonly mode: 'fixture' | 'backend';
  readonly sourceStatus:
    | 'available'
    | 'partial'
    | 'configuration-required'
    | 'authorization-required'
    | 'principal-unresolved'
    | 'source-unavailable'
    | 'backend-unavailable';
  readonly readOnly: true;
  readonly warnings: readonly MyWorkReadModelWarning[];
  readonly generatedAtUtc: string;
  readonly data: T;
}
```

## 10.3 Final route registry

```ts
export const MY_WORK_READ_MODEL_ROUTE_PATHS = {
  home: 'my-work/me/home',
  'adobe-sign-action-queue':
    'my-work/me/adobe-sign/action-queue',
} as const;
```

## 10.4 Final production HTTP routes

```http
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
```

## 10.5 Final frontend client surface

```ts
export interface IMyWorkReadModelClient {
  getMyWorkHome(): Promise<
    MyWorkReadModelEnvelope<MyWorkHomeReadModel>
  >;

  getAdobeSignActionQueue(
    query?: MyWorkAdobeSignActionQueueQuery,
  ): Promise<
    MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>
  >;
}
```

## 10.6 Final home read model

```ts
export interface MyWorkHomeReadModel {
  readonly actor: MyWorkActorSummary;
  readonly summary: MyWorkHomeSummary;
  readonly sourceReadiness: readonly MyWorkSourceReadinessItem[];
  readonly adobeSignActionQueue: MyWorkAdobeSignActionQueueHomeProjection;
}
```

## 10.7 Final Adobe queue read model

```ts
export interface MyWorkAdobeSignActionQueueReadModel {
  readonly moduleId: 'adobe-sign-action-queue';
  readonly summary: MyWorkAdobeSignActionQueueSummary;
  readonly items: readonly MyWorkAdobeSignActionQueueItem[];
  readonly pagination: MyWorkAdobeSignActionQueuePagination;
  readonly freshness: MyWorkAdobeSignActionQueueFreshness;
}
```

## 10.8 Final queue item

```ts
export interface MyWorkAdobeSignActionQueueItem {
  readonly itemId: string;
  readonly sourceSystem: 'adobe-sign';
  readonly agreementId: string;
  readonly agreementName: string;
  readonly requiredAction:
    | 'signature'
    | 'approval'
    | 'acceptance'
    | 'acknowledgement'
    | 'form-filling'
    | 'delegation';
  readonly adobeRecipientStatus:
    | 'WAITING_FOR_MY_SIGNATURE'
    | 'WAITING_FOR_MY_APPROVAL'
    | 'WAITING_FOR_MY_ACCEPTANCE'
    | 'WAITING_FOR_MY_ACKNOWLEDGEMENT'
    | 'WAITING_FOR_MY_FORM_FILLING'
    | 'WAITING_FOR_MY_DELEGATION';
  readonly sender?: MyWorkAdobeSignSenderSummary;
  readonly createdAtUtc?: string;
  readonly modifiedAtUtc?: string;
  readonly expirationAtUtc?: string;
  readonly sourceOpenUrl?: string;
}
```

## 10.9 Final queue summary

```ts
export interface MyWorkAdobeSignActionQueueSummary {
  readonly countBasis: 'returned-items' | 'provider-total';
  readonly totalActionItemCount: number;
  readonly signatureCount: number;
  readonly approvalCount: number;
  readonly acceptanceCount: number;
  readonly acknowledgementCount: number;
  readonly formFillingCount: number;
  readonly delegationCount: number;
  readonly expiringSoonCount: number;
}
```

## 10.10 Final HTTP/source-state matrix

| Scenario family | HTTP response | Envelope/source response |
|---|---|---|
| Healthy queue populated | 200 | `available` |
| Healthy queue empty | 200 | `available` |
| Safe partial result | 200 | `partial` |
| Integration config absent | 200 | `configuration-required` |
| User OAuth absent/revoked | 200 | `authorization-required` |
| Actor cannot map to Adobe principal | 200 | `principal-unresolved` |
| Adobe/provider unavailable | 200 | `source-unavailable` |
| Frontend cannot safely consume HB backend | client fallback | `backend-unavailable` |
| Missing/invalid HB backend auth | 401 | no read-model envelope |
| Policy-denied backend access | 403 | no read-model envelope |
| Invalid queue query | 400 | no read-model envelope |
| Unhandled backend failure | 500 | no read-model envelope; client may fall back |

## 10.11 Final fixture matrix

| Core area | Required scenarios |
|---|---|
| Home | available, empty, partial, configuration-required, authorization-required, principal-unresolved, source-unavailable, backend-unavailable |
| Queue | available, empty, available paged, partial, configuration-required, authorization-required, principal-unresolved, source-unavailable, backend-unavailable |
| Status coverage | exactly one populated fixture item per six MVP actionable Adobe statuses |
| Link coverage | valid source-open URL and missing source-open URL |
| Freshness | fresh, stale/unknown where relevant |
| Clock | deterministic default + injectable override |

---

# 11. Downstream Constraints for Later Batches

## 11.1 Constraints for the Adobe integration batch

The later Adobe provider/OAuth batch must not reopen these Batch 04 decisions:

1. The frontend route contract remains:
   ```http
   GET /api/my-work/me/home
   GET /api/my-work/me/adobe-sign/action-queue
   ```
2. The SPFx UI consumes My Work DTOs, not raw Adobe payloads.
3. The six-status actionable recipient mapping remains the MVP queue scope.
4. Actor identity comes from protected backend auth context; no user override path/query.
5. Direct Adobe calls from SPFx remain prohibited.
6. `sourceOpenUrl` is backend-produced and optional.
7. If Adobe returns data not safely normalizable, the provider returns `partial` or filters it intentionally; it does not leak malformed items.

## 11.2 Constraints for operational resilience work

Later resilience hardening must preserve:
- bounded query behavior,
- no high-frequency broad polling,
- careful treatment of Adobe throttling,
- structured warning codes,
- safe non-ready states,
- no raw provider exception leakage to UI,
- no inflation of returned-item counts into provider-total claims.

## 11.3 Constraints for frontend shell/module implementation

Frontend implementation must:
- treat the envelope `sourceStatus` as authoritative,
- not duplicate source-state derivation from raw values,
- render home preview items from the home read model,
- render focused-module items from the queue route,
- not construct Adobe URLs locally,
- not infer exact totals if `countBasis === 'returned-items'` and `hasMore === true`,
- map statuses/codes to end-user copy in the UI layer rather than displaying raw warning strings.

## 11.4 Constraints for testing and evidence batches

Testing/evidence work must prove:
- all exact route IDs and paths,
- GET-only route registration,
- route auth wrapping,
- no actor override path/query,
- correct fallback behavior,
- exact envelope source statuses,
- exact item/status mapping,
- deterministic fixture output,
- home and module UI rendering for each scenario,
- hosted proof for non-ready/readiness states once shell implementation exists.

## 11.5 Constraints for future convergence with `@hbc/my-work-feed`

Future work may bridge Adobe Sign Action Queue items into broader personal-work aggregation only through a deliberate architecture decision. This batch does not authorize:
- converting the My Dashboard read-model DTO layer into a replacement feed platform,
- redefining `@hbc/my-work-feed` item contracts,
- or silently merging route DTOs and shared work-item aggregation semantics.

---

# 12. Research References

## W1 — BFF/read-model seam
Microsoft Learn — *Backends for Frontends pattern*.

## W2 — HTTP semantics
IETF RFC 9110 — *HTTP Semantics*.

## W3 — HTTP error detail standard
IETF RFC 9457 — *Problem Details for HTTP APIs*.

## W4 — Adobe current-recipient action statuses
Adobe Acrobat Sign Developer — *API Agreement Statuses, Recipient Statuses, Agreement Events, and Webhook Events*.

## W5 — Adobe bounded/filtered retrieval guidance
Adobe Acrobat Sign Developer — *Acrobat Sign API Best Practices*.

## W6 — Adobe request-throttling behavior
Adobe Acrobat Sign Developer Guide — *API Usage*.

## W7 — Scenario-based provider-state test design
Pact Docs — *Provider states* and *Provider verification*.

---

# 13. Final Batch 04 Closure Statement

Batch 04 is closed with no implementation decisions left open inside its scope.

The My Dashboard workstream now has a stable, implementation-grade data-contract plan for:
- My Work read-model envelopes,
- model namespace placement,
- route IDs and route paths,
- frontend client surface,
- My Work Home DTO,
- Adobe Sign Action Queue DTO,
- item/summary/freshness/pagination models,
- HTTP vs. source-state semantics,
- deterministic fixture matrix,
- and downstream constraints for later Adobe integration, resilience, and validation batches.

No later batch should reinterpret these baseline shapes or failure semantics without an explicit architectural amendment.
