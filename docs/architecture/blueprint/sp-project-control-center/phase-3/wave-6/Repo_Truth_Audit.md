# Repo-Truth Audit — Phase 3 / Wave 6 Team & Access

| Field | Value |
| --- | --- |
| Phase | 3 |
| Wave | 6 — PCC Team & Access |
| Wave 6 status | **Opened / scoped / planned** (no Wave 6 closeout exists) |
| Implementation entry point | Prompt 02 |
| Date | 2026-04-30 |
| Branch audited | `main` (local) |
| Wave 5 closeout audited implementation through | `570e8136d` |
| Current HEAD | `33e6df3f0` (the Wave 5 closeout commit itself) |
| `pnpm-lock.yaml` md5 (pre-Prompt-01) | `c56df7b79986896624536aab74d609f4` |

## Audit status

A fresh review confirmed Wave 6 could not be certified complete because the
repo only contained the Wave 5 closeout plus pre-existing Team & Access preview
foundations. Wave 6 is **opened / scoped / planned** by Prompt 01;
implementation work begins with Prompt 02. **No Wave 6 closeout exists yet.**

The repo truth supports the Wave 6 planning posture:

- The Phase 3 roadmap places Wave 6 after Wave 5 and defines Wave 6 as
  **Team & Access — request + approval workflow**.
- Wave 5 closeout (`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Closeout.md`)
  marks Wave 5 **Complete** and recommends Wave 6 planning may proceed (§23).
- Wave 5A exists only as an **optional controlled tenant revalidation gate**
  after Wave 5. It is **not** a Wave 6 code prerequisite (§20, §23).
- Team & Access shared vocabulary already exists in
  `packages/models/src/pcc/TeamAccess.ts`.
- Team & Access fixture data already exists in
  `packages/models/src/pcc/fixtures/TeamAccessFixtures.ts`.
- Backend read-model shared contracts already include `PccTeamAccessReadModel`
  and `'team-access'` in `PccReadModelResponseMap`
  (`packages/models/src/pcc/PccReadModels.ts`).
- Backend provider **interface** (`IPccReadModelProvider`) and **mock provider**
  (`PccMockReadModelProvider`) already declare/implement `getTeamAccess(...)`
  in `backend/functions/src/hosts/pcc-read-model/`.
- Backend HTTP routes do **not** currently register
  `GET /api/pcc/projects/{projectId}/team-access`.
- SPFx `IPccReadModelClient` and fixture/backend client implementations under
  `apps/project-control-center/src/api/` do **not** currently expose
  `getTeamAccess(...)`.
- SPFx Team & Access surface (`apps/project-control-center/src/surfaces/teamAccess/`)
  currently renders fixture/preview-only lane cards with disabled controls.
- `PccSurfaceRouter` threads the read-model client only to Project Home;
  Team & Access currently receives no client.
- Guardrail tests (`apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`)
  currently protect no-runtime / no-mutation behavior, GET-only backend client,
  single read-model consumer (Project Home), and forbid direct
  `HbcPriorityRail` reuse.

## Files inspected

Minimum governing docs:

- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Closeout.md`

Code areas:

- `apps/project-control-center/README.md`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/`
- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- `packages/models/src/pcc/TeamAccess.ts`
- `packages/models/src/pcc/fixtures/TeamAccessFixtures.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `backend/functions/src/hosts/pcc-read-model/`
- nearest package files for the touched packages.

## Current Phase 3 state

### Waves 1–5

- Wave 1: Shared PCC foundations complete.
- Wave 2: SPFx shell frame and preview surfaces complete.
- Wave 3: Backend read-model foundation complete (seven GET routes:
  `profile`, `modules`, `home`, `priority-actions`, `document-control`,
  `external-links`, `site-health`).
- Wave 4: Project Home explicit backend opt-in complete; default fixture path
  preserved.
- Wave 5: Priority Actions Rail complete; default fixture path preserved;
  backend mode Project Home now calls `/home`, `/priority-actions`, and
  `/document-control`.

### Wave 4A / 5A

- Wave 4A is an operator-controlled non-production hosted visual validation
  gate.
- Wave 5A is an analogous optional controlled tenant revalidation phase after
  the Priority Actions Rail.
- Neither is a production rollout approval.
- Neither is a Wave 6 dependency.
- Wave 6 must not require `.sppkg`, app catalog, tenant, PnP, Graph, Azure, or
  deployment commands.

## Existing Team & Access model truth

`packages/models/src/pcc/TeamAccess.ts` already defines:

- Audience states: `has-project-access`, `needs-project-access`,
  `access-manager`.
- Lanes: `team-viewer`, `permission-request`, `access-manager`.
- Request statuses: `draft-preview`, `submitted-preview`, `pending-review`,
  `approved-pending-execution`, `rejected`, `completed-manual`.
- Execution statuses: `preview-only`, `manual-it-handled`,
  `backend-gated-later`.
- Member kinds: `internal`, `external`, `guest`.
- Manager personas: `pcc-admin`, `it-admin`, `estimating-coordinator`,
  `lead-estimator`, `project-executive`, `project-manager`,
  `manager-of-operational-excellence`.

The shared module states the Team & Access vocabulary is **read-model only**
and is **not authoritative authorization logic**.

## Existing fixture truth

`packages/models/src/pcc/fixtures/TeamAccessFixtures.ts` provides deterministic,
non-PII fixture data: internal / external / guest members; current user
context; permission-request preview records; `pending-review` and
`approved-pending-execution` examples; backend-gated execution status; an
audit-preview label.

## Existing backend truth (precise)

### Already present

- `PccTeamAccessReadModel` exists in
  `packages/models/src/pcc/PccReadModels.ts`.
- `PccReadModelResponseMap` already contains `'team-access'`.
- `IPccReadModelProvider` (the backend provider **interface**) declares
  `getTeamAccess(...)`.
- `PccMockReadModelProvider` (the backend **mock provider**) implements
  `getTeamAccess(...)`.

### Missing

- No HTTP `team-access` route is currently registered in
  `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`.
  That file currently registers seven GET routes only (`profile`, `modules`,
  `home`, `priority-actions`, `document-control`, `external-links`,
  `site-health`).
- The SPFx API client (`apps/project-control-center/src/api/`) does **not**
  expose `getTeamAccess(...)` on `IPccReadModelClient`,
  `pccFixtureReadModelClient`, or `pccBackendReadModelClient`.

### Decision deferred to implementation prompts

Whether to wire `team-access` as a read-only **explicit-opt-in** route + client
method (the Wave 4 pattern Project Home uses) or to **defer** that wiring is a
decision for Prompt 02 / Prompt 03 sequencing. Prompt 06 is the dedicated
optional opt-in slot for that wiring; if Prompts 02–05 do not require it, the
backend wiring may stay deferred to Prompt 06 or to a later wave. Any backend
work taken in Wave 6 must remain **read-only and GET-only**.

## Existing SPFx Team & Access surface truth

Current files in `apps/project-control-center/src/surfaces/teamAccess/`:

- `PccTeamAccessSurface.tsx`
- `shared.ts`
- `PccTeamAccessHeaderCard.tsx`
- `PccTeamViewerLaneCard.tsx`
- `PccPermissionRequestLaneCard.tsx`
- `PccAccessManagerLaneCard.tsx`
- `PccTeamAccessSurface.module.css`

Current behavior:

- `team-and-access` routes to `PccTeamAccessSurface`.
- The surface uses app-local `TeamAccessBranch` values: `access-manager`,
  `has-project-access`, `needs-project-access`.
- Branching is based on existing manager-persona fixture metadata and
  `hasProjectSiteAccess`.
- Permission request controls are disabled.
- Access manager controls are disabled.
- The UI uses preview copy such as "preview only," "request submission is
  deferred," and "no backend/API execution."
- No persistence, approval execution, permission execution, live people lookup,
  or backend read-model client is currently wired.

## Existing SPFx read-model client truth

Current SPFx client boundary exposes seven routes / methods, mirroring the
backend:

- `getProjectProfile`
- `getModuleRegistry`
- `getProjectHome`
- `getPriorityActions`
- `getDocumentControl`
- `getExternalLinks`
- `getSiteHealth`

Missing for any optional Wave 6 backend opt-in:

- route id: `'team-access'`
- route path: `pcc/projects/{projectId}/team-access`
- method: `getTeamAccess(...)`
- fixture-client implementation
- backend-HTTP-client implementation
- controlled-consumption guard allowlist update
- Team & Access opt-in hook/adapter
- `PccSurfaceRouter` threading to Team & Access only, if backend opt-in is
  adopted (must remain surface-scoped — not a global cutover).

## Existing no-runtime / no-mutation guardrails

`apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` currently
protects:

- no new `fetch(` callsites outside `pccBackendReadModelClient.ts` and its
  direct test;
- no forbidden runtime imports (`@pnp/sp`, `@pnp/graph`, `@microsoft/sp-pnp-js`,
  `@microsoft/sp-http`, `@hbc/auth/spfx`, `msgraph`, `graph.microsoft.com`,
  `procore`);
- no forbidden runtime tokens in `src/api/**` (`MSGraphClient`,
  `GraphServiceClient`, `sp.web`, `_api/web`, `ProcoreClient`,
  `DocumentCrunchClient`, `AdobeSignClient`);
- backend HTTP client is GET-only (no `POST`, `PUT`, `PATCH`, `DELETE` method
  literals);
- `readModelClient` is threaded to exactly one surface — currently Project
  Home only;
- no direct `HbcPriorityRail` reuse;
- fixture remains the default mode;
- mount uses only the approved factory entry point.

Wave 6 must update these guardrails narrowly **only** if it opts Team & Access
into read-model consumption. The guardrails must continue to forbid write
methods, forbidden runtime imports, and global multi-surface threading.

## Risks and scope traps

1. **Preview controls appearing executable.** Approve / reject / comment and
   request-submit controls must remain labeled preview/manual and must not
   imply permission mutation.
2. **Persona metadata becoming auth.** Existing `TEAM_ACCESS_MANAGER_PERSONAS`
   may drive display behavior only. It is not authoritative authorization.
3. **External user scope creep.** Shared fixtures include `external` and
   `guest`, but current README frozen decisions exclude external users from
   MVP. Wave 6 may display fixture records, but must not implement external
   access execution.
4. **Backend write-route creep.** Wave 6 must not add POST / PUT / PATCH /
   DELETE routes.
5. **Graph / PnP / SharePoint REST creep.** No direct runtime import or API
   call is allowed.
6. **Priority Actions Rail coupling.** Team & Access priority actions already
   appear in Wave 5 via existing priority-action fixtures. Do not expand rail
   behavior unless a prompt explicitly authorizes metadata-only integration.
7. **Surface-wide backend cutover.** Any backend opt-in must remain explicit
   and surface-scoped. Do not accidentally thread the read-model client to all
   surfaces.
8. **Package / deployment drift.** No version bump, lockfile change, workflow
   change, manifest change, `.sppkg`, app catalog, or deployment artifact
   belongs in Wave 6.

## Recommended Wave 6 sequencing

1. Repo-truth gate and Wave 6 scope lock (this prompt — Prompt 01).
2. Team & Access view model and adapter (Prompt 02).
3. Access request form and request status UI (Prompt 03).
4. Request queue and detail review UI (Prompt 04).
5. Manager execution queue and manual IT posture (Prompt 05).
6. Optional backend read-model opt-in wiring for read-only `team-access`
   (Prompt 06).
7. Guardrails, states, and regression hardening (Prompt 07).
8. Documentation closeout and Wave 7 readiness (Prompt 08).

## Wave 6 status — final line

Wave 6 is **opened**. Implementation begins at **Prompt 02**. **No Wave 6
closeout exists.**
