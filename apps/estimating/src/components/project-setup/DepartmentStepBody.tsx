import type { ReactNode } from 'react';
import {
  CONTRACT_TYPE_OPTIONS,
  getProjectTypeOptionsForDepartment,
  OFFICE_DIVISION_OPTIONS,
  PROJECT_STAGE_OPTIONS,
  PROJECT_SETUP_REQUIRED_FIELDS_ENABLED,
} from '@hbc/features-estimating';
import { HbcFormSection, HbcSelect } from '@hbc/ui-kit';
import type { StepBodyProps } from './StepBodyProps.js';

const DEPARTMENT_OPTIONS = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'luxury-residential', label: 'Luxury Residential' },
];

/**
 * Step 2 — Department & project classification fields.
 * Two logical groups: organizational context and project classification.
 */
export function DepartmentStepBody({ request, onChange }: StepBodyProps): ReactNode {
  const projectTypeOptions = getProjectTypeOptionsForDepartment(request.department);

  return (
    <>
      <HbcFormSection
        title="Project Stage & Division"
        description="Organizational context for routing and reporting."
      >
        <HbcSelect
          label="Project Stage"
          options={[...PROJECT_STAGE_OPTIONS]}
          value={request.projectStage ?? ''}
          onChange={(v) => onChange({ projectStage: v as NonNullable<typeof request.projectStage> })}
          placeholder="Select current stage"
        />
        <HbcSelect
          label="Office & Division"
          options={[...OFFICE_DIVISION_OPTIONS]}
          value={request.officeDivision ?? ''}
          onChange={(v) => onChange({ officeDivision: v || undefined })}
          placeholder="Select office division"
        />
      </HbcFormSection>

      <HbcFormSection
        title="Department & Project Classification"
        description="Department determines available project types and template add-ons."
      >
        <HbcSelect
          label="Department"
          options={DEPARTMENT_OPTIONS}
          value={request.department ?? ''}
          onChange={(v) => {
            const nextDepartment = v as 'commercial' | 'luxury-residential';
            const nextProjectTypeOptions = getProjectTypeOptionsForDepartment(nextDepartment);
            const currentProjectTypeIsValid = nextProjectTypeOptions.some(
              (option) => option.value === request.projectType && !option.disabled,
            );

            onChange({
              department: nextDepartment,
              projectType: currentProjectTypeIsValid ? request.projectType : undefined,
            });
          }}
          required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}
        />
        <HbcSelect
          label="Project Type"
          options={[...projectTypeOptions]}
          value={request.projectType ?? ''}
          onChange={(v) => onChange({ projectType: v })}
          placeholder={
            request.department
              ? 'Search project types'
              : 'Choose a department above to see project types'
          }
          disabled={!request.department}
          required={PROJECT_SETUP_REQUIRED_FIELDS_ENABLED}
        />
        <HbcSelect
          label="Contract Type"
          options={[...CONTRACT_TYPE_OPTIONS]}
          value={request.contractType ?? ''}
          onChange={(v) => onChange({ contractType: v || undefined })}
          placeholder="Select contract type"
        />
      </HbcFormSection>
    </>
  );
}
