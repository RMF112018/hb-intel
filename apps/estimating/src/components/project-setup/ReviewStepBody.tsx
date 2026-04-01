import type { ReactNode } from 'react';
import { DEPARTMENT_DISPLAY_LABELS } from '@hbc/provisioning';
import { HbcBanner, HbcButton, HbcCard, HbcDescriptionList, HbcFormSection, HbcTypography } from '@hbc/ui-kit';
import type { DescriptionListItem } from '@hbc/ui-kit';
import type { StepBodyProps } from './StepBodyProps.js';

function dv(value?: string): string {
  return value?.trim() ? value : '—';
}

function dl(values?: readonly string[]): string {
  return values && values.length > 0 ? values.join(', ') : '—';
}

export interface ReviewStepBodyProps extends StepBodyProps {
  onSubmit: () => void;
  submitting: boolean;
}

/**
 * Step 5 — Read-only review and submit.
 * Uses HbcDescriptionList inside HbcCard for governed label/value display.
 */
export function ReviewStepBody({ request, mode, onSubmit, submitting }: ReviewStepBodyProps): ReactNode {
  const projectInfoItems: DescriptionListItem[] = [
    { label: 'Project Name', value: request.projectName || '—' },
    { label: 'Client', value: request.clientName || '—' },
    { label: 'Street Address', value: dv(request.projectStreetAddress) },
    { label: 'City', value: dv(request.projectCity) },
    { label: 'County', value: dv(request.projectCounty) },
    { label: 'State', value: dv(request.projectState) },
    { label: 'Zip', value: dv(request.projectZip) },
    {
      label: 'Estimated Value',
      value: request.estimatedValue != null
        ? `$${request.estimatedValue.toLocaleString()}`
        : '—',
    },
    { label: 'Start Date', value: dv(request.startDate) },
    { label: 'Procore Project', value: dv(request.procoreProject) },
  ];

  const departmentItems: DescriptionListItem[] = [
    { label: 'Project Stage', value: request.projectStage || '—' },
    { label: 'Office & Division', value: request.officeDivision || '—' },
    {
      label: 'Department',
      value: request.department
        ? (DEPARTMENT_DISPLAY_LABELS[request.department] ?? request.department)
        : '—',
    },
    { label: 'Project Type', value: request.projectType || '—' },
    { label: 'Contract Type', value: request.contractType || '—' },
  ];

  const teamItems: DescriptionListItem[] = [
    { label: 'Project Executive', value: dv(request.projectExecutiveUpn) },
    { label: 'Project Manager', value: dv(request.projectManagerUpn) },
    { label: 'Lead Estimator', value: dv(request.leadEstimatorUpn) },
    { label: 'Supporting Estimators', value: dl(request.supportingEstimatorUpns) },
    { label: 'Timberscan Approver', value: dv(request.timberscanApproverUpn) },
  ];

  return (
    <HbcFormSection title="Review & Submit">
      {mode === 'clarification-return' && (
        <HbcBanner variant="info">Resubmitting with corrections from reviewer feedback.</HbcBanner>
      )}

      <HbcCard>
        <HbcTypography intent="heading3">Project Information</HbcTypography>
        <HbcDescriptionList items={projectInfoItems} dense />
      </HbcCard>

      <HbcCard>
        <HbcTypography intent="heading3">Department & Type</HbcTypography>
        <HbcDescriptionList items={departmentItems} dense />
      </HbcCard>

      <HbcCard>
        <HbcTypography intent="heading3">Project Team</HbcTypography>
        <HbcDescriptionList items={teamItems} dense />
      </HbcCard>

      {request.addOns && request.addOns.length > 0 && (
        <HbcCard>
          <HbcTypography intent="heading3">Template Add-Ons</HbcTypography>
          <HbcTypography intent="body">{request.addOns.join(', ')}</HbcTypography>
        </HbcCard>
      )}

      {/* Submit gating: when required fields are enabled, projectName must be present */}
      <HbcButton variant="primary" onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Project Setup Request'}
      </HbcButton>
    </HbcFormSection>
  );
}
