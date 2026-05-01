# Phase 3 — Wave 6 Closeout (PCC Team & Access)

| Field | Value |
| --- | --- |
| Phase | 3 |
| Wave | 6 — PCC Team & Access |
| Status | **Complete** |
| Date | 2026-05-01 |
| Audited HEAD | `115845137` (Prompt 07 close; the most recent Wave 6 code-affecting commit) |
| `@hbc/spfx-project-control-center` version | `0.0.1` (unchanged across Wave 6) |
| `pnpm-lock.yaml` md5 | `c56df7b79986896624536aab74d609f4` (unchanged across Wave 6) |
| Implementation prompts | 01–07 (landed); 08 (this closeout) |

---

## 1. Executive summary

Wave 6 takes the PCC Team & Access surface from a Wave 2 fixture-only preview lane shell to a layered fixture-default surface with a structured request form, a canonical request-status badge, a request queue + detail panel, preview-only review controls, a manager execution queue, and a lane-level execution-status panel — **and** a single optional read-only `team-access` backend opt-in that follows the Wave 4 Project Home explicit-opt-in pattern.

Wave 6 introduces no write routes, no auth wiring, no Microsoft Graph / PnP / SharePoint REST runtime, no Procore / Document Crunch / Adobe Sign runtime, no SharePoint group mutation, no Teams membership mutation, no permission execution, no approval execution, no persistence, no `.sppkg` generation, no app-catalog upload, no tenant operation, no CI/CD workflow change, and no package / manifest version bump. The `pnpm-lock.yaml` md5 is unchanged across the entire wave.

The wave landed across seven implementation commits plus this closeout. No commit is on a feature branch — all landed directly on `main` per the existing PCC discipline.

---

## 2. Prompt-by-prompt index

