import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { getEligibleTimberscanApprovers } from '@hbc/features-estimating';
import { HbcFormSection, HbcPeoplePicker, HbcSelect, HbcTypography } from '@hbc/ui-kit';
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
  const timberscanApproverOptions = getEligibleTimberscanApprovers(request).map((upn) => ({
    value: upn,
    label: upn,
  }));

  return (
    <HbcFormSection title="Project Team">
      <HbcPeoplePicker
        label="Project Executive"
        value={request.projectExecutiveUpn ? [request.projectExecutiveUpn] : []}
        onChange={(upns: string[]) => onChange({ projectExecutiveUpn: upns[0] ?? undefined })}
        tenantId={tenantId}
        accessToken={accessToken}
        required
      />
      <HbcPeoplePicker
        label="Project Manager"
        value={request.projectManagerUpn ? [request.projectManagerUpn] : []}
        onChange={(upns: string[]) => onChange({ projectManagerUpn: upns[0] ?? undefined })}
        tenantId={tenantId}
        accessToken={accessToken}
      />
      <HbcPeoplePicker
        label="Lead Estimator"
        value={request.leadEstimatorUpn ? [request.leadEstimatorUpn] : []}
        onChange={(upns: string[]) => onChange({ leadEstimatorUpn: upns[0] ?? undefined })}
        tenantId={tenantId}
        accessToken={accessToken}
        required
      />
      <HbcPeoplePicker
        label="Supporting Estimators"
        value={request.supportingEstimatorUpns ?? []}
        onChange={(upns: string[]) => onChange({ supportingEstimatorUpns: upns })}
        tenantId={tenantId}
        accessToken={accessToken}
      />
      <HbcPeoplePicker
        label="Additional Team Members"
        value={request.additionalTeamMemberUpns ?? []}
        onChange={(upns: string[]) => onChange({ additionalTeamMemberUpns: upns })}
        tenantId={tenantId}
        accessToken={accessToken}
      />
      <HbcSelect
        label="Timberscan Approver"
        options={timberscanApproverOptions}
        value={request.timberscanApproverUpn ?? ''}
        onChange={(value) => onChange({ timberscanApproverUpn: value || undefined })}
        placeholder={
          timberscanApproverOptions.length > 0
            ? 'Select an eligible approver'
            : 'Add project team members first'
        }
        disabled={timberscanApproverOptions.length === 0}
        required
      />
      {timberscanApproverOptions.length === 0 && (
        <HbcTypography intent="body">
          Timberscan Approver options appear after at least one upstream team member is added.
        </HbcTypography>
      )}
    </HbcFormSection>
  );
}
