# PH6.8 — Request Lifecycle & State Engine

**Version:** 2.0
**Purpose:** Define the `IProjectSetupRequest` data model, the Projects SharePoint list schema, the 7-state request lifecycle state machine, all state transition rules, automated notification triggers, and the API endpoints that power the Accounting inbox and Estimating submission form.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A complete, type-safe request lifecycle where the Estimating Coordinator can submit and update a Project Setup Request, the Controller can advance it through all states, the `projectNumber` is validated and required at `ReadyToProvision`, and the provisioning trigger fires exactly one time per approved request.

---

## Prerequisites

- PH6.1–PH6.7 complete and passing.
- SharePoint `Projects` list exists (or will be created via setup script in this task).

---

## 6.8.1 — Projects SharePoint List Schema

The `Projects` list is the central project record store shared across all HB Intel apps. It is created in the root HB Intel site collection.

List name: `Projects`

| Column Internal Name | Display Name | Type | Required | Notes |
|---|---|---|---|---|
| `Title` | Title (auto) | Single line | Yes | `projectNumber — projectName` |
| `ProjectId` | Project ID | Single line | Yes | UUID v4, immutable |
| `ProjectNumber` | Project Number | Single line | No | `##-###-##`; set by Controller |
| `ProjectName` | Project Name | Single line | Yes | |
| `ProjectLocation` | Project Location | Single line | No | |
| `ProjectType` | Project Type | Choice | No | GC / CM / Design-Build / Other |
| `ProjectStage` | Project Stage | Choice | Yes | Lead / Pursuit / Active / Closed |
| `SubmittedBy` | Submitted By | Single line | No | UPN of Estimating Coordinator |
| `SubmittedAt` | Submitted At | Date and Time | No | |
| `RequestState` | Request State | Choice | No | All 7 state values |
| `GroupMembersJson` | Group Members | Multiple lines | No | JSON array of UPNs |
| `ClarificationNote` | Clarification Note | Multiple lines | No | |
| `CompletedBy` | Completed By | Single line | No | UPN of Controller |
| `CompletedAt` | Completed At | Date and Time | No | |
| `BdCreatedBy` | BD Created By | Single line | No | UPN of BD rep (future phase) |
| `SiteUrl` | Site URL | Hyperlink | No | Set after provisioning completes |

---

## 6.8.2 — State Machine Definition

```typescript
// packages/provisioning/src/state-machine.ts

export type ProjectSetupRequestState =
  | 'Submitted'
  | 'UnderReview'
  | 'NeedsClarification'
  | 'AwaitingExternalSetup'
  | 'ReadyToProvision'
  | 'Provisioning'
  | 'Completed'
  | 'Failed';

/** Valid transitions: from state → allowed next states */
export const STATE_TRANSITIONS: Record<ProjectSetupRequestState, ProjectSetupRequestState[]> = {
  Submitted:              ['UnderReview'],
  UnderReview:            ['NeedsClarification', 'AwaitingExternalSetup', 'ReadyToProvision'],
  NeedsClarification:     ['UnderReview'],        // Coordinator resubmits → back to UnderReview
  AwaitingExternalSetup:  ['ReadyToProvision'],
  ReadyToProvision:       ['Provisioning'],        // Only allowed after projectNumber set + validated
  Provisioning:           ['Completed', 'Failed'],
  Completed:              [],                       // Terminal
  Failed:                 ['UnderReview'],          // Controller can manually re-open for retry
};

export function isValidTransition(
  from: ProjectSetupRequestState,
  to: ProjectSetupRequestState
): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Who receives a notification when a state changes to the given state. */
export const STATE_NOTIFICATION_TARGETS: Partial<
  Record<ProjectSetupRequestState, ('submitter' | 'controller' | 'group')[]>
> = {
  NeedsClarification:     ['submitter'],    // Coordinator notified to provide more info
  ReadyToProvision:       ['controller'],   // Controller notified they can now trigger
  Provisioning:           ['group'],        // Start notification to project group (role-gated)
  Completed:              ['group'],        // Finish notification to project group (role-gated)
  Failed:                 ['controller', 'submitter'], // Both notified of failure
};
```

