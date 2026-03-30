import type { ReactNode } from 'react';
import { HbcFormSection, HbcSelect, HbcTextField, HbcTypography } from '@hbc/ui-kit';
import type { StepBodyProps } from './StepBodyProps.js';

const STATE_OPTIONS = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
] as const;

const PROCORE_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
] as const;

/**
 * Step 1 — Project Information fields.
 * W0-G4-T01 step body for the `project-info` wizard step.
 */
export function ProjectInfoStepBody({ request, onChange }: StepBodyProps): ReactNode {
  return (
    <HbcFormSection title="Project Information">
      <HbcTextField
        label="Project Name"
        value={request.projectName ?? ''}
        onChange={(v) => onChange({ projectName: v })}
        required
      />
      <HbcTextField
        label="Client Name"
        value={request.clientName ?? ''}
        onChange={(v) => onChange({ clientName: v || undefined })}
      />
      <div>
        <HbcTypography intent="heading3">Project Location</HbcTypography>
        <HbcTextField
          label="Street Address"
          value={request.projectStreetAddress ?? ''}
          onChange={(v) => onChange({ projectStreetAddress: v || undefined })}
          required
        />
        <HbcTextField
          label="City"
          value={request.projectCity ?? ''}
          onChange={(v) => onChange({ projectCity: v || undefined })}
          required
        />
        <HbcTextField
          label="County"
          value={request.projectCounty ?? ''}
          onChange={(v) => onChange({ projectCounty: v || undefined })}
          required
        />
        <HbcSelect
          label="State"
          options={[...STATE_OPTIONS]}
          value={request.projectState ?? ''}
          onChange={(v) => onChange({ projectState: v || undefined })}
          required
        />
        <HbcTextField
          label="Zip"
          value={request.projectZip ?? ''}
          onChange={(v) => onChange({ projectZip: v || undefined })}
          required
        />
      </div>
      <HbcTextField
        label="Estimated Value"
        value={request.estimatedValue != null ? String(request.estimatedValue) : ''}
        onChange={(v) => onChange({ estimatedValue: v ? Number(v) : undefined })}
        type="number"
      />
      <HbcTextField
        label="Expected Project Start Date"
        value={request.startDate ?? ''}
        onChange={(v) => onChange({ startDate: v || undefined })}
        type="date"
      />
      <HbcSelect
        label="Procore Project"
        options={[...PROCORE_OPTIONS]}
        value={request.procoreProject ?? ''}
        onChange={(v) => onChange({ procoreProject: (v || undefined) as 'Yes' | 'No' | undefined })}
      />
    </HbcFormSection>
  );
}
