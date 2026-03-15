/**
 * W0-G5-T03: Step 5 — Review & Submit (stepId: 'review-submit').
 * Read-only summary of all fields + Submit button.
 */
import type { ReactElement } from 'react';
import { HbcFormLayout, HbcFormSection, useIsMobile } from '@hbc/ui-kit';
import type { IProjectSetupRequest } from '@hbc/models';
import type { ProjectSetupWizardMode } from '@hbc/features-estimating';

interface ReviewSubmitStepProps {
  request: Partial<IProjectSetupRequest>;
  onSubmit: () => void;
  submitting: boolean;
  mode: ProjectSetupWizardMode;
}

function SummaryField({ label, value }: { label: string; value: string | undefined }): ReactElement {
  return (
    <div className="hbc-review-field">
      <dt className="hbc-review-field__label">{label}</dt>
      <dd className="hbc-review-field__value">{value || '—'}</dd>
    </div>
  );
}

export function ReviewSubmitStep({ request, onSubmit, submitting, mode }: ReviewSubmitStepProps): ReactElement {
  const isMobile = useIsMobile();
  const cols = isMobile ? 1 : 2;
  return (
    <div>
      {mode === 'clarification-return' && (
        <p className="hbc-review__resubmission-note">
          Resubmitting with corrections from reviewer feedback.
        </p>
      )}

      <HbcFormSection title="Project Information">
        <HbcFormLayout columns={cols} gap="medium">
          <SummaryField label="Project Name" value={request.projectName} />
          <SummaryField label="Location" value={request.projectLocation} />
          <SummaryField label="Estimated Value" value={request.estimatedValue != null ? `$${request.estimatedValue.toLocaleString()}` : undefined} />
          <SummaryField label="Client" value={request.clientName} />
          <SummaryField label="Start Date" value={request.startDate} />
        </HbcFormLayout>
      </HbcFormSection>

      <HbcFormSection title="Department & Type">
        <HbcFormLayout columns={cols} gap="medium">
          <SummaryField label="Department" value={request.department} />
          <SummaryField label="Project Type" value={request.projectType} />
          <SummaryField label="Stage" value={request.projectStage} />
          <SummaryField label="Contract Type" value={request.contractType} />
        </HbcFormLayout>
      </HbcFormSection>

      <HbcFormSection title="Project Team">
        <HbcFormLayout columns={cols} gap="medium">
          <SummaryField label="Project Lead" value={request.projectLeadId} />
          <SummaryField label="Team Members" value={request.groupMembers?.join(', ')} />
          <SummaryField label="Viewers" value={request.viewerUPNs?.join(', ')} />
        </HbcFormLayout>
      </HbcFormSection>

      <HbcFormSection title="Add-Ons">
        <SummaryField label="Selected" value={request.addOns?.length ? request.addOns.join(', ') : 'None'} />
      </HbcFormSection>

      <div className="hbc-review__submit-area">
        <button
          type="button"
          className="hbc-btn hbc-btn--primary"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Project Setup Request'}
        </button>
      </div>
    </div>
  );
}
