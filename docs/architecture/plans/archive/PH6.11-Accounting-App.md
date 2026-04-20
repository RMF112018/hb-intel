# PH6.11 — Accounting App: Project Setup Requests Inbox & Trigger

**Version:** 2.0
**Purpose:** Build the Controller's Project Setup Requests inbox page in the Accounting app. Implement all seven lifecycle state transitions, the `projectNumber` input with `##-###-##` validation, the "Complete Project Setup" trigger, and the compact provisioning status badge shown while a saga is running.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** The Controller can view all pending, in-progress, and recent project setup requests in a single inbox, advance each through the seven lifecycle states, enter and validate the `projectNumber` before triggering, and see a compact live status badge for any provisioning run initiated from this page.

---

## Prerequisites

- PH6.1–PH6.10 complete and passing.
- `@hbc/provisioning` package available to `apps/accounting`.

---

## 6.11.1 — Route Structure

Add to `apps/accounting/src/router/root-route.tsx`:

| Path | Component | Description |
|---|---|---|
| `/project-setup-requests` | `ProjectSetupRequestsPage` | Full inbox with all requests |
| `/project-setup-requests/:requestId` | `RequestReviewPage` | Detail view + state actions |

---

## 6.11.2 — `ProjectSetupRequestsPage` — Inbox

Create `apps/accounting/src/pages/ProjectSetupRequestsPage.tsx`:

```typescript
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { WorkspacePageShell, HbcDataTable, HbcStatusBadge } from '@hbc/ui-kit';
import { createProvisioningApiClient, useProvisioningStore } from '@hbc/provisioning';
import { useAuthSession } from '@hbc/auth';
import type { IProjectSetupRequest } from '@hbc/models';

const STATE_BADGE_MAP: Record<string, 'neutral' | 'info' | 'warning' | 'success' | 'error'> = {
  Submitted:              'info',
  UnderReview:            'info',
  NeedsClarification:     'warning',
  AwaitingExternalSetup:  'warning',
  ReadyToProvision:       'success',
  Provisioning:           'info',
  Completed:              'success',
  Failed:                 'error',
};

export function ProjectSetupRequestsPage(): ReactNode {
  const session = useAuthSession();
  const { requests, requestsLoading, requestsError, setRequests, setRequestsLoading, setRequestsError } =
    useProvisioningStore();

  useEffect(() => {
    if (!session) return;
    setRequestsLoading(true);
    const client = createProvisioningApiClient(
      import.meta.env.VITE_FUNCTION_APP_URL, session.getToken
    );
    client.listRequests()
      .then(setRequests)
      .catch((err) => setRequestsError(err.message))
      .finally(() => setRequestsLoading(false));
  }, [session]);

  const columns = [
    { key: 'projectName', header: 'Project Name' },
    { key: 'submittedBy', header: 'Submitted By' },
    { key: 'submittedAt', header: 'Submitted',
      render: (r: IProjectSetupRequest) => new Date(r.submittedAt).toLocaleDateString() },
    { key: 'state', header: 'Status',
      render: (r: IProjectSetupRequest) => (
        <HbcStatusBadge variant={STATE_BADGE_MAP[r.state] ?? 'neutral'}>
          {r.state}
        </HbcStatusBadge>
      )},
    { key: 'actions', header: '',
      render: (r: IProjectSetupRequest) => (
        <Link to="/project-setup-requests/$requestId" params={{ requestId: r.requestId }}>
          Review →
        </Link>
      )},
  ];

  return (
    <WorkspacePageShell layout="list" title="Project Setup Requests">
      {requestsLoading && <p>Loading requests…</p>}
      {requestsError && <p className="text-red-600">{requestsError}</p>}
      {!requestsLoading && (
        <HbcDataTable
          rows={requests}
          columns={columns}
          emptyMessage="No project setup requests found."
          rowKey={(r) => r.requestId}
        />
      )}
    </WorkspacePageShell>
  );
}
```

---

## 6.11.3 — `RequestReviewPage` — State Actions & Trigger

Create `apps/accounting/src/pages/RequestReviewPage.tsx`:

