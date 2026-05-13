import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { PROJECT_SETUP_REQUIRED_FIELDS_ENABLED } from '@hbc/features-estimating';
import { HbcFormSection, HbcSelect, HbcTextField } from '@hbc/ui-kit';
import { HBC_SPACE_SM, HBC_SPACE_MD } from '@hbc/ui-kit/theme';
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

const useStyles = makeStyles({
  row2col: {
    display: 'grid',
    gap: `${HBC_SPACE_SM}px`,
    gridTemplateColumns: '1fr',
    [`@media (min-width: 480px)`]: {
      gridTemplateColumns: '1fr 1fr',
      gap: `${HBC_SPACE_MD}px`,
    },
  },
});

/**
 * Step 1 — Project Information fields.
 * Three logical groups: identity, location, and project details.
 */
export function ProjectInfoStepBody({ request, onChange }: StepBodyProps): ReactNode {
  const styles = useStyles();

  return (
    <>
      <HbcFormSection title="Project Identity" description="Name and client for the project.">
        <HbcTextField
          label="Project Name"
          value={request.projectName ?? ''}
          onChange={(v) => onChange({ projectName: v })}
          required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}
        />
        <HbcTextField
          label="Client Name"
          value={request.clientName ?? ''}
          onChange={(v) => onChange({ clientName: v || undefined })}
        />
      </HbcFormSection>

      <HbcFormSection title="Project Location" description="Physical address of the project site.">
        <HbcTextField
          label="Street Address"
          value={request.projectStreetAddress ?? ''}
          onChange={(v) => onChange({ projectStreetAddress: v || undefined })}
          required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}
        />
        <div className={styles.row2col}>
          <HbcTextField
            label="City"
            value={request.projectCity ?? ''}
            onChange={(v) => onChange({ projectCity: v || undefined })}
            required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}
          />
          <HbcSelect
            label="State"
            options={[...STATE_OPTIONS]}
            value={request.projectState ?? ''}
            onChange={(v: string) => onChange({ projectState: v || undefined })}
            required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}
          />
        </div>
        <div className={styles.row2col}>
          <HbcTextField
            label="County"
            value={request.projectCounty ?? ''}
            onChange={(v) => onChange({ projectCounty: v || undefined })}
            required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}
          />
          <HbcTextField
            label="Zip Code"
            value={request.projectZip ?? ''}
            onChange={(v) => onChange({ projectZip: v || undefined })}
            required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}
          />
        </div>
      </HbcFormSection>

      <HbcFormSection title="Project Details" description="Financial and scheduling context.">
        <div className={styles.row2col}>
          <HbcTextField
            label="Estimated Value"
            value={request.estimatedValue != null ? String(request.estimatedValue) : ''}
            onChange={(v) => onChange({ estimatedValue: v ? Number(v) : undefined })}
            type="number"
            placeholder="$0"
          />
          <HbcTextField
            label="Expected Start Date"
            value={request.startDate ?? ''}
            onChange={(v) => onChange({ startDate: v || undefined })}
            type="date"
          />
        </div>
        <HbcTextField
          label="Procore Project ID"
          value={request.procoreProject ?? ''}
          onChange={(v) => onChange({ procoreProject: v?.trim() || undefined })}
          placeholder="Optional token (for example: 1234567)"
        />
      </HbcFormSection>
    </>
  );
}
