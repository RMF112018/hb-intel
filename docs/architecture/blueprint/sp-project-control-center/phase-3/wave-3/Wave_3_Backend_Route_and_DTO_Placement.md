# Phase 3 — Wave 3 Backend Route and DTO Placement

**Wave:** 3 (PCC Backend Read-Model Foundation)  
**Prompt:** 02 (documentation / architecture-lock only)  
**Date:** 2026-04-30

## 1. Executive Summary

Prompt 02 is a documentation-only architecture lock. It resolves exactly one
substantive decision: **W3-OD-003 backend source placement**.

Prompt 01 decisions remain locked and are only confirmed here:

- **W3-OD-001 route namespace:** `/api/pcc/projects/{projectId}/...`
- **W3-OD-002 DTO/read-model placement:** `packages/models/src/pcc/`, exposed
  through `@hbc/models/pcc`

No backend route source, DTO source, or SPFx source is implemented in Prompt 02.

## 2. Route Namespace Decision (Confirmed from Prompt 01)

Prompt 02 does not decide route namespace. Prompt 01 already froze
`/api/pcc/projects/{projectId}/...` for Wave 3.

## 3. Initial Route List (Prompt 05 Implementation Target Only)

The following read-only routes are documented as the planned Prompt 05 target
surface only; Prompt 02 does not implement them:

- `/api/pcc/projects/{projectId}/profile`
- `/api/pcc/projects/{projectId}/modules`
- `/api/pcc/projects/{projectId}/home`
- `/api/pcc/projects/{projectId}/priority-actions`
- `/api/pcc/projects/{projectId}/document-control`
- `/api/pcc/projects/{projectId}/external-links`
- `/api/pcc/projects/{projectId}/site-health`

Wave 3 route behavior remains GET-only, read-model-only, and mock/local-provider
backed.

## 4. Deferred Route List

Deferred from initial Wave 3 read-model route implementation:

- `/api/pcc/projects/{projectId}/team-access`
- `/api/pcc/projects/{projectId}/approvals`
- `/api/pcc/projects/{projectId}/readiness`
- `/api/pcc/projects/{projectId}/responsibilities`
- `/api/pcc/projects/{projectId}/workflows`
- `/api/pcc/projects/{projectId}/workflow-items`
- `/api/pcc/projects/{projectId}/settings`

Also deferred: any write or execution route surfaces (permission execution,
approval execution, provisioning execution, repair execution, or external-system
runtime operations).

## 5. DTO / Model Placement Decision (Confirmed from Prompt 01)

Prompt 02 does not decide DTO placement. Prompt 01 already froze shared PCC
read-model DTO placement to `packages/models/src/pcc/`, exported through
`@hbc/models/pcc`.

## 6. Backend Source Placement Decision (W3-OD-003 Resolved)

**Frozen for MVP:** backend PCC read-model route/source placement is
`backend/functions/src/hosts/pcc-read-model/`.

This freezes architecture placement only for downstream implementation prompts.
Prompt 02 does not create this folder and does not add route source files.

## 7. Mock Provider Posture

Wave 3 remains mock/local-provider-backed for the PCC read-model route family:

- no live Graph, PnP, or SharePoint REST runtime call;
- no Procore, Document Crunch, or Adobe Sign runtime;
- no tenant mutation;
- no backend write verbs.

## 8. Auth/Response/Helper Conventions to Reuse (Repo-Truth Grounded)

The future Prompt 04/05 implementation should reuse existing backend conventions
proven in current repo files:

- **Route registration pattern:** `app.http(...)` route registration in function
  modules, shown in
  `backend/functions/src/functions/projects/index.ts` and
  `backend/functions/src/functions/adminApi/index.ts`.
- **Auth middleware wrapper:** routes are wrapped with `withAuth(...)`, shown in
  `backend/functions/src/functions/projects/index.ts` and
  `backend/functions/src/functions/adminApi/index.ts`.
- **Request ID handling:** request IDs are extracted/generated via
  `extractOrGenerateRequestId(...)`, shown in
  `backend/functions/src/functions/projects/index.ts` and
  `backend/functions/src/functions/adminApi/index.ts`.
- **Response helper posture:** standardized responses from helper utilities
  imported from `../../utils/response-helpers.js`, shown in
  `backend/functions/src/functions/projects/index.ts` and
  `backend/functions/src/functions/adminApi/index.ts`.
- **Validation posture:** schema/body parsing via existing validation middleware
  patterns (for example `parseBody(...)` + schemas in the projects routes),
  shown in `backend/functions/src/functions/projects/index.ts`.
- **Scoped-host posture:** repository doctrine states scoped domain hosts with
  composition roots and release-boundary manifests, documented in
  `backend/functions/README.md` ("Domain Hosts", ADR-0124 posture), with
  existing host examples under `backend/functions/src/hosts/`.

## 9. SPFx Client-Boundary Assumptions

Prompt 02 confirms current Wave 3 assumptions:

- Wave 3 does not default SPFx data mode to backend runtime.
- SPFx remains fixture-driven by default through Wave 3.
- Any backend-read opt-in boundary remains gated for later Prompt 06 decisions.

## 10. Guardrails

Prompt 02 guardrails (preserved):

- documentation/architecture-lock only;
- no backend route source implementation;
- no DTO source implementation;
- no SPFx source implementation;
- no write verbs;
- no tenant mutation;
- no live Graph/PnP/SharePoint REST runtime;
- no Procore/Document Crunch/Adobe Sign runtime;
- no Site Health scanner/repair execution;
- no Team & Access permission execution;
- no approval execution;
- no provisioning executor;
- no package/version/manifest/lockfile/workflow/deployment changes.

## 11. Prompt 03 Readiness Statement

Prompt 02 closes W3-OD-003 and leaves Prompt 03 ready to implement PCC read-model
contracts in `packages/models/src/pcc/` (additive contracts only), while keeping
all Wave 3 hard exclusions and non-runtime posture intact.

---

## Closeout

- **Files changed:**  
  - `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Backend_Route_and_DTO_Placement.md`  
  - `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Open_Decisions.md`  
  - `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-03/README.md`
- **Decisions resolved:**  
  - `W3-OD-003` frozen to `backend/functions/src/hosts/pcc-read-model/`
- **Decisions deferred:**  
  - `W3-OD-012` runtime-flag naming details (Prompt 06)  
  - `W3-OD-014` dependency/lockfile churn posture (proof-gated)  
  - `W3-OD-017` SPFx source seam implementation (Prompt 06 proof-gated)  
  - `W3-OD-018` ADR timing for scoped-host record (deferred)
- **No-source-change confirmation:** no files under `backend/functions/src/**`,
  `packages/models/src/pcc/**`, or `apps/project-control-center/src/**` were
  modified.
- **No package/lockfile change confirmation:** no `package.json`, lockfile,
  workflow, deployment, version, or manifest changes were made.
- **Recommended next prompt:** Prompt 03 — PCC Read-Model Contracts.