| Prompt | Commit(s) | Conventional summary | Scope |
| --- | --- | --- | --- |
| 01 | `9d948940d` | `docs(pcc): open wave 6 team access scope lock` | Wave 6 scope lock, closed-decisions register, repo-truth audit, implementation sequence under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-6/`. |
| 02 | `23ba49175` | `feat(spfx-pcc): add team access view model adapter` | App-local view-model contract + pure adapter; canonical em-dash `Approved — Pending Execution` request-status label; `EXECUTION_STATUS_LABELS` + `NO_PERMISSION_CHANGE_NOTICE`; `shared.ts` delegates to the adapter (cycle-free). |
| 03 | `42888041e` | `feat(spfx-pcc): add team access request form preview` | Preview-only `<form>` with controlled local state, disabled submit, "Preview only" / "Request submission is deferred" / "No permission change has been executed" copy; `PccRequestStatusBadge` with tone map; lane card wires the form, replaces inline status pill with the badge, adds the panel-level no-permission-change notice. |
| 04 | `8e39052fe` | `feat(spfx-pcc): add team access review queue preview` | Request queue + detail panel + review controls. Data-prop-only components. Approve/Reject buttons carry visible `(preview only)` suffix; review controls own the action-context no-permission-change notice; per-file source-level guard scans for forbidden tokens + executable callback props. |
| 05 | `b0f047d7c` | `feat(spfx-pcc): add team access execution queue preview` | Manager execution queue (4 canonical sections: `Pending Manual IT`, `Completed Manual`, `Backend-Gated Later`, `Preview Only`) + execution-status panel. Adapter `EXECUTION_STATUS_LABELS` updated to canonical Title-Case form (`Preview Only`, `Manual IT handled`, `Backend-Gated Later`); manager-persona chips sourced from shared `TEAM_ACCESS_MANAGER_PERSONAS`. |
| 06 | `1ccf8acb2` + `dfa71904c` (fixup) | `feat(spfx-pcc): wire team access read model opt-in` | Optional read-only `team-access` backend opt-in. `1ccf8acb2` interleaved Wave 7 Document Control fixture work with most of Prompt 06 (route, client interface, backend client, hook, content wrapper, lane shell, surface wiring, dormancy update, opt-in tests, README); `dfa71904c` added the missing fixture-client `getTeamAccess` implementation that `1ccf8acb2` dropped, restoring the SPFx workspace to green check-types. The new client method **reuses the existing `fetchImpl` wrapper — zero new `fetch(` callsites** are introduced. The dormancy guard is updated to set-equality `{project-home, team-and-access}` for `readModelClient` consumers. |
| 07 | `115845137` | `test(spfx-pcc): harden team access guardrails` | Workspace-wide mutation/execution identifier scan (six categories: permission mutation, approval/workflow execution, SharePoint group mutation, Teams membership mutation, provisioning execution, Site Health repair); direct state-rendering coverage for `PccTeamAccessReadModelContent` (loading / error / preview / rejected branches); backend-unavailable opt-in scenario for `team-and-access`; backend route-guardrails token list extended with explicit CamelCase / Graph-API-path identifiers. |
| 08 | _this closeout_ | `docs(pcc): close wave 6 team access` | This document + Wave 6 closed-decisions status update. |

---

## 3. Implemented files (grouped)

### `apps/project-control-center/src/surfaces/teamAccess/`

- `teamAccessViewModel.ts` (Prompt 02) — view-model contract:
  `IPccTeamAccessRequestStatusBucket`, `IPccTeamAccessExecutionPosture`,
  `IPccTeamAccessAuditTrailRow`, `IPccTeamAccessVisibleLanes`,
  `IPccTeamAccessMemberCounts`, `IPccTeamAccessViewModel`.
- `teamAccessAdapter.ts` (Prompts 02, 05) — pure adapter:
  `TEAM_ACCESS_BRANCHES`, `REQUEST_STATUS_LABELS` (em-dash form for
  `approved-pending-execution`), `EXECUTION_STATUS_LABELS`
  (Title-Case canonical form), `NO_PERMISSION_CHANGE_NOTICE`,
  `isTeamAccessManagerPersona`, `resolveTeamAccessAudienceState`,
  `resolveTeamAccessBranch`, `resolveTeamAccessVisibleLanes`,
  `buildPccTeamAccessViewModel`, `buildDefaultPccTeamAccessViewModel`.
- `teamAccessAdapter.test.ts` (Prompts 02, 05) — 22+ tests covering
  branch derivation, visible lanes, request-status buckets,
  execution posture, audit trail, external/guest display-only
  posture, and canonical labels.
- `shared.ts` (Prompt 02) — narrow delegation to the adapter
  (single source of truth for branch/audience/manager-persona
  logic); preserves the legacy `TeamAccessPreviewModel` surface
  shape and `createTeamAccessPreviewModel` /
  `DEFAULT_TEAM_ACCESS_PREVIEW_MODEL` exports.
- `PccAccessRequestForm.tsx` (Prompt 03) — preview-only form with
  data-only props (no executable callbacks). Uses the user's
  revised prop interface (`introText`,
  `requestAccessButtonLabel`, `requestChangeButtonLabel`,
  `requestAccessEnabled`, `requestChangeEnabled`, `deferredTitle`,
  `deferredDescription`).
- `PccAccessRequestForm.test.tsx` (Prompt 03) — render + visible
  copy; submit prevention via `fireEvent.submit(form)`; disabled
  state asserted separately; per-file source-level guard with
  comments-only stripping for import-path tokens and
  comments+strings stripping for executable / callback-prop
  tokens.
- `PccRequestStatusBadge.tsx` (Prompt 03) — tone map (`draft-preview`
  → neutral, `submitted-preview` → info, `pending-review` → warning,
  `approved-pending-execution` → info, `rejected` → danger,
  `completed-manual` → success). Carries
  `data-pcc-request-status` + `data-pcc-request-status-tone` +
  `data-pcc-request-status-label` for redundant signaling.
- `PccRequestStatusBadge.test.tsx` (Prompt 03) — all six statuses,
  em-dash canonical label, color-not-only signaling, accessibility
  inertness.
- `PccAccessRequestQueue.tsx` (Prompt 04) — composes queue + detail
  + review controls. Internal selection state. No
  executable-callback props.
- `PccAccessRequestQueue.test.tsx` (Prompt 04) — list rendering,
  selection swap, branch routing for review controls, empty state,
  no anchors.
- `PccAccessRequestDetail.tsx` (Prompt 04) — read-only detail panel.
  No buttons, no anchors. Inert read-only display.
- `PccAccessRequestDetail.test.tsx` (Prompt 04) — visible field
  rendering for `pending-review` and `approved-pending-execution`
  fixture records; em-dash label assertion; inertness assertion.
- `PccAccessReviewControls.tsx` (Prompt 04) — preview-only review
  controls. Internal `useState<'approved' | 'rejected' | null>(null)`
  decision state. Approve/Reject `<button type="button">` with
  visible `(preview only)` suffix. Independent local comment
  textarea. Action-context no-permission-change notice.
- `PccAccessReviewControls.test.tsx` (Prompt 04) — `canReview=false`
  unauthorized branch; `canReview=true` decision-preview state
  transitions; comment textarea local state; per-file source-level
  guard with split scanning strategy.
- `PccAccessExecutionQueue.tsx` (Prompt 05) — sectioned queue with
  four canonical sections derived from real fixture state only
  (no synthesized records). Section IDs:
  `pending-manual-it`, `completed-manual`, `backend-gated-later`,
  `preview-only`.
- `PccAccessExecutionQueue.test.tsx` (Prompt 05) — section
  structure, section ordering, pending-manual-IT derivation,
  completed-manual empty/preview state, backend-gated-later lane
  status reflection, preview-only posture, inertness, per-file
  source-level guard.
- `PccExecutionStatusPanel.tsx` (Prompt 05) — lane-level posture
  panel. `LANE_EXECUTION_STATUS_TONES` map; consumes adapter's
  `EXECUTION_STATUS_LABELS`; manager-persona chips from prop
  (sourced by lane card from shared `TEAM_ACCESS_MANAGER_PERSONAS`);
  audit preview label; action-context no-permission-change notice.
- `PccExecutionStatusPanel.test.tsx` (Prompt 05) — execution status
  rendering for all three `TeamAccessExecutionStatus` values;
  canonical Title-Case labels; manager personas sourced from
  shared model; audit preview + notice; inertness; per-file
  source-level guard.
- `PccPermissionRequestLaneCard.tsx` (Prompts 03, 04) — wires the
  form, the request queue (with branch routing), the canonical
  badge via `PccRequestStatusBadge`, and the panel-level
  no-permission-change notice. Removes the old disabled-button
  affordances.
- `PccAccessManagerLaneCard.tsx` (Prompt 05) — wires the
  `PccExecutionStatusPanel` and the `PccAccessExecutionQueue`,
  passing `TEAM_ACCESS_MANAGER_PERSONAS` directly from the
  shared model. Preserves the existing preview-cue paragraph,
  the disabled action buttons, the
  `not-yet-implemented-operation` `PccPreviewState`, and the
  permission-template chip block.
- `PccTeamAccessSurface.tsx` (Prompt 06) — thin router-of-two.
  When `readModelClient` is present, returns
  `<PccTeamAccessReadModelContent>`; otherwise returns
  `<PccTeamAccessLaneShell>`. Existing surface tests pass
  unchanged because the fixture path now flows through
  `LaneShell` transparently.
- `PccTeamAccessLaneShell.tsx` (Prompt 06, **new**) — shared
  presentational shell extracted from the legacy surface body.
  Renders `PccTeamAccessHeaderCard` + the four lane cards
  conditional on branch. Imports neither
  `PccTeamAccessSurface` nor `PccTeamAccessReadModelContent` —
  breaks the cycle.
- `PccTeamAccessReadModelContent.tsx` (Prompt 06, **new**) —
  state-aware wrapper. Calls `useTeamAccessReadModel`. Renders
  `PccPreviewState state="loading"` or `"error"` for the
  corresponding hook states; renders
  `<PccTeamAccessLaneShell>` directly for `'preview'` (does not
  recurse through `PccTeamAccessSurface`). Marker:
  `data-pcc-team-access-read-model-content={state}`.
- `PccTeamAccessReadModelContent.test.tsx` (Prompt 07, **new**) —
  direct state-rendering coverage for all four branches
  (preview / error / loading / rejected). `globalThis.fetch` spy
  stays at zero across all cases.
- `useTeamAccessReadModel.ts` (Prompt 06, **new**) — Wave 4
  hook pattern with **narrow consumer interface**
  `IPccTeamAccessReadModelClient` (the full
  `IPccReadModelClient` flows in via TypeScript structural
  typing — no controlled-consumption guard violation).
  Mounted-flag cancellation; refetches on `client` / `projectId`
  identity change.
- `useTeamAccessReadModel.test.ts` (Prompt 06, **new**) — initial
  loading; available envelope → preview; backend-unavailable
  envelope → error; promise rejection → error; mounted-flag
  cancellation; refetch on projectId change.

### `apps/project-control-center/src/api/`

- `pccReadModelClient.ts` (Prompt 06) — `IPccReadModelClient`
  extended with `getTeamAccess(...)`;
  `PCC_READ_MODEL_ROUTE_IDS` extended with `'team-access'`;
  `PCC_READ_MODEL_ROUTE_PATHS['team-access']` registered.
- `pccReadModelClient.test.ts` (Prompt 06) — coverage for the
  new route id, path, and `IPccReadModelClient` symmetry.
- `pccFixtureReadModelClient.ts` (Prompt 06 / `dfa71904c`) —
  `getTeamAccess` returns a `PccReadModelEnvelope<
  PccTeamAccessReadModel>` derived from
  `SAMPLE_TEAM_ACCESS_PREVIEW_MODEL` for known projects, and a
  `backend-unavailable` envelope under
  `simulateBackendUnavailable: true`.
- `pccFixtureReadModelClient.test.ts` (Prompt 06 / `dfa71904c`) —
  `getTeamAccess` envelope-shape coverage and unavailable-branch
  coverage.
- `pccBackendReadModelClient.ts` (Prompt 06) — `getTeamAccess`
  reuses the existing internal `callBackend` helper which goes
  through the existing `fetchImpl` wrapper. **Zero new `fetch(`
  callsites** are introduced; the file's literal `fetch(` count
  remains unchanged from its pre-Prompt-06 baseline (which was
  zero — all HTTP routes through `fetchImpl`).
- `pccBackendReadModelClient.test.ts` (Prompt 06) — extends
  `ROUTE_METHOD_TUPLES` with `team-access`/`getTeamAccess`; the
  "all 8 routes" / "all 8 methods" describes update from 7 → 8.

### `apps/project-control-center/src/shell/`

- `PccSurfaceRouter.tsx` (Prompt 06) — adds combined narrow
  client interface `IPccSurfaceRouterReadModelClient extends
  IPccProjectHomeReadModelClient, IPccTeamAccessReadModelClient`.
  Threads `readModelClient` to **exactly two** surfaces:
  `project-home` and `team-and-access`. All other surfaces
  remain unwired.

### `apps/project-control-center/src/`

- `PccApp.tsx` (Prompt 06) — narrow widening of `readModelClient`
  prop type from `IPccProjectHomeReadModelClient` to
  `IPccSurfaceRouterReadModelClient` so the team-access path
  type-checks. Runtime behavior unchanged: the full
  `IPccReadModelClient` returned by `createPccReadModelClient`
  satisfies both narrow consumer interfaces structurally.

### `apps/project-control-center/src/tests/`

- `PccApp.optIn.test.tsx` (Prompts 06, 07) — adds:
  - non-opted-surfaces ignore the read-model client (Documents
    surface assertion includes `getTeamAccess` spy at zero);
  - Project Home opt-in does not invoke `getTeamAccess`;
  - Team & Access opt-in invokes `getTeamAccess` exactly once
    with the canonical `SAMPLE_PROJECT_PROFILE.projectId`;
  - Team & Access backend-unavailable scenario renders safe
    error state with no lane markers and zero fetch.
- `pcc-api-dormancy.test.ts` (Prompts 06, 07) — adds:
  - set-equality assertion `{project-home, team-and-access}` for
    the `readModelClient` consumer surfaces (replaces the
    previous "exactly one" assertion);
  - "zero new direct `fetch(` callsites" assertion against
    `pccBackendReadModelClient.ts`;
  - workspace-wide
    `FORBIDDEN_MUTATION_EXECUTION_IDENTIFIERS` scan with six
    categories (permission mutation, approval/workflow
    execution, SharePoint group mutation, Teams membership
    mutation, provisioning execution, Site Health repair).

### `backend/functions/src/hosts/pcc-read-model/`

- `pcc-read-model-routes.ts` (Prompt 06) — registers a single new
  GET route `pcc/projects/{projectId}/team-access` →
  `provider.getTeamAccess(projectId)`. No POST/PUT/PATCH/DELETE.
- `pcc-read-model-routes.test.ts` (Prompt 06) — extends
  `EXPECTED_ROUTES` with `getPccProjectTeamAccess`; route count
  assertion updates from 7 → 8.
- `pcc-read-model-route-guardrails.test.ts` (Prompt 07) —
  extends `FORBIDDEN_EXECUTABLE_TOKENS` with explicit CamelCase
  / Graph-API-path identifiers (`addUserToGroup`,
  `removeUserFromGroup`, `addTeamMember`, `addChannelMember`,
  `joinedTeams`, `graphMembers`).

### `apps/project-control-center/README.md`

- Wave 6 Team & Access Read-Model Opt-In subsection (Prompt 06).
- Wave 6 Guardrail Hardening subsection (Prompt 07).

### `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.module.css`

- Form / banner / no-permission-change-notice styles (Prompt 03).
- Queue / queue-row / detail-panel / review-controls / decision-preview / form-label / form-textarea styles (Prompt 04).
- Execution-queue / execution-queue-section / execution-queue-section-header / execution-status-panel / manager-persona-chips / audit-preview-line styles (Prompt 05).

### `apps/project-control-center/src/tests/PccTeamAccessSurface.test.tsx`

- Narrow assertion update (Prompts 03, 05): replaces
  `'Request access (preview-only)'` and `'Execution status:
  backend-gated-later'` legacy text assertions with
  marker-based assertions
  (`[data-pcc-access-request-form]`,
  `[data-pcc-execution-status="backend-gated-later"]`,
  `'Backend-Gated Later'`).

## 3a. Unchanged across Wave 6

- `packages/models/src/pcc/TeamAccess.ts` — shared vocabulary
  preserved (W6-OD-001).
- `packages/models/src/pcc/fixtures/TeamAccessFixtures.ts` — fixture
  records preserved.
- `packages/models/src/pcc/PccReadModels.ts` — `PccTeamAccessReadModel`
  + `'team-access'` entry in `PccReadModelResponseMap` were already
  present from earlier work; not touched by Wave 6.
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
  — provider interface `getTeamAccess` was already declared from
  earlier work; not touched by Wave 6.
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
  — mock provider `getTeamAccess` was already implemented from
  earlier work; not touched by Wave 6.
- `apps/project-control-center/src/PccApp.tsx`'s mount factory
  resolution + `mount.tsx` — unchanged (Project Home factory entry
  point and the existing `IPccReadModelConfig` flow continue to
  drive both Project Home and Team & Access opt-in).

---

## 4. Final Wave 6 runtime posture

PCC remains a **preview app** with **fixture-default** behavior. Wave 6 changes the *visible content* of the Team & Access surface and adds an optional read-only backend opt-in for Team & Access alongside the existing Project Home opt-in.

- **Default `<PccApp />` / `mount(el)`**: zero `fetch(` calls; the Team & Access surface renders the lane shell from the existing fixture model.
- **Explicit fixture mode** (`mount(el, ctx, { readModel: { readModelMode: 'fixture' } })`): zero `fetch(` calls; identical visual output.
- **Explicit backend mode + Project Home active surface** (`mount(el, ctx, { readModel: { readModelMode: 'backend', backendBaseUrl: '<host>' } })` with `activeSurfaceId="project-home"`): exactly three GET calls — `/home`, `/priority-actions`, `/document-control` — issued in parallel via `Promise.all` (Wave 4 / Wave 5 pattern preserved). No Team & Access fetch occurs.
- **Explicit backend mode + Team & Access active surface**: exactly one GET call — `/team-access` — to the canonical URL, with `init?.method === 'GET'`. Routes through the existing `pccBackendReadModelClient.ts` `fetchImpl` wrapper — no new transport file, no new `fetch(` callsite.
- **Backend mode without `backendBaseUrl`**: zero `fetch(` calls; surface renders safe `state: 'error'` via the wrapper's safe-fallback path.
- **Backend mode + non-opted active surface** (e.g. `documents`): zero client-method invocations; the read-model client's spies remain at zero.
- **Other surfaces** (Documents, Site Health, External Systems, Project Readiness, Approvals, Control Center Settings) remain fixture/preview-driven; the read-model client is threaded only to Project Home and Team & Access.

Wave 6 introduces no auth wiring, no write routes, no Microsoft Graph / PnP / SharePoint REST runtime, no Procore / Document Crunch / Adobe Sign runtime, no SharePoint group mutation, no Teams membership mutation, no permission execution, no approval execution, no persistence, no `.sppkg`, no app-catalog deployment, no tenant operation. The runtime posture relative to Wave 5 is unchanged outside the addition of the optional `team-access` opt-in fetch when the Team & Access surface is the active surface and backend mode is configured.

---

## 5. Team & Access lane structure

The fixture-default flow goes through `PccTeamAccessLaneShell`. The `PccTeamAccessSurface` returns this shell when no `readModelClient` is supplied. The shell renders `PccTeamAccessHeaderCard` plus the four lane cards (`PccTeamViewerLaneCard`, `PccPermissionRequestLaneCard`, `PccAccessManagerLaneCard`, plus an unauthorized-persona preview state for non-managers) conditional on the audience branch.

The backend-mode flow goes through `PccTeamAccessReadModelContent`. The `PccTeamAccessSurface` returns this wrapper when a `readModelClient` is supplied. The wrapper calls `useTeamAccessReadModel(client, SAMPLE_PROJECT_PROFILE.projectId)`, then routes by hook state:

- `'loading'` → `PccPreviewState state="loading"` with marker `data-pcc-team-access-read-model-content="loading"`;
- `'error'` → `PccPreviewState state="error"` with marker `data-pcc-team-access-read-model-content="error"`;
- `'preview'` → `<PccTeamAccessLaneShell>` (rendered directly — does not recurse through `PccTeamAccessSurface`) with marker `data-pcc-team-access-read-model-content="preview"`.

Dependency direction is cycle-free:

```
PccTeamAccessSurface  ──►  PccTeamAccessLaneShell
        │                          ▲
        ▼                          │
PccTeamAccessReadModelContent ─────┘
        │
        ▼
useTeamAccessReadModel
```

Surface imports both Content and LaneShell. Content imports LaneShell. LaneShell imports neither. No mutual import.

---

## 6. Default-fixture proof

`apps/project-control-center/src/tests/PccApp.optIn.test.tsx`:

- **`PccApp default fixture path` → renders all 10 cards without invoking fetch when no readModelClient is supplied** — asserts `fetchSpy).not.toHaveBeenCalled()` and 10 `[data-pcc-card]` elements (Project Home).
- **`mount(...) opt-in` → does not invoke fetch in explicit fixture mode** — asserts `fetchSpy).not.toHaveBeenCalled()` even with the explicit fixture-mode opt-in.

`apps/project-control-center/src/tests/PccTeamAccessSurface.test.tsx`:

- All three branch tests (`access-manager`, `has-project-access`, `viewer-without-access`) render the lane shell on the fixture path with no `readModelClient`. The lane markers are the existing
  `[data-pcc-team-access-lane="..."]` attributes; the `[data-pcc-access-request-form]` form marker is asserted on the `viewer/false` branch.

The fixture default does not fetch and does not depend on the read-model wrapper.

---

## 7. Optional backend opt-in (Prompt 06) — disposition: **EXECUTED**

Prompt 06 was executed. The optional `team-access` backend opt-in landed (split across `1ccf8acb2` for the bulk of the work and `dfa71904c` for the missing fixture-client method). The opt-in adds:

- **Backend route** `pcc/projects/{projectId}/team-access` registered in `pcc-read-model-routes.ts`. The route is GET-only and delegates to the pre-existing `provider.getTeamAccess(projectId)` mock.
- **SPFx client method** `getTeamAccess` on `IPccReadModelClient`, the fixture client, and the backend HTTP client. The backend client method goes through the existing `callBackend` / `fetchImpl` wrapper. No new transport file, no new `fetch(` callsite.
- **Hook + content** in `useTeamAccessReadModel.ts` and `PccTeamAccessReadModelContent.tsx`. The hook uses a narrow consumer interface `IPccTeamAccessReadModelClient` defined locally (avoids the controlled-consumption guard for `IPccReadModelClient`).
- **Surface router** threads `readModelClient` to `team-and-access` in addition to `project-home`. The dormancy guard is updated to set-equality `{project-home, team-and-access}`.
- **Tests**: opt-in coverage in `PccApp.optIn.test.tsx`, hook coverage in `useTeamAccessReadModel.test.ts`, content state coverage in `PccTeamAccessReadModelContent.test.tsx`, route coverage in `pcc-read-model-routes.test.ts`, fixture-client + backend-client coverage in their respective `.test.ts` files.

Default mount behavior is unchanged: no client → no fetch → fixture path. Backend mode requires explicit `readModelMode: 'backend'` and a non-empty `backendBaseUrl`; absent the URL, the wrapper renders a safe error state.

---

## 8. Read-model envelope handling proof

`apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessReadModelContent.test.tsx` covers all four state branches with stub clients:

- **Available envelope** → `data-pcc-team-access-read-model-content="preview"` and the lane shell renders (asserted via `[data-pcc-team-access-lane="team-viewer"]`).
- **Backend-unavailable envelope** → `data-pcc-team-access-read-model-content="error"`, `[data-pcc-state="error"]` PccPreviewState renders, no lane markers.
- **Pending promise** (never resolves) → `data-pcc-team-access-read-model-content="loading"`, `[data-pcc-state="loading"]` PccPreviewState renders, no lane markers.
- **Rejected promise** → `data-pcc-team-access-read-model-content="error"` (same as backend-unavailable), `[data-pcc-state="error"]` renders, no crash.

A `globalThis.fetch` spy stays at zero calls across all four cases.

`apps/project-control-center/src/tests/PccApp.optIn.test.tsx` also adds:

- **Team & Access backend-unavailable** scenario — renders the surface router with `simulateBackendUnavailable: true` fixture client; asserts safe error state (no lane markers, `[data-pcc-state="error"]`, zero fetch).

---

## 9. Guardrail / test inventory

### Preserved from Wave 3 / Wave 4 / Wave 5 (unchanged)

- `fetch(` callsite allowlist limited to
  `apps/project-control-center/src/api/pccBackendReadModelClient.ts` +
  `pccBackendReadModelClient.test.ts`.
- Forbidden runtime imports across non-api/non-test files **and**
  inside `src/api/**`: `@pnp/sp`, `@pnp/graph`, `@microsoft/sp-pnp-js`,
  `@microsoft/sp-http`, `@hbc/auth/spfx`, `msgraph`,
  `graph.microsoft.com`, `procore`.
- Forbidden runtime tokens inside `src/api/**` runtime files:
  `MSGraphClient`, `GraphServiceClient`, `sp.web`, `_api/web`,
  `ProcoreClient`, `DocumentCrunchClient`, `AdobeSignClient`.
- Backend HTTP client uses only `'GET'` — no `'POST'` / `'PUT'` /
  `'PATCH'` / `'DELETE'` method literals.
- Factory default mode is `'fixture'` at the source level.
- `mount.tsx` references `createPccReadModelClient` only; no other
  client/factory constructor or `fetch(`.
- `HbcPriorityRail` is forbidden anywhere in PCC source.

### Added / updated in Wave 6

- **Set-equality `readModelClient` consumer scan** in
  `pcc-api-dormancy.test.ts`: parses
  `PccSurfaceRouter.tsx` (comments-only stripped) for
  `case '<surface>': ... readModelClient={` patterns; asserts the
  set equals exactly `['project-home', 'team-and-access']`.
- **Zero-new-fetch-callsite scan** in `pcc-api-dormancy.test.ts`:
  asserts `pccBackendReadModelClient.ts` holds zero literal
  `\bfetch\s*\(` callsites (the file uses `fetchImpl(` exclusively).
- **Workspace-wide mutation/execution identifier scan** in
  `pcc-api-dormancy.test.ts` (Prompt 07): six categories of
  CamelCase identifiers (permission mutation, approval/workflow
  execution, SharePoint group mutation, Teams membership mutation,
  provisioning execution, Site Health repair) scanned across every
  `apps/project-control-center/src/**/*.{ts,tsx}` source file
  (test files excluded), comments+strings stripped.
- **Per-file source-level guards** on the Wave 6 action-context
  components (`PccAccessRequestForm.tsx`,
  `PccAccessReviewControls.tsx`,
  `PccAccessExecutionQueue.tsx`,
  `PccExecutionStatusPanel.tsx`) — each scans for forbidden
  import-path tokens (comments-only stripped), forbidden
  executable tokens (comments+strings stripped), and asserts no
  `on[A-Z]\w*\??:` callback prop appears in the props interface
  body.
- **Backend route-guardrails token list extension** (Prompt 07):
  `addUserToGroup`, `removeUserFromGroup`, `addTeamMember`,
  `addChannelMember`, `joinedTeams`, `graphMembers` added to the
  existing fragment-based `FORBIDDEN_EXECUTABLE_TOKENS` list.

---

## 10. Validation evidence

Prompt 08 is **documentation-only** and **does not re-run the pnpm validation suite**. The most recent suite results are from Prompt 07 execution (commit `115845137`):

| Command | Prompt 07 result |
| --- | --- |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — 569 passing, 36 test files |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — `dist/project-control-center-app.js` 249.01 kB · gzip 72.88 kB; `dist/spfx-project-control-center.css` 25.58 kB · gzip 4.46 kB |
| `pnpm --filter @hbc/models check-types` | **PASS** |
| `pnpm --filter @hbc/models test` | **PASS** — 231 passing, 31 test files |
| `pnpm --filter @hbc/functions test` | **PASS** — 2283 passing, 3 skipped, 138 test files |
| `pnpm --filter @hbc/functions check-types` | **FAIL** — pre-existing `wave7LaneVocabulary` / `PccDocumentControlReadModel` misalignment in `pcc-mock-read-model-provider.ts`; see §10a + §16. |

**`@hbc/functions check-types` is failing at HEAD.** The failure originated in earlier Wave 7 fixture churn (interleaved into commit `1ccf8acb2`) and is **not** caused by any Wave 6 prompt; no Wave 6 prompt touches the mock provider or the Document Control read model. Wave 6 work itself remains green and does not depend on the Document Control fields.

Prompt 08 captured at execution:

| Command | Result |
| --- | --- |
| `git status --short` (pre) | only out-of-scope working-tree edits authored by other agents (Wave 7 / Wave 8 docs, models churn) plus untracked Wave 7 / Wave 8 / Wave 9 docs directories — none of which Prompt 08 stages |
| `md5 pnpm-lock.yaml` (pre) | `c56df7b79986896624536aab74d609f4` |
| `git diff --check` (pre) | clean |
| `git diff --check` (post) | clean |
| `md5 pnpm-lock.yaml` (post) | `c56df7b79986896624536aab74d609f4` (unchanged) |

---

## 10a. Non-certification statement

This closeout certifies **Wave 6 Team & Access only**. It explicitly does **not** certify the interleaved Wave 7 Document Control changes that also landed in commit `1ccf8acb2` and the surrounding Wave 7 model / mock-provider commits (`03c276063`, `1ccf8acb2`, `9d8a61fb8`, `1c90b66db`, `c64da0285`). Wave 7 implementation prompts own that certification.

---

## 11. Package / version / lockfile / manifest / deployment posture

- `@hbc/spfx-project-control-center` version: `0.0.1` — **unchanged** across the full Wave 6 prompt sequence.
- `pnpm-lock.yaml` md5: `c56df7b79986896624536aab74d609f4` — unchanged before and after Prompt 08 (and unchanged across every Prompt 02–07 commit).
- No `package.json` field changes.
- No SPFx manifest, `package-solution.json`, or `.sppkg` artifact produced or modified.
- No app-catalog upload.
- No hosted validation.
- No tenant mutation.
- No CI/CD workflow change.
- No deployment file change.

---

## 12. Closed-decision disposition

| ID | Title (verbatim from `Wave_6_Closed_Decisions.md`) | Status | Resolved by |
| --- | --- | --- | --- |
| W6-OD-001 | Shared model strategy | **Resolved** | Prompt 02 (`23ba49175`). App-local view model + adapter built; `packages/models/src/pcc/TeamAccess.ts` shared vocabulary preserved unchanged. |
| W6-OD-002 | Backend read-model posture | **Resolved (executed)** | Prompt 06 (`1ccf8acb2` + `dfa71904c`). Optional `team-access` GET-only route + client method added. Read-only / GET-only posture preserved. |
| W6-OD-003 | Backend opt-in pattern | **Resolved** | Prompt 06. Default mount remains fixture; backend mode requires explicit `readModelMode: 'backend'` + `backendBaseUrl`. Read-model client is surface-scoped (set-equality `{project-home, team-and-access}`). |
| W6-OD-004 | Approve / reject / comment controls | **Resolved (preview-only)** | Prompts 03, 04 (`42888041e`, `8e39052fe`). Controls render local preview state only; visible `(preview only)` button suffix; action-context "No permission change has been executed" notice; no persistence; no callbacks for execution. |
| W6-OD-005 | Approved-pending-execution meaning | **Resolved** | Prompts 02, 04 (`23ba49175`, `8e39052fe`). Canonical em-dash label `Approved — Pending Execution`; status badge + audit row carry `noPermissionChangeNotice`. |
| W6-OD-006 | Admin / IT execution queue | **Resolved (visual only)** | Prompt 05 (`b0f047d7c`). `PccAccessExecutionQueue` renders four canonical sections (Pending Manual IT, Completed Manual, Backend-Gated Later, Preview Only) derived from real fixture state only. No execution surface. |
| W6-OD-007 | Request data storage | **Resolved (no persistence)** | Prompts 03, 04. Form fields and review decision use local `useState` only. No `fetch`, no client, no callbacks for persistence. |
| W6-OD-008 | Priority Actions Rail | **Resolved (no expansion)** | All Wave 6 prompts. The Wave 5 four-group rail is preserved unchanged; no Team & Access metadata-only links were added. |
| W6-OD-009 | Unauthorized / missing config / backend unavailable states | **Resolved** | Prompts 04, 06, 07. `PccAccessReviewControls` renders unauthorized-persona PccPreviewState for `canReview=false`; `PccTeamAccessReadModelContent` renders loading/error PccPreviewState; `PccApp.optIn.test.tsx` covers backend-unavailable for both Project Home and Team & Access. |
| W6-OD-010 | Allowed vs forbidden files | **Resolved (preserved)** | All Wave 6 prompts. Each prompt observed its narrow allowed-files list. No package, manifest, workflow, lockfile, deployment, tenant, backend write route, Graph/PnP/SP REST, Procore, Document Crunch, Adobe Sign, provisioning, Site Health repair, or permission execution file was modified. |

---

## 13. Wave 4A / Wave 5A / Wave 6A separation

- **Wave 4A** — controlled non-production hosted visual validation phase introduced by Wave 4. **Operator-pending.** Not advanced by Wave 6.
- **Wave 5A** — analogous controlled non-production hosted visual validation phase for Wave 5 visual changes. **Operator-pending.** Not advanced by Wave 6.
- **Wave 6 introduces no Wave 6A.** Prompt 06 backend opt-in remains preview/local only. No hosted validation, no `.sppkg`, no app-catalog operations were performed in Wave 6. The package builds (`@hbc/functions` and `@hbc/spfx-project-control-center`) confirm artifact-level correctness only — they are not hosted proof.

---

## 14. Deferred work (intentionally excluded from Wave 6)

- Wave 4A hosted visual validation — operator-pending; separate phase.
- Wave 5A hosted visual validation — operator-pending; separate phase.
- Real authentication / persona derivation from SPFx context, Entra/SharePoint groups, or backend claims — Wave 6 treats persona as display logic only (W6-OD-004).
- Real persistence of access requests — Wave 6 stores nothing (W6-OD-007).
- Real approval / workflow execution, permission mutation, SharePoint group mutation, Teams membership mutation — Wave 6 surfaces preview-only UI (W6-OD-004, W6-OD-006).
- Manual IT execution automation — Wave 6 displays the manual-IT posture without automating it.
- Site Health repair execution — out of Wave 6 scope.
- Priority Actions Rail Team & Access expansion — deferred (W6-OD-008).
- Hosted validation, packaging (`.sppkg`), app-catalog upload, production rollout — separately gated; not in Wave 6 scope.
- Master roadmap / Phase 3 status / module-implementation doc updates — preserved verbatim across Wave 6 (Wave 5 closeout precedent W5-OD-008).

---

## 15. Forbidden claims / non-claims

The Wave 6 closeout makes the following explicit non-claims:

- Wave 6 did **NOT** execute permission changes.
- Wave 6 did **NOT** mutate SharePoint groups.
- Wave 6 did **NOT** mutate Teams memberships.
- Wave 6 did **NOT** execute approvals.
- Wave 6 did **NOT** execute workflows.
- Wave 6 did **NOT** introduce write routes (`POST` / `PUT` / `PATCH` / `DELETE`).
- Wave 6 did **NOT** introduce Microsoft Graph, PnP, or SharePoint REST live operations.
- Wave 6 did **NOT** introduce Procore, Document Crunch, or Adobe Sign runtime.
- Wave 6 did **NOT** introduce auth wiring or token handling.
- Wave 6 did **NOT** derive real user persona from SPFx context, Entra/SharePoint groups, or backend claims.
- Wave 6 did **NOT** introduce a provisioning executor.
- Wave 6 did **NOT** introduce a Site Health repair executor.
- Wave 6 did **NOT** generate or upload a `.sppkg`.
- Wave 6 did **NOT** perform an app-catalog upload.
- Wave 6 did **NOT** perform hosted validation.
- Wave 6 did **NOT** perform a production rollout.
- Wave 6 did **NOT** advance Wave 4A or Wave 5A; both remain operator-pending.
- Wave 6 did **NOT** edit the Phase 3 master roadmap, the Phase 3 status doc, or the module-implementation plan.
- Wave 6 did **NOT** mutate `pnpm-lock.yaml`, `package.json`, manifests, workflows, or deployment files.
- Wave 6 did **NOT** bump `@hbc/spfx-project-control-center` version.

Production rollout remains separately approved.

---

## 16. Wave 7 readiness recommendation

**Wave 7 (Document Control Center) may proceed only with the known first remediation item being the pre-existing `wave7LaneVocabulary` mock/model misalignment** in `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`.

That regression originated in earlier interleaved Wave 7 fixture churn (commit `1ccf8acb2`) and is **not** caused or addressed by any Wave 6 prompt. The mock provider declares fields (`wave7LaneVocabulary`, `sourceRegistry`, `sourceHealth`, `roleActionAvailability`, `reviewQueueSample`, etc.) that are not yet present on `PccDocumentControlReadModel` in `packages/models/src/pcc/PccReadModels.ts`. Because of this mismatch, `pnpm --filter @hbc/functions check-types` fails at HEAD.

Wave 7's **first prompt must reconcile the mock provider with `PccDocumentControlReadModel`** before any new Document Control surface work proceeds. Once that mismatch is resolved, the rest of Wave 7's scope (three-lane UI, permission/action rendering, source-degraded states, reviews/approvals summary, closeout validation) can land cleanly.

This recommendation is for **Wave 7 planning sequencing only**. Wave 7 implementation authorization remains a separate user decision.

---

## 17. Final readiness statement

Phase 3 Wave 6 is complete when the Team & Access UI lifecycle (request form, request status, request queue, request detail, review controls, manager execution queue, lane execution-status panel) is in place; the optional read-only `team-access` backend opt-in is wired (route + interface + fixture client + backend client + hook + content wrapper + lane shell + surface routing); **Wave 6 no-runtime / no-mutation guardrails remain satisfied** at workspace-wide and per-file scopes (set-equality `{project-home, team-and-access}` consumer scan, zero new `fetch(` callsites in `pccBackendReadModelClient.ts`, six workspace-wide mutation/execution identifier scans, four per-file source guards, dormancy fetch allowlist preserved, GET-only backend client preserved, factory default `'fixture'` preserved, `HbcPriorityRail` forbidden, `mount.tsx` factory entry point preserved); no package / version / lockfile / manifest / deployment churn occurred; and the closeout (this document) is committed.

**The closeout does not assert the full workspace is green** — `pnpm --filter @hbc/functions check-types` remains failing at HEAD due to pre-existing Wave 7 mock-provider / Document Control model misalignment outside Wave 6 scope (see §10 and §16). Hosted validation, packaging, and production rollout remain separately gated.
