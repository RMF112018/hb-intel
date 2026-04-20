# W0-G5-T01 — Hosted Requester Guided Setup Surface

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 5
> **Governing plan:** `docs/architecture/plans/MVP/G5/W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md`
> **Related:** `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` §G5.1, §G5.2

**Status:** Proposed
**Stream:** Wave 0 / G5
**Locked decisions served:** LD-01, LD-02, LD-06, LD-07, LD-09

---

## Shared Feature Gate Check

This task cannot proceed to implementation until the following packages are assessed as sufficiently mature.

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/step-wizard` | `packages/step-wizard/` | Guided request entry flow | Verify: StepWizard component renders multi-step flows; step state machine handles in-progress, complete, and blocked states; draft payload integration with `@hbc/session-state` is documented or implemented |
| `@hbc/provisioning` | `packages/provisioning/` | API client for request submission and status | Verify: api-client exports a typed interface for project setup request creation; BIC config is populated; failure modes module covers at least network and validation errors |
| `@hbc/auth` | `packages/auth/` | Authenticated route guard for `/project-setup` | Verify: auth package exports a route guard or permission hook usable in TanStack Router; the PWA app already integrates `@hbc/auth` at the app shell level |
| `@hbc/smart-empty-state` | `packages/smart-empty-state/` | Empty state when requester has no requests | Assess; if not present, use a local placeholder with a note to replace when the package matures |

### Gate Outcome

**Before beginning T01 implementation:** perform a direct code inspection of `packages/step-wizard/src/`, `packages/provisioning/src/`, and `packages/auth/src/` and record the gate outcome in this section. If any required package is absent or insufficiently mature, document the specific gap and the work required before T01 can proceed.

**If `@hbc/step-wizard` is immature:** T01 is gated. `@hbc/step-wizard` must be developed or enhanced to the interface contract in `docs/explanation/feature-decisions/PH7-SF-05-Shared-Feature-Step-Wizard.md` before T01 proceeds. Do not build a custom stepper in the PWA.

**If `@hbc/provisioning` api-client is absent or incomplete:** T01 is gated on the provisioning API client being implemented to the point where a project setup request can be created and its creation status read back.

**If `@hbc/auth` route guard is absent:** T01 may proceed with a temporary unauthenticated route that is clearly marked as incomplete, but the auth integration must be completed before T01 is closed.

---

## Objective

Implement the hosted requester entry surface in the PWA: the `/project-setup` route that gives requesters access to the guided, multi-step project setup request flow. This task establishes the primary entry point for the entire Group 5 experience.

The result must be a real, working route — not a skeleton or placeholder — that allows a requester to authenticate, open the guided setup flow, begin entering request details, and reach either a completed step or a saved draft state by the end of a session.

---

## Scope

- Add `/project-setup` route to `apps/pwa/src/router/` using TanStack Router
- Implement the requester guided setup page in `apps/pwa/src/pages/` or `apps/pwa/src/features/`
- Wire `@hbc/step-wizard` as the guided entry mechanism for the project setup request form
- Integrate `@hbc/auth` route guard to enforce authentication on `/project-setup`
- Integrate `@hbc/provisioning` API client for request creation and status retrieval
- Implement status visibility for the requester's own in-progress and completed requests (the `/projects` list view, Wave 0 sketch G5.2)
- Add RBAC-aware filtering using `@hbc/auth` permission store so the requester only sees their own requests and projects they have access to (Wave 0 sketch G5.3)
- Integrate `@hbc/smart-empty-state` (or a scoped placeholder) for the empty request list state
- Surface PWA-level connectivity status from `@hbc/session-state` in the app shell (banner or status indicator visible from the setup surface)

---

## Exclusions / Non-Goals

- Do not implement controller, admin, or coordinator views in this task. The setup surface is requester-facing only (LD-01, LD-09, LD-10).
- Do not build a custom multi-step form system. `@hbc/step-wizard` is the mandatory primitive (package boundary rule).
- Do not create reusable visual UI components outside `@hbc/ui-kit`. If a new visual primitive is needed, it belongs in `@hbc/ui-kit`, not in the PWA feature module.
- Do not implement save/resume or clarification-return behavior in this task. Those belong to T03.
- Do not implement completion summary or Project Hub handoff. That belongs to T05.
- Do not implement mobile-specific layout optimization. That belongs to T06 (though the implementation here must not actively break mobile use).
- Do not implement PWA manifest or service worker configuration. That belongs to T06.

---

## Governing Constraints

- The guided setup flow must use `@hbc/step-wizard` — no substitute (`.claude/rules/03-package-boundaries.md`)
- Authentication must use `@hbc/auth` — no custom auth logic in the PWA feature module
- The workflow lifecycle states and required actions must match the SPFx requester experience exactly (LD-02)
- Reusable visual UI must come from `@hbc/ui-kit` (`.claude/rules/03-package-boundaries.md §UI ownership`)
- The route must not be accessible to unauthenticated users
- RBAC visibility must use the permission store from `@hbc/auth`, not a local permission check
- **The status list must be a thin, filtered view over `@hbc/provisioning` data — not a bespoke personal work inbox.** Do not add prioritization logic, badge aggregation, or multi-source action ranking to the G5 status list. `@hbc/my-work-feed` (`PH7-SF-29`) is the platform's planned canonical personal work orchestration surface and does not yet exist. The G5 status list must be structured so that surface can feed or supplement it later without requiring G5 rework. A bespoke inbox built now would create exactly the module-level UX divergence that package is designed to prevent.

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `apps/pwa` | Target app | Route and page code lives here |
| `@hbc/step-wizard` | Required shared package | Guided form entry primitive |
| `@hbc/session-state` | Required shared package | Connectivity status; draft persistence is T03 |
| `@hbc/provisioning` | Required shared package | API client for request creation and status |
| `@hbc/auth` | Required shared package | Route guard, permission store |
| `@hbc/ui-kit` | Required shared package | All visual components |
| `@hbc/models` | Required shared package | Shared domain types for project requests |
| `@hbc/smart-empty-state` | Preferred shared package | Empty list state |
| TanStack Router | Existing PWA dependency | Route definition and navigation |

---

## Acceptance Criteria

1. **Route exists and is guarded:** `/project-setup` is a defined TanStack Router route; unauthenticated access redirects to the auth flow; authenticated access renders the guided setup surface.

2. **Step Wizard renders the request flow:** The guided setup surface uses `@hbc/step-wizard` to present the project setup request form as a multi-step flow; each step has distinct validation; step progress is visible to the requester.

3. **Request creation reaches the backend:** Submitting a complete step sequence results in a project setup request being created via the `@hbc/provisioning` API client; the requester sees a confirmation or status update.

4. **Status list is populated and RBAC-filtered:** The `/projects` or equivalent status view shows the requester's own requests and accessible projects; requests and projects belonging to other users are not visible to this requester.

5. **Empty state is handled:** When the requester has no requests, the empty state renders correctly and provides a clear call to action.

6. **Connectivity status is visible:** The app shell surfaces an online/offline/degraded indicator derived from `@hbc/session-state` that is visible from the setup surface.

7. **No competitor components:** The implementation contains no custom multi-step form system and no reusable visual primitives outside `@hbc/ui-kit`.

---

## Validation / Readiness Criteria

Before T01 is considered ready for review:

- TypeScript strict-mode compilation passes with no new errors in `apps/pwa/`
- All new components have at minimum unit tests for the routing guard behavior and the Step Wizard integration points
- Manual walkthrough: authenticated requester can navigate to `/project-setup`, complete at least one step, and see the result reflected in the status list
- Manual walkthrough: unauthenticated access to `/project-setup` redirects correctly
- RBAC isolation: a test with two different mock user identities confirms that each user sees only their own requests

---

## Known Risks / Pitfalls

**Step Wizard maturity gap:** If `@hbc/step-wizard` is not yet production-ready (scaffold-only or partially implemented), T01 will be blocked until it is. Do not work around this by building a local stepper — that would violate the package boundary and create permanent maintenance debt.

**Provisioning API client coverage:** The provisioning package contains an API client and BIC configuration, but its completeness relative to the project setup request creation endpoint is unknown at plan-time. A code inspection is required before implementation begins.

**Route collision:** The PWA already has a `provisioning/` pages directory. Confirm the existing provisioning pages do not conflict with the new `/project-setup` route before adding the route definition.

**Auth integration depth:** If the PWA app shell does not already integrate `@hbc/auth` at the root level, T01 may require a deeper auth integration than a single route guard. Inspect `apps/pwa/src/auth/` and `apps/pwa/src/App.tsx` before implementation.

**Empty state package availability:** If `@hbc/smart-empty-state` is not ready, use a local placeholder component clearly marked with a TODO to migrate to the shared package when available.

---

## Progress Documentation Requirements

During active T01 implementation:

- The Gate Check section of this task file must be updated with the actual inspection outcome for `@hbc/step-wizard`, `@hbc/provisioning`, and `@hbc/auth` before implementation begins
- If the gate check reveals a gap in a shared package, that gap must be recorded in this file and tracked to resolution
- If a new component is added to `apps/pwa/` that later proves it should belong in `@hbc/ui-kit`, record that finding as a follow-on task rather than deferring it silently
- Keep `apps/pwa/README.md` updated to reflect the new route(s) as they are added

---

## Closure Documentation Requirements

Before T01 can be closed:

- `apps/pwa/README.md` must document the `/project-setup` and `/projects` routes, their auth requirements, and their dependencies on `@hbc/step-wizard` and `@hbc/provisioning`
- The gate check outcome must be recorded in this task file as either "passed" or "gated — gap resolved on [date]"
- If any shared package README was found to be incomplete during T01 work, an update to that README must be committed before T01 closes
- All T01 acceptance criteria must be verified and checked off
- TypeScript compilation must be clean
- No pending TODO items related to auth integration or route guarding