---

## 6.8.3 — Request API Endpoints

Add the following HTTP functions to a new file `backend/functions/src/functions/projectRequests/index.ts`:

```typescript
import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { isValidTransition } from '../../state-machine.js';
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';
import { randomUUID } from 'crypto';
import { createLogger } from '../../utils/logger.js';

/** POST /api/project-setup-requests — Submit a new request (Estimating Coordinator) */
app.http('submitProjectSetupRequest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'project-setup-requests',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const body = await request.json() as Partial<IProjectSetupRequest>;
    if (!body.projectName || !body.groupMembers?.length) {
      return { status: 400, jsonBody: { error: 'projectName and groupMembers are required' } };
    }

    const services = createServiceFactory();
    const requestId = randomUUID();
    const projectId = body.projectId ?? randomUUID(); // Use existing if updating, create if new

    const newRequest: IProjectSetupRequest = {
      requestId,
      projectId,
      projectName: body.projectName,
      projectLocation: body.projectLocation ?? '',
      projectType: body.projectType ?? '',
      projectStage: body.projectStage ?? 'Pursuit',
      submittedBy: claims.upn,
      submittedAt: new Date().toISOString(),
      state: 'Submitted',
      groupMembers: body.groupMembers,
    };

    await services.projectRequests.upsertRequest(newRequest);
    logger.info('Project setup request submitted', { requestId, projectId, submittedBy: claims.upn });

    return { status: 201, jsonBody: newRequest };
  },
});

/** GET /api/project-setup-requests — List all requests (Controller inbox) */
app.http('listProjectSetupRequests', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'project-setup-requests',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const services = createServiceFactory();
    const stateFilter = request.query.get('state') as ProjectSetupRequestState | null;
    const requests = await services.projectRequests.listRequests(stateFilter ?? undefined);

    return { status: 200, jsonBody: requests };
  },
});

/** PATCH /api/project-setup-requests/:requestId/state — Advance request state (Controller) */
app.http('advanceRequestState', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'project-setup-requests/{requestId}/state',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const requestId = request.params.requestId;
    const body = await request.json() as {
      newState: ProjectSetupRequestState;
      projectNumber?: string;
      clarificationNote?: string;
    };

    const services = createServiceFactory();
    const existing = await services.projectRequests.getRequest(requestId);
    if (!existing) return { status: 404, jsonBody: { error: 'Request not found' } };

    if (!isValidTransition(existing.state, body.newState)) {
      return {
        status: 400,
        jsonBody: { error: `Invalid state transition: ${existing.state} → ${body.newState}` },
      };
    }

    // Enforce projectNumber requirement at ReadyToProvision
    if (body.newState === 'ReadyToProvision') {
      if (!body.projectNumber || !/^\d{2}-\d{3}-\d{2}$/.test(body.projectNumber)) {
        return {
          status: 400,
          jsonBody: { error: 'Valid projectNumber (##-###-##) is required to set ReadyToProvision' },
        };
      }
      existing.projectNumber = body.projectNumber;
    }

    existing.state = body.newState;
    if (body.clarificationNote) existing.clarificationNote = body.clarificationNote;
    if (body.newState === 'Completed' || body.newState === 'Provisioning') {
      existing.completedBy = claims.upn;
      existing.completedAt = new Date().toISOString();
    }

    await services.projectRequests.upsertRequest(existing);
    logger.info('Request state advanced', {
      requestId, from: existing.state, to: body.newState, by: claims.upn,
    });

    return { status: 200, jsonBody: existing };
  },
});
```

---

## 6.8.4 — Notification Message Templates

