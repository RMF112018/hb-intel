# Repo-Truth Audit — Phase 3 / Wave 6 Team & Access

Generated: 2026-04-30

Repository: `RMF112018/hb-intel`  
Local code-agent path: `/Users/bobbyfetting/hb-intel`  
Branch audited: `main` via GitHub file reads  
Latest audited HEAD evidenced by Wave 5 closeout: `570e8136d`  
`pnpm-lock.yaml` md5 recorded in Wave 5 closeout: `c56df7b79986896624536aab74d609f4`

## Audit status

Wave 6 is **planning-unblocked** and may proceed through a local repo-truth gate before implementation.

The repo truth supports this posture:

- Phase 3 roadmap places Wave 6 after Wave 5 and defines Wave 6 as **Team & Access — request + approval workflow**.
- Wave 5 closeout exists and marks Wave 5 **Complete**.
- Wave 5A exists only as an **optional controlled tenant revalidation gate** after Wave 5. It is not a Wave 6 code prerequisite.
- Team & Access shared vocabulary already exists in `packages/models/src/pcc/TeamAccess.ts`.
- Team & Access fixture data already exists in `packages/models/src/pcc/fixtures/TeamAccessFixtures.ts`.
- Backend read-model shared contracts already include `PccTeamAccessReadModel` and `'team-access'` in `PccReadModelResponseMap`.
- Backend mock provider/interface already include `getTeamAccess(...)`.
- Backend HTTP routes do **not** currently register `GET /api/pcc/projects/{projectId}/team-access`.
- SPFx `IPccReadModelClient` and fixture/backend client route lists do **not** currently expose `getTeamAccess(...)`.
- SPFx Team & Access surface currently renders fixture/preview-only lane cards with disabled controls.
- `PccSurfaceRouter` threads the read-model client only to Project Home; Team & Access currently receives no client.
- Guardrail tests currently protect no-runtime/no-mutation behavior and explicit backend opt-in.

## Files inspected

Minimum governing docs:

- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`

Wave records:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/`

SPFx / UI doctrine:

- `docs/reference/ui-kit/doctrine/`
- `docs/reference/spfx-surfaces/`
- `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`

Code areas:

- `apps/project-control-center/`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/mount.tsx`
- `apps/project-control-center/src/shell/`
- `apps/project-control-center/src/state/`
- `apps/project-control-center/src/layout/`
- `apps/project-control-center/src/ui/`
- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/surfaces/teamAccess/`
- `apps/project-control-center/src/surfaces/projectHome/`
- `apps/project-control-center/src/tests/`
- `packages/models/src/pcc/`
- `backend/functions/src/hosts/pcc-read-model/`
- package/workspace files.

## Current Phase 3 state

### Waves 1–5

- Wave 1: Shared PCC foundations complete.
- Wave 2: SPFx shell frame and preview surfaces complete.
- Wave 3: backend read-model foundation complete.
- Wave 4: Project Home explicit backend opt-in complete; default fixture path preserved.
- Wave 5: Priority Actions Rail complete; default fixture path preserved; backend mode Project Home now calls `/home`, `/priority-actions`, and `/document-control`.

### Wave 4A / 5A

- Wave 4A is an operator-controlled non-production hosted visual validation gate.
- Wave 5A is optional controlled tenant revalidation after Priority Actions Rail.
- Neither is a production rollout approval.
- No Wave 5A closeout was identified as a required Wave 6 dependency.
- Wave 6 package must not require `.sppkg`, app catalog, tenant, PnP, Graph, Azure, or deployment commands.

## Existing Team & Access model truth

`packages/models/src/pcc/TeamAccess.ts` already defines:

- Audience states:
  - `has-project-access`
  - `needs-project-access`
  - `access-manager`
- Lanes:
  - `team-viewer`
  - `permission-request`
  - `access-manager`
- Request statuses:
  - `draft-preview`
  - `submitted-preview`
  - `pending-review`
  - `approved-pending-execution`
  - `rejected`
  - `completed-manual`
- Execution statuses:
  - `preview-only`
  - `manual-it-handled`
  - `backend-gated-later`
- Member kinds:
  - `internal`
  - `external`
  - `guest`
- Manager personas:
  - `pcc-admin`
  - `it-admin`
  - `estimating-coordinator`
  - `lead-estimator`
  - `project-executive`
  - `project-manager`
  - `manager-of-operational-excellence`

Important boundary: this file states the Team & Access vocabulary is **read-model only** and is **not authoritative authorization logic**.

## Existing fixture truth

`packages/models/src/pcc/fixtures/TeamAccessFixtures.ts` already provides deterministic, non-PII fixture data:

- internal / external / guest members;
- current user context;
- permission-request preview records;
- `pending-review` and `approved-pending-execution` examples;
- backend-gated execution status;
- audit-preview label.