```typescript
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import {
  WorkspacePageShell, HbcButton, HbcTextField, HbcTextArea,
  HbcStatusBadge, HbcDetailSection
} from '@hbc/ui-kit';
import {
  createProvisioningApiClient, useProvisioningStore,
  useProvisioningSignalR,
} from '@hbc/provisioning';
import { useAuthSession } from '@hbc/auth';
import type { ProjectSetupRequestState } from '@hbc/models';
import { ProvisioningStatusBadge } from '../components/ProvisioningStatusBadge.js';

const PROJECT_NUMBER_REGEX = /^\d{2}-\d{3}-\d{2}$/;

export function RequestReviewPage(): ReactNode {
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const session = useAuthSession();
  const { requests, upsertRequest, statusByProjectId, setProvisioningStatus } =
    useProvisioningStore();
  const request = requests.find((r) => r.requestId === requestId);

  const [projectNumber, setProjectNumber] = useState('');
  const [projectNumberError, setProjectNumberError] = useState<string | null>(null);
  const [clarificationNote, setClarificationNote] = useState('');
  const [advancing, setAdvancing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const projectId = request?.projectId;
  const provisioningStatus = projectId ? statusByProjectId[projectId] : undefined;

  // Connect to SignalR when provisioning is active
  useProvisioningSignalR({
    negotiateUrl: `${import.meta.env.VITE_FUNCTION_APP_URL}/api/provisioning-negotiate`,
    projectId: projectId ?? '',
    getToken: session!.getToken,
    enabled: !!projectId && request?.state === 'Provisioning',
  });

  useEffect(() => {
    if (!projectId || !session) return;
    const client = createProvisioningApiClient(
      import.meta.env.VITE_FUNCTION_APP_URL, session.getToken
    );
    client.getProvisioningStatus(projectId).then((s) => { if (s) setProvisioningStatus(s); });
  }, [projectId]);

  async function advanceState(newState: ProjectSetupRequestState) {
    if (!session || !request) return;
    setAdvancing(true);
    setActionError(null);

    if (newState === 'ReadyToProvision') {
      if (!PROJECT_NUMBER_REGEX.test(projectNumber)) {
        setProjectNumberError('Project Number must be in ##-###-## format (e.g. 25-001-01)');
        setAdvancing(false);
        return;
      }
      setProjectNumberError(null);
    }

    try {
      const client = createProvisioningApiClient(
        import.meta.env.VITE_FUNCTION_APP_URL, session.getToken
      );
      const updated = await client.advanceState(requestId, newState, {
        projectNumber: newState === 'ReadyToProvision' ? projectNumber : undefined,
        clarificationNote: newState === 'NeedsClarification' ? clarificationNote : undefined,
      });
      upsertRequest(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setAdvancing(false);
    }
  }

  if (!request) return <WorkspacePageShell layout="detail" title="Request Not Found" />;

  return (
    <WorkspacePageShell
      layout="detail"
      title={`Review: ${request.projectName}`}
    >
      <HbcDetailSection>
        <p><strong>Submitted by:</strong> {request.submittedBy}</p>
        <p><strong>Submitted at:</strong> {new Date(request.submittedAt).toLocaleString()}</p>
        <p><strong>Stage:</strong> {request.projectStage}</p>
        <p><strong>Type:</strong> {request.projectType}</p>
        <p><strong>Location:</strong> {request.projectLocation}</p>
        <p><strong>Team Members:</strong> {request.groupMembers.join(', ')}</p>
        <p><strong>Status:</strong> <HbcStatusBadge>{request.state}</HbcStatusBadge></p>
      </HbcDetailSection>

      {/* Provisioning status badge — visible while saga is running */}
      {request.state === 'Provisioning' && provisioningStatus && (
        <ProvisioningStatusBadge status={provisioningStatus} />
      )}

      {/* State action area */}
      {request.state === 'Submitted' && (
        <HbcButton onClick={() => advanceState('UnderReview')} disabled={advancing}>
          Mark Under Review
        </HbcButton>
      )}

      {request.state === 'UnderReview' && (
        <div className="space-y-4">
          <HbcButton onClick={() => advanceState('AwaitingExternalSetup')} disabled={advancing}>
            Begin External Setup (Sage / Procore)
          </HbcButton>
          <div>
            <HbcTextArea
              label="Clarification Note"
              value={clarificationNote}
              onChange={setClarificationNote}
              placeholder="Describe what additional information is needed…"
            />
            <HbcButton
              variant="secondary"
              onClick={() => advanceState('NeedsClarification')}
              disabled={advancing || !clarificationNote.trim()}
            >
              Request Clarification
            </HbcButton>
          </div>
        </div>
      )}

      {request.state === 'AwaitingExternalSetup' && (
        <HbcButton onClick={() => advanceState('ReadyToProvision')} disabled={advancing}>
          External Setup Complete — Enter Project Number
        </HbcButton>
      )}

      {/* projectNumber input — only shown at ReadyToProvision transition */}
      {(request.state === 'AwaitingExternalSetup' || request.state === 'ReadyToProvision') && (
        <div className="mt-4">
          <HbcTextField
            label="Project Number"
            value={projectNumber}
            onChange={(v) => {
              setProjectNumber(v);
              setProjectNumberError(null);
            }}
            placeholder="##-###-##"
            error={projectNumberError ?? undefined}
          />
        </div>
      )}

      {request.state === 'ReadyToProvision' && (
        <HbcButton
          variant="primary"
          onClick={() => advanceState('Provisioning')}
          disabled={advancing || !PROJECT_NUMBER_REGEX.test(projectNumber)}
        >
          Complete Project Setup
        </HbcButton>
      )}

      {actionError && <p className="text-red-600 mt-2">{actionError}</p>}
    </WorkspacePageShell>
  );
}
```

