/**
 * W0-G5-T01: Step 3 — Team Assignment.
 * Fields: projectLeadId, groupMembers, groupLeaders, viewerUPNs.
 * UPN inputs — comma-separated for multi-value fields.
 */
import type { ReactElement } from 'react';
import { HbcTextField, HbcFormLayout } from '@hbc/ui-kit';
import type { IProjectSetupRequest } from '@hbc/models';

interface TeamAssignmentStepProps {
  item: Partial<IProjectSetupRequest>;
  onChange: (patch: Partial<IProjectSetupRequest>) => void;
}

function parseUpnList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinUpnList(upns?: string[]): string {
  return upns?.join(', ') ?? '';
}

export function TeamAssignmentStep({ item, onChange }: TeamAssignmentStepProps): ReactElement {
  return (
    <HbcFormLayout columns={1} gap="medium">
      <HbcTextField
        label="Project Lead (UPN)"
        value={item.projectLeadId ?? ''}
        onChange={(v) => onChange({ projectLeadId: v })}
        required
        placeholder="user@company.com"
      />
      <HbcTextField
        label="Team Members (UPNs)"
        value={joinUpnList(item.groupMembers)}
        onChange={(v) => onChange({ groupMembers: parseUpnList(v) })}
        required
        placeholder="user1@company.com, user2@company.com"
      />
      <HbcTextField
        label="Group Leaders (UPNs)"
        value={joinUpnList(item.groupLeaders)}
        onChange={(v) => onChange({ groupLeaders: parseUpnList(v) || undefined })}
        placeholder="Optional — user@company.com"
      />
      <HbcTextField
        label="Viewer UPNs"
        value={joinUpnList(item.viewerUPNs)}
        onChange={(v) => onChange({ viewerUPNs: parseUpnList(v) || undefined })}
        placeholder="Optional — read-only viewers"
      />
    </HbcFormLayout>
  );
}