## Existing backend truth

### Already present

- `PccTeamAccessReadModel` exists in `packages/models/src/pcc/PccReadModels.ts`.
- `PccReadModelResponseMap` already contains `'team-access'`.
- `IPccReadModelProvider` already declares `getTeamAccess(...)`.
- `PccMockReadModelProvider` already implements `getTeamAccess(...)`.

### Missing

- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` currently registers seven GET routes only:
  - `profile`
  - `modules`
  - `home`
  - `priority-actions`
  - `document-control`
  - `external-links`
  - `site-health`
- No `team-access` HTTP route is currently registered.
- Any Wave 6 backend work must remain read-only and GET-only.

## Existing SPFx Team & Access surface truth

Current files:

- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/shared.ts`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamViewerLaneCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccPermissionRequestLaneCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessManagerLaneCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.module.css`

Current behavior:

- `team-and-access` routes to `PccTeamAccessSurface`.
- The surface uses app-local `TeamAccessBranch` values:
  - `access-manager`
  - `has-project-access`
  - `needs-project-access`
- Branching is based on existing manager-persona fixture metadata and `hasProjectSiteAccess`.
- Permission request controls are disabled.
- Access manager controls are disabled.
- The UI uses preview copy such as “preview only,” “request submission is deferred,” and “no backend/API execution.”
- No persistence, approval execution, permission execution, live people lookup, or backend read-model client is currently wired.

## Existing SPFx read-model client truth

Current client boundary exposes seven routes and seven methods:

- `getProjectProfile`
- `getModuleRegistry`
- `getProjectHome`
- `getPriorityActions`
- `getDocumentControl`
- `getExternalLinks`
- `getSiteHealth`

Missing for Wave 6 optional backend opt-in:

- route id: `'team-access'`
- route path: `pcc/projects/{projectId}/team-access`
- method: `getTeamAccess(...)`
- fixture client implementation
- backend HTTP client implementation
- controlled-consumption guard allowlist update
- Team & Access opt-in hook/adapter
- `PccSurfaceRouter` threading to Team & Access only, if backend opt-in is adopted.

## Existing no-runtime / no-mutation guardrails

Current SPFx guardrail test: `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`.

It currently protects:

- no new `fetch(` callsites outside `pccBackendReadModelClient.ts` and its direct test;
- no forbidden runtime imports (`@pnp/sp`, `@pnp/graph`, `@microsoft/sp-pnp-js`, `@microsoft/sp-http`, `@hbc/auth/spfx`, `msgraph`, `graph.microsoft.com`, `procore`);
- no forbidden runtime tokens in `src/api/**` (`MSGraphClient`, `GraphServiceClient`, `sp.web`, `_api/web`, `ProcoreClient`, `DocumentCrunchClient`, `AdobeSignClient`);
- backend HTTP client is GET-only; no `POST`, `PUT`, `PATCH`, `DELETE` method literals;
- `readModelClient` is threaded to exactly one surface — currently Project Home only;
- no direct `HbcPriorityRail` reuse;
- fixture remains the default mode;
- mount uses only the approved factory entry point.

Wave 6 must update these guardrails narrowly if it opts Team & Access into read-model consumption.

## Risks and scope traps

1. **Preview controls appearing executable.** Approve/reject/comment and request-submit controls must remain labeled preview/manual and must not imply permission mutation.
2. **Persona metadata becoming auth.** Existing `TEAM_ACCESS_MANAGER_PERSONAS` can drive display behavior only. It is not authoritative authorization.
3. **External user scope creep.** Shared fixtures include `external` and `guest`, but current README frozen decisions exclude external users from MVP. Wave 6 may display fixture records, but must not implement external access execution.
4. **Backend write-route creep.** Wave 6 must not add POST/PUT/PATCH/DELETE routes.
5. **Graph/PnP/SharePoint REST creep.** No direct runtime import or API call is allowed.
6. **Priority Actions Rail coupling.** Team & Access priority actions already appear in Wave 5 via existing priority-action fixtures. Do not expand rail behavior unless a prompt explicitly authorizes metadata-only integration.
7. **Surface-wide backend cutover.** Any backend opt-in must remain explicit and surface-scoped. Do not accidentally thread the read-model client to all surfaces.
8. **Package/deployment drift.** No version bump, lockfile change, workflow change, manifest change, `.sppkg`, app catalog, or deployment artifact belongs in Wave 6.

## Recommended Wave 6 sequencing

1. Repo-truth gate and Wave 6 scope lock.
2. Team & Access view model and adapter.
3. Access request form and request status UI.
4. Request queue and detail review UI.
5. Manager execution queue and manual IT posture.
6. Optional backend read-model opt-in wiring for read-only `team-access`.
7. Guardrails, states, and regression hardening.
8. Documentation closeout and Wave 7 readiness.