---

## 6.11.4 — `ProvisioningStatusBadge` Component

Create `apps/accounting/src/components/ProvisioningStatusBadge.tsx`:

```typescript
import type { ReactNode } from 'react';
import type { IProvisioningStatus } from '@hbc/models';
import { useProvisioningStore } from '@hbc/provisioning';

export function ProvisioningStatusBadge({
  status,
}: { status: IProvisioningStatus }): ReactNode {
  const latestEvent = useProvisioningStore(
    (s) => s.latestEventByProjectId[status.projectId]
  );

  const currentStep = latestEvent?.stepNumber ?? status.currentStep;
  const overallStatus = latestEvent?.overallStatus ?? status.overallStatus;

  const text = overallStatus === 'Completed'
    ? 'Site setup complete ✓'
    : overallStatus === 'Failed'
    ? 'Site setup failed ✗'
    : overallStatus === 'WebPartsPending'
    ? 'Base setup complete — Web Parts overnight'
    : `Setting up site… Step ${currentStep} of 7`;

  const color = overallStatus === 'Completed' ? 'bg-green-100 text-green-800'
    : overallStatus === 'Failed' ? 'bg-red-100 text-red-800'
    : 'bg-blue-100 text-blue-800 animate-pulse';

  return (
    <div className={`rounded px-3 py-2 text-sm font-medium ${color}`}>
      {text}
    </div>
  );
}
```

---

## 6.11 Success Criteria Checklist

- [ ] 6.11.1 Inbox page lists all requests with state badges; loading and error states handled.
- [ ] 6.11.2 "Mark Under Review" advances `Submitted` → `UnderReview`.
- [ ] 6.11.3 "Request Clarification" requires a non-empty clarification note.
- [ ] 6.11.4 "Begin External Setup" advances `UnderReview` → `AwaitingExternalSetup`.
- [ ] 6.11.5 `projectNumber` input with `##-###-##` regex validation shown at `AwaitingExternalSetup`/`ReadyToProvision`.
- [ ] 6.11.6 "Complete Project Setup" button disabled until `projectNumber` passes validation.
- [ ] 6.11.7 `ProvisioningStatusBadge` shows live step count and updates via Zustand store.
- [ ] 6.11.8 `pnpm turbo run build --filter=@hb-intel/accounting` passes.

## PH6.11 Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- `pnpm turbo run build --filter=@hb-intel/accounting` → EXIT 0 — PASS / FAIL
- Entering invalid project number → error message shown, "Complete Project Setup" disabled — PASS / FAIL
- Entering valid `25-001-01` → button enabled — PASS / FAIL
- Triggering "Complete Project Setup" → state advances to `Provisioning`, status badge appears — PASS / FAIL
