import type { ReactNode } from 'react';
import { DEPARTMENT_DISPLAY_LABELS } from '@hbc/provisioning';
import { HbcBanner, HbcButton, HbcCard, HbcFormSection, HbcTypography } from '@hbc/ui-kit';
import type { StepBodyProps } from './StepBodyProps.js';

function displayValue(value?: string): string {
  return value?.trim() ? value : '—';
}

function displayList(values?: readonly string[]): string {
  return values && values.length > 0 ? values.join(', ') : '—';
}

export interface ReviewStepBodyProps extends StepBodyProps {
  onSubmit: () => void;
  submitting: boolean;
}

/**
 * Step 5 — Read-only review and submit.
 * W0-G4-T01 step body for the `review-submit` wizard step.
 */
export function ReviewStepBody({ request, mode, onSubmit, submitting }: ReviewStepBodyProps): ReactNode {
  return (
    <HbcFormSection title="Review & Submit">
      {mode === 'clarification-return' && (
        <HbcBanner variant="info">Resubmitting with corrections from reviewer feedback.</HbcBanner>
      )}

      <HbcCard>
        <HbcTypography intent="heading3">Project Information</HbcTypography>
        <p><strong>Name:</strong> {request.projectName || '—'}</p>
        <p><strong>Client:</strong> {request.clientName || '—'}</p>
        <p><strong>Street Address:</strong> {displayValue(request.projectStreetAddress)}</p>
        <p><strong>City:</strong> {displayValue(request.projectCity)}</p>
        <p><strong>County:</strong> {displayValue(request.projectCounty)}</p>
        <p><strong>State:</strong> {displayValue(request.projectState)}</p>
        <p><strong>Zip:</strong> {displayValue(request.projectZip)}</p>
        {request.estimatedValue != null && (
          <p><strong>Estimated Value:</strong> ${request.estimatedValue.toLocaleString()}</p>
        )}
        {request.estimatedValue == null && <p><strong>Estimated Value:</strong> —</p>}
        <p><strong>Expected Project Start Date:</strong> {displayValue(request.startDate)}</p>
        <p><strong>Procore Project:</strong> {displayValue(request.procoreProject)}</p>
      </HbcCard>

      <HbcCard>
        <HbcTypography intent="heading3">Department & Type</HbcTypography>
        <p><strong>Project Stage:</strong> {request.projectStage || '—'}</p>
        <p><strong>Office & Division:</strong> {request.officeDivision || '—'}</p>
        <p>
          <strong>Department:</strong>{' '}
          {request.department ? (DEPARTMENT_DISPLAY_LABELS[request.department] ?? request.department) : '—'}
        </p>
        <p><strong>Project Type:</strong> {request.projectType || '—'}</p>
        <p><strong>Contract Type:</strong> {request.contractType || '—'}</p>
      </HbcCard>

      <HbcCard>
        <HbcTypography intent="heading3">Project Team</HbcTypography>
        <p><strong>Project Executive:</strong> {displayValue(request.projectExecutiveUpn)}</p>
        <p><strong>Project Manager:</strong> {displayValue(request.projectManagerUpn)}</p>
        <p><strong>Lead Estimator:</strong> {displayValue(request.leadEstimatorUpn)}</p>
        <p><strong>Supporting Estimators:</strong> {displayList(request.supportingEstimatorUpns)}</p>
        <p><strong>Additional Team Members:</strong> {displayList(request.additionalTeamMemberUpns)}</p>
        <p><strong>Timberscan Approver:</strong> {displayValue(request.timberscanApproverUpn)}</p>
      </HbcCard>

      {request.addOns && request.addOns.length > 0 && (
        <HbcCard>
          <HbcTypography intent="heading3">Add-Ons</HbcTypography>
          <p>{request.addOns.join(', ')}</p>
        </HbcCard>
      )}

      <HbcButton variant="primary" onClick={onSubmit} disabled={submitting || !request.projectName}>
        {submitting ? 'Submitting…' : 'Submit Project Setup Request'}
      </HbcButton>
    </HbcFormSection>
  );
}
