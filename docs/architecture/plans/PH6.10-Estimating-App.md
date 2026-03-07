# PH6.10 — Estimating App: Project Setup Request Form & Checklist

**Version:** 2.0
**Purpose:** Build the Estimating app's Project Setup Request submission form (with team member picker) and the full 7-step real-time provisioning checklist shown to the Request Submitter. Replace the existing `ProjectSetupPage` stub with a fully functional component.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** The Estimating Coordinator can submit a Project Setup Request with project details and team member selection. After submission, they see a confirmation state. When provisioning begins, the `ProjectSetupPage` shows the full 7-step checklist updating in real time via SignalR.

---

## Prerequisites

- PH6.1–PH6.9 complete and passing.
- `@hbc/provisioning` package built and available to `apps/estimating`.
- `@microsoft/signalr` installed in the estimating app.

---

## 6.10.1 — Route Structure

Add the following routes to `apps/estimating/src/router/root-route.tsx`:

| Path | Component | Description |
|---|---|---|
| `/project-setup` | `ProjectSetupPage` | List of submitted requests + new request button |
| `/project-setup/new` | `NewRequestPage` | Request submission form |
| `/project-setup/:requestId` | `RequestDetailPage` | Status + checklist for a specific request |

---

## 6.10.2 — `NewRequestPage` — Project Setup Request Form

Create `apps/estimating/src/pages/NewRequestPage.tsx`:

```typescript
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  HbcButton, HbcTextField, HbcSelect, HbcPeoplePicker,
  WorkspacePageShell, HbcFormSection
} from '@hbc/ui-kit';
import { createProvisioningApiClient } from '@hbc/provisioning';
import { useAuthSession } from '@hbc/auth';

const PROJECT_TYPES = ['GC', 'CM', 'Design-Build', 'Other'];
const PROJECT_STAGES = ['Pursuit', 'Active'];

export function NewRequestPage(): ReactNode {
  const navigate = useNavigate();
  const session = useAuthSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    projectName: '',
    projectLocation: '',
    projectType: PROJECT_TYPES[0],
    projectStage: 'Pursuit' as 'Pursuit' | 'Active',
    groupMembers: [] as string[], // array of UPNs
    opexManagerUpn: import.meta.env.VITE_OPEX_MANAGER_UPN ?? '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const client = createProvisioningApiClient(
        import.meta.env.VITE_FUNCTION_APP_URL,
        session!.getToken
      );

      // Ensure OpEx Manager is in the group (deduplicate)
      const members = Array.from(
        new Set([...form.groupMembers, form.opexManagerUpn].filter(Boolean))
      );

      const request = await client.submitRequest({
        projectName: form.projectName,
        projectLocation: form.projectLocation,
        projectType: form.projectType,
        projectStage: form.projectStage,
        groupMembers: members,
      });

      navigate({ to: '/project-setup/$requestId', params: { requestId: request.requestId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WorkspacePageShell layout="form" title="New Project Setup Request">
      <form onSubmit={handleSubmit}>
        <HbcFormSection title="Project Details">
          <HbcTextField
            label="Project Name"
            value={form.projectName}
            onChange={(v) => setForm((f) => ({ ...f, projectName: v }))}
            required
          />
          <HbcTextField
            label="Project Location"
            value={form.projectLocation}
            onChange={(v) => setForm((f) => ({ ...f, projectLocation: v }))}
          />
          <HbcSelect
            label="Project Type"
            options={PROJECT_TYPES.map((t) => ({ label: t, value: t }))}
            value={form.projectType}
            onChange={(v) => setForm((f) => ({ ...f, projectType: v }))}
          />
          <HbcSelect
            label="Project Stage"
            options={PROJECT_STAGES.map((s) => ({ label: s, value: s }))}
            value={form.projectStage}
            onChange={(v) => setForm((f) => ({ ...f, projectStage: v as 'Pursuit' | 'Active' }))}
          />
        </HbcFormSection>

        <HbcFormSection
          title="Project Team Members"
          description="Select the team members who will have full access to the SharePoint project site. The OpEx Manager is included automatically."
        >
          <HbcPeoplePicker
            label="Team Members"
            value={form.groupMembers}
            onChange={(upns) => setForm((f) => ({ ...f, groupMembers: upns }))}
            tenantId={import.meta.env.VITE_AZURE_TENANT_ID}
            accessToken={session?.token}
          />
        </HbcFormSection>

        {error && <p className="text-red-600">{error}</p>}

        <HbcButton type="submit" disabled={submitting || !form.projectName}>
          {submitting ? 'Submitting…' : 'Submit Project Setup Request'}
        </HbcButton>
      </form>
    </WorkspacePageShell>
  );
}
```

