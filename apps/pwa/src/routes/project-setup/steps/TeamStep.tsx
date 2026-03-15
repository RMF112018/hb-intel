/**
 * W0-G5-T03: Step 3 — Project Team (stepId: 'project-team').
 * Fields: projectLeadId (req), groupMembers (opt), viewerUPNs (opt).
 * UPN text inputs — people picker upgrade in later wave per T02 parity contract.
 */
import type { ReactElement } from 'react';
import { HbcTextField, HbcFormLayout } from '@hbc/ui-kit';
import type { IProjectSetupRequest } from '@hbc/models';

interface TeamStepProps {
  request: Partial<IProjectSetupRequest>;
  onChange: (patch: Partial<IProjectSetupRequest>) => void;
}

function parseUpnList(value: string): string[] {
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function joinUpnList(upns?: string[]): string {
  return upns?.join(', ') ?? '';
}

export function TeamStep({ request, onChange }: TeamStepProps): ReactElement {
  return (
    <HbcFormLayout columns={1} gap="medium">
      <HbcTextField
        label="Project Lead (UPN)"
        value={request.projectLeadId ?? ''}
        onChange={(v) => onChange({ projectLeadId: v })}
        required
        placeholder="user@company.com"
      />
      <HbcTextField
        label="Team Members (UPNs)"
        value={joinUpnList(request.groupMembers)}
        onChange={(v) => onChange({ groupMembers: parseUpnList(v) })}
        placeholder="Optional — user1@company.com, user2@company.com"
      />
      <HbcTextField
        label="Viewer UPNs"
        value={joinUpnList(request.viewerUPNs)}
        onChange={(v) => onChange({ viewerUPNs: parseUpnList(v) || undefined })}
        placeholder="Optional — read-only viewers"
      />
    </HbcFormLayout>
  );
}
