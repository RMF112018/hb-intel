# HB Intel My Dashboard — B04 Implementation Prompt Package

## Purpose

This package converts **B04 — My Work Read Models, Routes, Error Taxonomy, and Fixture Architecture Development** into a focused, execution-ready prompt sequence for a local code agent.

B04 is the **data-contract and backend-read-model foundation** for the HB Intel **My Dashboard** SPFx initiative. It establishes:

- shared My Work read-model DTOs under `packages/models/src/myWork/`,
- deterministic fixtures for My Work Home and Adobe Sign Action Queue states,
- the frontend read-model client seam in `apps/my-dashboard/src/api/`,
- the protected backend BFF/read-model host under `backend/functions/src/hosts/my-work-read-model/`,
- exactly two GET routes:
  - `my-work/me/home`
  - `my-work/me/adobe-sign/action-queue`,
- state/error semantics that distinguish source degradation from true HTTP failures.

## Execution posture

This package is **implementation-forward**, but it is not a substitute for the already-defined predecessor batches.

### Required predecessor posture

Before executing the B04 prompts that touch `apps/my-dashboard/`, confirm that the B02/B03 scaffolding exists in the working tree:

- `apps/my-dashboard/`
- My Dashboard package/runtime foundation from B02
- My Work shell structure from B03 where frontend integration seams are required

If those app files are not yet present because B02/B03 implementation prompts have not been executed, the local code agent should:

1. complete the B02/B03 package sequence first, or
2. execute only the B04 prompts that are independent of `apps/my-dashboard/`:
   - Prompt 01
   - Prompt 02
   - Prompt 04 where backend work is not blocked by app absence.

The package intentionally distinguishes **globally valid shared/backend work** from **frontend client work that depends on the My Dashboard app scaffold**.

## What B04 implements

B04 implementation should create or complete:

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

apps/my-dashboard/src/api/
├── myWorkReadModelClient.ts
├── myWorkReadModelClientFactory.ts
├── myWorkBackendReadModelClient.ts
├── myWorkFixtureReadModelClient.ts
└── related tests

backend/functions/src/hosts/my-work-read-model/
├── my-work-read-model-routes.ts
├── my-work-read-model-routes.test.ts
└── read-models/
    ├── my-work-read-model-provider.ts
    ├── my-work-mock-read-model-provider.ts
    └── related tests where aligned to repo convention
```

The exact test file names may follow the repository’s co-located or current convention, but the test coverage specified in this package is mandatory.

## Prompt sequence

| Prompt | Topic | Dependency |
|---|---|---|
| Prompt 01 | Shared My Work read-model contracts and exports | Independent |
| Prompt 02 | Deterministic fixture matrix and shared fixture package | Prompt 01 |
| Prompt 03 | Frontend read-model clients for My Dashboard | Prompts 01–02; B02 app scaffold |
| Prompt 04 | Backend BFF/read-model host, mock provider, and protected GET routes | Prompts 01–02 |
| Prompt 05 | Cross-layer contract validation, query/error matrix, and consistency hardening | Prompts 01–04 |
| Prompt 06 | Final validation, closeout, and implementation evidence summary | Prompts 01–05 |

## Core closed decisions the prompts must preserve

### Product and architecture
- My Dashboard is a standalone SPFx app/domain.
- My Work is the personal shell within My Dashboard.
- Adobe Sign Action Queue is the first rendered/selectable module.
- The B04 My Work read-model family is a **narrow My Dashboard BFF/DTO layer**, not a replacement for `@hbc/my-work-feed`.
- PCC is a **pattern reference**, not a source of copied project-context semantics.

### Route and transport
- Two route IDs only:
  - `home`
  - `adobe-sign-action-queue`
- Two production HTTP routes only:
  - `GET /api/my-work/me/home`
  - `GET /api/my-work/me/adobe-sign/action-queue`
- No actor override path.
- No email/user/principal override query string.
- Queue route query surface is limited to:
  - `pageSize`
  - `cursor`

### Envelope and state model
- Read-model mode:
  - `fixture`
  - `backend`
- Source status:
  - `available`
  - `partial`
  - `configuration-required`
  - `authorization-required`
  - `principal-unresolved`
  - `source-unavailable`
  - `backend-unavailable`
- Expected source/business states return HTTP 200 with a valid envelope.
- True HTTP failures remain repo-standard error responses.
- Do not introduce a My Work-only RFC 9457 response format.

### Adobe queue contract
- Six actionable statuses only:
  - `WAITING_FOR_MY_SIGNATURE`
  - `WAITING_FOR_MY_APPROVAL`
  - `WAITING_FOR_MY_ACCEPTANCE`
  - `WAITING_FOR_MY_ACKNOWLEDGEMENT`
  - `WAITING_FOR_MY_FORM_FILLING`
  - `WAITING_FOR_MY_DELEGATION`
- The frontend consumes normalized `requiredAction`; it does not interpret raw Adobe states.
- `sourceOpenUrl` is optional, backend-produced, and never guessed by the frontend.

## Explicit out of scope

Do not implement:
- Adobe OAuth/token storage,
- live Adobe API provider logic,
- row-level Adobe UI polish beyond what B03/B05 define,
- webhook synchronization,
- in-HB signing or approval,
- cross-user queue access,
- manager/team queue projection,
- a new broad personal-work platform beside `@hbc/my-work-feed`,
- hosted SharePoint Playwright evidence lanes,
- B05 detailed Adobe UI implementation,
- B07 live integration backbone.

## What “done” means

B04 is closed when:

1. Shared My Work DTOs and fixtures exist and type-check.
2. The app-facing read-model client interface/factory/backends exist where the My Dashboard app scaffold exists.
3. The backend My Work read-model host exists with exactly two protected GET routes.
4. Mock provider routes return deterministic envelopes matching B04.
5. Tests prove:
   - contract literals and shapes,
   - exact route registry and paths,
   - no actor override surfaces,
   - frontend backend-client URL/query construction,
   - fallback to `backend-unavailable`,
   - provider/fixture scenario behavior,
   - query validation,
   - structured warnings and deterministic timestamps.
6. No prompt leaks B05/B07 implementation scope.

## Package files

- `00_B04_Implementation_Package_Overview.md`
- `01_B04_Repo_Truth_Implementation_Plan.md`
- `02_B04_Target_Contracts_And_Route_Map.md`
- `03_B04_Validation_And_Closeout_Requirements.md`
- `04_B04_Implementation_Gap_Register.md`
- `05_B04_Targeted_Web_Verification_Notes.md`
- `Prompt_01_B04_Shared_My_Work_Read_Model_Contracts_And_Exports.md`
- `Prompt_02_B04_Deterministic_Fixture_Matrix_And_Shared_Fixture_Package.md`
- `Prompt_03_B04_Frontend_My_Work_Read_Model_Client_Seam.md`
- `Prompt_04_B04_Backend_My_Work_Read_Model_Host_And_Protected_Routes.md`
- `Prompt_05_B04_Cross_Layer_Contract_Validation_And_Error_Matrix_Hardening.md`
- `Prompt_06_B04_Final_Validation_Closeout_And_Handoff.md`
