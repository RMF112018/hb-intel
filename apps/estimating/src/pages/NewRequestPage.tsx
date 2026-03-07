import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCurrentSession } from '@hbc/auth';
import { createProvisioningApiClient } from '@hbc/provisioning';
import {
  HbcButton,
  HbcFormSection,
  HbcPeoplePicker,
  HbcSelect,
  HbcTextField,
  WorkspacePageShell,
} from '@hbc/ui-kit';

const PROJECT_TYPES = ['GC', 'CM', 'Design-Build', 'Other'];
const PROJECT_STAGES = ['Pursuit', 'Active'] as const;

type RequestFormState = {
  projectName: string;
  projectLocation: string;
  projectType: string;
  projectStage: 'Pursuit' | 'Active';
  groupMembers: string[];
  opexManagerUpn: string;
};

function resolveSessionToken(session: ReturnType<typeof useCurrentSession>): string {
  const payload = session?.rawContext?.payload;
  if (payload && typeof payload === 'object') {
    const rawToken =
      (payload as Record<string, unknown>).accessToken ??
      (payload as Record<string, unknown>).token;
    if (typeof rawToken === 'string' && rawToken.trim().length > 0) return rawToken;
  }
  return session?.providerIdentityRef ?? 'mock-token';
}

/**
 * D-PH6-10 Estimating submission form for Project Setup Requests.
 * Traceability: docs/architecture/plans/PH6.10-Estimating-App.md §6.10.2
 */
export function NewRequestPage(): ReactNode {
  const navigate = useNavigate();
  const session = useCurrentSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<RequestFormState>({
    projectName: '',
    projectLocation: '',
    projectType: PROJECT_TYPES[0],
    projectStage: 'Pursuit',
    groupMembers: [],
    opexManagerUpn: import.meta.env.VITE_OPEX_MANAGER_UPN ?? '',
  });

  const authToken = useMemo(() => resolveSessionToken(session), [session]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const client = createProvisioningApiClient(
        import.meta.env.VITE_FUNCTION_APP_URL,
        async () => authToken,
      );

      // D-PH6-10 OpEx manager must always be included and members must be deduplicated.
      const members = Array.from(
        new Set([...form.groupMembers, form.opexManagerUpn].filter(Boolean)),
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
            onChange={(v) => setForm((f) => ({ ...f, projectStage: v as RequestFormState['projectStage'] }))}
          />
        </HbcFormSection>

        <HbcFormSection
          title="Project Team Members"
          description="Select team members who need access to the project site. The OpEx Manager is included automatically."
        >
          <HbcPeoplePicker
            label="Team Members"
            value={form.groupMembers}
            onChange={(upns: string[]) => setForm((f) => ({ ...f, groupMembers: upns }))}
            tenantId={import.meta.env.VITE_AZURE_TENANT_ID}
            accessToken={authToken}
          />
        </HbcFormSection>

        {error ? <p>{error}</p> : null}

        <HbcButton type="submit" disabled={submitting || !form.projectName}>
          {submitting ? 'Submitting…' : 'Submit Project Setup Request'}
        </HbcButton>
      </form>
    </WorkspacePageShell>
  );
}