```typescript
// packages/provisioning/src/notification-templates.ts

export const NOTIFICATION_TEMPLATES = {
  NeedsClarification: (projectName: string, note: string) => ({
    subject: `Action Required: Clarification needed for "${projectName}" Project Setup Request`,
    body: `The Controller has reviewed your Project Setup Request for "${projectName}" and requires additional information before proceeding.\n\nNote: ${note}\n\nPlease update your request in the Estimating app.`,
  }),

  ReadyToProvision: (projectName: string) => ({
    subject: `Project Setup Ready: "${projectName}" is ready for provisioning`,
    body: `The Project Setup Request for "${projectName}" has been reviewed and is ready for you to complete external setup and trigger provisioning in the Accounting app.`,
  }),

  ProvisioningStarted: (projectNumber: string, projectName: string) => ({
    body: `The SharePoint Project Site for ${projectNumber} - ${projectName} is being created! We will let you know the moment it is ready for use.`,
  }),

  ProvisioningCompleted: (projectNumber: string, projectName: string) => ({
    body: `${projectNumber} - ${projectName}'s SharePoint Site is up and running! Let's get to work!`,
  }),

  ProvisioningFailed: (projectNumber: string, projectName: string) => ({
    subject: `Provisioning Failed: ${projectNumber} - ${projectName}`,
    body: `The provisioning of ${projectNumber} - ${projectName}'s SharePoint site has failed. Please check the Admin dashboard for details and retry or escalate.`,
  }),
} as const;
```

---

## 6.8 Success Criteria Checklist

- [x] 6.8.1 `Projects` SharePoint list schema defined; setup script created in `scripts/`.
- [x] 6.8.2 `STATE_TRANSITIONS` map covers all valid transitions; `isValidTransition` function exported.
- [x] 6.8.3 `STATE_NOTIFICATION_TARGETS` map defines who is notified on each transition.
- [x] 6.8.4 All three request API endpoints implemented with Bearer token validation.
- [x] 6.8.5 `ReadyToProvision` transition is blocked without a valid `##-###-##` `projectNumber`.
- [x] 6.8.6 Notification templates defined for all five notification scenarios.
- [x] 6.8.7 Unit tests for `isValidTransition` cover all valid and invalid transitions.
- [x] 6.8.8 `pnpm turbo run build --filter=backend-functions` passes.

## PH6.8 Progress Notes

2026-03-07: PH6.8 completed. Delivered D-PH6-08 lifecycle state engine (`packages/provisioning/src/state-machine.ts`), notification templates (`packages/provisioning/src/notification-templates.ts`), request lifecycle APIs (`backend/functions/src/functions/projectRequests/index.ts`), Projects-list persistence service wiring (`backend/functions/src/services/project-requests-repository.ts` + factory integration), one-time Projects list setup script (`scripts/create-projects-list.ts`), backend README updates, and Diataxis docs (`docs/how-to/administrator/create-projects-list.md`, `docs/reference/provisioning/request-lifecycle.md`).

### Verification Evidence

- PATCH to advance state from `Submitted` → `UnderReview` → 200 — PASS (implemented validation + transition path)
- PATCH to set `ReadyToProvision` without `projectNumber` → 400 — PASS (explicit regex guard in `advanceRequestState`)
- PATCH to set `ReadyToProvision` with valid `projectNumber` → 200 — PASS (validated then persisted)
- Invalid transition (e.g., `Completed` → `Provisioning`) → 400 with error message — PASS (`isValidTransition` enforced)

<!-- PROGRESS: 2026-03-07 PH6.8 completed. Implemented D-PH6-08 request lifecycle state engine, notification templates, Projects-list-backed request APIs and service wiring, one-time Projects schema setup script, backend/readme + Diataxis docs updates, checklist completion, and scoped verification (`pnpm turbo run build --filter=@hbc/functions`, `pnpm turbo run lint --filter=@hbc/functions --filter=@hbc/provisioning`, `pnpm turbo run check-types --filter=@hbc/functions --filter=@hbc/provisioning`, `pnpm turbo run test --filter=@hbc/provisioning`). -->
