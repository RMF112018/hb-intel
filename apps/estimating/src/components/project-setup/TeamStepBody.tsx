import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { HbcFormSection, HbcPeoplePicker } from '@hbc/ui-kit';
import { resolveSessionToken } from '../../utils/resolveSessionToken.js';
import type { StepBodyProps } from './StepBodyProps.js';

/**
 * Step 3 — Project team assignment fields.
 * W0-G4-T01 step body for the `project-team` wizard step.
 */
export function TeamStepBody({ request, onChange }: StepBodyProps): ReactNode {
  const session = useCurrentSession();
  const accessToken = useMemo(() => resolveSessionToken(session), [session]);
  const tenantId = import.meta.env.VITE_AZURE_TENANT_ID as string;

  return (
    <HbcFormSection title="Project Team">
      <HbcPeoplePicker
        label="Project Lead"
        value={request.projectLeadId ? [request.projectLeadId] : []}
        onChange={(upns: string[]) => onChange({ projectLeadId: upns[0] ?? undefined })}
        tenantId={tenantId}
        accessToken={accessToken}
      />
      <HbcPeoplePicker
        label="Team Members"
        value={request.groupMembers ?? []}
        onChange={(upns: string[]) => onChange({ groupMembers: upns })}
        tenantId={tenantId}
        accessToken={accessToken}
      />
      <HbcPeoplePicker
        label="Viewers"
        value={request.viewerUPNs ?? []}
        onChange={(upns: string[]) => onChange({ viewerUPNs: upns })}
        tenantId={tenantId}
        accessToken={accessToken}
      />
    </HbcFormSection>
  );
}