---

## 6.10.3 — `RequestDetailPage` — Full 7-Step Checklist (Submitter View)

Create `apps/estimating/src/pages/RequestDetailPage.tsx`:

```typescript
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { WorkspacePageShell } from '@hbc/ui-kit';
import {
  createProvisioningApiClient,
  useProvisioningStore,
  useProvisioningSignalR,
  getProvisioningVisibility,
} from '@hbc/provisioning';
import { useAuthSession } from '@hbc/auth';
import { ProvisioningChecklist } from '../components/ProvisioningChecklist.js';
import { RequestStatusBadge } from '../components/RequestStatusBadge.js';

export function RequestDetailPage(): ReactNode {
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const session = useAuthSession();
  const { requests, statusByProjectId, setProvisioningStatus } = useProvisioningStore();
  const request = requests.find((r) => r.requestId === requestId);

  const projectId = request?.projectId;
  const provisioningStatus = projectId ? statusByProjectId[projectId] : undefined;

  const visibility = getProvisioningVisibility(session, request?.submittedBy ?? '');

  // Connect to SignalR when provisioning is active
  useProvisioningSignalR({
    negotiateUrl: `${import.meta.env.VITE_FUNCTION_APP_URL}/api/provisioning-negotiate`,
    projectId: projectId ?? '',
    getToken: session!.getToken,
    enabled: !!projectId && request?.state === 'Provisioning',
  });

  // Fetch provisioning status on mount
  useEffect(() => {
    if (!projectId || !session) return;
    const client = createProvisioningApiClient(
      import.meta.env.VITE_FUNCTION_APP_URL, session.getToken
    );
    client.getProvisioningStatus(projectId).then((status) => {
      if (status) setProvisioningStatus(status);
    });
  }, [projectId]);

  if (!request) {
    return <WorkspacePageShell layout="detail" title="Request Not Found" />;
  }

  return (
    <WorkspacePageShell layout="detail" title={`${request.projectName} — Setup Request`}>
      <RequestStatusBadge state={request.state} />

      {visibility === 'full' && provisioningStatus && (
        <ProvisioningChecklist
          status={provisioningStatus}
          showStepDetail={true}
        />
      )}

      {visibility === 'full' && !provisioningStatus && request.state === 'Provisioning' && (
        <p>Connecting to live progress…</p>
      )}

      {visibility !== 'full' && request.state === 'Provisioning' && (
        <p>Site provisioning is in progress. You will be notified when it is ready.</p>
      )}
    </WorkspacePageShell>
  );
}
```

---

## 6.10.4 — `ProvisioningChecklist` Component

Create `apps/estimating/src/components/ProvisioningChecklist.tsx`:

