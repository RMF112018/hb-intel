/**
 * W0-G5-T01: Step 5 — Review & Submit.
 * Read-only summary of all fields + Submit button.
 */
import type { ReactElement } from 'react';
import { HbcFormLayout, HbcFormSection } from '@hbc/ui-kit';
import type { IProjectSetupRequest } from '@hbc/models';

interface ReviewStepProps {
  item: Partial<IProjectSetupRequest>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function SummaryField({ label, value }: { label: string; value: string | undefined }): ReactElement {
  return (
    <div className="hbc-review-field">
      <dt className="hbc-review-field__label">{label}</dt>
      <dd className="hbc-review-field__value">{value || '—'}</dd>
    </div>
  );
}

export function ReviewStep({ item, onSubmit, isSubmitting }: ReviewStepProps): ReactElement {
  return (
    <div>
      <HbcFormSection title="Project Details">
        <HbcFormLayout columns={2} gap="medium">
          <SummaryField label="Project Name" value={item.projectName} />
          <SummaryField label="Location" value={item.projectLocation} />
          <SummaryField label="Type" value={item.projectType} />
          <SummaryField label="Stage" value={item.projectStage} />
          <SummaryField label="Department" value={item.department} />
          <SummaryField label="Estimated Value" value={item.estimatedValue != null ? `$${item.estimatedValue.toLocaleString()}` : undefined} />
          <SummaryField label="Client" value={item.clientName} />
          <SummaryField label="Start Date" value={item.startDate} />
        </HbcFormLayout>
      </HbcFormSection>

      <HbcFormSection title="Contract Info">
        <SummaryField label="Contract Type" value={item.contractType} />
      </HbcFormSection>

      <HbcFormSection title="Team Assignment">
        <HbcFormLayout columns={2} gap="medium">
          <SummaryField label="Project Lead" value={item.projectLeadId} />
          <SummaryField label="Team Members" value={item.groupMembers?.join(', ')} />
          <SummaryField label="Group Leaders" value={item.groupLeaders?.join(', ')} />
          <SummaryField label="Viewers" value={item.viewerUPNs?.join(', ')} />
        </HbcFormLayout>
      </HbcFormSection>

      <HbcFormSection title="Add-Ons">
        <SummaryField label="Selected" value={item.addOns?.length ? item.addOns.join(', ') : 'None'} />
      </HbcFormSection>

      <div className="hbc-review__submit-area">
        <button
          type="button"
          className="hbc-btn hbc-btn--primary"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </div>
  );
}
