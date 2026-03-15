import type { ReactNode } from 'react';
import { DEPARTMENT_DISPLAY_LABELS } from '@hbc/provisioning';
import { HbcBanner, HbcButton, HbcCard, HbcFormSection, HbcTypography } from '@hbc/ui-kit';
import type { StepBodyProps } from './StepBodyProps.js';

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
        <p><strong>Location:</strong> {request.projectLocation || '—'}</p>
        {request.estimatedValue != null && (
          <p><strong>Estimated Value:</strong> ${request.estimatedValue.toLocaleString()}</p>
        )}
        {request.clientName && <p><strong>Client:</strong> {request.clientName}</p>}
        {request.startDate && <p><strong>Start Date:</strong> {request.startDate}</p>}
      </HbcCard>

      <HbcCard>
        <HbcTypography intent="heading3">Department & Classification</HbcTypography>
        <p>
          <strong>Department:</strong>{' '}
          {request.department ? (DEPARTMENT_DISPLAY_LABELS[request.department] ?? request.department) : '—'}
        </p>
        <p><strong>Project Type:</strong> {request.projectType || '—'}</p>
        <p><strong>Project Stage:</strong> {request.projectStage || '—'}</p>
        {request.contractType && <p><strong>Contract Type:</strong> {request.contractType}</p>}
      </HbcCard>

      <HbcCard>
        <HbcTypography intent="heading3">Project Team</HbcTypography>
        {request.projectLeadId && <p><strong>Project Lead:</strong> {request.projectLeadId}</p>}
        <p><strong>Team Members:</strong> {request.groupMembers?.join(', ') || 'None'}</p>
        {request.viewerUPNs && request.viewerUPNs.length > 0 && (
          <p><strong>Viewers:</strong> {request.viewerUPNs.join(', ')}</p>
        )}
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