```typescript
import type { ReactNode } from 'react';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';

const STEP_LABELS: Record<number, string> = {
  1: 'Create SharePoint Site',
  2: 'Set Up Document Library',
  3: 'Upload Project Templates',
  4: 'Create Project Lists',
  5: 'Install HB Intel Interface',
  6: 'Set Team Permissions',
  7: 'Connect to Hub Site',
};

const STATUS_ICONS: Record<ISagaStepResult['status'], string> = {
  NotStarted:      '○',
  InProgress:      '⟳',
  Completed:       '✓',
  Failed:          '✗',
  Skipped:         '–',
  DeferredToTimer: '🕐',
};

const STATUS_COLORS: Record<ISagaStepResult['status'], string> = {
  NotStarted:      'text-gray-400',
  InProgress:      'text-blue-600 animate-pulse',
  Completed:       'text-green-600',
  Failed:          'text-red-600',
  Skipped:         'text-gray-400',
  DeferredToTimer: 'text-amber-500',
};

export function ProvisioningChecklist({
  status,
  showStepDetail = false,
}: {
  status: IProvisioningStatus;
  showStepDetail?: boolean;
}): ReactNode {
  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border">
      <h3 className="font-semibold text-gray-900">
        Site Setup Progress — {status.projectNumber} {status.projectName}
      </h3>

      <ol className="space-y-2">
        {status.steps.map((step) => (
          <li key={step.stepNumber} className="flex items-start gap-3">
            <span className={`text-lg font-mono ${STATUS_COLORS[step.status]}`}>
              {STATUS_ICONS[step.status]}
            </span>
            <div>
              <span className={step.status === 'InProgress' ? 'font-semibold' : ''}>
                {STEP_LABELS[step.stepNumber] ?? step.stepName}
              </span>
              {showStepDetail && step.status === 'DeferredToTimer' && (
                <p className="text-xs text-amber-600">
                  Will complete overnight — site is ready to use now.
                </p>
              )}
              {showStepDetail && step.status === 'Failed' && step.errorMessage && (
                <p className="text-xs text-red-600">{step.errorMessage}</p>
              )}
              {showStepDetail && step.completedAt && step.status === 'Completed' && (
                <p className="text-xs text-gray-400">
                  {new Date(step.completedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {status.overallStatus === 'Completed' && status.siteUrl && (
        <a
          href={status.siteUrl}
          target="_blank"
          rel="noreferrer"
          className="block mt-4 text-center bg-green-600 text-white py-2 rounded"
        >
          Open Project Site →
        </a>
      )}

      {status.overallStatus === 'WebPartsPending' && status.siteUrl && (
        <div className="mt-4">
          <p className="text-amber-700 text-sm mb-2">
            The site is ready! The HB Intel interface will finish installing tonight.
          </p>
          <a href={status.siteUrl} target="_blank" rel="noreferrer"
             className="block text-center bg-amber-500 text-white py-2 rounded">
            Open Project Site (Basic View) →
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## 6.10 Success Criteria Checklist

- [ ] 6.10.1 Routes `/project-setup`, `/project-setup/new`, `/project-setup/:requestId` added to estimating app router.
- [ ] 6.10.2 `NewRequestPage` submits to the API and navigates to the detail page on success.
- [ ] 6.10.3 OpEx Manager UPN is always included in `groupMembers` on submission (deduplicated).
- [ ] 6.10.4 `RequestDetailPage` connects to SignalR only when `request.state === 'Provisioning'`.
- [ ] 6.10.5 `getProvisioningVisibility` result controls whether full checklist or message is shown.
- [ ] 6.10.6 `ProvisioningChecklist` shows `DeferredToTimer` note for Step 5 deferred runs.
- [ ] 6.10.7 "Open Project Site" link appears on `Completed` and `WebPartsPending` states.
- [ ] 6.10.8 `pnpm turbo run build --filter=@hb-intel/estimating` passes.

## PH6.10 Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- `pnpm turbo run build --filter=@hb-intel/estimating` → EXIT 0 — PASS / FAIL
- Submit request form → navigates to RequestDetailPage — PASS / FAIL
- RequestDetailPage with `state=Provisioning` → SignalR connected, checklist updates — PASS / FAIL
- Admin user on RequestDetailPage → full checklist visible — PASS / FAIL
- Non-submitter, non-admin on RequestDetailPage → checklist not shown — PASS / FAIL
